<?php

namespace App\Support;

use App\Models\Area;
use App\Models\Brand;
use App\Models\Booking;
use App\Models\ContentArticle;
use App\Models\CustomerReview;
use App\Models\FitmentPosition;
use App\Models\FitmentSet;
use App\Models\Service;
use App\Models\TyreCategory;
use App\Models\TyreSku;
use App\Models\VehicleMake;
use App\Models\VehicleProfile;
use App\Models\Voucher;
use App\Support\ContentAsset;
use App\Support\TyreAsset;
use Illuminate\Support\Collection;

class FrontendApi
{
    public static function brand(Brand $brand): array
    {
        return [
            'id' => (int) $brand->id,
            'slug' => $brand->slug,
            'name' => $brand->name,
            'tier' => $brand->tier,
            'description' => $brand->description,
            'recommendedFor' => $brand->recommended_for ?? [],
            'hasActiveOffer' => (bool) $brand->has_active_offer,
        ];
    }

    public static function category(TyreCategory $category): array
    {
        return [
            'id' => $category->id,
            'slug' => $category->slug,
            'name' => $category->name,
            'description' => $category->description,
            'iconName' => $category->icon_name,
        ];
    }

    public static function vehicleMake(VehicleMake $make): array
    {
        return [
            'id' => $make->id,
            'slug' => $make->slug,
            'name' => $make->name,
            'topModels' => $make->top_models ?? [],
        ];
    }

    public static function vehicleProfile(VehicleProfile $profile): array
    {
        $makeName = $profile->make?->name ?? $profile->dvla_make_text ?? 'Unknown Make';
        $modelName = $profile->model?->name ?? $profile->dvla_model_text ?? 'Unknown Model';
        $displayName = trim(collect([
            $profile->year_of_manufacture,
            $makeName,
            $modelName,
            $profile->derivative,
        ])->filter()->implode(' '));

        return [
            'makeId' => $profile->vehicle_make_id,
            'makeSlug' => $profile->make?->slug,
            'makeName' => $makeName,
            'modelId' => $profile->vehicle_model_id,
            'modelSlug' => $profile->model?->slug,
            'modelName' => $modelName,
            'derivative' => $profile->derivative,
            'year' => $profile->year_of_manufacture,
            'fuelType' => $profile->fuel_type,
            'bodyType' => $profile->body_type,
            'engineCapacity' => $profile->engine_capacity,
            'taxStatus' => $profile->tax_status,
            'motStatus' => $profile->mot_status,
            'displayName' => $displayName,
            'source' => $profile->source,
        ];
    }

    public static function fitmentPosition(FitmentPosition $position): array
    {
        return [
            'id' => $position->id,
            'position' => $position->position,
            'width' => $position->width,
            'profile' => $position->profile,
            'rim' => $position->rim,
            'loadIndex' => $position->load_index,
            'speedRating' => $position->speed_rating,
            'tyreCategory' => $position->tyre_category_slug,
            'isExtraLoad' => (bool) $position->is_extra_load,
            'isRunFlat' => (bool) $position->is_run_flat,
            'isWinter' => (bool) $position->is_winter,
            'isAllSeason' => (bool) $position->is_all_season,
            'isEvRated' => (bool) $position->is_ev_rated,
            'isVan' => (bool) $position->is_van,
            'is4x4' => (bool) $position->is_4x4,
            'oeMarking' => $position->oe_marking,
            'recommendedQuantity' => $position->recommended_quantity,
            'label' => self::fitmentLabel($position->width, $position->profile, $position->rim, $position->load_index, $position->speed_rating),
        ];
    }

    public static function fitmentSet(FitmentSet $fitmentSet): array
    {
        $positions = $fitmentSet->positions instanceof Collection
            ? $fitmentSet->positions
            : collect($fitmentSet->positions);

        $defaultPosition = self::defaultPosition($positions);

        return [
            'id' => $fitmentSet->id,
            'label' => $fitmentSet->label ?: self::fitmentSetLabel($positions),
            'fitmentType' => $fitmentSet->fitment_type,
            'tyreCategory' => $fitmentSet->tyre_category_slug,
            'provider' => $fitmentSet->provider,
            'providerReference' => $fitmentSet->provider_reference,
            'isPrimary' => (bool) $fitmentSet->is_primary,
            'isStaggered' => (bool) $fitmentSet->is_staggered,
            'confidence' => $fitmentSet->confidence !== null ? (float) $fitmentSet->confidence : null,
            'defaultPosition' => $defaultPosition?->position,
            'positions' => $positions->map(fn (FitmentPosition $position) => self::fitmentPosition($position))->values(),
        ];
    }

    public static function vehicleLookupResponse(
        VehicleProfile $profile,
        Collection $fitmentSets,
        ?FitmentSet $selectedFitment,
        array $matchMeta = [],
    ): array {
        $fitments = $fitmentSets->map(fn (FitmentSet $fitmentSet) => self::fitmentSet($fitmentSet))->values();
        $selectedFitmentPayload = $selectedFitment ? self::fitmentSet($selectedFitment) : null;

        return [
            'registration' => $profile->registration,
            'vehicle' => self::vehicleProfile($profile),
            'fitments' => $fitments,
            'selectedFitment' => $selectedFitmentPayload,
            'matchMeta' => $matchMeta,
        ];
    }

    public static function service(Service $service): array
    {
        return [
            'id' => $service->id,
            'slug' => $service->slug,
            'name' => $service->name,
            'shortDescription' => $service->short_description,
            'longDescription' => $service->long_description,
            'priceFrom' => $service->is_free ? 'free' : (float) $service->price_from,
            'durationMinutes' => $service->duration_minutes,
            'iconName' => $service->icon_name,
            'upsellInBasket' => (bool) $service->upsell_in_basket,
            'pricingOptions' => $service->pricing_options,
        ];
    }

    public static function area(Area $area): array
    {
        return [
            'id' => $area->id,
            'slug' => $area->slug,
            'name' => $area->name,
            'postcodePrefix' => $area->postcode_prefix,
        ];
    }

    public static function articleSeoFields(ContentArticle $article): array
    {
        return [
            'metaTitle' => $article->meta_title,
            'metaDescription' => $article->meta_description,
            'metaKeywords' => $article->meta_keywords,
            'robots' => $article->robots,
            'featuredImageUrl' => ContentAsset::url($article->featured_image_path),
            'ogImageUrl' => ContentAsset::url($article->og_image_path),
        ];
    }

    public static function article(ContentArticle $article): array
    {
        return array_merge([
            'id' => $article->id,
            'slug' => $article->slug,
            'title' => $article->title,
            'excerpt' => $article->excerpt,
            'category' => $article->category,
            'readMinutes' => $article->read_minutes,
            'publishedAt' => optional($article->published_at)->toDateString(),
            'imageEmoji' => $article->image_emoji,
            'namespace' => $article->namespace,
        ], self::articleSeoFields($article));
    }

    public static function articleDetail(ContentArticle $article): array
    {
        return array_merge(self::article($article), [
            'body' => $article->body ?? '',
        ]);
    }

    public static function page(ContentArticle $page): array
    {
        return array_merge([
            'id' => $page->id,
            'slug' => $page->slug,
            'title' => $page->title,
            'excerpt' => $page->excerpt,
            'body' => $page->body ?? '',
            'updatedAt' => optional($page->updated_at)->toDateString(),
        ], self::articleSeoFields($page));
    }

    public static function review(CustomerReview $review): array
    {
        return [
            'id' => $review->id,
            'customerName' => $review->customer_name,
            'rating' => (int) $review->rating,
            'title' => $review->title,
            'body' => $review->body,
            'date' => optional($review->created_at)->toDateString(),
            'source' => $review->source,
        ];
    }

    public static function booking(Booking $booking): array
    {
        return [
            'reference' => $booking->reference,
            'customerName' => $booking->customer_name,
            'customerEmail' => $booking->customer_email,
            'customerPhone' => $booking->customer_phone,
            'slot' => [
                'date' => $booking->slot_date,
                'time' => $booking->slot_time,
            ],
            'notes' => $booking->notes ?? '',
            'voucherCode' => $booking->voucher_code,
            'items' => $booking->items ?? [],
            'serviceIds' => $booking->service_ids ?? [],
            'serviceSelections' => $booking->service_selections ?? [],
            'totals' => [
                'subtotal' => (float) $booking->subtotal,
                'voucherDiscount' => (float) $booking->voucher_discount,
                'servicesTotal' => (float) $booking->services_total,
                'total' => (float) $booking->total,
            ],
            'status' => $booking->status,
            'paymentMethod' => $booking->payment_method ?? 'pay_on_fitment',
            'paymentStatus' => $booking->payment_status ?? 'unpaid',
            'amountPaid' => $booking->amount_paid !== null ? (float) $booking->amount_paid : null,
            'paidAt' => optional($booking->paid_at)->toIso8601String(),
            'createdAt' => optional($booking->created_at)->toIso8601String(),
        ];
    }

    public static function voucher(Voucher $voucher): array
    {
        return [
            'id' => $voucher->id,
            'code' => $voucher->code,
            'brandId' => $voucher->brand_id,
            'brandSlug' => $voucher->brand?->slug,
            'brandName' => $voucher->brand?->name,
            'minQty' => $voucher->min_qty,
            'discountPerQty' => (float) $voucher->discount_per_qty,
            'validFrom' => optional($voucher->valid_from)->toDateString(),
            'validTo' => optional($voucher->valid_to)->toDateString(),
            'description' => $voucher->description,
        ];
    }

    public static function adminTyreSku(TyreSku $sku): array
    {
        return array_merge(self::tyreSku($sku), [
            'tyreCategoryId' => $sku->tyre_category_id,
            'brandName' => $sku->brand?->name,
            'brandSlug' => $sku->brand?->slug,
            'categoryName' => $sku->category?->name,
            'sizeLabel' => sprintf('%d/%d R%d', $sku->width, $sku->profile, $sku->rim),
        ]);
    }

    public static function tyreSku(TyreSku $sku): array
    {
        return [
            'id' => (int) $sku->id,
            'slug' => $sku->slug,
            'brandId' => (int) $sku->brand_id,
            'modelName' => $sku->model_name,
            'width' => (int) $sku->width,
            'profile' => (int) $sku->profile,
            'rim' => (int) $sku->rim,
            'loadIndex' => $sku->load_index !== null ? (int) $sku->load_index : null,
            'speedRating' => $sku->speed_rating,
            'isExtraLoad' => (bool) $sku->is_extra_load,
            'isRunFlat' => (bool) $sku->is_run_flat,
            'isWinter' => (bool) $sku->is_winter,
            'isAllSeason' => (bool) $sku->is_all_season,
            'isEvRated' => (bool) $sku->is_ev_rated,
            'isVan' => (bool) $sku->is_van,
            'is4x4' => (bool) $sku->is_4x4,
            'isAvailableWithin24h' => (bool) $sku->is_available_within_24h,
            'isPremium' => (bool) $sku->is_premium,
            'isSameDayDelivery' => (bool) $sku->is_same_day_delivery,
            'isHidden' => (bool) $sku->is_hidden,
            'manufacturerSku' => $sku->manufacturer_sku,
            'ean' => $sku->ean,
            'euLabel' => $sku->eu_label,
            'oeApprovals' => $sku->oe_approvals ?? [],
            'videoUrl' => $sku->video_url,
            'imageUrl' => TyreAsset::url($sku->image_path),
            'pricePerTyre' => (float) $sku->price_per_tyre,
            'quantityTiers' => $sku->quantity_tiers ?? [],
            'starRating' => (float) $sku->star_rating,
            'reviewCount' => (int) ($sku->review_count ?? 0),
            'stock' => (int) ($sku->stock ?? 0),
            'category' => $sku->category?->slug,
            'badges' => $sku->badges ?? [],
            'hasActiveOffer' => (bool) $sku->has_active_offer,
            'voucherCode' => $sku->voucher_code,
        ];
    }

    private static function defaultPosition(Collection $positions): ?FitmentPosition
    {
        return $positions->firstWhere('position', 'all_round')
            ?? $positions->firstWhere('position', 'front')
            ?? $positions->first();
    }

    private static function fitmentSetLabel(Collection $positions): string
    {
        if ($positions->count() === 1) {
            $first = $positions->first();

            return $first ? self::fitmentLabel($first->width, $first->profile, $first->rim, $first->load_index, $first->speed_rating) : '';
        }

        return $positions->map(function (FitmentPosition $position) {
            $prefix = match ($position->position) {
                'front' => 'Front',
                'rear' => 'Rear',
                'spare' => 'Spare',
                default => 'All-round',
            };

            return sprintf(
                '%s %s',
                $prefix,
                self::fitmentLabel($position->width, $position->profile, $position->rim, $position->load_index, $position->speed_rating)
            );
        })->implode(' ¡¤ ');
    }

    private static function fitmentLabel(
        int $width,
        int $profile,
        int $rim,
        ?int $loadIndex,
        ?string $speedRating,
    ): string {
        return collect([
            sprintf('%s/%sR%s', $width, $profile, $rim),
            $loadIndex ? (string) $loadIndex : null,
            $speedRating,
        ])->filter()->implode(' ');
    }
}
