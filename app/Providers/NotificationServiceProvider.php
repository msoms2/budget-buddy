<?php

namespace App\Providers;

use App\Models\Expense;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class NotificationServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(NotificationService::class, function ($app) {
            return new NotificationService();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Listen for new expenses
        Event::listen('eloquent.created: ' . Expense::class, function (Expense $expense) {
            $notificationService = app(NotificationService::class);

            // Check if expense category exists
            if (!$expense->category) {
                return;
            }

            // Check if expense puts user over budget
            $budget = $expense->category->budgets()
                ->where('user_id', $expense->user_id)
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->first();

            if ($budget) {
                $notificationService->checkBudgetOverspending($expense, $budget);
            }

            // Check for unusually large expenses
            $notificationService->checkLargeExpense($expense);
        });
    }
}