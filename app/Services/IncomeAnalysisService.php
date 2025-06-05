<?php

namespace App\Services;

use App\Models\Earning;
use App\Models\EarningCategory;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class IncomeAnalysisService
{
    /**
     * Get overview of income analysis combining all types of analysis
     *
     * @return array
     */
    public function getOverview(): array
    {
        $diversity = $this->analyzeIncomeDiversity();
        $stability = $this->analyzeIncomeStability();
        $frequency = $this->analyzeIncomeFrequency();
        
        return [
            'diversityScore' => $diversity['diversity_score'] ?? 0,
            'stabilityScore' => $stability['stability_score'] ?? 0,
            'recurringPercentage' => $frequency['recurring_percentage'] ?? 0,
            'trend' => $stability['trend'] ?? 'stable',
            'sources' => $diversity['sources'] ?? [],
            'primarySource' => $diversity['primarySource'] ?? null,
            'secondarySource' => $diversity['secondarySource'] ?? null,
            'monthlyData' => $stability['monthly_data'] ?? [],
        ];
    }

    /**
     * Analyze income diversity and calculate distribution of income sources
     *
     * @return array
     */
    public function analyzeIncomeDiversity(): array
    {
        $earnings = Earning::select('category_id', DB::raw('SUM(amount) as total_amount'))
            ->where('user_id', auth()->id())
            ->groupBy('category_id')
            ->get();

        $totalIncome = $earnings->sum('total_amount');
        $sources = [];
        $diversityScore = 0;

        if ($totalIncome > 0) {
            // Calculate percentage distribution and identify streams
            foreach ($earnings as $earning) {
                $categoryName = 'Uncategorized';
                if ($earning->category_id) {
                    $category = EarningCategory::find($earning->category_id);
                    $categoryName = $category ? $category->name : 'Uncategorized';
                }
                
                $percentage = ($earning->total_amount / $totalIncome) * 100;
                $sources[$categoryName] = [
                    'amount' => $earning->total_amount,
                    'percentage' => round($percentage, 2),
                    'type' => $percentage >= 50 ? 'primary' : 'secondary'
                ];

                // Calculate diversity score using Shannon's Diversity Index
                if ($percentage > 0) {
                    $p = $percentage / 100;
                    $diversityScore -= $p * log($p);
                }
            }
        }

        // Normalize diversity score to 0-10 scale
        // Shannon's index typically ranges from 0 to ln(n) where n is number of categories
        // For practical purposes, we'll map it to 0-10 scale
        $maxPossibleScore = log(10); // Assuming max 10 categories for scaling
        $normalizedScore = ($diversityScore / $maxPossibleScore) * 10;
        $normalizedScore = min(10, max(0, $normalizedScore)); // Ensure 0-10 range

        return [
            'diversity_score' => round($normalizedScore, 2),
                'sources' => collect($sources)->map(function ($source, $name) {
                    return [
                        'name' => $name,
                        'value' => $source['amount'],
                        'percentage' => $source['percentage']
                    ];
                })->sortByDesc('value')->values()->all(),
                'primarySource' => collect($sources)->filter(fn($source) => $source['type'] === 'primary')
                    ->map(fn($source, $name) => ['name' => $name, 'percentage' => $source['percentage']])
                    ->first(),
                'secondarySource' => collect($sources)->filter(fn($source) => $source['type'] === 'secondary')
                    ->sortByDesc('percentage')
                    ->map(fn($source, $name) => ['name' => $name, 'percentage' => $source['percentage']])
                    ->first(),
            'primary_streams' => collect($sources)->filter(fn($source) => $source['type'] === 'primary')->keys()->toArray(),
            'secondary_streams' => collect($sources)->filter(fn($source) => $source['type'] === 'secondary')->keys()->toArray()
        ];
    }

    /**
     * Analyze income stability by calculating variance and trends
     *
     * @return array
     */
    public function analyzeIncomeStability(): array
    {
        $monthlyEarnings = Earning::select(
            DB::raw('DATE_FORMAT(date, "%Y-%m") as month'),
            DB::raw('SUM(amount) as total_amount')
        )
        ->where('user_id', auth()->id())
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        // Default values for empty data
        $stabilityScore = 0;
        $variance = 0;
        $trend = 'stable';
        
        // Only calculate if we have data
        if ($monthlyEarnings->isNotEmpty()) {
            // Calculate monthly variance
            $amounts = $monthlyEarnings->pluck('total_amount');
            $mean = $amounts->average();
            
            if ($mean > 0) {
                $variance = $amounts->map(fn($amount) => pow($amount - $mean, 2))->average();
                $standardDeviation = sqrt($variance);

                // Calculate trend
                $months = $monthlyEarnings->count();
                if ($months >= 3) {
                    $firstHalf = $monthlyEarnings->take(floor($months/2))->avg('total_amount');
                    $secondHalf = $monthlyEarnings->skip(floor($months/2))->avg('total_amount');
                    $difference = $secondHalf - $firstHalf;
                    
                    if ($difference > ($mean * 0.1)) {
                        $trend = 'increasing';
                    } elseif ($difference < -($mean * 0.1)) {
                        $trend = 'decreasing';
                    }
                }

                // Calculate stability score (0-10)
                $variancePercentage = ($standardDeviation / $mean) * 100;
                $stabilityScore = max(0, min(10, 10 - ($variancePercentage / 10)));
            }
        }

        return [
            'monthly_variance' => round($variance, 2),
            'trend' => $trend,
            'stability_score' => round($stabilityScore, 2),
            'monthly_data' => $monthlyEarnings->toArray()
        ];
    }

    /**
     * Analyze frequency patterns in income streams
     *
     * @return array
     */
    public function analyzeIncomeFrequency(): array
    {
        // Check if frequency column exists and has data
        $hasFrequency = Schema::hasColumn('earnings', 'frequency');
        
        if (!$hasFrequency) {
            // Return default values if frequency doesn't exist
            return [
                'recurring_percentage' => 0,
                'frequency_breakdown' => [],
                'most_reliable_streams' => []
            ];
        }
        
        // Continue with frequency analysis if column exists
        $earnings = Earning::select('frequency', 'is_recurring', DB::raw('SUM(amount) as total_amount'))
            ->where('user_id', auth()->id())
            ->whereNotNull('frequency')
            ->groupBy('frequency', 'is_recurring')
            ->get();

        $totalIncome = Earning::where('user_id', auth()->id())->sum('amount');
        $frequencies = [];
        $recurringTotal = 0;

        if ($totalIncome > 0) {
            // Calculate frequency distribution
            foreach ($earnings as $earning) {
                $percentage = ($earning->total_amount / $totalIncome) * 100;
                $frequencies[$earning->frequency] = [
                    'amount' => $earning->total_amount,
                    'percentage' => round($percentage, 2)
                ];

                // Add to recurring total if is_recurring is true
                if ($earning->is_recurring) {
                    $recurringTotal += $earning->total_amount;
                }
            }
        }

        // Calculate recurring percentage safely as decimal (0-1)
        $recurringPercentage = $totalIncome > 0 ? ($recurringTotal / $totalIncome) : 0;

        return [
            'recurring_percentage' => round($recurringPercentage, 4),
            'frequency_breakdown' => $frequencies,
            'most_reliable_streams' => []
        ];
    }

    /**
     * Generate income forecast for next 6 months
     *
     * @return array
     */
    public function generateIncomeForecast(): array
    {
        $now = Carbon::now();
        $sixMonthsAgo = $now->copy()->subMonths(6);
        
        // Get historical data
        $historicalEarnings = Earning::where('user_id', auth()->id())
            ->where('date', '>=', $sixMonthsAgo)
            ->get()
            ->groupBy(function($earning) {
                return Carbon::parse($earning->date)->format('Y-m');
            });

        $forecast = [];
        $recurringIncome = $this->calculateRecurringIncome();

        // Generate 6-month forecast
        for ($i = 1; $i <= 6; $i++) {
            $forecastMonth = $now->copy()->addMonths($i);
            $monthName = $forecastMonth->format('M Y');

            // Calculate variable income prediction
            $variableIncome = $this->predictVariableIncome($historicalEarnings);
            
            // Calculate confidence interval
            $confidenceInterval = $this->calculateConfidenceInterval($historicalEarnings);
            
            $total = $recurringIncome + $variableIncome;
            
            $forecast[] = [
                'month' => $monthName,
                'recurringIncome' => $recurringIncome,
                'variableIncome' => $variableIncome,
                'upperBound' => $total + $confidenceInterval['upper'],
                'lowerBound' => max(0, $total - $confidenceInterval['lower']),
                'confidence' => min(0.95, $historicalEarnings->count() / 12)
            ];
        }

        // Calculate totals for summary stats
        $totalForecast = collect($forecast)->sum('recurringIncome') + collect($forecast)->sum('variableIncome');
        $averageMonthly = $totalForecast / count($forecast);
        $forecastConfidence = $historicalEarnings->count() > 0 ? min(0.95, $historicalEarnings->count() / 12) : 0.4;

        return [
            'forecast' => $forecast,
            'totalForecast' => $totalForecast,
            'averageMonthly' => $averageMonthly,
            'forecastConfidence' => $forecastConfidence
        ];
    }

    /**
     * Calculate recurring income based on is_recurring flag
     *
     * @return float
     */
    private function calculateRecurringIncome(): float
    {
        return Earning::where('user_id', auth()->id())
            ->where('is_recurring', true)
            ->sum('amount');
    }

    /**
     * Predict variable income based on historical data
     *
     * @param Collection $historicalData
     * @return float
     */
    private function predictVariableIncome(Collection $historicalData): float
    {
        if ($historicalData->isEmpty()) {
            return 0;
        }

        $variableAmounts = $historicalData->map(function($monthData) {
            return $monthData->where('is_recurring', false)->sum('amount');
        });

        return round($variableAmounts->average(), 2);
    }

    /**
     * Calculate confidence interval for predictions
     *
     * @param Collection $historicalData
     * @return array
     */
    private function calculateConfidenceInterval(Collection $historicalData): array
    {
        if ($historicalData->isEmpty()) {
            return ['lower' => 0, 'upper' => 0];
        }

        $amounts = $historicalData->map(fn($month) => $month->sum('amount'));
        $mean = $amounts->average();
        
        if ($amounts->count() <= 1 || $mean == 0) {
            return ['lower' => 0, 'upper' => 0];
        }
        
        $standardDeviation = sqrt($amounts->map(fn($amount) => pow($amount - $mean, 2))->average());
        
        // Using 95% confidence interval (z-score = 1.96)
        $margin = 1.96 * ($standardDeviation / sqrt($amounts->count()));

        return [
            'lower' => round($mean - $margin, 2),
            'upper' => round($mean + $margin, 2)
        ];
    }
}
