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

class TempFinancialDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Use only the admin user instead of all users to reduce the amount of data
        $adminUser = User::where('email', 'admin@example.com')->first();
        if (!$adminUser) {
            // If admin user doesn't exist, create it
            $adminUser = User::factory()->create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]);
        }
        $users = collect([$adminUser]); // Use only the admin user
        
        // Ensure USD currency exists
        $usdCurrency = Currency::firstOrCreate(
            ['code' => 'USD'],
            [
                'name' => 'US Dollar',
                'symbol' => '$',
                'exchange_rate' => 1.0000,
                'format' => '$#,##0.00',
                'decimal_places' => 2,
                'is_default' => true,
            ]
        );
        
        // Get payment methods or create some if none exist
        $paymentMethods = PaymentMethod::all();
        if ($paymentMethods->isEmpty()) {
            // Create a default payment method
            $paymentMethod = PaymentMethod::create([
                'name' => 'Cash',
                'description' => 'Cash payment',
                'user_id' => $adminUser->id,
                'is_active' => true,
            ]);
            $paymentMethods = collect([$paymentMethod]);
        }

        // Define date ranges - from today back to 2 years ago
        $startDate = Carbon::now()->subYears(2)->startOfMonth();
        $endDate = Carbon::now();
        $totalMonths = $startDate->diffInMonths($endDate) + 1; // +1 to include current month

        foreach ($users as $user) {
            // Get ALL expense categories (both parent and subcategories)
            $expenseMainCategories = ExpenseCategory::whereNull('parent_id')->get();
            $expenseSubcategories = ExpenseCategory::whereNotNull('parent_id')->get();
            
            // Get ALL income categories (both parent and subcategories)
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
                        'currency_id' => $usdCurrency->id,
                    ]);
            }

            // Seed transactions for expense PARENT categories (at least 1 per month)
            foreach ($expenseMainCategories as $category) {
                // Generate data for each month from 2 years ago to now
                for ($monthOffset = 0; $monthOffset < $totalMonths; $monthOffset++) {
                    $monthStart = $startDate->copy()->addMonths($monthOffset);
                    $monthEnd = $monthStart->copy()->endOfMonth();
                    
                    // Don't create future dates if we're in the current month
                    if ($monthEnd->isFuture()) {
                        $monthEnd = Carbon::now();
                    }
                    
                    // Create at least 1 transaction for this parent category per month
                    $randomDate = $monthStart->copy()->addDays(
                        fake()->numberBetween(0, min(27, $monthEnd->day - 1))
                    );
                    
                    Expense::factory()
                        ->create([
                            'user_id' => $user->id,
                            'category_id' => $category->id,
                            'currency_id' => $usdCurrency->id,
                            'payment_method_id' => $paymentMethods->random()->id,
                            'date' => $randomDate,
                            'name' => fake()->randomElement([
                                'Payment for ' . $category->name,
                                $category->name . ' expense',
                                'Monthly ' . $category->name,
                                'General ' . $category->name
                            ]),
                        ]);
                }
            }

            // Seed transactions for expense SUBCATEGORIES (at least 1 per month)
            foreach ($expenseSubcategories as $subcategory) {
                // Generate data for each month from 2 years ago to now
                for ($monthOffset = 0; $monthOffset < $totalMonths; $monthOffset++) {
                    $monthStart = $startDate->copy()->addMonths($monthOffset);
                    $monthEnd = $monthStart->copy()->endOfMonth();
                    
                    // Don't create future dates if we're in the current month
                    if ($monthEnd->isFuture()) {
                        $monthEnd = Carbon::now();
                    }
                    
                    // Create at least 1 transaction for this subcategory per month
                    // Add 1-3 additional transactions for variety
                    $transactionCount = fake()->numberBetween(1, 3);
                    for ($i = 0; $i < $transactionCount; $i++) {
                        $randomDate = $monthStart->copy()->addDays(
                            fake()->numberBetween(0, min(27, $monthEnd->day - 1))
                        );
                        
                        Expense::factory()
                            ->create([
                                'user_id' => $user->id,
                                'category_id' => $subcategory->id,
                                'currency_id' => $usdCurrency->id,
                                'payment_method_id' => $paymentMethods->random()->id,
                                'date' => $randomDate,
                                'name' => fake()->randomElement([
                                    'Payment for ' . $subcategory->name,
                                    $subcategory->name . ' expense',
                                    'Monthly ' . $subcategory->name,
                                    'Regular ' . $subcategory->name
                                ]),
                            ]);
                    }
                }
            }
            
            // Seed transactions for income PARENT categories (at least 1 per month)
            foreach ($incomeMainCategories as $category) {
                // Generate data for each month from 2 years ago to now
                for ($monthOffset = 0; $monthOffset < $totalMonths; $monthOffset++) {
                    $monthStart = $startDate->copy()->addMonths($monthOffset);
                    $monthEnd = $monthStart->copy()->endOfMonth();
                    
                    // Don't create future dates if we're in the current month
                    if ($monthEnd->isFuture()) {
                        $monthEnd = Carbon::now();
                    }
                    
                    // Create at least 1 transaction for this parent category per month
                    $randomDate = $monthStart->copy()->addDays(
                        fake()->numberBetween(0, min(27, $monthEnd->day - 1))
                    );
                    
                    Earning::factory()
                        ->create([
                            'user_id' => $user->id,
                            'category_id' => $category->id,
                            'currency_id' => $usdCurrency->id,
                            'payment_method_id' => $paymentMethods->random()->id,
                            'date' => $randomDate,
                            'name' => fake()->randomElement([
                                'Income from ' . $category->name,
                                $category->name . ' earnings',
                                'Monthly ' . $category->name,
                                'General ' . $category->name
                            ]),
                        ]);
                }
            }
            
            // Seed transactions for income SUBCATEGORIES (at least 1 per month)
            foreach ($incomeSubcategories as $subcategory) {
                // Generate data for each month from 2 years ago to now
                for ($monthOffset = 0; $monthOffset < $totalMonths; $monthOffset++) {
                    $monthStart = $startDate->copy()->addMonths($monthOffset);
                    $monthEnd = $monthStart->copy()->endOfMonth();
                    
                    // Don't create future dates if we're in the current month
                    if ($monthEnd->isFuture()) {
                        $monthEnd = Carbon::now();
                    }
                    
                    // Create at least 1 transaction for this subcategory per month
                    // Add 1-3 additional transactions for variety
                    $transactionCount = fake()->numberBetween(1, 3);
                    for ($i = 0; $i < $transactionCount; $i++) {
                        $randomDate = $monthStart->copy()->addDays(
                            fake()->numberBetween(0, min(27, $monthEnd->day - 1))
                        );
                        
                        Earning::factory()
                            ->create([
                                'user_id' => $user->id,
                                'category_id' => $subcategory->id,
                                'currency_id' => $usdCurrency->id,
                                'payment_method_id' => $paymentMethods->random()->id,
                                'date' => $randomDate,
                                'name' => fake()->randomElement([
                                    'Income from ' . $subcategory->name,
                                    $subcategory->name . ' earnings',
                                    'Monthly ' . $subcategory->name,
                                    'Regular ' . $subcategory->name
                                ]),
                            ]);
                    }
                }
            }
        }
    }
}
