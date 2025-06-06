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
            'content' => $this->faker->paragraph(2),
            'data' => [
                'action_url' => $this->faker->url(),
                'category' => $this->faker->randomElement(['budget', 'expense', 'income', 'goal']),
                'amount' => $this->faker->randomFloat(2, 10, 1000),
            ],
            'read_at' => $this->faker->boolean(30) ? $this->faker->dateTimeBetween('-1 week', 'now') : null,
        ];
    }

    public function unread(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'read_at' => null,
            ];
        });
    }

    public function read(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'read_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            ];
        });
    }

    public function budgetLimit(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'title' => 'Budget Limit Warning',
                'content' => 'You have exceeded your budget limit.',
                'data' => [
                    'action_url' => '/budgets',
                    'category' => 'budget',
                    'amount' => $this->faker->randomFloat(2, 500, 2000),
                    'budget_id' => $this->faker->randomNumber(),
                ],
            ];
        });
    }

    public function largeExpense(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'title' => 'Large Expense Alert',
                'content' => 'A large expense has been recorded.',
                'data' => [
                    'action_url' => '/expenses',
                    'category' => 'expense',
                    'amount' => $this->faker->randomFloat(2, 1000, 5000),
                    'expense_id' => $this->faker->randomNumber(),
                ],
            ];
        });
    }
}