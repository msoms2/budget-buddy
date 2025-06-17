<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure a default currency exists
        $currency = \App\Models\Currency::firstOrCreate(
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

        // Use firstOrCreate to avoid duplicate admin user errors
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name'              => 'Admin User',
                'password'          => bcrypt('password'), // or some default password
                'email_verified_at' => now(),
                'currency_id'       => $currency->id,
            ]
        );

        // Reduce from 8 to just 2 additional test users
        User::factory()
            ->count(2)
            ->create(['currency_id' => $currency->id]);
    }
}