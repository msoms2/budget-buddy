<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ExpenseCategory;
use App\Models\EarningCategory;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Get admin user or create if doesn't exist
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        
        // Income Categories - Exactly 4 categories with 3 subcategories each
        $incomeCategories = [
            'Salary' => ['Regular Pay', 'Bonus', 'Overtime'],
            'Investments' => ['Dividends', 'Interest', 'Capital Gains'],
            'Freelance' => ['Consulting', 'Contract Work', 'Commission'],
            'Other Income' => ['Gifts', 'Rental Income', 'Refunds']
        ];

        // Expense Categories - Exactly 6 categories with 3 subcategories each
        $expenseCategories = [
            'Housing' => ['Rent', 'Mortgage', 'Utilities'],
            'Transportation' => ['Fuel', 'Public Transit', 'Car Maintenance'],
            'Food' => ['Groceries', 'Dining Out', 'Delivery'],
            'Healthcare' => ['Insurance', 'Medications', 'Doctor Visits'],
            'Entertainment' => ['Movies', 'Gaming', 'Streaming Services'],
            'Personal' => ['Clothing', 'Education', 'Gifts']
        ];

        // Create Income Categories
        foreach ($incomeCategories as $categoryName => $subcategories) {
            $category = EarningCategory::firstOrCreate(
                [
                    'name' => $categoryName,
                    'is_system' => true,
                    'parent_id' => null,
                ],
                [
                    'user_id' => $adminUser->id,
                    'description' => "{$categoryName} income category",
                ]
            );
            
            // Create income subcategories
            foreach ($subcategories as $subcategoryName) {
                EarningCategory::firstOrCreate(
                    [
                        'name' => $subcategoryName,
                        'is_system' => true,
                        'parent_id' => $category->id,
                    ],
                    [
                        'user_id' => $adminUser->id,
                        'description' => "{$subcategoryName} subcategory",
                    ]
                );
            }
        }

        // Create Expense Categories and Subcategories
        foreach ($expenseCategories as $categoryName => $subcategories) {
            $category = ExpenseCategory::firstOrCreate(
                [
                    'name' => $categoryName,
                    'is_system' => true,
                    'parent_id' => null,
                ],
                [
                    'user_id' => $adminUser->id,
                    'description' => "{$categoryName} expense category",
                ]
            );

            // Create subcategories
            foreach ($subcategories as $subcategoryName) {
                ExpenseCategory::firstOrCreate(
                    [
                        'name' => $subcategoryName,
                        'is_system' => true,
                        'parent_id' => $category->id,
                    ],
                    [
                        'user_id' => $adminUser->id,
                        'description' => "{$subcategoryName} subcategory",
                    ]
                );
            }
        }
    }
}
