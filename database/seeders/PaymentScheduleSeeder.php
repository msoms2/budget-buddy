<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\PaymentSchedule;
use App\Models\ExpenseCategory;
use App\Models\Currency;
use App\Models\PaymentMethod;
use Carbon\Carbon;

class PaymentScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $currencies = Currency::all();
        $paymentMethods = PaymentMethod::all();
        
        // Define common bill types
        $commonBills = [
            'Rent' => ['min' => 800, 'max' => 3000, 'type' => 'expense', 'recurring' => true],
            'Mortgage' => ['min' => 1000, 'max' => 3500, 'type' => 'expense', 'recurring' => true],
            'Electricity' => ['min' => 50, 'max' => 300, 'type' => 'expense', 'recurring' => true],
            'Water' => ['min' => 30, 'max' => 150, 'type' => 'expense', 'recurring' => true],
            'Internet' => ['min' => 40, 'max' => 120, 'type' => 'expense', 'recurring' => true],
            'Phone Bill' => ['min' => 50, 'max' => 150, 'type' => 'expense', 'recurring' => true],
            'Car Insurance' => ['min' => 80, 'max' => 300, 'type' => 'expense', 'recurring' => true],
            'Health Insurance' => ['min' => 150, 'max' => 600, 'type' => 'expense', 'recurring' => true],
            'Gym Membership' => ['min' => 20, 'max' => 100, 'type' => 'expense', 'recurring' => true],
            'Streaming Services' => ['min' => 10, 'max' => 50, 'type' => 'expense', 'recurring' => true],
            'Freelance Payment' => ['min' => 500, 'max' => 5000, 'type' => 'income', 'recurring' => false],
            'Dividend Payment' => ['min' => 50, 'max' => 500, 'type' => 'income', 'recurring' => true],
            'Rental Income' => ['min' => 800, 'max' => 2500, 'type' => 'income', 'recurring' => true],
            'Side Gig' => ['min' => 200, 'max' => 1000, 'type' => 'income', 'recurring' => false],
        ];
        
        // Define payment frequencies
        $frequencies = [
            'weekly' => ['days' => 7, 'end_months' => 3],
            'biweekly' => ['days' => 14, 'end_months' => 6],
            'monthly' => ['days' => 30, 'end_months' => 12],
            'quarterly' => ['days' => 90, 'end_months' => 24],
            'annually' => ['days' => 365, 'end_months' => 36],
        ];
        
        // Define date ranges for realistic schedules
        $now = Carbon::now();
        $pastDue = $now->copy()->subDays(15);
        $futureDue = $now->copy()->addMonths(2);
        
        foreach ($users as $user) {
            // Get user's expense categories for proper categorization
            $expenseCategories = ExpenseCategory::where('user_id', $user->id)->get();
            
            // Generate 8-15 payment schedules per user with various statuses
            $scheduleCount = fake()->numberBetween(8, 15);
            
            for ($i = 0; $i < $scheduleCount; $i++) {
                // Select a random bill type
                $billType = array_rand($commonBills);
                $billDetails = $commonBills[$billType];
                
                // Determine if this is recurring and its frequency
                $isRecurring = $billDetails['recurring'] && fake()->boolean(80); // 80% chance to follow recurring pattern
                $frequency = $isRecurring ? array_rand($frequencies) : null;
                $frequencyDetails = $frequencies[$frequency] ?? null;
                
                // Calculate due date - mix of past due, imminent, and future
                $dueType = fake()->randomElement(['past_due', 'imminent', 'future']);
                $dueDate = match($dueType) {
                    'past_due' => fake()->dateTimeBetween($pastDue, $now),
                    'imminent' => fake()->dateTimeBetween($now, $now->copy()->addDays(7)),
                    'future' => fake()->dateTimeBetween($now->copy()->addDays(8), $futureDue),
                };
                
                // Set reminder date a few days before due date (if in future)
                $reminderDate = Carbon::parse($dueDate)->copy()->subDays(fake()->numberBetween(2, 5));
                if ($reminderDate->isPast()) {
                    $reminderDate = null;
                }
                
                // Set recurring end date if applicable
                $recurringEndDate = $isRecurring && $frequencyDetails 
                    ? Carbon::parse($dueDate)->copy()->addMonths($frequencyDetails['end_months'])
                    : null;
                
                // Find appropriate category for the bill type
                $category = null;
                $categoryKeywords = explode(' ', $billType);
                foreach ($expenseCategories as $cat) {
                    foreach ($categoryKeywords as $keyword) {
                        if (stripos($cat->name, $keyword) !== false) {
                            $category = $cat;
                            break 2;
                        }
                    }
                }
                
                // Determine the status of the payment schedule
                $status = 'pending';
                if (Carbon::parse($dueDate)->isPast()) {
                    $status = fake()->randomElement(['pending', 'pending', 'completed', 'cancelled']);
                }
                
                // Create the payment schedule
                PaymentSchedule::create([
                    'user_id' => $user->id,
                    'name' => $billType,
                    'description' => 'Payment for ' . $billType,
                    'amount' => fake()->randomFloat(2, $billDetails['min'], $billDetails['max']),
                    'due_date' => $dueDate,
                    'reminder_date' => $reminderDate,
                    'type' => $billDetails['type'],
                    'category_id' => $category ? $category->id : null,
                    'subcategory_id' => null, // Let's not worry about subcategories for seeding
                    'payment_method_id' => $paymentMethods->random()->id,
                    'currency_id' => $currencies->firstWhere('code', 'USD')->id,
                    'recipient' => fake()->company,
                    'status' => $status,
                    'is_recurring' => $isRecurring,
                    'frequency' => $frequency,
                    'recurring_end_date' => $recurringEndDate,
                    'auto_process' => fake()->boolean(30), // 30% are auto-processed
                ]);
            }
        }
    }
}