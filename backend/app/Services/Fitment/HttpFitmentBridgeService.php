<?php

namespace App\Services\Fitment;

use App\Models\FitmentPosition;
use App\Models\FitmentSet;
use App\Models\LookupPayload;
use App\Models\VehicleProfile;
use App\Support\VehicleFitmentDescription;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Optional Phase 3 adapter: POST vehicle identity to a configurable HTTP endpoint
 * (your own bridge, or a commercial fitment API wrapper) and persist fitment_sets.
 *
 * Expected JSON response (flexible):
 * {
 *   "fitments": [
 *     {
 *       "provider_reference": "oe-18-staggered",
 *       "fitment_type": "oe",
 *       "label": "Optional label",
 *       "tyre_category_slug": "high-performance",
 *       "is_primary": true,
 *       "is_staggered": true,
 *       "confidence": 1,
 *       "positions": [
 *         { "position": "front", "width": 225, "profile": 45, "rim": 18, "load_index": 95, "speed_rating": "Y" },
 *         { "position": "rear", "width": 255, "profile": 40, "rim": 18, "load_index": 99, "speed_rating": "Y" }
 *       ]
 *     }
 *   ]
 * }
 *
 * Top-level "data.fitments" is also accepted.
 */
final class HttpFitmentBridgeService
{
    public function enabled(): bool
    {
        return (bool) config('services.fitment.http.enabled')
            && filled(config('services.fitment.http.url'));
    }

    /**
     * Fetch fitments from remote, replace prior `fitment_bridge` rows for this profile, store audit payload.
     *
     * @param  array<string, mixed>  $dvlaPayload  Normalized DVLA fields (Phase 2 output)
     * @return bool True when at least one fitment set was stored
     */
    public function syncFromRemote(VehicleProfile $profile, array $dvlaPayload = []): bool
    {
        if (! $this->enabled()) {
            return false;
        }

        $url = (string) config('services.fitment.http.url');
        $timeout = (int) config('services.fitment.http.timeout', 15);
        $apiKey = config('services.fitment.http.api_key');
        $startedAt = microtime(true);

        $body = [
            'registration' => $profile->registration,
            'vehicleDescription' => VehicleFitmentDescription::fromProfile($profile),
            'dvla' => $dvlaPayload,
        ];

        try {
            $request = Http::timeout($timeout)
                ->acceptJson()
                ->asJson();

            if (filled($apiKey)) {
                $request = $request->withToken((string) $apiKey);
            }

            $response = $request->post($url, $body);
        } catch (Throwable $exception) {
            $this->storeFitmentPayload(
                $profile,
                $body,
                null,
                null,
                false,
                'fitment_http_network_error',
                ['exception' => $exception->getMessage()],
                (int) round((microtime(true) - $startedAt) * 1000),
            );

            return false;
        }

        $latencyMs = (int) round((microtime(true) - $startedAt) * 1000);
        $json = $response->json();

        if (! $response->successful() || ! is_array($json)) {
            $this->storeFitmentPayload(
                $profile,
                $body,
                $response->status(),
                is_array($json) ? $json : ['body' => $response->body()],
                false,
                'fitment_http_error',
                is_array($json) ? $json : null,
                $latencyMs,
            );

            return false;
        }

        $fitments = $json['fitments'] ?? data_get($json, 'data.fitments');

        if (! is_array($fitments) || $fitments === []) {
            $this->storeFitmentPayload(
                $profile,
                $body,
                $response->status(),
                $json,
                false,
                'fitment_http_empty',
                $json,
                $latencyMs,
            );

            return false;
        }

        $stored = false;

        DB::transaction(function () use ($profile, $fitments, &$stored): void {
            FitmentSet::query()
                ->where('vehicle_profile_id', $profile->id)
                ->where('provider', 'fitment_bridge')
                ->delete();

            $sequence = 0;
            foreach ($fitments as $row) {
                if (! is_array($row)) {
                    continue;
                }

                $positions = $row['positions'] ?? null;
                if (! is_array($positions) || $positions === []) {
                    continue;
                }

                $parsedPositions = [];
                foreach ($positions as $pos) {
                    if (! is_array($pos)) {
                        continue;
                    }
                    $parsed = $this->normalizePosition($pos);
                    if ($parsed !== null) {
                        $parsedPositions[] = $parsed;
                    }
                }

                if ($parsedPositions === []) {
                    continue;
                }

                $isStaggered = (bool) ($row['is_staggered'] ?? $this->inferStaggered($parsedPositions));
                $ref = $row['provider_reference'] ?? 'bridge-'.$profile->id.'-'.$sequence;
                $isPrimary = array_key_exists('is_primary', $row)
                    ? (bool) $row['is_primary']
                    : ($sequence === 0);

                $set = FitmentSet::query()->create([
                    'vehicle_profile_id' => $profile->id,
                    'provider' => 'fitment_bridge',
                    'provider_reference' => (string) $ref,
                    'fitment_type' => (string) ($row['fitment_type'] ?? 'oe'),
                    'label' => isset($row['label']) ? (string) $row['label'] : null,
                    'tyre_category_slug' => isset($row['tyre_category_slug']) ? (string) $row['tyre_category_slug'] : null,
                    'is_primary' => $isPrimary,
                    'is_staggered' => $isStaggered,
                    'confidence' => isset($row['confidence']) ? (float) $row['confidence'] : null,
                    'provider_queried_at' => Carbon::now(),
                ]);

                foreach ($parsedPositions as $p) {
                    FitmentPosition::query()->create(array_merge($p, [
                        'fitment_set_id' => $set->id,
                    ]));
                }

                $stored = true;
                $sequence++;
            }

            if ($stored) {
                $sets = FitmentSet::query()
                    ->where('vehicle_profile_id', $profile->id)
                    ->where('provider', 'fitment_bridge')
                    ->orderBy('id')
                    ->get();

                if ($sets->every(fn (FitmentSet $s) => ! $s->is_primary)) {
                    FitmentSet::query()->whereKey($sets->first()->id)->update(['is_primary' => true]);
                }
            }
        });

        $this->storeFitmentPayload(
            $profile,
            $body,
            $response->status(),
            $json,
            $stored,
            $stored ? null : 'fitment_http_no_valid_sets',
            $json,
            $latencyMs,
        );

        return $stored;
    }

    public function hasFreshRemoteCache(VehicleProfile $profile): bool
    {
        if (! $this->enabled()) {
            return false;
        }

        return LookupPayload::query()
            ->where('vehicle_profile_id', $profile->id)
            ->where('provider', 'fitment_http')
            ->where('lookup_type', 'vehicle_fitment')
            ->where('lookup_key', $profile->registration)
            ->where('success', true)
            ->where(function ($q): void {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', Carbon::now());
            })
            ->exists();
    }

    /**
     * @param  array<string, mixed>  $pos
     * @return array<string, mixed>|null
     */
    private function normalizePosition(array $pos): ?array
    {
        $position = strtolower((string) ($pos['position'] ?? 'all_round'));
        if (! in_array($position, ['all_round', 'front', 'rear', 'spare'], true)) {
            $position = 'all_round';
        }

        $width = (int) ($pos['width'] ?? 0);
        $profile = (int) ($pos['profile'] ?? 0);
        $rim = (int) ($pos['rim'] ?? 0);

        if ($width <= 0 || $profile <= 0 || $rim <= 0) {
            return null;
        }

        return [
            'position' => $position,
            'width' => $width,
            'profile' => $profile,
            'rim' => $rim,
            'load_index' => isset($pos['load_index']) ? (int) $pos['load_index'] : null,
            'speed_rating' => isset($pos['speed_rating']) ? strtoupper((string) $pos['speed_rating']) : null,
            'tyre_category_slug' => isset($pos['tyre_category_slug']) ? (string) $pos['tyre_category_slug'] : null,
            'is_extra_load' => (bool) ($pos['is_extra_load'] ?? false),
            'is_run_flat' => (bool) ($pos['is_run_flat'] ?? false),
            'is_winter' => (bool) ($pos['is_winter'] ?? false),
            'is_all_season' => (bool) ($pos['is_all_season'] ?? false),
            'is_ev_rated' => (bool) ($pos['is_ev_rated'] ?? false),
            'is_van' => (bool) ($pos['is_van'] ?? false),
            'is_4x4' => (bool) ($pos['is_4x4'] ?? false),
            'oe_marking' => isset($pos['oe_marking']) ? (string) $pos['oe_marking'] : null,
            'recommended_quantity' => (int) ($pos['recommended_quantity'] ?? ($position === 'all_round' ? 4 : 2)),
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $positions
     */
    private function inferStaggered(array $positions): bool
    {
        $hasFront = collect($positions)->contains(fn ($p) => ($p['position'] ?? '') === 'front');
        $hasRear = collect($positions)->contains(fn ($p) => ($p['position'] ?? '') === 'rear');

        return $hasFront && $hasRear;
    }

    /**
     * @param  array<string, mixed>  $requestBody
     * @param  array<string, mixed>|null  $rawResponse
     * @param  array<string, mixed>|null  $normalizedPayload
     */
    private function storeFitmentPayload(
        VehicleProfile $profile,
        array $requestBody,
        ?int $httpStatus,
        ?array $rawResponse,
        bool $success,
        ?string $errorCode,
        ?array $normalizedPayload,
        int $latencyMs,
    ): void {
        LookupPayload::query()->create([
            'vehicle_profile_id' => $profile->id,
            'provider' => 'fitment_http',
            'lookup_type' => 'vehicle_fitment',
            'lookup_key' => $profile->registration,
            'http_status' => $httpStatus,
            'success' => $success,
            'raw_request' => $requestBody,
            'raw_response' => $rawResponse,
            'normalized_payload' => $normalizedPayload,
            'error_code' => $errorCode,
            'latency_ms' => $latencyMs,
            'fetched_at' => Carbon::now(),
            'expires_at' => $success
                ? Carbon::now()->addHours((int) config('services.fitment.cache_ttl_hours', 24))
                : null,
        ]);
    }
}
