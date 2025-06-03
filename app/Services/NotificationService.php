<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Expense;
use App\Models\Goal;
use App\Models\Notification;
use App\Models\NotificationSetting;
use App\Models\NotificationType;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\NotificationEmail;
use App\Mail\NotificationDigest;

class NotificationService
{
    /**
     * Create a notification for the user
     */
    private function createNotification(
        User $user,
        string $typeSlug,
        string $title,
        string $content,
        array $data = []
    ): ?Notification {
        try {
            $type = NotificationType::where('slug', $typeSlug)->first();
            
            if (!$type) {
                Log::error("Notification type not found: {$typeSlug}");
                return null;
            }

            $settings = NotificationSetting::where('user_id', $user->id)
                ->where('notification_type_id', $type->id)
                ->first();

            // Create default settings if none exist
            if (!$settings) {
                $settings = NotificationSetting::create([
                    'user_id' => $user->id,
                    'notification_type_id' => $type->id,
                    'is_enabled' => true,
                    'frequency' => 'immediate',
                    'channels' => ['email', 'in_app']
                ]);
            }

            if (!$settings->is_enabled) {
                return null;
            }

            // Create the notification
            $notification = Notification::create([
                'user_id' => $user->id,
                'notification_type_id' => $type->id,
                'title' => $title,
                'content' => $content,
                'data' => $data
            ]);

            // Send email if email channel is enabled
            if ($settings->isChannelEnabled('email') && $settings->frequency === 'immediate') {
                $this->sendEmailNotification($user, $notification);
            }

            return $notification;
        } catch (\Exception $e) {
            Log::error('Failed to create notification: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Send email notification
     */
    private function sendEmailNotification(User $user, Notification $notification): void
    {
        try {
            Mail::to($user->email)->send(new NotificationEmail($notification));
        } catch (\Exception $e) {
            Log::error('Failed to send email notification: ' . $e->getMessage());
        }
    }

    /**
     * Check for budget overspending
     */
    public function checkBudgetOverspending(Expense $expense, Budget $budget): ?Notification
    {
        if ($budget->spent > $budget->amount) {
            return $this->notifyBudgetLimit($expense->user, $budget, $expense);
        }

        return null;
    }

    /**
     * Check for unusually large expenses based on category average
     */
    public function checkLargeExpense(Expense $expense): ?Notification
    {
        // Get average expense amount for this category in the last 3 months
        $threeMonthsAgo = now()->subMonths(3);
        $averageAmount = Expense::where('category_id', $expense->category_id)
            ->where('user_id', $expense->user_id)
            ->where('created_at', '>=', $threeMonthsAgo)
            ->where('id', '!=', $expense->id)
            ->avg('amount') ?? 0;

        // If this expense is more than twice the average, send notification
        if ($averageAmount > 0 && $expense->amount > ($averageAmount * 2)) {
            return $this->createNotification(
                $expense->user,
                'large_expense',
                'Unusually Large Expense',
                "An expense of {$expense->amount} was recorded in {$expense->category->name}, which is higher than usual.",
                [
                    'expense_id' => $expense->id,
                    'amount' => $expense->amount,
                    'average_amount' => $averageAmount,
                    'category_id' => $expense->category_id,
                ]
            );
        }

        return null;
    }

    /**
     * Create notification for bill payment
     */
    public function notifyBillPayment(User $user, float $amount, string $dueDate): ?Notification
    {
        return $this->createNotification(
            $user,
            'bill_payment_reminder',
            'Upcoming Bill Payment',
            "You have a bill payment of $" . number_format($amount, 2) . " due on {$dueDate}",
            [
                'amount' => $amount,
                'due_date' => $dueDate
            ]
        );
    }

    /**
     * Create notification for budget limit reached
     */
    public function notifyBudgetLimit(User $user, Budget $budget, Expense $expense): ?Notification
    {
        $percentageUsed = ($budget->spent / $budget->amount) * 100;
        
        return $this->createNotification(
            $user,
            'budget_limit_alert',
            'Budget Limit Alert',
            "You've used " . number_format($percentageUsed, 1) . "% of your {$budget->category->name} budget",
            [
                'budget_id' => $budget->id,
                'category_id' => $budget->category_id,
                'amount_spent' => $budget->spent,
                'budget_limit' => $budget->amount,
                'expense_id' => $expense->id,
                'percentage_used' => $percentageUsed
            ]
        );
    }

    /**
     * Create notification for goal progress
     */
    public function notifyGoalProgress(User $user, Goal $goal): ?Notification
    {
        $progressPercentage = ($goal->current_amount / $goal->target_amount) * 100;
        
        return $this->createNotification(
            $user,
            'goal_progress_update',
            'Goal Progress Update',
            "You're " . number_format($progressPercentage, 1) . "% of the way to your {$goal->name} goal!",
            [
                'goal_id' => $goal->id,
                'current_amount' => $goal->current_amount,
                'target_amount' => $goal->target_amount,
                'progress_percentage' => $progressPercentage
            ]
        );
    }

    /**
     * Create notification for approaching goal deadline
     */
    public function notifyGoalDeadline(User $user, Goal $goal, int $daysRemaining): ?Notification
    {
        return $this->createNotification(
            $user,
            'goal_progress_update',
            'Goal Deadline Approaching',
            "Your goal '{$goal->name}' is due in {$daysRemaining} days. You're currently at " . 
            number_format(($goal->current_amount / $goal->target_amount) * 100, 1) . "% completion.",
            [
                'goal_id' => $goal->id,
                'days_remaining' => $daysRemaining,
                'current_amount' => $goal->current_amount,
                'target_amount' => $goal->target_amount,
                'deadline' => $goal->target_date
            ]
        );
    }

    /**
     * Send scheduled notifications based on frequency preferences
     */
    public function sendScheduledNotifications(): void
    {
        $settings = NotificationSetting::with(['user', 'notificationType'])
            ->where('is_enabled', true)
            ->whereIn('frequency', ['daily', 'weekly'])
            ->get();

        foreach ($settings as $setting) {
            try {
                if ($this->shouldSendNotification($setting)) {
                    $this->sendDigestNotification($setting);
                }
            } catch (\Exception $e) {
                Log::error('Failed to send scheduled notification: ' . $e->getMessage());
            }
        }
    }

    /**
     * Send digest notification
     */
    private function sendDigestNotification(NotificationSetting $setting): void
    {
        $notifications = Notification::where('user_id', $setting->user_id)
            ->where('notification_type_id', $setting->notification_type_id)
            ->where('created_at', '>=', $this->getDigestPeriod($setting->frequency))
            ->unread()
            ->get();

        if ($notifications->isNotEmpty() && $setting->isChannelEnabled('email')) {
            Mail::to($setting->user->email)->send(new NotificationDigest($notifications, $setting->frequency));
        }
    }

    /**
     * Get the period for digest notifications
     */
    private function getDigestPeriod(string $frequency): \Carbon\Carbon
    {
        return match ($frequency) {
            'daily' => now()->subDay(),
            'weekly' => now()->subWeek(),
            default => now()
        };
    }

    /**
     * Check if notification should be sent based on frequency
     */
    private function shouldSendNotification(NotificationSetting $setting): bool
    {
        $lastNotification = Notification::where('user_id', $setting->user_id)
            ->where('notification_type_id', $setting->notification_type_id)
            ->latest()
            ->first();

        if (!$lastNotification) {
            return true;
        }

        $now = now();
        $lastSent = $lastNotification->created_at;

        return match ($setting->frequency) {
            'immediate' => true,
            'daily' => $lastSent->diffInDays($now) >= 1,
            'weekly' => $lastSent->diffInWeeks($now) >= 1,
            default => false,
        };
    }

    /**
     * Get unread notification count for user
     */
    public function getUnreadCount(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->unread()
            ->count();
    }

    /**
     * Create test notification (for development/testing)
     */
    public function createTestNotification(User $user): ?Notification
    {
        return $this->createNotification(
            $user,
            'budget_limit_alert',
            'Test Notification',
            'This is a test notification to verify the notification system is working correctly.',
            ['test' => true]
        );
    }

    /**
     * Create a new notification for a user.
     *
     * @param int $userId The user ID
     * @param int $notificationTypeId The notification type ID
     * @param string $message The notification message
     * @param array $data Additional data for the notification
     * @return Notification|null The created notification or null if disabled
     */
    public function create(int $userId, int $notificationTypeId, string $message, array $data = []): ?Notification
    {
        // Check if the user has disabled this notification type
        $setting = NotificationSetting::where('user_id', $userId)
            ->where('notification_type_id', $notificationTypeId)
            ->first();

        // If setting exists and notifications are disabled, return null
        if ($setting && !$setting->is_enabled) {
            return null;
        }

        // Get the notification type
        $type = NotificationType::find($notificationTypeId);
        $user = User::find($userId);
        
        if (!$user) {
            Log::error("User not found for notification: {$userId}");
            return null;
        }
        
        // Create the notification
        $notification = new Notification([
            'user_id' => $userId,
            'notification_type_id' => $notificationTypeId,
            'title' => $type ? $type->name : 'Notification',
            'content' => $message,
            'data' => $data
        ]);

        $notification->save();

        // Send email if configured for immediate delivery
        if ($setting && $setting->isChannelEnabled('email') && $setting->frequency === 'immediate') {
            try {
                Mail::to($user->email)->send(new NotificationEmail($notification));
            } catch (\Exception $e) {
                Log::error('Failed to send email notification: ' . $e->getMessage());
            }
        }

        return $notification;
    }
}