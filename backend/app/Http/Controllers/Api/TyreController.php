<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TyreSku;
use App\Services\CatalogueMatchService;
use App\Support\FrontendApi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class TyreController extends Controller
{
    public function __construct(
        private readonly CatalogueMatchService $catalogueMatchService,
    ) {
    }

    public function search(Request $request): JsonResponse
    {
        $filters = [
            'width' => $request->filled('width') ? $request->integer('width') : null,
            'profile' => $request->filled('profile') ? $request->integer('profile') : null,
            'rim' => $request->filled('rim') ? $request->integer('rim') : null,
            'brand' => $request->filled('brand') ? (string) $request->string('brand') : null,
            'tyreCategory' => $request->filled('tyreCategory') ? (string) $request->string('tyreCategory') : null,
            'offersOnly' => $request->boolean('offersOnly'),
            'page' => $request->integer('page', 1),
            'perPage' => $request->filled('perPage') ? $request->integer('perPage') : null,
            'browse' => $request->boolean('browse'),
        ];

        if ($request->filled('vehicleRegistration') && $request->filled('fitmentId')) {
            try {
                $result = $this->catalogueMatchService->searchForFitment(
                    strtoupper((string) $request->string('vehicleRegistration')),
                    (int) $request->integer('fitmentId'),
                    $request->filled('position') ? (string) $request->string('position') : null,
                    $filters,
                );
            } catch (ModelNotFoundException) {
                return response()->json([
                    'message' => 'Selected fitment could not be found for this registration.',
                    'code' => 'fitment_not_found',
                ], 404);
            }

            return response()->json($result);
        }

        return response()->json($this->catalogueMatchService->searchManual($filters));
    }

    public function show(string $idOrSlug): JsonResponse
    {
        $sku = TyreSku::query()
            ->with(['brand', 'category'])
            ->visible()
            ->where(function ($query) use ($idOrSlug) {
                $query->where('slug', $idOrSlug)->orWhere('id', $idOrSlug);
            })
            ->firstOrFail();

        return response()->json([
            'sku' => FrontendApi::tyreSku($sku),
        ]);
    }
}
