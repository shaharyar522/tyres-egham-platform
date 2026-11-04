<?php

namespace App\Console\Commands;

use App\Models\TyreSku;
use App\Support\TyreAsset;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\Finder\Finder;

class ImportTyreImagesCommand extends Command
{
    protected $signature = 'tyres:import-images
        {--path= : Source folder of tyre images (default: ../tyres-images)}
        {--dry-run : Match and report only, no file or DB writes}';

    protected $description = 'Import tyre product images by matching filename (without extension) to tyre_skus.slug';

    public function handle(): int
    {
        $path = $this->option('path')
            ?: base_path('../tyres-images');
        $path = realpath($path) ?: $path;

        if (! is_dir($path)) {
            $this->error("Source folder not found: {$path}");

            return self::FAILURE;
        }

        $dry = (bool) $this->option('dry-run');
        $disk = Storage::disk('public');
        $disk->makeDirectory('tyres');

        $files = iterator_to_array(
            (new Finder)
                ->files()
                ->in($path)
                ->name('/\.(jpe?g|png|webp|gif)$/i')
                ->sortByName()
        );

        $updated = 0;
        $missing = 0;
        $skipped = 0;

        foreach ($files as $file) {
            $slug = $file->getBasename('.'.$file->getExtension());
            $sku = TyreSku::query()->where('slug', $slug)->first();

            if (! $sku) {
                $this->warn("No SKU for: {$file->getFilename()}");
                $missing++;

                continue;
            }

            $extension = strtolower($file->getExtension());
            $relative = 'tyres/tyre-'.$sku->id.'-'.Str::uuid().'.'.$extension;

            if ($dry) {
                $this->line("[dry-run] {$file->getFilename()} -> {$relative} (sku {$sku->id})");
                $updated++;

                continue;
            }

            TyreAsset::delete($sku->image_path);

            $contents = file_get_contents($file->getRealPath());
            if ($contents === false) {
                $this->error("Could not read: {$file->getFilename()}");
                $skipped++;

                continue;
            }

            $disk->put($relative, $contents);
            $sku->image_path = $relative;
            $sku->save();
            $updated++;
        }

        $this->info(($dry ? '[dry-run] ' : '')."Updated: {$updated}, missing SKU: {$missing}, skipped: {$skipped}, files: ".count($files));

        return $missing > 0 ? self::FAILURE : self::SUCCESS;
    }
}
