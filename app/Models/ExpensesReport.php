<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ExpensesReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'start_date',
        'end_date',
        'title',
        'description',
        'report_data',
        'report_type',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'report_data' => 'array',
    ];

    /**
     * Get the user that owns the report.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate category-based spending data for visualization
     */
    public function generateCategoryData()
    {
        $user = $this->user;
        $startDate = $this->start_date;
        $endDate = $this->end_date;

        return Expense::where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->join('categories', 'expenses.category_id', '=', 'categories.id')
            ->select('categories.name', DB::raw('SUM(expenses.amount) as total'))
            ->groupBy('categories.name')
            ->orderByDesc('total')
            ->get();
    }

    /**
     * Generate subcategory-based spending data for visualization
     */
    public function generateSubcategoryData($categoryId = null)
    {
        $query = Expense::where('user_id', $this->user->id)
            ->whereBetween('date', [$this->start_date, $this->end_date])
            ->join('sub_categories', 'expenses.subcategory_id', '=', 'sub_categories.id');

        if ($categoryId) {
            $query->where('expenses.category_id', $categoryId);
        }

        return $query->select('sub_categories.name', DB::raw('SUM(expenses.amount) as total'))
            ->groupBy('sub_categories.name')
            ->orderByDesc('total')
            ->get();
    }

    /**
     * Generate tag-based spending data for visualization
     */
    public function generateTagData()
    {
        $user = $this->user;
        $startDate = $this->start_date;
        $endDate = $this->end_date;

        // This is more complex as it involves a many-to-many relationship
        return DB::table('expense_tag')
            ->join('expenses', 'expense_tag.expense_id', '=', 'expenses.id')
            ->join('tags', 'expense_tag.tag_id', '=', 'tags.id')
            ->where('expenses.user_id', $user->id)
            ->whereBetween('expenses.date', [$startDate, $endDate])
            ->select('tags.name', 'tags.color', DB::raw('SUM(expenses.amount) as total'))
            ->groupBy('tags.name', 'tags.color')
            ->orderByDesc('total')
            ->get();
    }

    /**
     * Generate payment method-based spending data for visualization
     */
    public function generatePaymentMethodData()
    {
        $user = $this->user;
        $startDate = $this->start_date;
        $endDate = $this->end_date;

        return Expense::where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->join('payment_methods', 'expenses.payment_method_id', '=', 'payment_methods.id')
            ->select('payment_methods.name', DB::raw('SUM(expenses.amount) as total'))
            ->groupBy('payment_methods.name')
            ->orderByDesc('total')
            ->get();
    }

    /**
     * Generate time series data for visualization
     */
    public function generateTimeSeriesData($groupBy = 'day')
    {
        $user = $this->user;
        $startDate = $this->start_date;
        $endDate = $this->end_date;

        $dateFormat = '%Y-%m-%d'; // Default: group by day
        $selectFormat = 'DATE(expenses.date) as date';

        if ($groupBy === 'month') {
            $dateFormat = '%Y-%m';
            $selectFormat = "DATE_FORMAT(expenses.date, '$dateFormat') as date";
        } elseif ($groupBy === 'week') {
            $dateFormat = '%Y-%u'; // ISO week format
            $selectFormat = "DATE_FORMAT(expenses.date, '$dateFormat') as date";
        }

        $expenses = DB::table('expenses')
            ->select(DB::raw($selectFormat), DB::raw('SUM(amount) as total'))
            ->where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy(DB::raw('date'))
            ->orderBy('date')
            ->get();

        return $expenses;
    }

    /**
     * Generate budget comparison data
     */
    public function generateBudgetComparisonData()
    {
        $user = $this->user;
        $startDate = $this->start_date;
        $endDate = $this->end_date;

        $result = DB::table('budgets')
            ->where('budgets.user_id', $user->id)
            ->where(function($q) use ($startDate, $endDate) {
                // Budget must overlap with the report period
                $q->where(function($query) use ($startDate, $endDate) {
                    $query->where('start_date', '<=', $endDate)
                        ->where('end_date', '>=', $startDate);
                })
                ->orWhere(function($query) use ($startDate) {
                    // Include budgets with no end date (ongoing)
                    $query->where('end_date', null)
                        ->where('start_date', '<=', $startDate);
                });
            })
            ->leftJoin('expenses', function($join) use ($startDate, $endDate) {
                $join->on('expenses.category_id', '=', 'budgets.category_id')
                    ->whereBetween('expenses.date', [$startDate, $endDate]);
            })
            ->select(
                'budgets.id',
                'budgets.name as budget_name',
                'budgets.amount as budget_amount',
                DB::raw('COALESCE(SUM(expenses.amount), 0) as spent'),
                DB::raw('budgets.amount - COALESCE(SUM(expenses.amount), 0) as remaining'),
                DB::raw('(COALESCE(SUM(expenses.amount), 0) / budgets.amount) * 100 as percent_used')
            )
            ->groupBy('budgets.id', 'budgets.name', 'budgets.amount')
            ->get();

        return $result;
    }

    /**
     * Calculate income vs expenses comparison
     */
    public function generateIncomeVsExpensesData()
    {
        $user = $this->user;
        $startDate = $this->start_date;
        $endDate = $this->end_date;

        // Get total income
        $income = Earning::where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('amount');

        // Get total expenses
        $expenses = Expense::where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('amount');

        // Calculate savings
        $savings = $income - $expenses;

        // Calculate spending ratio
        $spendingRatio = $income > 0 ? ($expenses / $income) * 100 : 0;

        return [
            'income' => $income,
            'expenses' => $expenses,
            'savings' => $savings,
            'spending_ratio' => $spendingRatio,
            'saving_ratio' => $income > 0 ? 100 - $spendingRatio : 0,
        ];
    }

    /**
     * Generate comprehensive report data
     */
    public function generateFullReport()
    {
        // Prepare the full report data
        $reportData = [
            'summary' => $this->generateIncomeVsExpensesData(),
            'categories' => $this->generateCategoryData(),
            'time_series' => [
                'daily' => $this->generateTimeSeriesData('day'),
                'weekly' => $this->generateTimeSeriesData('week'),
                'monthly' => $this->generateTimeSeriesData('month'),
            ],
            'budget_comparison' => $this->generateBudgetComparisonData(),
            'payment_methods' => $this->generatePaymentMethodData(),
            'tags' => $this->generateTagData(),
        ];

        // Update the report data in the database
        $this->report_data = $reportData;
        $this->save();

        return $reportData;
    }

    /**
     * Generate month-to-month comparison data
     */
    public function generateMonthlyComparisonData()
    {
        $user = $this->user;
        $endDate = $this->end_date;
        
        // Get data for the last 6 months
        $startDate = Carbon::parse($endDate)->subMonths(6)->startOfMonth();
        
        $monthlyData = DB::table('expenses')
            ->select(DB::raw("DATE_FORMAT(date, '%Y-%m') as month"), DB::raw('SUM(amount) as total'))
            ->where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy(DB::raw("DATE_FORMAT(date, '%Y-%m')"))
            ->orderBy('month')
            ->get();
            
        // Format month names for display
        $formattedData = [];
        foreach ($monthlyData as $data) {
            $date = Carbon::createFromFormat('Y-m', $data->month);
            $formattedData[] = [
                'month' => $date->format('M Y'),
                'month_key' => $data->month,
                'total' => $data->total,
            ];
        }
        
        return $formattedData;
    }
    
    /**
     * Generate expense forecast based on historical data
     */
    public function generateExpenseForecast($months = 3)
    {
        $user = $this->user;
        $endDate = $this->end_date;
        
        // Get data for the last 6 months for trend calculation
        $startDate = Carbon::parse($endDate)->subMonths(6)->startOfMonth();
        
        // Get monthly totals
        $historicalData = DB::table('expenses')
            ->select(DB::raw("DATE_FORMAT(date, '%Y-%m') as month"), DB::raw('SUM(amount) as total'))
            ->where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy(DB::raw("DATE_FORMAT(date, '%Y-%m')"))
            ->orderBy('month')
            ->get();
            
        // Calculate average monthly change
        $totalChange = 0;
        $count = 0;
        $previousTotal = null;
        
        foreach ($historicalData as $data) {
            if ($previousTotal !== null) {
                $change = $data->total - $previousTotal;
                $totalChange += $change;
                $count++;
            }
            $previousTotal = $data->total;
        }
        
        $averageMonthlyChange = $count > 0 ? $totalChange / $count : 0;
        
        // Get the last month's total
        $lastMonthTotal = $previousTotal ?? 0;
        
        // Generate forecast for future months
        $forecast = [];
        $forecastDate = Carbon::parse($endDate)->startOfMonth();
        $projectedTotal = $lastMonthTotal;
        
        for ($i = 1; $i <= $months; $i++) {
            $forecastDate->addMonth();
            $projectedTotal += $averageMonthlyChange;
            
            $forecast[] = [
                'month' => $forecastDate->format('M Y'),
                'month_key' => $forecastDate->format('Y-m'),
                'projected_total' => max(0, $projectedTotal), // Ensure no negative projections
                'is_forecast' => true
            ];
        }
        
        return $forecast;
    }

    /**
     * Generate fixed vs variable expenses comparison
     */
    public function generateFixedVsVariableExpenses()
    {
        $user = $this->user;
        $startDate = $this->start_date;
        $endDate = $this->end_date;
        
        // Fixed expenses are recurring
        $fixedExpenses = Expense::where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->where('recurring', true)
            ->sum('amount');
            
        // Variable expenses are non-recurring
        $variableExpenses = Expense::where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->where(function($query) {
                $query->where('recurring', false)
                      ->orWhereNull('recurring');
            })
            ->sum('amount');
            
        // Calculate totals and percentages
        $total = $fixedExpenses + $variableExpenses;
        $fixedPercentage = $total > 0 ? ($fixedExpenses / $total) * 100 : 0;
        $variablePercentage = $total > 0 ? ($variableExpenses / $total) * 100 : 0;
        
        return [
            'fixed' => [
                'amount' => $fixedExpenses,
                'percentage' => $fixedPercentage
            ],
            'variable' => [
                'amount' => $variableExpenses,
                'percentage' => $variablePercentage
            ],
            'total' => $total
        ];
    }

    /**
     * Generate subcategory breakdown with detailed visualizations
     */
    public function generateSubcategoryBreakdown()
    {
        $user = $this->user;
        $startDate = $this->start_date;
        $endDate = $this->end_date;
        
        // Get all expense categories with their subcategories
        $categories = ExpenseCategory::where('user_id', $user->id)
            ->with(['subcategories' => function($query) {
                $query->withCount('expenses');
            }])
            ->get();
        
        $result = [];
        
        foreach ($categories as $category) {
            // Get expenses for this category within date range
            $categoryExpenses = Expense::where('user_id', $user->id)
                ->where('category_id', $category->id)
                ->whereBetween('date', [$startDate, $endDate])
                ->sum('amount');
                
            $subcategoryData = [];
            
            // Get expenses by subcategory
            foreach ($category->subcategories as $subcategory) {
                $subcategoryExpenses = Expense::where('user_id', $user->id)
                    ->where('subcategory_id', $subcategory->id)
                    ->whereBetween('date', [$startDate, $endDate])
                    ->sum('amount');
                    
                $subcategoryData[] = [
                    'id' => $subcategory->id,
                    'name' => $subcategory->name,
                    'amount' => $subcategoryExpenses,
                    'percentage' => $categoryExpenses > 0 ? ($subcategoryExpenses / $categoryExpenses) * 100 : 0,
                    'expense_count' => $subcategory->expenses_count
                ];
            }
            
            // Get expenses with no subcategory
            $uncategorizedExpenses = Expense::where('user_id', $user->id)
                ->where('category_id', $category->id)
                ->whereNull('subcategory_id')
                ->whereBetween('date', [$startDate, $endDate])
                ->sum('amount');
                
            if ($uncategorizedExpenses > 0) {
                $subcategoryData[] = [
                    'id' => null,
                    'name' => 'Uncategorized',
                    'amount' => $uncategorizedExpenses,
                    'percentage' => $categoryExpenses > 0 ? ($uncategorizedExpenses / $categoryExpenses) * 100 : 0,
                    'expense_count' => Expense::where('user_id', $user->id)
                        ->where('category_id', $category->id)
                        ->whereNull('subcategory_id')
                        ->whereBetween('date', [$startDate, $endDate])
                        ->count()
                ];
            }
            
            $result[] = [
                'category' => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'icon' => $category->icon,
                    'icon_color' => $category->icon_color,
                    'bg_color' => $category->bg_color,
                ],
                'total' => $categoryExpenses,
                'subcategories' => $subcategoryData
            ];
        }
        
        return $result;
    }

    /**
     * Generate enhanced budget vs actual comparison with visualizations
     */
    public function generateEnhancedBudgetComparison()
    {
        $data = $this->generateBudgetComparisonData();
        
        // Additional insights for each budget
        foreach ($data as $key => $budget) {
            // Check if significantly under budget (>20% remaining)
            $significantlyUnder = $budget->percent_used < 80;
            
            // Check if over budget
            $isOverBudget = $budget->percent_used > 100;
            
            // Add trend data - get expenses by day within period
            $budgetExpenses = DB::table('expenses')
                ->select(DB::raw('DATE(date) as expense_date'), DB::raw('SUM(amount) as daily_total'))
                ->where('user_id', $this->user->id)
                ->where('category_id', $budget->id)
                ->whereBetween('date', [$this->start_date, $this->end_date])
                ->groupBy(DB::raw('DATE(date)'))
                ->orderBy('expense_date')
                ->get();
                
            // Calculate cumulative spending
            $cumulativeData = [];
            $runningTotal = 0;
            
            foreach ($budgetExpenses as $dayData) {
                $runningTotal += $dayData->daily_total;
                $cumulativeData[] = [
                    'date' => $dayData->expense_date,
                    'daily' => $dayData->daily_total,
                    'cumulative' => $runningTotal,
                    'budget_percent' => ($budget->budget_amount > 0) 
                        ? ($runningTotal / $budget->budget_amount) * 100 
                        : 0
                ];
            }
            
            // Add insights and trend data to the result
            $data[$key]->insights = [
                'significantly_under' => $significantlyUnder,
                'over_budget' => $isOverBudget,
                'daily_average' => $budget->spent / max(1, Carbon::parse($this->start_date)->diffInDays($this->end_date) + 1),
                'spending_trend' => $cumulativeData,
            ];
        }
        
        return $data;
    }

    /**
     * Generate enhanced report with all visualizations
     */
    public function generateEnhancedFullReport()
    {
        // Start with basic report data
        $reportData = $this->generateFullReport();
        
        // Add enhanced visualizations
        $reportData['monthly_comparison'] = $this->generateMonthlyComparisonData();
        $reportData['expense_forecast'] = $this->generateExpenseForecast();
        $reportData['fixed_vs_variable'] = $this->generateFixedVsVariableExpenses();
        $reportData['subcategory_breakdown'] = $this->generateSubcategoryBreakdown();
        $reportData['enhanced_budget_comparison'] = $this->generateEnhancedBudgetComparison();
        
        // Update the report data in the database
        $this->report_data = $reportData;
        $this->save();
        
        return $reportData;
    }
}