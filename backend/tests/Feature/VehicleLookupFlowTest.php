<?php

namespace Tests\Feature;

use App\Services\DvlaVehicleEnquiryService;
use Database\Seeders\BaselineDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VehicleLookupFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.uk_vehicle_data.enabled' => false]);
        $this->seed(BaselineDataSeeder::class);
    }

    public function test_vehicle_lookup_returns_layered_fitments_for_seeded_registration(): void
    {
        $response = $this->getJson('/api/vehicles/lookup/FY23PZS');

        $response
            ->assertOk()
            ->assertJsonPath('registration', 'FY23PZS')
            ->assertJsonPath('vehicle.makeName', 'BMW')
            ->assertJsonPath('selectedFitment.isStaggered', true)
            ->assertJsonPath('matchMeta.availableFitmentCount', 2)
            ->assertJsonCount(2, 'fitments')
            ->assertJsonPath('fitments.0.positions.0.position', 'front')
            ->assertJsonPath('fitments.0.positions.1.position', 'rear');
    }

    public function test_vehicle_lookup_rejects_invalid_registration(): void
    {
        $response = $this->getJson('/api/vehicles/lookup/@@');

        $response
            ->assertUnprocessable()
            ->assertJsonPath('code', 'invalid_registration');
    }

    public function test_ld23kzr_uses_baseline_legacy_when_dvla_disabled(): void
    {
        config(['services.dvla.enabled' => false]);

        $this->getJson('/api/vehicles/lookup/LD23KZR')
            ->assertOk()
            ->assertJsonPath('registration', 'LD23KZR')
            ->assertJsonPath('matchMeta.source', 'legacy_migration')
            ->assertJsonPath('selectedFitment.positions.0.width', 185)
            ->assertJsonPath('selectedFitment.positions.0.profile', 55)
            ->assertJsonPath('selectedFitment.positions.0.rim', 16)
            ->assertJsonPath('selectedFitment.positions.0.speedRating', 'V');
    }

    public function test_ld23kzr_uses_seeded_legacy_after_dvla_when_no_other_fitment(): void
    {
        config(['services.dvla.enabled' => true, 'services.dvla.api_key' => 'test-key']);

        $this->mock(DvlaVehicleEnquiryService::class, function ($mock): void {
            $mock->shouldReceive('enabled')->andReturn(true);
            $mock->shouldReceive('lookup')
                ->andReturn([
                    'status' => 'ok',
                    'httpStatus' => 200,
                    'errorCode' => null,
                    'message' => null,
                    'rawResponse' => [],
                    'normalized' => [
                        'registration' => 'LD23KZR',
                        'make' => 'Volkswagen',
                        'model' => 'Polo',
                        'yearOfManufacture' => 2023,
                        'fuelType' => 'PETROL',
                        'engineCapacity' => 999,
                        'taxStatus' => 'Taxed',
                        'motStatus' => 'Valid',
                        'bodyType' => null,
                    ],
                    'latencyMs' => 5,
                ]);
        });

        $this->getJson('/api/vehicles/lookup/LD23KZR')
            ->assertOk()
            ->assertJsonPath('registration', 'LD23KZR')
            ->assertJsonPath('matchMeta.source', 'legacy_migration')
            ->assertJsonPath('selectedFitment.positions.0.width', 185);
    }

    public function test_dvla_success_applies_configured_fallback_when_enabled(): void
    {
        config([
            'services.dvla.enabled' => true,
            'services.dvla.api_key' => 'test-key',
            'services.fitment.http.enabled' => false,
            'services.fitment.unresolved_fallback.enabled' => true,
            'services.fitment.unresolved_fallback.width' => 185,
            'services.fitment.unresolved_fallback.profile' => 55,
            'services.fitment.unresolved_fallback.rim' => 16,
            'services.fitment.unresolved_fallback.load_index' => 83,
            'services.fitment.unresolved_fallback.speed_rating' => 'V',
        ]);

        $this->mock(DvlaVehicleEnquiryService::class, function ($mock): void {
            $mock->shouldReceive('enabled')->andReturn(true);
            $mock->shouldReceive('lookup')
                ->andReturn([
                    'status' => 'ok',
                    'httpStatus' => 200,
                    'errorCode' => null,
                    'message' => null,
                    'rawResponse' => [],
                    'normalized' => [
                        'registration' => 'ZZ99ZZX',
                        'make' => 'Ford',
                        'model' => 'FIESTA',
                        'yearOfManufacture' => 2022,
                        'fuelType' => 'PETROL',
                        'engineCapacity' => 999,
                        'taxStatus' => 'Taxed',
                        'motStatus' => 'Valid',
                        'bodyType' => null,
                    ],
                    'latencyMs' => 5,
                ]);
        });

        $this->getJson('/api/vehicles/lookup/ZZ99ZZX')
            ->assertOk()
            ->assertJsonPath('matchMeta.source', 'dvla_plus_configured_fallback')
            ->assertJsonPath('selectedFitment.provider', 'configured_fallback')
            ->assertJsonPath('selectedFitment.positions.0.width', 185)
            ->assertJsonPath('selectedFitment.positions.0.loadIndex', 83);
    }

    public function test_fitment_search_filters_out_lower_speed_and_load_ratings(): void
    {
        $lookup = $this->getJson('/api/vehicles/lookup/FY23PZS')
            ->assertOk()
            ->json();

        $response = $this->postJson('/api/tyres/search', [
            'vehicleRegistration' => 'FY23PZS',
            'fitmentId' => data_get($lookup, 'selectedFitment.id'),
            'position' => 'rear',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('matchMeta.position', 'rear')
            ->assertJsonPath('total', 2);

        $resultIds = collect($response->json('results'))->pluck('id')->all();

        $this->assertSame([145616, 145617], $resultIds);
    }

    public function test_unknown_registration_returns_not_found_instead_of_provider_unavailable(): void
    {
        config([
            'services.uk_vehicle_data.enabled' => true,
            'services.uk_vehicle_data.api_key' => 'test-key',
            'services.dvla.enabled' => true,
            'services.dvla.api_key' => 'test-key',
        ]);

        $this->mock(\App\Services\UkVehicleDataService::class, function ($mock): void {
            $mock->shouldReceive('enabled')->andReturn(true);
            $mock->shouldReceive('lookup')->andReturn([
                'status' => 'not_found',
                'errorCode' => 'ukvd_vehicle_not_found',
                'message' => 'No vehicle or tyre data was returned for this registration.',
            ]);
        });

        $this->mock(DvlaVehicleEnquiryService::class, function ($mock): void {
            $mock->shouldReceive('enabled')->andReturn(true);
            $mock->shouldReceive('lookup')->andReturn([
                'status' => 'not_found',
                'errorCode' => 'dvla_vehicle_not_found',
                'message' => 'The DVLA service could not find this registration.',
            ]);
        });

        $this->getJson('/api/vehicles/lookup/AUK024')
            ->assertNotFound()
            ->assertJsonPath('code', 'registration_not_found');
    }
}
