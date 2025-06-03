<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Goal;
use App\Models\GoalTransaction;
use App\Models\ExpenseCategory;

class GoalSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $categories = ExpenseCategory::all();
        
        // Define date ranges for 2 years of data
        $twoYearsAgo = now()->subYears(2);
        $oneYearAgo = now()->subYear();
        $sixMonthsAgo = now()->subMonths(6);

        foreach ($users as $user) {
            // Create active goals with different start dates
            $activeGoals = Goal::factory()
                ->count(3) // Create more active goals with different timelines
                ->active()
                ->create([
                    'user_id' => $user->id,
                    'category_id' => $categories->random()->id,
                ]);

            // Create completed goals from the past
            $completedGoals = Goal::factory()
                ->count(2) // Create some completed goals
                ->completed()
                ->create([
                    'user_id' => $user->id,
                    'category_id' => $categories->random()->id,
                    'status' => 'completed',
                    'updated_at' => fake()->dateTimeBetween($oneYearAgo, 'now'),
                ]);

            // Create transactions for active goals distributed over time
            foreach ($activeGoals as $index => $goal) {
                // Determine start date for this goal based on index (stagger them across the 2 years)
                $startDate = match ($index) {
                    0 => $twoYearsAgo,                   // First goal started 2 years ago
                    1 => $oneYearAgo,                    // Second goal started 1 year ago
                    2 => $sixMonthsAgo,                  // Third goal started 6 months ago
                    default => $twoYearsAgo,
                };
                
                // Create a series of transactions with appropriate dates
                $transactionCount = fake()->numberBetween(6, 12);
                
                // Always add initial deposit
                GoalTransaction::factory()
                    ->deposit()
                    ->create([
                        'goal_id' => $goal->id,
                        'transaction_date' => $startDate,
                    ]);
                
                // Add regular transactions since the start date
                $monthsActive = $startDate->diffInMonths(now());
                $transactionInterval = max(1, intval($monthsActive / $transactionCount));
                
                for ($i = 0; $i < $transactionCount; $i++) {
                    $isDeposit = fake()->boolean(80); // 80% chance of being a deposit
                    
                    GoalTransaction::factory()
                        ->state(function (array $attributes) use ($isDeposit) {
                            $amount = fake()->randomFloat(2, 100, 1000);
                            return [
                                'amount' => $isDeposit ? $amount : -fake()->randomFloat(2, 50, min(300, $amount/2)),
                            ];
                        })
                        ->create([
                            'goal_id' => $goal->id,
                            'transaction_date' => $startDate->copy()->addMonths($i * $transactionInterval),
                        ]);
                }
            }

            // Create transactions for completed goals
            foreach ($completedGoals as $goal) {
                // For completed goals, create a timeline that reaches the target amount
                $completionDate = $goal->updated_at;
                $startDate = $completionDate->copy()->subMonths(fake()->numberBetween(6, 18)); // Started 6-18 months before completion
                
                // Calculate how many transactions to create based on the period
                $monthsBetween = $startDate->diffInMonths($completionDate);
                $transactionCount = min(6, $monthsBetween); // At most 6 transactions
                $transactionInterval = max(1, intval($monthsBetween / $transactionCount));
                
                // Create transactions leading to completion
                for ($i = 0; $i < $transactionCount; $i++) {
                    GoalTransaction::factory()
                        ->deposit()
                        ->create([
                            'goal_id' => $goal->id,
                            'transaction_date' => $startDate->copy()->addMonths($i * $transactionInterval),
                            'amount' => $goal->target_amount / $transactionCount, // Split target amount across transactions
                        ]);
                }
                
                // Add final transaction that completes the goal
                $remainingAmount = $goal->target_amount - ($goal->target_amount / $transactionCount * $transactionCount);
                if ($remainingAmount > 0) {
                    GoalTransaction::factory()
                        ->deposit()
                        ->create([
                            'goal_id' => $goal->id,
                            'transaction_date' => $completionDate->copy()->subDays(fake()->numberBetween(1, 10)),
                            'amount' => $remainingAmount + fake()->randomFloat(2, 0, 100), // Add a little extra
                        ]);
                }
            }
        }
    }
}