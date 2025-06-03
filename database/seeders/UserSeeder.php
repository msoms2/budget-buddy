<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Use firstOrCreate to avoid duplicate admin user errors
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name'              => 'Admin User',
                'password'          => bcrypt('password'), // or some default password
                'email_verified_at' => now(),
            ]
        );

        // Reduce from 8 to just 2 additional test users
        User::factory()
            ->count(2)
            ->create();
    }
}