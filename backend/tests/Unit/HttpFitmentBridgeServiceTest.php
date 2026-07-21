<?php

namespace Tests\Unit;

use App\Models\VehicleProfile;
use App\Services\Fitment\HttpFitmentBridgeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class HttpFitmentBridgeServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_persists_fitments_from_http_response(): void
    {
        Config::set('services.fitment.http.enabled', true);
        Config::set('services.fitment.http.url', 'https://fitment.test/api/resolve');
        Config::set('services.fitment.http.api_key', 'test-token');
        Config::set('services.fitment.http.timeout', 5);

        Http::fake([
            'https://fitment.test/api/resolve' => Http::response([
                'fitments' => [
                    [
                        'provider_reference' => 'staggered-oe',
                        'fitment_type' => 'oe',
                        'is_primary' => true,
                        'positions' => [
                            ['position' => 'front', 'width' => 225, 'profile' => 45, 'rim' => 18, 'load_index' => 95, 'speed_rating' => 'Y'],
                            ['position' => 'rear', 'width' => 255, 'profile' => 40, 'rim' => 18, 'load_index' => 99, 'speed_rating' => 'Y'],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $profile = VehicleProfile::query()->create([
            'registration' => 'AB12CDE',
            'vehicle_make_id' => null,
            'vehicle_model_id' => null,
            'dvla_make_text' => 'BMW',
            'dvla_model_text' => '3 SERIES',
            'derivative' => '320i M Sport',
            'year_of_manufacture' => 2023,
            'fuel_type' => 'PETROL',
            'body_type' => null,
            'engine_capacity' => 1998,
            'tax_status' => null,
            'mot_status' => null,
            'source' => 'dvla',
            'source_reference' => 'AB12CDE',
            'last_verified_at' => now(),
        ]);

        $service = app(HttpFitmentBridgeService::class);
        $this->assertTrue($service->syncFromRemote($profile, ['make' => 'BMW']));

        $profile->load('fitmentSets.positions');
        $this->assertCount(1, $profile->fitmentSets);
        $this->assertCount(2, $profile->fitmentSets->first()->positions);
        $this->assertTrue($profile->fitmentSets->first()->is_staggered);
    }
}
