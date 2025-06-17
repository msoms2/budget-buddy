<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\InvestmentCategory;
use App\Models\Investment;
use App\Models\InvestmentTransaction;
use App\Models\Currency;

class InvestmentSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $usd = Currency::where('code', 'USD')->first();

        // Define date ranges for 2 years of data
        $twoYearsAgo = now()->subYears(2);
        $oneYearAgo = now()->subYear();
        $sixMonthsAgo = now()->subMonths(6);

        // Create only essential investment categories
        $categories = [
            'Stocks' => 'Individual company shares and stock market investments',
            'Bonds' => 'Government and corporate bonds',
            'ETFs' => 'Exchange-traded funds tracking various indices'
        ];

        foreach ($categories as $name => $description) {
            InvestmentCategory::firstOrCreate(
                ['name' => $name],
                ['description' => $description]
            );
        }

        $investmentCategories = InvestmentCategory::all();

        foreach ($users as $user) {
            // Create only 1-2 investments for each user instead of 3-5
            $investmentCount = fake()->numberBetween(1, 2);
            
            for ($i = 0; $i < $investmentCount; $i++) {
                $category = $investmentCategories->random();
                
                // Determine investment start date
                $startDate = match ($i % 3) {
                    0 => $twoYearsAgo->copy()->addDays(fake()->numberBetween(0, 60)),
                    1 => $oneYearAgo->copy()->addDays(fake()->numberBetween(0, 60)),
                    2 => $sixMonthsAgo->copy()->addDays(fake()->numberBetween(0, 60)),
                    default => now()->subDays(fake()->numberBetween(60, 600)),
                };
                
                $investment = Investment::factory()
                    ->create([
                        'user_id' => $user->id,
                        'investment_category_id' => $category->id,
                        'currency_id' => $usd->id,
                        'created_at' => $startDate,
                        'updated_at' => $startDate,
                    ]);

                // Create initial investment transaction
                $initialAmount = fake()->randomFloat(2, 1000, 5000);
                $quantity = fake()->randomFloat(2, 10, 100);
                $pricePerUnit = $initialAmount / $quantity;
                
                InvestmentTransaction::factory()
                    ->create([
                        'investment_id' => $investment->id,
                        'date' => $startDate,
                        'quantity' => $quantity,
                        'price_per_unit' => $pricePerUnit,
                        'total_amount' => $initialAmount, // Use total_amount instead of amount
                        'transaction_type' => 'buy',
                    ]);
                
                // Create regular transactions over time based on investment age
                $monthsActive = $startDate->diffInMonths(now());
                $transactionCount = min(12, max(3, intval($monthsActive / 2))); // 1 every 2 months, 3-12 transactions
                
                for ($j = 1; $j < $transactionCount; $j++) {
                    $transactionDate = $startDate->copy()->addMonths($j * 2);
                    $transactionType = fake()->randomElement(['buy', 'sell', 'dividend']);
                    
                    $transactionAmount = match ($transactionType) {
                        'buy' => fake()->randomFloat(2, 200, 1000),
                        'sell' => fake()->randomFloat(2, 100, 800),
                        'dividend' => fake()->randomFloat(2, 10, 200),
                        default => fake()->randomFloat(2, 50, 500),
                    };
                    
                    $transactionQuantity = fake()->randomFloat(2, 1, 20);
                    $transactionPricePerUnit = $transactionAmount / $transactionQuantity;
                    
                    InvestmentTransaction::factory()
                        ->create([
                            'investment_id' => $investment->id,
                            'date' => $transactionDate,
                            'quantity' => $transactionQuantity,
                            'price_per_unit' => $transactionPricePerUnit,
                            'total_amount' => $transactionAmount, // Use total_amount instead of amount
                            'transaction_type' => $transactionType,
                        ]);
                }
                
                // Add performance logs over time to track investment growth
                $initialAmount = $investment->initial_amount;
                
                // Using Investment model to update the current amount randomly
                $growth = fake()->randomFloat(2, -0.2, 0.4); // Between -20% and +40% growth
                $investment->update([
                    'current_amount' => $initialAmount * (1 + $growth)
                ]);
            }
        }
    }
}