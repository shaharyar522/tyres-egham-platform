<?php

/**
 * Parse Egham Tyres Continental brand listing HTML into CSV (pattern lines, not every size SKU).
 *
 * Usage:
 *   php scripts/scrape-continental-brand-to-csv.php [--html=path] [--out=path] [--download]
 *
 * Source page: https://www.eghamtyres.co.uk/tyre/brand/1231/continental-tyres
 */

declare(strict_types=1);

$baseDir = dirname(__DIR__);
chdir($baseDir);

$opts = getopt('', ['html::', 'out::', 'download']);

$defaultHtml = $baseDir.'/../continental_brand_page.html';
$htmlPath = $opts['html'] ?? $defaultHtml;
$outPath = $opts['out'] ?? $baseDir.'/../continental_tyres_brand_1231.csv';
$download = array_key_exists('download', $opts);

$brandUrl = 'https://www.eghamtyres.co.uk/tyre/brand/1231/continental-tyres';

if ($download) {
    $ctx = stream_context_create([
        'http' => [
            'header' => "User-Agent: Mozilla/5.0 (compatible; EghmTyresImport/1.0)\r\n",
            'timeout' => 45,
        ],
    ]);
    $raw = @file_get_contents($brandUrl, false, $ctx);
    if ($raw === false) {
        fwrite(STDERR, "Failed to download: {$brandUrl}\n");
        exit(1);
    }
    file_put_contents($htmlPath, $raw);
    fwrite(STDERR, "Saved HTML to {$htmlPath}\n");
}

if (! is_readable($htmlPath)) {
    fwrite(STDERR, "HTML not found: {$htmlPath}\nUse --download or save HTML from:\n  {$brandUrl}\n");
    exit(1);
}

$html = file_get_contents($htmlPath);
if ($html === false) {
    fwrite(STDERR, "Cannot read {$htmlPath}\n");
    exit(1);
}

$chunks = preg_split('#<div class="span3 otherTyre brand-pattern">#', $html);
$rows = [];

foreach (array_slice($chunks, 1) as $chunk) {
    if (! preg_match('#<h3 class="ptn-heading-sub product-copy m-t-10">([^<]+)</h3>#', $chunk, $title)) {
        continue;
    }
    $modelName = trim(html_entity_decode($title[1], ENT_QUOTES | ENT_HTML5, 'UTF-8'));

    $rating = '';
    if (preg_match('#<strong class="text-primary text-md">([0-9.]+)</strong><span class="text-md">/5</span>#', $chunk, $r)) {
        $rating = $r[1];
    }

    if (! preg_match('#href="(/tyre/details/continental/[^"]+)"#', $chunk, $u)) {
        continue;
    }
    $detailPath = $u[1];

    if (! preg_match('#<span class="ptn-price-from">Prices from £([0-9.]+)</span>#', $chunk, $p)) {
        continue;
    }
    $priceFrom = $p[1];

    $rows[] = [
        'brand' => 'Continental',
        'model_name' => $modelName,
        'price_from_gbp' => $priceFrom,
        'rating_out_of_5' => $rating,
        'detail_path' => $detailPath,
        'detail_url' => 'https://www.eghamtyres.co.uk'.$detailPath,
        'brand_list_url' => $brandUrl,
    ];
}

$fh = fopen($outPath, 'wb');
if ($fh === false) {
    fwrite(STDERR, "Cannot write {$outPath}\n");
    exit(1);
}

$header = ['brand', 'model_name', 'price_from_gbp', 'rating_out_of_5', 'detail_path', 'detail_url', 'brand_list_url'];
fputcsv($fh, $header);

foreach ($rows as $row) {
    fputcsv($fh, $row);
}

fclose($fh);

fwrite(STDERR, 'Wrote '.count($rows)." rows to {$outPath}\n");
