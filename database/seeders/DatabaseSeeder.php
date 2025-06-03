<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Currency;
use App\Models\PaymentMethod;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Check if we already have currencies
        if (Currency::count() === 0) {
            // Create default currencies only if none exist
            Currency::create([
                'code' => 'USD',
                'name' => 'US Dollar',
                'symbol' => '$',
                'exchange_rate' => 1.00,
                'format' => '$%s',
                'decimal_places' => 2,
                'is_default' => true,
            ]);

            Currency::create([
                'code' => 'EUR',
                'name' => 'Euro',
                'symbol' => '€',
                'exchange_rate' => 0.92,
                'format' => '€%s',
                'decimal_places' => 2,
                'is_default' => false,
            ]);

            Currency::create([
                'code' => 'GBP',
                'name' => 'British Pound',
                'symbol' => '£',
                'exchange_rate' => 0.79,
                'format' => '£%s',
                'decimal_places' => 2,
                'is_default' => false,
            ]);
        }

        // Get default currency
        $defaultCurrency = Currency::where('is_default', true)->first();

        // Check if we already have an admin user
        $admin = User::where('email', 'admin@example.com')->first();
        
        // Create admin user if not exists
        if (!$admin) {
            $admin = User::factory()->create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'currency_id' => $defaultCurrency->id,
            ]);
        }

        // Check if payment methods already exist
        if (PaymentMethod::count() === 0) {
            // Create payment methods
            $paymentMethods = [
                'Cash'          => 'Physical currency transactions',
                'Credit Card'   => 'Credit card payments',
                'Debit Card'    => 'Direct bank card payments',
                'Bank Transfer' => 'Direct bank to bank transfers',
                'PayPal'        => 'PayPal digital payments',
                'Mobile Payment'=> 'Digital wallet and mobile payment apps',
            ];

            foreach ($paymentMethods as $name => $description) {
                PaymentMethod::factory()
                    ->active()
                    ->withName($name)
                    ->create([
                        'description' => $description,
                        'user_id' => $admin->id,
                    ]);
            }
        }

        // Run other seeders in proper order
        $this->call([
            CountrySeeder::class,                // Add countries before users
            UserSeeder::class,
            RoleSeeder::class,
            CategorySeeder::class,
            FinancialDataSeeder::class,
            InvestmentSeeder::class,
            InvestmentPerformanceSeeder::class,  // Add investment performance logs
            CreditorSeeder::class,               // Add creditor data
            PaymentScheduleSeeder::class,        // Add payment schedules
            GoalSeeder::class,
        ]);
    }
}
