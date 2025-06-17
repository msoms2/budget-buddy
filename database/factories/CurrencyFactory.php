<?php

namespace Database\Factories;

use App\Models\Currency;
use Illuminate\Database\Eloquent\Factories\Factory;

class CurrencyFactory extends Factory
{
    protected $model = Currency::class;

    public function definition(): array
    {
        return [
            'code' => $this->faker->currencyCode(),
            'name' => $this->faker->words(2, true),
            'symbol' => $this->faker->randomElement(['$', '€', '£', '¥']),
            'exchange_rate' => $this->faker->randomFloat(4, 0.5, 2.0),
            'format' => '#,##0.00 ¤',
            'decimal_places' => 2,
            'is_default' => false,
        ];
    }

    public function usd(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'code' => 'USD',
                'name' => 'US Dollar',
                'symbol' => '$',
                'exchange_rate' => 1.0,
                'format' => '$#,##0.00',
                'is_default' => true,
            ];
        });
    }

    public function eur(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'code' => 'EUR',
                'name' => 'Euro',
                'symbol' => '€',
                'exchange_rate' => 0.85,
                'format' => '#,##0.00 €',
            ];
        });
    }
}