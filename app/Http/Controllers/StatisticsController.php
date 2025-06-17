<?php

namespace App\Http\Controllers;

use App\Models\Earning;
use App\Models\Expense;
use App\Models\EarningCategory;
use App\Models\ExpenseCategory;
use App\Models\PaymentMethod;
use App\Services\IncomeAnalysisService;
use App\Http\Resources\IncomeAnalysisResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Inertia\Inertia;

class StatisticsController extends Controller
{
    protected $user_id;
    protected $incomeAnalysisService;

    public function __construct(IncomeAnalysisService $incomeAnalysisService)
    {
        $this->incomeAnalysisService = $incomeAnalysisService;
    }

    public function index(Request $request)
    {
        $this->user_id = Auth::id();
        $dateRange = $request->input('dateRange', 'month');
        $periodType = $request->input('periodType', 'last');
        
        // Handle custom date range
        if ($dateRange === 'custom') {
            $startDate = $request->input('dateFrom') ? Carbon::parse($request->input('dateFrom')) : Carbon::now()->subMonth();
            $endDate = $request->input('dateTo') ? Carbon::parse($request->input('dateTo')) : Carbon::now();
        } else {
            $startDate = $this->getStartDate($dateRange, $periodType);
            $endDate = $periodType === 'current' ? $this->getEndDate($dateRange) : Carbon::now();
        }

        $data = $this->getStatisticsData($startDate, $endDate);
        $data['dateRange'] = $dateRange; // Pass the current dateRange to the frontend
        $data['periodType'] = $periodType; // Pass the current periodType to the frontend
        
        return Inertia::render('Statistics/Index', $data);
    }

    protected function getStartDate($dateRange, $periodType = 'last')
    {
        $now = Carbon::now();
        
        if ($periodType === 'current') {
            return match($dateRange) {
                'current_week' => $now->copy()->startOfWeek(),
                'week' => $now->copy()->startOfWeek(),
                'current_month' => $now->copy()->startOfMonth(),
                'month' => $now->copy()->startOfMonth(),
                'current_year' => $now->copy()->startOfYear(),
                'year' => $now->copy()->startOfYear(),
                'all' => $this->getEarliestRecordDate(),
                default => $now->copy()->startOfMonth(),
            };
        }
        
        // For "last" period type (default)
        return match($dateRange) {
            'week' => $now->copy()->subWeek(),
            'month' => $now->copy()->subDays(30), // Changed from subMonth() to subDays(30)
            'year' => $now->copy()->subYear(),
            'all' => $this->getEarliestRecordDate(),
            default => $now->copy()->subDays(30), // Changed default to also use 30 days
        };
    }
    
    /**
     * Get the earliest record date from earnings or expenses
     * 
     * @return \Carbon\Carbon
     */
    protected function getEarliestRecordDate()
    {
        $this->user_id = Auth::id();
        
        // Get earliest earning date
        $earliestEarning = Earning::where('user_id', $this->user_id)
            ->orderBy('date', 'asc')
            ->first();
            
        // Get earliest expense date
        $earliestExpense = Expense::where('user_id', $this->user_id)
            ->orderBy('date', 'asc')
            ->first();
            
        $earliestDates = [];
        
        if ($earliestEarning) {
            $earliestDates[] = Carbon::parse($earliestEarning->date);
        }
        
        if ($earliestExpense) {
            $earliestDates[] = Carbon::parse($earliestExpense->date);
        }
        
        // If no records found, default to 1 year ago
        if (empty($earliestDates)) {
            return Carbon::now()->subYear()->startOfMonth();
        }
        
        // Return the earliest date found
        return min($earliestDates)->startOfMonth();
    }

    protected function getEndDate($dateRange)
    {
        $now = Carbon::now();
        
        return match($dateRange) {
            'week', 'current_week' => $now->copy()->endOfWeek(),
            'month', 'current_month' => $now->copy()->endOfMonth(),
            'year', 'current_year' => $now->copy()->endOfYear(),
            default => $now,
        };
    }

    protected function getStatisticsData($startDate, $endDate)
    {
        $earnings = $this->getEarnings($startDate, $endDate);
        $expenses = $this->getExpenses($startDate, $endDate);
        
        // Get income analysis data
        $incomeAnalysisData = $this->incomeAnalysisService->getOverview();
        
        return [
            'earnings' => $earnings,
            'expenses' => $expenses,
            'earningCategories' => $this->getEarningCategories(),
            'expenseCategories' => $this->getExpenseCategories(),
            'paymentMethods' => $this->getPaymentMethods(),
            'paymentMethodStats' => $this->getPaymentMethodStats($startDate, $endDate),
            'totalEarnings' => $this->getTotalEarnings($startDate, $endDate),
            'totalExpenses' => $this->getTotalExpenses($startDate, $endDate),
            'monthlyTrends' => $this->getMonthlyTrends($startDate, $endDate),
            'weeklyTrends' => $this->getWeeklyTrends($startDate, $endDate), // Add weekly trends
            'categoryTrends' => $this->getCategoryTrends($startDate, $endDate),
            'periodComparison' => $this->getPeriodComparison($startDate, $endDate),
            // Add income analysis data
            'incomeAnalysis' => new IncomeAnalysisResource($incomeAnalysisData),
        ];
    }

    protected function getEarnings($startDate, $endDate)
    {
        return Earning::where('user_id', $this->user_id)
            ->whereBetween('date', [$startDate, $endDate])
            ->with('category')
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($earning) {
                return [
                    'id' => $earning->id,
                    'name' => $earning->name,
                    'description' => $earning->description,
                    'category_id' => $earning->category_id,
                    'amount' => $earning->amount,
                    'date' => $earning->date,
                    'created_at' => $earning->created_at,
                    'category' => $earning->category
                ];
            });
    }

    protected function getExpenses($startDate, $endDate)
    {
        $this->user_id = Auth::id();
        return Expense::where('user_id', $this->user_id)
            ->whereBetween('date', [$startDate, $endDate])
            ->with(['category', 'paymentMethod'])
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($expense) {
                return [
                    'id' => $expense->id,
                    'name' => $expense->name,
                    'description' => $expense->description,
                    'category_id' => $expense->category_id,
                    'amount' => $expense->amount,
                    'date' => $expense->date,
                    'created_at' => $expense->created_at,
                    'category' => $expense->category,
                    'payment_method' => $expense->paymentMethod
                ];
            });
    }

    protected function getEarningCategories()
    {
        $this->user_id = Auth::id();
        return EarningCategory::where('user_id', $this->user_id)->get();
    }

    protected function getExpenseCategories()
    {
        $this->user_id = Auth::id();
        return ExpenseCategory::where('user_id', $this->user_id)->get();
    }

    protected function getPaymentMethods()
    {
        $this->user_id = Auth::id();
        return PaymentMethod::where('user_id', $this->user_id)->get();
    }

    protected function getTotalEarnings($startDate, $endDate)
    {
        $this->user_id = Auth::id();
        return Earning::where('user_id', $this->user_id)
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('amount');
    }

    protected function getTotalExpenses($startDate, $endDate)
    {
        $this->user_id = Auth::id();
        return Expense::where('user_id', $this->user_id)
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('amount');
    }

    protected function getPaymentMethodStats($startDate, $endDate)
    {
        $expenses = $this->getExpenses($startDate, $endDate);
        return $expenses->groupBy('payment_method.id')
            ->map(function ($group) {
                return [
                    'method' => $group->first()['payment_method'],
                    'total' => $group->sum('amount'),
                    'count' => $group->count(),
                    'trend' => $this->calculateTrend($group)
                ];
            })->values();
    }

    protected function calculateTrend($items)
    {
        $now = Carbon::now();
        $sixMonthsAgo = $now->copy()->subMonths(6);
        $monthlyTotals = [];

        for ($i = 0; $i < 6; $i++) {
            $monthKey = $now->copy()->subMonths($i)->format('Y-m');
            $monthlyTotals[$monthKey] = 0;
        }

        foreach ($items as $item) {
            $date = Carbon::parse($item['date']);
            if ($date->gte($sixMonthsAgo)) {
                $monthKey = $date->format('Y-m');
                if (isset($monthlyTotals[$monthKey])) {
                    $monthlyTotals[$monthKey] += $item['amount'];
                }
            }
        }

        return array_values($monthlyTotals);
    }

    protected function getMonthlyTrends($startDate, $endDate)
    {
        // Create a period from the start date to end date by months
        $period = CarbonPeriod::create($startDate->copy()->startOfMonth(), '1 month', $endDate->copy()->endOfMonth());
        
        return collect($period)->map(function ($date) {
            $monthStart = $date->copy()->startOfMonth();
            $monthEnd = $date->copy()->endOfMonth();

            $earnings = Earning::where('user_id', $this->user_id)
                ->whereBetween('date', [$monthStart, $monthEnd])
                ->sum('amount');

            $expenses = Expense::where('user_id', $this->user_id)
                ->whereBetween('date', [$monthStart, $monthEnd])
                ->sum('amount');

            return [
                'month' => $date->format('M Y'),
                'income' => $earnings,
                'expense' => $expenses,
                'net' => $earnings - $expenses,
                'growth_rate' => $this->calculateGrowthRate($earnings, $expenses)
            ];
        })->values();
    }

    protected function getWeeklyTrends($startDate, $endDate)
    {
        // Create a period from the start date to end date by weeks
        $period = CarbonPeriod::create($startDate, '1 week', $endDate);
        
        return collect($period)->map(function ($date) {
            $weekStart = $date->copy()->startOfWeek();
            $weekEnd = $date->copy()->endOfWeek();
            
            // Get the month for this week to associate with monthly label
            $monthLabel = $date->format('M Y');

            $earnings = Earning::where('user_id', $this->user_id)
                ->whereBetween('date', [$weekStart, $weekEnd])
                ->sum('amount');

            $expenses = Expense::where('user_id', $this->user_id)
                ->whereBetween('date', [$weekStart, $weekEnd])
                ->sum('amount');

            return [
                'week' => $date->format('M d') . ' - ' . $weekEnd->format('M d'),
                'month' => $monthLabel, // For grouping by month
                'date' => $date->format('Y-m-d'),
                'income' => $earnings,
                'expense' => $expenses,
                'net' => $earnings - $expenses,
                'growth_rate' => $this->calculateGrowthRate($earnings, $expenses)
            ];
        })->values();
    }

    protected function getCategoryTrends($startDate, $endDate)
    {
        // Create a period from start date to end date by months
        $period = CarbonPeriod::create($startDate->copy()->startOfMonth(), '1 month', $endDate->copy()->endOfMonth());

        return [
            'expenses' => $this->getCategoryTrendsByType('expense', $period),
            'earnings' => $this->getCategoryTrendsByType('earning', $period)
        ];
    }

    protected function getCategoryTrendsByType($type, $period)
    {
        $categories = $type === 'expense' ? 
            $this->getExpenseCategories() : 
            $this->getEarningCategories();

        return $categories->map(function ($category) use ($period, $type) {
            $transactions = $type === 'expense' ? 
                Expense::where('category_id', $category->id) : 
                Earning::where('category_id', $category->id);

            $trend = collect($period)->map(function ($date) use ($transactions) {
                $monthStart = $date->copy()->startOfMonth();
                $monthEnd = $date->copy()->endOfMonth();

                return [
                    'month' => $date->format('M Y'),
                    'total' => $transactions->whereBetween('date', [$monthStart, $monthEnd])
                        ->sum('amount')
                ];
            });

            return [
                'category' => $category->name,
                'color' => $category->icon_color,
                'trend' => $trend->values()
            ];
        })->values();
    }

    protected function getPeriodComparison($startDate, $endDate)
    {
        $now = Carbon::now();
        $dateRange = $this->getDateRangeNameFromDates($startDate, $endDate);
        
        $currentPeriod = [
            'start' => $startDate,
            'end' => $endDate,
            'earnings' => 0,
            'expenses' => 0
        ];
        
        // Calculate the previous period based on the current period length
        $periodLength = $startDate->diffInDays($endDate) + 1;
        $previousPeriod = [
            'start' => $startDate->copy()->subDays($periodLength),
            'end' => $startDate->copy()->subDay(),
            'earnings' => 0,
            'expenses' => 0
        ];

        $currentPeriod['earnings'] = Earning::where('user_id', $this->user_id)
            ->whereBetween('date', [$currentPeriod['start'], $currentPeriod['end']])
            ->sum('amount');

        $currentPeriod['expenses'] = Expense::where('user_id', $this->user_id)
            ->whereBetween('date', [$currentPeriod['start'], $currentPeriod['end']])
            ->sum('amount');

        $previousPeriod['earnings'] = Earning::where('user_id', $this->user_id)
            ->whereBetween('date', [$previousPeriod['start'], $previousPeriod['end']])
            ->sum('amount');

        $previousPeriod['expenses'] = Expense::where('user_id', $this->user_id)
            ->whereBetween('date', [$previousPeriod['start'], $previousPeriod['end']])
            ->sum('amount');

        return [
            'period_name' => $dateRange,
            'current_period' => [
                'earnings' => $currentPeriod['earnings'],
                'expenses' => $currentPeriod['expenses'],
                'net' => $currentPeriod['earnings'] - $currentPeriod['expenses']
            ],
            'previous_period' => [
                'earnings' => $previousPeriod['earnings'],
                'expenses' => $previousPeriod['expenses'],
                'net' => $previousPeriod['earnings'] - $previousPeriod['expenses']
            ],
            'changes' => [
                'earnings' => $this->calculatePercentageChange($previousPeriod['earnings'], $currentPeriod['earnings']),
                'expenses' => $this->calculatePercentageChange($previousPeriod['expenses'], $currentPeriod['expenses'])
            ]
        ];
    }

    /**
     * Get the friendly name of the date range based on start and end dates
     */
    protected function getDateRangeNameFromDates($startDate, $endDate)
    {
        $now = Carbon::now();
        
        // Check for "last" period types
        if ($startDate->eq($now->copy()->subWeek())) {
            return 'week';
        } elseif ($startDate->eq($now->copy()->subMonth())) {
            return 'month';
        } elseif ($startDate->eq($now->copy()->subYear())) {
            return 'year';
        }
        
        // Check for "current" period types
        elseif ($startDate->eq($now->copy()->startOfWeek()) && $endDate->eq($now->copy()->endOfWeek())) {
            return 'current_week';
        } elseif ($startDate->eq($now->copy()->startOfMonth()) && $endDate->eq($now->copy()->endOfMonth())) {
            return 'current_month';
        } elseif ($startDate->eq($now->copy()->startOfYear()) && $endDate->eq($now->copy()->endOfYear())) {
            return 'current_year';
        } 
        
        // All time option
        elseif ($startDate->year <= 1970) {
            return 'all';
        }
        
        // Must be a custom date range
        return 'custom';
    }

    protected function calculateGrowthRate($income, $expenses)
    {
        if ($expenses == 0) {
            return $income > 0 ? 100 : 0;
        }
        return (($income - $expenses) / $expenses) * 100;
    }

    protected function calculatePercentageChange($oldValue, $newValue)
    {
        if ($oldValue == 0) {
            return $newValue > 0 ? 100 : 0;
        }
        return (($newValue - $oldValue) / $oldValue) * 100;
    }

    public function paymentMethodAnalysis(Request $request)
    {
        $this->user_id = Auth::id();
        
        $dateRange = $request->input('dateRange', 'month');
        $periodType = $request->input('periodType', 'last');

        // Handle custom date range
        if ($dateRange === 'custom' && $request->has('dateFrom') && $request->has('dateTo')) {
            $startDate = Carbon::parse($request->input('dateFrom'));
            $endDate = Carbon::parse($request->input('dateTo'));
        } else {
            $startDate = $this->getStartDate($dateRange, $periodType);
            $endDate = $periodType === 'current' ? $this->getEndDate($dateRange) : Carbon::now();
        }

        $paymentMethodStats = $this->getPaymentMethodStats($startDate, $endDate);

        return Inertia::render('Statistics/PaymentMethodAnalysis', [
            'paymentMethodStats' => $paymentMethodStats,
            'dateRange' => $dateRange,
            'periodType' => $periodType,
            'startDate' => $startDate->format('Y-m-d'),
            'endDate' => $endDate->format('Y-m-d')
        ]);
    }
}
