<?php

namespace App\Console\Commands;

use App\Models\Brand;
use App\Models\TyreCategory;
use App\Models\TyreSku;
use Illuminate\Console\Command;
use Illuminate\Support\Str;
use RuntimeException;

class ImportFalkenZiexZe320CsvCommand extends Command
{
    protected $signature = 'tyres:import-falken-ze320-csv
        {--path= : CSV path (default: database/data/falken_ziex_ze320_variants.csv)}
        {--dry-run : Parse and report only, no DB writes}';

    protected $description = 'Import Falken Ziex ZE320 tyre variants from CSV into tyre_skus';

    public function handle(): int
    {
        $path = $this->option('path')
            ?: database_path('data/falken_ziex_ze320_variants.csv');

        if (! is_readable($path)) {
            $fallback = base_path('../falken_ziex_ze320_variants.csv');
            if (is_readable($fallback)) {
                $path = $fallback;
            } else {
                $this->error("CSV not readable: {$path}");

                return self::FAILURE;
            }
        }

        $brandId = Brand::query()->where('slug', 'falken')->value('id');
        $categoryId = TyreCategory::query()->where('slug', 'car')->value('id');
        if (! $brandId || ! $categoryId) {
            $this->error('Baseline brands/categories missing. Run BaselineDataSeeder first.');

            return self::FAILURE;
        }

        $rows = $this->readCsv($path);
        $unique = [];
        foreach ($rows as $row) {
            $key = $row['size_load_speed'];
            $unique[$key] = $row;
        }

        $this->info('Unique variants: '.count($unique).(count($rows) !== count($unique) ? ' (deduped from '.count($rows).' lines)' : ''));

        $dry = (bool) $this->option('dry-run');
        $nextId = (int) TyreSku::query()->max('id') + 1;
        $created = 0;
        $updated = 0;

        foreach ($unique as $row) {
            $parsed = $this->parseSizeLoadSpeed($row['size_load_speed']);
            $existing = TyreSku::query()
                ->where('brand_id', $brandId)
                ->where('model_name', 'Ziex ZE320')
                ->where('width', $parsed['width'])
                ->where('profile', $parsed['profile'])
                ->where('rim', $parsed['rim'])
                ->where('load_index', $parsed['load_index'])
                ->where('speed_rating', $parsed['speed_rating'])
                ->first();

            $slug = $existing?->slug ?? $this->makeSlug($parsed);
            if ($existing === null) {
                $candidate = $slug;
                $suffix = 2;
                while (TyreSku::query()->where('slug', $candidate)->exists()) {
                    $candidate = $slug.'-'.$suffix++;
                }
                $slug = $candidate;
            }

            $id = $existing?->id ?? $nextId++;
            $price = $this->estimatePrice($parsed['rim'], $parsed['width'], $parsed['speed_rating']);
            $stock = strcasecmp((string) ($row['bookable'] ?? ''), 'Yes') === 0 ? 14 : 0;
            $payload = [
                'id' => $id,
                'slug' => $slug,
                'brand_id' => $brandId,
                'tyre_category_id' => $categoryId,
                'model_name' => 'Ziex ZE320',
                'width' => $parsed['width'],
                'profile' => $parsed['profile'],
                'rim' => $parsed['rim'],
                'load_index' => $parsed['load_index'],
                'speed_rating' => $parsed['speed_rating'],
                'is_extra_load' => $parsed['load_index'] >= 100 && $parsed['width'] <= 215,
                'is_run_flat' => false,
                'is_winter' => false,
                'is_all_season' => false,
                'is_ev_rated' => false,
                'is_van' => false,
                'is_4x4' => false,
                'is_available_within_24h' => false,
                'manufacturer_sku' => sprintf(
                    'FAL-ZE320-%d%d-%d-%d%s',
                    $parsed['width'],
                    $parsed['profile'],
                    $parsed['rim'],
                    $parsed['load_index'],
                    $parsed['speed_rating'],
                ),
                'ean' => null,
                'eu_label' => ['fuelEfficiency' => 'C', 'wetGrip' => 'B', 'externalNoise' => 71, 'noiseClass' => 'B'],
                'oe_approvals' => null,
                'video_url' => null,
                'price_per_tyre' => $price,
                'quantity_tiers' => $this->quantityTiers((float) $price),
                'star_rating' => 4.4,
                'review_count' => 50 + (crc32($slug) % 120),
                'stock' => $stock,
                'badges' => [],
                'has_active_offer' => true,
                'voucher_code' => 'FALK4SAVE',
            ];

            if ($dry) {
                $this->line("[dry-run] {$slug} {$row['size_load_speed']}");

                continue;
            }

            $was = $existing !== null;
            TyreSku::query()->updateOrCreate(['id' => $id], $payload);
            $was ? $updated++ : $created++;
        }

        if (! $dry) {
            $this->info("Done. Created: {$created}, updated: {$updated}.");
        }

        return self::SUCCESS;
    }

    /**
     * @return list<array{brand: string, model: string, size_load_speed: string, bookable: string, source_url: string}>
     */
    private function readCsv(string $path): array
    {
        $fh = fopen($path, 'rb');
        if ($fh === false) {
            throw new RuntimeException("Cannot open {$path}");
        }

        $header = fgetcsv($fh);
        if ($header === false || $header[0] === null) {
            fclose($fh);
            throw new RuntimeException('Empty CSV');
        }

        $header = array_map(fn (string $h) => strtolower(trim($h)), $header);
        $out = [];
        while (($data = fgetcsv($fh)) !== false) {
            if (count($data) < 3 || trim((string) ($data[0] ?? '')) === '') {
                continue;
            }
            $row = array_combine($header, array_pad($data, count($header), ''));
            if ($row === false) {
                continue;
            }
            if (strtolower((string) ($row['brand'] ?? '')) !== 'falken') {
                continue;
            }
            $out[] = [
                'brand' => (string) $row['brand'],
                'model' => (string) ($row['model'] ?? ''),
                'size_load_speed' => trim((string) ($row['size_load_speed'] ?? '')),
                'bookable' => (string) ($row['bookable'] ?? ''),
                'source_url' => (string) ($row['source_url'] ?? ''),
            ];
        }

        fclose($fh);

        return $out;
    }

    /**
     * @return array{width: int, profile: int, rim: int, load_index: int, speed_rating: string}
     */
    private function parseSizeLoadSpeed(string $cell): array
    {
        $cell = trim($cell);
        if (! preg_match('#^(\d{3})/(\d{2})R(\d{2})\s+(\d{2,3})([A-Z]{1,2})$#i', $cell, $m)) {
            throw new RuntimeException("Bad size cell: {$cell}");
        }

        return [
            'width' => (int) $m[1],
            'profile' => (int) $m[2],
            'rim' => (int) $m[3],
            'load_index' => (int) $m[4],
            'speed_rating' => strtoupper($m[5]),
        ];
    }

    /**
     * @param  array{width: int, profile: int, rim: int, load_index: int, speed_rating: string}  $p
     */
    private function makeSlug(array $p): string
    {
        $speed = strtolower($p['speed_rating']);

        return Str::slug("falken ziex ze320 {$p['width']} {$p['profile']} r{$p['rim']} {$p['load_index']}{$speed}", '-');
    }

    private function estimatePrice(int $rim, int $width, string $speedRating): string
    {
        $base = match ($rim) {
            15 => 59,
            16 => 71,
            17 => 88,
            18 => 104,
            19 => 118,
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
        $price = max(47, min(179, $base + $widthAdj + $speedAdj));

        return (string) $price;
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
}
