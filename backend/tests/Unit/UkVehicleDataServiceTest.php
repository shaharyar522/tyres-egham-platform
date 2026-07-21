<?php

namespace Tests\Unit;

use App\Services\UkVehicleDataService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class UkVehicleDataServiceTest extends TestCase
{
    public function test_lookup_parses_vehicle_and_tyre_records(): void
    {
        config([
            'services.uk_vehicle_data.enabled' => true,
            'services.uk_vehicle_data.api_key' => 'test-key',
            'services.uk_vehicle_data.package' => 'TyreDataLite',
            'services.uk_vehicle_data.base_url' => 'https://uk1.ukvehicledata.co.uk/api/datapackage',
        ]);

        Http::fake([
            'https://uk1.ukvehicledata.co.uk/api/datapackage/TyreDataLite*' => Http::response([
                'Response' => [
                    'StatusCode' => 'Success',
                    'DataItems' => [
                        'VehicleDetails' => [
                            'Make' => 'VOLKSWAGEN',
                            'Model' => 'GOLF',
                            'BuildYear' => '2018',
                        ],
                        'TyreDetails' => [
                            'RecordList' => [
                                [
                                    'Vehicle' => ['ModelName' => 'Golf 1.4 TSI'],
                                    'Front' => [
                                        'Tyre' => [
                                            'SectionWidth' => 205,
                                            'AspectRatio' => 55,
                                            'RimDiameter' => 16,
                                            'LoadIndex' => '91',
                                            'SpeedIndex' => 'V',
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ]),
        ]);

        $result = app(UkVehicleDataService::class)->lookup('AUK024');

        $this->assertSame('ok', $result['status']);
        $this->assertSame('VOLKSWAGEN', $result['normalized']['make']);
        $this->assertSame(205, $result['normalized']['fitments'][0]['positions'][0]['width']);
    }
}
