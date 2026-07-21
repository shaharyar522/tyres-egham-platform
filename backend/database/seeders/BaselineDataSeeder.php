<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Brand;
use App\Models\ContentArticle;
use App\Models\CustomerReview;
use App\Models\FitmentPosition;
use App\Models\FitmentSet;
use App\Models\Service;
use App\Models\TyreCategory;
use App\Models\TyreSku;
use App\Models\VehicleMake;
use App\Models\VehicleLookup;
use App\Models\VehicleProfile;
use App\Models\VehicleModel;
use App\Models\Voucher;
use Illuminate\Database\Seeder;

class BaselineDataSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            ['id' => 1, 'slug' => 'michelin', 'name' => 'Michelin', 'tier' => 'premium', 'description' => 'Iconic French manufacturer renowned for long-life premium touring tyres.', 'recommended_for' => ['High-performance saloons', 'Long-distance commuters'], 'has_active_offer' => true],
            ['id' => 2, 'slug' => 'continental', 'name' => 'Continental', 'tier' => 'premium', 'description' => 'German engineering with class-leading wet-grip performance and OE-fitment heritage.', 'recommended_for' => ['Premium German marques', 'Wet-weather safety'], 'has_active_offer' => true],
            ['id' => 3, 'slug' => 'bridgestone', 'name' => 'Bridgestone', 'tier' => 'premium', 'description' => 'Japanese global brand with strong run-flat and EV-rated ranges.', 'recommended_for' => ['EV owners', 'Run-flat fitments'], 'has_active_offer' => false],
            ['id' => 4, 'slug' => 'pirelli', 'name' => 'Pirelli', 'tier' => 'premium', 'description' => 'F1-pedigree brand with bespoke OE markings for premium and sport vehicles.', 'recommended_for' => ['Sports cars', 'OE-marked fitments'], 'has_active_offer' => true],
            ['id' => 5, 'slug' => 'goodyear', 'name' => 'Goodyear', 'tier' => 'premium', 'description' => 'American engineering icon with strong all-season and touring credentials.', 'recommended_for' => ['All-season versatility', 'Family saloons'], 'has_active_offer' => true],
            ['id' => 6, 'slug' => 'dunlop', 'name' => 'Dunlop', 'tier' => 'premium', 'description' => 'British-rooted brand with sport and touring expertise across saloons and SUVs.', 'recommended_for' => ['Hot hatches', 'Touring saloons'], 'has_active_offer' => false],
            ['id' => 9, 'slug' => 'hankook', 'name' => 'Hankook', 'tier' => 'mid_range', 'description' => 'Korean OE supplier offering premium-grade performance at mid-range pricing.', 'recommended_for' => ['Daily drivers', 'Family SUVs'], 'has_active_offer' => true],
            ['id' => 10, 'slug' => 'falken', 'name' => 'Falken', 'tier' => 'mid_range', 'description' => 'Japanese heritage with strong UHP and 4x4 ranges and growing OE relationships.', 'recommended_for' => ['4x4 fitments', 'Sporty hatchbacks'], 'has_active_offer' => true],
        ];

        foreach ($brands as $brand) {
            Brand::updateOrCreate(['id' => $brand['id']], $brand);
        }

        $categories = [
            ['id' => 1, 'slug' => 'car', 'name' => 'Car Tyres', 'description' => 'Premium, mid-range and budget tyres for every saloon, hatchback and estate.', 'icon_name' => 'Car'],
            ['id' => 2, 'slug' => '4x4', 'name' => '4x4 / SUV Tyres', 'description' => 'Robust tyres engineered for SUVs, off-road 4x4s and adventure vehicles.', 'icon_name' => 'Truck'],
            ['id' => 3, 'slug' => 'van', 'name' => 'Van Tyres', 'description' => 'Reinforced tyres rated for commercial loads and high-mileage van use.', 'icon_name' => 'TruckIcon'],
            ['id' => 4, 'slug' => 'run-flat', 'name' => 'Run Flat Tyres', 'description' => 'Self-supporting tyres that let you keep driving even after a puncture.', 'icon_name' => 'ShieldCheck'],
            ['id' => 5, 'slug' => 'ev', 'name' => 'EV Tyres', 'description' => 'Low-rolling-resistance tyres optimised for electric vehicle range and torque.', 'icon_name' => 'BatteryCharging'],
            ['id' => 6, 'slug' => 'all-season', 'name' => 'All Season Tyres', 'description' => 'M+S and 3PMSF-rated tyres that perform across the UK climate year-round.', 'icon_name' => 'CloudSun'],
            ['id' => 7, 'slug' => 'winter', 'name' => 'Winter Tyres', 'description' => 'Cold-weather compounds for sub-7°C performance, snow and ice.', 'icon_name' => 'Snowflake'],
            ['id' => 8, 'slug' => 'high-performance', 'name' => 'High Performance Tyres', 'description' => 'UHP and motorsport-derived tyres for sports cars and tuned vehicles.', 'icon_name' => 'Gauge'],
        ];

        foreach ($categories as $category) {
            TyreCategory::updateOrCreate(['id' => $category['id']], $category);
        }

        $makes = [
            ['id' => 1, 'slug' => 'audi', 'name' => 'Audi', 'top_models' => ['A1', 'A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'RS3']],
            ['id' => 2, 'slug' => 'bmw', 'name' => 'BMW', 'top_models' => ['1 Series', '2 Series', '3 Series', '5 Series', 'X1', 'X3', 'X5', 'M3']],
            ['id' => 4, 'slug' => 'volkswagen', 'name' => 'Volkswagen', 'top_models' => ['Polo', 'Golf', 'Passat', 'Tiguan', 'T-Roc', 'ID.3', 'ID.4']],
            ['id' => 5, 'slug' => 'ford', 'name' => 'Ford', 'top_models' => ['Fiesta', 'Focus', 'Kuga', 'Puma', 'Mondeo', 'Transit']],
            ['id' => 8, 'slug' => 'nissan', 'name' => 'Nissan', 'top_models' => ['Micra', 'Qashqai', 'Juke', 'X-Trail', 'Leaf']],
        ];

        foreach ($makes as $make) {
            VehicleMake::updateOrCreate(['id' => $make['id']], $make);
        }

        foreach ($makes as $make) {
            foreach ($make['top_models'] as $modelName) {
                $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $modelName) ?? '');
                $slug = trim($slug, '-');

                VehicleModel::updateOrCreate(
                    ['vehicle_make_id' => $make['id'], 'slug' => $slug],
                    ['name' => $modelName],
                );
            }
        }

        $modelIds = VehicleModel::query()
            ->get()
            ->mapWithKeys(fn (VehicleModel $model) => [
                sprintf('%s:%s', $model->vehicle_make_id, $model->slug) => $model->id,
            ]);

        $areas = [
            ['id' => 1, 'name' => 'Egham', 'slug' => 'egham', 'postcode_prefix' => 'TW20'],
            ['id' => 2, 'name' => 'Staines', 'slug' => 'staines', 'postcode_prefix' => 'TW18'],
            ['id' => 3, 'name' => 'Englefield Green', 'slug' => 'englefield-green', 'postcode_prefix' => 'TW20'],
            ['id' => 4, 'name' => 'Virginia Water', 'slug' => 'virginia-water', 'postcode_prefix' => 'GU25'],
            ['id' => 5, 'name' => 'Thorpe', 'slug' => 'thorpe', 'postcode_prefix' => 'TW20'],
            ['id' => 6, 'name' => 'Wraysbury', 'slug' => 'wraysbury', 'postcode_prefix' => 'TW19'],
            ['id' => 7, 'name' => 'Old Windsor', 'slug' => 'old-windsor', 'postcode_prefix' => 'SL4'],
            ['id' => 8, 'name' => 'Datchet', 'slug' => 'datchet', 'postcode_prefix' => 'SL3'],
        ];

        foreach ($areas as $area) {
            Area::updateOrCreate(['id' => $area['id']], $area);
        }

        $vehicleLookups = [
            [
                'registration' => 'AB12CDE',
                'vehicle_make_id' => 1,
                'vehicle_model_id' => $modelIds['1:a3'] ?? null,
                'derivative' => 'Sportback S line',
                'year' => 2022,
                'fuel_type' => 'Petrol',
                'body_type' => 'Hatchback',
                'tyre_width' => 225,
                'tyre_profile' => 45,
                'tyre_rim' => 17,
                'load_index' => 94,
                'speed_rating' => 'Y',
                'tyre_category_slug' => 'high-performance',
            ],
            [
                'registration' => 'GV20GLF',
                'vehicle_make_id' => 4,
                'vehicle_model_id' => $modelIds['4:golf'] ?? null,
                'derivative' => 'Match TSI',
                'year' => 2020,
                'fuel_type' => 'Petrol',
                'body_type' => 'Hatchback',
                'tyre_width' => 205,
                'tyre_profile' => 55,
                'tyre_rim' => 16,
                'load_index' => 91,
                'speed_rating' => 'V',
                'tyre_category_slug' => 'car',
            ],
            [
                'registration' => 'QS21QSH',
                'vehicle_make_id' => 8,
                'vehicle_model_id' => $modelIds['8:qashqai'] ?? null,
                'derivative' => 'N-Connecta',
                'year' => 2021,
                'fuel_type' => 'Petrol',
                'body_type' => 'SUV',
                'tyre_width' => 225,
                'tyre_profile' => 45,
                'tyre_rim' => 17,
                'load_index' => 94,
                'speed_rating' => 'W',
                'tyre_category_slug' => 'car',
            ],
            [
                'registration' => 'QF19Q5X',
                'vehicle_make_id' => 1,
                'vehicle_model_id' => $modelIds['1:q5'] ?? null,
                'derivative' => 'S line quattro',
                'year' => 2019,
                'fuel_type' => 'Diesel',
                'body_type' => 'SUV',
                'tyre_width' => 235,
                'tyre_profile' => 65,
                'tyre_rim' => 17,
                'load_index' => 108,
                'speed_rating' => 'V',
                'tyre_category_slug' => '4x4',
            ],
            [
                'registration' => 'TR21VAN',
                'vehicle_make_id' => 5,
                'vehicle_model_id' => $modelIds['5:transit'] ?? null,
                'derivative' => 'Custom Limited',
                'year' => 2021,
                'fuel_type' => 'Diesel',
                'body_type' => 'Van',
                'tyre_width' => 225,
                'tyre_profile' => 65,
                'tyre_rim' => 16,
                'load_index' => 112,
                'speed_rating' => 'R',
                'tyre_category_slug' => 'van',
            ],
            [
                'registration' => 'YB68VBV',
                'vehicle_make_id' => 1,
                'vehicle_model_id' => $modelIds['1:a1'] ?? null,
                'derivative' => 'S line',
                'year' => 2018,
                'fuel_type' => 'Petrol',
                'body_type' => 'Hatchback',
                'tyre_width' => 205,
                'tyre_profile' => 40,
                'tyre_rim' => 18,
                'load_index' => 86,
                'speed_rating' => 'V',
                'tyre_category_slug' => null,
            ],
            [
                'registration' => 'LD23KZR',
                'vehicle_make_id' => 4,
                'vehicle_model_id' => $modelIds['4:polo'] ?? null,
                'derivative' => 'Match',
                'year' => 2023,
                'fuel_type' => 'Petrol',
                'body_type' => 'Hatchback',
                'tyre_width' => 185,
                'tyre_profile' => 55,
                'tyre_rim' => 16,
                'load_index' => 87,
                'speed_rating' => 'V',
                'tyre_category_slug' => 'car',
            ],
        ];

        foreach ($vehicleLookups as $lookup) {
            VehicleLookup::updateOrCreate(['registration' => $lookup['registration']], $lookup);
        }

        $vehicleProfiles = [
            [
                'registration' => 'AB12CDE',
                'vehicle_make_id' => 1,
                'vehicle_model_id' => $modelIds['1:a3'] ?? null,
                'dvla_make_text' => 'AUDI',
                'dvla_model_text' => 'A3',
                'derivative' => 'Sportback S line',
                'year_of_manufacture' => 2022,
                'fuel_type' => 'Petrol',
                'body_type' => 'Hatchback',
                'engine_capacity' => 1498,
                'tax_status' => 'Taxed',
                'mot_status' => 'Valid',
                'source' => 'seeded',
                'source_reference' => 'seeded:a3-sportback',
            ],
            [
                'registration' => 'GV20GLF',
                'vehicle_make_id' => 4,
                'vehicle_model_id' => $modelIds['4:golf'] ?? null,
                'dvla_make_text' => 'VOLKSWAGEN',
                'dvla_model_text' => 'GOLF',
                'derivative' => 'Match TSI',
                'year_of_manufacture' => 2020,
                'fuel_type' => 'Petrol',
                'body_type' => 'Hatchback',
                'engine_capacity' => 1498,
                'tax_status' => 'Taxed',
                'mot_status' => 'Valid',
                'source' => 'seeded',
                'source_reference' => 'seeded:golf-match',
            ],
            [
                'registration' => 'FY23PZS',
                'vehicle_make_id' => 2,
                'vehicle_model_id' => $modelIds['2:3-series'] ?? null,
                'dvla_make_text' => 'BMW',
                'dvla_model_text' => '3 SERIES',
                'derivative' => '320i M Sport Auto',
                'year_of_manufacture' => 2023,
                'fuel_type' => 'Petrol',
                'body_type' => 'Saloon',
                'engine_capacity' => 1998,
                'tax_status' => 'Taxed',
                'mot_status' => 'Valid',
                'source' => 'seeded',
                'source_reference' => 'seeded:bmw-320i',
            ],
            [
                'registration' => 'TR21VAN',
                'vehicle_make_id' => 5,
                'vehicle_model_id' => $modelIds['5:transit'] ?? null,
                'dvla_make_text' => 'FORD',
                'dvla_model_text' => 'TRANSIT',
                'derivative' => 'Custom Limited',
                'year_of_manufacture' => 2021,
                'fuel_type' => 'Diesel',
                'body_type' => 'Van',
                'engine_capacity' => 1995,
                'tax_status' => 'Taxed',
                'mot_status' => 'Valid',
                'source' => 'seeded',
                'source_reference' => 'seeded:transit-custom',
            ],
            [
                'registration' => 'YB68VBV',
                'vehicle_make_id' => 1,
                'vehicle_model_id' => $modelIds['1:a1'] ?? null,
                'dvla_make_text' => 'AUDI',
                'dvla_model_text' => 'A1',
                'derivative' => 'S line',
                'year_of_manufacture' => 2018,
                'fuel_type' => 'Petrol',
                'body_type' => 'Hatchback',
                'engine_capacity' => 1395,
                'tax_status' => 'Taxed',
                'mot_status' => 'Valid',
                'source' => 'seeded',
                'source_reference' => 'seeded:a1-sline-18',
            ],
        ];

        foreach ($vehicleProfiles as $profile) {
            VehicleProfile::updateOrCreate(
                ['registration' => $profile['registration']],
                $profile + ['last_verified_at' => now()],
            );
        }

        $profileIds = VehicleProfile::pluck('id', 'registration');

        $fitmentSets = [
            [
                'profile_registration' => 'AB12CDE',
                'provider' => 'seeded',
                'provider_reference' => 'a3-oe-17',
                'fitment_type' => 'oe',
                'label' => null,
                'tyre_category_slug' => 'high-performance',
                'is_primary' => true,
                'is_staggered' => false,
                'confidence' => 1,
                'positions' => [
                    [
                        'position' => 'all_round',
                        'width' => 225,
                        'profile' => 45,
                        'rim' => 17,
                        'load_index' => 94,
                        'speed_rating' => 'Y',
                        'tyre_category_slug' => 'high-performance',
                        'is_extra_load' => true,
                        'oe_marking' => 'AO',
                        'recommended_quantity' => 4,
                    ],
                ],
            ],
            [
                'profile_registration' => 'AB12CDE',
                'provider' => 'seeded',
                'provider_reference' => 'a3-oe-16',
                'fitment_type' => 'oe_optional',
                'label' => null,
                'tyre_category_slug' => 'car',
                'is_primary' => false,
                'is_staggered' => false,
                'confidence' => 0.94,
                'positions' => [
                    [
                        'position' => 'all_round',
                        'width' => 205,
                        'profile' => 55,
                        'rim' => 16,
                        'load_index' => 91,
                        'speed_rating' => 'V',
                        'tyre_category_slug' => 'car',
                        'recommended_quantity' => 4,
                    ],
                ],
            ],
            [
                'profile_registration' => 'GV20GLF',
                'provider' => 'seeded',
                'provider_reference' => 'golf-oe-16',
                'fitment_type' => 'oe',
                'label' => null,
                'tyre_category_slug' => 'car',
                'is_primary' => true,
                'is_staggered' => false,
                'confidence' => 1,
                'positions' => [
                    [
                        'position' => 'all_round',
                        'width' => 205,
                        'profile' => 55,
                        'rim' => 16,
                        'load_index' => 91,
                        'speed_rating' => 'V',
                        'tyre_category_slug' => 'car',
                        'recommended_quantity' => 4,
                    ],
                ],
            ],
            [
                'profile_registration' => 'FY23PZS',
                'provider' => 'seeded',
                'provider_reference' => 'bmw-oe-18',
                'fitment_type' => 'oe',
                'label' => null,
                'tyre_category_slug' => 'high-performance',
                'is_primary' => true,
                'is_staggered' => true,
                'confidence' => 1,
                'positions' => [
                    [
                        'position' => 'front',
                        'width' => 225,
                        'profile' => 45,
                        'rim' => 18,
                        'load_index' => 95,
                        'speed_rating' => 'Y',
                        'tyre_category_slug' => 'high-performance',
                        'is_extra_load' => true,
                        'oe_marking' => '*',
                        'recommended_quantity' => 2,
                    ],
                    [
                        'position' => 'rear',
                        'width' => 255,
                        'profile' => 40,
                        'rim' => 18,
                        'load_index' => 99,
                        'speed_rating' => 'Y',
                        'tyre_category_slug' => 'high-performance',
                        'is_extra_load' => true,
                        'oe_marking' => '*',
                        'recommended_quantity' => 2,
                    ],
                ],
            ],
            [
                'profile_registration' => 'FY23PZS',
                'provider' => 'seeded',
                'provider_reference' => 'bmw-oe-19',
                'fitment_type' => 'oe_optional',
                'label' => null,
                'tyre_category_slug' => 'high-performance',
                'is_primary' => false,
                'is_staggered' => true,
                'confidence' => 0.97,
                'positions' => [
                    [
                        'position' => 'front',
                        'width' => 225,
                        'profile' => 40,
                        'rim' => 19,
                        'load_index' => 93,
                        'speed_rating' => 'Y',
                        'tyre_category_slug' => 'high-performance',
                        'oe_marking' => '*',
                        'recommended_quantity' => 2,
                    ],
                    [
                        'position' => 'rear',
                        'width' => 255,
                        'profile' => 35,
                        'rim' => 19,
                        'load_index' => 96,
                        'speed_rating' => 'Y',
                        'tyre_category_slug' => 'high-performance',
                        'oe_marking' => '*',
                        'recommended_quantity' => 2,
                    ],
                ],
            ],
            [
                'profile_registration' => 'TR21VAN',
                'provider' => 'seeded',
                'provider_reference' => 'transit-oe-16',
                'fitment_type' => 'oe',
                'label' => null,
                'tyre_category_slug' => 'van',
                'is_primary' => true,
                'is_staggered' => false,
                'confidence' => 1,
                'positions' => [
                    [
                        'position' => 'all_round',
                        'width' => 225,
                        'profile' => 65,
                        'rim' => 16,
                        'load_index' => 112,
                        'speed_rating' => 'R',
                        'tyre_category_slug' => 'van',
                        'is_van' => true,
                        'recommended_quantity' => 4,
                    ],
                ],
            ],
            [
                'profile_registration' => 'YB68VBV',
                'provider' => 'seeded',
                'provider_reference' => 'a1-oe-18',
                'fitment_type' => 'oe',
                'label' => null,
                'tyre_category_slug' => null,
                'is_primary' => true,
                'is_staggered' => false,
                'confidence' => 1,
                'positions' => [
                    [
                        'position' => 'all_round',
                        'width' => 205,
                        'profile' => 40,
                        'rim' => 18,
                        'load_index' => 86,
                        'speed_rating' => 'V',
                        'tyre_category_slug' => null,
                        'recommended_quantity' => 4,
                    ],
                ],
            ],
        ];

        foreach ($fitmentSets as $set) {
            $fitmentSet = FitmentSet::updateOrCreate(
                [
                    'vehicle_profile_id' => $profileIds[$set['profile_registration']],
                    'provider' => $set['provider'],
                    'provider_reference' => $set['provider_reference'],
                ],
                [
                    'fitment_type' => $set['fitment_type'],
                    'label' => $set['label'],
                    'tyre_category_slug' => $set['tyre_category_slug'],
                    'is_primary' => $set['is_primary'],
                    'is_staggered' => $set['is_staggered'],
                    'confidence' => $set['confidence'],
                    'provider_queried_at' => now(),
                ],
            );

            foreach ($set['positions'] as $position) {
                FitmentPosition::updateOrCreate(
                    [
                        'fitment_set_id' => $fitmentSet->id,
                        'position' => $position['position'],
                    ],
                    [
                        'width' => $position['width'],
                        'profile' => $position['profile'],
                        'rim' => $position['rim'],
                        'load_index' => $position['load_index'] ?? null,
                        'speed_rating' => $position['speed_rating'] ?? null,
                        'tyre_category_slug' => $position['tyre_category_slug'] ?? null,
                        'is_extra_load' => $position['is_extra_load'] ?? false,
                        'is_run_flat' => $position['is_run_flat'] ?? false,
                        'is_winter' => $position['is_winter'] ?? false,
                        'is_all_season' => $position['is_all_season'] ?? false,
                        'is_ev_rated' => $position['is_ev_rated'] ?? false,
                        'is_van' => $position['is_van'] ?? false,
                        'is_4x4' => $position['is_4x4'] ?? false,
                        'oe_marking' => $position['oe_marking'] ?? null,
                        'recommended_quantity' => $position['recommended_quantity'] ?? 4,
                    ],
                );
            }
        }

        $services = [
            ['id' => 1, 'slug' => 'tyre-safety-check', 'name' => 'Tyre Safety Check', 'short_description' => 'Comprehensive 12-point inspection covering tread, pressure, sidewalls, and alignment indicators.', 'long_description' => 'Our complimentary tyre safety check is a hands-on inspection by a qualified fitter. We inspect tread depth, pressure, sidewalls, wear patterns and valves, then provide a clear summary with recommendations.', 'price_from' => null, 'is_free' => true, 'duration_minutes' => 20, 'icon_name' => 'ShieldCheck', 'upsell_in_basket' => true],
            ['id' => 2, 'slug' => 'fixed-in-your-home', 'name' => 'Fixed in your home', 'short_description' => 'Mobile tyre fitting at your home — choose a distance band for transparent pricing.', 'long_description' => 'Our mobile fitter comes to your home to fit or repair tyres on your driveway. Select how far you are from our workshop: 5 miles (£50), 10 miles (£100), or 20 miles (£100+ with any extra mileage agreed with our team before your appointment).', 'price_from' => 50.00, 'is_free' => false, 'duration_minutes' => 60, 'icon_name' => 'Home', 'upsell_in_basket' => true, 'pricing_options' => ['type' => 'distance', 'options' => [['key' => '5', 'label' => '5 miles', 'price' => 50, 'requiresCustomPrice' => false], ['key' => '10', 'label' => '10 miles', 'price' => 100, 'requiresCustomPrice' => false], ['key' => '20', 'label' => '20 miles', 'price' => 100, 'requiresCustomPrice' => true, 'priceHint' => '£100+', 'discussionMessage' => 'Price of extra miles will be discussed by our team. Enter the agreed amount below once confirmed.']]]],
            ['id' => 3, 'slug' => 'tyre-repair', 'name' => 'Tyre Repair', 'short_description' => 'BS AU 159 standard puncture repair when the damage is within repairable parameters.', 'long_description' => 'Where a puncture is in the central tread area and damage is within BS AU 159 limits, we can perform a permanent combination repair. Run-flat tyres require replacement.', 'price_from' => 25.00, 'is_free' => false, 'duration_minutes' => 30, 'icon_name' => 'Wrench', 'upsell_in_basket' => false],
            ['id' => 4, 'slug' => 'wheel-balancing', 'name' => 'Wheel balancing', 'short_description' => 'Computerised wheel balancing to remove vibration and even out tyre wear.', 'long_description' => 'Unbalanced wheels cause vibration through the steering and seat, and accelerate uneven tyre wear. We fit weights on a computerised balancer to bring each wheel within tolerance so your car rides smoothly and your tyres last longer. Ideal after new tyres are fitted or if you notice a shake at motorway speeds.', 'price_from' => 30.00, 'is_free' => false, 'duration_minutes' => 30, 'icon_name' => 'CircleDot', 'upsell_in_basket' => true],
        ];

        foreach ($services as $service) {
            Service::updateOrCreate(['id' => $service['id']], $service);
        }

        $articles = [
            [
                'id' => 1,
                'namespace' => 'blog',
                'slug' => 'buying-premium-vs-budget-tyres',
                'title' => 'Buying Premium vs Budget Tyres',
                'excerpt' => 'What you actually pay for when you go premium - and when budget is the smarter call.',
                'category' => 'buying-guide',
                'read_minutes' => 6,
                'published_at' => '2026-03-12',
                'image_emoji' => '💰',
                'body' => '<p>Premium tyres typically offer shorter stopping distances, lower rolling resistance and longer tread life. Budget patterns trade some of that performance for a lower upfront price — sensible on older vehicles or light use.</p><h2>When premium makes sense</h2><p>If you cover high mileage, drive in wet conditions regularly, or your car came with a specific OE marking, matching or exceeding that specification is the safest choice.</p><h2>When budget is fine</h2><p>Second cars, city runabouts and vehicles with modest power rarely need the last 5% of grip. A reputable mid-range or budget tyre from a known brand is often the sweet spot.</p>',
            ],
            [
                'id' => 2,
                'namespace' => 'blog',
                'slug' => 'winter-tyres-explained',
                'title' => 'Winter Tyres Explained',
                'excerpt' => 'Why M+S and 3PMSF matter, when to switch, and what they cost over a season.',
                'category' => 'seasonal',
                'read_minutes' => 7,
                'published_at' => '2026-02-28',
                'image_emoji' => '❄️',
                'body' => '<p>Winter tyres use softer compounds and deeper tread blocks to stay flexible below 7°C. The 3PMSF snowflake mark means the tyre passed a regulated snow-traction test — M+S alone does not guarantee that.</p><h2>When to fit them</h2><p>Most drivers in the UK switch between October and March, or whenever overnight temperatures stay consistently low.</p>',
            ],
            [
                'id' => 3,
                'namespace' => 'blog',
                'slug' => 'tyre-pressure-guide',
                'title' => 'The Definitive Tyre Pressure Guide',
                'excerpt' => 'How to find your manufacturer pressure, when to check it, and how loading changes the answer.',
                'category' => 'maintenance',
                'read_minutes' => 5,
                'published_at' => '2026-02-14',
                'image_emoji' => '🌬️',
                'body' => '<p>Correct pressure affects fuel economy, wear and safety. Find the sticker inside the fuel flap or door jamb — never rely on the figure moulded into the sidewall, which is the tyre’s maximum.</p><h2>How often to check</h2><p>We recommend checking pressures cold at least every two weeks and before long journeys. Add roughly 0.2 bar when fully loaded if the manufacturer provides a second figure.</p>',
            ],
            [
                'id' => 4,
                'namespace' => 'blog',
                'slug' => 'tyre-wall-markings',
                'title' => 'Reading Tyre Wall Markings',
                'excerpt' => 'Decode every number, letter and symbol on the sidewall - including OE markings and DOT codes.',
                'category' => 'buying-guide',
                'read_minutes' => 8,
                'published_at' => '2026-01-30',
                'image_emoji' => '🔥',
                'body' => '<p>A size such as 225/45 R17 94Y tells you width, aspect ratio, rim diameter, load index and speed rating. OE codes like MO, AO or * indicate manufacturer approval for specific models.</p><h2>DOT and age</h2><p>The last four digits of the DOT code are the week and year of manufacture. Tyres older than ten years should be replaced regardless of tread depth.</p>',
            ],
        ];

        foreach ($articles as $article) {
            ContentArticle::updateOrCreate(['id' => $article['id']], $article);
        }

        $pages = [
            [
                'id' => 101,
                'namespace' => 'page',
                'slug' => 'about',
                'title' => 'About us',
                'excerpt' => 'Independent local tyre fitter serving Surrey, Berkshire and West London since 2003.',
                'category' => 'page',
                'read_minutes' => 3,
                'published_at' => '2026-01-01',
                'image_emoji' => null,
                'body' => '<p>Egham Tyres is an independent workshop on Station Road, Egham. We have fitted tyres for local drivers since 2003 — from everyday family cars to performance and 4x4 vehicles.</p><p>Our team is manufacturer-trained, and we stock premium, mid-range and budget patterns from the brands you recognise. You book online, we fit at the workshop, and you pay when the job is done.</p>',
            ],
            [
                'id' => 102,
                'namespace' => 'page',
                'slug' => 'privacy',
                'title' => 'Privacy Policy',
                'excerpt' => 'How we collect, use and protect your personal data.',
                'category' => 'page',
                'read_minutes' => 4,
                'published_at' => '2026-01-01',
                'image_emoji' => null,
                'body' => '<p>We collect contact details and vehicle information when you book or enquire. This is used to fulfil your appointment, send confirmations, and improve our service. We do not sell your data to third parties.</p><p>Vehicle registration lookups are used only to suggest suitable tyre sizes. You may request a copy of data we hold about you by emailing our workshop.</p>',
            ],
            [
                'id' => 103,
                'namespace' => 'page',
                'slug' => 'terms',
                'title' => 'Terms & Conditions',
                'excerpt' => 'Booking, pricing and fitting terms for online orders.',
                'category' => 'page',
                'read_minutes' => 4,
                'published_at' => '2026-01-01',
                'image_emoji' => null,
                'body' => '<p>Prices shown online are subject to stock availability at the time of fitting. We will contact you if a substitution is required before any work proceeds.</p><p>Payment is taken at the workshop when your vehicle is ready. Cancellations with less than 24 hours’ notice may incur a charge for reserved stock or bay time.</p>',
            ],
            [
                'id' => 104,
                'namespace' => 'page',
                'slug' => 'cookies',
                'title' => 'Cookie Policy',
                'excerpt' => 'Cookies and similar technologies used on this website.',
                'category' => 'page',
                'read_minutes' => 3,
                'published_at' => '2026-01-01',
                'image_emoji' => null,
                'body' => '<p>We use essential cookies to keep your basket and session working. Analytics cookies help us understand how visitors use the site — you can accept or reject non-essential cookies via the banner on first visit.</p><p>You can change your preference at any time by clearing site data or using your browser settings.</p>',
            ],
        ];

        foreach ($pages as $page) {
            ContentArticle::updateOrCreate(['id' => $page['id']], $page);
        }

        $reviews = [
            ['id' => 1, 'customer_name' => 'Sarah J.', 'rating' => 5, 'title' => 'Brilliant service from start to finish', 'body' => 'Booked online in under five minutes, dropped the car in at 9am and was back on the road by 10:30. Friendly, knowledgeable, and the price they quoted is exactly what I paid.', 'source' => 'google', 'status' => 'approved', 'created_at' => '2026-04-22'],
            ['id' => 2, 'customer_name' => 'Mark T.', 'rating' => 5, 'title' => 'Fantastic local garage', 'body' => 'I always shop around but these guys are consistently the most competitive on premium brands and the fitters take real care with alloys.', 'source' => 'google', 'status' => 'approved', 'created_at' => '2026-04-18'],
            ['id' => 3, 'customer_name' => 'Emily R.', 'rating' => 5, 'title' => 'Helpful, honest, no pressure', 'body' => 'Asked them to do a tyre check and they showed me exactly what they were looking at. Recommended I keep my current tyres because there was still life in them.', 'source' => 'in_site', 'status' => 'approved', 'created_at' => '2026-04-12'],
            ['id' => 4, 'customer_name' => 'Daniel C.', 'rating' => 4, 'title' => 'Quick and professional', 'body' => 'Same-day fit on a set of Continentals for my A4. Reception was a bit busy when I arrived but the work was done on time and the bill was correct.', 'source' => 'google', 'status' => 'approved', 'created_at' => '2026-04-08'],
            ['id' => 5, 'customer_name' => 'Priya K.', 'rating' => 5, 'title' => 'Best price for Michelins', 'body' => 'Compared three suppliers and these were the cheapest by a clear margin even before the cashback. Booking flow was easy.', 'source' => 'google', 'status' => 'approved', 'created_at' => '2026-03-30'],
            ['id' => 6, 'customer_name' => 'James W.', 'rating' => 5, 'title' => 'Sorted a tricky run-flat fitment', 'body' => 'BMW X5 run-flats - had been quoted nonsense elsewhere. These guys had them in stock at a fair price and finished within the slot.', 'source' => 'in_site', 'status' => 'approved', 'created_at' => '2026-03-24'],
        ];

        foreach ($reviews as $review) {
            CustomerReview::updateOrCreate(['id' => $review['id']], $review);
        }

        $brandIds = Brand::pluck('id', 'slug');
        $categoryIds = TyreCategory::pluck('id', 'slug');

        $vouchers = [
            ['code' => 'MICH26FA', 'brand_id' => $brandIds['michelin'], 'min_qty' => 4, 'discount_per_qty' => 12.50, 'valid_from' => '2026-04-01', 'valid_to' => '2026-06-30', 'description' => 'Save £50 when you buy 4 selected Michelin tyres.'],
            ['code' => 'COMAY26', 'brand_id' => $brandIds['continental'], 'min_qty' => 4, 'discount_per_qty' => 15.00, 'valid_from' => '2026-05-01', 'valid_to' => '2026-05-31', 'description' => '£60 cashback on a set of 4 Continental tyres.'],
            ['code' => 'GOOD26', 'brand_id' => $brandIds['goodyear'], 'min_qty' => 2, 'discount_per_qty' => 8.00, 'valid_from' => '2026-03-01', 'valid_to' => '2026-07-31', 'description' => '£16 off when you buy 2 or more Goodyear tyres.'],
            ['code' => 'PIRELLI4', 'brand_id' => $brandIds['pirelli'], 'min_qty' => 4, 'discount_per_qty' => 17.50, 'valid_from' => '2026-04-15', 'valid_to' => '2026-06-15', 'description' => '£70 off a full set of qualifying Pirelli tyres.'],
            ['code' => 'FALK4SAVE', 'brand_id' => $brandIds['falken'], 'min_qty' => 4, 'discount_per_qty' => 7.00, 'valid_from' => '2026-04-01', 'valid_to' => '2026-08-31', 'description' => '£28 saving on a set of 4 Falken tyres.'],
            ['code' => 'HANK2DEAL', 'brand_id' => $brandIds['hankook'], 'min_qty' => 2, 'discount_per_qty' => 6.00, 'valid_from' => '2026-04-01', 'valid_to' => '2026-12-31', 'description' => '£12 off when you buy 2 or more Hankook tyres.'],
        ];

        foreach ($vouchers as $voucher) {
            Voucher::updateOrCreate(['code' => $voucher['code']], $voucher);
        }

        $skus = [
            ['id' => 145603, 'slug' => 'michelin-pilot-sport-5-225-45-r17', 'brand_id' => $brandIds['michelin'], 'tyre_category_id' => $categoryIds['high-performance'], 'model_name' => 'Pilot Sport 5', 'width' => 225, 'profile' => 45, 'rim' => 17, 'load_index' => 94, 'speed_rating' => 'Y', 'is_extra_load' => true, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => false, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => true, 'manufacturer_sku' => 'MIC-PS5-22545-94Y', 'ean' => '3528700000001', 'eu_label' => ['fuelEfficiency' => 'B', 'wetGrip' => 'A', 'externalNoise' => 71, 'noiseClass' => 'B'], 'oe_approvals' => [['code' => 'MO', 'manufacturer' => 'Mercedes-Benz', 'description' => 'OE for select Mercedes-Benz models']], 'video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'price_per_tyre' => 189, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 189], ['qty' => 2, 'pricePerTyre' => 184, 'saveLabel' => 'Save £10'], ['qty' => 4, 'pricePerTyre' => 176, 'saveLabel' => 'Save £52']], 'star_rating' => 4.8, 'review_count' => 312, 'stock' => 24, 'badges' => ['best_buy', 'recommended'], 'has_active_offer' => true, 'voucher_code' => 'MICH26FA'],
            ['id' => 145604, 'slug' => 'continental-premiumcontact-7-225-45-r17', 'brand_id' => $brandIds['continental'], 'tyre_category_id' => $categoryIds['car'], 'model_name' => 'PremiumContact 7', 'width' => 225, 'profile' => 45, 'rim' => 17, 'load_index' => 94, 'speed_rating' => 'W', 'is_extra_load' => true, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => true, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => false, 'manufacturer_sku' => 'CON-PC7-22545-94W', 'ean' => '4019238900001', 'eu_label' => ['fuelEfficiency' => 'A', 'wetGrip' => 'A', 'externalNoise' => 70, 'noiseClass' => 'A'], 'oe_approvals' => [['code' => '*', 'manufacturer' => 'BMW', 'description' => 'OE for select BMW models']], 'video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'price_per_tyre' => 178, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 178], ['qty' => 2, 'pricePerTyre' => 174, 'saveLabel' => 'Save £8'], ['qty' => 4, 'pricePerTyre' => 168, 'saveLabel' => 'Save £40']], 'star_rating' => 4.9, 'review_count' => 487, 'stock' => 16, 'badges' => ['best_buy', 'recommended'], 'has_active_offer' => true, 'voucher_code' => 'COMAY26'],
            ['id' => 145605, 'slug' => 'bridgestone-turanza-6-225-45-r17', 'brand_id' => $brandIds['bridgestone'], 'tyre_category_id' => $categoryIds['car'], 'model_name' => 'Turanza 6', 'width' => 225, 'profile' => 45, 'rim' => 17, 'load_index' => 94, 'speed_rating' => 'Y', 'is_extra_load' => true, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => true, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => true, 'manufacturer_sku' => 'BRI-TUR6-22545-94Y', 'ean' => '3286340000001', 'eu_label' => ['fuelEfficiency' => 'A', 'wetGrip' => 'A', 'externalNoise' => 69, 'noiseClass' => 'A'], 'oe_approvals' => [], 'video_url' => null, 'price_per_tyre' => 172, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 172], ['qty' => 2, 'pricePerTyre' => 168, 'saveLabel' => 'Save £8'], ['qty' => 4, 'pricePerTyre' => 164, 'saveLabel' => 'Save £32']], 'star_rating' => 4.7, 'review_count' => 243, 'stock' => 12, 'badges' => ['recommended'], 'has_active_offer' => false, 'voucher_code' => null],
            ['id' => 145606, 'slug' => 'pirelli-cinturato-p7-225-45-r17', 'brand_id' => $brandIds['pirelli'], 'tyre_category_id' => $categoryIds['run-flat'], 'model_name' => 'Cinturato P7', 'width' => 225, 'profile' => 45, 'rim' => 17, 'load_index' => 94, 'speed_rating' => 'W', 'is_extra_load' => false, 'is_run_flat' => true, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => false, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => false, 'manufacturer_sku' => 'PIR-CP7-22545-94W', 'ean' => '8019227000001', 'eu_label' => ['fuelEfficiency' => 'B', 'wetGrip' => 'A', 'externalNoise' => 71, 'noiseClass' => 'B'], 'oe_approvals' => [['code' => 'AO', 'manufacturer' => 'Audi', 'description' => 'OE for select Audi models']], 'video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'price_per_tyre' => 185, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 185], ['qty' => 2, 'pricePerTyre' => 180, 'saveLabel' => 'Save £10'], ['qty' => 4, 'pricePerTyre' => 172, 'saveLabel' => 'Save £52']], 'star_rating' => 4.6, 'review_count' => 198, 'stock' => 8, 'badges' => ['specialist'], 'has_active_offer' => true, 'voucher_code' => 'PIRELLI4'],
            ['id' => 145607, 'slug' => 'goodyear-eagle-f1-asymmetric-6-225-45-r17', 'brand_id' => $brandIds['goodyear'], 'tyre_category_id' => $categoryIds['high-performance'], 'model_name' => 'Eagle F1 Asymmetric 6', 'width' => 225, 'profile' => 45, 'rim' => 17, 'load_index' => 94, 'speed_rating' => 'Y', 'is_extra_load' => true, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => false, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => true, 'manufacturer_sku' => 'GDY-EF1-22545-94Y', 'ean' => '5452000000001', 'eu_label' => ['fuelEfficiency' => 'B', 'wetGrip' => 'A', 'externalNoise' => 70, 'noiseClass' => 'A'], 'oe_approvals' => [], 'video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'price_per_tyre' => 169, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 169], ['qty' => 2, 'pricePerTyre' => 165, 'saveLabel' => 'Save £8'], ['qty' => 4, 'pricePerTyre' => 159, 'saveLabel' => 'Save £40']], 'star_rating' => 4.7, 'review_count' => 276, 'stock' => 14, 'badges' => ['recommended'], 'has_active_offer' => true, 'voucher_code' => 'GOOD26'],
            ['id' => 145608, 'slug' => 'dunlop-sport-maxx-rt2-225-45-r17', 'brand_id' => $brandIds['dunlop'], 'tyre_category_id' => $categoryIds['high-performance'], 'model_name' => 'Sport Maxx RT2', 'width' => 225, 'profile' => 45, 'rim' => 17, 'load_index' => 94, 'speed_rating' => 'Y', 'is_extra_load' => true, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => false, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => true, 'manufacturer_sku' => 'DUN-SMRT2-22545-94Y', 'ean' => '5452000000002', 'eu_label' => ['fuelEfficiency' => 'C', 'wetGrip' => 'A', 'externalNoise' => 71, 'noiseClass' => 'B'], 'oe_approvals' => [], 'video_url' => null, 'price_per_tyre' => 158, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 158], ['qty' => 4, 'pricePerTyre' => 152, 'saveLabel' => 'Save £24']], 'star_rating' => 4.5, 'review_count' => 142, 'stock' => 18, 'badges' => [], 'has_active_offer' => false, 'voucher_code' => null],
            ['id' => 145609, 'slug' => 'hankook-ventus-prime4-225-45-r17', 'brand_id' => $brandIds['hankook'], 'tyre_category_id' => $categoryIds['car'], 'model_name' => 'Ventus Prime 4', 'width' => 225, 'profile' => 45, 'rim' => 17, 'load_index' => 94, 'speed_rating' => 'W', 'is_extra_load' => true, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => true, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => false, 'manufacturer_sku' => 'HAN-VP4-22545-94W', 'ean' => '8808563000001', 'eu_label' => ['fuelEfficiency' => 'B', 'wetGrip' => 'A', 'externalNoise' => 71, 'noiseClass' => 'B'], 'oe_approvals' => [], 'video_url' => null, 'price_per_tyre' => 119, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 119], ['qty' => 2, 'pricePerTyre' => 115, 'saveLabel' => 'Save £8'], ['qty' => 4, 'pricePerTyre' => 109, 'saveLabel' => 'Save £40']], 'star_rating' => 4.6, 'review_count' => 312, 'stock' => 22, 'badges' => ['best_buy'], 'has_active_offer' => true, 'voucher_code' => 'HANK2DEAL'],
            ['id' => 145610, 'slug' => 'falken-ziex-ze320-225-45-r17', 'brand_id' => $brandIds['falken'], 'tyre_category_id' => $categoryIds['car'], 'model_name' => 'Ziex ZE320', 'width' => 225, 'profile' => 45, 'rim' => 17, 'load_index' => 94, 'speed_rating' => 'W', 'is_extra_load' => true, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => false, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => false, 'manufacturer_sku' => 'FAL-ZE320-22545-94W', 'ean' => '4250427400001', 'eu_label' => ['fuelEfficiency' => 'C', 'wetGrip' => 'B', 'externalNoise' => 71, 'noiseClass' => 'B'], 'oe_approvals' => [], 'video_url' => null, 'price_per_tyre' => 99, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 99], ['qty' => 4, 'pricePerTyre' => 92, 'saveLabel' => 'Save £28']], 'star_rating' => 4.4, 'review_count' => 187, 'stock' => 30, 'badges' => [], 'has_active_offer' => true, 'voucher_code' => 'FALK4SAVE'],
            ['id' => 145611, 'slug' => 'michelin-primacy-4-plus-205-55-r16', 'brand_id' => $brandIds['michelin'], 'tyre_category_id' => $categoryIds['car'], 'model_name' => 'Primacy 4+', 'width' => 205, 'profile' => 55, 'rim' => 16, 'load_index' => 91, 'speed_rating' => 'V', 'is_extra_load' => false, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => false, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => true, 'manufacturer_sku' => 'MIC-PR4-20555-91V', 'ean' => '3528700000011', 'eu_label' => ['fuelEfficiency' => 'A', 'wetGrip' => 'A', 'externalNoise' => 69, 'noiseClass' => 'A'], 'oe_approvals' => [], 'video_url' => null, 'price_per_tyre' => 132, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 132], ['qty' => 4, 'pricePerTyre' => 124, 'saveLabel' => 'Save £32']], 'star_rating' => 4.8, 'review_count' => 204, 'stock' => 18, 'badges' => ['recommended'], 'has_active_offer' => true, 'voucher_code' => 'MICH26FA'],
            ['id' => 145612, 'slug' => 'falken-ziex-ze310-205-55-r16', 'brand_id' => $brandIds['falken'], 'tyre_category_id' => $categoryIds['car'], 'model_name' => 'Ziex ZE310', 'width' => 205, 'profile' => 55, 'rim' => 16, 'load_index' => 91, 'speed_rating' => 'H', 'is_extra_load' => false, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => false, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => false, 'manufacturer_sku' => 'FAL-ZE310-20555-91H', 'ean' => '4250427400012', 'eu_label' => ['fuelEfficiency' => 'C', 'wetGrip' => 'B', 'externalNoise' => 70, 'noiseClass' => 'B'], 'oe_approvals' => [], 'video_url' => null, 'price_per_tyre' => 87, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 87], ['qty' => 4, 'pricePerTyre' => 82, 'saveLabel' => 'Save £20']], 'star_rating' => 4.2, 'review_count' => 111, 'stock' => 26, 'badges' => [], 'has_active_offer' => false, 'voucher_code' => null],
            ['id' => 145613, 'slug' => 'continental-premiumcontact-7-225-45-r18', 'brand_id' => $brandIds['continental'], 'tyre_category_id' => $categoryIds['high-performance'], 'model_name' => 'PremiumContact 7', 'width' => 225, 'profile' => 45, 'rim' => 18, 'load_index' => 95, 'speed_rating' => 'Y', 'is_extra_load' => true, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => true, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => true, 'manufacturer_sku' => 'CON-PC7-22545-95Y', 'ean' => '4019238900013', 'eu_label' => ['fuelEfficiency' => 'A', 'wetGrip' => 'A', 'externalNoise' => 70, 'noiseClass' => 'A'], 'oe_approvals' => [['code' => '*', 'manufacturer' => 'BMW', 'description' => 'OE for select BMW models']], 'video_url' => null, 'price_per_tyre' => 196, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 196], ['qty' => 4, 'pricePerTyre' => 186, 'saveLabel' => 'Save £40']], 'star_rating' => 4.9, 'review_count' => 228, 'stock' => 14, 'badges' => ['recommended'], 'has_active_offer' => true, 'voucher_code' => 'COMAY26'],
            ['id' => 145614, 'slug' => 'goodyear-eagle-f1-asymmetric-6-225-45-r18', 'brand_id' => $brandIds['goodyear'], 'tyre_category_id' => $categoryIds['high-performance'], 'model_name' => 'Eagle F1 Asymmetric 6', 'width' => 225, 'profile' => 45, 'rim' => 18, 'load_index' => 95, 'speed_rating' => 'Y', 'is_extra_load' => true, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => false, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => true, 'manufacturer_sku' => 'GDY-EF1-22545-95Y', 'ean' => '5452000000014', 'eu_label' => ['fuelEfficiency' => 'B', 'wetGrip' => 'A', 'externalNoise' => 70, 'noiseClass' => 'A'], 'oe_approvals' => [], 'video_url' => null, 'price_per_tyre' => 188, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 188], ['qty' => 4, 'pricePerTyre' => 179, 'saveLabel' => 'Save £36']], 'star_rating' => 4.7, 'review_count' => 178, 'stock' => 10, 'badges' => ['recommended'], 'has_active_offer' => true, 'voucher_code' => 'GOOD26'],
            ['id' => 145615, 'slug' => 'hankook-ventus-s1-evo3-225-45-r18', 'brand_id' => $brandIds['hankook'], 'tyre_category_id' => $categoryIds['high-performance'], 'model_name' => 'Ventus S1 evo3', 'width' => 225, 'profile' => 45, 'rim' => 18, 'load_index' => 95, 'speed_rating' => 'W', 'is_extra_load' => true, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => false, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => false, 'manufacturer_sku' => 'HAN-S1E3-22545-95W', 'ean' => '8808563000015', 'eu_label' => ['fuelEfficiency' => 'B', 'wetGrip' => 'A', 'externalNoise' => 71, 'noiseClass' => 'B'], 'oe_approvals' => [], 'video_url' => null, 'price_per_tyre' => 149, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 149], ['qty' => 4, 'pricePerTyre' => 142, 'saveLabel' => 'Save £28']], 'star_rating' => 4.5, 'review_count' => 132, 'stock' => 9, 'badges' => [], 'has_active_offer' => true, 'voucher_code' => 'HANK2DEAL'],
            ['id' => 145616, 'slug' => 'continental-sportcontact-7-255-40-r18', 'brand_id' => $brandIds['continental'], 'tyre_category_id' => $categoryIds['high-performance'], 'model_name' => 'SportContact 7', 'width' => 255, 'profile' => 40, 'rim' => 18, 'load_index' => 99, 'speed_rating' => 'Y', 'is_extra_load' => true, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => false, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => true, 'manufacturer_sku' => 'CON-SC7-25540-99Y', 'ean' => '4019238900016', 'eu_label' => ['fuelEfficiency' => 'B', 'wetGrip' => 'A', 'externalNoise' => 72, 'noiseClass' => 'B'], 'oe_approvals' => [['code' => '*', 'manufacturer' => 'BMW', 'description' => 'OE for select BMW models']], 'video_url' => null, 'price_per_tyre' => 224, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 224], ['qty' => 2, 'pricePerTyre' => 216, 'saveLabel' => 'Save £16']], 'star_rating' => 4.9, 'review_count' => 94, 'stock' => 8, 'badges' => ['recommended'], 'has_active_offer' => true, 'voucher_code' => 'COMAY26'],
            ['id' => 145617, 'slug' => 'goodyear-eagle-f1-asymmetric-6-255-40-r18', 'brand_id' => $brandIds['goodyear'], 'tyre_category_id' => $categoryIds['high-performance'], 'model_name' => 'Eagle F1 Asymmetric 6', 'width' => 255, 'profile' => 40, 'rim' => 18, 'load_index' => 99, 'speed_rating' => 'Y', 'is_extra_load' => true, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => false, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => true, 'manufacturer_sku' => 'GDY-EF1-25540-99Y', 'ean' => '5452000000017', 'eu_label' => ['fuelEfficiency' => 'B', 'wetGrip' => 'A', 'externalNoise' => 71, 'noiseClass' => 'A'], 'oe_approvals' => [], 'video_url' => null, 'price_per_tyre' => 209, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 209], ['qty' => 2, 'pricePerTyre' => 201, 'saveLabel' => 'Save £16']], 'star_rating' => 4.7, 'review_count' => 87, 'stock' => 11, 'badges' => ['recommended'], 'has_active_offer' => true, 'voucher_code' => 'GOOD26'],
            ['id' => 145618, 'slug' => 'hankook-ventus-s1-evo3-255-40-r18', 'brand_id' => $brandIds['hankook'], 'tyre_category_id' => $categoryIds['high-performance'], 'model_name' => 'Ventus S1 evo3', 'width' => 255, 'profile' => 40, 'rim' => 18, 'load_index' => 96, 'speed_rating' => 'W', 'is_extra_load' => false, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => false, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => false, 'manufacturer_sku' => 'HAN-S1E3-25540-96W', 'ean' => '8808563000018', 'eu_label' => ['fuelEfficiency' => 'B', 'wetGrip' => 'A', 'externalNoise' => 72, 'noiseClass' => 'B'], 'oe_approvals' => [], 'video_url' => null, 'price_per_tyre' => 164, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 164], ['qty' => 2, 'pricePerTyre' => 158, 'saveLabel' => 'Save £12']], 'star_rating' => 4.3, 'review_count' => 64, 'stock' => 15, 'badges' => [], 'has_active_offer' => true, 'voucher_code' => 'HANK2DEAL'],
            ['id' => 145619, 'slug' => 'pirelli-p-zero-pz4-225-40-r19', 'brand_id' => $brandIds['pirelli'], 'tyre_category_id' => $categoryIds['high-performance'], 'model_name' => 'P Zero PZ4', 'width' => 225, 'profile' => 40, 'rim' => 19, 'load_index' => 93, 'speed_rating' => 'Y', 'is_extra_load' => false, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => false, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => true, 'manufacturer_sku' => 'PIR-PZ4-22540-93Y', 'ean' => '8019227000019', 'eu_label' => ['fuelEfficiency' => 'B', 'wetGrip' => 'A', 'externalNoise' => 71, 'noiseClass' => 'A'], 'oe_approvals' => [['code' => '*', 'manufacturer' => 'BMW', 'description' => 'OE for select BMW models']], 'video_url' => null, 'price_per_tyre' => 236, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 236], ['qty' => 2, 'pricePerTyre' => 229, 'saveLabel' => 'Save £14']], 'star_rating' => 4.8, 'review_count' => 76, 'stock' => 6, 'badges' => ['specialist'], 'has_active_offer' => true, 'voucher_code' => 'PIRELLI4'],
            ['id' => 145620, 'slug' => 'goodyear-eagle-f1-asymmetric-6-255-35-r19', 'brand_id' => $brandIds['goodyear'], 'tyre_category_id' => $categoryIds['high-performance'], 'model_name' => 'Eagle F1 Asymmetric 6', 'width' => 255, 'profile' => 35, 'rim' => 19, 'load_index' => 96, 'speed_rating' => 'Y', 'is_extra_load' => false, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => false, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => true, 'manufacturer_sku' => 'GDY-EF1-25535-96Y', 'ean' => '5452000000020', 'eu_label' => ['fuelEfficiency' => 'B', 'wetGrip' => 'A', 'externalNoise' => 71, 'noiseClass' => 'A'], 'oe_approvals' => [], 'video_url' => null, 'price_per_tyre' => 228, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 228], ['qty' => 2, 'pricePerTyre' => 221, 'saveLabel' => 'Save £14']], 'star_rating' => 4.7, 'review_count' => 69, 'stock' => 9, 'badges' => ['recommended'], 'has_active_offer' => true, 'voucher_code' => 'GOOD26'],
            ['id' => 145621, 'slug' => 'michelin-pilot-sport-5-205-40-r18', 'brand_id' => $brandIds['michelin'], 'tyre_category_id' => $categoryIds['high-performance'], 'model_name' => 'Pilot Sport 5', 'width' => 205, 'profile' => 40, 'rim' => 18, 'load_index' => 86, 'speed_rating' => 'V', 'is_extra_load' => false, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => false, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => true, 'manufacturer_sku' => 'MIC-PS5-20540-86V', 'ean' => '3528700000021', 'eu_label' => ['fuelEfficiency' => 'B', 'wetGrip' => 'A', 'externalNoise' => 70, 'noiseClass' => 'A'], 'oe_approvals' => [], 'video_url' => null, 'price_per_tyre' => 174, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 174], ['qty' => 2, 'pricePerTyre' => 169, 'saveLabel' => 'Save £10'], ['qty' => 4, 'pricePerTyre' => 162, 'saveLabel' => 'Save £48']], 'star_rating' => 4.8, 'review_count' => 156, 'stock' => 12, 'badges' => ['recommended'], 'has_active_offer' => true, 'voucher_code' => 'MICH26FA'],
            ['id' => 145622, 'slug' => 'continental-premiumcontact-7-205-40-r18', 'brand_id' => $brandIds['continental'], 'tyre_category_id' => $categoryIds['car'], 'model_name' => 'PremiumContact 7', 'width' => 205, 'profile' => 40, 'rim' => 18, 'load_index' => 86, 'speed_rating' => 'V', 'is_extra_load' => false, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => true, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => true, 'manufacturer_sku' => 'CON-PC7-20540-86V', 'ean' => '4019238900022', 'eu_label' => ['fuelEfficiency' => 'A', 'wetGrip' => 'A', 'externalNoise' => 69, 'noiseClass' => 'A'], 'oe_approvals' => [], 'video_url' => null, 'price_per_tyre' => 161, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 161], ['qty' => 2, 'pricePerTyre' => 156, 'saveLabel' => 'Save £10'], ['qty' => 4, 'pricePerTyre' => 149, 'saveLabel' => 'Save £48']], 'star_rating' => 4.9, 'review_count' => 143, 'stock' => 10, 'badges' => ['best_buy', 'recommended'], 'has_active_offer' => true, 'voucher_code' => 'COMAY26'],
            ['id' => 145623, 'slug' => 'hankook-ventus-prime4-205-40-r18', 'brand_id' => $brandIds['hankook'], 'tyre_category_id' => $categoryIds['car'], 'model_name' => 'Ventus Prime 4', 'width' => 205, 'profile' => 40, 'rim' => 18, 'load_index' => 86, 'speed_rating' => 'V', 'is_extra_load' => false, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => false, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => false, 'manufacturer_sku' => 'HAN-VP4-20540-86V', 'ean' => '8808563000023', 'eu_label' => ['fuelEfficiency' => 'B', 'wetGrip' => 'A', 'externalNoise' => 71, 'noiseClass' => 'B'], 'oe_approvals' => [], 'video_url' => null, 'price_per_tyre' => 124, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 124], ['qty' => 2, 'pricePerTyre' => 119, 'saveLabel' => 'Save £10'], ['qty' => 4, 'pricePerTyre' => 114, 'saveLabel' => 'Save £40']], 'star_rating' => 4.6, 'review_count' => 118, 'stock' => 18, 'badges' => ['best_buy'], 'has_active_offer' => true, 'voucher_code' => 'HANK2DEAL'],
            ['id' => 145624, 'slug' => 'falken-ziex-ze320-205-40-r18', 'brand_id' => $brandIds['falken'], 'tyre_category_id' => $categoryIds['car'], 'model_name' => 'Ziex ZE320', 'width' => 205, 'profile' => 40, 'rim' => 18, 'load_index' => 86, 'speed_rating' => 'V', 'is_extra_load' => false, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => false, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => false, 'manufacturer_sku' => 'FAL-ZE320-20540-86V', 'ean' => '4250427400024', 'eu_label' => ['fuelEfficiency' => 'C', 'wetGrip' => 'B', 'externalNoise' => 71, 'noiseClass' => 'B'], 'oe_approvals' => [], 'video_url' => null, 'price_per_tyre' => 102, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 102], ['qty' => 4, 'pricePerTyre' => 95, 'saveLabel' => 'Save £28']], 'star_rating' => 4.4, 'review_count' => 94, 'stock' => 20, 'badges' => [], 'has_active_offer' => true, 'voucher_code' => 'FALK4SAVE'],
            ['id' => 145625, 'slug' => 'michelin-primacy-4-plus-185-55-r16', 'brand_id' => $brandIds['michelin'], 'tyre_category_id' => $categoryIds['car'], 'model_name' => 'Primacy 4+', 'width' => 185, 'profile' => 55, 'rim' => 16, 'load_index' => 87, 'speed_rating' => 'V', 'is_extra_load' => true, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => false, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => true, 'manufacturer_sku' => 'MIC-PR4-18555-87V', 'ean' => '3528700000025', 'eu_label' => ['fuelEfficiency' => 'A', 'wetGrip' => 'A', 'externalNoise' => 68, 'noiseClass' => 'A'], 'oe_approvals' => [], 'video_url' => null, 'price_per_tyre' => 118, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 118], ['qty' => 2, 'pricePerTyre' => 114, 'saveLabel' => 'Save £8'], ['qty' => 4, 'pricePerTyre' => 108, 'saveLabel' => 'Save £40']], 'star_rating' => 4.7, 'review_count' => 88, 'stock' => 16, 'badges' => ['recommended'], 'has_active_offer' => true, 'voucher_code' => 'MICH26FA'],
            ['id' => 145626, 'slug' => 'goodyear-efficientgrip-performance-2-185-55-r16', 'brand_id' => $brandIds['goodyear'], 'tyre_category_id' => $categoryIds['car'], 'model_name' => 'EfficientGrip Performance 2', 'width' => 185, 'profile' => 55, 'rim' => 16, 'load_index' => 83, 'speed_rating' => 'V', 'is_extra_load' => false, 'is_run_flat' => false, 'is_winter' => false, 'is_all_season' => false, 'is_ev_rated' => false, 'is_van' => false, 'is_4x4' => false, 'is_available_within_24h' => true, 'manufacturer_sku' => 'GDY-EGP2-18555-83V', 'ean' => '5452000000025', 'eu_label' => ['fuelEfficiency' => 'A', 'wetGrip' => 'A', 'externalNoise' => 69, 'noiseClass' => 'A'], 'oe_approvals' => [], 'video_url' => null, 'price_per_tyre' => 96, 'quantity_tiers' => [['qty' => 1, 'pricePerTyre' => 96], ['qty' => 2, 'pricePerTyre' => 92, 'saveLabel' => 'Save £8'], ['qty' => 4, 'pricePerTyre' => 88, 'saveLabel' => 'Save £32']], 'star_rating' => 4.5, 'review_count' => 112, 'stock' => 22, 'badges' => [], 'has_active_offer' => true, 'voucher_code' => 'GOOD26'],
        ];

        foreach ($skus as $sku) {
            TyreSku::updateOrCreate(['id' => $sku['id']], $sku);
        }
    }
}
