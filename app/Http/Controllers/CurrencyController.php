<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use App\Models\Currency;
use App\Models\User;
use App\Services\ExchangeRateService;

class CurrencyController extends Controller
{
    protected ExchangeRateService $exchangeRateService;

    public function __construct(ExchangeRateService $exchangeRateService)
    {
        $this->exchangeRateService = $exchangeRateService;
    }

    /**
     * Get all currencies in the system
     */
    public function index(Request $request): JsonResponse
    {
        $currencies = Currency::orderBy('name')->get();
        
        $defaultCurrency = Currency::where('is_default', true)->first();
        
        // Get authenticated user's currency information
        $user = auth()->user();
        $userCurrency = null;
        $displayedCurrencies = [];
        
        if ($user) {
            $user->load('currency');
            $userCurrency = $user->currency;
            $displayedCurrencies = $user->displayed_currencies ?? [];
        }
        
        return response()->json([
            'currencies' => $currencies,
            'default_currency' => $defaultCurrency,
            'user_currency' => $userCurrency,
            'displayed_currencies' => $displayedCurrencies
        ]);
    }

    /**
     * Store a new currency in the system
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|min:2|max:5|unique:currencies,code',
            'name' => 'required|string|max:255',
            'symbol' => 'required|string|max:10',
            'format' => 'nullable|string|max:50',
            'decimal_places' => 'nullable|integer|min:0|max:8',
            'is_default' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        
        // Convert code to uppercase
        $data['code'] = strtoupper($data['code']);
        
        // Set defaults if not provided
        $data['format'] = $data['format'] ?? '{symbol} {amount}';
        $data['decimal_places'] = $data['decimal_places'] ?? 2;
        $data['exchange_rate'] = 1.0; // Will be updated by exchange rate service
        
        // Handle default currency logic
        if ($data['is_default'] ?? false) {
            // Remove default flag from other currencies
            Currency::where('is_default', true)->update(['is_default' => false]);
        } else {
            $data['is_default'] = false;
        }

        try {
            $currency = Currency::create($data);
            
            // Try to get exchange rate from API if not the default currency
            if (!$currency->is_default) {
                try {
                    $this->exchangeRateService->updateDatabaseRates([$currency->code]);
                    $currency->refresh();
                } catch (\Exception $e) {
                    Log::warning("Could not fetch exchange rate for new currency {$currency->code}: " . $e->getMessage());
                }
            }
            
            Log::info("New currency created: {$currency->code}");
            
            return response()->json([
                'message' => 'Currency created successfully',
                'currency' => $currency
            ], 201);
            
        } catch (\Exception $e) {
            Log::error("Failed to create currency: " . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to create currency',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an existing currency
     */
    public function update(Request $request, Currency $currency): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'symbol' => 'sometimes|string|max:10',
            'format' => 'sometimes|string|max:50',
            'decimal_places' => 'sometimes|integer|min:0|max:8',
            'is_default' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        // Handle default currency logic
        if (isset($data['is_default']) && $data['is_default']) {
            // Remove default flag from other currencies
            Currency::where('is_default', true)->where('id', '!=', $currency->id)->update(['is_default' => false]);
        }

        $currency->update($data);
        
        Log::info("Currency updated: {$currency->code}");
        
        return response()->json([
            'message' => 'Currency updated successfully',
            'currency' => $currency
        ]);
    }

    /**
     * Delete a currency
     */
    public function destroy(Currency $currency): JsonResponse
    {
        if ($currency->is_default) {
            return response()->json([
                'message' => 'Cannot delete the default currency'
            ], 422);
        }

        // Check if currency is being used
        $usageCount = $currency->expenses()->count() + 
                     $currency->earnings()->count() + 
                     $currency->investments()->count() + 
                     $currency->budgets()->count() + 
                     $currency->goals()->count();

        if ($usageCount > 0) {
            return response()->json([
                'message' => 'Cannot delete currency that is being used in transactions, budgets, or goals',
                'usage_count' => $usageCount
            ], 422);
        }

        $code = $currency->code;
        $currency->delete();
        
        Log::info("Currency deleted: {$code}");
        
        return response()->json([
            'message' => 'Currency deleted successfully'
        ]);
    }

    /**
     * Set default currency for the system
     */
    public function setDefault(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'currency_id' => 'required|exists:currencies,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $currency = Currency::findOrFail($request->currency_id);

        // Check if user has displayed_currencies configured
        $displayedCurrencies = $user->displayed_currencies ?? [];
        
        if (!empty($displayedCurrencies)) {
            // User has displayed currencies - this is for user preference setting
            // displayed_currencies can contain either currency codes or currency IDs
            $isUsingCodes = is_string($displayedCurrencies[0] ?? null);
            
            if ($isUsingCodes) {
                // Array contains currency codes like ['USD', 'EUR']
                if (!in_array($currency->code, $displayedCurrencies)) {
                    return response()->json([
                        'error' => 'Selected currency must be in your displayed currencies list'
                    ], 400);
                }
            } else {
                // Array contains currency IDs like [1, 2]
                $currencyCodes = Currency::whereIn('id', $displayedCurrencies)->pluck('code')->toArray();
                
                if (!in_array($currency->code, $currencyCodes)) {
                    return response()->json([
                        'error' => 'Selected currency must be in your displayed currencies list'
                    ], 400);
                }
            }

            // Update the user's currency preference
            $user->currency_id = $currency->id;
            $user->save();
            
            Log::info("User {$user->id} set personal default currency to: {$currency->code}");
        } else {
            // User has no displayed currencies - this is for system default setting
            // Remove default flag from all currencies
            Currency::where('is_default', true)->update(['is_default' => false]);
            
            // Set new system default
            $currency->update(['is_default' => true, 'exchange_rate' => 1.0]);
            
            // Update exchange rates for all other currencies
            try {
                $this->exchangeRateService->updateDatabaseRates();
            } catch (\Exception $e) {
                Log::warning("Could not update exchange rates after setting new default: " . $e->getMessage());
            }
            
            Log::info("System default currency set to: {$currency->code}");
        }
        
        return response()->json([
            'message' => 'Default currency updated successfully',
            'currency' => $currency
        ]);
    }


    /**
     * Get available currencies from the exchange API
     */
    public function getAvailableCurrencies(): JsonResponse
    {
        try {
            $currencies = $this->exchangeRateService->getAvailableCurrencies();
            $existingCodes = Currency::pluck('code')->toArray();
            
            // Filter out currencies that already exist in the system
            $availableForAdd = [];
            foreach ($currencies as $code => $name) {
                if (!in_array(strtoupper($code), array_map('strtoupper', $existingCodes))) {
                    $availableForAdd[strtoupper($code)] = $name;
                }
            }
            
            return response()->json([
                'all_currencies' => $currencies,
                'available_for_add' => $availableForAdd,
                'existing_currencies' => $existingCodes
            ]);
            
        } catch (\Exception $e) {
            Log::error("Failed to fetch available currencies: " . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to fetch available currencies',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current exchange rates
     */
    public function getExchangeRates(Request $request): JsonResponse
    {
        $baseCurrency = $request->get('base', 'usd');
        $onlyCurrencies = $request->get('currencies', []);
        
        try {
            $rates = $this->exchangeRateService->getExchangeRates(
                strtolower($baseCurrency),
                array_map('strtolower', $onlyCurrencies)
            );
            
            return response()->json([
                'base_currency' => $baseCurrency,
                'rates' => $rates,
                'timestamp' => now()->toISOString()
            ]);
            
        } catch (\Exception $e) {
            Log::error("Failed to fetch exchange rates: " . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to fetch exchange rates',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Update exchange rates for all currencies
     */
    public function updateExchangeRates(Request $request): JsonResponse
    {
        $onlyCurrencies = $request->get('currencies', []);
        
        try {
            $result = $this->exchangeRateService->updateDatabaseRates($onlyCurrencies);
            
            return response()->json([
                'message' => 'Exchange rates updated successfully',
                'result' => $result
            ]);
            
        } catch (\Exception $e) {
            Log::error("Failed to update exchange rates: " . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to update exchange rates',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Get update status and statistics
     */
    public function getUpdateStatus(): JsonResponse
    {
        try {
            $statistics = $this->exchangeRateService->getUpdateStatistics();
            
            return response()->json([
                'status' => 'success',
                'statistics' => $statistics
            ]);
            
        } catch (\Exception $e) {
            Log::error("Failed to get update status: " . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to get update status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Convert amount between currencies
     */
    public function convert(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0',
            'from' => 'required|string|size:3|regex:/^[A-Z]{3}$/i',
            'to' => 'required|string|size:3|regex:/^[A-Z]{3}$/i'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $convertedAmount = $this->exchangeRateService->convertAmount(
                $request->amount,
                $request->from,
                $request->to
            );
            
            return response()->json([
                'original_amount' => $request->amount,
                'from_currency' => strtoupper($request->from),
                'to_currency' => strtoupper($request->to),
                'converted_amount' => $convertedAmount,
                'timestamp' => now()->toISOString()
            ]);
            
        } catch (\Exception $e) {
            Log::error("Failed to convert currency: " . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to convert currency',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear exchange rate cache
     */
    public function clearRateCache(): JsonResponse
    {
        try {
            $this->exchangeRateService->clearRateCache();
            
            return response()->json([
                'message' => 'Exchange rate cache cleared successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error("Failed to clear cache: " . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to clear cache',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the current user's currency preference
     */
    public function getCurrentCurrency(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Load the user's currency relationship
            $user->load('currency');
            
            // If user has a currency preference, return it
            if ($user->currency) {
                return response()->json([
                    'currency' => $user->currency,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'currency_id' => $user->currency_id,
                        'displayed_currencies' => $user->displayed_currencies ?? []
                    ]
                ]);
            }

            // If user has no currency set, assign and return the system default
            $defaultCurrency = Currency::where('is_default', true)->first();
            
            if (!$defaultCurrency) {
                // If no system default, try to find EUR or USD as fallback
                $defaultCurrency = Currency::whereIn('code', ['EUR', 'USD'])
                    ->orderByRaw("FIELD(code, 'EUR', 'USD')")
                    ->first();
            }

            if (!$defaultCurrency) {
                // Last resort: get any available currency
                $defaultCurrency = Currency::first();
            }

            if ($defaultCurrency) {
                // Update user's currency preference
                $user->update(['currency_id' => $defaultCurrency->id]);
                $user->load('currency'); // Reload the relationship
                
                Log::info("Assigned default currency {$defaultCurrency->code} to user {$user->id}");
            }

            return response()->json([
                'currency' => $user->currency ?? $defaultCurrency,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'currency_id' => $user->currency_id,
                    'displayed_currencies' => $user->displayed_currencies ?? []
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to get current currency: " . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to get current currency',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the authenticated user's currency preference
     */
    public function updateUserCurrency(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'currency_id' => 'required|exists:currencies,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'message' => 'User not authenticated'
                ], 401);
            }

            $currency = Currency::findOrFail($request->currency_id);
            
            // Update the user's currency preference
            $user->currency_id = $currency->id;
            $user->save();
            
            // Reload the user with currency relationship
            $user->refresh();
            $user->load('currency');
            
            Log::info("User {$user->id} updated currency preference to {$currency->code}");
            
            return response()->json([
                'message' => 'Currency preference updated successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'currency_id' => $user->currency_id,
                    'displayed_currencies' => $user->displayed_currencies ?? [],
                    'currency' => $user->currency
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to update user currency: " . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to update user currency preference',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update displayed currencies settings for the authenticated user
     */
    public function updateDisplaySettings(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'displayed_currencies' => 'required|array|min:1',
            'displayed_currencies.*' => 'required|integer|exists:currencies,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'message' => 'User not authenticated'
                ], 401);
            }
            
            // Update the user's displayed currencies
            $user->displayed_currencies = $request->displayed_currencies;
            $user->save();
            
            // Reload the user with currency relationship
            $user->refresh();
            $user->load('currency');
            
            Log::info("User {$user->id} updated displayed currencies");
            
            return response()->json([
                'message' => 'Currency display settings updated successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'currency_id' => $user->currency_id,
                    'displayed_currencies' => $user->displayed_currencies,
                    'currency' => $user->currency
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to update displayed currencies: " . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to update currency display settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Set base currency for the authenticated user
     */
    public function setBaseCurrency(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'currency_id' => 'required|exists:currencies,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json([
                    'message' => 'User not authenticated'
                ], 401);
            }

            $currency = Currency::findOrFail($request->currency_id);
            
            // Update the user's currency preference
            $user->currency_id = $currency->id;
            
            // Also add this currency to displayed currencies if not already there
            $displayedCurrencies = $user->displayed_currencies ?? [];
            if (!in_array($currency->code, $displayedCurrencies)) {
                $displayedCurrencies[] = $currency->code;
                $user->displayed_currencies = $displayedCurrencies;
            }
            
            $user->save();
            
            // Reload the user with currency relationship
            $user->refresh();
            $user->load('currency');
            
            Log::info("User {$user->id} set base currency to {$currency->code}");
            
            return response()->json([
                'message' => 'User base currency updated successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'currency_id' => $user->currency_id,
                    'displayed_currencies' => $user->displayed_currencies,
                    'currency' => $user->currency
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to set base currency: " . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to set base currency',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}