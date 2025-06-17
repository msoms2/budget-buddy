<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use App\Models\Expense;
use App\Observers\ExpenseObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // 
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register model observers
        Expense::observe(ExpenseObserver::class);
        
        // Optimize database performance
        Schema::defaultStringLength(191);
        
        // Prefetch Vite assets
        Vite::prefetch(concurrency: 3);
        
        // Enable strict mode only in development environments
        Model::preventLazyLoading(!$this->app->isProduction());
        
        // Add query time logging in local environment
        if ($this->app->environment('local')) {
            DB::listen(function($query) {
                if ($query->time > 100) {
                    logger('SLOW QUERY: ' . $query->sql, [
                        'bindings' => $query->bindings,
                        'time' => $query->time
                    ]);
                }
            });
        }

        if ($this->app->environment('local') && isset($_SERVER['HTTP_X_ORIGINAL_HOST'])) {
            $this->app['url']->forceRootUrl(env('APP_URL'));
        }
    }
}
