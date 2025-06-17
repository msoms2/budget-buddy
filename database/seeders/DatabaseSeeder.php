<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run seeders in proper dependency order
        $this->command->info('Starting seeding process...');
        
        // Base data
        $this->command->info('Seeding currencies...');
        $this->call(CurrencySeeder::class);
        
        $this->command->info('Seeding countries...');
        $this->call(CountrySeeder::class);
        
        $this->command->info('Seeding users...');
        $this->call(UserSeeder::class); // This provides admin user needed by other seeders
        
        $this->command->info('Seeding roles...');
        $this->call(RoleSeeder::class);
        
        // Categories and types
        $this->command->info('Seeding categories...');
        $this->call(CategorySeeder::class); // This should now successfully run
        
        $this->command->info('Seeding savings categories...');
        $this->call(SavingsCategorySeeder::class);
        
        $this->command->info('Seeding notification types...');
        $this->call(NotificationTypeSeeder::class);
        
        $this->command->info('Seeding currency and payment methods...');
        $this->call(CurrencyAndPaymentSeeder::class);
        
        // Financial data
        $this->command->info('Seeding financial data...');
        $this->call(TempFinancialDataSeeder::class); // Using optimized version to prevent hanging
        
        $this->command->info('Seeding creditors...');
        $this->call(CreditorSeeder::class);
        
        $this->command->info('Seeding goals...');
        $this->call(GoalSeeder::class);
        
        $this->command->info('Seeding investments...');
        $this->call(InvestmentSeeder::class);
        
        $this->command->info('Seeding investment performance...');
        $this->call(InvestmentPerformanceSeeder::class);
        
        $this->command->info('Seeding payment schedules...');
        $this->call(PaymentScheduleSeeder::class);
        
        $this->command->info('Database seeding completed successfully!');
        
        // Additional test data if needed
        // $this->call(IncomeTestDataSeeder::class); // Uncomment if you need test income data
    }
}