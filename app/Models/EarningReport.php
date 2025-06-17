<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EarningReport extends Model
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
     * Generate category-based earning data for visualization
     */
    public function generateCategoryData()
    {
        $user = $this->user;
        $startDate = $this->start_date;
        $endDate = $this->end_date;

        return Earning::where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->join('earning_categories', 'earnings.category_id', '=', 'earning_categories.id')
            ->select('earning_categories.name', DB::raw('SUM(earnings.amount) as total'))
            ->groupBy('earning_categories.name')
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
        $selectFormat = 'DATE(earnings.date) as date';

        if ($groupBy === 'month') {
            $dateFormat = '%Y-%m';
            $selectFormat = "DATE_FORMAT(earnings.date, '$dateFormat') as date";
        } elseif ($groupBy === 'week') {
            $dateFormat = '%Y-%u'; // ISO week format
            $selectFormat = "DATE_FORMAT(earnings.date, '$dateFormat') as date";
        }

        $earnings = DB::table('earnings')
            ->select(DB::raw($selectFormat), DB::raw('SUM(amount) as total'))
            ->where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy(DB::raw('date'))
            ->orderBy('date')
            ->get();

        return $earnings;
    }

    /**
     * Track month over month income growth
     */
    public function generateGrowthData($months = 12)
    {
        $user = $this->user;
        $endDate = $this->end_date;
        
        // Calculate start date based on how many months back we want to go
        $startDate = Carbon::parse($endDate)->subMonths($months)->startOfMonth();
        
        $monthlyData = DB::table('earnings')
            ->select(DB::raw("DATE_FORMAT(date, '%Y-%m') as month"), DB::raw('SUM(amount) as total'))
            ->where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy(DB::raw("DATE_FORMAT(date, '%Y-%m')"))
            ->orderBy('month')
            ->get();
            
        // Calculate growth rates
        $result = [];
        $previousTotal = null;
        
        foreach ($monthlyData as $index => $data) {
            $current = [
                'month' => $data->month,
                'total' => $data->total,
                'growth_rate' => null,
                'growth_amount' => null,
            ];
            
            if ($previousTotal !== null) {
                $growthAmount = $data->total - $previousTotal;
                $growthRate = $previousTotal > 0 ? ($growthAmount / $previousTotal) * 100 : 0;
                
                $current['growth_amount'] = $growthAmount;
                $current['growth_rate'] = $growthRate;
            }
            
            $previousTotal = $data->total;
            $result[] = $current;
        }
        
        return $result;
    }

    /**
     * Generate income source distribution data
     */
    public function generateIncomeSourceDistribution()
    {
        $user = $this->user;
        $startDate = $this->start_date;
        $endDate = $this->end_date;
        
        // Group earnings by source and get totals
        return Earning::where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->select('source', DB::raw('SUM(amount) as total'))
            ->groupBy('source')
            ->orderByDesc('total')
            ->get();
    }

    /**
     * Generate frequency analysis (regular vs irregular income)
     */
    public function generateFrequencyAnalysis()
    {
        $user = $this->user;
        $startDate = $this->start_date;
        $endDate = $this->end_date;
        
        // Sum recurring income
        $recurring = Earning::where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->where('recurring', true)
            ->sum('amount');
            
        // Sum non-recurring income
        $nonRecurring = Earning::where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->where(function($query) {
                $query->where('recurring', false)
                      ->orWhereNull('recurring');
            })
            ->sum('amount');
            
        // Calculate totals and percentages
        $total = $recurring + $nonRecurring;
        $recurringPercentage = $total > 0 ? ($recurring / $total) * 100 : 0;
        $nonRecurringPercentage = $total > 0 ? ($nonRecurring / $total) * 100 : 0;
        
        return [
            'recurring' => [
                'amount' => $recurring,
                'percentage' => $recurringPercentage
            ],
            'non_recurring' => [
                'amount' => $nonRecurring,
                'percentage' => $nonRecurringPercentage
            ],
            'total' => $total
        ];
    }

    /**
     * Generate comparison with budget targets
     */
    public function generateBudgetTargetComparison()
    {
        // This would compare actual income with any income targets/projections you might have
        // This is placeholder functionality - you might want to develop it further
        $user = $this->user;
        $startDate = $this->start_date;
        $endDate = $this->end_date;
        
        // For now, we'll just get the actual income
        $actualIncome = Earning::where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->sum('amount');
            
        // In a real implementation, you'd compare this against targets
        return [
            'actual_income' => $actualIncome,
            'target_income' => null,  // You would implement this based on your target tracking system
            'difference' => null,
            'achievement_percentage' => null
        ];
    }

    /**
     * Generate comprehensive income report data
     */
    public function generateFullReport()
    {
        // Prepare the full report data
        $reportData = [
            'categories' => $this->generateCategoryData(),
            'time_series' => [
                'daily' => $this->generateTimeSeriesData('day'),
                'weekly' => $this->generateTimeSeriesData('week'),
                'monthly' => $this->generateTimeSeriesData('month'),
            ],
            'growth' => $this->generateGrowthData(),
            'income_sources' => $this->generateIncomeSourceDistribution(),
            'frequency_analysis' => $this->generateFrequencyAnalysis(),
            'budget_comparison' => $this->generateBudgetTargetComparison(),
        ];

        // Update the report data in the database
        $this->report_data = $reportData;
        $this->save();

        return $reportData;
    }

    /**
     * Generate month-to-month income comparison data
     */
    public function generateMonthlyComparisonData()
    {
        $user = $this->user;
        $endDate = $this->end_date;
        
        // Get data for the last 6 months
        $startDate = Carbon::parse($endDate)->subMonths(6)->startOfMonth();
        
        $monthlyData = DB::table('earnings')
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
     * Generate income forecast based on historical data
     */
    public function generateIncomeForecast($months = 3)
    {
        $user = $this->user;
        $endDate = $this->end_date;
        
        // Get data for the last 6 months for trend calculation
        $startDate = Carbon::parse($endDate)->subMonths(6)->startOfMonth();
        
        // Get monthly totals
        $historicalData = DB::table('earnings')
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
     * Generate income stability analysis
     */
    public function generateIncomeStabilityAnalysis()
    {
        $user = $this->user;
        $startDate = $this->start_date;
        $endDate = $this->end_date;
        
        // Get monthly income data
        $monthlyData = DB::table('earnings')
            ->select(DB::raw("DATE_FORMAT(date, '%Y-%m') as month"), DB::raw('SUM(amount) as total'))
            ->where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy(DB::raw("DATE_FORMAT(date, '%Y-%m')"))
            ->orderBy('month')
            ->get();
            
        // Calculate statistics
        $totalMonths = $monthlyData->count();
        $monthlyTotals = $monthlyData->pluck('total')->toArray();
        
        if ($totalMonths < 2) {
            return [
                'stability_score' => null,
                'average_monthly_income' => count($monthlyTotals) > 0 ? array_sum($monthlyTotals) / count($monthlyTotals) : 0,
                'monthly_variation' => null,
                'trend' => null,
                'sufficient_data' => false
            ];
        }
        
        // Calculate average monthly income
        $averageMonthlyIncome = array_sum($monthlyTotals) / count($monthlyTotals);
        
        // Calculate coefficient of variation (standard deviation / mean)
        $variance = 0;
        foreach ($monthlyTotals as $total) {
            $variance += pow($total - $averageMonthlyIncome, 2);
        }
        $variance /= $totalMonths;
        $standardDeviation = sqrt($variance);
        $coefficientOfVariation = $averageMonthlyIncome > 0 ? ($standardDeviation / $averageMonthlyIncome) * 100 : 0;
        
        // Determine income stability score (lower variation = higher stability)
        $stabilityScore = max(0, 100 - $coefficientOfVariation);
        
        // Determine income trend (increasing, decreasing, stable)
        $trend = 'stable';
        if ($totalMonths >= 3) {
            $firstHalf = array_slice($monthlyTotals, 0, floor($totalMonths / 2));
            $secondHalf = array_slice($monthlyTotals, floor($totalMonths / 2));
            
            $firstHalfAvg = array_sum($firstHalf) / count($firstHalf);
            $secondHalfAvg = array_sum($secondHalf) / count($secondHalf);
            
            $percentChange = $firstHalfAvg > 0 ? (($secondHalfAvg - $firstHalfAvg) / $firstHalfAvg) * 100 : 0;
            
            if ($percentChange > 5) {
                $trend = 'increasing';
            } elseif ($percentChange < -5) {
                $trend = 'decreasing';
            }
        }
        
        return [
            'stability_score' => round($stabilityScore, 1),
            'average_monthly_income' => $averageMonthlyIncome,
            'monthly_variation' => $coefficientOfVariation,
            'trend' => $trend,
            'sufficient_data' => true
        ];
    }

    /**
     * Generate income source diversity assessment
     */
    public function generateIncomeSourceDiversity()
    {
        $user = $this->user;
        $startDate = $this->start_date;
        $endDate = $this->end_date;
        
        // Get income by category
        $categoriesData = $this->generateCategoryData()->toArray();
        
        // Convert to array if it's a collection
        if (!is_array($categoriesData)) {
            $categoriesData = json_decode(json_encode($categoriesData), true);
        }
        
        $totalIncome = array_sum(array_column($categoriesData, 'total'));
        $categoryCount = count($categoriesData);
        
        // Calculate income diversity metrics
        if ($totalIncome <= 0 || $categoryCount <= 1) {
            return [
                'diversity_score' => 0,
                'primary_source' => $categoryCount > 0 ? $categoriesData[0]['name'] : null,
                'primary_source_percentage' => $categoryCount > 0 ? 100 : 0,
                'source_count' => $categoryCount,
                'sufficient_diversity' => false
            ];
        }
        
        // Sort categories by amount
        usort($categoriesData, function($a, $b) {
            return $b['total'] - $a['total'];
        });
        
        // Calculate primary source percentage
        $primarySource = $categoriesData[0];
        $primarySourcePercentage = ($primarySource['total'] / $totalIncome) * 100;
        
        // Calculate Herfindahl-Hirschman Index (concentration measure)
        $hhi = 0;
        foreach ($categoriesData as $category) {
            $marketShare = ($category['total'] / $totalIncome);
            $hhi += $marketShare * $marketShare;
        }
        
        // Convert HHI to diversity score (0-100, higher is more diverse)
        $diversityScore = (1 - $hhi) * 100;
        
        // Determine if income sources are sufficiently diverse
        $sufficientDiversity = $diversityScore > 50 && $primarySourcePercentage < 70;
        
        return [
            'diversity_score' => round($diversityScore, 1),
            'primary_source' => $primarySource['name'],
            'primary_source_percentage' => round($primarySourcePercentage, 1),
            'source_count' => $categoryCount,
            'sufficient_diversity' => $sufficientDiversity,
            'sources' => array_map(function($category) use ($totalIncome) {
                return [
                    'name' => $category['name'],
                    'amount' => $category['total'],
                    'percentage' => ($category['total'] / $totalIncome) * 100
                ];
            }, $categoriesData)
        ];
    }

    /**
     * Generate income vs expenses visualization data
     */
    public function generateDetailedIncomeVsExpensesData()
    {
        $user = $this->user;
        $startDate = $this->start_date;
        $endDate = $this->end_date;
        
        // Get monthly income data
        $monthlyIncome = DB::table('earnings')
            ->select(DB::raw("DATE_FORMAT(date, '%Y-%m') as month"), DB::raw('SUM(amount) as total'))
            ->where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy(DB::raw("DATE_FORMAT(date, '%Y-%m')"))
            ->orderBy('month')
            ->get()
            ->keyBy('month');
            
        // Get monthly expense data
        $monthlyExpenses = DB::table('expenses')
            ->select(DB::raw("DATE_FORMAT(date, '%Y-%m') as month"), DB::raw('SUM(amount) as total'))
            ->where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->groupBy(DB::raw("DATE_FORMAT(date, '%Y-%m')"))
            ->orderBy('month')
            ->get()
            ->keyBy('month');
            
        // Combine and format data
        $months = array_unique(array_merge(
            $monthlyIncome->pluck('month')->toArray(), 
            $monthlyExpenses->pluck('month')->toArray()
        ));
        sort($months);
        
        $comparisonData = [];
        foreach ($months as $month) {
            $income = $monthlyIncome->get($month) ? $monthlyIncome->get($month)->total : 0;
            $expenses = $monthlyExpenses->get($month) ? $monthlyExpenses->get($month)->total : 0;
            $savings = $income - $expenses;
            $savingsRate = $income > 0 ? ($savings / $income) * 100 : 0;
            
            $date = Carbon::createFromFormat('Y-m', $month);
            $comparisonData[] = [
                'month' => $date->format('M Y'),
                'month_key' => $month,
                'income' => $income,
                'expenses' => $expenses,
                'savings' => $savings,
                'savings_rate' => $savingsRate
            ];
        }
        
        // Calculate overall statistics
        $totalIncome = array_sum(array_column($comparisonData, 'income'));
        $totalExpenses = array_sum(array_column($comparisonData, 'expenses'));
        $totalSavings = $totalIncome - $totalExpenses;
        $overallSavingsRate = $totalIncome > 0 ? ($totalSavings / $totalIncome) * 100 : 0;
        $monthCount = count($comparisonData);
        
        return [
            'monthly_data' => $comparisonData,
            'summary' => [
                'total_income' => $totalIncome,
                'total_expenses' => $totalExpenses,
                'total_savings' => $totalSavings,
                'average_monthly_income' => $monthCount > 0 ? $totalIncome / $monthCount : 0,
                'average_monthly_expenses' => $monthCount > 0 ? $totalExpenses / $monthCount : 0,
                'average_monthly_savings' => $monthCount > 0 ? $totalSavings / $monthCount : 0,
                'overall_savings_rate' => $overallSavingsRate,
                'month_count' => $monthCount
            ]
        ];
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
        $reportData['income_forecast'] = $this->generateIncomeForecast();
        $reportData['income_stability'] = $this->generateIncomeStabilityAnalysis();
        $reportData['income_diversity'] = $this->generateIncomeSourceDiversity();
        $reportData['detailed_income_vs_expenses'] = $this->generateDetailedIncomeVsExpensesData();
        
        // Update the report data in the database
        $this->report_data = $reportData;
        $this->save();
        
        return $reportData;
    }
}