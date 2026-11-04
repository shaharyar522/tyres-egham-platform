<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$plate = $argv[1] ?? 'AB12CDE';
$svc = app(App\Services\VehicleLookupService::class);

// Bypass cache for this test by clearing fitments for the plate if present
$normalized = $svc->normalizeRegistration($plate);
$profile = App\Models\VehicleProfile::query()->where('registration', $normalized)->first();
if ($profile) {
    App\Models\FitmentSet::query()->where('vehicle_profile_id', $profile->id)->delete();
    echo "cleared cached fitments for {$normalized}\n";
}

$result = $svc->lookup($plate);
echo 'status=' . ($result['status'] ?? '?') . PHP_EOL;
echo 'code=' . ($result['code'] ?? '-') . PHP_EOL;
echo 'message=' . ($result['message'] ?? '-') . PHP_EOL;

$payload = $result['payload'] ?? $result;
$meta = $payload['matchMeta'] ?? null;
if ($meta) {
    echo 'source=' . ($meta['source'] ?? '-') . PHP_EOL;
    echo 'provider=' . ($meta['provider'] ?? '-') . PHP_EOL;
}
$fitments = $payload['fitments'] ?? [];
echo 'fitments=' . (is_countable($fitments) ? count($fitments) : 0) . PHP_EOL;
if (! empty($fitments[0])) {
    echo 'first=' . json_encode($fitments[0]) . PHP_EOL;
}
