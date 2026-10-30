<?php

namespace Database\Seeders;

use App\Models\Country;
use App\Models\ExpenseCategory;
use Illuminate\Database\Seeder;

class ProductionSeeder extends Seeder
{
    /**
     * Seed core reference data required for production (idempotent, no Faker dependency).
     */
    public function run(): void
    {
        if (
            !env('FORCE_PRODUCTION_SEED', false)
            && Country::count() >= 15
            && ExpenseCategory::where('is_system', true)->exists()
        ) {
            return;
        }

        $this->call(CurrencySeeder::class);
        $this->call(CountrySeeder::class);
        $this->call(RoleSeeder::class);
        $this->call(CategorySeeder::class);
        $this->call(SavingsCategorySeeder::class);
        $this->call(NotificationTypeSeeder::class);
        $this->call(CurrencyAndPaymentSeeder::class);
    }
}
