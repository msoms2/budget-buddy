<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Currency;
use App\Models\PaymentMethod;
use App\Models\User;

class CurrencyAndPaymentSeeder extends Seeder
{
    public function run(): void
    {
        // Skip currency creation as it's already handled by CurrencySeeder
        // Just ensure we have the needed currencies by checking if they exist
        
        // Find or create admin user for payment methods
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        // Create common payment methods
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
}