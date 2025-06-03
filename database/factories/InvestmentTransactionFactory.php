<?php

namespace Database\Factories;

use App\Models\InvestmentTransaction;
use App\Models\Investment;
use App\Models\Currency;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class InvestmentTransactionFactory extends Factory
{
    protected $model = InvestmentTransaction::class;

    public function definition(): array
    {
        $currentYear = Carbon::now()->year;
        $pastYear = $currentYear - 2; // Use dates from 2 years ago to ensure they're valid
        $quantity = $this->faker->randomFloat(2, 1, 100);
        $pricePerUnit = $this->faker->randomFloat(2, 10, 1000);
        $totalAmount = $quantity * $pricePerUnit;
        
        return [
            'investment_id' => Investment::factory(),
            'transaction_type' => $this->faker->randomElement(['buy', 'sell', 'dividend']),
            'date' => $this->faker->dateTimeBetween("$pastYear-01-01", "$currentYear-01-01"),
            'quantity' => $quantity,
            'price_per_unit' => $pricePerUnit,
            'total_amount' => $totalAmount,
            'fees' => $this->faker->randomFloat(2, 0, 50), // Changed to never be null
            'notes' => $this->faker->optional()->sentence(),
        ];
    }

    public function buy(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'transaction_type' => 'buy',
            ];
        });
    }

    public function sell(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'transaction_type' => 'sell',
            ];
        });
    }
}