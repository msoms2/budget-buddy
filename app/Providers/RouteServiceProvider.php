<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\RateLimiter as RateLimiterFacade;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to your application's "home" route.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/dashboard';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     */
    public function boot(): void
    {
        Route::bind('transaction', function ($value) {
            // Handle expense transactions
            if (str_starts_with($value, 'expense-')) {
                $id = substr($value, 8);
                return \App\Models\Expense::findOrFail($id);
            }
            // Handle income transactions
            elseif (str_starts_with($value, 'income-')) {
                $id = substr($value, 7);
                return \App\Models\Earning::findOrFail($id);
            }
            
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException;
        });
        
        RateLimiterFacade::for('api', function (Request $request) {
            return RateLimiter::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }
}