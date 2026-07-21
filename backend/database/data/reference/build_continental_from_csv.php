<?php

declare(strict_types=1);

/**
 * Build continental.json using existing brand CSV + per-model detail pages via jina.ai.
 *
 * Run: php build_continental_from_csv.php
 */

$csv = dirname(__DIR__).'/continental_tyres_brand_1231.csv';
$outFile = __DIR__.'/continental.json';
$base = 'https://www.eghamtyres.co.uk';

$ctx = stream_context_create([
    'http' => [
        'header' => "User-Agent: Mozilla/5.0 (compatible; ReferenceCache/1)\r\nAccept: text/plain\r\n",
        'timeout' => 180,
    ],
]);

function fetch_via_jina(string $targetUrl, $ctx, int $retries = 5): string
{
    $reader = 'https://r.jina.ai/'.$targetUrl;
    for ($attempt = 0; $attempt < $retries; $attempt++) {
        $html = @file_get_contents($reader, false, $ctx);
        if ($html !== false && strlen($html) > 400) {
            return $html;
        }
        sleep(2 + $attempt * 2);
    }

    return '';
}

function size_from_label(string $label): ?string
{
    $patterns = [
        '~\d{3}/\d{2}R\d{2}\s+\d{2,3}(?:/\d{2,3})?[A-Z]{1,2}~',
        '~\d{2}/\d{2}\.\d{2}R\d{2}\s+\d{2,3}(?:/\d{2,3})?[A-Z]{1,2}~',
    ];
    foreach ($patterns as $re) {
        if (preg_match($re, $label, $m)) {
            return $m[0];
        }
    }

    return null;
}

$fh = fopen($csv, 'rb');
$header = array_map('strtolower', array_map('trim', fgetcsv($fh) ?: []));
$models = [];

while (($row = fgetcsv($fh)) !== false) {
    $assoc = array_combine($header, array_pad($row, count($header), ''));
    if ($assoc === false) {
        continue;
    }
    $path = trim((string) ($assoc['detail_path'] ?? ''));
    if (! preg_match('#/tyre/details/continental/([a-z0-9.\-]+)$#i', $path, $m)) {
        continue;
    }
    $slug = $m[1];
    $models[$slug] = [
        'model_slug' => $slug,
        'model_name' => trim((string) ($assoc['model_name'] ?? '')),
        'price_from' => ($p = trim((string) ($assoc['price_from_gbp'] ?? ''))) !== '' ? (float) $p : null,
        'variants' => [],
    ];
}
fclose($fh);

$linkRe = '~\[([^\]]*)\]\((?:https://www\.eghamtyres\.co\.uk)?/tyresearch/details/(\d+)/([^)]+)\)~u';

foreach ($models as $slug => &$meta) {
    $target = $base.'/tyre/details/continental/'.$slug;
    $md = fetch_via_jina($target, $ctx);
    usleep(500000);
    if ($md === '' || ! preg_match_all($linkRe, $md, $vm, PREG_SET_ORDER)) {
        continue;
    }
    $byId = [];
    foreach ($vm as $row) {
        $label = trim(html_entity_decode($row[1], ENT_QUOTES | ENT_HTML5, 'UTF-8'));
        if ($label === '' || strcasecmp($label, 'View') === 0) {
            continue;
        }
        $size = size_from_label($label);
        if ($size === null) {
            continue;
        }
        $byId[(int) $row[2]] = [
            'reference_id' => (int) $row[2],
            'reference_slug' => $row[3],
            'label' => $label,
            'size_load_speed' => $size,
        ];
    }
    $meta['variants'] = array_values($byId);
    echo "  {$meta['model_name']}: ".count($meta['variants'])."\n";
}
unset($meta);

$payload = ['brand_slug' => 'continental', 'models' => array_values($models)];
file_put_contents($outFile, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)."\n");

$total = array_sum(array_map(fn ($m) => count($m['variants']), $models));
echo "models=".count($models)." variants={$total} file={$outFile}\n";
