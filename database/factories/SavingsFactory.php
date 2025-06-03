<?php

namespace Database\Factories;

use App\Models\Savings;
use App\Models\User;
use App\Models\ExpenseCategory;
use App\Models\Currency;
use Illuminate\Database\Eloquent\Factories\Factory;

class SavingsFactory extends Factory
{
    protected $model = Savings::class;

    public function definition(): array
    {
        $targetAmount = $this->faker->randomFloat(2, 1000, 50000);
        $currentAmount = $this->faker->randomFloat(2, 0, $targetAmount);
        
        return [
            'name' => $this->faker->randomElement([
                'Emergency Fund',
                'Vacation Savings',
                'New Phone Fund',
                'Holiday Shopping',
                'Birthday Gifts',
                'Car Maintenance Fund',
                'Medical Emergency Fund',
                'Home Improvement',
                'Tech Gadgets Fund',
                'Concert Tickets',
                'Weekend Getaway',
                'Christmas Savings',
                'Back to School Fund',
                'Pet Emergency Fund',
                'Hobby Equipment',
            ]),
            'description' => $this->faker->optional(0.7)->sentence(),
            'target_amount' => $targetAmount,
            'current_amount' => $currentAmount,
            'target_date' => $this->faker->dateTimeBetween('+1 month', '+3 years'),
            'user_id' => User::factory(),
            'category_id' => ExpenseCategory::factory(),
            'currency_id' => Currency::factory(),
            'status' => $currentAmount >= $targetAmount ? 'completed' : 'active',
        ];
    }

    public function completed(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'current_amount' => $attributes['target_amount'],
                'status' => 'completed',
            ];
        });
    }

    public function active(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'current_amount' => $this->faker->randomFloat(2, 0, $attributes['target_amount'] * 0.8),
                'status' => 'active',
            ];
        });
    }

    public function cancelled(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'current_amount' => $this->faker->randomFloat(2, 0, $attributes['target_amount'] * 0.3),
                'status' => 'cancelled',
            ];
        });
    }

    public function shortTerm(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'target_date' => $this->faker->dateTimeBetween('+1 month', '+6 months'),
                'target_amount' => $this->faker->randomFloat(2, 100, 2000),
            ];
        });
    }

    public function longTerm(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'target_date' => $this->faker->dateTimeBetween('+1 year', '+5 years'),
                'target_amount' => $this->faker->randomFloat(2, 5000, 50000),
            ];
        });
    }
}