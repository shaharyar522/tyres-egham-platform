<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Services\VehicleLookupService;

class VehicleLookupController extends Controller
{
    public function __construct(
        private readonly VehicleLookupService $vehicleLookupService,
    ) {
    }

    public function show(string $registration): JsonResponse
    {
        $lookup = $this->vehicleLookupService->lookup($registration);

        return match ($lookup['status']) {
            'ok' => response()->json($lookup['payload']),
            'invalid' => response()->json([
                'message' => $lookup['message'],
                'code' => $lookup['code'],
            ], 422),
            'fitment_not_found' => response()->json([
                'message' => $lookup['message'],
                'code' => $lookup['code'],
                ...($lookup['payload'] ?? []),
            ], 404),
            'provider_unavailable' => response()->json([
                'message' => $lookup['message'],
                'code' => $lookup['code'],
            ], 503),
            default => response()->json([
                'message' => $lookup['message'] ?? 'Registration not found.',
                'code' => $lookup['code'] ?? 'registration_not_found',
            ], 404),
        };
    }
}
