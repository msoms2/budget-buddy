<?php

use App\Http\Controllers\IncomeAnalysisController;
use App\Http\Controllers\InvestmentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\EarningController;
use App\Http\Controllers\ExpensesReportController;
use App\Http\Controllers\EarningReportController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\SavingsController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CreditorController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\Expense;
use App\Models\Earning;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    // Handle category type persistence across sessions
    $categoryType = request('categoryType');
    if ($categoryType) {
        session(['dashboard_category_type' => $categoryType]);
    } else {
        $categoryType = session('dashboard_category_type', 'expense');
    }

    // Get the date ranges for different periods
    $now = Carbon::now();
    $startOfMonth = $now->copy()->startOfMonth();
    $endOfMonth = $now->copy()->endOfMonth();
    $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
    $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

    // Get current month's data
    $currentMonthEarnings = Earning::where('user_id', Auth::id())
        ->whereBetween('date', [$startOfMonth, $endOfMonth])
        ->sum('amount');
    
    $currentMonthExpenses = Expense::where('user_id', Auth::id())
        ->whereBetween('date', [$startOfMonth, $endOfMonth])
        ->sum('amount');

    // Get last month's data for comparison
    $lastMonthEarnings = Earning::where('user_id', Auth::id())
        ->whereBetween('date', [$lastMonthStart, $lastMonthEnd])
        ->sum('amount');
    
    $lastMonthExpenses = Expense::where('user_id', Auth::id())
        ->whereBetween('date', [$lastMonthStart, $lastMonthEnd])
        ->sum('amount');

    // Calculate changes
    $earningsChange = $lastMonthEarnings ? (($currentMonthEarnings - $lastMonthEarnings) / $lastMonthEarnings) * 100 : 0;
    $expensesChange = $lastMonthExpenses ? (($currentMonthExpenses - $lastMonthExpenses) / $lastMonthExpenses) * 100 : 0;

    // Calculate total balance
    $totalEarnings = Earning::where('user_id', Auth::id())->sum('amount');
    $totalExpenses = Expense::where('user_id', Auth::id())->sum('amount');
    $totalBalance = $totalEarnings - $totalExpenses;

    // Get recent transactions
    $recentExpenses = Expense::with(['category', 'paymentMethod'])
        ->where('user_id', Auth::id())
        ->latest('date')
        ->take(5)
        ->get()
        ->map(function ($expense) {
            return [
                'id' => $expense->id,
                'name' => $expense->name ?? 'Unnamed Expense',
                'description' => $expense->description ?? '',
                'amount' => $expense->amount,
                'date' => $expense->date,
                'category' => $expense->category ? $expense->category->name : 'Uncategorized',
                'type' => 'expense'
            ];
        });

    $recentEarnings = Earning::with(['category'])
        ->where('user_id', Auth::id())
        ->latest('date')
        ->take(5)
        ->get()
        ->map(function ($earning) {
            return [
                'id' => $earning->id,
                'name' => $earning->name ?? 'Unnamed Income',
                'description' => $earning->description ?? '',
                'amount' => $earning->amount,
                'date' => $earning->date,
                'category' => $earning->category ? $earning->category->name : 'Uncategorized',
                'type' => 'earning'
            ];
        });
        
    // Merge and sort transactions by date
    $recentTransactions = $recentExpenses->concat($recentEarnings)
        ->sortByDesc('date')
        ->take(5)
        ->values()
        ->all();

    // Fetch last 6 months of income and expense data for the chart
    $sixMonthsAgo = $now->copy()->subMonths(5)->startOfMonth(); // Start from 6 months ago
    
    // Collect monthly data for the last 6 months
    $monthlyFinanceData = [];
    for ($i = 0; $i < 6; $i++) {
        $currentPeriodStart = $now->copy()->subMonths($i)->startOfMonth();
        $currentPeriodEnd = $now->copy()->subMonths($i)->endOfMonth();
        
        // Get month name for display (e.g., "May")
        $monthName = $currentPeriodStart->format('M');
        
        // Get total income for the month
        $monthIncome = Earning::where('user_id', Auth::id())
            ->whereBetween('date', [$currentPeriodStart, $currentPeriodEnd])
            ->sum('amount');
            
        // Get total expenses for the month
        $monthExpenses = Expense::where('user_id', Auth::id())
            ->whereBetween('date', [$currentPeriodStart, $currentPeriodEnd])
            ->sum('amount');
            
        // Add to the data array
        $monthlyFinanceData[] = [
            'month' => $monthName,
            'income' => (float)$monthIncome,
            'expenses' => (float)$monthExpenses
        ];
    }
    
    // Reverse the array to show oldest to newest (left to right)
    $monthlyFinanceData = array_reverse($monthlyFinanceData);

    // Get category breakdowns
    $expenseCategoryBreakdown = DB::select("
        SELECT ec.name, SUM(e.amount) as total
        FROM expense_categories ec
        INNER JOIN expenses e ON e.category_id = ec.id
        WHERE e.user_id = ?
        AND e.date BETWEEN ? AND ?
        GROUP BY ec.id, ec.name
    ", [Auth::id(), $startOfMonth, $endOfMonth]);

    $incomeCategoryBreakdown = DB::select("
        SELECT ec.name, SUM(e.amount) as total
        FROM earning_categories ec
        INNER JOIN earnings e ON e.category_id = ec.id
        WHERE e.user_id = ?
        AND e.date BETWEEN ? AND ?
        GROUP BY ec.id, ec.name
    ", [Auth::id(), $startOfMonth, $endOfMonth]);

    // Get top 3 active budgets
    $budgets = \App\Models\Budget::where('budgets.user_id', Auth::id())
        ->where('budgets.start_date', '<=', now())
        ->where('budgets.end_date', '>=', now())
        ->with(['category', 'currency'])
        ->orderBy('created_at', 'desc')
        ->take(3)
        ->get()
        ->map(function($budget) {
            $utilization = $budget->calculateUtilization();
            return array_merge($budget->toArray(), [
                'utilization' => $utilization,
            ]);
        });

    // Debug logging for budget data
    Log::info('Dashboard budget query debug', [
        'user_id' => Auth::id(),
        'current_date' => now()->toDateString(),
        'budgets_found' => $budgets->count(),
        'budgets_data' => $budgets->toArray(),
        'all_user_budgets' => \App\Models\Budget::where('user_id', Auth::id())->count()
    ]);

    // Get goals data
    $goals = \App\Models\Goal::where('user_id', Auth::id())
        ->where('status', 'active')
        ->orderBy('target_date')
        ->with('category') // Eager load the category relationship
        ->take(5)
        ->get()
        ->map(function($goal) {
            return [
                'id' => $goal->id,
                'title' => $goal->title,
                'target_amount' => $goal->target_amount,
                'current_amount' => $goal->current_amount,
                'progress_percentage' => $goal->progress_percentage,
                'target_date' => $goal->target_date,
                'status' => $goal->status,
                'category' => $goal->category ? $goal->category->name : null
            ];
        });

    // Calculate goals summary
    $goalsSummary = [
        'total_goals' => \App\Models\Goal::where('user_id', Auth::id())->count(),
        'active_goals' => \App\Models\Goal::where('user_id', Auth::id())->where('status', 'active')->count(),
        'completed_goals' => \App\Models\Goal::where('user_id', Auth::id())->where('status', 'completed')->count(),
        'total_target_amount' => \App\Models\Goal::where('user_id', Auth::id())->where('status', 'active')->sum('target_amount'),
        'total_current_amount' => \App\Models\Goal::where('user_id', Auth::id())->where('status', 'active')->sum('current_amount')
    ];

    // Get investments data
    $investments = \App\Models\Investment::where('user_id', Auth::id())
        ->with(['category', 'performanceLogs' => function ($query) {
            $query->latest('date')->limit(1);
        }])
        ->take(5)
        ->get()
        ->map(function($investment) {
            return [
                'id' => $investment->id,
                'name' => $investment->name,
                'symbol' => $investment->symbol,
                'category' => $investment->category ? $investment->category->name : 'Uncategorized',
                'current_value' => $investment->getCurrentValue(),
                'initial_amount' => $investment->initial_amount,
                'total_return' => $investment->calculateTotalReturn(),
                'status' => $investment->status,
                'purchase_date' => $investment->purchase_date
            ];
        });

    // Calculate investments summary
    $investmentsSummary = [
        'total_investments' => \App\Models\Investment::where('user_id', Auth::id())->count(),
        'total_value' => \App\Models\Investment::where('user_id', Auth::id())->sum('current_amount'),
        'total_invested' => \App\Models\Investment::where('user_id', Auth::id())->sum('initial_amount'),
        'total_return' => \App\Models\Investment::where('user_id', Auth::id())->get()->sum(function($inv) {
            return $inv->calculateTotalReturn();
        })
    ];

    // Get debt management data
    $debts = \App\Models\Creditor::where('user_id', Auth::id())
        ->where('status', 'active')
        ->orderBy('due_date')
        ->take(5)
        ->get()
        ->map(function($debt) {
            return [
                'id' => $debt->id,
                'name' => $debt->name,
                'amount_owed' => $debt->amount_owed,
                'interest_rate' => $debt->interest_rate,
                'due_date' => $debt->due_date,
                'minimum_payment' => $debt->minimum_payment,
                'status' => $debt->status,
                'payment_frequency' => $debt->payment_frequency
            ];
        });

    // Calculate debt summary
    $debtSummary = [
        'total_debts' => \App\Models\Creditor::where('user_id', Auth::id())->where('status', 'active')->count(),
        'total_amount_owed' => \App\Models\Creditor::where('user_id', Auth::id())->where('status', 'active')->sum('amount_owed'),
        'total_minimum_payments' => \App\Models\Creditor::where('user_id', Auth::id())->where('status', 'active')->sum('minimum_payment'),
        'overdue_debts' => \App\Models\Creditor::where('user_id', Auth::id())
            ->where('status', 'active')
            ->where('due_date', '<', $now)
            ->count()
    ];

    // Get payment schedules data
    $paymentSchedules = \App\Models\PaymentSchedule::where('user_id', Auth::id())
        ->where('status', 'pending')
        ->orderBy('due_date')
        ->take(5)
        ->with(['category'])
        ->get()
        ->map(function($schedule) {
            return [
                'id' => $schedule->id,
                'name' => $schedule->name,
                'amount' => $schedule->amount,
                'due_date' => $schedule->due_date,
                'type' => $schedule->type,
                'status' => $schedule->status,
                'category' => $schedule->category ? $schedule->category->name : 'Uncategorized',
                'is_recurring' => $schedule->is_recurring,
                'frequency' => $schedule->frequency
            ];
        });

    // Calculate payment schedules summary
    $schedulesSummary = [
        'total_schedules' => \App\Models\PaymentSchedule::where('user_id', Auth::id())->count(),
        'pending_schedules' => \App\Models\PaymentSchedule::where('user_id', Auth::id())->where('status', 'pending')->count(),
        'overdue_schedules' => \App\Models\PaymentSchedule::where('user_id', Auth::id())
            ->where('status', 'pending')
            ->where('due_date', '<', $now)
            ->count(),
        'upcoming_amount' => \App\Models\PaymentSchedule::where('user_id', Auth::id())
            ->where('status', 'pending')
            ->where('due_date', '>=', $now)
            ->where('due_date', '<=', $now->copy()->addDays(7))
            ->sum('amount')
    ];

    // Get all categories
    $categories = [
        'expense' => \App\Models\ExpenseCategory::where('expense_categories.user_id', Auth::id())->get(),
        'income' => \App\Models\EarningCategory::where('earning_categories.user_id', Auth::id())->get()
    ];

    // Determine which category breakdown to use based on session
    $categoryBreakdown = $categoryType === 'income'
        ? collect($incomeCategoryBreakdown)->map(function ($item) {
            return [
                'name' => $item->name ?? '',
                'amount' => (float)($item->total ?? 0),
                'color' => '#' . substr(md5($item->name ?? 'unknown'), 0, 6)
            ];
        })->values()->all()
        : collect($expenseCategoryBreakdown)->map(function ($item) {
            return [
                'name' => $item->name ?? '',
                'amount' => (float)($item->total ?? 0),
                'color' => '#' . substr(md5($item->name ?? 'unknown'), 0, 6)
            ];
        })->values()->all();

    return Inertia::render('Dashboard', [
        'totalBalance' => $totalBalance,
        'monthlyIncome' => $currentMonthEarnings,
        'monthlySpending' => $currentMonthExpenses,
        'currentPeriod' => [
            'earnings' => $currentMonthEarnings,
            'expenses' => $currentMonthExpenses
        ],
        'lastPeriod' => [
            'earnings' => $lastMonthEarnings,
            'expenses' => $lastMonthExpenses
        ],
        'changes' => [
            'earnings' => $earningsChange,
            'expenses' => $expensesChange
        ],
        'recentTransactions' => $recentTransactions,
        'expenseCategoryBreakdown' => collect($expenseCategoryBreakdown)->map(function ($item) {
            return [
                'name' => $item->name ?? '',
                'amount' => (float)($item->total ?? 0), // Ensure it's a float and use 'amount' as the key
                'color' => '#' . substr(md5($item->name ?? 'unknown'), 0, 6) // Generate consistent color based on name
            ];
        })->values()->all(),
        'incomeCategoryBreakdown' => collect($incomeCategoryBreakdown)->map(function ($item) {
            return [
                'name' => $item->name ?? '',
                'amount' => (float)($item->total ?? 0), // Ensure it's a float and use 'amount' as the key
                'color' => '#' . substr(md5($item->name ?? 'unknown'), 0, 6) // Generate consistent color based on name
            ];
        })->values()->all(),
        'budgets' => $budgets,
        'goals' => $goals,
        'goalsSummary' => $goalsSummary,
        'investments' => $investments,
        'investmentsSummary' => $investmentsSummary,
        'debts' => $debts,
        'debtSummary' => $debtSummary,
        'paymentSchedules' => $paymentSchedules,
        'schedulesSummary' => $schedulesSummary,
        'categories' => $categories,
        'monthlyFinanceData' => $monthlyFinanceData, // Add the monthly finance data for the chart
        'categoryBreakdown' => $categoryBreakdown, // Add the generic category breakdown for session persistence
        'categoryType' => $categoryType // Add the current category type
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // Payment Schedule routes
    Route::resource('payment-schedules', App\Http\Controllers\PaymentScheduleController::class);
    Route::post('/payment-schedules/{paymentSchedule}/process', [App\Http\Controllers\PaymentScheduleController::class, 'process'])->name('payment-schedules.process');
    Route::post('/payment-schedules/{paymentSchedule}/cancel', [App\Http\Controllers\PaymentScheduleController::class, 'cancel'])->name('payment-schedules.cancel');
    Route::get('/payment-schedules/category/{categoryId}/subcategories', [App\Http\Controllers\PaymentScheduleController::class, 'getSubcategories'])->name('payment-schedules.subcategories');

    // Dedicated Payment Schedules page
    Route::get('/payment-schedules', [App\Http\Controllers\TransactionController::class, 'scheduleIndex'])->name('payment-schedules.index');

    // Reports Routes
    Route::get('/reports', function() {
        return redirect()->route('reports.dashboard');
    });
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [App\Http\Controllers\ReportController::class, 'unified'])->name('unified');
        Route::get('/dashboard', [App\Http\Controllers\ReportController::class, 'dashboard'])->name('dashboard');
        Route::get('/comparison', [App\Http\Controllers\ReportController::class, 'comparison'])->name('comparison');
        Route::get('/budget-analysis', [App\Http\Controllers\ReportController::class, 'budgetAnalysis'])->name('budget-analysis');
        Route::get('/tag-analysis', [App\Http\Controllers\ReportController::class, 'tagAnalysis'])->name('tag-analysis');
        Route::get('/payment-method-analysis', [App\Http\Controllers\ReportController::class, 'paymentMethodAnalysis'])->name('payment-method-analysis');
        Route::get('/forecast', [App\Http\Controllers\ReportController::class, 'forecast'])->name('forecast');
        Route::get('/transactions', [App\Http\Controllers\ReportController::class, 'transactionsPage'])->name('transactions');
        Route::post('/transactions/generate', [App\Http\Controllers\ReportController::class, 'transactions'])->name('transactions.generate');
    });

    // No replacement - remove these routes as they're defined in the admin group below

    // Transaction routes
    Route::middleware(['verified'])->group(function () {
        // Transactions routes
        Route::resource('transactions', App\Http\Controllers\TransactionController::class);
        
        // Payment Schedule routes integrated into transactions
        Route::prefix('transactions/schedules')->name('transactions.schedules.')->group(function () {
            Route::get('/', [App\Http\Controllers\TransactionController::class, 'indexSchedules'])->name('index');
            Route::post('/', [App\Http\Controllers\TransactionController::class, 'storeSchedule'])->name('store');
            Route::get('/create', [App\Http\Controllers\TransactionController::class, 'createSchedule'])->name('create');
            Route::get('/{schedule}', [App\Http\Controllers\TransactionController::class, 'showSchedule'])->name('show');
            Route::get('/{schedule}/edit', [App\Http\Controllers\TransactionController::class, 'editSchedule'])->name('edit');
            Route::put('/{schedule}', [App\Http\Controllers\TransactionController::class, 'updateSchedule'])->name('update');
            Route::delete('/{schedule}', [App\Http\Controllers\TransactionController::class, 'destroySchedule'])->name('destroy');
            Route::post('/{schedule}/process', [App\Http\Controllers\TransactionController::class, 'processSchedule'])->name('process');
            Route::post('/{schedule}/cancel', [App\Http\Controllers\TransactionController::class, 'cancelSchedule'])->name('cancel');
            Route::get('/category/{categoryId}/subcategories', [App\Http\Controllers\TransactionController::class, 'getScheduleSubcategories'])->name('subcategories');
        });
        
        // Legacy routes for backward compatibility (redirect to new routes)
        // Route::get('/payment-schedules', function() { 
        //     return redirect()->route('transactions.index', ['tab' => 'schedules']); 
        // })->name('payment-schedules.index.redirect');
        
        // Route::get('/payment-schedules/create', function() { 
        //     return redirect()->route('transactions.index', ['tab' => 'schedules', 'action' => 'create']); 
        // })->name('payment-schedules.create.redirect');
        
        // Route::get('/payment-schedules/{id}', function($id) { 
        //     return redirect()->route('transactions.schedules.show', $id); 
        // })->name('payment-schedules.show.redirect');
        
        // Route::get('/payment-schedules/{id}/edit', function($id) { 
        //     return redirect()->route('transactions.schedules.edit', $id); 
        // })->name('payment-schedules.edit.redirect');
    });
    
    // Expense routes
    Route::resource('expenses', ExpenseController::class);
    
    // Earning routes  
    Route::resource('earnings', EarningController::class);
    
    // Role management routes
    Route::resource('roles', RoleController::class);
    Route::post('/roles/assign/{userId}', [RoleController::class, 'assignRoles'])->name('roles.assign');
    
    // Unified category routes
    Route::resource('categories', CategoryController::class);
    
    // Category management routes
    Route::get('/expense-category/{category}', [CategoryController::class, 'showExpense'])->name('expense-category.show');
    Route::get('/income-category/{category}', [CategoryController::class, 'showIncome'])->name('income-category.show');
    Route::get('/expense-category/{category}/edit', [CategoryController::class, 'editExpense'])->name('expense-category.edit');
    Route::get('/income-category/{category}/edit', [CategoryController::class, 'editIncome'])->name('income-category.edit');
    Route::delete('/expense-category/{category}', [CategoryController::class, 'destroyExpense'])->name('expense-category.destroy');
    Route::delete('/income-category/{category}', [CategoryController::class, 'destroyIncome'])->name('income-category.destroy');
    
    // Subcategory routes - moved to API
    
    // Creditor (Debt) routes
    Route::resource('creditors', CreditorController::class);
    Route::post('/creditors/{creditor}/calculate-interest', [CreditorController::class, 'calculateInterest'])->name('creditors.calculate-interest');
    Route::get('/creditors/compare-strategies', [CreditorController::class, 'compareStrategies'])->name('creditors.compare-strategies');
    
    // Goals routes
    Route::resource('goals', GoalController::class);
    Route::post('/goals/{goal}/update-progress', [GoalController::class, 'updateProgress'])->name('goals.update-progress');
    Route::get('/goals/{goal}/calculate-savings', [GoalController::class, 'calculateSavings'])->name('goals.calculate-savings');
    
    // Savings routes
    Route::resource('savings', SavingsController::class);
    Route::get('/savings/dashboard', [SavingsController::class, 'dashboard'])->name('savings.dashboard');
    Route::post('/savings/{saving}/update-progress', [SavingsController::class, 'updateProgress'])->name('savings.update-progress');
    Route::get('/savings/{saving}/calculate-targets', [SavingsController::class, 'calculateTargets'])->name('savings.calculate-targets');
    
    // Budget routes
    Route::resource('budgets', BudgetController::class);

    // Investment routes
    Route::resource('investments', InvestmentController::class);
    Route::get('/investments/{investment}/performance', [InvestmentController::class, 'getPerformance'])->name('investments.performance');
    Route::get('/investments/{investment}/performance/history', [InvestmentController::class, 'getPerformanceHistory'])->name('investments.performance.history');
    Route::get('/dashboard/budgets', [BudgetController::class, 'dashboardBudgets'])->name('dashboard.budgets');
    Route::post('/budgets/rollover', [BudgetController::class, 'processRollovers'])->name('budgets.rollover');
    Route::post('/budgets/apply-method', [BudgetController::class, 'applyBudgetMethod'])->name('budgets.apply-method');
    
    // Budget comparison routes
    Route::get('/budgets/{budget}/variance', [BudgetController::class, 'getVarianceAnalysis'])->name('budgets.variance');
    Route::get('/budgets/{budget}/monthly', [BudgetController::class, 'getMonthlyComparison'])->name('budgets.monthly');
    Route::get('/budgets/{budget}/yearly', [BudgetController::class, 'getYearlyComparison'])->name('budgets.yearly');
    Route::get('/budgets/{budget}/comparison', [BudgetController::class, 'showComparison'])->name('budgets.comparison');
    
    // Reports routes
    Route::resource('expenses-reports', ExpensesReportController::class)->except(['edit', 'update']);
    Route::resource('earning-reports', EarningReportController::class)->except(['edit', 'update']);
    
    // Import routes
    Route::resource('imports', ImportController::class)->except(['edit', 'update']);
    
    // Export routes
    Route::post('/exports', [ExportController::class, 'store'])->name('web.exports.store');
    Route::get('/exports/{export}/status', [ExportController::class, 'status'])->name('web.exports.status');
    Route::delete('/exports/{export}', [ExportController::class, 'destroy'])->name('web.exports.destroy');
    Route::get('/exports/{export}/download', [ExportController::class, 'download'])->name('web.exports.download');
    
    // Statistics routes
    Route::middleware(['auth', 'verified'])->prefix('statistics')->name('statistics.')->group(function () {
        Route::get('/', [App\Http\Controllers\StatisticsController::class, 'index'])->name('index');
        Route::get('/payment-methods', [App\Http\Controllers\StatisticsController::class, 'paymentMethodAnalysis'])->name('payment-methods');
        Route::get('/income-analysis', [App\Http\Controllers\IncomeAnalysisController::class, 'index'])->name('income-analysis');
    });

    // Admin routes
    Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('index');
        Route::get('/users', [AdminController::class, 'users'])->name('users');
        Route::get('/users/{id}', [AdminController::class, 'showUser'])->name('users.show');
        Route::get('/transactions', [AdminController::class, 'transactions'])->name('transactions');
        
        // User Management Routes
        Route::get('/users/create', [AdminController::class, 'createUser'])->name('users.create');
        Route::post('/users', [AdminController::class, 'storeUser'])->name('users.store');
        Route::get('/users/{user}/edit', [AdminController::class, 'editUser'])->name('users.edit');
        Route::put('/users/{user}', [AdminController::class, 'updateUser'])->name('users.update');
        Route::delete('/users/{user}', [AdminController::class, 'destroyUser'])->name('users.destroy');
        
        // User Data & Activity Routes
        Route::get('/users/{user}/activity', [AdminController::class, 'getUserActivity'])->name('users.activity');
        Route::get('/users/{user}/timeline', [AdminController::class, 'getUserActivityTimelineJson'])->name('users.timeline');
        Route::get('/users/{user}/transactions', [AdminController::class, 'getUserTransactions'])->name('users.transactions');
        
        // User Action Routes
        Route::post('/users/{user}/roles', [AdminController::class, 'updateUserRoles'])->name('users.roles');
        Route::post('/users/{user}/password-reset', [AdminController::class, 'resetUserPassword'])->name('users.password-reset');
        Route::post('/users/{user}/status', [AdminController::class, 'updateUserStatus'])->name('users.status');
        
        // Bulk Operations
        Route::post('/users/bulk-action', [AdminController::class, 'bulkUserActions'])->name('users.bulk');
        
        // Export User Data
        Route::get('/users/{user}/export', [AdminController::class, 'exportUserData'])->name('users.export');

        // Analytics Routes with currency check
        Route::middleware(['currency.check'])->group(function () {
            Route::prefix('analytics')->name('analytics.')->group(function () {
                Route::get('/', [AdminController::class, 'unifiedAnalytics'])->name('index');
                Route::get('/data', [AdminController::class, 'getUnifiedAnalyticsData'])->name('data');
                Route::get('/categories', [AdminController::class, 'categoriesAnalytics'])->name('categories');
                Route::get('/budgets', [AdminController::class, 'budgetAnalytics'])->name('budgets');
                Route::get('/goals', [AdminController::class, 'goalsAnalytics'])->name('goals');
                Route::get('/debts', [AdminController::class, 'debtAnalytics'])->name('debts');
                Route::get('/investments', [AdminController::class, 'investmentAnalytics'])->name('investments');
            });
        });
    });
    
    // Profile routes
    Route::get('/profile', [App\Http\Controllers\ProfileController::class, 'index'])->name('profile.index');
    Route::put('/profile', [App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
    
    // Settings routes
    Route::get('/settings', [App\Http\Controllers\SettingsController::class, 'index'])->name('settings.index');
    Route::put('/settings', [App\Http\Controllers\SettingsController::class, 'update'])->name('settings.update');
    Route::post('/settings/currency/display', [App\Http\Controllers\CurrencyController::class, 'updateDisplaySettings'])->name('settings.currency.display');
    Route::post('/settings/currency/set-base', [App\Http\Controllers\CurrencyController::class, 'setBaseCurrency'])->name('settings.currency.set-base');
    Route::post('/settings/currency/set-default', [App\Http\Controllers\CurrencyController::class, 'setDefault'])->name('settings.currency.set-default');
    Route::post('/settings/currency/preference', [App\Http\Controllers\CurrencyController::class, 'updateUserCurrency'])->name('settings.currency.preference');

    // Notifications routes
    Route::get('/notifications', [NotificationController::class, 'page'])->name('notifications.index');
    // Currency preference and exchange rate endpoints
    Route::get('/currency/current', [App\Http\Controllers\CurrencyController::class, 'getCurrentCurrency'])->name('currency.current');
    Route::post('/currency/update-exchange-rates', [App\Http\Controllers\CurrencyController::class, 'updateExchangeRates'])->name('currency.update-exchange-rates');
});

require __DIR__.'/auth.php';
