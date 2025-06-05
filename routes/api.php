<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\IncomeAnalysisController;
use App\Http\Controllers\CreditorController;
use App\Http\Controllers\InvestmentController;
use App\Http\Controllers\InvestmentTransactionController;
use App\Http\Controllers\InvestmentPerformanceController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\ExpenseCategoryController;
use App\Http\Controllers\EarningCategoryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\NotificationSettingController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\EarningController;
use App\Http\Controllers\Api\SavingsCategoryController;

// All API routes protected by web session authentication with shared session state
Route::middleware(['web', 'auth'])->group(function () {
    // User info
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Category routes
    Route::prefix('categories')->group(function () {
        Route::get('{category}/subcategories', [\App\Http\Controllers\CategoryController::class, 'getSubcategories'])
            ->name('api.categories.subcategories');
        
        // Keep the old routes temporarily for backward compatibility
        Route::get('/expense/{category}/subcategories', [ExpenseCategoryController::class, 'getSubcategories'])
            ->name('api.expense-categories.subcategories');
        Route::get('/earning/{category}/subcategories', [EarningCategoryController::class, 'getSubcategories'])
            ->name('api.earning-categories.subcategories');
    });

    // Savings Categories Routes
    Route::prefix('savings-categories')->group(function () {
        Route::get('/', [SavingsCategoryController::class, 'index'])->name('api.savings-categories.index');
        Route::post('/', [SavingsCategoryController::class, 'store'])->name('api.savings-categories.store');
        Route::get('/{category}', [SavingsCategoryController::class, 'show'])
            ->where('category', '[0-9]+')
            ->name('api.savings-categories.show');
        Route::put('/{category}', [SavingsCategoryController::class, 'update'])
            ->where('category', '[0-9]+')
            ->name('api.savings-categories.update');
        Route::delete('/{category}', [SavingsCategoryController::class, 'destroy'])
            ->where('category', '[0-9]+')
            ->name('api.savings-categories.destroy');
    });

    // Expense and Earning routes
    Route::apiResource('expenses', ExpenseController::class)->names([
        'index' => 'api.expenses.index',
        'store' => 'api.expenses.store',
        'show' => 'api.expenses.show',
        'update' => 'api.expenses.update',
        'destroy' => 'api.expenses.destroy'
    ]);
    Route::apiResource('earnings', EarningController::class)->names([
        'index' => 'api.earnings.index',
        'store' => 'api.earnings.store',
        'show' => 'api.earnings.show',
        'update' => 'api.earnings.update',
        'destroy' => 'api.earnings.destroy'
    ]);

    // Income analysis routes
    Route::prefix('income-analysis')->group(function () {
        Route::get('/', [IncomeAnalysisController::class, 'index']);
        Route::get('/diversity', [IncomeAnalysisController::class, 'getDiversityAnalysis']);
        Route::get('/stability', [IncomeAnalysisController::class, 'getStabilityAnalysis']);
        Route::get('/frequency', [IncomeAnalysisController::class, 'getFrequencyAnalysis']);
        Route::get('/forecast', [IncomeAnalysisController::class, 'getForecast']);
    });

    // Creditor routes
    Route::prefix('creditors')->group(function () {
        Route::get('/', [CreditorController::class, 'index']);
        Route::post('/', [CreditorController::class, 'store']);
        Route::get('/{creditor}', [CreditorController::class, 'show']);
        Route::put('/{creditor}', [CreditorController::class, 'update']);
        Route::delete('/{creditor}', [CreditorController::class, 'destroy']);
        Route::post('/{creditor}/calculate-interest', [CreditorController::class, 'calculateInterest']);
        Route::get('/compare-strategies', [CreditorController::class, 'compareStrategies']);
    });

    // Investment routes
    Route::prefix('investments')->group(function () {
        // Investment categories
        Route::get('/categories', [InvestmentController::class, 'categories']);

        // Investment CRUD
        Route::get('/', [InvestmentController::class, 'index']);
        Route::post('/', [InvestmentController::class, 'store']);
        Route::get('/{investment}', [InvestmentController::class, 'show']);
        Route::put('/{investment}', [InvestmentController::class, 'update']);
        Route::delete('/{investment}', [InvestmentController::class, 'destroy']);

        // Investment transactions
        Route::get('/{investment}/transactions', [InvestmentTransactionController::class, 'index']);
        Route::post('/{investment}/transactions', [InvestmentTransactionController::class, 'store']);
        Route::put('/{investment}/transactions/{transaction}', [InvestmentTransactionController::class, 'update']);
        Route::delete('/{investment}/transactions/{transaction}', [InvestmentTransactionController::class, 'destroy']);

        // Investment performance
        Route::get('/{investment}/performance', [InvestmentPerformanceController::class, 'show']);
        Route::post('/{investment}/performance', [InvestmentPerformanceController::class, 'store']);
        Route::get('/{investment}/performance/history', [InvestmentPerformanceController::class, 'history']);
    });

    // Currency routes
    Route::prefix('currencies')->group(function () {
        // Currency CRUD endpoints
        Route::get('/', [CurrencyController::class, 'index']);
        Route::post('/', [CurrencyController::class, 'store']);
        Route::put('/{currency}', [CurrencyController::class, 'update']);
        Route::delete('/{currency}', [CurrencyController::class, 'destroy']);
        
        // Currency conversion and API endpoints
        Route::post('/convert', [CurrencyController::class, 'convert']);
        Route::get('/available', [CurrencyController::class, 'getAvailableCurrencies']);
        Route::post('/update-rates', [CurrencyController::class, 'updateExchangeRates']);
        Route::get('/update-status', [CurrencyController::class, 'getUpdateStatus']);
        Route::post('/clear-cache', [CurrencyController::class, 'clearRateCache']);
        Route::post('/set-default', [CurrencyController::class, 'setDefault']);
        Route::post('/set-base', [CurrencyController::class, 'setBaseCurrency']);
        Route::post('/display-settings', [CurrencyController::class, 'updateDisplaySettings']);
        Route::get('/current', [CurrencyController::class, 'getCurrentCurrency']);
        Route::post('/user-preference', [CurrencyController::class, 'updateUserCurrency']);
    });
    
    // Settings routes in API
    Route::prefix('settings')->group(function () {
        Route::post('/currency/display', [App\Http\Controllers\CurrencyController::class, 'updateDisplaySettings']);
    });

    // Notification routes
    Route::prefix('notifications')->group(function () {
        // Notification retrieval
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        
        // Notification marking
        Route::post('/{notification}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/{notification}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::put('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        
        // Notification deletion
        Route::delete('/{notification}', [NotificationController::class, 'destroy']);
    });

    // Notification Settings Routes
    Route::prefix('notifications/settings')->group(function () {
        Route::get('/', [NotificationSettingController::class, 'index']);
        Route::put('/{notificationType}', [NotificationSettingController::class, 'update']);
    });

    // Import routes
    Route::prefix('imports')->group(function () {
        Route::post('/', [App\Http\Controllers\ImportController::class, 'store']);
        Route::get('/{import}/status', [App\Http\Controllers\ImportController::class, 'status'])->name('imports.status');
        Route::delete('/{import}', [App\Http\Controllers\ImportController::class, 'destroy']);
    });

    // Export routes
    Route::prefix('exports')->group(function () {
        Route::post('/', [App\Http\Controllers\ExportController::class, 'store'])->name('exports.store');
        Route::get('/{export}/status', [App\Http\Controllers\ExportController::class, 'status']);
        Route::delete('/{export}', [App\Http\Controllers\ExportController::class, 'destroy']);
    });

    // Report routes
    Route::prefix('reports')->group(function () {
        Route::get('/budget-analysis', [App\Http\Controllers\ReportController::class, 'apiGetBudgetAnalysis']);
        Route::get('/tag-analysis', [App\Http\Controllers\ReportController::class, 'apiGetTagAnalysis']);
        Route::get('/payment-method-analysis', [App\Http\Controllers\ReportController::class, 'apiGetPaymentMethodAnalysis']);
        Route::get('/comparison', [App\Http\Controllers\ReportController::class, 'apiGetComparison']);
        Route::get('/forecast', [App\Http\Controllers\ReportController::class, 'apiGetForecast']);
        Route::get('/subcategory-analysis', [App\Http\Controllers\ReportController::class, 'apiGetSubcategoryAnalysis']);
        Route::post('/transactions/pdf', [App\Http\Controllers\ReportController::class, 'transactions'])->name('api.reports.transactions.pdf');
    });

    // Payment Schedule routes
    Route::prefix('payment-schedules')->group(function () {
        Route::get('/', [App\Http\Controllers\PaymentScheduleController::class, 'index']);
        Route::post('/', [App\Http\Controllers\PaymentScheduleController::class, 'store']);
        Route::get('/{paymentSchedule}', [App\Http\Controllers\PaymentScheduleController::class, 'show']);
        Route::put('/{paymentSchedule}', [App\Http\Controllers\PaymentScheduleController::class, 'update']);
        Route::delete('/{paymentSchedule}', [App\Http\Controllers\PaymentScheduleController::class, 'destroy']);
        Route::post('/{paymentSchedule}/process', [App\Http\Controllers\PaymentScheduleController::class, 'process']);
        Route::post('/{paymentSchedule}/cancel', [App\Http\Controllers\PaymentScheduleController::class, 'cancel']);
        Route::get('/category/{categoryId}/subcategories', [App\Http\Controllers\PaymentScheduleController::class, 'getSubcategories']);
    });
    
    // Goal routes
    Route::prefix('goals')->group(function () {
        Route::get('/{goal}/calculate-savings', [App\Http\Controllers\GoalController::class, 'calculateSavings']);
        Route::get('/{goal}/progress', [App\Http\Controllers\GoalController::class, 'getProgress']);
    });
});
