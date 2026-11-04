<?php

/**
 * Export tyre_skus.image_path so live DB can be updated to match local storage files.
 *
 * Usage (from backend/):
 *   php scripts/export-tyre-image-paths.php
 *
 * Writes:
 *   reports/live-tyre-image-paths.sql
 *   reports/live-tyre-image-paths.csv
 */

use App\Models\TyreSku;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$diskRoot = storage_path('app/public');

$rows = TyreSku::query()
    ->whereNotNull('image_path')
    ->where('image_path', '!=', '')
    ->orderBy('id')
    ->get(['id', 'slug', 'image_path']);

$outDir = dirname(__DIR__, 2).DIRECTORY_SEPARATOR.'reports';
if (! is_dir($outDir)) {
    mkdir($outDir, 0775, true);
}

$sqlPath = $outDir.DIRECTORY_SEPARATOR.'live-tyre-image-paths.sql';
$csvPath = $outDir.DIRECTORY_SEPARATOR.'live-tyre-image-paths.csv';

$sql = [];
$sql[] = '-- Update live tyre_skus.image_path to match local storage filenames';
$sql[] = '-- Generated: '.date('c');
$sql[] = '-- Safe: only updates rows where the slug exists on live';
$sql[] = 'SET NAMES utf8mb4;';
$sql[] = 'START TRANSACTION;';
$sql[] = '';

$missingFiles = 0;
$fp = fopen($csvPath, 'w');
fputcsv($fp, ['id', 'slug', 'image_path', 'file_exists']);

foreach ($rows as $sku) {
    $path = str_replace('\\', '/', trim((string) $sku->image_path));
    $absolute = $diskRoot.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, ltrim($path, '/'));
    $exists = is_file($absolute);
    if (! $exists) {
        $missingFiles++;
    }

    fputcsv($fp, [$sku->id, $sku->slug, $path, $exists ? 'yes' : 'no']);

    $escapedPath = addslashes($path);
    $escapedSlug = addslashes($sku->slug);

    // Prefer slug match so live IDs can differ; also set by id when both match.
    $sql[] = "UPDATE `tyre_skus` SET `image_path` = '{$escapedPath}', `updated_at` = NOW() WHERE `slug` = '{$escapedSlug}';";
}

fclose($fp);

$sql[] = '';
$sql[] = 'COMMIT;';
$sql[] = '';
$sql[] = '-- Rows exported: '.$rows->count();
$sql[] = '-- Local files missing: '.$missingFiles;

file_put_contents($sqlPath, implode("\n", $sql)."\n");

echo "Exported {$rows->count()} image paths\n";
echo "Missing local files: {$missingFiles}\n";
echo "SQL: {$sqlPath}\n";
echo "CSV: {$csvPath}\n";
