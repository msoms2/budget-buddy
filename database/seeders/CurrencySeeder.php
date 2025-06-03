<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Currency;
use Illuminate\Support\Facades\Log;

class CurrencySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $currencies = [
            [
                'code' => 'USD',
                'name' => 'US Dollar',
                'symbol' => '$',
                'exchange_rate' => 1.0000,
                'format' => '{symbol}{amount}',
                'decimal_places' => 2,
                'is_default' => true,
            ],
            [
                'code' => 'EUR',
                'name' => 'Euro',
                'symbol' => '€',
                'exchange_rate' => 0.9200,
                'format' => '{amount} {symbol}',
                'decimal_places' => 2,
                'is_default' => false,
            ],
            [
                'code' => 'GBP',
                'name' => 'British Pound Sterling',
                'symbol' => '£',
                'exchange_rate' => 0.7900,
                'format' => '{symbol}{amount}',
                'decimal_places' => 2,
                'is_default' => false,
            ],
            [
                'code' => 'JPY',
                'name' => 'Japanese Yen',
                'symbol' => '¥',
                'exchange_rate' => 149.5000,
                'format' => '{symbol}{amount}',
                'decimal_places' => 0,
                'is_default' => false,
            ],
            [
                'code' => 'CAD',
                'name' => 'Canadian Dollar',
                'symbol' => 'C$',
                'exchange_rate' => 1.3600,
                'format' => '{symbol}{amount}',
                'decimal_places' => 2,
                'is_default' => false,
            ],
            [
                'code' => 'AUD',
                'name' => 'Australian Dollar',
                'symbol' => 'A$',
                'exchange_rate' => 1.5100,
                'format' => '{symbol}{amount}',
                'decimal_places' => 2,
                'is_default' => false,
            ],
            [
                'code' => 'CHF',
                'name' => 'Swiss Franc',
                'symbol' => 'CHF',
                'exchange_rate' => 0.9000,
                'format' => '{amount} {symbol}',
                'decimal_places' => 2,
                'is_default' => false,
            ],
            [
                'code' => 'CNY',
                'name' => 'Chinese Yuan',
                'symbol' => '¥',
                'exchange_rate' => 7.2400,
                'format' => '{symbol}{amount}',
                'decimal_places' => 2,
                'is_default' => false,
            ],
            [
                'code' => 'SEK',
                'name' => 'Swedish Krona',
                'symbol' => 'kr',
                'exchange_rate' => 10.9000,
                'format' => '{amount} {symbol}',
                'decimal_places' => 2,
                'is_default' => false,
            ],
            [
                'code' => 'NOK',
                'name' => 'Norwegian Krone',
                'symbol' => 'kr',
                'exchange_rate' => 10.8000,
                'format' => '{amount} {symbol}',
                'decimal_places' => 2,
                'is_default' => false,
            ],
            [
                'code' => 'PLN',
                'name' => 'Polish Złoty',
                'symbol' => 'zł',
                'exchange_rate' => 4.0500,
                'format' => '{amount} {symbol}',
                'decimal_places' => 2,
                'is_default' => false,
            ],
            [
                'code' => 'INR',
                'name' => 'Indian Rupee',
                'symbol' => '₹',
                'exchange_rate' => 83.1000,
                'format' => '{symbol}{amount}',
                'decimal_places' => 2,
                'is_default' => false,
            ],
            [
                'code' => 'BRL',
                'name' => 'Brazilian Real',
                'symbol' => 'R$',
                'exchange_rate' => 5.0200,
                'format' => '{symbol} {amount}',
                'decimal_places' => 2,
                'is_default' => false,
            ],
            [
                'code' => 'KRW',
                'name' => 'South Korean Won',
                'symbol' => '₩',
                'exchange_rate' => 1320.0000,
                'format' => '{symbol}{amount}',
                'decimal_places' => 0,
                'is_default' => false,
            ],
            [
                'code' => 'SGD',
                'name' => 'Singapore Dollar',
                'symbol' => 'S$',
                'exchange_rate' => 1.3500,
                'format' => '{symbol}{amount}',
                'decimal_places' => 2,
                'is_default' => false,
            ]
        ];

        foreach ($currencies as $currencyData) {
            $currency = Currency::where('code', $currencyData['code'])->first();
            
            if (!$currency) {
                Currency::create($currencyData);
                Log::info("Created currency: {$currencyData['code']}");
            } else {
                // Update exchange rate if currency exists but preserve user settings
                if (!$currency->is_default) {
                    $currency->update([
                        'exchange_rate' => $currencyData['exchange_rate']
                    ]);
                    Log::info("Updated exchange rate for: {$currencyData['code']}");
                }
            }
        }

        // Ensure we have a default currency
        $defaultCurrency = Currency::where('is_default', true)->first();
        if (!$defaultCurrency) {
            $usd = Currency::where('code', 'USD')->first();
            if ($usd) {
                $usd->update(['is_default' => true]);
                Log::info("Set USD as default currency");
            } else {
                // Create USD as default if it doesn't exist
                Currency::create([
                    'code' => 'USD',
                    'name' => 'US Dollar',
                    'symbol' => '$',
                    'exchange_rate' => 1.0000,
                    'format' => '{symbol}{amount}',
                    'decimal_places' => 2,
                    'is_default' => true,
                ]);
                Log::info("Created USD as default currency");
            }
        }

        Log::info("Currency seeding completed");
    }
}
