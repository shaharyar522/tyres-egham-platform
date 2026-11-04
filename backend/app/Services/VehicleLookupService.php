<?php

namespace App\Services;

use App\Contracts\FitmentResolverInterface;
use App\Services\Fitment\HttpFitmentBridgeService;
use App\Models\FitmentPosition;
use App\Models\FitmentSet;
use App\Models\LookupPayload;
use App\Models\VehicleLookup;
use App\Models\VehicleMake;
use App\Models\VehicleModel;
use App\Models\VehicleProfile;
use App\Support\FrontendApi;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class VehicleLookupService
{
    public function __construct(
        private readonly DvlaVehicleEnquiryService $dvla,
        private readonly VehicleDataGlobalService $vehicleDataGlobal,
        private readonly UkVehicleDataService $ukVehicleData,
        private readonly FitmentResolverInterface $fitmentResolver,
        private readonly HttpFitmentBridgeService $fitmentBridge,
    ) {
    }

    public function lookup(string $registration): array
    {
        $normalized = $this->normalizeRegistration($registration);

        if (! $this->looksLikeRegistration($normalized)) {
            return [
                'status' => 'invalid',
                'message' => 'Enter a valid vehicle registration in the format AB12CDE.',
                'code' => 'invalid_registration',
            ];
        }

        // Cost-saving path: serve from our DB when this registration was looked up before.
        $cached = $this->lookupFromLocalDatabase($normalized);
        if ($cached !== null) {
            return $cached;
        }

        $profile = $this->loadProfile($normalized);

        // Prefer Vehicle Data Global TyreDetails for live OE tyre sizes
        $vdgLookup = null;
        if ($this->vehicleDataGlobal->enabled()) {
            $vdgLookup = $this->vehicleDataGlobal->lookup($normalized);
            if ($vdgLookup['status'] === 'ok') {
                return $this->handleTyreProviderSuccess($normalized, $vdgLookup, 'vehicle_data_global', $profile);
            }

            $this->storeProviderLookupPayload($profile, $normalized, 'vehicle_data_global', $vdgLookup);
        }

        $ukvdLookup = null;
        if ($this->ukVehicleData->enabled()) {
            $ukvdLookup = $this->ukVehicleData->lookup($normalized);
            if ($ukvdLookup['status'] === 'ok') {
                return $this->handleTyreProviderSuccess($normalized, $ukvdLookup, 'uk_vehicle_data', $profile);
            }

            $this->storeProviderLookupPayload($profile, $normalized, 'uk_vehicle_data', $ukvdLookup);
        }

        $tyreLookup = $vdgLookup ?? $ukvdLookup;

        $dvlaLookup = ['status' => 'disabled'];
        if ($this->dvla->enabled()) {
            $dvlaLookup = $this->dvla->lookup($normalized);
            if ($dvlaLookup['status'] === 'ok') {
                return $this->handleDvlaSuccess($normalized, $dvlaLookup, $tyreLookup);
            }

            $this->storeProviderLookupPayload($profile, $normalized, 'dvla', $dvlaLookup);
        }

        $legacyLookup = $this->loadLegacyLookup($normalized);
        if ($legacyLookup) {
            $profile = $this->syncLegacyLookup($legacyLookup);

            return $this->buildSuccessPayload($profile, 'legacy_migration', true, 'vehicle_lookups');
        }

        if (($tyreLookup['status'] ?? null) === 'not_found' || ($dvlaLookup['status'] ?? null) === 'not_found') {
            return [
                'status' => 'not_found',
                'message' => 'We could not match this registration to a known vehicle fitment yet.',
                'code' => 'registration_not_found',
            ];
        }

        if (in_array($tyreLookup['errorCode'] ?? null, ['ukvd_unauthorized', 'vdg_unauthorized'], true)) {
            return [
                'status' => 'provider_unavailable',
                'message' => $tyreLookup['message'] ?? 'The vehicle lookup service is temporarily unavailable.',
                'code' => 'provider_unavailable',
            ];
        }

        if (in_array($tyreLookup['status'] ?? null, ['error'], true) || in_array($dvlaLookup['status'] ?? null, ['error'], true)) {
            return [
                'status' => 'provider_unavailable',
                'message' => $dvlaLookup['message'] ?? $tyreLookup['message'] ?? 'The vehicle lookup service is temporarily unavailable.',
                'code' => 'provider_unavailable',
            ];
        }

        return [
            'status' => 'not_found',
            'message' => 'We could not match this registration to a known vehicle fitment yet.',
            'code' => 'registration_not_found',
        ];
    }

    /**
     * Return a successful lookup from vehicle_profiles + fitment_sets when available.
     * Skips paid provider APIs (VDG / UKVD / DVLA) for repeat registrations.
     *
     * @return array{status: string, payload: array}|null
     */
    private function lookupFromLocalDatabase(string $normalized): ?array
    {
        $profile = $this->loadProfile($normalized);
        if (! $profile) {
            return null;
        }

        $usableFitments = $this->usableStoredFitments($profile);
        if ($usableFitments->isEmpty()) {
            return null;
        }

        // Keep relation in sync with filtered usable sets for the response builder.
        $profile->setRelation('fitmentSets', $usableFitments);

        return $this->buildSuccessPayload($profile, 'fitment_cache', true);
    }

    /**
     * Fitment sets that have at least one real tyre size (width/profile/rim).
     *
     * @return \Illuminate\Support\Collection<int, FitmentSet>
     */
    private function usableStoredFitments(VehicleProfile $profile)
    {
        return $this->fitmentResolver->resolve($profile)
            ->filter(function (FitmentSet $set) {
                return $set->positions->contains(function (FitmentPosition $position) {
                    return (int) $position->width > 0
                        && (int) $position->profile > 0
                        && (int) $position->rim > 0;
                });
            })
            ->values();
    }

    private function handleDvlaSuccess(string $normalized, array $dvlaLookup, ?array $ukvdLookup = null): array
    {
        $profile = $this->syncProfileFromDvla($normalized, $dvlaLookup['normalized'] ?? []);
        $this->storeProviderLookupPayload($profile, $normalized, 'dvla', $dvlaLookup);

        if ($this->fitmentResolver->resolve($profile)->isEmpty()) {
            if (! $this->fitmentBridge->hasFreshRemoteCache($profile)) {
                $this->fitmentBridge->syncFromRemote($profile, $dvlaLookup['normalized'] ?? []);
            }
            $profile = $profile->fresh(['make', 'model', 'fitmentSets.positions']);
        }

        if ($this->fitmentResolver->resolve($profile)->isNotEmpty()) {
            $fromExternal = FitmentSet::query()
                ->where('vehicle_profile_id', $profile->id)
                ->where('provider', 'fitment_bridge')
                ->exists();

            return $this->buildSuccessPayload(
                $profile,
                $fromExternal ? 'dvla_plus_external_fitment' : 'dvla_plus_fitment_cache',
                false,
                $fromExternal ? 'fitment_http' : null,
            );
        }

        $legacyLookup = $this->loadLegacyLookup($normalized);
        if ($legacyLookup) {
            $profile = $this->syncLegacyLookup($legacyLookup);

            return $this->buildSuccessPayload($profile, 'legacy_migration', true, 'vehicle_lookups');
        }

        if ($this->applyUnresolvedFallbackFitment($profile)) {
            $profile = $profile->fresh(['make', 'model', 'fitmentSets.positions']);

            return $this->buildSuccessPayload($profile, 'dvla_plus_configured_fallback', false, 'fitment_fallback');
        }

        if ($this->vehicleDataGlobal->enabled()) {
            $vdgRetry = $this->vehicleDataGlobal->lookup($normalized);
            if ($vdgRetry['status'] === 'ok' && ! empty($vdgRetry['normalized']['fitments'])) {
                return $this->handleTyreProviderSuccess($normalized, $vdgRetry, 'vehicle_data_global', $profile);
            }
            $ukvdLookup = $vdgRetry;
        }

        if ($this->ukVehicleData->enabled()) {
            $ukvdLookup = $this->ukVehicleData->lookup($normalized);
            if ($ukvdLookup['status'] === 'ok' && ! empty($ukvdLookup['normalized']['fitments'])) {
                return $this->handleTyreProviderSuccess($normalized, $ukvdLookup, 'uk_vehicle_data', $profile);
            }
        }

        return [
            'status' => 'fitment_not_found',
            'message' => $this->fitmentNotFoundMessage($ukvdLookup),
            'code' => 'fitment_not_found',
            'payload' => [
                'registration' => $normalized,
                'vehicle' => FrontendApi::vehicleProfile($profile),
                'matchMeta' => [
                    'source' => 'dvla_identity_only',
                    'provider' => 'dvla',
                    'usedCache' => false,
                    'selectedFitmentId' => null,
                    'availableFitmentCount' => 0,
                    'queriedAt' => Carbon::now()->toIso8601String(),
                    'expiresAt' => null,
                    'fallbackMode' => null,
                    'message' => $this->fitmentNotFoundHint($ukvdLookup),
                ],
            ],
        ];
    }

    private function fitmentNotFoundMessage(?array $ukvdLookup): string
    {
        return match ($ukvdLookup['errorCode'] ?? null) {
            'vdg_unauthorized' => 'We found this vehicle via DVLA, but tyre sizes require Vehicle Data Global (TyreDetails). Your API key was rejected.',
            'ukvd_unauthorized' => 'We found this vehicle via DVLA, but tyre sizes require UK Vehicle Data (TyreDataLite). Your API key was rejected — whitelist your server IP in the UKVD control panel under Account Security.',
            'ukvd_sandbox_restriction' => 'We found this vehicle via DVLA, but your UKVD Sandbox key only supports registrations containing the letter A. Upgrade to a production key to look up this registration.',
            default => $this->fitmentBridge->enabled()
                ? 'We found this vehicle via DVLA, but the external fitment service did not return usable tyre sizes.'
                : 'We found this vehicle via DVLA, but no tyre fitment was returned. Configure Vehicle Data Global (TyreDetails) for live tyre sizes.',
        };
    }

    private function fitmentNotFoundHint(?array $ukvdLookup): string
    {
        return match ($ukvdLookup['errorCode'] ?? null) {
            'vdg_unauthorized' => 'Check VDG_API_KEY in your environment and that the TyreDetails package is enabled on your account.',
            'ukvd_unauthorized' => 'Add your outgoing server IP to UKVD Account Security, then retry this registration.',
            'ukvd_sandbox_restriction' => 'Sandbox keys cannot look up BC66 YDW and similar plates. Use a production UKVD key or test with a plate containing A.',
            default => $this->fitmentBridge->enabled()
                ? 'Configure or fix the external fitment HTTP bridge response format.'
                : 'Enable VDG_ENABLED with a TyreDetails package key for registration-based tyre search.',
        };
    }

    private function handleTyreProviderSuccess(
        string $normalized,
        array $lookup,
        string $provider,
        ?VehicleProfile $existingProfile = null,
    ): array {
        $vehicle = $lookup['normalized'] ?? [];
        $profile = $this->syncProfileFromTyreProvider($normalized, $vehicle, $provider, $existingProfile);
        $this->syncFitmentsFromTyreProvider($profile, $vehicle['fitments'] ?? [], $provider);
        $this->storeProviderLookupPayload($profile, $normalized, $provider, $lookup);
        $profile = $profile->fresh(['make', 'model', 'fitmentSets.positions']);

        $providerLabel = $provider === 'vehicle_data_global' ? 'Vehicle Data Global' : 'UK Vehicle Data';

        if ($this->fitmentResolver->resolve($profile)->isEmpty()) {
            return [
                'status' => 'fitment_not_found',
                'message' => "We found this vehicle, but {$providerLabel} did not return usable tyre sizes.",
                'code' => 'fitment_not_found',
                'payload' => [
                    'registration' => $normalized,
                    'vehicle' => FrontendApi::vehicleProfile($profile),
                    'matchMeta' => [
                        'source' => $provider.'_identity_only',
                        'provider' => $provider,
                        'usedCache' => false,
                        'selectedFitmentId' => null,
                        'availableFitmentCount' => 0,
                        'queriedAt' => Carbon::now()->toIso8601String(),
                        'expiresAt' => null,
                        'fallbackMode' => null,
                        'message' => 'No tyre records were returned for this registration.',
                    ],
                ],
            ];
        }

        return $this->buildSuccessPayload($profile, $provider, false, $provider);
    }

    /** @deprecated Use handleTyreProviderSuccess */
    private function handleUkVehicleDataSuccess(string $normalized, array $ukvdLookup, ?VehicleProfile $existingProfile = null): array
    {
        return $this->handleTyreProviderSuccess($normalized, $ukvdLookup, 'uk_vehicle_data', $existingProfile);
    }

    public function normalizeRegistration(string $registration): string
    {
        return strtoupper(preg_replace('/[^A-Z0-9]/i', '', $registration) ?? '');
    }

    private function looksLikeRegistration(string $registration): bool
    {
        return strlen($registration) >= 5 && strlen($registration) <= 8;
    }

    private function loadProfile(string $registration): ?VehicleProfile
    {
        return VehicleProfile::query()
            ->with(['make', 'model', 'fitmentSets.positions'])
            ->where('registration', $registration)
            ->first();
    }

    private function loadLegacyLookup(string $registration): ?VehicleLookup
    {
        return VehicleLookup::query()
            ->with(['make', 'model'])
            ->where('registration', $registration)
            ->first();
    }

    private function syncProfileFromDvla(string $registration, array $vehicle): VehicleProfile
    {
        $makeId = $this->matchMakeId($vehicle['make'] ?? null);
        $modelId = $this->matchModelId($makeId, $vehicle['model'] ?? null);

        return tap(
            VehicleProfile::query()->updateOrCreate(
                ['registration' => $registration],
                [
                    'vehicle_make_id' => $makeId,
                    'vehicle_model_id' => $modelId,
                    'dvla_make_text' => $vehicle['make'] ?? null,
                    'dvla_model_text' => $vehicle['model'] ?? null,
                    'year_of_manufacture' => $vehicle['yearOfManufacture'] ?? null,
                    'fuel_type' => $vehicle['fuelType'] ?? null,
                    'body_type' => $vehicle['bodyType'] ?? null,
                    'engine_capacity' => $vehicle['engineCapacity'] ?? null,
                    'tax_status' => $vehicle['taxStatus'] ?? null,
                    'mot_status' => $vehicle['motStatus'] ?? null,
                    'source' => 'dvla',
                    'source_reference' => $registration,
                    'last_verified_at' => Carbon::now(),
                ],
            )
        )->load(['make', 'model', 'fitmentSets.positions']);
    }

    private function syncLegacyLookup(VehicleLookup $legacyLookup): VehicleProfile
    {
        $profile = VehicleProfile::query()->updateOrCreate(
            ['registration' => $legacyLookup->registration],
            [
                'vehicle_make_id' => $legacyLookup->vehicle_make_id,
                'vehicle_model_id' => $legacyLookup->vehicle_model_id,
                'dvla_make_text' => $legacyLookup->make?->name,
                'dvla_model_text' => $legacyLookup->model?->name,
                'derivative' => $legacyLookup->derivative,
                'year_of_manufacture' => $legacyLookup->year,
                'fuel_type' => $legacyLookup->fuel_type,
                'body_type' => $legacyLookup->body_type,
                'source' => 'legacy',
                'source_reference' => $legacyLookup->registration,
                'last_verified_at' => Carbon::now(),
            ],
        );

        $fitmentSet = FitmentSet::query()->updateOrCreate(
            [
                'vehicle_profile_id' => $profile->id,
                'provider' => 'legacy',
                'provider_reference' => $legacyLookup->registration,
            ],
            [
                'fitment_type' => 'oe',
                'label' => null,
                'tyre_category_slug' => $legacyLookup->tyre_category_slug,
                'is_primary' => true,
                'is_staggered' => false,
                'confidence' => 1,
                'provider_queried_at' => Carbon::now(),
            ],
        );

        FitmentPosition::query()->updateOrCreate(
            [
                'fitment_set_id' => $fitmentSet->id,
                'position' => 'all_round',
            ],
            [
                'width' => $legacyLookup->tyre_width,
                'profile' => $legacyLookup->tyre_profile,
                'rim' => $legacyLookup->tyre_rim,
                'load_index' => $legacyLookup->load_index,
                'speed_rating' => $legacyLookup->speed_rating,
                'tyre_category_slug' => $legacyLookup->tyre_category_slug,
                'is_extra_load' => false,
                'is_run_flat' => $legacyLookup->tyre_category_slug === 'run-flat',
                'is_winter' => $legacyLookup->tyre_category_slug === 'winter',
                'is_all_season' => $legacyLookup->tyre_category_slug === 'all-season',
                'is_ev_rated' => $legacyLookup->tyre_category_slug === 'ev',
                'is_van' => $legacyLookup->tyre_category_slug === 'van',
                'is_4x4' => $legacyLookup->tyre_category_slug === '4x4',
                'oe_marking' => null,
                'recommended_quantity' => 4,
            ],
        );

        return $profile->fresh(['make', 'model', 'fitmentSets.positions']);
    }

    private function syncProfileFromTyreProvider(
        string $registration,
        array $vehicle,
        string $provider,
        ?VehicleProfile $existingProfile = null,
    ): VehicleProfile {
        $makeId = $this->matchMakeId($vehicle['make'] ?? null);
        $modelId = $this->matchModelId($makeId, $vehicle['model'] ?? null);

        return tap(
            VehicleProfile::query()->updateOrCreate(
                ['registration' => $registration],
                [
                    'vehicle_make_id' => $makeId ?? $existingProfile?->vehicle_make_id,
                    'vehicle_model_id' => $modelId ?? $existingProfile?->vehicle_model_id,
                    'dvla_make_text' => $vehicle['make'] ?? $existingProfile?->dvla_make_text,
                    'dvla_model_text' => $vehicle['model'] ?? $existingProfile?->dvla_model_text,
                    'year_of_manufacture' => $vehicle['yearOfManufacture'] ?? $existingProfile?->year_of_manufacture,
                    'fuel_type' => $vehicle['fuelType'] ?? $existingProfile?->fuel_type,
                    'body_type' => $vehicle['bodyType'] ?? $existingProfile?->body_type,
                    'source' => $provider,
                    'source_reference' => $registration,
                    'last_verified_at' => Carbon::now(),
                ],
            )
        )->load(['make', 'model', 'fitmentSets.positions']);
    }

    private function syncProfileFromUkVehicleData(string $registration, array $vehicle, ?VehicleProfile $existingProfile = null): VehicleProfile
    {
        return $this->syncProfileFromTyreProvider($registration, $vehicle, 'uk_vehicle_data', $existingProfile);
    }

    /**
     * @param  array<int, array<string, mixed>>  $fitments
     */
    private function syncFitmentsFromTyreProvider(VehicleProfile $profile, array $fitments, string $provider): void
    {
        if ($fitments === []) {
            return;
        }

        DB::transaction(function () use ($profile, $fitments, $provider): void {
            FitmentSet::query()
                ->where('vehicle_profile_id', $profile->id)
                ->whereIn('provider', ['uk_vehicle_data', 'vehicle_data_global'])
                ->delete();

            foreach ($fitments as $fitment) {
                $set = FitmentSet::query()->create([
                    'vehicle_profile_id' => $profile->id,
                    'provider' => $provider,
                    'provider_reference' => (string) ($fitment['provider_reference'] ?? $provider),
                    'fitment_type' => (string) ($fitment['fitment_type'] ?? 'oe'),
                    'label' => $fitment['label'] ?? null,
                    'tyre_category_slug' => null,
                    'is_primary' => (bool) ($fitment['is_primary'] ?? false),
                    'is_staggered' => (bool) ($fitment['is_staggered'] ?? false),
                    'provider_queried_at' => Carbon::now(),
                ]);

                foreach ($fitment['positions'] ?? [] as $position) {
                    if (! is_array($position)) {
                        continue;
                    }

                    FitmentPosition::query()->create([
                        'fitment_set_id' => $set->id,
                        'position' => (string) ($position['position'] ?? 'all_round'),
                        'width' => (int) ($position['width'] ?? 0),
                        'profile' => (int) ($position['profile'] ?? 0),
                        'rim' => (int) ($position['rim'] ?? 0),
                        'load_index' => $position['load_index'] ?? null,
                        'speed_rating' => $position['speed_rating'] ?? null,
                        'tyre_category_slug' => null,
                        'is_extra_load' => false,
                        'is_run_flat' => (bool) ($position['is_run_flat'] ?? false),
                        'is_winter' => false,
                        'is_all_season' => false,
                        'is_ev_rated' => false,
                        'is_van' => false,
                        'is_4x4' => false,
                        'oe_marking' => null,
                        'recommended_quantity' => 4,
                    ]);
                }
            }

            $sets = FitmentSet::query()
                ->where('vehicle_profile_id', $profile->id)
                ->where('provider', $provider)
                ->get();

            if ($sets->isNotEmpty() && $sets->every(fn (FitmentSet $set) => ! $set->is_primary)) {
                FitmentSet::query()->whereKey($sets->first()->id)->update(['is_primary' => true]);
            }
        });
    }

    /**
     * @param  array<int, array<string, mixed>>  $fitments
     */
    private function syncFitmentsFromUkVehicleData(VehicleProfile $profile, array $fitments): void
    {
        $this->syncFitmentsFromTyreProvider($profile, $fitments, 'uk_vehicle_data');
    }

    private function storeProviderLookupPayload(?VehicleProfile $profile, string $registration, string $provider, array $lookup): void
    {
        if (($lookup['status'] ?? null) === 'disabled') {
            return;
        }

        $cacheHours = match ($provider) {
            'uk_vehicle_data' => (int) config('services.uk_vehicle_data.cache_ttl_hours', 24),
            'vehicle_data_global' => 24,
            default => (int) config('services.dvla.cache_ttl_hours', 24),
        };

        LookupPayload::query()->create([
            'vehicle_profile_id' => $profile?->id,
            'provider' => $provider,
            'lookup_type' => 'registration',
            'lookup_key' => $registration,
            'http_status' => $lookup['httpStatus'] ?? null,
            'success' => ($lookup['status'] ?? null) === 'ok',
            'raw_request' => ['registration' => $registration],
            'raw_response' => $lookup['rawResponse'] ?? null,
            'normalized_payload' => $lookup['normalized'] ?? null,
            'error_code' => $lookup['errorCode'] ?? null,
            'latency_ms' => $lookup['latencyMs'] ?? null,
            'fetched_at' => Carbon::now(),
            'expires_at' => Carbon::now()->addHours($cacheHours),
        ]);
    }

    private function storeLookupPayload(?VehicleProfile $profile, string $registration, array $lookup): void
    {
        $this->storeProviderLookupPayload($profile, $registration, 'dvla', $lookup);
    }

    private function buildSuccessPayload(
        VehicleProfile $profile,
        string $source,
        bool $usedCache,
        ?string $fallbackMode = null,
    ): array {
        $fitmentSets = $this->fitmentResolver->resolve($profile);
        $selectedFitment = $fitmentSets->firstWhere('is_primary', true) ?? $fitmentSets->first();
        $latestPayload = $profile->lookupPayloads()->latest('fetched_at')->first();

        return [
            'status' => 'ok',
            'payload' => FrontendApi::vehicleLookupResponse(
                $profile->fresh(['make', 'model']),
                $fitmentSets,
                $selectedFitment,
                [
                    'source' => $source,
                    'provider' => $selectedFitment?->provider ?? $profile->source,
                    'usedCache' => $usedCache,
                    'selectedFitmentId' => $selectedFitment?->id,
                    'availableFitmentCount' => $fitmentSets->count(),
                    'queriedAt' => optional($latestPayload?->fetched_at ?? $profile->last_verified_at)->toIso8601String(),
                    'expiresAt' => optional($latestPayload?->expires_at)->toIso8601String(),
                    'fallbackMode' => $fallbackMode,
                    'message' => match ($source) {
                        'legacy_migration' => 'Matched via the legacy lookup while the new fitment cache warms up.',
                        'dvla_plus_external_fitment' => 'Matched using live DVLA identity plus external fitment data.',
                        'dvla_plus_fitment_cache' => 'Matched using live DVLA identity and stored fitment data.',
                        'dvla_plus_configured_fallback' => 'DVLA identity matched; using FITMENT_FALLBACK_* default tyre size (demo only — configure a real fitment source for production).',
                        'uk_vehicle_data' => 'Matched using UK Vehicle Data tyre fitment records.',
                        'vehicle_data_global' => 'Matched using Vehicle Data Global tyre fitment records.',
                        'fitment_cache' => 'Matched using stored vehicle and fitment data.',
                        default => 'Matched using the layered registration lookup.',
                    },
                ],
            ),
        ];
    }

    /**
     * Optional last-resort fitment when DVLA identity exists but no Phase-3 data and no legacy row.
     */
    private function applyUnresolvedFallbackFitment(VehicleProfile $profile): bool
    {
        if (! (bool) config('services.fitment.unresolved_fallback.enabled')) {
            return false;
        }

        $width = (int) config('services.fitment.unresolved_fallback.width');
        $tyreProfile = (int) config('services.fitment.unresolved_fallback.profile');
        $rim = (int) config('services.fitment.unresolved_fallback.rim');
        if ($width <= 0 || $tyreProfile <= 0 || $rim <= 0) {
            return false;
        }

        if ($this->fitmentResolver->resolve($profile)->isNotEmpty()) {
            return false;
        }

        $loadIndexRaw = config('services.fitment.unresolved_fallback.load_index');
        $loadIndex = $loadIndexRaw !== null && $loadIndexRaw !== ''
            ? (int) $loadIndexRaw
            : null;
        if ($loadIndex !== null && $loadIndex <= 0) {
            $loadIndex = null;
        }

        $speedRating = strtoupper((string) config('services.fitment.unresolved_fallback.speed_rating', 'V'));
        $categorySlug = config('services.fitment.unresolved_fallback.tyre_category_slug');
        $categorySlug = filled($categorySlug) ? (string) $categorySlug : null;

        DB::transaction(function () use ($profile, $width, $tyreProfile, $rim, $loadIndex, $speedRating, $categorySlug): void {
            FitmentSet::query()
                ->where('vehicle_profile_id', $profile->id)
                ->where('provider', 'configured_fallback')
                ->delete();

            $set = FitmentSet::query()->create([
                'vehicle_profile_id' => $profile->id,
                'provider' => 'configured_fallback',
                'provider_reference' => 'env-fallback',
                'fitment_type' => 'estimated',
                'label' => 'Configured fallback (FITMENT_FALLBACK_*)',
                'tyre_category_slug' => $categorySlug,
                'is_primary' => true,
                'is_staggered' => false,
                'confidence' => 0,
                'provider_queried_at' => Carbon::now(),
            ]);

            FitmentPosition::query()->create([
                'fitment_set_id' => $set->id,
                'position' => 'all_round',
                'width' => $width,
                'profile' => $tyreProfile,
                'rim' => $rim,
                'load_index' => $loadIndex,
                'speed_rating' => $speedRating !== '' ? $speedRating : null,
                'tyre_category_slug' => $categorySlug,
                'is_extra_load' => false,
                'is_run_flat' => false,
                'is_winter' => false,
                'is_all_season' => false,
                'is_ev_rated' => false,
                'is_van' => false,
                'is_4x4' => false,
                'oe_marking' => null,
                'recommended_quantity' => 4,
            ]);
        });

        return true;
    }

    private function matchMakeId(?string $make): ?int
    {
        if (! filled($make)) {
            return null;
        }

        return VehicleMake::query()
            ->whereRaw('LOWER(name) = ?', [strtolower((string) $make)])
            ->value('id');
    }

    private function matchModelId(?int $makeId, ?string $model): ?int
    {
        if (! $makeId || ! filled($model)) {
            return null;
        }

        return VehicleModel::query()
            ->where('vehicle_make_id', $makeId)
            ->whereRaw('LOWER(name) = ?', [strtolower((string) $model)])
            ->value('id');
    }
}
