<?php

namespace App\Http\Middleware;

use App\Models\Currency;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CurrencyCheck
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            // Check if we have a default currency
            $defaultCurrency = Currency::getDefaultCurrency();
            if (!$defaultCurrency) {
                Log::error('Currency check failed: No default currency set');
                
                if ($request->expectsJson()) {
                    return response()->json([
                        'error' => 'System configuration error: No default currency set'
                    ], 500);
                }
                
                return redirect()->route('dashboard')
                    ->with('error', 'System configuration error: No default currency set. Please contact administrator.');
            }

            // Validate currency configuration
            $totalCurrencies = Currency::count();
            Log::debug('Currency validation', ['total_currencies' => $totalCurrencies]);

            $defaultCurrencyCheck = Currency::where('code', $defaultCurrency->code)->first();
            Log::debug('Default currency check', [
                'exists' => $defaultCurrencyCheck ? true : false,
                'code' => $defaultCurrencyCheck ? $defaultCurrencyCheck->code : 'not found',
                'is_active' => $defaultCurrencyCheck ? $defaultCurrencyCheck->is_active : false
            ]);

            $activeCurrencies = Currency::where('is_active', true)->count();
            Log::debug('Active currencies', ['count' => $activeCurrencies]);

            // Check if we have any active currencies
            if ($totalCurrencies === 0 || $activeCurrencies === 0) {
                Log::error('Currency check failed: No active currencies available');
                
                if ($request->expectsJson()) {
                    return response()->json([
                        'error' => 'System configuration error: No active currencies available'
                    ], 500);
                }
                
                return redirect()->route('dashboard')
                    ->with('error', 'System configuration error: No active currencies available. Please contact administrator.');
            }

            // Check if default currency is active
            if (!$defaultCurrencyCheck || !$defaultCurrencyCheck->is_active) {
                Log::error('Currency check failed: Default currency is not active');
                
                if ($request->expectsJson()) {
                    return response()->json([
                        'error' => 'System configuration error: Default currency is not active'
                    ], 500);
                }
                
                return redirect()->route('dashboard')
                    ->with('error', 'System configuration error: Default currency is not active. Please contact administrator.');
            }

            Log::debug('Currency check passed', [
                'default_currency' => $defaultCurrency->code,
                'active_currencies' => $activeCurrencies
            ]);

        } catch (\Exception $e) {
            Log::error('Currency check middleware failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Currency validation failed'
                ], 500);
            }
            
            return redirect()->route('dashboard')
                ->with('error', 'Currency validation failed. Please contact administrator.');
        }

        return $next($request);
    }
}