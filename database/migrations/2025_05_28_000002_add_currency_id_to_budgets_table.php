<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Budget;
use App\Models\Currency;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds currency_id field to budgets table and sets default currency for existing budgets
     */
    public function up(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->foreignId('currency_id')
                ->nullable()
                ->after('user_id')
                ->constrained('currencies')
                ->onDelete('restrict');
        });

        // Set default currency for existing budgets based on user's currency
        $budgets = Budget::with('user')->whereNull('currency_id')->get();
        
        foreach ($budgets as $budget) {
            if ($budget->user && $budget->user->currency_id) {
                $budget->currency_id = $budget->user->currency_id;
                $budget->save();
            } else {
                // Fallback to system default currency
                $defaultCurrency = Currency::where('is_default', true)->first()
                    ?? Currency::where('code', 'USD')->first()
                    ?? Currency::first();
                
                if ($defaultCurrency) {
                    $budget->currency_id = $defaultCurrency->id;
                    $budget->save();
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->dropForeign(['currency_id']);
            $table->dropColumn('currency_id');
        });
    }
};
