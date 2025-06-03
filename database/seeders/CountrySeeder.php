<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Country;
use App\Models\Currency;

class CountrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get currencies that we'll need
        $usd = Currency::where('code', 'USD')->first();
        $eur = Currency::where('code', 'EUR')->first();
        $gbp = Currency::where('code', 'GBP')->first();

        // Only seed if we have the basic currencies and no countries exist yet
        if (!$usd || !$eur || !$gbp || Country::count() > 0) {
            return;
        }

        // Define countries with their currency mappings
        $countries = [
            // English-speaking countries with USD
            ['name' => 'United States', 'code' => 'US', 'currency_id' => $usd->id],
            
            // United Kingdom with GBP
            ['name' => 'United Kingdom', 'code' => 'GB', 'currency_id' => $gbp->id],
            
            // Major European countries with EUR
            ['name' => 'Germany', 'code' => 'DE', 'currency_id' => $eur->id],
            ['name' => 'France', 'code' => 'FR', 'currency_id' => $eur->id],
            ['name' => 'Italy', 'code' => 'IT', 'currency_id' => $eur->id],
            ['name' => 'Spain', 'code' => 'ES', 'currency_id' => $eur->id],
            ['name' => 'Netherlands', 'code' => 'NL', 'currency_id' => $eur->id],
            ['name' => 'Belgium', 'code' => 'BE', 'currency_id' => $eur->id],
            ['name' => 'Austria', 'code' => 'AT', 'currency_id' => $eur->id],
            ['name' => 'Portugal', 'code' => 'PT', 'currency_id' => $eur->id],
            ['name' => 'Ireland', 'code' => 'IE', 'currency_id' => $eur->id],
            ['name' => 'Finland', 'code' => 'FI', 'currency_id' => $eur->id],
            ['name' => 'Greece', 'code' => 'GR', 'currency_id' => $eur->id],
            
            // Other English-speaking countries with USD (for simplicity)
            ['name' => 'Canada', 'code' => 'CA', 'currency_id' => $usd->id],
            ['name' => 'Australia', 'code' => 'AU', 'currency_id' => $usd->id],
            ['name' => 'New Zealand', 'code' => 'NZ', 'currency_id' => $usd->id],
            
            // Other major countries (using USD as default for simplicity)
            ['name' => 'Japan', 'code' => 'JP', 'currency_id' => $usd->id],
            ['name' => 'South Korea', 'code' => 'KR', 'currency_id' => $usd->id],
            ['name' => 'Singapore', 'code' => 'SG', 'currency_id' => $usd->id],
            ['name' => 'Switzerland', 'code' => 'CH', 'currency_id' => $usd->id],
            ['name' => 'Norway', 'code' => 'NO', 'currency_id' => $usd->id],
            ['name' => 'Sweden', 'code' => 'SE', 'currency_id' => $usd->id],
            ['name' => 'Denmark', 'code' => 'DK', 'currency_id' => $usd->id],
        ];

        // Create countries
        foreach ($countries as $country) {
            Country::create($country);
        }
    }
}
