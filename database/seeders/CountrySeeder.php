<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CountrySeeder extends Seeder
{
    public function run(): void
    {
        $countries = [
            // North America
            ['name' => 'United States', 'code' => 'US', 'currency_code' => 'USD', 'flag_emoji' => '🇺🇸'],
            ['name' => 'Canada', 'code' => 'CA', 'currency_code' => 'CAD', 'flag_emoji' => '🇨🇦'],
            
            // Europe
            ['name' => 'United Kingdom', 'code' => 'GB', 'currency_code' => 'GBP', 'flag_emoji' => '🇬🇧'],
            ['name' => 'Germany', 'code' => 'DE', 'currency_code' => 'EUR', 'flag_emoji' => '🇩🇪'],
            ['name' => 'France', 'code' => 'FR', 'currency_code' => 'EUR', 'flag_emoji' => '🇫🇷'],
            ['name' => 'Italy', 'code' => 'IT', 'currency_code' => 'EUR', 'flag_emoji' => '🇮🇹'],
            ['name' => 'Spain', 'code' => 'ES', 'currency_code' => 'EUR', 'flag_emoji' => '🇪🇸'],
            ['name' => 'Switzerland', 'code' => 'CH', 'currency_code' => 'CHF', 'flag_emoji' => '🇨🇭'],
            
            // Asia
            ['name' => 'Japan', 'code' => 'JP', 'currency_code' => 'JPY', 'flag_emoji' => '🇯🇵'],
            ['name' => 'China', 'code' => 'CN', 'currency_code' => 'CNY', 'flag_emoji' => '🇨🇳'],
            ['name' => 'India', 'code' => 'IN', 'currency_code' => 'INR', 'flag_emoji' => '🇮🇳'],
            
            // Oceania
            ['name' => 'Australia', 'code' => 'AU', 'currency_code' => 'AUD', 'flag_emoji' => '🇦🇺'],
            
            // Add more European countries with EUR
            ['name' => 'Latvia', 'code' => 'LV', 'currency_code' => 'EUR', 'flag_emoji' => '🇱🇻'],
            ['name' => 'Lithuania', 'code' => 'LT', 'currency_code' => 'EUR', 'flag_emoji' => '🇱🇹'],
            ['name' => 'Estonia', 'code' => 'EE', 'currency_code' => 'EUR', 'flag_emoji' => '🇪🇪'],
            ['name' => 'Netherlands', 'code' => 'NL', 'currency_code' => 'EUR', 'flag_emoji' => '🇳🇱'],
            ['name' => 'Belgium', 'code' => 'BE', 'currency_code' => 'EUR', 'flag_emoji' => '🇧🇪'],
            ['name' => 'Austria', 'code' => 'AT', 'currency_code' => 'EUR', 'flag_emoji' => '🇦🇹'],
            ['name' => 'Ireland', 'code' => 'IE', 'currency_code' => 'EUR', 'flag_emoji' => '🇮🇪'],
            ['name' => 'Portugal', 'code' => 'PT', 'currency_code' => 'EUR', 'flag_emoji' => '🇵🇹'],
            ['name' => 'Greece', 'code' => 'GR', 'currency_code' => 'EUR', 'flag_emoji' => '🇬🇷'],
            ['name' => 'Finland', 'code' => 'FI', 'currency_code' => 'EUR', 'flag_emoji' => '🇫🇮'],
        ];

        foreach ($countries as $country) {
            // Get the currency ID for this country
            $currency = DB::table('currencies')
                         ->where('code', $country['currency_code'])
                         ->first();

            if ($currency) {
                $countryData = [
                    'name' => $country['name'],
                    'code' => $country['code'],
                    'currency_code' => $country['currency_code'],
                    'currency_id' => $currency->id,
                    'flag_emoji' => $country['flag_emoji'],
                    'is_active' => true,
                ];

                \App\Models\Country::firstOrCreate(
                    ['code' => $countryData['code']],
                    $countryData
                );
            }
        }
    }
}
