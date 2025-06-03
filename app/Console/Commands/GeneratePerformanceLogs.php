<?php

namespace App\Console\Commands;

use App\Models\Investment;
use App\Models\InvestmentPerformanceLog;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GeneratePerformanceLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'investments:generate-performance-logs {--days=30 : Number of days of historical data to generate}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate sample performance logs for existing investments to populate the portfolio performance chart';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = (int) $this->option('days');
        
        $investments = Investment::all();
        
        if ($investments->isEmpty()) {
            $this->error('No investments found. Please add some investments first.');
            return 1;
        }

        $this->info("Generating {$days} days of performance logs for {$investments->count()} investments...");

        $progressBar = $this->output->createProgressBar($investments->count() * $days);

        foreach ($investments as $investment) {
            $this->generateLogsForInvestment($investment, $days, $progressBar);
        }

        $progressBar->finish();
        $this->newLine();
        $this->info('Performance logs generated successfully!');
        $this->info('You can now view the portfolio performance chart.');

        return 0;
    }

    /**
     * Generate performance logs for a single investment.
     */
    private function generateLogsForInvestment(Investment $investment, int $days, $progressBar)
    {
        $startDate = Carbon::now()->subDays($days);
        $initialValue = $investment->initial_amount;
        $currentValue = $investment->current_amount;
        
        // Calculate daily growth rate to reach current value
        $totalGrowthRate = $currentValue > 0 ? ($currentValue - $initialValue) / $initialValue : 0;
        $dailyGrowthRate = $totalGrowthRate / $days;

        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i);
            
            // Add some realistic volatility to the performance
            $volatility = (mt_rand(-100, 100) / 1000) * 0.1; // ±10% volatility factor
            $growthFactor = 1 + ($dailyGrowthRate * ($i + 1)) + $volatility;
            $dayValue = $initialValue * $growthFactor;
            
            // Ensure value doesn't go negative
            $dayValue = max($dayValue, $initialValue * 0.1);
            
            $unrealizedGain = $dayValue - $initialValue;
            $returnPercentage = $initialValue > 0 ? (($dayValue - $initialValue) / $initialValue) * 100 : 0;

            InvestmentPerformanceLog::updateOrCreate(
                [
                    'investment_id' => $investment->id,
                    'date' => $date->toDateString(),
                ],
                [
                    'current_value' => round($dayValue, 2),
                    'unrealized_gain' => round($unrealizedGain, 2),
                    'realized_gain' => 0,
                    'total_return_percentage' => round($returnPercentage, 4),
                ]
            );

            $progressBar->advance();
        }
    }
}
