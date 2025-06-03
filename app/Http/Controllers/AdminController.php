<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Currency;
use App\Models\Debt;
use App\Models\Goal;
use App\Models\Investment;
use App\Models\Transaction;
use App\Models\User;
use App\Models\ExpenseCategory;
use App\Models\EarningCategory;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Display admin dashboard.
     */
    public function dashboard()
    {
        try {
            // Get active users (active in last 30 days)
            $activeUsers = User::where('last_seen', '>=', now()->subDays(30))->count();
            $totalUsers = User::count();
            
            // Calculate user activity rate
            $activityRate = $totalUsers > 0 ? round(($activeUsers / $totalUsers) * 100) : 0;
            
            // Get default currency
            $defaultCurrency = Currency::getDefaultCurrency();
            Log::info('Default currency', ['code' => $defaultCurrency->code]);
            
            // Use raw database queries with currency conversion
            $earningsSql = "
                SELECT
                    COUNT(*) as count,
                    COALESCE(SUM(
                        CASE
                            WHEN c.is_default = 1 THEN e.amount
                            ELSE e.amount * c.exchange_rate
                        END
                    ), 0) as total_amount
                FROM earnings e
                LEFT JOIN currencies c ON e.currency_id = c.id";
                
            $expensesSql = "
                SELECT
                    COUNT(*) as count,
                    COALESCE(SUM(
                        CASE
                            WHEN c.is_default = 1 THEN e.amount
                            ELSE e.amount * c.exchange_rate
                        END
                    ), 0) as total_amount
                FROM expenses e
                LEFT JOIN currencies c ON e.currency_id = c.id";
            
            Log::debug('Running earnings query', ['sql' => $earningsSql]);
            $earningsStats = DB::select($earningsSql)[0];
            
            Log::debug('Running expenses query', ['sql' => $expensesSql]);
            $expensesStats = DB::select($expensesSql)[0];
            
            // Convert string results to proper types
            $earningsStats = (object)[
                'count' => (int)$earningsStats->count,
                'total_amount' => (float)$earningsStats->total_amount
            ];
            
            $expensesStats = (object)[
                'count' => (int)$expensesStats->count,
                'total_amount' => (float)$expensesStats->total_amount
            ];
            
            Log::info('Stats calculated', [
                'earnings' => $earningsStats,
                'expenses' => $expensesStats
            ]);
            
            // Calculate total transactions and average per user
            $totalTransactions = $earningsStats->count + $expensesStats->count;
            $avgTransactionsPerUser = $totalUsers > 0 ? round($totalTransactions / $totalUsers, 2) : 0;
            
            // Get budget count
            $budgetCount = Budget::count();
            
            // Get all expense categories including system ones
            $expenseCategoryCount = DB::table('expense_categories')
                ->whereNull('parent_id')
                ->where(function($query) {
                    $query->whereNull('deleted_at')
                          ->orWhere('is_system', true);
                })->count();
            
            // Get all income categories including system ones
            $incomeCategoryCount = DB::table('earning_categories')
                ->whereNull('parent_id')
                ->where(function($query) {
                    $query->whereNull('deleted_at')
                          ->orWhere('is_system', true);
                })->count();
                
            $categoryCount = $expenseCategoryCount + $incomeCategoryCount;
            
            // Get recent users
            $recentUsers = User::select('id', 'name', 'email', 'created_at')
                ->latest()
                ->take(5)
                ->get()
                ->map(function($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'created_at' => $user->created_at
                    ];
                });

            // Add debug logging
            Log::info('Dashboard data', [
                'categories' => [
                    'expense' => $expenseCategoryCount,
                    'income' => $incomeCategoryCount,
                    'total' => $categoryCount,
                ],
                'recent_users' => $recentUsers->count()
            ]);
        
            return Inertia::render('Admin/Dashboard', [
                'recentActivity' => [
                    'users' => $recentUsers
                ],
                'stats' => [
                    'users' => $totalUsers,
                    'active_users' => $activeUsers,
                    'user_activity_rate' => $activityRate,
                    'transactions' => $totalTransactions,
                    'avg_transactions_per_user' => $avgTransactionsPerUser,
                    'budgets' => $budgetCount,
                    'categories' => $categoryCount,
                    'earnings' => $earningsStats->count,
                    'expenses' => $expensesStats->count,
                    'total_earning_amount' => round($earningsStats->total_amount, 2),
                    'total_expense_amount' => round($expensesStats->total_amount, 2)
                ],
                'currency' => [
                    'code' => $defaultCurrency->code,
                    'symbol' => $defaultCurrency->symbol,
                    'format' => $defaultCurrency->format ?? '{symbol} {amount}'
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error in admin dashboard', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
    
    
    /**
     * Perform budget analytics
     */
    public function budgetAnalytics(Request $request)
    {
        // Add log for debugging
        Log::debug('Starting budget analytics calculation', [
            'start_date' => $request->input('start_date', now()->subYear()->format('Y-m-d')),
            'end_date' => $request->input('end_date', now()->format('Y-m-d')),
            'user_id' => $request->input('user_id'),
            'default_currency' => Currency::getDefaultCurrency()->code
        ]);
        
        // Get budget data
        $budgets = Budget::when($request->user_id, function($query) use ($request) {
                return $query->where('user_id', $request->user_id);
            })->get();
            
        Log::debug('Retrieved budgets', [
            'count' => $budgets->count(),
            'budget_ids' => $budgets->pluck('id')
        ]);
        
        // Return budget analytics data
        return Inertia::render('Admin/BudgetAnalytics', [
            'data' => [
                'budgets' => $budgets,
                'total' => $budgets->count(),
                'currency' => Currency::getDefaultCurrency()->code
            ]
        ]);
    }
    
    /**
     * Perform categories analytics
     */
    public function categoriesAnalytics(Request $request)
    {
        // Get categories data
        $categories = Category::when($request->user_id, function($query) use ($request) {
                return $query->where('user_id', $request->user_id);
            })->get();
            
        // Return categories analytics data
        return Inertia::render('Admin/CategoriesAnalytics', [
            'data' => [
                'categories' => $categories,
                'total' => $categories->count(),
                'currency' => Currency::getDefaultCurrency()->code
            ]
        ]);
    }
    
    /**
     * Perform goals analytics
     */
    public function goalsAnalytics(Request $request)
    {
        // Get goals data
        $goals = Goal::when($request->user_id, function($query) use ($request) {
                return $query->where('user_id', $request->user_id);
            })->get();
            
        // Return goals analytics data
        return Inertia::render('Admin/GoalsAnalytics', [
            'data' => [
                'goals' => $goals,
                'total' => $goals->count(),
                'currency' => Currency::getDefaultCurrency()->code
            ]
        ]);
    }
    
    /**
     * Perform debt analytics
     */
    public function debtAnalytics(Request $request)
    {
        // Get debt data
        $debts = Debt::when($request->user_id, function($query) use ($request) {
                return $query->where('user_id', $request->user_id);
            })->get();
            
        // Return debt analytics data
        return Inertia::render('Admin/DebtAnalytics', [
            'data' => [
                'debts' => $debts,
                'total' => $debts->count(),
                'currency' => Currency::getDefaultCurrency()->code
            ]
        ]);
    }
    
    /**
     * Perform investment analytics
     */
    public function investmentAnalytics(Request $request)
    {
        // Get investment data
        $investments = Investment::when($request->user_id, function($query) use ($request) {
                return $query->where('user_id', $request->user_id);
            })->get();
            
        // Return investment analytics data
        return Inertia::render('Admin/InvestmentAnalytics', [
            'data' => [
                'investments' => $investments,
                'total' => $investments->count(),
                'currency' => Currency::getDefaultCurrency()->code
            ]
        ]);
    }
    
    /**
     * API endpoint for unified analytics data based on active tab.
     */
    public function getUnifiedAnalyticsData(Request $request)
    {
        try {
            // First ensure we have valid currency configuration
            $defaultCurrency = Currency::getDefaultCurrency();
            if (!$defaultCurrency) {
                throw new \Exception('System configuration error: No default currency set');
            }

            // Log the start of analytics request
            Log::info('Starting unified analytics request', [
                'module' => $request->input('module'),
                'start_date' => $request->input('start_date'),
                'end_date' => $request->input('end_date'),
                'user_id' => $request->input('user_id'),
                'default_currency' => $defaultCurrency->code
            ]);

            // Initialize analytics request
            $module = $request->input('module', 'budget');
            $startDate = $request->input('start_date', now()->subYear()->format('Y-m-d'));
            $endDate = $request->input('end_date', now()->format('Y-m-d'));
            $userId = $request->input('user_id');

            // Validate currency configuration
            Log::info('Validating currency configuration');
            $totalCurrencies = Currency::count();
            Log::info('Total currencies:', ['count' => $totalCurrencies]);

            $defaultCurrencyCheck = Currency::where('code', $defaultCurrency->code)->first();
            Log::info('Default currency check:', [
                'exists' => $defaultCurrencyCheck ? true : false,
                'code' => $defaultCurrencyCheck ? $defaultCurrencyCheck->code : 'not found',
                'is_active' => $defaultCurrencyCheck ? $defaultCurrencyCheck->is_active : false
            ]);

            $activeCurrencies = Currency::where('is_active', true)->count();
            Log::info('Active currencies count:', ['count' => $activeCurrencies]);

            if ($totalCurrencies === 0 || $activeCurrencies === 0) {
                throw new \Exception('System configuration error: No active currencies available');
            }

            if (!$defaultCurrencyCheck || !$defaultCurrencyCheck->is_active) {
                throw new \Exception('System configuration error: Default currency is not active');
            }

            // Debug currency configuration
            Log::debug('Currency context', [
                'default_currency' => $defaultCurrency->code,
                'active_currencies' => $activeCurrencies
            ]);
            
            Log::debug('Currency configuration validated', [
                'default_currency' => $defaultCurrency->code,
                'active_currencies' => $activeCurrencies
            ]);

            // Create a standard request object for module analytics
            $moduleRequest = new Request([
                'start_date' => $startDate,
                'end_date' => $endDate,
                'user_id' => $userId,
                'default_currency_id' => $defaultCurrency->id,
            ]);

            // Initialize data container and validate active currencies
            $data = [];
            $activeCurrencies = Currency::count();
            if ($activeCurrencies === 0) {
                throw new \Exception('No active currencies found in the system');
            }

            // Add currency context to log
            Log::debug('Currency context', [
                'default_currency' => $defaultCurrency->code,
                'active_currencies' => $activeCurrencies
            ]);

            switch ($module) {
                case 'budget':
                    $response = $this->budgetAnalytics($moduleRequest);
                    $data = $response->props['data'] ?? [];
                    Log::debug('Budget analytics response generated');
                    break;

                case 'categories':
                    $response = $this->categoriesAnalytics($moduleRequest);
                    $data = $response->props['data'] ?? [];
                    break;

                case 'goals':
                    $response = $this->goalsAnalytics($moduleRequest);
                    $data = $response->props['data'] ?? [];
                    break;

                case 'debt':
                    $response = $this->debtAnalytics($moduleRequest);
                    $data = $response->props['data'] ?? [];
                    break;

                case 'investment':
                    $response = $this->investmentAnalytics($moduleRequest);
                    $data = $response->props['data'] ?? [];
                    break;

                default:
                    throw new \Exception('Invalid module specified');
            }

            try {
                Log::info('Analytics data prepared successfully', [
                    'module' => $module,
                    'data_keys' => array_keys($data)
                ]);

                // Add currency info to response
                return response()->json([
                    'success' => true,
                    'data' => $data,
                    'module' => $module,
                    'currency_info' => [
                        'default_currency' => Currency::getDefaultCurrency()->code,
                        'active_currencies' => Currency::count()
                    ]
                ]);

            } catch (\Exception $e) {
                Log::error('Analytics data fetch failed', [
                    'module' => $module ?? 'unknown',
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'request_data' => $request->all(),
                    'debug_info' => [
                        'has_response' => isset($response) ? 'yes' : 'no',
                        'response_type' => isset($response) ? get_class($response) : 'none',
                        'content_structure' => isset($content) ? array_keys($content) : 'not available'
                    ]
                ]);

                // Return a more detailed error response for debugging
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch analytics data. Please check your currency settings and try again.',
                    'error' => config('app.debug') ? [
                        'message' => $e->getMessage(),
                        'type' => get_class($e),
                        'line' => $e->getLine(),
                        'file' => basename($e->getFile())
                    ] : null,
                    'debug_info' => config('app.debug') ? [
                        'has_default_currency' => Currency::where('is_default', true)->exists(),
                        'active_currencies' => Currency::count()
                    ] : null
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Analytics data fetch failed', [
                'module' => $module ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'debug_info' => [
                    'has_response' => isset($response) ? 'yes' : 'no',
                    'response_type' => isset($response) ? get_class($response) : 'none',
                    'content_structure' => isset($content) ? array_keys($content) : 'not available'
                ]
            ]);

            // Return a more detailed error response for debugging
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch analytics data. Please check your currency settings and try again.',
                'error' => config('app.debug') ? [
                    'message' => $e->getMessage(),
                    'type' => get_class($e),
                    'line' => $e->getLine(),
                    'file' => basename($e->getFile())
                ] : null,
                'debug_info' => config('app.debug') ? [
                    'has_default_currency' => Currency::where('is_default', true)->exists(),
                    'active_currencies' => Currency::count()
                ] : null
            ], 500);
        }
    }
    
    /**
     * Unified analytics dashboard.
     * Shows a comprehensive overview of all analytics modules in one place.
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function unifiedAnalytics(Request $request)
    {
        try {
            // First check analytics access
            if (!$this->checkAnalyticsAccess()) {
                return redirect()->route('dashboard')->with('error', 'You do not have access to analytics.');
            }

            // Get active tab from request, default to 'overview'
            $activeTab = $request->input('tab', 'overview');
            $startDate = $request->input('start_date', now()->subYear()->format('Y-m-d'));
            $endDate = $request->input('end_date', now()->format('Y-m-d'));
            $userId = $request->input('user_id');

            // Get users for the filter dropdown
            $availableUsers = User::select('id', 'name', 'email')->get();

            // Basic overview data - always loaded
            $overview = [
                'users' => [
                    'total' => User::count(),
                    'active' => User::where('last_seen', '>=', now()->subDays(30))->count()
                ],
                'transactions' => [
                    'total' => Transaction::count(),
                    'recent' => Transaction::where('created_at', '>=', now()->subDays(7))->count()
                ],
                'budgets' => [
                    'total' => Budget::count(),
                    'active' => Budget::where('status', 'active')->count()
                ],
                'goals' => [
                    'total' => Goal::count(),
                    'achieved' => Goal::where('status', 'completed')->count()
                ]
            ];

            // Initialize filters
            $filters = [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'user_id' => $userId,
                'currency' => Currency::getDefaultCurrency()->code
            ];

            return Inertia::render('Admin/UnifiedAnalytics', [
                'overview' => $overview,
                'activeTab' => $activeTab,
                'filters' => $filters,
                'availableUsers' => $availableUsers
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to load unified analytics dashboard', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Failed to load analytics dashboard. Please try again.');
        }
    }

    /**
     * Checks if the user has access to analytics features
     *
     * @return bool
     */
    protected function checkAnalyticsAccess(): bool
    {
        if (!auth()->check()) {
            return false;
        }
        
        $user = auth()->user();
        return $user->role === 'admin' || $user->roles()->where('name', 'admin')->exists();
    }
    
    /**
     * Get analytics data for a specific module
     *
     * @param string $module The module to get analytics for
     * @param array $options Optional parameters for filtering
     * @return array
     * @throws \Exception If analytics access is not allowed
     */
    protected function getAnalyticsData(string $module, array $options = []): array
    {
        if (!$this->checkAnalyticsAccess()) {
            throw new \Exception('Analytics access not allowed');
        }

        $defaultCurrency = Currency::getDefaultCurrency();

        switch ($module) {
            case 'budget':
                return $this->getBudgetAnalyticsData($defaultCurrency->code, $options);
            case 'categories':
                return $this->getCategoriesAnalyticsData($defaultCurrency->code, $options);
            case 'goals':
                return $this->getGoalsAnalyticsData($defaultCurrency->code, $options);
            case 'debt':
                return $this->getDebtAnalyticsData($defaultCurrency->code, $options);
            case 'investment':
                return $this->getInvestmentAnalyticsData($defaultCurrency->code, $options);
            default:
                throw new \Exception('Invalid analytics module specified');
        }
    }

    /**
     * Generate timeline data from user's activities
     *
     * @param User $user
     * @param int $limit Maximum number of activities to return per type
     * @return array
     */
    /**
     * Display admin transactions page.
     */
    public function transactions()
    {
        try {
            // Get earnings stats
            $totalEarnings = DB::table('earnings')->count();
            
            // Calculate total volume of earnings with currency conversion
            $earningsVolume = DB::table('earnings')
                ->join('users', 'earnings.user_id', '=', 'users.id')
                ->leftJoin('currencies', 'earnings.currency_id', '=', 'currencies.id')
                ->sum(DB::raw('CASE
                    WHEN currencies.is_default = 1 OR currencies.id IS NULL THEN earnings.amount
                    ELSE earnings.amount * currencies.exchange_rate
                END'));

            // Calculate total volume of expenses with currency conversion
            $expensesVolume = DB::table('expenses')
                ->join('users', 'expenses.user_id', '=', 'users.id')
                ->leftJoin('currencies', 'expenses.currency_id', '=', 'currencies.id')
                ->sum(DB::raw('CASE
                    WHEN currencies.is_default = 1 OR currencies.id IS NULL THEN expenses.amount
                    ELSE expenses.amount * currencies.exchange_rate
                END'));

            // Add debug logging for volume calculations
            Log::info('Volume calculations:', [
                'earnings_volume' => $earningsVolume,
                'expenses_volume' => $expensesVolume,
                'total_volume' => ($earningsVolume ?: 0) + ($expensesVolume ?: 0)
            ]);

            $totalVolume = ($earningsVolume ?: 0) + ($expensesVolume ?: 0);

            // Get expenses count
            $totalExpenses = DB::table('expenses')->count();

            // Get earnings with specific columns
            $earnings = DB::table('earnings')
                ->join('users', 'earnings.user_id', '=', 'users.id')
                ->leftJoin('earning_categories', 'earnings.category_id', '=', 'earning_categories.id')
                ->leftJoin('currencies', 'earnings.currency_id', '=', 'currencies.id')
                ->select(
                    'earnings.id',
                    'earnings.name',
                    'earnings.amount',
                    'earnings.description',
                    'earnings.date',
                    'users.name as user_name',
                    'earning_categories.name as category_name',
                    'currencies.code as currency_code',
                    DB::raw("'income' as type")
                );

            // Get expenses with the same columns
            $expenses = DB::table('expenses')
                ->join('users', 'expenses.user_id', '=', 'users.id')
                ->leftJoin('expense_categories', 'expenses.category_id', '=', 'expense_categories.id')
                ->leftJoin('currencies', 'expenses.currency_id', '=', 'currencies.id')
                ->select(
                    'expenses.id',
                    'expenses.name',
                    'expenses.amount',
                    'expenses.description',
                    'expenses.date',
                    'users.name as user_name',
                    'expense_categories.name as category_name',
                    'currencies.code as currency_code',
                    DB::raw("'expense' as type")
                );

            // Create union query
            $query = $earnings->unionAll($expenses);
            
            // Get transactions with pagination
            $transactions = DB::table(DB::raw("({$query->toSql()}) as t"))
                ->mergeBindings($query)
                ->orderBy('date', 'desc')
                ->paginate(25);

            // Add statistics
            $statistics = [
                'total_count' => $transactions->total(),
                'total_income' => $totalEarnings,
                'total_expenses' => $totalExpenses,
                'total_volume' => $totalVolume
            ];

            // Add debug logging
            Log::info('Admin transactions loaded', [
                'total_count' => $transactions->total(),
                'current_page' => $transactions->currentPage(),
                'per_page' => $transactions->perPage(),
                'statistics' => $statistics
            ]);

            return Inertia::render('Admin/Transactions', [
                'transactions' => $transactions,
                'statistics' => $statistics,
                'stats' => [
                    'total' => $transactions->total(),
                    'page' => $transactions->currentPage(),
                    'pages' => $transactions->lastPage()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error in admin transactions page', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    protected function getUserActivityTimeline(User $user, int $limit = 10): array
    {
        $timeline = [];

        // Recent Expenses
        $expenses = Transaction::where('user_id', $user->id)
            ->where('type', 'expense')
            ->with('category')
            ->latest()
            ->take($limit)
            ->get()
            ->map(function ($expense) {
                return [
                    'id' => 'exp-' . $expense->id,
                    'type' => 'expense',
                    'name' => 'Expense',
                    'description' => $expense->description,
                    'amount' => $expense->amount,
                    'category' => $expense->category?->name,
                    'timestamp' => $expense->created_at,
                    'metadata' => [
                        'currency' => $expense->currency_code
                    ]
                ];
            });
        $timeline = array_merge($timeline, $expenses->toArray());

        // Recent Earnings
        $earnings = Transaction::where('user_id', $user->id)
            ->where('type', 'income')
            ->with('category')
            ->latest()
            ->take($limit)
            ->get()
            ->map(function ($earning) {
                return [
                    'id' => 'inc-' . $earning->id,
                    'type' => 'income',
                    'name' => 'Income',
                    'description' => $earning->description,
                    'amount' => $earning->amount,
                    'category' => $earning->category?->name,
                    'timestamp' => $earning->created_at,
                    'metadata' => [
                        'currency' => $earning->currency_code
                    ]
                ];
            });
        $timeline = array_merge($timeline, $earnings->toArray());

        // Goals
        $goals = Goal::where('user_id', $user->id)
            ->latest()
            ->take($limit)
            ->get()
            ->map(function ($goal) {
                return [
                    'id' => 'goal-' . $goal->id,
                    'type' => 'goal',
                    'name' => 'Goal ' . ucfirst($goal->status),
                    'description' => $goal->name,
                    'amount' => $goal->target_amount,
                    'timestamp' => $goal->updated_at,
                    'metadata' => [
                        'status' => $goal->status,
                        'progress' => $goal->progress,
                        'currency' => $goal->currency_code
                    ]
                ];
            });
        $timeline = array_merge($timeline, $goals->toArray());

        // Budgets
        $budgets = Budget::where('user_id', $user->id)
            ->latest()
            ->take($limit)
            ->get()
            ->map(function ($budget) {
                return [
                    'id' => 'budget-' . $budget->id,
                    'type' => 'budget',
                    'name' => 'Budget Updated',
                    'description' => $budget->name,
                    'amount' => $budget->amount,
                    'timestamp' => $budget->updated_at,
                    'metadata' => [
                        'status' => $budget->status,
                        'currency' => $budget->currency_code
                    ]
                ];
            });
        $timeline = array_merge($timeline, $budgets->toArray());

        // Sort all activities by timestamp
        usort($timeline, function ($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });

        return array_slice($timeline, 0, $limit);
    }

    /**
     * API endpoint for fetching timeline data
     *
     * @param User $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserActivityTimelineJson(User $user)
    {
        try {
            $limit = request()->input('limit', 10);
            $timeline = $this->getUserActivityTimeline($user, $limit);

            return response()->json([
                'success' => true,
                'data' => $timeline
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch user activity timeline', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch activity timeline'
            ], 500);
        }
    }

    /**
     * Display user details with timeline
     *
     * @param User $user
     * @return \Inertia\Response
     */
    /**
     * Display users list page
     */
    public function users()
    {
        try {
            // Get paginated users
            $users = User::with(['roles'])
                ->select('id', 'name', 'email', 'created_at', 'last_seen')
                ->orderBy('created_at', 'desc')
                ->paginate(25);

            // Calculate user statistics
            $now = now();
            $monthStart = $now->startOfMonth();
            $stats = [
                'total' => User::count(),
                'active' => User::where('last_seen', '>=', $now->subDays(30))->count(),
                'monthly_active' => User::where('last_seen', '>=', $monthStart)->count(),
                'new_this_month' => User::where('created_at', '>=', $monthStart)->count()
            ];

            // Calculate monthly growth
            $lastMonth = $now->copy()->subMonth();
            $lastMonthUsers = User::where('created_at', '>=', $lastMonth->startOfMonth())
                ->where('created_at', '<', $lastMonth->endOfMonth())
                ->count();
            
            $stats['growth'] = $lastMonthUsers > 0
                ? round((($stats['new_this_month'] - $lastMonthUsers) / $lastMonthUsers) * 100)
                : 100;

            // Add debug logging
            Log::info('User statistics calculated', [
                'stats' => $stats,
                'current_page' => $users->currentPage(),
                'total_pages' => $users->lastPage()
            ]);

            return Inertia::render('Admin/Users', [
                'users' => $users,
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Error in admin users page', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function showUser(User $user)
    {
        $timeline = $this->getUserActivityTimeline($user);
        
        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
            'timeline' => $timeline,
            'stats' => [
                'total_transactions' => Transaction::where('user_id', $user->id)->count(),
                'total_budgets' => Budget::where('user_id', $user->id)->count(),
                'total_goals' => Goal::where('user_id', $user->id)->count(),
                'last_seen' => $user->last_seen
            ]
        ]);
    }
}
