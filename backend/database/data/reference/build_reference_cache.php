<?php

declare(strict_types=1);

/**
 * Build {brand}.json via r.jina.ai reader proxy (direct eghamtyres.co.uk returns 403 locally).
 *
 * Usage: php build_reference_cache.php falken
 */

$brands = [
    'falken' => ['path' => '/tyre/brand/1247/falken-tyres', 'section' => '## All Falken tyres', 'prefix' => 'Falken'],
    'continental' => ['path' => '/tyre/brand/1231/continental-tyres', 'section' => '## All Continental tyres', 'prefix' => 'Continental'],
    'bridgestone' => ['path' => '/tyre/brand/1223/bridgestone', 'section' => '## All Bridgestone tyres', 'prefix' => 'Bridgestone'],
    'dunlop' => ['path' => '/tyre/brand/1243/dunlop', 'section' => '## All Dunlop tyres', 'prefix' => 'Dunlop'],
    'goodyear' => ['path' => '/tyre/brand/1258/goodyear', 'section' => '## All Goodyear tyres', 'prefix' => 'Goodyear'],
    'michelin' => ['path' => '/tyre/brand/1272/michelin', 'section' => '## All Michelin tyres', 'prefix' => 'Michelin'],
    'pirelli' => ['path' => '/tyre/brand/1293/pirelli', 'section' => '## All Pirelli tyres', 'prefix' => 'Pirelli'],
];

$brandSlug = $argv[1] ?? '';
if (! isset($brands[$brandSlug])) {
    fwrite(STDERR, "Usage: php build_reference_cache.php <".implode('|', array_keys($brands)).">\n");
    exit(1);
}

$cfg = $brands[$brandSlug];
$outFile = __DIR__."/{$brandSlug}.json";
$base = 'https://www.eghamtyres.co.uk';

$ctx = stream_context_create([
    'http' => [
        'header' => "User-Agent: Mozilla/5.0 (compatible; ReferenceCache/1)\r\nAccept: text/plain\r\n",
        'timeout' => 180,
    ],
    'ssl' => [
        'verify_peer' => true,
        'verify_peer_name' => true,
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
    fwrite(STDERR, "Fetch failed: {$targetUrl}\n");

    return '';
}

function size_from_label(string $label): ?string
{
    $patterns = [
        '~\d{3}/\d{2}R\d{2}\s+\d{2,3}[A-Z]{1,2}~',
        '~\d{3}/\d{2}R\d{2}\s+\d{2,3}/\d{2,3}[A-Z]{1,2}~',
        '~\d{2}/\d{2}\.\d{2}R\d{2}\s+\d{2,3}/\d{2,3}[A-Z]{1,2}~',
        '~\d{2}/\d{2}\.\d{2}R\d{2}\s+\d{2,3}[A-Z]{1,2}~',
        '~\d{3}/\d{2}R\d{2}\s+[\d/]+[A-Z]{1,2}~',
    ];
    foreach ($patterns as $re) {
        if (preg_match($re, $label, $m)) {
            return $m[0];
        }
    }

    return null;
}

$brandMd = fetch_via_jina($base.$cfg['path'], $ctx);
if ($brandMd === '') {
    exit(1);
}

$sectionNeedle = str_replace('## ', '', $cfg['section']);
$sectionPos = stripos($brandMd, $sectionNeedle);
if ($sectionPos !== false) {
    $brandMd = substr($brandMd, $sectionPos);
}

$prefix = preg_quote($cfg['prefix'], '~');
$models = [];

if (preg_match_all(
    "~\\[View\\s+{$prefix}\\s+([^\\]]+?)\\s+Tyres\\]\\((?:https://www\\.eghamtyres\\.co\\.uk)?/tyre/details/{$brandSlug}/([a-z0-9.\\-]+)\\)[\\s\\S]{0,500}?Prices from £([\\d.]+)~iu",
    $brandMd,
    $am,
    PREG_SET_ORDER
)) {
    foreach ($am as $row) {
        $slug = $row[2];
        $models[$slug] = [
            'model_slug' => $slug,
            'model_name' => trim(html_entity_decode($row[1], ENT_QUOTES | ENT_HTML5, 'UTF-8')),
            'price_from' => (float) $row[3],
            'variants' => [],
        ];
    }
}

if ($models === []) {
    if (preg_match_all(
        "~###\\s+([^\\n]+)\\n[\\s\\S]*?(?:https://www\\.eghamtyres\\.co\\.uk)?/tyre/details/{$brandSlug}/([a-z0-9.\\-]+)[\\s\\S]{0,400}?Prices from £([\\d.]+)~iu",
        $brandMd,
        $bm,
        PREG_SET_ORDER
    )) {
        foreach ($bm as $row) {
            $slug = $row[2];
            if (isset($models[$slug])) {
                continue;
            }
            $models[$slug] = [
                'model_slug' => $slug,
                'model_name' => trim(html_entity_decode($row[1], ENT_QUOTES | ENT_HTML5, 'UTF-8')),
                'price_from' => (float) $row[3],
                'variants' => [],
            ];
        }
    }
}

if ($models === []) {
    if (preg_match_all(
        "~(?:https://www\\.eghamtyres\\.co\\.uk)?/tyre/details/{$brandSlug}/([a-z0-9.\\-]+)~i",
        $brandMd,
        $slugs,
    )) {
        foreach (array_unique($slugs[1]) as $slug) {
            $models[$slug] = [
                'model_slug' => $slug,
                'model_name' => ucwords(str_replace(['-', '.'], [' ', '.'], $slug)),
                'price_from' => null,
                'variants' => [],
            ];
        }
    }
}

if ($models === []) {
    fwrite(STDERR, "Could not parse models from brand page\n");
    exit(1);
}

$linkRe = '~\[([^\]]*)\]\(https://www\.eghamtyres\.co\.uk/tyresearch/details/(\d+)/([^)]+)\)~u';

foreach ($models as $slug => &$meta) {
    $target = $base."/tyre/details/{$brandSlug}/{$slug}";
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
        $id = (int) $row[2];
        $refSlug = $row[3];
        $size = size_from_label($label);
        if ($size === null) {
            continue;
        }
        $byId[$id] = [
            'reference_id' => $id,
            'reference_slug' => $refSlug,
            'label' => $label,
            'size_load_speed' => $size,
        ];
    }
    $variants = array_values($byId);
    usort($variants, fn ($a, $b) => $a['reference_id'] <=> $b['reference_id']);
    $meta['variants'] = $variants;
}
unset($meta);

foreach ($models as $slug => &$meta) {
    if ($meta['variants'] !== []) {
        continue;
    }
    $target = $base."/tyre/details/{$brandSlug}/{$slug}";
    $md = fetch_via_jina($target, $ctx, 8);
    if ($md === '' || ! preg_match_all($linkRe, $md, $vm, PREG_SET_ORDER)) {
        continue;
    }
    $byId = [];
    foreach ($vm as $row) {
        $label = trim(html_entity_decode($row[1], ENT_QUOTES | ENT_HTML5, 'UTF-8'));
        if ($label === '' || strcasecmp($label, 'View') === 0) {
            continue;
        }
        $id = (int) $row[2];
        $refSlug = $row[3];
        $size = size_from_label($label);
        if ($size === null) {
            continue;
        }
        $byId[$id] = [
            'reference_id' => $id,
            'reference_slug' => $refSlug,
            'label' => $label,
            'size_load_speed' => $size,
        ];
    }
    $variants = array_values($byId);
    usort($variants, fn ($a, $b) => $a['reference_id'] <=> $b['reference_id']);
    $meta['variants'] = $variants;
    usleep(800000);
}
unset($meta);

$payload = [
    'brand_slug' => $brandSlug,
    'models' => array_values($models),
];

file_put_contents($outFile, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)."\n");

$totalVariants = array_sum(array_map(fn ($m) => count($m['variants']), $models));
echo "brand={$brandSlug} models=".count($models)." variants={$totalVariants} file={$outFile}\n";
