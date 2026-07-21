<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Support\AdminPagination;
use App\Support\FrontendApi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BrandController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $paginator = Brand::query()
            ->withCount('tyreSkus')
            ->orderBy('name')
            ->paginate(AdminPagination::perPage($request));

        return response()->json([
            'brands' => collect($paginator->items())
                ->map(fn (Brand $brand) => array_merge(FrontendApi::brand($brand), [
                    'skuCount' => $brand->tyre_skus_count,
                ]))
                ->values(),
            'meta' => AdminPagination::meta($paginator),
        ]);
    }

    public function show(Brand $brand): JsonResponse
    {
        $brand->loadCount('tyreSkus');

        return response()->json([
            'brand' => array_merge(FrontendApi::brand($brand), [
                'skuCount' => $brand->tyre_skus_count,
            ]),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatedPayload($request);
        $brand = Brand::create($validated);

        return response()->json([
            'brand' => FrontendApi::brand($brand),
        ], 201);
    }

    public function update(Request $request, Brand $brand): JsonResponse
    {
        $validated = $this->validatedPayload($request, $brand->id);
        $brand->update($validated);

        return response()->json([
            'brand' => FrontendApi::brand($brand->fresh()),
        ]);
    }

    public function destroy(Brand $brand): JsonResponse
    {
        if ($brand->tyreSkus()->exists()) {
            throw ValidationException::withMessages([
                'brand' => 'Cannot delete this brand while tyre SKUs are assigned to it.',
            ]);
        }

        $brand->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    private function validatedPayload(Request $request, ?int $ignoreId = null): array
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:120', Rule::unique('brands', 'slug')->ignore($ignoreId)],
            'tier' => ['required', Rule::in(['premium', 'mid_range', 'budget'])],
            'description' => ['nullable', 'string', 'max:2000'],
            'recommendedFor' => ['nullable', 'array'],
            'recommendedFor.*' => ['string', 'max:120'],
            'hasActiveOffer' => ['sometimes', 'boolean'],
        ]);

        $slug = isset($validated['slug']) && $validated['slug'] !== ''
            ? Str::slug($validated['slug'])
            : Str::slug($validated['name']);

        return [
            'name' => trim($validated['name']),
            'slug' => $slug,
            'tier' => $validated['tier'],
            'description' => $validated['description'] ?? null,
            'recommended_for' => $validated['recommendedFor'] ?? [],
            'has_active_offer' => $validated['hasActiveOffer'] ?? false,
        ];
    }
}
