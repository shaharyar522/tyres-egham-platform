<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Throwable;

class DvlaVehicleEnquiryService
{
    public function enabled(): bool
    {
        return (bool) config('services.dvla.enabled') && filled(config('services.dvla.api_key'));
    }

    public function lookup(string $registration): array
    {
        if (! $this->enabled()) {
            return [
                'status' => 'disabled',
                'message' => 'DVLA lookup is not configured.',
            ];
        }

        $startedAt = microtime(true);

        try {
            $response = Http::baseUrl((string) config('services.dvla.base_url'))
                ->timeout((int) config('services.dvla.timeout', 10))
                ->acceptJson()
                ->withHeaders([
                    'x-api-key' => (string) config('services.dvla.api_key'),
                ])
                ->post('/vehicles', [
                    'registrationNumber' => $registration,
                ]);
        } catch (Throwable $exception) {
            return [
                'status' => 'error',
                'httpStatus' => null,
                'errorCode' => 'dvla_network_error',
                'message' => 'The DVLA lookup could not be completed right now.',
                'rawResponse' => ['exception' => $exception->getMessage()],
                'normalized' => null,
                'latencyMs' => (int) round((microtime(true) - $startedAt) * 1000),
            ];
        }

        $payload = $response->json();
        $latencyMs = (int) round((microtime(true) - $startedAt) * 1000);

        if (! $response->successful()) {
            $isNotFound = $response->status() === 404;

            return [
                'status' => $isNotFound ? 'not_found' : 'error',
                'httpStatus' => $response->status(),
                'errorCode' => $isNotFound ? 'dvla_vehicle_not_found' : 'dvla_lookup_failed',
                'message' => $isNotFound
                    ? 'The DVLA service could not find this registration.'
                    : 'The DVLA lookup service is temporarily unavailable.',
                'rawResponse' => is_array($payload) ? $payload : ['body' => $response->body()],
                'normalized' => null,
                'latencyMs' => $latencyMs,
            ];
        }

        $normalized = [
            'registration' => $registration,
            'make' => $payload['make'] ?? null,
            'model' => $payload['model'] ?? null,
            'yearOfManufacture' => $payload['yearOfManufacture'] ?? null,
            'fuelType' => $payload['fuelType'] ?? null,
            'engineCapacity' => $payload['engineCapacity'] ?? null,
            'co2Emissions' => $payload['co2Emissions'] ?? null,
            'taxStatus' => $payload['taxStatus'] ?? null,
            'motStatus' => $payload['motStatus'] ?? null,
            'bodyType' => $payload['wheelplan'] ?? null,
        ];

        return [
            'status' => 'ok',
            'httpStatus' => $response->status(),
            'errorCode' => null,
            'message' => null,
            'rawResponse' => is_array($payload) ? $payload : ['body' => $response->body()],
            'normalized' => $normalized,
            'latencyMs' => $latencyMs,
        ];
    }
}
