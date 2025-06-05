<?php

namespace Database\Seeders;

use App\Models\SavingsCategory;
use App\Models\User;
use Illuminate\Database\Seeder;

class SavingsCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get admin user or create if doesn't exist
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        $systemCategories = [
            [
                'name' => 'Emergency Fund',
                'description' => 'Money set aside for unexpected expenses',
                'icon' => '🚨',
                'icon_color' => '#EF4444',
                'bg_color' => '#FEF2F2',
                'is_system' => true,
                'user_id' => $admin->id,
            ],
            [
                'name' => 'Retirement',
                'description' => 'Long-term savings for retirement',
                'icon' => '👴',
                'icon_color' => '#8B5CF6',
                'bg_color' => '#F5F3FF',
                'is_system' => true,
                'user_id' => $admin->id,
            ],
            [
                'name' => 'Home Purchase',
                'description' => 'Savings for buying a home',
                'icon' => '🏠',
                'icon_color' => '#10B981',
                'bg_color' => '#ECFDF5',
                'is_system' => true,
                'user_id' => $admin->id,
            ],
            [
                'name' => 'Travel',
                'description' => 'Vacation and travel funds',
                'icon' => '✈️',
                'icon_color' => '#3B82F6',
                'bg_color' => '#EFF6FF',
                'is_system' => true,
                'user_id' => $admin->id,
            ],
            [
                'name' => 'Education',
                'description' => 'Savings for education and courses',
                'icon' => '📚',
                'icon_color' => '#F59E0B',
                'bg_color' => '#FEF3C7',
                'is_system' => true,
                'user_id' => $admin->id,
            ],
            [
                'name' => 'Vehicle',
                'description' => 'Savings for vehicle purchase or maintenance',
                'icon' => '🚗',
                'icon_color' => '#6B7280',
                'bg_color' => '#F3F4F6',
                'is_system' => true,
                'user_id' => $admin->id,
            ],
            [
                'name' => 'Major Purchase',
                'description' => 'Savings for significant planned expenses',
                'icon' => '🛍️',
                'icon_color' => '#EC4899',
                'bg_color' => '#FCE7F3',
                'is_system' => true,
                'user_id' => $admin->id,
            ],
            [
                'name' => 'Investment',
                'description' => 'Money for investment opportunities',
                'icon' => '📈',
                'icon_color' => '#059669',
                'bg_color' => '#D1FAE5',
                'is_system' => true,
                'user_id' => $admin->id,
            ],
        ];

        foreach ($systemCategories as $category) {
            SavingsCategory::firstOrCreate(
                [
                    'name' => $category['name'],
                    'is_system' => true
                ],
                $category
            );
        }
    }
}
