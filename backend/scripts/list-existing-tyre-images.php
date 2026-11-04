<?php

/**
 * List SKUs that already had images (not in the newly imported set).
 * Usage: php scripts/list-existing-tyre-images.php
 */

use App\Models\TyreSku;
use App\Support\TyreAsset;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$newDir = realpath(__DIR__.'/../../reports/tyre-images');
$newSlugs = [];

if ($newDir && is_dir($newDir)) {
    foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($newDir)) as $f) {
        if (! $f->isFile()) {
            continue;
        }
        if (! preg_match('/\.(jpe?g|png|webp|gif)$/i', $f->getFilename())) {
            continue;
        }
        $newSlugs[strtolower(pathinfo($f->getFilename(), PATHINFO_FILENAME))] = true;
    }
}

$diskRoot = storage_path('app/public');

$skus = TyreSku::query()
    ->with('brand:id,name,slug')
    ->whereNotNull('image_path')
    ->where('image_path', '!=', '')
    ->orderBy('id')
    ->get([
        'id',
        'slug',
        'brand_id',
        'model_name',
        'manufacturer_sku',
        'width',
        'profile',
        'rim',
        'load_index',
        'speed_rating',
        'image_path',
        'is_hidden',
        'stock',
        'price_per_tyre',
        'updated_at',
    ]);

$rows = [];

foreach ($skus as $sku) {
    if (isset($newSlugs[strtolower($sku->slug)])) {
        continue; // newly imported set
    }

    $path = trim((string) $sku->image_path);
    $absolute = $diskRoot.DIRECTORY_SEPARATOR.str_replace(['/', '\\'], DIRECTORY_SEPARATOR, ltrim($path, '/\\'));
    $fileExists = is_file($absolute);
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));

    $size = trim(implode('/', array_filter([
        $sku->width !== null ? (string) $sku->width : null,
        $sku->profile !== null ? (string) $sku->profile : null,
        $sku->rim !== null ? (string) $sku->rim : null,
    ], fn ($v) => $v !== null && $v !== '')), '/');

    $rows[] = [
        'id' => $sku->id,
        'slug' => $sku->slug,
        'brand' => $sku->brand?->name,
        'model' => $sku->model_name,
        'manufacturer_sku' => $sku->manufacturer_sku,
        'size' => $size !== '' ? $size : null,
        'load_index' => $sku->load_index,
        'speed_rating' => $sku->speed_rating,
        'price_per_tyre' => $sku->price_per_tyre,
        'stock' => $sku->stock,
        'is_hidden' => (bool) $sku->is_hidden,
        'image_path' => $path,
        'image_url' => TyreAsset::url($sku->image_path),
        'image_extension' => $ext,
        'file_exists' => $fileExists,
        'suggested_filename' => $sku->slug.'.png',
        'admin_url' => '/admin/catalogue/tyres/'.$sku->id,
        'storefront_path' => '/tyres/'.$sku->slug,
        'updated_at' => optional($sku->updated_at)?->toIso8601String(),
    ];
}

$byBrand = [];
foreach ($rows as $row) {
    $b = $row['brand'] ?? 'Unknown';
    $byBrand[$b] = ($byBrand[$b] ?? 0) + 1;
}
arsort($byBrand);

$summary = [
    'total_skus' => TyreSku::count(),
    'newly_imported_slugs' => count($newSlugs),
    'old_images_to_replace' => count($rows),
    'file_missing' => count(array_filter($rows, fn ($r) => ! $r['file_exists'])),
    'hidden' => count(array_filter($rows, fn ($r) => $r['is_hidden'])),
    'by_brand' => $byBrand,
    'generated_at' => date('c'),
    'note' => 'These SKUs already had image_path set and were NOT part of the 517 newly imported from reports/tyre-images. Provide replacement images named {slug}.png (or .jpg/.webp) then run: php artisan tyres:import-images --path=...',
];

$outDir = dirname(__DIR__, 2).DIRECTORY_SEPARATOR.'reports';
if (! is_dir($outDir)) {
    mkdir($outDir, 0775, true);
}

$jsonPath = $outDir.DIRECTORY_SEPARATOR.'old-tyre-images-to-replace.json';
$csvPath = $outDir.DIRECTORY_SEPARATOR.'old-tyre-images-to-replace.csv';
$mdPath = $outDir.DIRECTORY_SEPARATOR.'old-tyre-images-to-replace.md';
$slugsPath = $outDir.DIRECTORY_SEPARATOR.'old-tyre-images-to-replace-slugs.txt';

file_put_contents($jsonPath, json_encode([
    'summary' => $summary,
    'products' => $rows,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

$fp = fopen($csvPath, 'w');
fputcsv($fp, [
    'id',
    'brand',
    'model',
    'size',
    'load_index',
    'speed_rating',
    'manufacturer_sku',
    'slug',
    'suggested_filename',
    'price_per_tyre',
    'stock',
    'is_hidden',
    'current_image_path',
    'image_extension',
    'file_exists',
    'storefront_path',
    'admin_url',
]);
foreach ($rows as $row) {
    fputcsv($fp, [
        $row['id'],
        $row['brand'],
        $row['model'],
        $row['size'],
        $row['load_index'],
        $row['speed_rating'],
        $row['manufacturer_sku'],
        $row['slug'],
        $row['suggested_filename'],
        $row['price_per_tyre'],
        $row['stock'],
        $row['is_hidden'] ? 'yes' : 'no',
        $row['image_path'],
        $row['image_extension'],
        $row['file_exists'] ? 'yes' : 'no',
        $row['storefront_path'],
        $row['admin_url'],
    ]);
}
fclose($fp);

file_put_contents(
    $slugsPath,
    implode("\n", array_map(fn ($r) => $r['slug'], $rows))."\n"
);

$md = [];
$md[] = '# Tyres with old images to replace';
$md[] = '';
$md[] = 'Generated: '.$summary['generated_at'];
$md[] = '';
$md[] = 'These '.$summary['old_images_to_replace'].' products already had images (not part of the 517 newly imported).';
$md[] = '';
$md[] = '| Metric | Count |';
$md[] = '|---|---:|';
$md[] = '| Total SKUs | '.$summary['total_skus'].' |';
$md[] = '| Newly imported (keep) | '.$summary['newly_imported_slugs'].' |';
$md[] = '| Old images to replace | '.$summary['old_images_to_replace'].' |';
$md[] = '';
$md[] = '## By brand';
$md[] = '';
$md[] = '| Brand | Count |';
$md[] = '|---|---:|';
foreach ($byBrand as $brand => $count) {
    $md[] = '| '.str_replace('|', '/', $brand).' | '.$count.' |';
}
$md[] = '';
$md[] = '## Products';
$md[] = '';
$md[] = '| ID | Brand | Model | Size | SKU | Suggested filename |';
$md[] = '|---:|---|---|---|---|---|';
foreach ($rows as $row) {
    $md[] = sprintf(
        '| %d | %s | %s | %s | %s | %s |',
        $row['id'],
        str_replace('|', '/', (string) $row['brand']),
        str_replace('|', '/', (string) $row['model']),
        str_replace('|', '/', (string) ($row['size'] ?? '')),
        str_replace('|', '/', (string) ($row['manufacturer_sku'] ?? '')),
        $row['suggested_filename']
    );
}
file_put_contents($mdPath, implode("\n", $md)."\n");

echo json_encode([
    'old_images_to_replace' => $summary['old_images_to_replace'],
    'newly_imported_slugs' => $summary['newly_imported_slugs'],
    'by_brand' => $byBrand,
    'files' => [$csvPath, $jsonPath, $mdPath, $slugsPath],
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)."\n";
