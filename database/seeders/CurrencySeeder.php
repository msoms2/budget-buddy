<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CurrencySeeder extends Seeder
{
    public function run(): void
    {
        $currencies = [
            [
                'code' => 'USD',
                'name' => 'US Dollar',
                'symbol' => '$',
                'exchange_rate' => 1.0000,
                'format' => '$#,##0.00',
                'decimal_places' => 2,
                'is_default' => true,
            ],
            [
                'code' => 'EUR',
                'name' => 'Euro',
                'symbol' => '€',
                'exchange_rate' => 0.9200,
                'format' => '€#,##0.00',
                'decimal_places' => 2,
                'is_default' => false,
            ],
            [
                'code' => 'GBP',
                'name' => 'British Pound',
                'symbol' => '£',
                'exchange_rate' => 0.7900,
                'format' => '£#,##0.00',
                'decimal_places' => 2,
                'is_default' => false,
            ],
            [
                'code' => 'JPY',
                'name' => 'Japanese Yen',
                'symbol' => '¥',
                'exchange_rate' => 110.0000,
                'format' => '¥#,##0',
                'decimal_places' => 0,
                'is_default' => false,
            ],
            [
                'code' => 'CNY',
                'name' => 'Chinese Yuan',
                'symbol' => '¥',
                'exchange_rate' => 6.4500,
                'format' => '¥#,##0.00',
                'decimal_places' => 2,
                'is_default' => false,
            ],
            [
                'code' => 'AUD',
                'name' => 'Australian Dollar',
                'symbol' => 'A$',
                'exchange_rate' => 1.3500,
                'format' => 'A$#,##0.00',
                'decimal_places' => 2,
                'is_default' => false,
            ],
            [
                'code' => 'CAD',
                'name' => 'Canadian Dollar',
                'symbol' => 'C$',
                'exchange_rate' => 1.2500,
                'format' => 'C$#,##0.00',
                'decimal_places' => 2,
                'is_default' => false,
            ],
            [
                'code' => 'INR',
                'name' => 'Indian Rupee',
                'symbol' => '₹',
                'exchange_rate' => 74.5000,
                'format' => '₹#,##0.00',
                'decimal_places' => 2,
                'is_default' => false,
            ],
            [
                'code' => 'CHF',
                'name' => 'Swiss Franc',
                'symbol' => 'Fr.',
                'exchange_rate' => 0.9200,
                'format' => 'Fr. #,##0.00',
                'decimal_places' => 2,
                'is_default' => false,
            ],
            // Add more major currencies as needed
        ];

        foreach ($currencies as $currency) {
            DB::table('currencies')->insertOrIgnore($currency);
        }
    }
}
