<?php

/**
 * List tyre SKUs with missing or broken images.
 * Usage: php scripts/list-missing-tyre-images.php
 */

use App\Models\TyreSku;
use App\Support\TyreAsset;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$diskRoot = storage_path('app/public');

$skus = TyreSku::query()
    ->with('brand:id,name,slug')
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
        'image_path',
        'is_hidden',
        'stock',
        'price_per_tyre',
    ]);

$rows = [];

foreach ($skus as $sku) {
    $path = is_string($sku->image_path) ? trim($sku->image_path) : '';
    $reason = null;

    if ($path === '') {
        $reason = 'no_image_path';
    } else {
        $absolute = $diskRoot.DIRECTORY_SEPARATOR.str_replace(['/', '\\'], DIRECTORY_SEPARATOR, ltrim($path, '/\\'));
        if (! is_file($absolute)) {
            $reason = 'file_missing';
        }
    }

    if ($reason === null) {
        continue;
    }

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
        'price_per_tyre' => $sku->price_per_tyre,
        'stock' => $sku->stock,
        'is_hidden' => (bool) $sku->is_hidden,
        'image_path' => $path !== '' ? $path : null,
        'image_url' => TyreAsset::url($sku->image_path),
        'reason' => $reason,
        'admin_url' => '/admin/catalogue/tyres/'.$sku->id,
        'storefront_path' => '/tyres/'.$sku->slug,
    ];
}

$summary = [
    'total_skus' => $skus->count(),
    'missing_images' => count($rows),
    'no_image_path' => count(array_filter($rows, fn ($r) => $r['reason'] === 'no_image_path')),
    'file_missing' => count(array_filter($rows, fn ($r) => $r['reason'] === 'file_missing')),
    'hidden_missing' => count(array_filter($rows, fn ($r) => $r['is_hidden'])),
    'visible_missing' => count(array_filter($rows, fn ($r) => ! $r['is_hidden'])),
    'generated_at' => date('c'),
];

$outDir = dirname(__DIR__, 2).DIRECTORY_SEPARATOR.'reports';
if (! is_dir($outDir)) {
    mkdir($outDir, 0775, true);
}

$jsonPath = $outDir.DIRECTORY_SEPARATOR.'missing-tyre-images.json';
$csvPath = $outDir.DIRECTORY_SEPARATOR.'missing-tyre-images.csv';
$mdPath = $outDir.DIRECTORY_SEPARATOR.'missing-tyre-images.md';

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
    'manufacturer_sku',
    'slug',
    'price_per_tyre',
    'stock',
    'is_hidden',
    'reason',
    'image_path',
    'storefront_path',
    'admin_url',
]);
foreach ($rows as $row) {
    fputcsv($fp, [
        $row['id'],
        $row['brand'],
        $row['model'],
        $row['size'],
        $row['manufacturer_sku'],
        $row['slug'],
        $row['price_per_tyre'],
        $row['stock'],
        $row['is_hidden'] ? 'yes' : 'no',
        $row['reason'],
        $row['image_path'],
        $row['storefront_path'],
        $row['admin_url'],
    ]);
}
fclose($fp);

$md = [];
$md[] = '# Products missing images';
$md[] = '';
$md[] = 'Generated: '.$summary['generated_at'];
$md[] = '';
$md[] = '| Metric | Count |';
$md[] = '|---|---:|';
$md[] = '| Total SKUs | '.$summary['total_skus'].' |';
$md[] = '| Missing images | '.$summary['missing_images'].' |';
$md[] = '| No image_path | '.$summary['no_image_path'].' |';
$md[] = '| Path set but file missing | '.$summary['file_missing'].' |';
$md[] = '| Visible missing | '.$summary['visible_missing'].' |';
$md[] = '| Hidden missing | '.$summary['hidden_missing'].' |';
$md[] = '';
$md[] = '| ID | Brand | Model | Size | SKU | Hidden | Reason |';
$md[] = '|---:|---|---|---|---|---|---|';
foreach ($rows as $row) {
    $md[] = sprintf(
        '| %d | %s | %s | %s | %s | %s | %s |',
        $row['id'],
        str_replace('|', '/', (string) $row['brand']),
        str_replace('|', '/', (string) $row['model']),
        str_replace('|', '/', (string) ($row['size'] ?? '')),
        str_replace('|', '/', (string) ($row['manufacturer_sku'] ?? '')),
        $row['is_hidden'] ? 'yes' : 'no',
        $row['reason']
    );
}
file_put_contents($mdPath, implode("\n", $md)."\n");

echo json_encode($summary, JSON_PRETTY_PRINT)."\n";
echo "Wrote:\n- {$jsonPath}\n- {$csvPath}\n- {$mdPath}\n";
