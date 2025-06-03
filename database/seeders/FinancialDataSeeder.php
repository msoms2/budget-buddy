<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Budget;
use App\Models\Earning;
use App\Models\Expense;
use App\Models\Currency;
use App\Models\PaymentMethod;
use App\Models\ExpenseCategory;
use App\Models\EarningCategory;
use Carbon\Carbon;

class FinancialDataSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $currencies = Currency::all();
        $paymentMethods = PaymentMethod::all();

        // Define date ranges
        $twoYearsAgo = now()->subYears(2);
        $oneYearAgo = now()->subYear();
        $sixMonthsAgo = now()->subMonths(6);
        $threeMonthsAgo = now()->subMonths(3);
        $startOfCurrentMonth = Carbon::now()->startOfMonth();

        foreach ($users as $user) {
            // Get all expense categories (main and subcategories)
            $expenseMainCategories = ExpenseCategory::whereNull('parent_id')->get();
            $expenseSubcategories = ExpenseCategory::whereNotNull('parent_id')->get();
            
            // Get all income categories (main and subcategories)
            $incomeMainCategories = EarningCategory::whereNull('parent_id')->get();
            $incomeSubcategories = EarningCategory::whereNotNull('parent_id')->get();
            
            // Create budgets for expense categories
            foreach ($expenseMainCategories as $category) {
                Budget::factory()
                    ->monthly()
                    ->create([
                        'user_id' => $user->id,
                        'category_id' => $category->id,
                        'amount' => fake()->numberBetween(500, 2000),
                    ]);
            }

            // Seed 20 transactions for each expense subcategory
            foreach ($expenseSubcategories as $subcategory) {
                // 17 transactions spread across the past 2 years
                for ($i = 0; $i < 17; $i++) {
                    $monthOffset = fake()->numberBetween(0, 23);
                    $dayOffset = fake()->numberBetween(1, 28);
                    
                    Expense::factory()
                        ->create([
                            'user_id' => $user->id,
                            'category_id' => $subcategory->id,
                            'currency_id' => $currencies->firstWhere('code', 'USD')->id,
                            'payment_method_id' => $paymentMethods->random()->id,
                            'date' => $twoYearsAgo->copy()->addMonths($monthOffset)->addDays($dayOffset),
                            'name' => fake()->randomElement([
                                'Payment for ' . $subcategory->name,
                                $subcategory->name . ' expense',
                                'Monthly ' . $subcategory->name,
                                'Regular ' . $subcategory->name
                            ]),
                        ]);
                }
                
                // 3 transactions in the current month for statistics
                for ($i = 0; $i < 3; $i++) {
                    $dayOffset = fake()->numberBetween(1, min(28, Carbon::now()->day));
                    
                    Expense::factory()
                        ->create([
                            'user_id' => $user->id,
                            'category_id' => $subcategory->id,
                            'currency_id' => $currencies->firstWhere('code', 'USD')->id,
                            'payment_method_id' => $paymentMethods->random()->id,
                            'date' => $startOfCurrentMonth->copy()->addDays($dayOffset),
                            'name' => 'Current month ' . $subcategory->name . ' (#' . ($i + 1) . ')',
                        ]);
                }
            }
            
            // Seed 20 transactions for each income subcategory
            foreach ($incomeSubcategories as $subcategory) {
                // 17 transactions spread across the past 2 years
                for ($i = 0; $i < 17; $i++) {
                    $monthOffset = fake()->numberBetween(0, 23);
                    $dayOffset = fake()->numberBetween(1, 28);
                    
                    Earning::factory()
                        ->create([
                            'user_id' => $user->id,
                            'category_id' => $subcategory->id,
                            'currency_id' => $currencies->firstWhere('code', 'USD')->id,
                            'payment_method_id' => $paymentMethods->random()->id,
                            'date' => $twoYearsAgo->copy()->addMonths($monthOffset)->addDays($dayOffset),
                            'name' => fake()->randomElement([
                                'Income from ' . $subcategory->name,
                                $subcategory->name . ' earnings',
                                'Monthly ' . $subcategory->name,
                                'Regular ' . $subcategory->name
                            ]),
                        ]);
                }
                
                // 3 transactions in the current month for statistics
                for ($i = 0; $i < 3; $i++) {
                    $dayOffset = fake()->numberBetween(1, min(28, Carbon::now()->day));
                    
                    Earning::factory()
                        ->create([
                            'user_id' => $user->id,
                            'category_id' => $subcategory->id,
                            'currency_id' => $currencies->firstWhere('code', 'USD')->id,
                            'payment_method_id' => $paymentMethods->random()->id,
                            'date' => $startOfCurrentMonth->copy()->addDays($dayOffset),
                            'name' => 'Current month ' . $subcategory->name . ' (#' . ($i + 1) . ')',
                        ]);
                }
            }
        }
    }
}