<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Earning;
use App\Models\EarningCategory;
use App\Models\User;
use App\Models\Currency;
use Carbon\Carbon;

class IncomeTestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first user or create one if none exists
        $user = User::first();
        if (!$user) {
            return;
        }

        // Get or create currency
        $currency = Currency::first();
        if (!$currency) {
            return;
        }

        // Get or create income categories
        $salaryCategory = EarningCategory::firstOrCreate([
            'name' => 'Salary',
            'user_id' => $user->id
        ]);

        $freelanceCategory = EarningCategory::firstOrCreate([
            'name' => 'Freelance',
            'user_id' => $user->id
        ]);

        $investmentCategory = EarningCategory::firstOrCreate([
            'name' => 'Investment',
            'user_id' => $user->id
        ]);

        $otherCategory = EarningCategory::firstOrCreate([
            'name' => 'Other',
            'user_id' => $user->id
        ]);

        // Create sample earnings data for the past 6 months
        $now = Carbon::now();
        
        // Salary entries - recurring monthly income
        for ($i = 0; $i < 6; $i++) {
            $date = $now->copy()->subMonths($i);
            
            Earning::create([
                'name' => 'Monthly Salary',
                'amount' => 2500.00,
                'description' => 'Regular monthly salary',
                'date' => $date->format('Y-m-15'),
                'user_id' => $user->id,
                'category_id' => $salaryCategory->id,
                'currency_id' => $currency->id,
                'is_recurring' => true,
                'frequency' => 'monthly',
                'source' => 'Primary Employer',
                'source_type' => 'employment',
            ]);
        }
        
        // Freelance income - variable
        $freelanceAmounts = [850, 1200, 650, 920, 1400, 750];
        for ($i = 0; $i < 6; $i++) {
            $date = $now->copy()->subMonths($i);
            $randomDay = rand(1, 28);
            
            Earning::create([
                'name' => 'Freelance Project',
                'amount' => $freelanceAmounts[$i],
                'description' => 'Project payment',
                'date' => $date->format('Y-m-'.$randomDay),
                'user_id' => $user->id,
                'category_id' => $freelanceCategory->id,
                'currency_id' => $currency->id,
                'is_recurring' => false,
                'frequency' => 'one-time',
                'source' => 'Various Clients',
                'source_type' => 'self-employment',
            ]);
        }
        
        // Investment income - quarterly
        $investmentMonths = [0, 3];
        foreach ($investmentMonths as $month) {
            $date = $now->copy()->subMonths($month);
            
            Earning::create([
                'name' => 'Dividend Payment',
                'amount' => 350.00,
                'description' => 'Quarterly dividend',
                'date' => $date->format('Y-m-10'),
                'user_id' => $user->id,
                'category_id' => $investmentCategory->id,
                'currency_id' => $currency->id,
                'is_recurring' => true,
                'frequency' => 'monthly', // Changed from 'quarterly' to 'monthly'
                'source' => 'Stock Portfolio',
                'source_type' => 'passive',
            ]);
        }
        
        // Other random income
        $otherDates = [
            $now->copy()->subMonths(1)->format('Y-m-05'),
            $now->copy()->subMonths(4)->format('Y-m-22'),
        ];
        
        $otherAmounts = [150.00, 230.00];
        $otherNames = ['Gift', 'Cashback Reward'];
        
        for ($i = 0; $i < count($otherDates); $i++) {
            Earning::create([
                'name' => $otherNames[$i],
                'amount' => $otherAmounts[$i],
                'description' => 'One-time income',
                'date' => $otherDates[$i],
                'user_id' => $user->id,
                'category_id' => $otherCategory->id,
                'currency_id' => $currency->id,
                'is_recurring' => false,
                'frequency' => 'one-time',
                'source' => 'Miscellaneous',
                'source_type' => 'other',
            ]);
        }
    }
}
