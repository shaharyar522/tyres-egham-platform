<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'dvla' => [
        'enabled' => env('DVLA_ENABLED', false),
        'api_key' => env('DVLA_API_KEY'),
        'base_url' => env('DVLA_BASE_URL', 'https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1'),
        'timeout' => env('DVLA_TIMEOUT_SECONDS', 10),
        'cache_ttl_hours' => env('DVLA_CACHE_TTL_HOURS', 24),
    ],

    'uk_vehicle_data' => [
        'enabled' => env('UK_VEHICLE_DATA_ENABLED', false),
        'api_key' => env('UK_VEHICLE_DATA_API_KEY'),
        'base_url' => env('UK_VEHICLE_DATA_BASE_URL', 'https://uk1.ukvehicledata.co.uk/api/datapackage'),
        'timeout' => (int) env('UK_VEHICLE_DATA_TIMEOUT_SECONDS', 15),
        'cache_ttl_hours' => env('UK_VEHICLE_DATA_CACHE_TTL_HOURS', 24),
        'package' => env('UK_VEHICLE_DATA_PACKAGE', 'TyreDataLite'),
        'sandbox' => env('UK_VEHICLE_DATA_SANDBOX', false),
    ],

    'fitment' => [
        'provider' => env('FITMENT_PROVIDER', 'database'),
        'cache_ttl_hours' => env('FITMENT_CACHE_TTL_HOURS', 24),
        'http' => [
            'enabled' => env('FITMENT_HTTP_ENABLED', false),
            'url' => env('FITMENT_HTTP_URL'),
            'api_key' => env('FITMENT_HTTP_API_KEY'),
            'timeout' => (int) env('FITMENT_HTTP_TIMEOUT', 15),
        ],
        /*
         * When DVLA succeeds but no fitment exists (no HTTP bridge data, no legacy row),
         * optionally create a single all-round fitment from these dimensions.
         * Use only for demos / staging — not a substitute for a real fitment provider.
         */
        'unresolved_fallback' => [
            'enabled' => env('FITMENT_FALLBACK_ENABLED', false),
            'width' => (int) env('FITMENT_FALLBACK_WIDTH', 0),
            'profile' => (int) env('FITMENT_FALLBACK_PROFILE', 0),
            'rim' => (int) env('FITMENT_FALLBACK_RIM', 0),
            'load_index' => env('FITMENT_FALLBACK_LOAD_INDEX'),
            'speed_rating' => env('FITMENT_FALLBACK_SPEED_RATING', 'V'),
            'tyre_category_slug' => env('FITMENT_FALLBACK_TYRE_CATEGORY_SLUG', 'car'),
        ],
    ],

];
