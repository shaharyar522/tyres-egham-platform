<?php

namespace App\Http\Controllers\Api;

use App\Models\Service;
use App\Http\Controllers\Controller;
use App\Support\FrontendApi;
use Illuminate\Http\JsonResponse;

class ServiceController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'services' => Service::query()
                ->where('upsell_in_basket', true)
                ->orderBy('id')
                ->get()
                ->map(fn (Service $service) => FrontendApi::service($service))
                ->values(),
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $service = Service::query()
            ->where('slug', $slug)
            ->where('upsell_in_basket', true)
            ->firstOrFail();

        return response()->json([
            'service' => FrontendApi::service($service),
        ]);
    }
}
