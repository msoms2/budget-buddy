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
        // Get admin user
        $adminUser = User::where('email', 'admin@example.com')->first();
        
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
            $category = EarningCategory::factory()->create([
                'name' => $categoryName,
                'user_id' => $adminUser->id,
                'is_system' => true
            ]);
            
            // Create income subcategories
            foreach ($subcategories as $subcategoryName) {
                EarningCategory::factory()->create([
                    'name' => $subcategoryName,
                    'user_id' => $adminUser->id,
                    'is_system' => true,
                    'parent_id' => $category->id
                ]);
            }
        }

        // Create Expense Categories and Subcategories
        foreach ($expenseCategories as $categoryName => $subcategories) {
            $category = ExpenseCategory::factory()->create([
                'name' => $categoryName,
                'user_id' => $adminUser->id,
                'is_system' => true
            ]);

            // Create subcategories
            foreach ($subcategories as $subcategoryName) {
                ExpenseCategory::factory()
                    ->asSubcategory($category)
                    ->create([
                        'name' => $subcategoryName,
                        'is_system' => true
                    ]);
            }
        }
    }
}