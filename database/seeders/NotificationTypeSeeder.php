<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\NotificationType;

class NotificationTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            [
                'name' => 'Budget Limit Alert',
                'slug' => 'budget_limit_alert',
                'description' => 'Alert when budget limit is approached or exceeded',
            ],
            [
                'name' => 'Large Expense Alert',
                'slug' => 'large_expense',
                'description' => 'Alert when a large expense is recorded',
            ],
            [
                'name' => 'Goal Progress Update',
                'slug' => 'goal_progress_update',
                'description' => 'Update on financial goal progress',
            ],
            [
                'name' => 'Bill Payment Reminder',
                'slug' => 'bill_payment_reminder',
                'description' => 'Reminder for upcoming bill payments',
            ],
            [
                'name' => 'Investment Update',
                'slug' => 'investment_update',
                'description' => 'Updates on investment performance',
            ],
            [
                'name' => 'Account Activity',
                'slug' => 'account_activity',
                'description' => 'Summary of recent account activity',
            ],
        ];

        foreach ($types as $type) {
            NotificationType::updateOrCreate(
                ['slug' => $type['slug']],
                $type
            );
        }
    }
}