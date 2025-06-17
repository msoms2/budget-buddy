<?php

namespace Database\Factories;

use App\Models\NotificationType;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationTypeFactory extends Factory
{
    protected $model = NotificationType::class;

    public function definition(): array
    {
        // Generate unique slug to avoid duplicates
        $slug = 'notification_' . $this->faker->unique()->word;
        
        return [
            'slug' => $slug,
            'name' => ucfirst($this->faker->words(2, true)) . ' Notification',
            'description' => $this->faker->sentence(),
        ];
    }

    public function budgetLimit(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'slug' => 'budget_limit',
                'name' => 'Budget Limit Warning',
                'description' => 'Notification when budget limit is reached',
            ];
        });
    }

    public function largeExpense(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'slug' => 'large_expense',
                'name' => 'Large Expense Alert',
                'description' => 'Notification for large expense transactions',
            ];
        });
    }

    public function goalMilestone(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'slug' => 'goal_milestone',
                'name' => 'Goal Milestone',
                'description' => 'Notification when reaching a savings goal milestone',
            ];
        });
    }

    public function recurringPayment(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'slug' => 'recurring_payment',
                'name' => 'Recurring Payment Reminder',
                'description' => 'Reminder for upcoming recurring payments',
            ];
        });
    }

    public function monthlySummary(): self
    {
        return $this->state(function (array $attributes) {
            return [
                'slug' => 'monthly_summary',
                'name' => 'Monthly Summary',
                'description' => 'Monthly financial summary notification',
            ];
        });
    }
}