<?php

namespace Database\Factories;

use App\Models\NotificationType;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationTypeFactory extends Factory
{
    protected $model = NotificationType::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'slug' => $this->faker->unique()->slug(),
            'description' => $this->faker->sentence(),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now()
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false
        ]);
    }

    public function budgetAlert(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Budget Limit Alert',
            'slug' => 'budget_limit_alert',
            'description' => 'Alert when budget limit is approached or exceeded'
        ]);
    }

    public function largeExpense(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Large Expense Alert',
            'slug' => 'large_expense',
            'description' => 'Alert when a large expense is recorded'
        ]);
    }

    public function goalProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Goal Progress Update',
            'slug' => 'goal_progress_update',
            'description' => 'Update on financial goal progress'
        ]);
    }
}