<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$s = app(App\Services\VehicleDataGlobalService::class);
echo 'enabled=' . ($s->enabled() ? 'yes' : 'no') . PHP_EOL;

$plate = $argv[1] ?? 'AB12CDE';
$r = $s->lookup($plate);
echo 'plate=' . $plate . PHP_EOL;
echo 'status=' . ($r['status'] ?? '?') . PHP_EOL;
echo 'error=' . ($r['errorCode'] ?? '-') . PHP_EOL;
echo 'msg=' . ($r['message'] ?? '-') . PHP_EOL;
echo 'fitments=' . count($r['normalized']['fitments'] ?? []) . PHP_EOL;
echo 'model=' . ($r['normalized']['model'] ?? '-') . PHP_EOL;
echo 'latency=' . ($r['latencyMs'] ?? 0) . 'ms' . PHP_EOL;

if (! empty($r['normalized']['fitments'][0])) {
    echo 'firstFitment=' . json_encode($r['normalized']['fitments'][0]) . PHP_EOL;
}

if (! empty($r['rawResponse']) && is_array($r['rawResponse'])) {
    echo 'rawKeys=' . implode(',', array_keys($r['rawResponse'])) . PHP_EOL;
    $ri = $r['rawResponse']['ResponseInformation'] ?? $r['rawResponse']['responseInformation'] ?? null;
    if ($ri) {
        echo 'respInfo=' . json_encode($ri) . PHP_EOL;
    }
}
