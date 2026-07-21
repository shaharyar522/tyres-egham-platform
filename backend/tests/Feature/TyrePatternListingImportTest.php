<?php

namespace Tests\Feature;

use App\Models\TyrePatternListing;
use Database\Seeders\BaselineDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class TyrePatternListingImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_sync_creates_rows_from_csv(): void
    {
        $this->seed(BaselineDataSeeder::class);

        $csv = storage_path('framework/testing/continental_test.csv');
        File::ensureDirectoryExists(dirname($csv));
        File::put($csv, implode("\n", [
            'brand,model_name,price_from_gbp,rating_out_of_5,detail_path,detail_url,brand_list_url',
            'Continental,TestPattern,99.50,4.2,/tyre/details/continental/test-pattern,https://www.eghamtyres.co.uk/tyre/details/continental/test-pattern,https://www.eghamtyres.co.uk/tyre/brand/1231/continental-tyres',
        ]));

        $this->artisan('tyres:sync-continental-pattern-csv', ['--path' => $csv])
            ->assertSuccessful();

        $this->assertDatabaseHas('tyre_pattern_listings', [
            'pattern_key' => '/tyre/details/continental/test-pattern',
            'model_name' => 'TestPattern',
        ]);

        $this->artisan('tyres:sync-continental-pattern-csv', ['--path' => $csv])
            ->assertSuccessful();

        $this->assertSame(1, TyrePatternListing::query()->count());
    }
}
