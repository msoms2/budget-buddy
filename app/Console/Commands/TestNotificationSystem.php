<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\NotificationType;
use App\Services\NotificationService;
use App\Models\Notification;

class TestNotificationSystem extends Command
{
    protected $signature = 'notifications:test {user_id?}';
    protected $description = 'Test the notification system by creating sample notifications';

    public function handle()
    {
        $userId = $this->argument('user_id') ?? User::first()?->id;
        
        if (!$userId) {
            $this->error('No users found. Please create a user first.');
            return 1;
        }

        $user = User::find($userId);
        if (!$user) {
            $this->error("User with ID {$userId} not found.");
            return 1;
        }

        $this->info("Testing notification system for user: {$user->name} (ID: {$user->id})");
        $this->newLine();

        $notificationService = app(NotificationService::class);

        // Test 1: Budget Alert
        $this->info('1. Testing Budget Alert Notification...');
        $budgetType = NotificationType::where('slug', 'budget_limit_alert')->first();
        
        if ($budgetType) {
            $notification = $notificationService->create(
                $user->id,
                $budgetType->id,
                'Budget Alert: Groceries Budget Exceeded',
                [
                    'budget_name' => 'Groceries',
                    'current_amount' => 520,
                    'limit_amount' => 500,
                    'percentage' => 104
                ]
            );

            if ($notification) {
                $this->info("   ✓ Budget alert notification created (ID: {$notification->id})");
            } else {
                $this->warn("   ⚠ Budget alert notification not created (may be disabled in settings)");
            }
        } else {
            $this->warn("   ⚠ Budget alert notification type not found");
        }

        // Test 2: Large Expense Alert
        $this->info('2. Testing Large Expense Alert...');
        $expenseType = NotificationType::where('slug', 'large_expense')->first();
        
        if ($expenseType) {
            $notification = $notificationService->create(
                $user->id,
                $expenseType->id,
                'Large Expense Alert: $1,500 spent on Electronics',
                [
                    'amount' => 1500,
                    'category' => 'Electronics',
                    'description' => 'New laptop purchase'
                ]
            );

            if ($notification) {
                $this->info("   ✓ Large expense notification created (ID: {$notification->id})");
            } else {
                $this->warn("   ⚠ Large expense notification not created (may be disabled in settings)");
            }
        } else {
            $this->warn("   ⚠ Large expense notification type not found");
        }

        // Test 3: Goal Progress Update
        $this->info('3. Testing Goal Progress Update...');
        $goalType = NotificationType::where('slug', 'goal_progress_update')->first();
        
        if ($goalType) {
            $notification = $notificationService->create(
                $user->id,
                $goalType->id,
                'Goal Progress: Emergency Fund is 75% complete!',
                [
                    'goal_name' => 'Emergency Fund',
                    'current_amount' => 3750,
                    'target_amount' => 5000,
                    'percentage' => 75
                ]
            );

            if ($notification) {
                $this->info("   ✓ Goal progress notification created (ID: {$notification->id})");
            } else {
                $this->warn("   ⚠ Goal progress notification not created (may be disabled in settings)");
            }
        } else {
            $this->warn("   ⚠ Goal progress notification type not found");
        }

        $this->newLine();
        
        // Show notification counts - using direct query instead of relationship
        $totalNotifications = Notification::where('user_id', $user->id)->count();
        $unreadNotifications = Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();
        
        $this->info("Notification Summary:");
        $this->info("  Total notifications: {$totalNotifications}");
        $this->info("  Unread notifications: {$unreadNotifications}");
        
        $this->newLine();
        $this->info('Test completed! Check the application\'s notification bell to see the results.');
        
        return 0;
    }
}