<?php

namespace App\Http\Controllers\Api;

use App\Models\Brand;
use App\Http\Controllers\Controller;
use App\Support\FrontendApi;
use Illuminate\Http\JsonResponse;

class BrandController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'brands' => Brand::orderBy('name')->get()->map(fn (Brand $brand) => FrontendApi::brand($brand))->values(),
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $brand = Brand::where('slug', $slug)->firstOrFail();

        return response()->json([
            'brand' => FrontendApi::brand($brand),
        ]);
    }
}
