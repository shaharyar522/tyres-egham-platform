<?php

namespace App\Console\Commands;

use App\Models\Brand;
use App\Models\TyrePatternListing;
use Illuminate\Console\Command;

class SyncContinentalPatternCsvCommand extends Command
{
    protected $signature = 'tyres:sync-continental-pattern-csv
        {--path= : Absolute path to continental_tyres_brand_1231.csv}
        {--force : Re-apply every row even when row checksum unchanged}';

    protected $description = 'Upsert Continental brand-page pattern rows from CSV into tyre_pattern_listings';

    public function handle(): int
    {
        $path = $this->option('path')
            ?: base_path('../continental_tyres_brand_1231.csv');

        if (! is_readable($path)) {
            $alt = database_path('data/continental_tyres_brand_1231.csv');
            if (is_readable($alt)) {
                $path = $alt;
            } else {
                $this->error("CSV not readable: {$path}");

                return self::FAILURE;
            }
        }

        $brandId = Brand::query()->where('slug', 'continental')->value('id');
        if (! $brandId) {
            $this->error('Continental brand missing. Run BaselineDataSeeder first.');

            return self::FAILURE;
        }

        $fileHash = md5_file($path);
        if ($fileHash === false) {
            $this->error('Could not hash CSV file.');

            return self::FAILURE;
        }

        $force = (bool) $this->option('force');

        $fh = fopen($path, 'rb');
        if ($fh === false) {
            $this->error("Cannot open {$path}");

            return self::FAILURE;
        }

        $header = fgetcsv($fh);
        if ($header === false) {
            fclose($fh);
            $this->error('Empty CSV');

            return self::FAILURE;
        }

        $header = array_map(fn (string $h) => strtolower(trim($h)), $header);
        $created = 0;
        $updated = 0;
        $skipped = 0;

        while (($row = fgetcsv($fh)) !== false) {
            if (count($row) < 6 || trim((string) ($row[0] ?? '')) === '') {
                continue;
            }

            $assoc = array_combine($header, array_pad($row, count($header), ''));
            if ($assoc === false) {
                continue;
            }

            $patternKey = trim((string) ($assoc['detail_path'] ?? ''));
            if ($patternKey === '' || ! str_starts_with($patternKey, '/tyre/details/')) {
                continue;
            }

            $modelName = trim((string) ($assoc['model_name'] ?? ''), " \t\n\r\0\x0B\"");
            $price = (float) ($assoc['price_from_gbp'] ?? 0);
            $ratingRaw = trim((string) ($assoc['rating_out_of_5'] ?? ''));
            $rating = $ratingRaw !== '' ? (float) $ratingRaw : null;
            $detailUrl = trim((string) ($assoc['detail_url'] ?? ''));
            $brandListUrl = trim((string) ($assoc['brand_list_url'] ?? '')) ?: null;

            $rowChecksum = md5(implode('|', [$patternKey, $modelName, (string) $price, (string) $rating, $detailUrl]));

            $existing = TyrePatternListing::query()->where('pattern_key', $patternKey)->first();

            if (! $force && $existing && $existing->source_row_checksum === $rowChecksum) {
                $skipped++;

                continue;
            }

            $wasExisting = $existing !== null;

            TyrePatternListing::query()->updateOrCreate(
                ['pattern_key' => $patternKey],
                [
                    'brand_id' => $brandId,
                    'model_name' => $modelName,
                    'price_from_gbp' => $price,
                    'rating_out_of_5' => $rating,
                    'detail_url' => $detailUrl,
                    'brand_list_url' => $brandListUrl,
                    'source_row_checksum' => $rowChecksum,
                    'source_file_checksum' => $fileHash,
                    'synced_at' => now(),
                ],
            );

            $wasExisting ? $updated++ : $created++;
        }

        fclose($fh);

        $this->info("Synced from {$path}");
        $this->info("File checksum: {$fileHash}");
        $this->info("Created: {$created}, updated: {$updated}, skipped (unchanged rows): {$skipped}");

        return self::SUCCESS;
    }
}
