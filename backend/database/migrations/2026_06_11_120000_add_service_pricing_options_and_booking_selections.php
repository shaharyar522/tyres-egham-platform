<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->json('pricing_options')->nullable()->after('upsell_in_basket');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->json('service_selections')->nullable()->after('service_ids');
        });

        $pricingOptions = json_encode([
            'type' => 'distance',
            'options' => [
                [
                    'key' => '5',
                    'label' => '5 miles',
                    'price' => 50,
                    'requiresCustomPrice' => false,
                ],
                [
                    'key' => '10',
                    'label' => '10 miles',
                    'price' => 100,
                    'requiresCustomPrice' => false,
                ],
                [
                    'key' => '20',
                    'label' => '20 miles',
                    'price' => 100,
                    'requiresCustomPrice' => true,
                    'priceHint' => '£100+',
                    'discussionMessage' => 'Price of extra miles will be discussed by our team. Enter the agreed amount below once confirmed.',
                ],
            ],
        ], JSON_THROW_ON_ERROR);

        DB::table('services')->where('id', 2)->update([
            'slug' => 'fixed-in-your-home',
            'name' => 'Fixed in your home',
            'short_description' => 'Mobile tyre fitting at your home — choose a distance band for transparent pricing.',
            'long_description' => 'Our mobile fitter comes to your home to fit or repair tyres on your driveway. Select how far you are from our workshop: 5 miles (£50), 10 miles (£100), or 20 miles (£100+ with any extra mileage agreed with our team before your appointment).',
            'price_from' => 50,
            'is_free' => false,
            'duration_minutes' => 60,
            'icon_name' => 'Home',
            'upsell_in_basket' => true,
            'pricing_options' => $pricingOptions,
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('service_selections');
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('pricing_options');
        });

        DB::table('services')->where('id', 2)->update([
            'slug' => 'wheel-alignment',
            'name' => 'Wheel Alignment',
            'short_description' => '4-wheel laser alignment to manufacturer geometry, extending tyre life and improving handling.',
            'long_description' => 'We perform a full 4-wheel laser alignment using calibrated equipment, comparing each angle against manufacturer specification and adjusting where required.',
            'price_from' => 49,
            'duration_minutes' => 45,
            'icon_name' => 'Crosshair',
            'pricing_options' => null,
            'updated_at' => now(),
        ]);
    }
};
