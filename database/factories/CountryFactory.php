<?php

namespace Database\Factories;

use App\Models\Country;
use App\Models\Currency;
use Illuminate\Database\Eloquent\Factories\Factory;

class CountryFactory extends Factory
{
    protected $model = Country::class;

    public function definition(): array
    {
        $countries = [
            ['name' => 'United States', 'code' => 'US', 'currency_code' => 'USD', 'flag_emoji' => '🇺🇸'],
            ['name' => 'United Kingdom', 'code' => 'GB', 'currency_code' => 'GBP', 'flag_emoji' => '🇬🇧'],
            ['name' => 'Germany', 'code' => 'DE', 'currency_code' => 'EUR', 'flag_emoji' => '🇩🇪'],
            ['name' => 'France', 'code' => 'FR', 'currency_code' => 'EUR', 'flag_emoji' => '🇫🇷'],
            ['name' => 'Japan', 'code' => 'JP', 'currency_code' => 'JPY', 'flag_emoji' => '🇯🇵'],
            ['name' => 'Canada', 'code' => 'CA', 'currency_code' => 'CAD', 'flag_emoji' => '🇨🇦'],
            ['name' => 'Australia', 'code' => 'AU', 'currency_code' => 'AUD', 'flag_emoji' => '🇦🇺'],
            ['name' => 'Switzerland', 'code' => 'CH', 'currency_code' => 'CHF', 'flag_emoji' => '🇨🇭'],
            ['name' => 'Sweden', 'code' => 'SE', 'currency_code' => 'SEK', 'flag_emoji' => '🇸🇪'],
            ['name' => 'Norway', 'code' => 'NO', 'currency_code' => 'NOK', 'flag_emoji' => '🇳🇴'],
        ];

        $country = $this->faker->randomElement($countries);
        
        return [
            'name' => $country['name'],
            'code' => $country['code'],
            'currency_code' => $country['currency_code'],
            'currency_id' => Currency::factory(),
            'flag_emoji' => $country['flag_emoji'],
            'is_active' => true,
        ];
    }

    public function unitedStates(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'name' => 'United States',
                'code' => 'US',
                'currency_code' => 'USD',
                'flag_emoji' => '🇺🇸',
            ];
        });
    }

    public function unitedKingdom(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'name' => 'United Kingdom',
                'code' => 'GB',
                'currency_code' => 'GBP',
                'flag_emoji' => '🇬🇧',
            ];
        });
    }

    public function germany(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'name' => 'Germany',
                'code' => 'DE',
                'currency_code' => 'EUR',
                'flag_emoji' => '🇩🇪',
            ];
        });
    }

    public function inactive(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => false,
            ];
        });
    }
}