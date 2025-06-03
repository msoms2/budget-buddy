<?php

namespace App\Providers;

use App\Services\ExchangeRateService;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Log;

class CurrencyServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(ExchangeRateService::class, function ($app) {
            return new ExchangeRateService();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Only run in production to avoid unnecessary API calls during development
        if ($this->app->environment('production')) {
            try {
                $exchangeService = app(ExchangeRateService::class);
                
                if ($exchangeService->ratesNeedUpdate()) {
                    // Add to queue instead of running synchronously
                    \Illuminate\Support\Facades\Queue::push(new \App\Jobs\UpdateExchangeRates());
                    
                    Log::info('Queued exchange rate update job on application boot');
                }
            } catch (\Exception $e) {
                // Log error but don't crash application boot
                Log::error('Failed to check exchange rates during boot: ' . $e->getMessage());
            }
        }
    }
}
