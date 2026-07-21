<?php

namespace App\Support;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class ReferenceTyreSiteScraper
{
    public const BASE_URL = 'https://www.eghamtyres.co.uk';

    /** @var array<string, array{path: string, name: string}> */
    public const BRANDS = [
        'falken' => ['path' => '/tyre/brand/1247/falken-tyres', 'name' => 'Falken'],
        'continental' => ['path' => '/tyre/brand/1231/continental-tyres', 'name' => 'Continental'],
        'bridgestone' => ['path' => '/tyre/brand/1223/bridgestone', 'name' => 'Bridgestone'],
        'dunlop' => ['path' => '/tyre/brand/1243/dunlop', 'name' => 'Dunlop'],
        'goodyear' => ['path' => '/tyre/brand/1258/goodyear', 'name' => 'Goodyear'],
        'michelin' => ['path' => '/tyre/brand/1272/michelin', 'name' => 'Michelin'],
        'pirelli' => ['path' => '/tyre/brand/1293/pirelli', 'name' => 'Pirelli'],
    ];

    public function __construct(
        private readonly int $delayMs = 350,
    ) {}

    /**
     * @return list<array{brand_slug: string, model_slug: string, model_name: string, detail_path: string, price_from: ?float}>
     */
    public function fetchBrandModels(string $brandSlug): array
    {
        $brand = self::BRANDS[$brandSlug] ?? null;
        if ($brand === null) {
            throw new RuntimeException("Unknown brand slug: {$brandSlug}");
        }

        $html = $this->fetch(self::BASE_URL.$brand['path']);
        $models = [];

        if (preg_match_all(
            '#\[View\s+([^]]+?)\s+Tyres\]\((?:https://www\.eghamtyres\.co\.uk)?/tyre/details/'.preg_quote($brandSlug, '#').'/([a-z0-9.-]+)\)#i',
            $html,
            $mdMatches,
            PREG_SET_ORDER,
        )) {
            foreach ($mdMatches as $match) {
                $modelSlug = $match[2];
                $models[$modelSlug] = [
                    'brand_slug' => $brandSlug,
                    'model_slug' => $modelSlug,
                    'model_name' => $this->normaliseModelName($match[1]),
                    'detail_path' => "/tyre/details/{$brandSlug}/{$modelSlug}",
                    'price_from' => null,
                ];
            }
        }

        if (preg_match_all(
            '#href="(?:https://www\.eghamtyres\.co\.uk)?/tyre/details/'.preg_quote($brandSlug, '#').'/([a-z0-9.-]+)"[^>]*>\s*View\s+([^<]+?)\s+Tyres#i',
            $html,
            $matches,
            PREG_SET_ORDER,
        )) {
            foreach ($matches as $match) {
                $modelSlug = $match[1];
                $modelName = $this->normaliseModelName(html_entity_decode(trim($match[2]), ENT_QUOTES | ENT_HTML5));
                $models[$modelSlug] = [
                    'brand_slug' => $brandSlug,
                    'model_slug' => $modelSlug,
                    'model_name' => $modelName,
                    'detail_path' => "/tyre/details/{$brandSlug}/{$modelSlug}",
                    'price_from' => null,
                ];
            }
        }

        if (preg_match_all(
            '#href="(?:https://www\.eghamtyres\.co\.uk)?/tyre/details/'.preg_quote($brandSlug, '#').'/([a-z0-9.-]+)"#i',
            $html,
            $fallback,
        )) {
            foreach ($fallback[1] as $modelSlug) {
                if (isset($models[$modelSlug])) {
                    continue;
                }
                $models[$modelSlug] = [
                    'brand_slug' => $brandSlug,
                    'model_slug' => $modelSlug,
                    'model_name' => $this->modelNameFromSlug($modelSlug),
                    'detail_path' => "/tyre/details/{$brandSlug}/{$modelSlug}",
                    'price_from' => null,
                ];
            }
        }

        if (preg_match_all(
            '#/tyre/details/'.preg_quote($brandSlug, '#').'/([a-z0-9.-]+)[\s\S]{0,300}?Prices from £([\d.]+)#i',
            $html,
            $priceMatches,
            PREG_SET_ORDER,
        )) {
            foreach ($priceMatches as $priceMatch) {
                $slug = $priceMatch[1];
                if (isset($models[$slug])) {
                    $models[$slug]['price_from'] = (float) $priceMatch[2];
                }
            }
        }

        return array_values($models);
    }

    /**
     * @return list<array{reference_id: int, reference_slug: string, label: string, size_load_speed: string}>
     */
    public function fetchModelVariants(string $brandSlug, string $modelSlug): array
    {
        $path = "/tyre/details/{$brandSlug}/{$modelSlug}";
        $html = $this->fetch(self::BASE_URL.$path);

        return $this->parseVariantsFromContent($html);
    }

    /**
     * @return list<array{reference_id: int, reference_slug: string, label: string, size_load_speed: string}>
     */
    public function parseVariantsFromContent(string $content): array
    {
        $variants = [];

        if (preg_match_all(
            '#href="(?:https://www\.eghamtyres\.co\.uk)?/tyresearch/details/(\d+)/([^"]+)"[^>]*>([^<]+)</#i',
            $content,
            $htmlMatches,
            PREG_SET_ORDER,
        )) {
            foreach ($htmlMatches as $match) {
                $this->pushVariant($variants, (int) $match[1], $match[2], $match[3]);
            }
        }

        if (preg_match_all(
            '#\[([^\]]+)\]\((?:https://www\.eghamtyres\.co\.uk)?/tyresearch/details/(\d+)/([^)]+)\)#i',
            $content,
            $mdMatches,
            PREG_SET_ORDER,
        )) {
            foreach ($mdMatches as $match) {
                $this->pushVariant($variants, (int) $match[2], $match[3], $match[1]);
            }
        }

        return array_values($variants);
    }

    /**
     * @param  array<int, array{reference_id: int, reference_slug: string, label: string, size_load_speed: string}>  $variants
     */
    private function pushVariant(array &$variants, int $refId, string $refSlug, string $label): void
    {
        $label = trim(html_entity_decode(strip_tags($label), ENT_QUOTES | ENT_HTML5));
        $sizeLoadSpeed = $this->extractSizeLoadSpeed($label);
        if ($sizeLoadSpeed === null) {
            return;
        }

        $variants[$refId] = [
            'reference_id' => $refId,
            'reference_slug' => $refSlug,
            'label' => $label,
            'size_load_speed' => $sizeLoadSpeed,
        ];
    }

    /**
     * @return array{
     *   price: ?float,
     *   ean: ?string,
     *   width: ?int,
     *   profile: ?int,
     *   rim: ?int,
     *   load_index: ?int,
     *   speed_rating: ?string,
     *   eu_label: ?array{fuelEfficiency: string, wetGrip: string, externalNoise: int, noiseClass: string}
     * }
     */
    public function fetchSkuDetail(int $referenceId, string $referenceSlug): array
    {
        $html = $this->fetch(self::BASE_URL."/tyresearch/details/{$referenceId}/{$referenceSlug}");

        $price = null;
        if (preg_match('#Fully fitted price per tyre:\s*£\s*([\d.]+)#i', $html, $m)) {
            $price = (float) $m[1];
        } elseif (preg_match('#£\s*([\d.]+)\s*</[^>]+>\s*</[^>]+>\s*<[^>]+>\s*Fully fitted price per tyre#i', $html, $m)) {
            $price = (float) $m[1];
        } elseif (preg_match('#£\s*([\d]{2,3}\.[\d]{2})#', $html, $m)) {
            $price = (float) $m[1];
        }

        $ean = null;
        if (preg_match('#EAN:\s*</[^>]+>\s*</[^>]+>\s*<[^>]+>\s*(\d{8,14})#i', $html, $m)) {
            $ean = $m[1];
        } elseif (preg_match('#EAN[:\s]+(\d{8,14})#i', $html, $m)) {
            $ean = $m[1];
        }

        $dims = [
            'width' => $this->fieldInt($html, 'Width'),
            'profile' => $this->fieldInt($html, 'Profile'),
            'rim' => $this->fieldInt($html, 'Rim'),
            'load_index' => $this->fieldInt($html, 'Load'),
            'speed_rating' => $this->fieldString($html, 'Speed'),
        ];

        $eu = $this->parseEuLabelFromHtml($html);

        return [
            'price' => $price,
            'ean' => $ean,
            'width' => $dims['width'],
            'profile' => $dims['profile'],
            'rim' => $dims['rim'],
            'load_index' => $dims['load_index'],
            'speed_rating' => $dims['speed_rating'] !== null ? strtoupper($dims['speed_rating']) : null,
            'eu_label' => $eu,
        ];
    }

    public function inferCategorySlug(string $modelName, string $modelSlug): string
    {
        $hay = strtolower($modelName.' '.$modelSlug);

        if (preg_match('#\b(winter|snow|ice|wintercontact|winter\s*contact|eurowinter)\b#', $hay)) {
            return 'winter';
        }
        if (preg_match('#\b(all[\s-]?season|allseason|4season|crossclimate)\b#', $hay)) {
            return 'all-season';
        }
        if (preg_match('#\b(van|camper|lt\d|cargos)\b#', $hay)) {
            return 'van';
        }
        if (preg_match('#\b(4x4|suv|wildpeak|terrain|all[\s-]?terrain|at3w|htx)\b#', $hay)) {
            return '4x4';
        }
        if (preg_match('#\b(run[\s-]?flat|rft|ssr|moextended)\b#', $hay)) {
            return 'run-flat';
        }
        if (preg_match('#\b(sport|uhp|pilot sport|p zero|asymmetric|potenza|turanza sport|maxx rt|eagle f1|sc\d|ps\d)\b#', $hay)) {
            return 'high-performance';
        }

        return 'car';
    }

    private function fetch(string $url): string
    {
        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language' => 'en-GB,en;q=0.9',
                'Referer' => self::BASE_URL.'/',
            ])
                ->timeout(45)
                ->retry(2, 500)
                ->get($url);
        } catch (ConnectionException $e) {
            throw new RuntimeException("Failed to fetch {$url}: {$e->getMessage()}", 0, $e);
        }

        if (! $response->successful()) {
            throw new RuntimeException(
                "HTTP {$response->status()} for {$url}. The live site may block server requests — build a cache with tyres:build-reference-cache or place JSON under database/data/reference/.",
            );
        }

        if ($this->delayMs > 0) {
            usleep($this->delayMs * 1000);
        }

        return $response->body();
    }

    /**
     * @return array{brand_slug: string, models: list<array{model_slug: string, model_name: string, price_from: ?float, variants: list<array{reference_id: int, reference_slug: string, label: string, size_load_speed: string}>}>}
     */
    public function loadBrandCache(string $brandSlug, ?string $cacheDir = null): array
    {
        $cacheDir ??= database_path('data/reference');
        $path = rtrim($cacheDir, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR."{$brandSlug}.json";

        if (! is_readable($path)) {
            throw new RuntimeException("Cache file not found: {$path}");
        }

        $decoded = json_decode((string) file_get_contents($path), true);
        if (! is_array($decoded) || ($decoded['brand_slug'] ?? '') !== $brandSlug) {
            throw new RuntimeException("Invalid cache JSON for brand {$brandSlug}: {$path}");
        }

        return $decoded;
    }

    private function fieldInt(string $html, string $label): ?int
    {
        if (preg_match('#'.preg_quote($label, '#').':\s*</[^>]+>\s*</[^>]+>\s*<[^>]+>\s*(\d+)#i', $html, $m)) {
            return (int) $m[1];
        }
        if (preg_match('#'.preg_quote($label, '#').'[:\s]+(\d+)#i', $html, $m)) {
            return (int) $m[1];
        }

        return null;
    }

    private function fieldString(string $html, string $label): ?string
    {
        if (preg_match('#'.preg_quote($label, '#').':\s*</[^>]+>\s*</[^>]+>\s*<[^>]+>\s*([A-Z]{1,2})#i', $html, $m)) {
            return strtoupper($m[1]);
        }
        if (preg_match('#'.preg_quote($label, '#').'[:\s]+([A-Z]{1,2})#i', $html, $m)) {
            return strtoupper($m[1]);
        }

        return null;
    }

    /**
     * @return ?array{fuelEfficiency: string, wetGrip: string, externalNoise: int, noiseClass: string}
     */
    private function parseEuLabelFromHtml(string $html): ?array
    {
        if (preg_match('#Fuel efficiency[^A-Z]*([A-G])\s*Wet grip[^A-Z]*([A-G])\s*(\d{2,3})\s*dB#is', $html, $m)) {
            return [
                'fuelEfficiency' => strtoupper($m[1]),
                'wetGrip' => strtoupper($m[2]),
                'externalNoise' => (int) $m[3],
                'noiseClass' => 'B',
            ];
        }

        return null;
    }

    private function extractSizeLoadSpeed(string $label): ?string
    {
        $patterns = [
            '#(\d{3}/\d{2}R\d{2}\s+\d{2,3}(?:/\d{2,3})?[A-Z]{1,2})#i',
            '#(\d{2}/\d{2}\.\d{2}R\d{2}\s+\d{2,3}(?:/\d{2,3})?[A-Z]{1,2})#i',
        ];
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $label, $m)) {
                return strtoupper(trim($m[1]));
            }
        }

        return null;
    }

    private function normaliseModelName(string $raw): string
    {
        $raw = preg_replace('/\s+/', ' ', trim($raw)) ?? $raw;
        foreach (self::BRANDS as $brand) {
            $prefix = $brand['name'].' ';
            if (str_starts_with($raw, $prefix)) {
                return substr($raw, strlen($prefix));
            }
        }

        return $raw;
    }

    private function modelNameFromSlug(string $slug): string
    {
        $name = str_replace('-', ' ', $slug);

        return ucwords($name);
    }
}
