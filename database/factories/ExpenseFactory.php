<?php

namespace Database\Factories;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\PaymentMethod;
use App\Models\SubCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class ExpenseFactory extends Factory
{
    protected $model = Expense::class;

    public function definition(): array
    {
        $currentYear = Carbon::now()->year;
        $pastYear = $currentYear - 2; // Use dates from 2 years ago to ensure they're valid
        
        return [
            'name' => $this->faker->words(2, true) . ' Expense',
            'amount' => $this->faker->numberBetween(10, 1000),
            'description' => $this->faker->optional(0.7)->sentence(),
            'date' => $this->faker->dateTimeBetween("$pastYear-01-01", "$currentYear-01-01"),
            'user_id' => User::factory(),
            'category_id' => ExpenseCategory::factory(),
            'subcategory_id' => null, // We'll set this explicitly when needed
            'currency_id' => \App\Models\Currency::factory(),
            'is_recurring' => $this->faker->boolean(30),
            'frequency' => function (array $attributes) {
                return $attributes['is_recurring']
                    ? $this->faker->randomElement(['monthly', 'weekly', 'yearly'])
                    : null;
            },
        ];
    }

    public function recurring(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'is_recurring' => true,
                'frequency' => $this->faker->randomElement(['monthly', 'weekly', 'yearly']),
                'amount' => $this->faker->numberBetween(50, 500),
            ];
        });
    }

    public function subscription(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'name' => $this->faker->randomElement([
                    'Netflix Subscription',
                    'Spotify Premium',
                    'Amazon Prime',
                    'Gym Membership',
                    'Cloud Storage',
                ]),
                'is_recurring' => true,
                'frequency' => 'monthly',
                'amount' => $this->faker->numberBetween(5, 50),
            ];
        });
    }

    public function utility(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'name' => $this->faker->randomElement([
                    'Electricity Bill',
                    'Water Bill',
                    'Internet Bill',
                    'Gas Bill',
                    'Phone Bill',
                ]),
                'is_recurring' => true,
                'frequency' => 'monthly',
                'amount' => $this->faker->numberBetween(50, 200),
            ];
        });
    }

    public function highValue(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'amount' => $this->faker->numberBetween(1000, 5000),
                'is_recurring' => false,
            ];
        });
    }
}