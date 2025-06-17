<?php

namespace App\Providers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class PerformanceServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Cache routes in production
        if ($this->app->environment('production')) {
            $this->cacheRoutesInProduction();
        }
        
        // Add shared data caching
        $this->cacheFrequentlyAccessedData();
    }    /**
     * Cache routes in production environment
     */
    private function cacheRoutesInProduction(): void
    {
        // In Laravel 12, route caching is handled automatically by the framework
        // No need to manually load routes in service providers
    }
      /**
     * Cache frequently accessed data that rarely changes
     */
    private function cacheFrequentlyAccessedData(): void
    {
        // This method is now empty as route registration should not be done in service providers
        // Currency caching can be done in the CurrencyController directly
    }
}