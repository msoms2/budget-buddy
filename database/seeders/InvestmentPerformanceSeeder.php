<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Investment;
use App\Models\InvestmentPerformanceLog;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class InvestmentPerformanceSeeder extends Seeder
{
    public function run(): void
    {
        // Get all investments with user and user's currency to prevent lazy loading violations
        $investments = Investment::with('user.currency')->get();
        
        foreach ($investments as $investment) {
            // Skip investments without an initial amount
            if (!$investment->initial_amount) continue;
            
            // Get investment start date
            $startDate = $investment->purchase_date ?: $investment->created_at;
            if (!$startDate) continue;
            
            // Convert to Carbon instance if not already
            if (!($startDate instanceof Carbon)) {
                $startDate = Carbon::parse($startDate);
            }
            
            // Ensure start date is not in the future
            if ($startDate->isFuture()) {
                $startDate = Carbon::now()->subMonths(6);
            }
            
            // Create a date range from start to today
            $endDate = Carbon::now();
            $interval = round(max(1, $startDate->diffInDays($endDate) / 10)); // Log approximately 10 entries
            
            $datePeriod = CarbonPeriod::create($startDate, $interval . ' days', $endDate);
            
            // Get initial investment amount
            $initialAmount = $investment->initial_amount;
            $currentValue = $initialAmount;
            
            // Determine growth pattern (steady growth, volatile, decline)
            $growthPattern = fake()->randomElement(['steady', 'volatile', 'growth-then-decline', 'decline-then-growth']);
            $volatilityFactor = match($growthPattern) {
                'steady' => 0.02, // 2% volatility
                'volatile' => 0.05, // 5% volatility
                'growth-then-decline' => 0.03, // 3% volatility
                'decline-then-growth' => 0.03, // 3% volatility
                default => 0.02,
            };
            
            // Determine overall growth trend (annually)
            $growthTrend = match($growthPattern) {
                'steady' => fake()->randomFloat(2, 0.04, 0.12), // 4-12% annual growth
                'volatile' => fake()->randomFloat(2, -0.05, 0.20), // -5-20% annual growth
                'growth-then-decline' => fake()->randomFloat(2, 0.10, 0.20), // 10-20% initial growth
                'decline-then-growth' => fake()->randomFloat(2, -0.15, -0.05), // 5-15% initial decline
                default => 0.07, // 7% default growth
            };
            
            // Generate performance logs over time
            $lastLogDate = null;
            $midpoint = $datePeriod->count() / 2;
            $counter = 0;
            
            foreach ($datePeriod as $date) {
                // Skip dates in the future
                if ($date->isFuture()) {
                    continue;
                }
                
                $counter++;
                
                // For growth-then-decline or decline-then-growth, flip the trend halfway through
                if (($growthPattern === 'growth-then-decline' || $growthPattern === 'decline-then-growth') && $counter > $midpoint) {
                    $growthTrend = -$growthTrend;
                }
                
                // Calculate daily growth rate from annual rate (compounding)
                $dailyGrowthRate = pow(1 + $growthTrend, 1/365) - 1;
                
                // Add volatility to daily growth
                $volatility = fake()->randomFloat(4, -$volatilityFactor, $volatilityFactor);
                $adjustedDailyGrowth = $dailyGrowthRate + $volatility;
                
                // Calculate days since last log
                $daysSinceLastLog = $lastLogDate ? $date->diffInDays($lastLogDate) : 1;
                
                // Compound growth over days since last log
                $growthMultiplier = pow(1 + $adjustedDailyGrowth, $daysSinceLastLog);
                $currentValue *= $growthMultiplier;
                
                // Ensure value doesn't go below a reasonable minimum (20% of initial investment)
                $currentValue = max($currentValue, $initialAmount * 0.2);
                
                // Add a cap to prevent unrealistic extreme growth
                $currentValue = min($currentValue, $initialAmount * 10); // Cap at 1000% of initial investment
                
                // Calculate unrealized gains/losses
                $unrealizedGain = $currentValue - $initialAmount;
                
                // Set realized gain to 0 as we're not tracking individual sell transactions in this seeder
                $realizedGain = 0;
                
                // Calculate total return percentage (capped at +/- 999.99%)
                $totalReturnPercentage = ($currentValue - $initialAmount) / $initialAmount * 100;
                $totalReturnPercentage = max(-999.99, min(999.99, $totalReturnPercentage));
                
                // Create the performance log
                InvestmentPerformanceLog::create([
                    'investment_id' => $investment->id,
                    'date' => $date,
                    'current_value' => round($currentValue, 2),
                    'unrealized_gain' => round($unrealizedGain, 2),
                    'realized_gain' => $realizedGain,
                    'total_return_percentage' => round($totalReturnPercentage, 2),
                ]);
                
                $lastLogDate = $date;
            }
            
            // Update the investment's current_amount to match the latest performance log
            $investment->update([
                'current_amount' => round($currentValue, 2)
            ]);
        }
    }
}