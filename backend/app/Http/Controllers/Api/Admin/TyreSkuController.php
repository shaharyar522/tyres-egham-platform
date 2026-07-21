<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\TyreSku;
use App\Support\AdminPagination;
use App\Support\FrontendApi;
use App\Support\TyreAsset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TyreSkuController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->string('search')->toString();
        $within24h = $request->query('within24h');

        $query = TyreSku::query()
            ->with(['brand', 'category'])
            ->orderByDesc('is_available_within_24h')
            ->orderBy('brand_id')
            ->orderBy('width')
            ->orderBy('profile')
            ->orderBy('rim');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('slug', 'like', "%{$search}%")
                    ->orWhere('model_name', 'like', "%{$search}%")
                    ->orWhere('manufacturer_sku', 'like', "%{$search}%")
                    ->orWhereHas('brand', fn ($b) => $b->where('name', 'like', "%{$search}%"));
            });
        }

        if ($within24h === '1' || $within24h === 'true') {
            $query->where('is_available_within_24h', true);
        } elseif ($within24h === '0' || $within24h === 'false') {
            $query->where('is_available_within_24h', false);
        }

        $paginator = $query->paginate(AdminPagination::perPage($request, 25));

        return response()->json([
            'skus' => collect($paginator->items())->map(fn (TyreSku $sku) => FrontendApi::adminTyreSku($sku))->values(),
            'meta' => AdminPagination::meta($paginator),
        ]);
    }

    public function show(TyreSku $tyreSku): JsonResponse
    {
        $tyreSku->load(['brand', 'category']);

        return response()->json([
            'sku' => FrontendApi::adminTyreSku($tyreSku),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $payload = $this->validatedTyrePayload($request);

        $id = $payload['id'] ?? ((int) TyreSku::max('id')) + 1;
        while (TyreSku::whereKey($id)->exists()) {
            $id++;
        }
        $payload['id'] = $id;

        if (empty($payload['slug'])) {
            $payload['slug'] = $this->generateSlug(
                $payload['brand_id'],
                $payload['model_name'],
                $payload['width'],
                $payload['profile'],
                $payload['rim'],
            );
        }

        $tyreSku = TyreSku::create($payload);

        return response()->json([
            'sku' => FrontendApi::adminTyreSku($tyreSku->load(['brand', 'category'])),
        ], 201);
    }

    public function update(Request $request, TyreSku $tyreSku): JsonResponse
    {
        $validated = $this->validatedTyrePayload($request, $tyreSku);
        $tyreSku->update($validated);

        return response()->json([
            'sku' => FrontendApi::adminTyreSku($tyreSku->fresh()->load(['brand', 'category'])),
        ]);
    }

    public function updateImage(Request $request, TyreSku $tyreSku): JsonResponse
    {
        $validated = $request->validate([
            'image' => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'removeImage' => ['sometimes', 'boolean'],
        ]);

        if (! empty($validated['removeImage'])) {
            TyreAsset::delete($tyreSku->image_path);
            $tyreSku->image_path = null;
        } elseif ($request->hasFile('image')) {
            TyreAsset::delete($tyreSku->image_path);
            $tyreSku->image_path = TyreAsset::store($request->file('image'), 'tyre-'.$tyreSku->id);
        }

        $tyreSku->save();

        return response()->json([
            'sku' => FrontendApi::adminTyreSku($tyreSku->fresh()->load(['brand', 'category'])),
        ]);
    }

    public function bulkWithin24h(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer'],
            'enabled' => ['required', 'boolean'],
        ]);

        $updated = TyreSku::query()
            ->whereIn('id', $validated['ids'])
            ->update(['is_available_within_24h' => $validated['enabled']]);

        return response()->json([
            'updated' => $updated,
            'enabled' => $validated['enabled'],
        ]);
    }

    private function validatedTyrePayload(Request $request, ?TyreSku $existing = null): array
    {
        $isUpdate = $existing !== null;

        $validated = $request->validate([
            'id' => ['nullable', 'integer', 'min:1', Rule::unique('tyre_skus', 'id')->ignore($existing?->id)],
            'slug' => ['nullable', 'string', 'max:191', Rule::unique('tyre_skus', 'slug')->ignore($existing?->id)],
            'brandId' => [$isUpdate ? 'sometimes' : 'required', 'integer', 'exists:brands,id'],
            'tyreCategoryId' => [$isUpdate ? 'sometimes' : 'required', 'integer', 'exists:tyre_categories,id'],
            'modelName' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:120'],
            'width' => [$isUpdate ? 'sometimes' : 'required', 'integer', 'min:125', 'max:355'],
            'profile' => [$isUpdate ? 'sometimes' : 'required', 'integer', 'min:25', 'max:85'],
            'rim' => [$isUpdate ? 'sometimes' : 'required', 'integer', 'min:12', 'max:24'],
            'loadIndex' => [$isUpdate ? 'sometimes' : 'required', 'integer', 'min:60', 'max:130'],
            'speedRating' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:8'],
            'manufacturerSku' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:64'],
            'ean' => ['nullable', 'string', 'max:32'],
            'pricePerTyre' => [$isUpdate ? 'sometimes' : 'required', 'numeric', 'min:0'],
            'stock' => [$isUpdate ? 'sometimes' : 'required', 'integer', 'min:0'],
            'isExtraLoad' => ['sometimes', 'boolean'],
            'isRunFlat' => ['sometimes', 'boolean'],
            'isWinter' => ['sometimes', 'boolean'],
            'isAllSeason' => ['sometimes', 'boolean'],
            'isEvRated' => ['sometimes', 'boolean'],
            'isVan' => ['sometimes', 'boolean'],
            'is4x4' => ['sometimes', 'boolean'],
            'isAvailableWithin24h' => ['sometimes', 'boolean'],
            'hasActiveOffer' => ['sometimes', 'boolean'],
            'voucherCode' => ['nullable', 'string', 'max:32'],
            'starRating' => ['sometimes', 'numeric', 'min:0', 'max:5'],
            'reviewCount' => ['sometimes', 'integer', 'min:0'],
            'videoUrl' => ['nullable', 'string', 'max:500'],
            'euLabel' => ['sometimes', 'array'],
            'euLabel.fuelEfficiency' => ['sometimes', 'string', 'max:1'],
            'euLabel.wetGrip' => ['sometimes', 'string', 'max:1'],
            'euLabel.externalNoise' => ['sometimes', 'integer', 'min:60', 'max:80'],
            'euLabel.noiseClass' => ['sometimes', 'string', 'max:1'],
            'oeApprovals' => ['sometimes', 'array'],
            'quantityTiers' => ['sometimes', 'array'],
            'badges' => ['sometimes', 'array'],
            'badges.*' => ['string', 'in:best_buy,specialist,recommended'],
            'recalculateTiers' => ['sometimes', 'boolean'],
        ]);

        $brandId = $validated['brandId'] ?? $existing?->brand_id;
        $modelName = isset($validated['modelName']) ? trim($validated['modelName']) : $existing?->model_name;
        $width = $validated['width'] ?? $existing?->width;
        $profile = $validated['profile'] ?? $existing?->profile;
        $rim = $validated['rim'] ?? $existing?->rim;

        $slug = isset($validated['slug'])
            ? Str::slug($validated['slug'])
            : ($existing?->slug);

        if (! $isUpdate && ! $slug && $brandId && $modelName) {
            $slug = $this->generateSlug($brandId, $modelName, $width, $profile, $rim);
        }

        $price = array_key_exists('pricePerTyre', $validated)
            ? (float) $validated['pricePerTyre']
            : (float) ($existing?->price_per_tyre ?? 0);

        $payload = array_filter([
            'id' => $validated['id'] ?? null,
            'slug' => $slug,
            'brand_id' => $brandId,
            'tyre_category_id' => $validated['tyreCategoryId'] ?? $existing?->tyre_category_id,
            'model_name' => $modelName,
            'width' => $width,
            'profile' => $profile,
            'rim' => $rim,
            'load_index' => $validated['loadIndex'] ?? $existing?->load_index,
            'speed_rating' => isset($validated['speedRating'])
                ? strtoupper($validated['speedRating'])
                : $existing?->speed_rating,
            'manufacturer_sku' => isset($validated['manufacturerSku'])
                ? trim($validated['manufacturerSku'])
                : $existing?->manufacturer_sku,
            'ean' => array_key_exists('ean', $validated) ? ($validated['ean'] ?: null) : $existing?->ean,
            'price_per_tyre' => array_key_exists('pricePerTyre', $validated) ? $price : null,
            'stock' => $validated['stock'] ?? null,
            'is_extra_load' => $validated['isExtraLoad'] ?? null,
            'is_run_flat' => $validated['isRunFlat'] ?? null,
            'is_winter' => $validated['isWinter'] ?? null,
            'is_all_season' => $validated['isAllSeason'] ?? null,
            'is_ev_rated' => $validated['isEvRated'] ?? null,
            'is_van' => $validated['isVan'] ?? null,
            'is_4x4' => $validated['is4x4'] ?? null,
            'is_available_within_24h' => $validated['isAvailableWithin24h'] ?? null,
            'has_active_offer' => $validated['hasActiveOffer'] ?? null,
            'voucher_code' => array_key_exists('voucherCode', $validated)
                ? ($validated['voucherCode'] ?: null)
                : null,
            'star_rating' => $validated['starRating'] ?? null,
            'review_count' => $validated['reviewCount'] ?? null,
            'video_url' => array_key_exists('videoUrl', $validated)
                ? ($validated['videoUrl'] ?: null)
                : null,
            'eu_label' => $validated['euLabel'] ?? null,
            'oe_approvals' => $validated['oeApprovals'] ?? null,
            'quantity_tiers' => null,
            'badges' => $validated['badges'] ?? null,
        ], fn ($value) => $value !== null);

        if (isset($validated['quantityTiers'])) {
            $payload['quantity_tiers'] = $validated['quantityTiers'];
        } elseif (! empty($validated['recalculateTiers']) && array_key_exists('pricePerTyre', $validated)) {
            $payload['quantity_tiers'] = $this->defaultQuantityTiers($price);
        }

        if ($isUpdate && array_key_exists('voucherCode', $validated) === false) {
            unset($payload['voucher_code']);
        }

        if (! $isUpdate) {
            $payload['eu_label'] = $payload['eu_label'] ?? $this->defaultEuLabel();
            $payload['oe_approvals'] = $payload['oe_approvals'] ?? [];
            $payload['quantity_tiers'] = $payload['quantity_tiers'] ?? $this->defaultQuantityTiers($price);
            $payload['badges'] = $payload['badges'] ?? [];
            $payload['is_extra_load'] = $payload['is_extra_load'] ?? false;
            $payload['is_run_flat'] = $payload['is_run_flat'] ?? false;
            $payload['is_winter'] = $payload['is_winter'] ?? false;
            $payload['is_all_season'] = $payload['is_all_season'] ?? false;
            $payload['is_ev_rated'] = $payload['is_ev_rated'] ?? false;
            $payload['is_van'] = $payload['is_van'] ?? false;
            $payload['is_4x4'] = $payload['is_4x4'] ?? false;
            $payload['is_available_within_24h'] = $payload['is_available_within_24h'] ?? false;
            $payload['has_active_offer'] = $payload['has_active_offer'] ?? false;
            $payload['voucher_code'] = $payload['voucher_code'] ?? null;
            $payload['star_rating'] = $payload['star_rating'] ?? 0;
            $payload['review_count'] = $payload['review_count'] ?? 0;
        }

        return $payload;
    }

    private function generateSlug(int $brandId, string $modelName, int $width, int $profile, int $rim): string
    {
        $brand = Brand::findOrFail($brandId);
        $base = Str::slug("{$brand->slug}-{$modelName}-{$width}-{$profile}-r{$rim}");
        $slug = $base;
        $suffix = 2;

        while (TyreSku::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    private function defaultEuLabel(): array
    {
        return [
            'fuelEfficiency' => 'B',
            'wetGrip' => 'A',
            'externalNoise' => 71,
            'noiseClass' => 'B',
        ];
    }

    private function defaultQuantityTiers(float $price): array
    {
        $tier2 = round($price - 4, 2);
        $tier4 = round($price - 8, 2);

        return [
            ['qty' => 1, 'pricePerTyre' => $price],
            ['qty' => 2, 'pricePerTyre' => $tier2, 'saveLabel' => 'Save £'.(int) round(($price - $tier2) * 2)],
            ['qty' => 4, 'pricePerTyre' => $tier4, 'saveLabel' => 'Save £'.(int) round(($price - $tier4) * 4)],
        ];
    }
}
