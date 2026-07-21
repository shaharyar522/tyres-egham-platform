<?php

namespace App\Providers;

use App\Console\Commands\ImportFalkenZiexZe320CsvCommand;
use App\Console\Commands\BuildReferenceTyreCacheCommand;
use App\Console\Commands\ImportReferenceTyreListingsCommand;
use App\Console\Commands\SyncContinentalPatternCsvCommand;
use App\Contracts\FitmentResolverInterface;
use App\Services\DatabaseFitmentResolver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(FitmentResolverInterface::class, DatabaseFitmentResolver::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->commands([
                ImportFalkenZiexZe320CsvCommand::class,
                BuildReferenceTyreCacheCommand::class,
                ImportReferenceTyreListingsCommand::class,
                SyncContinentalPatternCsvCommand::class,
            ]);
        }
    }
}
