<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Vehicle Data Global R2 lookup — TyreDetails package.
 * @see https://uk.api.vehicledataglobal.com/r2/lookup
 */
class VehicleDataGlobalService
{
    public function enabled(): bool
    {
        return (bool) config('services.vehicle_data_global.enabled')
            && filled(config('services.vehicle_data_global.api_key'));
    }

    public function lookup(string $registration): array
    {
        if (! $this->enabled()) {
            return [
                'status' => 'disabled',
                'message' => 'Vehicle Data Global lookup is not configured.',
            ];
        }

        $startedAt = microtime(true);
        $apiKey = (string) config('services.vehicle_data_global.api_key');
        $package = (string) config('services.vehicle_data_global.package', 'TyreDetails');
        $endpoint = rtrim((string) config('services.vehicle_data_global.base_url'), '/');
        $timeout = (int) config('services.vehicle_data_global.timeout', 15);

        try {
            $response = Http::timeout($timeout)
                ->acceptJson()
                ->withToken($apiKey)
                ->get($endpoint, [
                    'packageName' => $package,
                    'vrm' => $registration,
                ]);
        } catch (Throwable $exception) {
            return [
                'status' => 'error',
                'httpStatus' => null,
                'errorCode' => 'vdg_network_error',
                'message' => 'The Vehicle Data Global lookup could not be completed right now.',
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
                'errorCode' => $response->status() === 401 ? 'vdg_unauthorized' : 'vdg_lookup_failed',
                'message' => $response->status() === 401
                    ? 'Vehicle Data Global API credentials were rejected. Check your API key.'
                    : 'The Vehicle Data Global lookup service is temporarily unavailable.',
                'rawResponse' => is_array($payload) ? $payload : ['body' => $response->body()],
                'normalized' => null,
                'latencyMs' => $latencyMs,
            ];
        }

        $isSuccess = (bool) $this->val($payload, 'ResponseInformation.IsSuccessStatusCode', 'ResponseInformation.isSuccessStatusCode');
        if (! $isSuccess) {
            $statusMessage = (string) ($this->val($payload, 'ResponseInformation.StatusMessage', 'ResponseInformation.statusMessage') ?? 'Lookup failed');
            $lower = strtolower($statusMessage);
            $notFound = str_contains($lower, 'not found')
                || str_contains($lower, 'noresultsfound')
                || str_contains($lower, 'no results');

            return [
                'status' => $notFound ? 'not_found' : 'error',
                'httpStatus' => $response->status(),
                'errorCode' => $notFound ? 'vdg_vehicle_not_found' : 'vdg_lookup_failed',
                'message' => $statusMessage,
                'rawResponse' => $payload,
                'normalized' => null,
                'latencyMs' => $latencyMs,
            ];
        }

        $tyreDetails = $this->val($payload, 'Results.TyreDetails', 'Results.tyreDetails');
        $records = $this->val($tyreDetails ?? [], 'TyreDetailsList', 'tyreDetailsList') ?? [];
        if (! is_array($records)) {
            $records = [];
        }

        $fitments = $this->normalizeFitments($records);
        $firstVehicle = is_array($records[0] ?? null)
            ? ($this->val($records[0], 'Vehicle', 'vehicle') ?? [])
            : [];

        if ($fitments === [] && $firstVehicle === []) {
            return [
                'status' => 'not_found',
                'httpStatus' => $response->status(),
                'errorCode' => 'vdg_vehicle_not_found',
                'message' => 'No vehicle or tyre data was returned for this registration.',
                'rawResponse' => $payload,
                'normalized' => null,
                'latencyMs' => $latencyMs,
            ];
        }

        $year = $this->val($firstVehicle, 'Year.Uk', 'year.uk', 'Year.Euro', 'year.euro');
        $model = $this->val($firstVehicle, 'ModelName', 'modelName');

        return [
            'status' => 'ok',
            'httpStatus' => $response->status(),
            'errorCode' => null,
            'message' => null,
            'rawResponse' => $payload,
            'normalized' => [
                'registration' => $registration,
                'make' => null,
                'model' => filled($model) ? (string) $model : null,
                'yearOfManufacture' => filled($year) ? (int) preg_replace('/\D+/', '', (string) $year) ?: null : null,
                'fuelType' => null,
                'bodyType' => null,
                'fitments' => $fitments,
            ],
            'latencyMs' => $latencyMs,
        ];
    }

    /**
     * @param  array<int, mixed>  $records
     * @return array<int, array<string, mixed>>
     */
    private function normalizeFitments(array $records): array
    {
        $fitments = [];

        foreach ($records as $index => $record) {
            if (! is_array($record)) {
                continue;
            }

            $frontTyre = $this->val($record, 'Front.Tyre', 'front.tyre');
            $rearTyre = $this->val($record, 'Rear.Tyre', 'rear.tyre');
            $front = $this->normalizePosition(is_array($frontTyre) ? $frontTyre : null, 'front');
            $rear = $this->normalizePosition(is_array($rearTyre) ? $rearTyre : null, 'rear');
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

            // Same size on both axles → single all-round fitment
            if (count($positions) > 1 && ! $isStaggered) {
                $positions = [[
                    ...$positions[0],
                    'position' => 'all_round',
                ]];
            }

            $label = $this->val($record, 'Vehicle.ModelName', 'vehicle.modelName');
            $isStandard = (bool) ($this->val($record, 'IsStandardFitmentForVehicle', 'isStandardFitmentForVehicle') ?? ($index === 0));

            $fitments[] = [
                'provider_reference' => 'vdg-'.($index + 1),
                'fitment_type' => 'oe',
                'label' => filled($label) ? (string) $label : null,
                'is_primary' => $isStandard || $index === 0,
                'is_staggered' => $isStaggered,
                'positions' => $positions,
            ];
        }

        // Ensure exactly one primary when multiple standards exist
        $hasPrimary = false;
        foreach ($fitments as $i => $fitment) {
            if ($fitment['is_primary'] && ! $hasPrimary) {
                $hasPrimary = true;
                continue;
            }
            if ($fitment['is_primary'] && $hasPrimary) {
                $fitments[$i]['is_primary'] = false;
            }
        }
        if (! $hasPrimary && $fitments !== []) {
            $fitments[0]['is_primary'] = true;
        }

        return $fitments;
    }

    /**
     * @return array{width:int,profile:int,rim:int,load_index:?int,speed_rating:?string,position:string,is_run_flat:bool}|null
     */
    private function normalizePosition(?array $tyre, string $position): ?array
    {
        if (! is_array($tyre)) {
            return null;
        }

        $width = (int) ($this->val($tyre, 'SectionWidthMm', 'sectionWidthMm') ?? 0);
        $profile = (int) ($this->val($tyre, 'AspectRatio', 'aspectRatio') ?? 0);
        $rim = (int) ($this->val($tyre, 'RimDiameterInches', 'rimDiameterInches') ?? 0);
        $sizeDescription = (string) ($this->val($tyre, 'SizeDescription', 'sizeDescription') ?? '');

        if (($width <= 0 || $profile <= 0 || $rim <= 0) && $sizeDescription !== '') {
            if (preg_match('/(\d{3})\s*[\/\-]\s*(\d{2})\s*R\s*(\d{2})/i', $sizeDescription, $matches)) {
                $width = (int) $matches[1];
                $profile = (int) $matches[2];
                $rim = (int) $matches[3];
            }
        }

        if ($width <= 0 || $profile <= 0 || $rim <= 0) {
            return null;
        }

        $loadIndex = $this->val($tyre, 'LoadIndex', 'loadIndex');
        $speedRating = $this->val($tyre, 'SpeedIndex', 'speedIndex');
        $isRunFlat = (bool) ($this->val($tyre, 'IsRunFlat', 'isRunFlat') ?? false);

        return [
            'position' => $position,
            'width' => $width,
            'profile' => $profile,
            'rim' => $rim,
            'load_index' => filled($loadIndex) ? (int) $loadIndex : null,
            'speed_rating' => filled($speedRating) ? strtoupper((string) $speedRating) : null,
            'is_run_flat' => $isRunFlat,
        ];
    }

    private function val(mixed $data, string ...$paths): mixed
    {
        if (! is_array($data)) {
            return null;
        }

        foreach ($paths as $path) {
            $value = data_get($data, $path);
            if ($value !== null && $value !== '') {
                return $value;
            }
        }

        return null;
    }
}
