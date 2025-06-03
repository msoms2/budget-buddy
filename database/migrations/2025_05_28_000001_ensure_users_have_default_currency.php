<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Currency;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Ensures all users have a default currency set.
     * For users without a currency, assigns the system default or USD as fallback.
     */
    public function up(): void
    {
        // Find users without a currency_id
        $usersWithoutCurrency = User::whereNull('currency_id')->get();
        
        if ($usersWithoutCurrency->count() > 0) {
            // Get system default currency or fallback
            $defaultCurrency = Currency::where('is_default', true)->first()
                ?? Currency::where('code', 'USD')->first()
                ?? Currency::where('code', 'EUR')->first()
                ?? Currency::first();
                
            if ($defaultCurrency) {
                // Update users without currency to use the default
                User::whereNull('currency_id')->update([
                    'currency_id' => $defaultCurrency->id
                ]);
                
                \Log::info("Set default currency {$defaultCurrency->code} for {$usersWithoutCurrency->count()} users");
            } else {
                \Log::warning('No currencies found in system - cannot set default for users');
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration doesn't need to be reversible as it's just ensuring data integrity
    }
};
