<?php

namespace App\Console\Commands;

use App\Support\ReferenceTyreSiteScraper;
use Illuminate\Console\Command;
class BuildReferenceTyreCacheCommand extends Command
{
    protected $signature = 'tyres:build-reference-cache
        {--brand= : Brand slug to build cache for}
        {--all-brands : Build cache for all supported brands}
        {--from-markdown : Build from database/data/reference/markdown/{brand}/*.md exports}
        {--delay=350 : Milliseconds between HTTP requests}
        {--output= : Output directory (default: database/data/reference)}';

    protected $description = 'Scrape reference site listings into JSON cache files for offline import';

    public function handle(): int
    {
        $allBrands = (bool) $this->option('all-brands');
        $brand = $this->option('brand');

        if (! $allBrands && ! is_string($brand)) {
            $this->error('Specify --brand=falken or --all-brands');

            return self::FAILURE;
        }

        $brandSlugs = $allBrands
            ? array_keys(ReferenceTyreSiteScraper::BRANDS)
            : [strtolower((string) $brand)];

        $outputDir = $this->option('output') ?: database_path('data/reference');
        if (! is_dir($outputDir) && ! mkdir($outputDir, 0755, true) && ! is_dir($outputDir)) {
            $this->error("Cannot create output directory: {$outputDir}");

            return self::FAILURE;
        }

        $delay = max(0, (int) $this->option('delay'));
        $scraper = new ReferenceTyreSiteScraper($delay);

        $fromMarkdown = (bool) $this->option('from-markdown');

        foreach ($brandSlugs as $slug) {
            if (! isset(ReferenceTyreSiteScraper::BRANDS[$slug])) {
                $this->error("Unknown brand: {$slug}");

                return self::FAILURE;
            }

            $this->info("Building cache for {$slug}…");

            if ($fromMarkdown) {
                $payload = $this->buildPayloadFromMarkdown($slug, $scraper);
            } else {
                try {
                    $models = $scraper->fetchBrandModels($slug);
                } catch (\Throwable $e) {
                    $this->warn("Live fetch blocked for {$slug}: {$e->getMessage()}");
                    $this->line('Re-run with --from-markdown after saving page exports under database/data/reference/markdown/{brand}/.');

                    continue;
                }

                $payload = ['brand_slug' => $slug, 'models' => []];

                foreach ($models as $model) {
                    $variants = $scraper->fetchModelVariants($slug, $model['model_slug']);
                    $payload['models'][] = [
                        'model_slug' => $model['model_slug'],
                        'model_name' => $model['model_name'],
                        'price_from' => $model['price_from'],
                        'variants' => $variants,
                    ];
                    $this->line("  {$model['model_name']}: ".count($variants).' sizes');
                }
            }

            $path = rtrim($outputDir, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR."{$slug}.json";
            file_put_contents($path, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            $variantCount = array_sum(array_map(fn (array $m) => count($m['variants']), $payload['models']));
            $this->info("Wrote {$path} ({$variantCount} variants).");
        }

        return self::SUCCESS;
    }

    /**
     * @return array{brand_slug: string, models: list<array{model_slug: string, model_name: string, price_from: ?float, variants: list}>}
     */
    private function buildPayloadFromMarkdown(string $brandSlug, ReferenceTyreSiteScraper $scraper): array
    {
        $dir = database_path("data/reference/markdown/{$brandSlug}");
        if (! is_dir($dir)) {
            throw new \RuntimeException("Markdown directory not found: {$dir}");
        }

        $payload = ['brand_slug' => $brandSlug, 'models' => []];
        $files = glob($dir.'/*.md') ?: [];

        foreach ($files as $file) {
            $modelSlug = pathinfo($file, PATHINFO_FILENAME);
            $content = (string) file_get_contents($file);
            $modelName = $scraper->inferCategorySlug('', $modelSlug); // wrong - use title from file

            if (preg_match('#^#\s+([^\n]+)#m', $content, $titleMatch)) {
                $modelName = preg_replace('/\s+Tyres.*/i', '', $titleMatch[1]) ?? $modelSlug;
                $modelName = preg_replace('/^'.preg_quote(ReferenceTyreSiteScraper::BRANDS[$brandSlug]['name'], '/').'\s+/i', '', $modelName) ?? $modelName;
            } else {
                $modelName = ucwords(str_replace('-', ' ', $modelSlug));
            }

            $priceFrom = null;
            if (preg_match('#Prices from £([\d.]+)#i', $content, $priceMatch)) {
                $priceFrom = (float) $priceMatch[1];
            }

            $variants = $scraper->parseVariantsFromContent($content);
            $payload['models'][] = [
                'model_slug' => $modelSlug,
                'model_name' => trim($modelName),
                'price_from' => $priceFrom,
                'variants' => $variants,
            ];
            $this->line("  {$modelName}: ".count($variants).' sizes (markdown)');
        }

        return $payload;
    }
}
