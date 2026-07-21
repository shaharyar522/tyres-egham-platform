<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Throwable;

class UkVehicleDataService
{
    public function enabled(): bool
    {
        return (bool) config('services.uk_vehicle_data.enabled')
            && filled(config('services.uk_vehicle_data.api_key'));
    }

    public function lookup(string $registration): array
    {
        if (! $this->enabled()) {
            return [
                'status' => 'disabled',
                'message' => 'UK Vehicle Data lookup is not configured.',
            ];
        }

        if ((bool) config('services.uk_vehicle_data.sandbox') && ! str_contains($registration, 'A')) {
            return [
                'status' => 'error',
                'httpStatus' => null,
                'errorCode' => 'ukvd_sandbox_restriction',
                'message' => 'Your UKVD Sandbox key only supports registrations containing the letter A. Use a production API key for this plate.',
                'rawResponse' => null,
                'normalized' => null,
                'latencyMs' => 0,
            ];
        }

        $startedAt = microtime(true);
        $apiKey = (string) config('services.uk_vehicle_data.api_key');
        $package = (string) config('services.uk_vehicle_data.package', 'TyreDataLite');
        $baseUrl = rtrim((string) config('services.uk_vehicle_data.base_url'), '/');
        $timeout = (int) config('services.uk_vehicle_data.timeout', 15);

        try {
            $response = Http::timeout($timeout)
                ->acceptJson()
                ->withHeaders([
                    'Authorization' => 'ukvd-ipwhitelist '.$apiKey,
                ])
                ->get("{$baseUrl}/{$package}", [
                    'v' => 2,
                    'api_nullitems' => 1,
                    'auth_apikey' => $apiKey,
                    'key_vrm' => $registration,
                ]);
        } catch (Throwable $exception) {
            return [
                'status' => 'error',
                'httpStatus' => null,
                'errorCode' => 'ukvd_network_error',
                'message' => 'The UK Vehicle Data lookup could not be completed right now.',
                'rawResponse' => ['exception' => $exception->getMessage()],
                'normalized' => null,
                'latencyMs' => (int) round((microtime(true) - $startedAt) * 1000),
            ];
        }

        $payload = $response->json();
        $latencyMs = (int) round((microtime(true) - $startedAt) * 1000);

        if (! $response->successful() || ! is_array($payload)) {
            return [
                'status' => $response->status() === 404 ? 'not_found' : 'error',
                'httpStatus' => $response->status(),
                'errorCode' => $response->status() === 401 ? 'ukvd_unauthorized' : 'ukvd_lookup_failed',
                'message' => $response->status() === 401
                    ? 'UK Vehicle Data API credentials were rejected. Check your API key and IP whitelist.'
                    : 'The UK Vehicle Data lookup service is temporarily unavailable.',
                'rawResponse' => is_array($payload) ? $payload : ['body' => $response->body()],
                'normalized' => null,
                'latencyMs' => $latencyMs,
            ];
        }

        $statusCode = data_get($payload, 'Response.StatusCode');
        if ($statusCode !== 'Success') {
            $statusMessage = (string) (data_get($payload, 'Response.StatusMessage') ?? 'Lookup failed');

            return [
                'status' => str_contains(strtolower($statusMessage), 'not found') ? 'not_found' : 'error',
                'httpStatus' => $response->status(),
                'errorCode' => 'ukvd_lookup_failed',
                'message' => $statusMessage,
                'rawResponse' => $payload,
                'normalized' => null,
                'latencyMs' => $latencyMs,
            ];
        }

        $vehicleDetails = data_get($payload, 'Response.DataItems.VehicleDetails', []);
        $records = data_get($payload, 'Response.DataItems.TyreDetails.RecordList', []);
        if (! is_array($records)) {
            $records = [];
        }

        $fitments = $this->normalizeFitments($records);
        if ($fitments === [] && $vehicleDetails === []) {
            return [
                'status' => 'not_found',
                'httpStatus' => $response->status(),
                'errorCode' => 'ukvd_vehicle_not_found',
                'message' => 'No vehicle or tyre data was returned for this registration.',
                'rawResponse' => $payload,
                'normalized' => null,
                'latencyMs' => $latencyMs,
            ];
        }

        return [
            'status' => 'ok',
            'httpStatus' => $response->status(),
            'errorCode' => null,
            'message' => null,
            'rawResponse' => $payload,
            'normalized' => [
                'registration' => $registration,
                'make' => data_get($vehicleDetails, 'Make'),
                'model' => data_get($vehicleDetails, 'Model'),
                'yearOfManufacture' => data_get($vehicleDetails, 'BuildYear'),
                'fuelType' => data_get($vehicleDetails, 'FuelType'),
                'bodyType' => data_get($vehicleDetails, 'BodyStyle'),
                'fitments' => $fitments,
            ],
            'latencyMs' => $latencyMs,
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $records
     * @return array<int, array<string, mixed>>
     */
    private function normalizeFitments(array $records): array
    {
        $fitments = [];

        foreach ($records as $index => $record) {
            if (! is_array($record)) {
                continue;
            }

            $front = $this->normalizePosition($record['Front']['Tyre'] ?? null, 'front');
            $rear = $this->normalizePosition($record['Rear']['Tyre'] ?? null, 'rear');
            $positions = array_values(array_filter([$front, $rear]));

            if ($positions === []) {
                continue;
            }

            if (count($positions) === 1) {
                $positions[0]['position'] = 'all_round';
            }

            $isStaggered = count($positions) > 1
                && ($positions[0]['width'] !== $positions[1]['width']
                    || $positions[0]['profile'] !== $positions[1]['profile']
                    || $positions[0]['rim'] !== $positions[1]['rim']);

            $fitments[] = [
                'provider_reference' => 'ukvd-'.($index + 1),
                'fitment_type' => 'oe',
                'label' => data_get($record, 'Vehicle.ModelName'),
                'is_primary' => $index === 0,
                'is_staggered' => $isStaggered,
                'positions' => $positions,
            ];
        }

        return $fitments;
    }

  /**
     * @return array{width:int,profile:int,rim:int,load_index:?int,speed_rating:?string,position:string}|null
     */
    private function normalizePosition(?array $tyre, string $position): ?array
    {
        if (! is_array($tyre)) {
            return null;
        }

        $width = (int) ($tyre['SectionWidth'] ?? 0);
        $profile = (int) ($tyre['AspectRatio'] ?? 0);
        $rim = (int) ($tyre['RimDiameter'] ?? 0);

        if (($width <= 0 || $profile <= 0 || $rim <= 0) && filled($tyre['Size'] ?? null)) {
            if (preg_match('/(\d{3})\/(\d{2})R(\d{2})/', (string) $tyre['Size'], $matches)) {
                $width = (int) $matches[1];
                $profile = (int) $matches[2];
                $rim = (int) $matches[3];
            }
        }

        if ($width <= 0 || $profile <= 0 || $rim <= 0) {
            return null;
        }

        $loadIndex = $tyre['LoadIndex'] ?? null;
        $speedRating = $tyre['SpeedIndex'] ?? null;

        return [
            'position' => $position,
            'width' => $width,
            'profile' => $profile,
            'rim' => $rim,
            'load_index' => filled($loadIndex) ? (int) $loadIndex : null,
            'speed_rating' => filled($speedRating) ? strtoupper((string) $speedRating) : null,
        ];
    }
}
