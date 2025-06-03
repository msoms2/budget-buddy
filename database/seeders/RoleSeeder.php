<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Create roles with descriptions
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin'],
            ['description' => 'Full system access with administrative privileges. Can manage users, view all data, and configure system settings.']
        );
        
        Role::firstOrCreate(
            ['name' => 'user'],
            ['description' => 'Standard user access for managing personal financial data, transactions, goals, and budgets.']
        );
        
        Role::firstOrCreate(
            ['name' => 'manager'],
            ['description' => 'Enhanced user access with team management capabilities and reporting features.']
        );
        
        Role::firstOrCreate(
            ['name' => 'viewer'],
            ['description' => 'Read-only access to view financial data and reports without modification privileges.']
        );
        
        // Assign admin role to admin user
        $adminUser = User::where('email', 'admin@example.com')->first();
        if ($adminUser) {
            $adminUser->roles()->sync([$adminRole->id]);
        }
    }
}