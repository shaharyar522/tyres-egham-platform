<?php

namespace App\Console\Commands;

use App\Support\ReferenceTyreSiteScraper;
use App\Support\ReferenceTyreSkuImporter;
use Illuminate\Console\Command;

class ImportReferenceTyreListingsCommand extends Command
{
    protected $signature = 'tyres:import-reference-site
        {--brand= : Brand slug (falken, continental, bridgestone, dunlop, goodyear, michelin, pirelli)}
        {--all-brands : Import all supported brands from eghamtyres.co.uk}
        {--with-prices : Fetch each SKU detail page for live price and EAN (slower)}
        {--from-cache : Import from database/data/reference/{brand}.json instead of live scraping}
        {--cache-dir= : Custom cache directory for --from-cache}
        {--delay=350 : Milliseconds between HTTP requests}
        {--dry-run : Parse only, no database writes}';

    protected $description = 'Import tyre SKU listings from the live reference site (eghamtyres.co.uk)';

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

        foreach ($brandSlugs as $slug) {
            if (! isset(ReferenceTyreSiteScraper::BRANDS[$slug])) {
                $this->error("Unknown brand: {$slug}. Supported: ".implode(', ', array_keys(ReferenceTyreSiteScraper::BRANDS)));

                return self::FAILURE;
            }
        }

        $delay = max(0, (int) $this->option('delay'));
        $scraper = new ReferenceTyreSiteScraper($delay);
        $importer = new ReferenceTyreSkuImporter($scraper);
        $dryRun = (bool) $this->option('dry-run');
        $withPrices = (bool) $this->option('with-prices');
        $fromCache = (bool) $this->option('from-cache');
        $cacheDir = $this->option('cache-dir') ?: null;

        $totalCreated = 0;
        $totalUpdated = 0;
        $totalSkipped = 0;
        $totalVariants = 0;

        foreach ($brandSlugs as $slug) {
            $this->info("Importing brand: {$slug}".($dryRun ? ' (dry-run)' : ''));

            try {
                $stats = $fromCache
                    ? $importer->importBrandFromCache($slug, $dryRun, is_string($cacheDir) ? $cacheDir : null, fn (string $line) => $this->line($line))
                    : $importer->importBrand(
                        $slug,
                        $withPrices,
                        $dryRun,
                        fn (string $line) => $this->line($line),
                    );
            } catch (\Throwable $e) {
                $this->error("{$slug} failed: {$e->getMessage()}");

                return self::FAILURE;
            }

            $totalCreated += $stats['created'];
            $totalUpdated += $stats['updated'];
            $totalSkipped += $stats['skipped'];
            $totalVariants += $stats['variants'];

            $this->info(sprintf(
                '%s: %d models, %d variants — created %d, updated %d',
                $slug,
                $stats['models'],
                $stats['variants'],
                $stats['created'],
                $stats['updated'],
            ));
        }

        $this->newLine();
        $this->info("Finished. Variants scanned: {$totalVariants}. Created: {$totalCreated}, updated: {$totalUpdated}.");

        return self::SUCCESS;
    }
}
