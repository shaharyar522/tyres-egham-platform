<?php

namespace App\Support;

use App\Models\Brand;
use App\Models\TyreCategory;
use App\Models\TyreSku;
use Illuminate\Support\Str;

class ReferenceTyreSkuImporter
{
    public function __construct(
        private readonly ReferenceTyreSiteScraper $scraper,
    ) {}

    /**
     * @param  callable(string): void|null  $log
     * @return array{created: int, updated: int, skipped: int, models: int, variants: int}
     */
    /**
     * @param  callable(string): void|null  $log
     * @return array{created: int, updated: int, skipped: int, models: int, variants: int}
     */
    public function importBrandFromCache(
        string $brandSlug,
        bool $dryRun = false,
        ?string $cacheDir = null,
        ?callable $log = null,
    ): array {
        $cache = $this->scraper->loadBrandCache($brandSlug, $cacheDir);
        $brandId = Brand::query()->where('slug', $brandSlug)->value('id');
        if (! $brandId) {
            throw new \RuntimeException("Brand not in database: {$brandSlug}");
        }

        $stats = ['created' => 0, 'updated' => 0, 'skipped' => 0, 'models' => count($cache['models']), 'variants' => 0];
        $nextId = (int) TyreSku::query()->max('id') + 1;
        $brandPrefix = strtoupper(substr($brandSlug, 0, 3));

        foreach ($cache['models'] as $model) {
            $variants = $model['variants'] ?? [];
            $stats['variants'] += count($variants);
            $categorySlug = $this->scraper->inferCategorySlug($model['model_name'], $model['model_slug']);
            $categoryId = TyreCategory::query()->where('slug', $categorySlug)->value('id')
                ?? TyreCategory::query()->where('slug', 'car')->value('id');
            $flags = $this->flagsFromCategory($categorySlug);

            foreach ($variants as $variant) {
                $nextId = $this->importVariantRow(
                    $brandSlug,
                    $brandId,
                    $brandPrefix,
                    $model['model_name'],
                    $model['price_from'] ?? null,
                    $variant,
                    $categoryId,
                    $flags,
                    null,
                    $dryRun,
                    $log,
                    $stats,
                    $nextId,
                );
            }

            if ($log !== null) {
                $log("Model {$model['model_name']}: ".count($variants).' variants');
            }
        }

        return $stats;
    }

    /**
     * @param  callable(string): void|null  $log
     * @return array{created: int, updated: int, skipped: int, models: int, variants: int}
     */
    public function importBrand(
        string $brandSlug,
        bool $fetchSkuPrices = false,
        bool $dryRun = false,
        ?callable $log = null,
    ): array {
        $brandId = Brand::query()->where('slug', $brandSlug)->value('id');
        if (! $brandId) {
            throw new \RuntimeException("Brand not in database: {$brandSlug}");
        }

        $brandPrefix = strtoupper(substr($brandSlug, 0, 3));
        $models = $this->scraper->fetchBrandModels($brandSlug);
        $stats = ['created' => 0, 'updated' => 0, 'skipped' => 0, 'models' => count($models), 'variants' => 0];

        $nextId = (int) TyreSku::query()->max('id') + 1;

        foreach ($models as $model) {
            $variants = $this->scraper->fetchModelVariants($brandSlug, $model['model_slug']);
            $stats['variants'] += count($variants);
            $categoryId = TyreCategory::query()
                ->where('slug', $this->scraper->inferCategorySlug($model['model_name'], $model['model_slug']))
                ->value('id')
                ?? TyreCategory::query()->where('slug', 'car')->value('id');

            $flags = $this->flagsFromCategory($this->scraper->inferCategorySlug($model['model_name'], $model['model_slug']));

            foreach ($variants as $variant) {
                $detail = $fetchSkuPrices
                    ? $this->scraper->fetchSkuDetail($variant['reference_id'], $variant['reference_slug'])
                    : null;

                $nextId = $this->importVariantRow(
                    $brandSlug,
                    $brandId,
                    $brandPrefix,
                    $model['model_name'],
                    $model['price_from'],
                    $variant,
                    $categoryId,
                    $flags,
                    $detail,
                    $dryRun,
                    $log,
                    $stats,
                    $nextId,
                );
            }

            if ($log !== null) {
                $log("Model {$model['model_name']}: ".count($variants).' variants');
            }
        }

        return $stats;
    }

    /**
     * @param  array{reference_id: int, reference_slug: string, label: string, size_load_speed: string}  $variant
     * @param  array{is_winter: bool, is_all_season: bool, is_van: bool, is_4x4: bool, is_run_flat: bool}  $flags
     * @param  ?array{price: ?float, ean: ?string, width: ?int, profile: ?int, rim: ?int, load_index: ?int, speed_rating: ?string, eu_label: ?array}  $detail
     * @param  array{created: int, updated: int, skipped: int, models: int, variants: int}  $stats
     */
    private function importVariantRow(
        string $brandSlug,
        int $brandId,
        string $brandPrefix,
        string $modelName,
        ?float $modelPriceFrom,
        array $variant,
        int $categoryId,
        array $flags,
        ?array $detail,
        bool $dryRun,
        ?callable $log,
        array &$stats,
        int $nextId,
    ): int {
        $parsed = $this->parseSizeLoadSpeed($variant['size_load_speed']);

        if ($detail !== null) {
            if ($detail['width'] !== null) {
                $parsed['width'] = $detail['width'];
            }
            if ($detail['profile'] !== null) {
                $parsed['profile'] = $detail['profile'];
            }
            if ($detail['rim'] !== null) {
                $parsed['rim'] = $detail['rim'];
            }
            if ($detail['load_index'] !== null) {
                $parsed['load_index'] = $detail['load_index'];
            }
            if ($detail['speed_rating'] !== null) {
                $parsed['speed_rating'] = $detail['speed_rating'];
            }
        }

        $existing = TyreSku::query()
            ->where('brand_id', $brandId)
            ->where('model_name', $modelName)
            ->where('width', $parsed['width'])
            ->where('profile', $parsed['profile'])
            ->where('rim', $parsed['rim'])
            ->where('load_index', $parsed['load_index'])
            ->where('speed_rating', $parsed['speed_rating'])
            ->first();

        $slug = $existing?->slug ?? $this->makeSlug($brandSlug, $modelName, $parsed);
        if ($existing === null) {
            $candidate = $slug;
            $suffix = 2;
            while (TyreSku::query()->where('slug', $candidate)->exists()) {
                $candidate = $slug.'-'.$suffix++;
            }
            $slug = $candidate;
        }

        $id = $existing?->id ?? $this->resolveId($variant['reference_id'], $nextId);
        if ($existing === null && $id >= $nextId) {
            $nextId = $id + 1;
        }

        $price = ($detail !== null ? $detail['price'] : null)
            ?? $modelPriceFrom
            ?? $this->estimatePrice(
                $parsed['rim'],
                $parsed['width'],
                $parsed['speed_rating'],
            );

        $euLabel = ($detail !== null ? $detail['eu_label'] : null) ?? [
            'fuelEfficiency' => 'C',
            'wetGrip' => 'B',
            'externalNoise' => 71,
            'noiseClass' => 'B',
        ];

        $payload = [
            'id' => $id,
            'slug' => $slug,
            'brand_id' => $brandId,
            'tyre_category_id' => $categoryId,
            'model_name' => $modelName,
            'width' => $parsed['width'],
            'profile' => $parsed['profile'],
            'rim' => $parsed['rim'],
            'load_index' => $parsed['load_index'],
            'speed_rating' => $parsed['speed_rating'],
            'is_extra_load' => $parsed['load_index'] >= 100 && $parsed['width'] <= 215,
            'is_run_flat' => $flags['is_run_flat'],
            'is_winter' => $flags['is_winter'],
            'is_all_season' => $flags['is_all_season'],
            'is_ev_rated' => false,
            'is_van' => $flags['is_van'],
            'is_4x4' => $flags['is_4x4'],
            'is_available_within_24h' => false,
            'manufacturer_sku' => sprintf(
                '%s-%s-%d%d-%d-%d%s',
                $brandPrefix,
                Str::upper(Str::slug($modelName, '')),
                $parsed['width'],
                $parsed['profile'],
                $parsed['rim'],
                $parsed['load_index'],
                $parsed['speed_rating'],
            ),
            'ean' => $detail !== null ? $detail['ean'] : null,
            'eu_label' => $euLabel,
            'oe_approvals' => null,
            'video_url' => null,
            'price_per_tyre' => $price,
            'quantity_tiers' => $this->quantityTiers((float) $price),
            'star_rating' => 4.3 + (crc32($slug) % 6) / 10,
            'review_count' => 40 + (crc32($slug) % 180),
            'stock' => 12,
            'badges' => [],
            'has_active_offer' => in_array($brandSlug, ['falken', 'continental', 'michelin', 'goodyear', 'pirelli'], true),
            'voucher_code' => match ($brandSlug) {
                'falken' => 'FALK4SAVE',
                'continental' => 'CONT7OFF',
                'michelin' => 'MICH26FA',
                'goodyear' => 'GOODYEAR26',
                'pirelli' => 'PIRELLI26',
                default => null,
            },
        ];

        if ($dryRun) {
            if ($log !== null) {
                $log("[dry-run] {$slug} {$variant['size_load_speed']} GBP {$price}");
            }

            return $nextId;
        }

        $was = $existing !== null;
        TyreSku::query()->updateOrCreate(['id' => $id], $payload);
        $was ? $stats['updated']++ : $stats['created']++;

        return $nextId;
    }

    /**
     * @return array{width: int, profile: int, rim: int, load_index: int, speed_rating: string}
     */
    private function parseSizeLoadSpeed(string $cell): array
    {
        $cell = strtoupper(trim($cell));

        if (preg_match('#^(\d{3})/(\d{2})R(\d{2})\s+(\d{2,3})(?:/\d{2,3})?([A-Z]{1,2})$#', $cell, $m)) {
            return [
                'width' => (int) $m[1],
                'profile' => (int) $m[2],
                'rim' => (int) $m[3],
                'load_index' => (int) $m[4],
                'speed_rating' => $m[5],
            ];
        }

        if (preg_match('#^(\d{2})/(\d{2}\.\d{2})R(\d{2})\s+(\d{2,3})(?:/\d{2,3})?([A-Z]{1,2})$#', $cell, $m)) {
            $widthMm = (int) round(((float) $m[1] * (float) $m[2]) / 25.4 * 10);

            return [
                'width' => max(165, min(355, $widthMm)),
                'profile' => (int) round((float) $m[2] * 10),
                'rim' => (int) $m[3],
                'load_index' => (int) $m[4],
                'speed_rating' => $m[5],
            ];
        }

        throw new \RuntimeException("Bad size: {$cell}");
    }

  /**
     * @param  array{width: int, profile: int, rim: int, load_index: int, speed_rating: string}  $parsed
     */
    private function makeSlug(string $brandSlug, string $modelName, array $parsed): string
    {
        $speed = strtolower($parsed['speed_rating']);

        return Str::slug("{$brandSlug} {$modelName} {$parsed['width']} {$parsed['profile']} r{$parsed['rim']} {$parsed['load_index']}{$speed}", '-');
    }

    private function resolveId(int $referenceId, int $fallbackId): int
    {
        if (TyreSku::query()->where('id', $referenceId)->exists()) {
            return $fallbackId;
        }

        return $referenceId;
    }

    private function estimatePrice(int $rim, int $width, string $speedRating): float
    {
        $base = match ($rim) {
            15 => 59,
            16 => 71,
            17 => 88,
            18 => 104,
            19 => 118,
            20 => 132,
            21 => 148,
            default => 80,
        };
        $widthAdj = (int) round(($width - 205) * 0.08);
        $speedAdj = match (strtoupper($speedRating)) {
            'Y' => 22,
            'W' => 14,
            'V' => 6,
            'H' => 0,
            default => 4,
        };

        return (float) max(47, min(279, $base + $widthAdj + $speedAdj));
    }

    /**
     * @return list<array{qty: int, pricePerTyre: float|int, saveLabel?: string}>
     */
    private function quantityTiers(float $price): array
    {
        $qty4 = max(44, round($price - 4, 2));

        return [
            ['qty' => 1, 'pricePerTyre' => $price],
            ['qty' => 4, 'pricePerTyre' => $qty4, 'saveLabel' => 'Save £16'],
        ];
    }

    /**
     * @return array{is_winter: bool, is_all_season: bool, is_van: bool, is_4x4: bool, is_run_flat: bool}
     */
    private function flagsFromCategory(string $categorySlug): array
    {
        return [
            'is_winter' => $categorySlug === 'winter',
            'is_all_season' => $categorySlug === 'all-season',
            'is_van' => $categorySlug === 'van',
            'is_4x4' => $categorySlug === '4x4',
            'is_run_flat' => $categorySlug === 'run-flat',
        ];
    }
}
