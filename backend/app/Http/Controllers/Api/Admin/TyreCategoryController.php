<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TyreCategory;
use App\Support\AdminPagination;
use App\Support\FrontendApi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class TyreCategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $paginator = TyreCategory::query()
            ->withCount('tyreSkus')
            ->orderBy('name')
            ->paginate(AdminPagination::perPage($request));

        return response()->json([
            'categories' => collect($paginator->items())
                ->map(fn (TyreCategory $category) => array_merge(FrontendApi::category($category), [
                    'skuCount' => $category->tyre_skus_count,
                ]))
                ->values(),
            'meta' => AdminPagination::meta($paginator),
        ]);
    }

    public function show(TyreCategory $tyreCategory): JsonResponse
    {
        $tyreCategory->loadCount('tyreSkus');

        return response()->json([
            'category' => array_merge(FrontendApi::category($tyreCategory), [
                'skuCount' => $tyreCategory->tyre_skus_count,
            ]),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatedPayload($request);
        $category = TyreCategory::create($validated);

        return response()->json([
            'category' => FrontendApi::category($category),
        ], 201);
    }

    public function update(Request $request, TyreCategory $tyreCategory): JsonResponse
    {
        $validated = $this->validatedPayload($request, $tyreCategory->id);
        $tyreCategory->update($validated);

        return response()->json([
            'category' => FrontendApi::category($tyreCategory->fresh()),
        ]);
    }

    public function destroy(TyreCategory $tyreCategory): JsonResponse
    {
        if ($tyreCategory->tyreSkus()->exists()) {
            throw ValidationException::withMessages([
                'category' => 'Cannot delete this category while tyre SKUs are assigned to it.',
            ]);
        }

        $tyreCategory->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    private function validatedPayload(Request $request, ?int $ignoreId = null): array
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:120', Rule::unique('tyre_categories', 'slug')->ignore($ignoreId)],
            'description' => ['nullable', 'string', 'max:2000'],
            'iconName' => ['nullable', 'string', 'max:64'],
        ]);

        $slug = isset($validated['slug']) && $validated['slug'] !== ''
            ? Str::slug($validated['slug'])
            : Str::slug($validated['name']);

        return [
            'name' => trim($validated['name']),
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'icon_name' => $validated['iconName'] ?? null,
        ];
    }
}
