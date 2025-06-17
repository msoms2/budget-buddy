<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Creditor;
use Carbon\Carbon;

class CreditorSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        
        // Define common creditor types and their interest rate ranges
        $creditorTypes = [
            'Credit Card' => ['min' => 15.0, 'max' => 24.99],
            'Mortgage' => ['min' => 3.5, 'max' => 6.5],
            'Car Loan' => ['min' => 4.5, 'max' => 9.99],
            'Student Loan' => ['min' => 3.0, 'max' => 7.5],
            'Personal Loan' => ['min' => 7.0, 'max' => 15.0],
            'Medical Debt' => ['min' => 0.0, 'max' => 5.0],
            'Tax Debt' => ['min' => 3.0, 'max' => 5.0],
        ];
        
        // Define payment frequencies
        $frequencies = ['weekly', 'biweekly', 'monthly', 'quarterly', 'annually'];
        
        // Define date ranges for realistic due dates
        $currentDate = Carbon::now();
        $pastDueDate = $currentDate->copy()->subDays(15);
        $futureDueDate = $currentDate->copy()->addMonths(2);
        
        foreach ($users as $user) {
            // Create 3-7 debts for each user with varied statuses
            $debtCount = fake()->numberBetween(3, 7);
            
            // Create at least one high-interest debt (credit card)
            Creditor::factory()->create([
                'user_id' => $user->id,
                'name' => 'Credit Card Debt',
                'description' => 'High interest credit card debt',
                'amount_owed' => fake()->randomFloat(2, 1000, 10000),
                'interest_rate' => fake()->randomFloat(2, 15.0, 25.99),
                'due_date' => fake()->dateTimeBetween($pastDueDate, $futureDueDate),
                'payment_frequency' => 'monthly',
                'minimum_payment' => fake()->randomFloat(2, 35, 200),
                'contact_info' => 'support@creditcard.com',
                'status' => fake()->randomElement(['active', 'active', 'active', 'paid']),
            ]);
            
            // Create 2-6 other varied debts
            for ($i = 1; $i < $debtCount; $i++) {
                $debtType = array_rand($creditorTypes);
                $rateRange = $creditorTypes[$debtType];
                $amount = fake()->randomFloat(2, 500, 50000);
                $status = fake()->randomElement(['active', 'active', 'active', 'paid', 'defaulted']);
                
                // Calculate a reasonable minimum payment (typically 1-3% of balance for loans)
                $minPaymentPercent = fake()->randomFloat(2, 1.0, 3.0) / 100;
                $minPayment = max(25, $amount * $minPaymentPercent);
                
                Creditor::factory()->create([
                    'user_id' => $user->id,
                    'name' => $debtType . ' ' . ($i),
                    'description' => 'Debt for ' . $debtType,
                    'amount_owed' => $amount,
                    'interest_rate' => fake()->randomFloat(2, $rateRange['min'], $rateRange['max']),
                    'due_date' => fake()->dateTimeBetween($pastDueDate, $futureDueDate),
                    'payment_frequency' => fake()->randomElement($frequencies),
                    'minimum_payment' => $minPayment,
                    'contact_info' => 'support@' . strtolower(str_replace(' ', '', $debtType)) . '.com',
                    'status' => $status,
                ]);
            }
        }
    }
}