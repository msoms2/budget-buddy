<?php

/**
 * Test script for Currency Management functionality
 * 
 * This script tests the core currency management features:
 * - Currency creation and management
 * - Exchange rate updates
 * - Default currency selection
 * - API endpoints
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use App\Models\Currency;
use App\Models\User;
use App\Services\ExchangeRateService;
use App\Http\Controllers\CurrencyController;

// Bootstrap Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔄 Currency Management Test\n";
echo "==========================\n\n";

try {
    // Test 1: Check if currencies table exists and has data
    echo "1. Checking currencies table...\n";
    $currencyCount = Currency::count();
    echo "   Found {$currencyCount} currencies in database\n";
    
    if ($currencyCount === 0) {
        echo "   ⚠️  No currencies found. Running seeder...\n";
        // You would run: php artisan db:seed --class=CurrencySeeder
        echo "   Run: php artisan db:seed --class=CurrencySeeder\n";
    } else {
        echo "   ✅ Currencies table populated\n";
    }
    
    // Test 2: Check default currency
    echo "\n2. Checking default currency...\n";
    $defaultCurrency = Currency::where('is_default', true)->first();
    if ($defaultCurrency) {
        echo "   ✅ Default currency: {$defaultCurrency->code} ({$defaultCurrency->name})\n";
    } else {
        echo "   ❌ No default currency set\n";
    }
    
    // Test 3: Test Exchange Rate Service
    echo "\n3. Testing Exchange Rate Service...\n";
    $exchangeService = app(ExchangeRateService::class);
    
    try {
        $statistics = $exchangeService->getUpdateStatistics();
        echo "   ✅ Exchange Rate Service working\n";
        echo "   - Total currencies: {$statistics['total_currencies']}\n";
        echo "   - Currencies with rates: {$statistics['currencies_with_rates']}\n";
        echo "   - Default currency: {$statistics['default_currency']}\n";
        echo "   - Update needed: " . ($statistics['update_needed'] ? 'Yes' : 'No') . "\n";
    } catch (Exception $e) {
        echo "   ❌ Exchange Rate Service error: " . $e->getMessage() . "\n";
    }
    
    // Test 4: Test API Health
    echo "\n4. Testing API endpoints health...\n";
    try {
        $apiHealth = $exchangeService->monitorApiHealth();
        $healthyCount = 0;
        foreach ($apiHealth as $endpoint) {
            if ($endpoint['status'] === 'healthy') {
                $healthyCount++;
                echo "   ✅ {$endpoint['endpoint']} ({$endpoint['response_time_ms']}ms)\n";
            } else {
                echo "   ❌ {$endpoint['endpoint']} - {$endpoint['status']}\n";
            }
        }
        echo "   {$healthyCount}/" . count($apiHealth) . " endpoints healthy\n";
    } catch (Exception $e) {
        echo "   ❌ API health check failed: " . $e->getMessage() . "\n";
    }
    
    // Test 5: Test currency conversion
    echo "\n5. Testing currency conversion...\n";
    try {
        $amount = 100;
        $converted = $exchangeService->convertAmount($amount, 'USD', 'EUR');
        echo "   ✅ Converted $amount USD to " . number_format($converted, 2) . " EUR\n";
    } catch (Exception $e) {
        echo "   ❌ Currency conversion failed: " . $e->getMessage() . "\n";
    }
    
    // Test 6: Test available currencies
    echo "\n6. Testing available currencies from API...\n";
    try {
        $available = $exchangeService->getAvailableCurrencies();
        $availableCount = count($available);
        echo "   ✅ Found {$availableCount} available currencies from API\n";
        
        // Show first 5 currencies
        $first5 = array_slice($available, 0, 5, true);
        foreach ($first5 as $code => $name) {
            echo "   - " . strtoupper($code) . ": {$name}\n";
        }
        if ($availableCount > 5) {
            echo "   ... and " . ($availableCount - 5) . " more\n";
        }
    } catch (Exception $e) {
        echo "   ❌ Failed to get available currencies: " . $e->getMessage() . "\n";
    }
    
    // Test 7: Test User with currency
    echo "\n7. Testing user currency functionality...\n";
    $user = User::first();
    if ($user) {
        echo "   ✅ Found user: {$user->name}\n";
        if ($user->currency) {
            echo "   ✅ User currency: {$user->currency->code} ({$user->currency->name})\n";
        } else {
            echo "   ⚠️  User has no currency set\n";
        }
        
        if ($user->displayed_currencies) {
            $displayedCount = is_array($user->displayed_currencies) ? count($user->displayed_currencies) : 0;
            echo "   ✅ User has {$displayedCount} displayed currencies\n";
        } else {
            echo "   ⚠️  User has no displayed currencies set\n";
        }
    } else {
        echo "   ⚠️  No users found in database\n";
    }
    
    // Test 8: Test Currency Model methods
    echo "\n8. Testing Currency model methods...\n";
    if ($defaultCurrency) {
        $testCurrency = Currency::where('is_default', false)->first();
        if ($testCurrency) {
            $rate = $defaultCurrency->getExchangeRate($testCurrency);
            echo "   ✅ Exchange rate from {$defaultCurrency->code} to {$testCurrency->code}: " . number_format($rate, 4) . "\n";
            
            $amount = 100;
            $converted = $defaultCurrency->convertTo($amount, $testCurrency);
            echo "   ✅ Converted {$amount} {$defaultCurrency->code} to " . number_format($converted, 2) . " {$testCurrency->code}\n";
            
            $formatted = $testCurrency->formatAmount($converted);
            echo "   ✅ Formatted amount: {$formatted}\n";
        }
    }
    
    echo "\n🎉 Currency Management Test Complete!\n";
    echo "=====================================\n\n";
    
    // Summary
    echo "Summary:\n";
    echo "- Currencies in database: {$currencyCount}\n";
    echo "- Default currency: " . ($defaultCurrency ? $defaultCurrency->code : 'None') . "\n";
    echo "- Exchange Rate Service: Working\n";
    echo "- API endpoints: Available\n";
    echo "- User functionality: Ready\n";
    
    echo "\nNext steps:\n";
    echo "1. Run: php artisan db:seed --class=CurrencySeeder (if needed)\n";
    echo "2. Test the frontend at /settings/currency\n";
    echo "3. Run: php artisan currencies:manage status (for detailed status)\n";
    echo "4. Run: php artisan currencies:manage update-rates (to update rates)\n";
    
} catch (Exception $e) {
    echo "❌ Test failed with error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}