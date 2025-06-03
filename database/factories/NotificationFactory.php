<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use App\Models\NotificationType;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'notification_type_id' => NotificationType::factory(),
            'title' => $this->faker->sentence(4),
            'message' => $this->faker->paragraph(),
            'data' => json_encode([
                'amount' => $this->faker->randomFloat(2, 10, 1000),
                'category' => $this->faker->word(),
                'date' => $this->faker->date()
            ]),
            'is_read' => $this->faker->boolean(20), // 20% chance of being read
            'read_at' => null,
            'created_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'updated_at' => now()
        ];
    }

    public function read(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_read' => true,
            'read_at' => $this->faker->dateTimeBetween($attributes['created_at'], 'now')
        ]);
    }

    public function unread(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_read' => false,
            'read_at' => null
        ]);
    }

    public function budgetAlert(): static
    {
        return $this->state(fn (array $attributes) => [
            'title' => 'Budget Limit Alert',
            'message' => 'Your budget limit has been exceeded',
            'data' => json_encode([
                'budget_name' => $this->faker->words(2, true),
                'current_amount' => $this->faker->randomFloat(2, 500, 1000),
                'limit_amount' => 500,
                'percentage' => $this->faker->numberBetween(90, 150)
            ])
        ]);
    }

    public function largeExpense(): static
    {
        return $this->state(fn (array $attributes) => [
            'title' => 'Large Expense Alert',
            'message' => 'A large expense has been recorded',
            'data' => json_encode([
                'amount' => $this->faker->randomFloat(2, 1000, 5000),
                'category' => $this->faker->word(),
                'description' => $this->faker->sentence()
            ])
        ]);
    }
}