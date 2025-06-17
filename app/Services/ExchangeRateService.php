<?php

namespace App\Services;

use App\Models\Currency;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ExchangeRateService
{
    protected array $apiEndpoints = [
        'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1',
        'https://latest.currency-api.pages.dev/v1',
        'https://currency-api.pages.dev/v1'
    ];

    protected int $cacheExpiry = 3600; // 1 hour
    protected int $retryAttempts = 3;

    /**
     * Get available currencies from the API
     */
    public function getAvailableCurrencies(): array
    {
        return Cache::remember('exchange_api_currencies', 86400, function () {
            foreach ($this->apiEndpoints as $endpoint) {
                try {
                    $response = Http::timeout(10)->get("{$endpoint}/currencies.json");
                    
                    if ($response->successful()) {
                        $data = $response->json();
                        Log::info("Successfully fetched currencies from: {$endpoint}");
                        return $data;
                    }
                } catch (\Exception $e) {
                    Log::warning("Failed to fetch currencies from {$endpoint}: " . $e->getMessage());
                    continue;
                }
            }
            
            throw new \Exception('All exchange rate API endpoints failed');
        });
    }

    /**
     * Get exchange rates for a specific base currency
     * 
     * @param string $baseCurrency The base currency code (lowercase)
     * @param array $onlyCurrencies Optional array of currency codes to fetch (lowercase)
     * @return array
     */
    public function getExchangeRates(string $baseCurrency = 'usd', array $onlyCurrencies = []): array
    {
        $baseCurrency = strtolower($baseCurrency);
        $cacheKey = "exchange_rates_{$baseCurrency}";
        
        // If we're only requesting specific currencies, add them to the cache key
        if (!empty($onlyCurrencies)) {
            sort($onlyCurrencies); // Ensure consistent key regardless of array order
            $cacheKey .= '_' . implode('_', $onlyCurrencies);
        }
        
        return Cache::remember($cacheKey, $this->cacheExpiry, function () use ($baseCurrency, $onlyCurrencies) {
            foreach ($this->apiEndpoints as $endpoint) {
                try {
                    // Log which currencies we're trying to fetch
                    if (!empty($onlyCurrencies)) {
                        Log::info("Fetching rates for {$baseCurrency} with filter: " . implode(', ', $onlyCurrencies));
                    }
                    
                    $response = Http::timeout(15)->get("{$endpoint}/currencies/{$baseCurrency}.json");
                    
                    if ($response->successful()) {
                        $data = $response->json();
                        
                        if (isset($data[$baseCurrency])) {
                            Log::info("Successfully fetched exchange rates for {$baseCurrency} from: {$endpoint}");
                            
                            // If we only want specific currencies, filter the response
                            if (!empty($onlyCurrencies)) {
                                $filteredRates = [];
                                foreach ($data[$baseCurrency] as $currency => $rate) {
                                    if (in_array($currency, $onlyCurrencies)) {
                                        $filteredRates[$currency] = $rate;
                                    }
                                }
                                return $filteredRates;
                            }
                            
                            return $data[$baseCurrency];
                        }
                    }
                } catch (\Exception $e) {
                    Log::warning("Failed to fetch rates from {$endpoint}: " . $e->getMessage());
                    continue;
                }
            }
            
            throw new \Exception("Failed to fetch exchange rates for {$baseCurrency} from all endpoints");
        });
    }

    /**
     * Convert amount between two currencies
     */
    public function convertAmount(float $amount, string $fromCurrency, string $toCurrency): float
    {
        if (strtolower($fromCurrency) === strtolower($toCurrency)) {
            return $amount;
        }

        $fromCurrency = strtolower($fromCurrency);
        $toCurrency = strtolower($toCurrency);

        // Try to get direct conversion rate
        $cacheKey = "conversion_{$fromCurrency}_{$toCurrency}";
        
        $rate = Cache::remember($cacheKey, $this->cacheExpiry, function () use ($fromCurrency, $toCurrency) {
            foreach ($this->apiEndpoints as $endpoint) {
                try {
                    $response = Http::timeout(10)->get("{$endpoint}/currencies/{$fromCurrency}.json");
                    
                    if ($response->successful()) {
                        $data = $response->json();
                        
                        if (isset($data[$fromCurrency][$toCurrency])) {
                            return $data[$fromCurrency][$toCurrency];
                        }
                    }
                } catch (\Exception $e) {
                    Log::warning("Direct conversion failed from {$endpoint}: " . $e->getMessage());
                    continue;
                }
            }
            
            // If direct conversion fails, try via USD
            return $this->convertViaUSD($fromCurrency, $toCurrency);
        });

        return $amount * $rate;
    }

    /**
     * Convert amount to user's default currency
     */
    public function convertToUserCurrency(float $amount, string $fromCurrency, $user = null): float
    {
        $user = $user ?: auth()->user();
        
        if (!$user || !$user->currency) {
            Log::warning('No user or user currency found, falling back to system default');
            $defaultCurrency = Currency::where('is_default', true)->first();
            return $defaultCurrency ? $this->convertAmount($amount, $fromCurrency, $defaultCurrency->code) : $amount;
        }

        return $this->convertAmount($amount, $fromCurrency, $user->currency->code);
    }

    /**
     * Convert amount from user's default currency to target currency
     */
    public function convertFromUserCurrency(float $amount, string $toCurrency, $user = null): float
    {
        $user = $user ?: auth()->user();
        
        if (!$user || !$user->currency) {
            Log::warning('No user or user currency found, falling back to system default');
            $defaultCurrency = Currency::where('is_default', true)->first();
            return $defaultCurrency ? $this->convertAmount($amount, $defaultCurrency->code, $toCurrency) : $amount;
        }

        return $this->convertAmount($amount, $user->currency->code, $toCurrency);
    }

    /**
     * Get user's default currency code
     */
    public function getUserCurrencyCode($user = null): string
    {
        $user = $user ?: auth()->user();
        
        if (!$user || !$user->currency) {
            $defaultCurrency = Currency::where('is_default', true)->first();
            return $defaultCurrency ? $defaultCurrency->code : 'USD';
        }

        return $user->currency->code;
    }

    /**
     * Convert via USD if direct conversion is not available
     */
    protected function convertViaUSD(string $fromCurrency, string $toCurrency): float
    {
        if ($fromCurrency === 'usd') {
            $usdRates = $this->getExchangeRates('usd', [$toCurrency]);
            return $usdRates[$toCurrency] ?? 1;
        }
        
        if ($toCurrency === 'usd') {
            $fromRates = $this->getExchangeRates($fromCurrency, ['usd']);
            return $fromRates['usd'] ?? 1;
        }

        // Convert from -> USD -> to
        $fromRates = $this->getExchangeRates($fromCurrency, ['usd']);
        $usdRates = $this->getExchangeRates('usd', [$toCurrency]);
        
        $toUsdRate = $fromRates['usd'] ?? 1;
        $fromUsdRate = $usdRates[$toCurrency] ?? 1;
        
        return $toUsdRate * $fromUsdRate;
    }

    /**
     * Update exchange rates for all currencies in the database
     * 
     * @param array $onlyCurrencies Optional array of currency codes to update (lowercase)
     * @return array
     */
    public function updateDatabaseRates(array $onlyCurrencies = []): array
    {
        $baseCurrency = Currency::where('is_default', true)->first();
        
        if (!$baseCurrency) {
            throw new \Exception('No base currency set in the system');
        }

        $updated = [];
        $failed = [];
        
        try {
            // Get exchange rates - only for the currencies we need
            $currencyCodes = [];
            if (!empty($onlyCurrencies)) {
                $currencyCodes = array_map('strtolower', $onlyCurrencies);
            }
            
            $rates = $this->getExchangeRates(strtolower($baseCurrency->code), $currencyCodes);
            
            // Get currencies to update
            $query = Currency::where('is_default', false);
            
            // If specific currencies are requested, only update those
            if (!empty($onlyCurrencies)) {
                $query->whereIn(DB::raw('LOWER(code)'), array_map('strtolower', $onlyCurrencies));
                Log::info('Selectively updating rates only for currencies: ' . implode(', ', $onlyCurrencies));
            }
            
            $currencies = $query->get();
            
            foreach ($currencies as $currency) {
                $currencyCode = strtolower($currency->code);
                
                if (isset($rates[$currencyCode])) {
                    $oldRate = $currency->exchange_rate;
                    $newRate = $rates[$currencyCode];
                    
                    $currency->update([
                        'exchange_rate' => $newRate,
                        'last_updated' => now()
                    ]);
                    
                    $updated[] = [
                        'currency' => $currency->code,
                        'old_rate' => $oldRate,
                        'new_rate' => $newRate,
                        'change_percent' => $oldRate > 0 ? (($newRate - $oldRate) / $oldRate) * 100 : 0
                    ];
                    
                    Log::info("Updated {$currency->code} rate from {$oldRate} to {$newRate}");
                } else {
                    $failed[] = $currency->code;
                    Log::warning("No exchange rate found for {$currency->code}");
                }
            }
            
            // Clear relevant caches
            $this->clearRateCache();
            
        } catch (\Exception $e) {
            Log::error("Failed to update exchange rates: " . $e->getMessage());
            throw $e;
        }

        return [
            'updated' => $updated,
            'failed' => $failed,
            'timestamp' => now()->toISOString()
        ];
    }

    /**
     * Update exchange rates specifically for user's currency needs
     */
    public function updateUserCurrencyRates($user = null): array
    {
        $user = $user ?: auth()->user();
        
        if (!$user) {
            return $this->updateDatabaseRates();
        }

        // Get user's currency and any displayed currencies
        $currenciesToUpdate = [];
        
        if ($user->currency) {
            $currenciesToUpdate[] = $user->currency->code;
        }
        
        if ($user->displayed_currencies && is_array($user->displayed_currencies)) {
            $displayedCurrencyCodes = Currency::whereIn('id', $user->displayed_currencies)
                ->pluck('code')
                ->toArray();
            $currenciesToUpdate = array_merge($currenciesToUpdate, $displayedCurrencyCodes);
        }
        
        $currenciesToUpdate = array_unique($currenciesToUpdate);
        
        Log::info("Updating exchange rates for user {$user->id} currencies: " . implode(', ', $currenciesToUpdate));
        
        return $this->updateDatabaseRates($currenciesToUpdate);
    }

    /**
     * Get the last update timestamp
     */
    public function getLastUpdateTime(): ?Carbon
    {
        $currency = Currency::where('is_default', false)
            ->whereNotNull('last_updated')
            ->orderBy('last_updated', 'desc')
            ->first();
            
        return $currency?->last_updated;
    }

    /**
     * Check if rates need updating (older than 1 hour)
     */
    public function ratesNeedUpdate(): bool
    {
        $lastUpdate = $this->getLastUpdateTime();
        
        if (!$lastUpdate) {
            return true;
        }
        
        return $lastUpdate->diffInHours(now()) >= 1;
    }

    /**
     * Clear exchange rate related cache
     */
    public function clearRateCache(): void
    {
        $patterns = [
            'exchange_rates_*',
            'conversion_*',
            'exchange_api_currencies'
        ];
        
        foreach ($patterns as $pattern) {
            Cache::forget($pattern);
        }
        
        // Clear specific cache keys for common currencies
        $commonCurrencies = ['usd', 'eur', 'gbp', 'jpy', 'cad', 'aud'];
        foreach ($commonCurrencies as $currency) {
            Cache::forget("exchange_rates_{$currency}");
        }
    }

    /**
     * Validate currency code format
     */
    public function isValidCurrencyCode(string $code): bool
    {
        return preg_match('/^[A-Z]{3}$/', strtoupper($code));
    }

    /**
     * Get supported currency codes
     */
    public function getSupportedCurrencies(): array
    {
        try {
            $currencies = $this->getAvailableCurrencies();
            return array_keys($currencies);
        } catch (\Exception $e) {
            // Return common currencies as fallback
            return ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NZD'];
        }
    }

    /**
     * Monitor API endpoint health
     */
    public function monitorApiHealth(): array
    {
        $results = [];
        
        foreach ($this->apiEndpoints as $endpoint) {
            $startTime = microtime(true);
            
            try {
                $response = Http::timeout(10)->get("{$endpoint}/currencies/usd.json");
                $responseTime = round((microtime(true) - $startTime) * 1000);
                
                if ($response->successful()) {
                    $data = $response->json();
                    
                    if (isset($data['usd'])) {
                        $results[] = [
                            'endpoint' => $endpoint,
                            'status' => 'healthy',
                            'response_time_ms' => $responseTime,
                            'http_status' => $response->status(),
                            'currencies_count' => count($data['usd'])
                        ];
                    } else {
                        $results[] = [
                            'endpoint' => $endpoint,
                            'status' => 'error',
                            'response_time_ms' => $responseTime,
                            'http_status' => $response->status(),
                            'error' => 'Invalid response structure'
                        ];
                    }
                } else {
                    $results[] = [
                        'endpoint' => $endpoint,
                        'status' => 'failed',
                        'response_time_ms' => $responseTime,
                        'http_status' => $response->status(),
                        'error' => 'HTTP error'
                    ];
                }
            } catch (\Exception $e) {
                $responseTime = round((microtime(true) - $startTime) * 1000);
                $results[] = [
                    'endpoint' => $endpoint,
                    'status' => 'failed',
                    'response_time_ms' => $responseTime,
                    'error' => $e->getMessage()
                ];
            }
        }
        
        return $results;
    }

    /**
     * Get update statistics
     */
    public function getUpdateStatistics(): array
    {
        $totalCurrencies = Currency::count();
        $currenciesWithRates = Currency::whereNotNull('exchange_rate')
                                     ->where('exchange_rate', '>', 0)
                                     ->count();
        $defaultCurrency = Currency::where('is_default', true)->first();
        $lastUpdate = $this->getLastUpdateTime();
        $currenciesNeverUpdated = Currency::whereNull('last_updated')
                                        ->where('is_default', false)
                                        ->count();
        $staleCurrencies = Currency::where('last_updated', '<', now()->subHours(24))
                                 ->where('is_default', false)
                                 ->count();
        
        return [
            'total_currencies' => $totalCurrencies,
            'currencies_with_rates' => $currenciesWithRates,
            'default_currency' => $defaultCurrency?->code,
            'last_update' => $lastUpdate?->toISOString(),
            'update_needed' => $this->ratesNeedUpdate(),
            'currencies_never_updated' => $currenciesNeverUpdated,
            'stale_currencies' => $staleCurrencies
        ];
    }

    /**
     * Validate currency data integrity
     */
    public function validateCurrencyIntegrity(): array
    {
        $issues = [];
        $fixes = [];
        
        // Check for duplicate currencies
        $duplicateCurrencies = Currency::select('code')
                                     ->groupBy('code')
                                     ->havingRaw('COUNT(*) > 1')
                                     ->pluck('code');
        
        if ($duplicateCurrencies->isNotEmpty()) {
            foreach ($duplicateCurrencies as $code) {
                $duplicates = Currency::where('code', $code)->orderBy('id')->get();
                $keep = $duplicates->first();
                $toDelete = $duplicates->skip(1);
                
                $issues[] = "Duplicate currencies found: {$code}";
                
                foreach ($toDelete as $duplicate) {
                    $duplicate->delete();
                    $fixes[] = "Removed duplicate currency: {$code} (ID: {$duplicate->id})";
                }
            }
        }
        
        // Check for missing default currency
        $defaultCurrency = Currency::where('is_default', true)->first();
        if (!$defaultCurrency) {
            $issues[] = "No default currency set";
            
            // Try to set USD as default if it exists
            $usd = Currency::where('code', 'USD')->first();
            if ($usd) {
                $usd->update(['is_default' => true]);
                $fixes[] = "Set USD as default currency";
            }
        }
        
        // Check for multiple default currencies
        $defaultCount = Currency::where('is_default', true)->count();
        if ($defaultCount > 1) {
            $issues[] = "Multiple default currencies found";
            
            $defaults = Currency::where('is_default', true)->get();
            $keep = $defaults->first();
            
            foreach ($defaults->skip(1) as $default) {
                $default->update(['is_default' => false]);
                $fixes[] = "Removed default flag from {$default->code}";
            }
        }
        
        // Check for invalid exchange rates
        $invalidRates = Currency::where('exchange_rate', '<=', 0)
                              ->where('is_default', false)
                              ->count();
        
        if ($invalidRates > 0) {
            $issues[] = "{$invalidRates} currencies have invalid exchange rates";
        }
        
        return [
            'integrity_status' => empty($issues) ? 'healthy' : 'issues_found',
            'issues_found' => $issues,
            'fixes_applied' => $fixes
        ];
    }

    /**
     * Generate comprehensive status report
     */
    public function generateStatusReport(): array
    {
        return [
            'api_health' => $this->monitorApiHealth(),
            'update_statistics' => $this->getUpdateStatistics(),
            'integrity_check' => $this->validateCurrencyIntegrity(),
            'cache_status' => $this->getCacheStatus(),
            'report_generated_at' => now()->toISOString()
        ];
    }

    /**
     * Get cache status information
     */
    private function getCacheStatus(): array
    {
        return [
            'cache_driver' => config('cache.default'),
            'cache_expiry_hours' => $this->cacheExpiry / 3600,
            'cached_currencies_exist' => Cache::has('exchange_api_currencies')
        ];
    }
}
