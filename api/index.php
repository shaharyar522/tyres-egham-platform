<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

$backendPath = realpath(__DIR__ . '/../backend');

if ($backendPath === false) {
    http_response_code(500);
    exit('Backend path could not be resolved. Check deployment path.');
}

if (file_exists($maintenance = $backendPath . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $backendPath . '/vendor/autoload.php';

/*
 * FIX: This gateway sits at public_html/api/index.php.
 * Symfony's Request class strips the script's directory (/api) from REQUEST_URI,
 * so Laravel would see /bootstrap instead of /api/bootstrap — causing 404 on all routes.
 * Overriding SCRIPT_NAME to /index.php makes Symfony treat / as the base,
 * so Laravel correctly receives /api/bootstrap as the full path.
 */
$_SERVER['SCRIPT_NAME']     = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = $backendPath . '/public/index.php';
$_SERVER['PHP_SELF']        = '/index.php';

(require_once $backendPath . '/bootstrap/app.php')
    ->handleRequest(Request::capture());
