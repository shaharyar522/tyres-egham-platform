<?php

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$key = config('services.uk_vehicle_data.api_key');
$package = config('services.uk_vehicle_data.package', 'TyreDataLite');
$vrm = $argv[1] ?? 'AUK024';

echo "Key: {$key}\n";
echo "Package: {$package}\n";
echo "VRM: {$vrm}\n\n";

$attempts = [
    'laravel_http' => function () use ($key, $package, $vrm) {
        return Illuminate\Support\Facades\Http::timeout(20)
            ->acceptJson()
            ->withHeaders(['Authorization' => 'ukvd-ipwhitelist '.$key])
            ->get(rtrim(config('services.uk_vehicle_data.base_url'), '/').'/'.$package, [
                'v' => 2,
                'api_nullitems' => 1,
                'auth_apikey' => $key,
                'key_VRM' => $vrm,
            ]);
    },
    'full_url' => function () use ($key, $package, $vrm) {
        $url = sprintf(
            'https://uk1.ukvehicledata.co.uk/api/datapackage/%s?v=2&api_nullitems=1&auth_apikey=%s&key_VRM=%s',
            rawurlencode($package),
            rawurlencode($key),
            rawurlencode($vrm),
        );

        return Illuminate\Support\Facades\Http::timeout(20)->acceptJson()->get($url);
    },
    'service' => function () use ($vrm) {
        return app(App\Services\UkVehicleDataService::class)->lookup($vrm);
    },
];

foreach ($attempts as $label => $callback) {
    echo "=== {$label} ===\n";
    $result = $callback();
    if ($result instanceof Illuminate\Http\Client\Response) {
        echo 'HTTP '.$result->status()."\n";
        echo substr($result->body(), 0, 600)."\n\n";
        continue;
    }

    echo json_encode($result, JSON_PRETTY_PRINT)."\n\n";
}
