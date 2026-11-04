<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$dir = realpath(__DIR__.'/../../reports/tyre-images');
echo "dir={$dir}\n";

$files = [];
foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir)) as $f) {
    if (! $f->isFile()) {
        continue;
    }
    if (! preg_match('/\.(jpe?g|png|webp|gif)$/i', $f->getFilename())) {
        continue;
    }
    $files[] = $f->getFilename();
}

echo 'files='.count($files)."\n";
echo "samples:\n";
foreach (array_slice($files, 0, 15) as $name) {
    echo "  {$name}\n";
}

$with = App\Models\TyreSku::whereNotNull('image_path')->where('image_path', '!=', '')->limit(3)->get(['id', 'slug', 'image_path']);
echo "existing DB samples:\n";
foreach ($with as $s) {
    echo "  id={$s->id} path={$s->image_path} slug={$s->slug}\n";
}

$matched = 0;
$unmatched = [];
foreach ($files as $name) {
    $slug = pathinfo($name, PATHINFO_FILENAME);
    $exists = App\Models\TyreSku::where('slug', $slug)->exists();
    if ($exists) {
        $matched++;
    } else {
        $unmatched[] = $name;
    }
}
echo "match_by_slug={$matched} unmatched=".count($unmatched)."\n";
foreach (array_slice($unmatched, 0, 20) as $u) {
    echo "  NO_MATCH {$u}\n";
}
