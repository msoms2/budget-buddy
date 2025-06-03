<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Earning;
use App\Models\EarningCategory;
use App\Models\EarningReport;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\ExpensesReport;
use App\Models\PaymentMethod;
use App\Models\Tag;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    /**
     * Display the unified reports page.
     */
    public function unified()
    {
        return Inertia::render('Reports/UnifiedReports');
    }

    /**
     * Display the reports dashboard.
     */
    public function dashboard()
    {
        $currentMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        
        $data = [
            'monthlyIncome' => Earning::whereBetween('date', [$currentMonth, $endOfMonth])->sum('amount'),
            'monthlyExpenses' => Expense::whereBetween('date', [$currentMonth, $endOfMonth])->sum('amount'),
            'budgets' => $this->getActiveBudgets(),
            'recentExpenseReports' => $this->getRecentReports('expense'),
            'recentEarningReports' => $this->getRecentReports('earning'),
            'topExpenseCategories' => $this->getTopExpenseCategories($currentMonth, $endOfMonth),
            'topTags' => $this->getTopTags($currentMonth, $endOfMonth),
            'paymentMethods' => $this->getPaymentMethodBreakdown($currentMonth, $endOfMonth)
        ];

        $data['monthlySavings'] = $data['monthlyIncome'] - $data['monthlyExpenses'];
        $data['savingsRate'] = $data['monthlyIncome'] > 0 ? round(($data['monthlySavings'] / $data['monthlyIncome']) * 100, 1) : 0;

        return Inertia::render('Reports/Dashboard', $data);
    }

    /**
     * Display the comparison report page.
     */
    public function comparison(Request $request)
    {
        $dateRange = $request->input('dateRange', [
            'start' => Carbon::now()->startOfMonth()->format('Y-m-d'),
            'end' => Carbon::now()->endOfMonth()->format('Y-m-d')
        ]);

        $data = [
            'incomeData' => $this->getIncomeData($dateRange),
            'expenseData' => $this->getExpenseData($dateRange),
            'categoryBreakdown' => $this->getCategoryComparison($dateRange),
            'dateRange' => $dateRange
        ];

        return Inertia::render('Reports/ComparisonReport', $data);
    }

    /**
     * Display the budget analysis report page.
     */
    public function budgetAnalysis(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        $period = $request->query('period', 'monthly');

        $data = [
            'budgets' => $this->getActiveBudgets($startDate, $endDate),
            'spendingPace' => $this->calculateSpendingPace($startDate, $endDate),
            'categoryBreakdown' => $this->getBudgetCategoryBreakdown($startDate, $endDate),
            'type' => $period,
            'startDate' => $startDate,
            'endDate' => $endDate
        ];

        return Inertia::render('Reports/BudgetAnalysis', $data);
    }

    /**
     * Display the comprehensive forecast report page.
     */
    public function forecast(Request $request)
    {
        $months = $request->input('months', 12);
        
        $data = [
            'projections' => $this->generateFinancialProjections($months),
            'historicalTrends' => $this->getHistoricalTrends(),
            'savingsPredictions' => $this->calculateSavingsPredictions($months)
        ];

        return Inertia::render('Reports/ForecastReport', $data);
    }

    /**
     * Generate comprehensive financial projections using multiple algorithms
     */
    private function generateFinancialProjections($months = 12)
    {
        $userId = auth()->id();
        
        // Get 18 months of historical data for better forecasting
        $startDate = Carbon::now()->subMonths(18)->startOfMonth();
        $endDate = Carbon::now()->endOfMonth();
        
        $monthlyData = $this->getComprehensiveMonthlyData($userId, $startDate, $endDate);
        
        if (count($monthlyData) < 3) {
            return $this->generateBasicProjections($months);
        }
        
        // Generate projections using multiple sophisticated algorithms
        $linearProjections = $this->generateLinearProjections($monthlyData, $months);
        $seasonalProjections = $this->generateSeasonalProjections($monthlyData, $months);
        $exponentialProjections = $this->generateExponentialSmoothingProjections($monthlyData, $months);
        $trendProjections = $this->generateMovingAverageTrendProjections($monthlyData, $months);
        
        // Ensemble method: combine projections with weighted average
        $finalProjections = $this->combineProjections([
            'linear' => $linearProjections,
            'seasonal' => $seasonalProjections,
            'exponential' => $exponentialProjections,
            'trend' => $trendProjections
        ], $months);
        
        // Add confidence intervals and risk analysis
        $projections = $this->addConfidenceIntervals($finalProjections, $monthlyData);
        
        return [
            'monthly_projections' => $projections,
            'yearly_summary' => $this->calculateYearlyStats($projections),
            'chart_data' => $this->formatChartData($projections),
            'forecast_accuracy' => $this->calculateForecastAccuracy($monthlyData),
            'trend_analysis' => $this->analyzeTrends($monthlyData),
            'seasonality_analysis' => $this->detectSeasonality($monthlyData),
            'confidence_metrics' => $this->calculateConfidenceMetrics($monthlyData),
            'risk_analysis' => $this->performRiskAnalysis($monthlyData, $projections)
        ];
    }

    /**
     * Get comprehensive monthly data including recurring transactions and categories
     */
    private function getComprehensiveMonthlyData($userId, $startDate, $endDate)
    {
        // Get monthly totals
        $monthlyIncome = DB::table('earnings')
            ->select(DB::raw("DATE_FORMAT(date, '%Y-%m') as month"), DB::raw('SUM(amount) as total'))
            ->where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy(DB::raw("DATE_FORMAT(date, '%Y-%m')"))
            ->get()
            ->keyBy('month');

        $monthlyExpenses = DB::table('expenses')
            ->select(DB::raw("DATE_FORMAT(date, '%Y-%m') as month"), DB::raw('SUM(amount) as total'))
            ->where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy(DB::raw("DATE_FORMAT(date, '%Y-%m')"))
            ->get()
            ->keyBy('month');

        // Get recurring transactions for stability analysis
        $recurringIncome = DB::table('earnings')
            ->select(DB::raw("DATE_FORMAT(date, '%Y-%m') as month"), DB::raw('SUM(amount) as total'))
            ->where('user_id', $userId)
            ->where('is_recurring', true)
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy(DB::raw("DATE_FORMAT(date, '%Y-%m')"))
            ->get()
            ->keyBy('month');

        $recurringExpenses = DB::table('expenses')
            ->select(DB::raw("DATE_FORMAT(date, '%Y-%m') as month"), DB::raw('SUM(amount) as total'))
            ->where('user_id', $userId)
            ->where('is_recurring', true)
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy(DB::raw("DATE_FORMAT(date, '%Y-%m')"))
            ->get()
            ->keyBy('month');

        // Create period iterator
        $period = new \DatePeriod(
            $startDate,
            new \DateInterval('P1M'),
            $endDate->copy()->addMonth()
        );

        $combinedData = [];
        foreach ($period as $date) {
            $monthKey = $date->format('Y-m');
            $income = $monthlyIncome->get($monthKey)?->total ?? 0;
            $expenses = $monthlyExpenses->get($monthKey)?->total ?? 0;
            $recurringIncomeAmount = $recurringIncome->get($monthKey)?->total ?? 0;
            $recurringExpenseAmount = $recurringExpenses->get($monthKey)?->total ?? 0;
            
            $combinedData[] = [
                'month' => $monthKey,
                'date_obj' => $date,
                'income' => $income,
                'expenses' => $expenses,
                'savings' => $income - $expenses,
                'savings_rate' => $income > 0 ? (($income - $expenses) / $income) * 100 : 0,
                'recurring_income' => $recurringIncomeAmount,
                'recurring_expenses' => $recurringExpenseAmount,
                'non_recurring_income' => $income - $recurringIncomeAmount,
                'non_recurring_expenses' => $expenses - $recurringExpenseAmount
            ];
        }

        return $combinedData;
    }

    /**
     * Generate linear trend projections using least squares regression
     */
    private function generateLinearProjections($monthlyData, $months)
    {
        $projections = [];
        
        // Calculate linear trends for each component
        $incomeSlope = $this->calculateLinearSlope(array_column($monthlyData, 'income'));
        $expenseSlope = $this->calculateLinearSlope(array_column($monthlyData, 'expenses'));
        $recurringIncomeSlope = $this->calculateLinearSlope(array_column($monthlyData, 'recurring_income'));
        $recurringExpenseSlope = $this->calculateLinearSlope(array_column($monthlyData, 'recurring_expenses'));
        
        // Get baseline values (average of last 3 months for stability)
        $recentData = array_slice($monthlyData, -3);
        $baseIncome = array_sum(array_column($recentData, 'income')) / count($recentData);
        $baseExpenses = array_sum(array_column($recentData, 'expenses')) / count($recentData);
        $baseRecurringIncome = array_sum(array_column($recentData, 'recurring_income')) / count($recentData);
        $baseRecurringExpenses = array_sum(array_column($recentData, 'recurring_expenses')) / count($recentData);
        
        $forecastDate = Carbon::now()->startOfMonth();
        
        for ($i = 1; $i <= $months; $i++) {
            $forecastDate = $forecastDate->copy()->addMonth();
            
            $projectedIncome = max(0, $baseIncome + ($incomeSlope * $i));
            $projectedExpenses = max(0, $baseExpenses + ($expenseSlope * $i));
            $projectedRecurringIncome = max(0, $baseRecurringIncome + ($recurringIncomeSlope * $i));
            $projectedRecurringExpenses = max(0, $baseRecurringExpenses + ($recurringExpenseSlope * $i));
            
            $projections[] = [
                'month' => $forecastDate->format('Y-m'),
                'income' => round($projectedIncome, 2),
                'expenses' => round($projectedExpenses, 2),
                'savings' => round($projectedIncome - $projectedExpenses, 2),
                'recurring_income' => round($projectedRecurringIncome, 2),
                'recurring_expenses' => round($projectedRecurringExpenses, 2),
                'method' => 'linear'
            ];
        }
        
        return $projections;
    }

    /**
     * Generate seasonal projections based on historical patterns
     */
    private function generateSeasonalProjections($monthlyData, $months)
    {
        $projections = [];
        $seasonalFactors = $this->calculateSeasonalFactors($monthlyData);
        
        // Calculate deseasonalized trends
        $deseasonalizedIncome = $this->removeSeasonality($monthlyData, 'income', $seasonalFactors['income']);
        $deseasonalizedExpenses = $this->removeSeasonality($monthlyData, 'expenses', $seasonalFactors['expenses']);
        
        $incomeBaseline = array_sum($deseasonalizedIncome) / count($deseasonalizedIncome);
        $expenseBaseline = array_sum($deseasonalizedExpenses) / count($deseasonalizedExpenses);
        
        // Apply growth trend to baseline
        $incomeGrowthRate = $this->calculateCompoundGrowthRate(array_column($monthlyData, 'income'));
        $expenseGrowthRate = $this->calculateCompoundGrowthRate(array_column($monthlyData, 'expenses'));
        
        $forecastDate = Carbon::now()->startOfMonth();
        
        for ($i = 1; $i <= $months; $i++) {
            $forecastDate = $forecastDate->copy()->addMonth();
            $monthIndex = ($forecastDate->month - 1) % 12;
            
            $trendedIncomeBaseline = $incomeBaseline * pow(1 + $incomeGrowthRate, $i);
            $trendedExpenseBaseline = $expenseBaseline * pow(1 + $expenseGrowthRate, $i);
            
            $seasonalIncomeMultiplier = $seasonalFactors['income'][$monthIndex] ?? 1.0;
            $seasonalExpenseMultiplier = $seasonalFactors['expenses'][$monthIndex] ?? 1.0;
            
            $projectedIncome = max(0, $trendedIncomeBaseline * $seasonalIncomeMultiplier);
            $projectedExpenses = max(0, $trendedExpenseBaseline * $seasonalExpenseMultiplier);
            
            $projections[] = [
                'month' => $forecastDate->format('Y-m'),
                'income' => round($projectedIncome, 2),
                'expenses' => round($projectedExpenses, 2),
                'savings' => round($projectedIncome - $projectedExpenses, 2),
                'method' => 'seasonal'
            ];
        }
        
        return $projections;
    }

    /**
     * Generate projections using exponential smoothing with trend and seasonality
     */
    private function generateExponentialSmoothingProjections($monthlyData, $months)
    {
        $projections = [];
        
        // Holt-Winters exponential smoothing parameters
        $alpha = 0.3; // Level smoothing
        $beta = 0.1;  // Trend smoothing
        $gamma = 0.1; // Seasonal smoothing
        
        $incomeSmoothed = $this->holtWintersSmoothing(array_column($monthlyData, 'income'), $alpha, $beta, $gamma);
        $expenseSmoothed = $this->holtWintersSmoothing(array_column($monthlyData, 'expenses'), $alpha, $beta, $gamma);
        
        $forecastDate = Carbon::now()->startOfMonth();
        
        for ($i = 1; $i <= $months; $i++) {
            $forecastDate = $forecastDate->copy()->addMonth();
            
            $projectedIncome = max(0, $incomeSmoothed['forecast']($i));
            $projectedExpenses = max(0, $expenseSmoothed['forecast']($i));
            
            $projections[] = [
                'month' => $forecastDate->format('Y-m'),
                'income' => round($projectedIncome, 2),
                'expenses' => round($projectedExpenses, 2),
                'savings' => round($projectedIncome - $projectedExpenses, 2),
                'method' => 'exponential'
            ];
        }
        
        return $projections;
    }

    /**
     * Generate projections using weighted moving average with trend analysis
     */
    private function generateMovingAverageTrendProjections($monthlyData, $months)
    {
        $projections = [];
        
        // Use weighted moving average (more weight on recent data)
        $weights = [0.5, 0.3, 0.2]; // Last 3 months weighted
        $recentData = array_slice($monthlyData, -3);
        
        $weightedIncomeAvg = 0;
        $weightedExpenseAvg = 0;
        $totalWeight = 0;
        
        for ($i = 0; $i < count($recentData); $i++) {
            $weight = $weights[$i] ?? 0.1;
            $weightedIncomeAvg += $recentData[$i]['income'] * $weight;
            $weightedExpenseAvg += $recentData[$i]['expenses'] * $weight;
            $totalWeight += $weight;
        }
        
        $weightedIncomeAvg /= $totalWeight;
        $weightedExpenseAvg /= $totalWeight;
        
        // Apply trend adjustments
        $incomeTrend = $this->calculateLinearSlope(array_column($monthlyData, 'income'));
        $expenseTrend = $this->calculateLinearSlope(array_column($monthlyData, 'expenses'));
        
        $forecastDate = Carbon::now()->startOfMonth();
        
        for ($i = 1; $i <= $months; $i++) {
            $forecastDate = $forecastDate->copy()->addMonth();
            
            $projectedIncome = max(0, $weightedIncomeAvg + ($incomeTrend * $i));
            $projectedExpenses = max(0, $weightedExpenseAvg + ($expenseTrend * $i));
            
            $projections[] = [
                'month' => $forecastDate->format('Y-m'),
                'income' => round($projectedIncome, 2),
                'expenses' => round($projectedExpenses, 2),
                'savings' => round($projectedIncome - $projectedExpenses, 2),
                'method' => 'moving_average'
            ];
        }
        
        return $projections;
    }

    /**
     * Combine multiple projection methods using ensemble approach
     */
    private function combineProjections($projectionSets, $months)
    {
        $combined = [];
        
        // Dynamic weights based on historical accuracy (simplified for now)
        $weights = [
            'linear' => 0.25,
            'seasonal' => 0.35,
            'exponential' => 0.25,
            'trend' => 0.15
        ];
        
        for ($i = 0; $i < $months; $i++) {
            $combinedIncome = 0;
            $combinedExpenses = 0;
            $totalWeight = 0;
            
            foreach ($projectionSets as $method => $projections) {
                if (isset($projections[$i])) {
                    $weight = $weights[$method] ?? 0.25;
                    $combinedIncome += $projections[$i]['income'] * $weight;
                    $combinedExpenses += $projections[$i]['expenses'] * $weight;
                    $totalWeight += $weight;
                }
            }
            
            $combinedIncome /= $totalWeight;
            $combinedExpenses /= $totalWeight;
            
            $combined[] = [
                'month' => $projectionSets['linear'][$i]['month'],
                'income' => round($combinedIncome, 2),
                'expenses' => round($combinedExpenses, 2),
                'savings' => round($combinedIncome - $combinedExpenses, 2),
                'method' => 'ensemble'
            ];
        }
        
        return $combined;
    }

    /**
     * Add confidence intervals and uncertainty analysis
     */
    private function addConfidenceIntervals($projections, $historicalData)
    {
        $incomeVolatility = $this->calculateVolatility(array_column($historicalData, 'income'));
        $expenseVolatility = $this->calculateVolatility(array_column($historicalData, 'expenses'));
        
        $enhancedProjections = [];
        
        foreach ($projections as $index => $projection) {
            // Calculate time-decay factor (uncertainty increases with time)
            $timeDecayFactor = 1 + ($index * 0.1); // 10% increase per month
            
            // Calculate confidence intervals (95% confidence level)
            $incomeStdError = $incomeVolatility * $timeDecayFactor * 1.96;
            $expenseStdError = $expenseVolatility * $timeDecayFactor * 1.96;
            
            $enhancedProjections[] = array_merge($projection, [
                'income_lower' => max(0, $projection['income'] - $incomeStdError),
                'income_upper' => $projection['income'] + $incomeStdError,
                'expenses_lower' => max(0, $projection['expenses'] - $expenseStdError),
                'expenses_upper' => $projection['expenses'] + $expenseStdError,
                'confidence_level' => max(0.5, 0.95 - ($index * 0.05)), // Decreasing confidence over time
                'volatility_factor' => $timeDecayFactor,
                'uncertainty_range' => round(($incomeStdError + $expenseStdError) / 2, 2)
            ]);
        }
        
        return $enhancedProjections;
    }

    /**
     * Calculate comprehensive seasonal factors
     */
    private function calculateSeasonalFactors($monthlyData)
    {
        $monthlyIncome = array_fill(0, 12, []);
        $monthlyExpenses = array_fill(0, 12, []);
        
        foreach ($monthlyData as $data) {
            $month = $data['date_obj']->format('n') - 1; // 0-indexed month
            $monthlyIncome[$month][] = $data['income'];
            $monthlyExpenses[$month][] = $data['expenses'];
        }
        
        $incomeFactors = [];
        $expenseFactors = [];
        
        $totalIncomeAvg = array_sum(array_column($monthlyData, 'income')) / count($monthlyData);
        $totalExpenseAvg = array_sum(array_column($monthlyData, 'expenses')) / count($monthlyData);
        
        for ($i = 0; $i < 12; $i++) {
            $monthIncomeAvg = count($monthlyIncome[$i]) > 0 ? 
                array_sum($monthlyIncome[$i]) / count($monthlyIncome[$i]) : $totalIncomeAvg;
            $monthExpenseAvg = count($monthlyExpenses[$i]) > 0 ? 
                array_sum($monthlyExpenses[$i]) / count($monthlyExpenses[$i]) : $totalExpenseAvg;
            
            $incomeFactors[$i] = $totalIncomeAvg > 0 ? $monthIncomeAvg / $totalIncomeAvg : 1.0;
            $expenseFactors[$i] = $totalExpenseAvg > 0 ? $monthExpenseAvg / $totalExpenseAvg : 1.0;
        }
        
        return [
            'income' => $incomeFactors,
            'expenses' => $expenseFactors
        ];
    }

    /**
     * Remove seasonality from time series data
     */
    private function removeSeasonality($monthlyData, $field, $seasonalFactors)
    {
        $deseasonalized = [];
        
        foreach ($monthlyData as $data) {
            $month = $data['date_obj']->format('n') - 1;
            $factor = $seasonalFactors[$month] ?? 1.0;
            $deseasonalized[] = $factor > 0 ? $data[$field] / $factor : $data[$field];
        }
        
        return $deseasonalized;
    }

    /**
     * Calculate linear slope using least squares method
     */
    private function calculateLinearSlope($values)
    {
        $n = count($values);
        if ($n < 2) return 0;
        
        $sumX = 0;
        $sumY = 0;
        $sumXY = 0;
        $sumXX = 0;
        
        for ($i = 0; $i < $n; $i++) {
            $x = $i + 1;
            $y = $values[$i];
            
            $sumX += $x;
            $sumY += $y;
            $sumXY += $x * $y;
            $sumXX += $x * $x;
        }
        
        $denominator = $n * $sumXX - $sumX * $sumX;
        return $denominator == 0 ? 0 : ($n * $sumXY - $sumX * $sumY) / $denominator;
    }

    /**
     * Calculate compound annual growth rate
     */
    private function calculateCompoundGrowthRate($values)
    {
        if (count($values) < 2) return 0;
        
        $firstValue = reset($values);
        $lastValue = end($values);
        $periods = count($values) - 1;
        
        if ($firstValue <= 0 || $lastValue <= 0) return 0;
        
        return pow($lastValue / $firstValue, 1 / $periods) - 1;
    }

    /**
     * Calculate volatility (standard deviation)
     */
    private function calculateVolatility($values)
    {
        if (count($values) < 2) return 0;
        
        $mean = array_sum($values) / count($values);
        $sumSquaredDiffs = 0;
        
        foreach ($values as $value) {
            $sumSquaredDiffs += pow($value - $mean, 2);
        }
        
        return sqrt($sumSquaredDiffs / (count($values) - 1));
    }

    /**
     * Holt-Winters exponential smoothing implementation
     */
    private function holtWintersSmoothing($values, $alpha, $beta, $gamma)
    {
        $n = count($values);
        if ($n < 4) {
            $avg = array_sum($values) / $n;
            return ['forecast' => function($periods) use ($avg) { return $avg; }];
        }
        
        // Initialize components
        $level = array_sum(array_slice($values, 0, 4)) / 4;
        $trend = (array_sum(array_slice($values, 4, 4)) - array_sum(array_slice($values, 0, 4))) / 16;
        $seasonal = array_fill(0, 12, 1.0);
        
        // Calculate initial seasonal factors
        for ($i = 0; $i < min(12, $n); $i++) {
            $seasonal[$i] = $values[$i] / $level;
        }
        
        // Apply smoothing
        for ($i = 1; $i < $n; $i++) {
            $seasonIndex = $i % 12;
            
            $newLevel = $alpha * ($values[$i] / $seasonal[$seasonIndex]) + (1 - $alpha) * ($level + $trend);
            $newTrend = $beta * ($newLevel - $level) + (1 - $beta) * $trend;
            $newSeasonal = $gamma * ($values[$i] / $newLevel) + (1 - $gamma) * $seasonal[$seasonIndex];
            
            $level = $newLevel;
            $trend = $newTrend;
            $seasonal[$seasonIndex] = $newSeasonal;
        }
        
        return [
            'forecast' => function($periods) use ($level, $trend, $seasonal) {
                $seasonIndex = $periods % 12;
                return ($level + $trend * $periods) * $seasonal[$seasonIndex];
            }
        ];
    }

    /**
     * Calculate yearly statistics from monthly projections
     */
    private function calculateYearlyStats($projections)
    {
        $totalIncome = array_sum(array_column($projections, 'income'));
        $totalExpenses = array_sum(array_column($projections, 'expenses'));
        $totalSavings = $totalIncome - $totalExpenses;
        $avgMonthlySavings = count($projections) > 0 ? $totalSavings / count($projections) : 0;
        $savingsRate = $totalIncome > 0 ? ($totalSavings / $totalIncome) * 100 : 0;
        
        // Calculate confidence ranges
        $totalIncomeUpper = array_sum(array_column($projections, 'income_upper'));
        $totalIncomeLower = array_sum(array_column($projections, 'income_lower'));
        $totalExpensesUpper = array_sum(array_column($projections, 'expenses_upper'));
        $totalExpensesLower = array_sum(array_column($projections, 'expenses_lower'));
        
        return [
            'total_income' => round($totalIncome, 2),
            'total_expenses' => round($totalExpenses, 2),
            'total_savings' => round($totalSavings, 2),
            'average_monthly_savings' => round($avgMonthlySavings, 2),
            'savings_rate' => round($savingsRate, 1),
            'confidence_ranges' => [
                'income_range' => [round($totalIncomeLower, 2), round($totalIncomeUpper, 2)],
                'expense_range' => [round($totalExpensesLower, 2), round($totalExpensesUpper, 2)],
                'savings_range' => [
                    round($totalIncomeLower - $totalExpensesUpper, 2),
                    round($totalIncomeUpper - $totalExpensesLower, 2)
                ]
            ]
        ];
    }

    /**
     * Format data for chart visualization
     */
    private function formatChartData($projections)
    {
        return [
            'labels' => array_column($projections, 'month'),
            'datasets' => [
                [
                    'label' => 'Projected Income',
                    'data' => array_column($projections, 'income'),
                    'borderColor' => 'rgb(34, 197, 94)',
                    'backgroundColor' => 'rgba(34, 197, 94, 0.1)'
                ],
                [
                    'label' => 'Projected Expenses',
                    'data' => array_column($projections, 'expenses'),
                    'borderColor' => 'rgb(239, 68, 68)',
                    'backgroundColor' => 'rgba(239, 68, 68, 0.1)'
                ],
                [
                    'label' => 'Projected Savings',
                    'data' => array_column($projections, 'savings'),
                    'borderColor' => 'rgb(59, 130, 246)',
                    'backgroundColor' => 'rgba(59, 130, 246, 0.1)'
                ],
                [
                    'label' => 'Income Confidence Upper',
                    'data' => array_column($projections, 'income_upper'),
                    'borderColor' => 'rgba(34, 197, 94, 0.3)',
                    'borderDash' => [5, 5],
                    'fill' => false
                ],
                [
                    'label' => 'Income Confidence Lower',
                    'data' => array_column($projections, 'income_lower'),
                    'borderColor' => 'rgba(34, 197, 94, 0.3)',
                    'borderDash' => [5, 5],
                    'fill' => false
                ]
            ]
        ];
    }

    /**
     * Calculate forecast accuracy using backtesting
     */
    private function calculateForecastAccuracy($monthlyData)
    {
        if (count($monthlyData) < 8) {
            return [
                'overall_accuracy' => 'insufficient_data',
                'income_accuracy' => 0,
                'expense_accuracy' => 0,
                'sample_size' => count($monthlyData)
            ];
        }
        
        // Use 75% for training, 25% for testing
        $trainSize = floor(count($monthlyData) * 0.75);
        $trainData = array_slice($monthlyData, 0, $trainSize);
        $testData = array_slice($monthlyData, $trainSize);
        
        $testPredictions = $this->generateLinearProjections($trainData, count($testData));
        
        $incomeErrors = [];
        $expenseErrors = [];
        
        for ($i = 0; $i < count($testData); $i++) {
            $actualIncome = $testData[$i]['income'];
            $actualExpenses = $testData[$i]['expenses'];
            $predictedIncome = $testPredictions[$i]['income'];
            $predictedExpenses = $testPredictions[$i]['expenses'];
            
            $incomeError = $actualIncome > 0 ? abs(($predictedIncome - $actualIncome) / $actualIncome) : 0;
            $expenseError = $actualExpenses > 0 ? abs(($predictedExpenses - $actualExpenses) / $actualExpenses) : 0;
            
            $incomeErrors[] = $incomeError;
            $expenseErrors[] = $expenseError;
        }
        
        $avgIncomeAccuracy = (1 - (array_sum($incomeErrors) / count($incomeErrors))) * 100;
        $avgExpenseAccuracy = (1 - (array_sum($expenseErrors) / count($expenseErrors))) * 100;
        $overallAccuracy = ($avgIncomeAccuracy + $avgExpenseAccuracy) / 2;
        
        return [
            'overall_accuracy' => max(0, round($overallAccuracy, 1)),
            'income_accuracy' => max(0, round($avgIncomeAccuracy, 1)),
            'expense_accuracy' => max(0, round($avgExpenseAccuracy, 1)),
            'sample_size' => count($testData),
            'confidence_level' => $overallAccuracy > 70 ? 'high' : ($overallAccuracy > 50 ? 'medium' : 'low')
        ];
    }

    /**
     * Analyze comprehensive trends in financial data
     */
    private function analyzeTrends($monthlyData)
    {
        $incomeValues = array_column($monthlyData, 'income');
        $expenseValues = array_column($monthlyData, 'expenses');
        $savingsValues = array_column($monthlyData, 'savings');
        $savingsRateValues = array_column($monthlyData, 'savings_rate');
        
        return [
            'income_trend' => $this->classifyTrend($this->calculateLinearSlope($incomeValues)),
            'expense_trend' => $this->classifyTrend($this->calculateLinearSlope($expenseValues)),
            'savings_trend' => $this->classifyTrend($this->calculateLinearSlope($savingsValues)),
            'savings_rate_trend' => $this->classifyTrend($this->calculateLinearSlope($savingsRateValues)),
            'volatility_analysis' => [
                'income_volatility' => $this->calculateVolatility($incomeValues),
                'expense_volatility' => $this->calculateVolatility($expenseValues),
                'savings_volatility' => $this->calculateVolatility($savingsValues),
                'stability_score' => $this->calculateStabilityScore($monthlyData)
            ],
            'growth_rates' => [
                'income_cagr' => round($this->calculateCompoundGrowthRate($incomeValues) * 100, 2),
                'expense_cagr' => round($this->calculateCompoundGrowthRate($expenseValues) * 100, 2),
                'savings_cagr' => round($this->calculateCompoundGrowthRate(array_map('abs', $savingsValues)) * 100, 2)
            ]
        ];
    }

    /**
     * Classify trend direction and strength
     */
    private function classifyTrend($slope)
    {
        $absSlope = abs($slope);
        $direction = $slope > 0 ? 'increasing' : ($slope < 0 ? 'decreasing' : 'stable');
        $strength = $absSlope > 100 ? 'strong' : ($absSlope > 20 ? 'moderate' : 'weak');
        
        return [
            'direction' => $direction,
            'strength' => $strength,
            'slope' => round($slope, 2)
        ];
    }

    /**
     * Calculate financial stability score
     */
    private function calculateStabilityScore($monthlyData)
    {
        $incomeCV = $this->calculateCoefficientOfVariation(array_column($monthlyData, 'income'));
        $expenseCV = $this->calculateCoefficientOfVariation(array_column($monthlyData, 'expenses'));
        $savingsCV = $this->calculateCoefficientOfVariation(array_column($monthlyData, 'savings'));
        
        // Lower CV means higher stability
        $stabilityScore = 100 - (($incomeCV + $expenseCV + $savingsCV) / 3 * 100);
        
        return max(0, min(100, round($stabilityScore, 1)));
    }

    /**
     * Calculate coefficient of variation
     */
    private function calculateCoefficientOfVariation($values)
    {
        $mean = array_sum($values) / count($values);
        $stdDev = $this->calculateVolatility($values);
        
        return $mean > 0 ? $stdDev / $mean : 0;
    }

    /**
     * Detect and analyze seasonality patterns
     */
    private function detectSeasonality($monthlyData)
    {
        if (count($monthlyData) < 12) {
            return [
                'detected' => false,
                'reason' => 'insufficient_data',
                'recommendation' => 'Need at least 12 months of data for seasonality analysis'
            ];
        }
        
        $seasonalFactors = $this->calculateSeasonalFactors($monthlyData);
        $incomeSeasonalStrength = $this->calculateSeasonalStrength($seasonalFactors['income']);
        $expenseSeasonalStrength = $this->calculateSeasonalStrength($seasonalFactors['expenses']);
        
        $seasonalityThreshold = 0.15; // 15% variation threshold
        
        return [
            'detected' => $incomeSeasonalStrength > $seasonalityThreshold || $expenseSeasonalStrength > $seasonalityThreshold,
            'income_seasonality' => [
                'strength' => round($incomeSeasonalStrength, 3),
                'detected' => $incomeSeasonalStrength > $seasonalityThreshold,
                'peak_months' => $this->findPeakMonths($seasonalFactors['income']),
                'low_months' => $this->findLowMonths($seasonalFactors['income'])
            ],
            'expense_seasonality' => [
                'strength' => round($expenseSeasonalStrength, 3),
                'detected' => $expenseSeasonalStrength > $seasonalityThreshold,
                'peak_months' => $this->findPeakMonths($seasonalFactors['expenses']),
                'low_months' => $this->findLowMonths($seasonalFactors['expenses'])
            ],
            'recommendations' => $this->generateSeasonalityRecommendations($seasonalFactors)
        ];
    }

    /**
     * Calculate seasonal strength metric
     */
    private function calculateSeasonalStrength($seasonalFactors)
    {
        $mean = array_sum($seasonalFactors) / count($seasonalFactors);
        $variance = array_sum(array_map(function($factor) use ($mean) {
            return pow($factor - $mean, 2);
        }, $seasonalFactors)) / count($seasonalFactors);
        
        return sqrt($variance);
    }

    /**
     * Find peak and low months for seasonality
     */
    private function findPeakMonths($seasonalFactors)
    {
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $indexed = array_combine($months, $seasonalFactors);
        arsort($indexed);
        
        return array_slice(array_keys($indexed), 0, 3); // Top 3 months
    }

    private function findLowMonths($seasonalFactors)
    {
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $indexed = array_combine($months, $seasonalFactors);
        asort($indexed);
        
        return array_slice(array_keys($indexed), 0, 3); // Bottom 3 months
    }

    /**
     * Generate seasonality-based recommendations
     */
    private function generateSeasonalityRecommendations($seasonalFactors)
    {
        $recommendations = [];
        
        $incomeFactors = $seasonalFactors['income'];
        $expenseFactors = $seasonalFactors['expenses'];
        
        // Analyze income seasonality
        if (max($incomeFactors) > 1.2) {
            $recommendations[] = [
                'type' => 'income_planning',
                'title' => 'Seasonal Income Opportunity',
                'description' => 'Take advantage of high-income periods by increasing savings.',
                'impact' => 'high'
            ];
        }
        
        if (min($incomeFactors) < 0.8) {
            $recommendations[] = [
                'type' => 'income_risk',
                'title' => 'Income Risk Period',
                'description' => 'Build reserves for periods of seasonal income decline.',
                'impact' => 'medium'
            ];
        }
        
        // Analyze expense seasonality
        if (max($expenseFactors) > 1.2) {
            $recommendations[] = [
                'type' => 'expense_planning',
                'title' => 'High Expense Season',
                'description' => 'Plan ahead for seasonal expense increases.',
                'impact' => 'high'
            ];
        }
        
        return $recommendations;
    }


    /**
     * Calculate confidence metrics for the forecast
     */
    private function calculateConfidenceMetrics($monthlyData)
    {
        $dataPoints = count($monthlyData);
        
        // Base confidence on data quantity and quality
        $quantityScore = min(100, ($dataPoints / 24) * 100); // 24 months = 100%
        $qualityScore = $this->calculateDataQualityScore($monthlyData);
        $consistencyScore = $this->calculateDataConsistencyScore($monthlyData);
        
        $overallConfidence = ($quantityScore + $qualityScore + $consistencyScore) / 3;
        
        return [
            'overall_confidence' => round($overallConfidence, 1),
            'data_quantity_score' => round($quantityScore, 1),
            'data_quality_score' => round($qualityScore, 1),
            'data_consistency_score' => round($consistencyScore, 1),
            'confidence_level' => $overallConfidence > 80 ? 'high' : ($overallConfidence > 60 ? 'medium' : 'low'),
            'factors_affecting_confidence' => $this->identifyConfidenceFactors($monthlyData)
        ];
    }

    /**
     * Calculate data quality score
     */
    private function calculateDataQualityScore($monthlyData)
    {
        $totalDataPoints = count($monthlyData);
        $zeroDataPoints = 0;
        $extremeOutliers = 0;
        
        $incomeValues = array_column($monthlyData, 'income');
        $expenseValues = array_column($monthlyData, 'expenses');
        
        $incomeMean = array_sum($incomeValues) / count($incomeValues);
        $expenseMean = array_sum($expenseValues) / count($expenseValues);
        $incomeStdDev = $this->calculateVolatility($incomeValues);
        $expenseStdDev = $this->calculateVolatility($expenseValues);
        
        foreach ($monthlyData as $data) {
            if ($data['income'] == 0 && $data['expenses'] == 0) {
                $zeroDataPoints++;
            }
            
            // Check for extreme outliers (>3 standard deviations)
            if (abs($data['income'] - $incomeMean) > 3 * $incomeStdDev ||
                abs($data['expenses'] - $expenseMean) > 3 * $expenseStdDev) {
                $extremeOutliers++;
            }
        }
        
        $qualityScore = 100 - (($zeroDataPoints / $totalDataPoints) * 50) - (($extremeOutliers / $totalDataPoints) * 30);
        
        return max(0, $qualityScore);
    }

    /**
     * Calculate data consistency score
     */
    private function calculateDataConsistencyScore($monthlyData)
    {
        $incomeCV = $this->calculateCoefficientOfVariation(array_column($monthlyData, 'income'));
        $expenseCV = $this->calculateCoefficientOfVariation(array_column($monthlyData, 'expenses'));
        
        // Lower coefficient of variation = higher consistency
        $avgCV = ($incomeCV + $expenseCV) / 2;
        $consistencyScore = max(0, 100 - ($avgCV * 200)); // Scale CV to 0-100
        
        return $consistencyScore;
    }

    /**
     * Identify factors affecting forecast confidence
     */
    private function identifyConfidenceFactors($monthlyData)
    {
        $factors = [];
        
        if (count($monthlyData) < 12) {
            $factors[] = [
                'factor' => 'Limited historical data',
                'impact' => 'negative',
                'description' => 'Less than 12 months of data available'
            ];
        }
        
        $stabilityScore = $this->calculateStabilityScore($monthlyData);
        if ($stabilityScore < 60) {
            $factors[] = [
                'factor' => 'High financial volatility',
                'impact' => 'negative',
                'description' => 'Income and expenses show high variability'
            ];
        }
        
        $recurringIncome = array_sum(array_column($monthlyData, 'recurring_income'));
        $totalIncome = array_sum(array_column($monthlyData, 'income'));
        $recurringRatio = $totalIncome > 0 ? $recurringIncome / $totalIncome : 0;
        
        if ($recurringRatio > 0.7) {
            $factors[] = [
                'factor' => 'High recurring income',
                'impact' => 'positive',
                'description' => 'Stable recurring income increases forecast reliability'
            ];
        }
        
        return $factors;
    }

    /**
     * Perform comprehensive risk analysis
     */
    private function performRiskAnalysis($monthlyData, $projections)
    {
        $incomeVolatility = $this->calculateVolatility(array_column($monthlyData, 'income'));
        $expenseVolatility = $this->calculateVolatility(array_column($monthlyData, 'expenses'));
        
        $projectedIncome = array_column($projections, 'income');
        $projectedExpenses = array_column($projections, 'expenses');
        $projectedSavings = array_column($projections, 'savings');
        
        return [
            'volatility_risk' => [
                'income_volatility' => round($incomeVolatility, 2),
                'expense_volatility' => round($expenseVolatility, 2),
                'risk_level' => $this->classifyRiskLevel($incomeVolatility, $expenseVolatility)
            ],
            'shortfall_probability' => $this->calculateShortfallProbability($projectedSavings),
            'worst_case_scenario' => [
                'min_monthly_savings' => round(min($projectedSavings), 2),
                'max_monthly_loss' => round(min(0, min($projectedSavings)), 2),
                'probability_of_loss' => $this->calculateLossProbability($projectedSavings)
            ],
            'stress_test_results' => $this->performStressTests($monthlyData, $projections),
            'risk_mitigation_suggestions' => $this->generateRiskMitigationSuggestions($monthlyData, $projections)
        ];
    }

    /**
     * Classify overall risk level
     */
    private function classifyRiskLevel($incomeVolatility, $expenseVolatility)
    {
        $avgVolatility = ($incomeVolatility + $expenseVolatility) / 2;
        
        if ($avgVolatility > 1000) return 'high';
        if ($avgVolatility > 500) return 'medium';
        return 'low';
    }

    /**
     * Calculate probability of savings shortfall
     */
    private function calculateShortfallProbability($projectedSavings)
    {
        $negativeSavingsMonths = count(array_filter($projectedSavings, function($savings) {
            return $savings < 0;
        }));
        
        return round(($negativeSavingsMonths / count($projectedSavings)) * 100, 1);
    }

    /**
     * Calculate probability of financial loss
     */
    private function calculateLossProbability($projectedSavings)
    {
        return $this->calculateShortfallProbability($projectedSavings);
    }

    /**
     * Perform stress tests on financial projections
     */
    private function performStressTests($monthlyData, $projections)
    {
        $scenarios = [
            'income_reduction_10' => ['income_factor' => 0.9, 'expense_factor' => 1.0],
            'income_reduction_20' => ['income_factor' => 0.8, 'expense_factor' => 1.0],
            'expense_increase_15' => ['income_factor' => 1.0, 'expense_factor' => 1.15],
            'combined_stress' => ['income_factor' => 0.85, 'expense_factor' => 1.1]
        ];
        
        $stressResults = [];
        
        foreach ($scenarios as $scenarioName => $factors) {
            $stressedProjections = array_map(function($projection) use ($factors) {
                $stressedIncome = $projection['income'] * $factors['income_factor'];
                $stressedExpenses = $projection['expenses'] * $factors['expense_factor'];
                return [
                    'income' => $stressedIncome,
                    'expenses' => $stressedExpenses,
                    'savings' => $stressedIncome - $stressedExpenses
                ];
            }, $projections);
            
            $totalSavings = array_sum(array_column($stressedProjections, 'savings'));
            $negativeMonths = count(array_filter($stressedProjections, function($p) {
                return $p['savings'] < 0;
            }));
            
            $stressResults[$scenarioName] = [
                'total_yearly_savings' => round($totalSavings, 2),
                'negative_savings_months' => $negativeMonths,
                'survival_probability' => round((1 - $negativeMonths / count($stressedProjections)) * 100, 1)
            ];
        }
        
        return $stressResults;
    }

    private function generateRiskMitigationSuggestions($monthlyData, $projections)
    {
        $suggestions = [];
        
        $avgMonthlySavings = array_sum(array_column($projections, 'savings')) / count($projections);
        $incomeVolatility = $this->calculateVolatility(array_column($monthlyData, 'income'));
        $expenseVolatility = $this->calculateVolatility(array_column($monthlyData, 'expenses'));
        
        if ($avgMonthlySavings < 500) {
            $suggestions[] = [
                'priority' => 'high',
                'category' => 'savings',
                'title' => 'Increase Emergency Fund',
                'description' => 'Your projected monthly savings are low. Focus on building an emergency fund.',
                'action_items' => [
                    'Review and reduce discretionary expenses',
                    'Look for additional income opportunities',
                    'Automate savings to ensure consistency'
                ]
            ];
        }
        
        if ($incomeVolatility > 800) {
            $suggestions[] = [
                'priority' => 'medium',
                'category' => 'income',
                'title' => 'Diversify Income Sources',
                'description' => 'Your income shows high volatility. Consider diversifying income streams.',
                'action_items' => [
                    'Develop passive income sources',
                    'Build skills for freelance opportunities',
                    'Consider part-time work or side hustles'
                ]
            ];
        }
        
        if ($expenseVolatility > 600) {
            $suggestions[] = [
                'priority' => 'medium',
                'category' => 'expenses',
                'title' => 'Stabilize Expense Patterns',
                'description' => 'Your expenses show high variability. Work on creating more predictable spending.',
                'action_items' => [
                    'Create detailed monthly budgets',
                    'Identify and eliminate irregular large expenses',
                    'Set up automatic bill payments for fixed costs'
                ]
            ];
        }
        
        return $suggestions;
    }

    /**
     * Generate basic projections when insufficient data
     */
    private function generateBasicProjections($months)
    {
        $userId = auth()->id();
        
        // Get simple averages from recent data
        $recentIncome = Earning::where('user_id', $userId)
            ->whereBetween('date', [Carbon::now()->subMonths(3), Carbon::now()])
            ->avg('amount') ?? 0;
        
        $recentExpenses = Expense::where('user_id', $userId)
            ->whereBetween('date', [Carbon::now()->subMonths(3), Carbon::now()])
            ->avg('amount') ?? 0;
        
        $projections = [];
        $forecastDate = Carbon::now()->startOfMonth();
        
        for ($i = 1; $i <= $months; $i++) {
            $forecastDate = $forecastDate->copy()->addMonth();
            
            $projections[] = [
                'month' => $forecastDate->format('Y-m'),
                'income' => round($recentIncome, 2),
                'expenses' => round($recentExpenses, 2),
                'savings' => round($recentIncome - $recentExpenses, 2),
                'confidence_level' => 0.3,
                'income_lower' => round($recentIncome * 0.8, 2),
                'income_upper' => round($recentIncome * 1.2, 2),
                'expenses_lower' => round($recentExpenses * 0.8, 2),
                'expenses_upper' => round($recentExpenses * 1.2, 2)
            ];
        }
        
        return [
            'monthly_projections' => $projections,
            'yearly_summary' => $this->calculateYearlyStats($projections),
            'chart_data' => $this->formatChartData($projections),
            'forecast_accuracy' => ['overall_accuracy' => 'insufficient_data'],
            'trend_analysis' => ['message' => 'Need more data for trend analysis'],
            'seasonality_analysis' => ['detected' => false, 'reason' => 'insufficient_data'],
            'confidence_metrics' => ['overall_confidence' => 30],
            'risk_analysis' => ['message' => 'Risk analysis requires more historical data']
        ];
    }

    /**
     * Get historical trends and patterns
     */
    private function getHistoricalTrends()
    {
        $userId = auth()->id();
        $endDate = Carbon::now();
        $startDate = $endDate->copy()->subMonths(24); // 2 years of data
        
        // Get monthly data for trend analysis
        $monthlyData = $this->getComprehensiveMonthlyData($userId, $startDate, $endDate);
        
        if (count($monthlyData) < 6) {
            return [
                'available' => false,
                'message' => 'Insufficient data for trend analysis',
                'months_available' => count($monthlyData),
                'months_needed' => 6
            ];
        }
        
        // Calculate various trend metrics
        $incomeValues = array_column($monthlyData, 'income');
        $expenseValues = array_column($monthlyData, 'expenses');
        $savingsValues = array_column($monthlyData, 'savings');
        
        // Calculate month-over-month growth rates
        $incomeGrowthRates = $this->calculateGrowthRates($incomeValues);
        $expenseGrowthRates = $this->calculateGrowthRates($expenseValues);
        $savingsGrowthRates = $this->calculateGrowthRates($savingsValues);
        
        // Calculate rolling averages
        $incomeRollingAvg = $this->calculateRollingAverage($incomeValues, 3);
        $expenseRollingAvg = $this->calculateRollingAverage($expenseValues, 3);
        
        // Identify trends and patterns
        $incomeTrendDirection = $this->identifyTrendDirection($incomeValues);
        $expenseTrendDirection = $this->identifyTrendDirection($expenseValues);
        $savingsTrendDirection = $this->identifyTrendDirection($savingsValues);
        
        return [
            'available' => true,
            'data_period' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'months_analyzed' => count($monthlyData)
            ],
            'trends' => [
                'income' => [
                    'direction' => $incomeTrendDirection,
                    'average_monthly' => round(array_sum($incomeValues) / count($incomeValues), 2),
                    'growth_rate' => round(array_sum($incomeGrowthRates) / count($incomeGrowthRates), 2),
                    'volatility' => round($this->calculateVolatility($incomeValues), 2),
                    'rolling_average' => $incomeRollingAvg
                ],
                'expenses' => [
                    'direction' => $expenseTrendDirection,
                    'average_monthly' => round(array_sum($expenseValues) / count($expenseValues), 2),
                    'growth_rate' => round(array_sum($expenseGrowthRates) / count($expenseGrowthRates), 2),
                    'volatility' => round($this->calculateVolatility($expenseValues), 2),
                    'rolling_average' => $expenseRollingAvg
                ],
                'savings' => [
                    'direction' => $savingsTrendDirection,
                    'average_monthly' => round(array_sum($savingsValues) / count($savingsValues), 2),
                    'growth_rate' => round(array_sum($savingsGrowthRates) / count($savingsGrowthRates), 2),
                    'volatility' => round($this->calculateVolatility($savingsValues), 2)
                ]
            ],
            'patterns' => [
                'seasonal_patterns' => $this->detectSeasonalPatterns($monthlyData),
                'recurring_patterns' => $this->analyzeRecurringPatterns($monthlyData),
                'anomalies' => $this->detectAnomalies($monthlyData)
            ],
            'chart_data' => [
                'labels' => array_map(function($data) {
                    return $data['date_obj']->format('M Y');
                }, $monthlyData),
                'income' => $incomeValues,
                'expenses' => $expenseValues,
                'savings' => $savingsValues,
                'income_trend' => $incomeRollingAvg,
                'expense_trend' => $expenseRollingAvg
            ]
        ];
    }

    /**
     * Calculate savings predictions and goals
     */
    private function calculateSavingsPredictions($months = 12)
    {
        $userId = auth()->id();
        $endDate = Carbon::now();
        $startDate = $endDate->copy()->subMonths(12);
        
        // Get historical savings data
        $monthlyData = $this->getComprehensiveMonthlyData($userId, $startDate, $endDate);
        
        if (count($monthlyData) < 3) {
            return [
                'available' => false,
                'message' => 'Need at least 3 months of data for savings predictions',
                'months_available' => count($monthlyData)
            ];
        }
        
        $savingsValues = array_column($monthlyData, 'savings');
        $savingsRates = array_column($monthlyData, 'savings_rate');
        
        // Calculate savings statistics
        $avgMonthlySavings = array_sum($savingsValues) / count($savingsValues);
        $avgSavingsRate = array_sum($savingsRates) / count($savingsRates);
        $savingsVolatility = $this->calculateVolatility($savingsValues);
        
        // Project future savings
        $projectedMonthlySavings = [];
        $cumulativeSavings = 0;
        $savingsTrend = $this->calculateLinearSlope($savingsValues);
        
        for ($i = 1; $i <= $months; $i++) {
            $projectedSaving = $avgMonthlySavings + ($savingsTrend * $i);
            $projectedMonthlySavings[] = $projectedSaving;
            $cumulativeSavings += $projectedSaving;
        }
        
        // Calculate savings milestones
        $milestones = $this->calculateSavingsMilestones($cumulativeSavings, $avgMonthlySavings);
        
        // Calculate emergency fund recommendations
        $emergencyFundNeeded = $this->calculateEmergencyFundNeeded($monthlyData);
        
        // Savings rate improvement suggestions
        $savingsImprovementSuggestions = $this->generateSavingsImprovementSuggestions($avgSavingsRate, $monthlyData);
        
        return [
            'available' => true,
            'current_metrics' => [
                'average_monthly_savings' => round($avgMonthlySavings, 2),
                'average_savings_rate' => round($avgSavingsRate, 1),
                'savings_volatility' => round($savingsVolatility, 2),
                'savings_trend' => $this->classifyTrend($savingsTrend)
            ],
            'projections' => [
                'timeframe_months' => $months,
                'projected_total_savings' => round($cumulativeSavings, 2),
                'monthly_projections' => array_map('round', $projectedMonthlySavings),
                'confidence_level' => $this->calculateSavingsConfidence($savingsValues)
            ],
            'milestones' => $milestones,
            'emergency_fund' => $emergencyFundNeeded,
            'recommendations' => $savingsImprovementSuggestions,
            'chart_data' => [
                'historical_savings' => $savingsValues,
                'projected_savings' => $projectedMonthlySavings,
                'cumulative_projection' => $this->calculateCumulativeArray($projectedMonthlySavings)
            ]
        ];
    }

    /**
     * Calculate month-over-month growth rates
     */
    private function calculateGrowthRates($values)
    {
        $growthRates = [];
        for ($i = 1; $i < count($values); $i++) {
            $previous = $values[$i - 1];
            $current = $values[$i];
            
            if ($previous > 0) {
                $growthRate = (($current - $previous) / $previous) * 100;
                $growthRates[] = $growthRate;
            } else {
                $growthRates[] = 0;
            }
        }
        return $growthRates;
    }

    /**
     * Calculate rolling average
     */
    private function calculateRollingAverage($values, $window)
    {
        $rollingAvg = [];
        for ($i = 0; $i < count($values); $i++) {
            $start = max(0, $i - $window + 1);
            $subset = array_slice($values, $start, $i - $start + 1);
            $rollingAvg[] = array_sum($subset) / count($subset);
        }
        return $rollingAvg;
    }

    /**
     * Identify trend direction
     */
    private function identifyTrendDirection($values)
    {
        if (count($values) < 2) return 'stable';
        
        $slope = $this->calculateLinearSlope($values);
        $absSlope = abs($slope);
        
        if ($absSlope < 10) return 'stable';
        return $slope > 0 ? 'increasing' : 'decreasing';
    }

    /**
     * Detect seasonal patterns
     */
    private function detectSeasonalPatterns($monthlyData)
    {
        if (count($monthlyData) < 12) {
            return ['detected' => false, 'reason' => 'insufficient_data'];
        }
        
        $seasonalFactors = $this->calculateSeasonalFactors($monthlyData);
        $hasSeasonality = false;
        
        // Check if there's significant seasonal variation
        foreach (['income', 'expenses'] as $type) {
            $factors = $seasonalFactors[$type];
            $max = max($factors);
            $min = min($factors);
            
            if (($max - $min) > 0.3) { // 30% variation threshold
                $hasSeasonality = true;
                break;
            }
        }
        
        return [
            'detected' => $hasSeasonality,
            'factors' => $seasonalFactors,
            'strength' => $hasSeasonality ? 'moderate' : 'weak'
        ];
    }

    /**
     * Analyze recurring patterns
     */
    private function analyzeRecurringPatterns($monthlyData)
    {
        $totalRecurringIncome = array_sum(array_column($monthlyData, 'recurring_income'));
        $totalIncome = array_sum(array_column($monthlyData, 'income'));
        $totalRecurringExpenses = array_sum(array_column($monthlyData, 'recurring_expenses'));
        $totalExpenses = array_sum(array_column($monthlyData, 'expenses'));
        
        return [
            'recurring_income_ratio' => $totalIncome > 0 ? round(($totalRecurringIncome / $totalIncome) * 100, 1) : 0,
            'recurring_expense_ratio' => $totalExpenses > 0 ? round(($totalRecurringExpenses / $totalExpenses) * 100, 1) : 0,
            'predictability_score' => $this->calculatePredictabilityScore($monthlyData)
        ];
    }

    /**
     * Detect financial anomalies
     */
    private function detectAnomalies($monthlyData)
    {
        $incomeValues = array_column($monthlyData, 'income');
        $expenseValues = array_column($monthlyData, 'expenses');
        
        $incomeMean = array_sum($incomeValues) / count($incomeValues);
        $expenseMean = array_sum($expenseValues) / count($expenseValues);
        $incomeStdDev = $this->calculateVolatility($incomeValues);
        $expenseStdDev = $this->calculateVolatility($expenseValues);
        
        $anomalies = [];
        
        foreach ($monthlyData as $index => $data) {
            $incomeZScore = $incomeStdDev > 0 ? abs($data['income'] - $incomeMean) / $incomeStdDev : 0;
            $expenseZScore = $expenseStdDev > 0 ? abs($data['expenses'] - $expenseMean) / $expenseStdDev : 0;
            
            if ($incomeZScore > 2 || $expenseZScore > 2) { // 2 standard deviations
                $anomalies[] = [
                    'month' => $data['month'],
                    'type' => $incomeZScore > $expenseZScore ? 'income' : 'expense',
                    'severity' => max($incomeZScore, $expenseZScore) > 3 ? 'high' : 'moderate',
                    'value' => $incomeZScore > $expenseZScore ? $data['income'] : $data['expenses']
                ];
            }
        }
        
        return $anomalies;
    }

    /**
     * Calculate savings milestones
     */
    private function calculateSavingsMilestones($totalProjectedSavings, $avgMonthlySavings)
    {
        $milestones = [];
        $targetAmounts = [1000, 5000, 10000, 25000, 50000, 100000];
        
        foreach ($targetAmounts as $target) {
            if ($avgMonthlySavings > 0) {
                $monthsToReach = ceil($target / $avgMonthlySavings);
                $milestones[] = [
                    'amount' => $target,
                    'months_to_reach' => $monthsToReach,
                    'achievable_in_timeframe' => $target <= $totalProjectedSavings,
                    'target_date' => Carbon::now()->addMonths($monthsToReach)->format('M Y')
                ];
            }
        }
        
        return $milestones;
    }

    /**
     * Calculate emergency fund recommendations
     */
    private function calculateEmergencyFundNeeded($monthlyData)
    {
        $avgMonthlyExpenses = array_sum(array_column($monthlyData, 'expenses')) / count($monthlyData);
        
        return [
            'recommended_amounts' => [
                'conservative' => round($avgMonthlyExpenses * 6, 2), // 6 months
                'moderate' => round($avgMonthlyExpenses * 4, 2),     // 4 months
                'aggressive' => round($avgMonthlyExpenses * 3, 2)    // 3 months
            ],
            'current_monthly_expenses' => round($avgMonthlyExpenses, 2)
        ];
    }

    /**
     * Generate savings improvement suggestions
     */
    private function generateSavingsImprovementSuggestions($currentSavingsRate, $monthlyData)
    {
        $suggestions = [];
        
        if ($currentSavingsRate < 10) {
            $suggestions[] = [
                'category' => 'urgent',
                'title' => 'Increase Savings Rate',
                'description' => 'Your savings rate is below 10%. Focus on reducing expenses or increasing income.',
                'target' => 'Aim for at least 10-15% savings rate'
            ];
        } elseif ($currentSavingsRate < 20) {
            $suggestions[] = [
                'category' => 'improvement',
                'title' => 'Boost Your Savings',
                'description' => 'You\'re doing well! Try to reach the 20% savings rate goal.',
                'target' => 'Aim for 20% savings rate'
            ];
        } else {
            $suggestions[] = [
                'category' => 'excellent',
                'title' => 'Maintain Excellence',
                'description' => 'Excellent savings rate! Consider investment opportunities.',
                'target' => 'Continue current practices'
            ];
        }
        
        return $suggestions;
    }

    /**
     * Calculate savings confidence level
     */
    private function calculateSavingsConfidence($savingsValues)
    {
        $positiveSavingsMonths = count(array_filter($savingsValues, function($savings) {
            return $savings > 0;
        }));
        
        $confidencePercentage = ($positiveSavingsMonths / count($savingsValues)) * 100;
        
        if ($confidencePercentage >= 80) return 'high';
        if ($confidencePercentage >= 60) return 'medium';
        return 'low';
    }

    /**
     * Calculate cumulative array
     */
    private function calculateCumulativeArray($values)
    {
        $cumulative = [];
        $sum = 0;
        
        foreach ($values as $value) {
            $sum += $value;
            $cumulative[] = $sum;
        }
        
        return $cumulative;
    }

    /**
     * Calculate predictability score
     */
    private function calculatePredictabilityScore($monthlyData)
    {
        $recurringIncomeRatio = 0;
        $recurringExpenseRatio = 0;
        $totalIncome = array_sum(array_column($monthlyData, 'income'));
        $totalExpenses = array_sum(array_column($monthlyData, 'expenses'));
        $totalRecurringIncome = array_sum(array_column($monthlyData, 'recurring_income'));
        $totalRecurringExpenses = array_sum(array_column($monthlyData, 'recurring_expenses'));
        
        if ($totalIncome > 0) {
            $recurringIncomeRatio = $totalRecurringIncome / $totalIncome;
        }
        
        if ($totalExpenses > 0) {
            $recurringExpenseRatio = $totalRecurringExpenses / $totalExpenses;
        }
        
        // Predictability is higher when more transactions are recurring
        $score = (($recurringIncomeRatio + $recurringExpenseRatio) / 2) * 100;
        
        return round($score, 1);
    }

    /**
     * Display the transaction reports page with React component
     */
    public function transactionsPage()
    {
        $userId = auth()->id();
        
        // Get all categories for the form
        $expenseCategories = ExpenseCategory::where('user_id', $userId)
            ->orderBy('name')
            ->get(['id', 'name']);
            
        $earningCategories = EarningCategory::where('user_id', $userId)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Reports/Transactions', [
            'categories' => [
                'expense' => $expenseCategories,
                'income' => $earningCategories
            ]
        ]);
    }

    /**
     * Generate transaction report with PDF functionality
     */
    public function transactions(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'transaction_type' => 'nullable|in:income,expense,all',
            'categories' => 'nullable|array',
            'categories.*' => 'integer|exists:expense_categories,id',
            'income_categories' => 'nullable|array',
            'income_categories.*' => 'integer|exists:earning_categories,id',
            'format' => 'nullable|in:pdf'
        ]);

        $userId = auth()->id();
        $startDate = $request->start_date;
        $endDate = $request->end_date;
        $transactionType = $request->transaction_type ?? 'all';
        $categories = $request->categories ?? [];
        $incomeCategories = $request->income_categories ?? [];

        // Get transactions data
        $transactions = $this->getTransactionsData($userId, $startDate, $endDate, $transactionType, $categories, $incomeCategories);
        
        // Calculate summary
        $summary = $this->calculateTransactionSummary($transactions);

        // If PDF format is requested, generate and return PDF
        if ($request->format === 'pdf') {
            return $this->generateTransactionPDF($transactions, $summary, $startDate, $endDate, $request);
        }

        // Return JSON response for API calls
        return response()->json([
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'transaction_type' => $transactionType,
                'categories' => $categories,
                'income_categories' => $incomeCategories
            ]
        ]);
    }

    /**
     * Get transactions data based on filters
     */
    private function getTransactionsData($userId, $startDate, $endDate, $transactionType, $categories, $incomeCategories)
    {
        $transactions = collect();

        // Get expenses if needed
        if ($transactionType === 'expense' || $transactionType === 'all') {
            $expenseQuery = Expense::where('user_id', $userId)
                ->whereBetween('date', [$startDate, Carbon::parse($endDate)->endOfDay()])
                ->with(['category', 'paymentMethod']);

            if (!empty($categories)) {
                $expenseQuery->whereIn('category_id', $categories);
            }

            $expenses = $expenseQuery->get()->map(function ($expense) {
                return [
                    'id' => $expense->id,
                    'date' => $expense->date->format('d.m.Y'),
                    'date_sort' => $expense->date->format('Y-m-d'),
                    'description' => $expense->name ?? 'Unnamed Expense',
                    'category' => $expense->category ? $expense->category->name : 'Uncategorized',
                    'amount' => $expense->amount,
                    'type' => 'Expense',
                    'type_key' => 'expense'
                ];
            });

            $transactions = $transactions->concat($expenses);
        }

        // Get earnings if needed
        if ($transactionType === 'income' || $transactionType === 'all') {
            $earningQuery = Earning::where('user_id', $userId)
                ->whereBetween('date', [$startDate, Carbon::parse($endDate)->endOfDay()])
                ->with(['category']);

            if (!empty($incomeCategories)) {
                $earningQuery->whereIn('category_id', $incomeCategories);
            }

            $earnings = $earningQuery->get()->map(function ($earning) {
                return [
                    'id' => $earning->id,
                    'date' => $earning->date->format('d.m.Y'),
                    'date_sort' => $earning->date->format('Y-m-d'),
                    'description' => $earning->name ?? 'Unnamed Income',
                    'category' => $earning->category ? $earning->category->name : 'Uncategorized',
                    'amount' => $earning->amount,
                    'type' => 'Income',
                    'type_key' => 'income'
                ];
            });

            $transactions = $transactions->concat($earnings);
        }

        // Sort by date (newest first)
        return $transactions->sortByDesc('date_sort')->values();
    }

    /**
     * Calculate transaction summary
     */
    private function calculateTransactionSummary($transactions)
    {
        $totalIncome = $transactions->where('type_key', 'income')->sum('amount');
        $totalExpenses = $transactions->where('type_key', 'expense')->sum('amount');
        $balance = $totalIncome - $totalExpenses;

        return [
            'total_income' => round($totalIncome, 2),
            'total_expenses' => round($totalExpenses, 2),
            'balance' => round($balance, 2),
            'transaction_count' => $transactions->count(),
            'income_count' => $transactions->where('type_key', 'income')->count(),
            'expense_count' => $transactions->where('type_key', 'expense')->count()
        ];
    }

    /**
     * Generate PDF for transaction report
     */
    private function generateTransactionPDF($transactions, $summary, $startDate, $endDate, $request)
    {
        // Format filename
        $startFormatted = Carbon::parse($startDate)->format('dmY');
        $endFormatted = Carbon::parse($endDate)->format('dmY');
        $filename = "Transakciju_parskats_{$startFormatted}_{$endFormatted}.pdf";

        // Prepare data for view
        $data = [
            'transactions' => $transactions,
            'summary' => $summary,
            'start_date' => Carbon::parse($startDate)->format('d.m.Y'),
            'end_date' => Carbon::parse($endDate)->format('d.m.Y'),
            'generation_date' => Carbon::now()->format('d.m.Y H:i'),
            'filters' => [
                'transaction_type' => $request->transaction_type ?? 'all',
                'has_category_filter' => !empty($request->categories) || !empty($request->income_categories),
                'categories' => $request->categories ?? [],
                'income_categories' => $request->income_categories ?? []
            ]
        ];

        // Generate PDF using dompdf
        $pdf = Pdf::loadView('reports.transactions-pdf', $data);
        $pdf->setPaper('A4', 'portrait');

        return $pdf->download($filename);
    }

    /**
     * Display the tag analysis report page.
     */
    public function tagAnalysis(Request $request)
    {
        // For now, redirect to the main reports page
        // This can be implemented later if needed
        return redirect()->route('reports.dashboard');
    }

    /**
     * Display the payment method analysis report page.
     */
    public function paymentMethodAnalysis(Request $request)
    {
        // Redirect to the statistics payment method analysis
        return redirect()->route('statistics.payment-methods');
    }
}