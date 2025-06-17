<?php

namespace Database\Factories;

use App\Models\Budget;
use App\Models\ExpenseCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BudgetFactory extends Factory
{
    protected $model = Budget::class;

    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('now', '+2 months');
        $endDate = $this->faker->dateTimeBetween($startDate, '+1 year');
        
        // Try to get the default USD currency, fallback to creating one if it doesn't exist
        $currency = \App\Models\Currency::where('code', 'USD')->first();
        if (!$currency) {
            // Create a currency directly rather than using factory
            $currency = \App\Models\Currency::create([
                'code' => 'USD',
                'name' => 'US Dollar',
                'symbol' => '$',
                'exchange_rate' => 1.0000,
                'format' => '$#,##0.00',
                'decimal_places' => 2,
                'is_default' => true,
            ]);
        }
        
        return [
            'name' => $this->faker->words(2, true) . ' Budget',
            'amount' => $this->faker->numberBetween(100, 5000),
            'period' => $this->faker->randomElement(['daily', 'weekly', 'monthly', 'yearly']),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'next_renewal_date' => null,
            'category_id' => ExpenseCategory::factory(),
            'user_id' => User::factory(),
            'currency_id' => $currency->id,
            'notes' => $this->faker->optional(0.7)->sentence(),
            'rollover_enabled' => $this->faker->boolean(20),
            'rollover_amount' => 0,
            'rollover_cap' => $this->faker->optional(0.3)->numberBetween(1000, 10000),
            'budget_method' => $this->faker->randomElement(['standard', '50-30-20', 'zero-based']),
            'method_settings' => null,
        ];
    }

    public function daily(): self
    {
        return $this->state(function (array $attributes) {
            return ['period' => 'daily'];
        });
    }

    public function weekly(): self
    {
        return $this->state(function (array $attributes) {
            return ['period' => 'weekly'];
        });
    }

    public function monthly(): self
    {
        return $this->state(function (array $attributes) {
            return ['period' => 'monthly'];
        });
    }

    public function yearly(): self
    {
        return $this->state(function (array $attributes) {
            return ['period' => 'yearly'];
        });
    }

    public function withRollover(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'rollover_enabled' => true,
                'rollover_cap' => $this->faker->numberBetween(1000, 10000),
            ];
        });
    }
}