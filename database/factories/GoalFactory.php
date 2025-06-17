<?php

namespace Database\Factories;

use App\Models\Goal;
use App\Models\User;
use App\Models\ExpenseCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class GoalFactory extends Factory
{
    protected $model = Goal::class;

    public function definition(): array
    {
        $targetAmount = $this->faker->randomFloat(2, 5000, 100000);
        $currentAmount = $this->faker->randomFloat(2, 0, $targetAmount);
        
        return [
            'title' => $this->faker->randomElement([
                'Emergency Fund',
                'Down Payment for House',
                'New Car Fund',
                'Vacation Savings',
                'Wedding Fund',
                'Education Fund',
                'Home Renovation',
                'Business Startup'
            ]),
            'target_amount' => $targetAmount,
            'current_amount' => $currentAmount,
            'target_date' => $this->faker->dateTimeBetween('+6 months', '+5 years'),
            'user_id' => User::factory(),
            'category_id' => ExpenseCategory::factory(),
            'status' => $currentAmount >= $targetAmount ? 'completed' : 'active',
            'description' => $this->faker->optional(0.7)->sentence(),
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
                'current_amount' => $this->faker->randomFloat(2, 0, $attributes['target_amount'] * 0.9),
                'status' => 'active',
            ];
        });
    }
}