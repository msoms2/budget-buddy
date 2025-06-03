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
        // Create main currencies with specific rates
        Currency::factory()->usd()->create(); // Base currency with rate 1.0
        Currency::factory()->eur()->create(); // EUR with defined rate
        
        Currency::factory()->create([ // GBP
            'code'          => 'GBP',
            'name'          => 'British Pound',
            'symbol'        => '£',
            'exchange_rate' => 1.25, // Example rate relative to USD
        ]);

        // Find or create admin user for payment methods
        $admin = User::where('email', 'admin@example.com')->first();

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