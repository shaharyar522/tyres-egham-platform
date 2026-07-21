<?php

$key = '935671c6-1143-4e07-9273-758f9af19493';
$vrm = $argv[1] ?? 'AUK024';

$packages = ['vehicledata', 'tyredatalite', 'TyreDataLite', 'VehicleData'];

foreach ($packages as $package) {
    $url = "https://uk1.ukvehicledata.co.uk/api/datapackage/{$package}?v=2&api_nullitems=1&key_vrm=".rawurlencode($vrm);
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_HTTPHEADER => [
            'Authorization: ukvd-ipwhitelist '.$key,
            'Accept: application/json',
        ],
    ]);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "=== {$package} HTTP {$code} ===\n";
    echo substr((string) $body, 0, 500)."\n\n";
}
