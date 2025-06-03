<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Goal;
use App\Models\Currency;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adds currency_id field to goals table and sets default currency for existing goals
     */
    public function up(): void
    {
        Schema::table('goals', function (Blueprint $table) {
            $table->foreignId('currency_id')
                ->nullable()
                ->after('user_id')
                ->constrained('currencies')
                ->onDelete('restrict');
        });

        // Set default currency for existing goals based on user's currency
        $goals = Goal::with('user')->whereNull('currency_id')->get();
        
        foreach ($goals as $goal) {
            if ($goal->user && $goal->user->currency_id) {
                $goal->currency_id = $goal->user->currency_id;
                $goal->save();
            } else {
                // Fallback to system default currency
                $defaultCurrency = Currency::where('is_default', true)->first()
                    ?? Currency::where('code', 'USD')->first()
                    ?? Currency::first();
                
                if ($defaultCurrency) {
                    $goal->currency_id = $defaultCurrency->id;
                    $goal->save();
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('goals', function (Blueprint $table) {
            $table->dropForeign(['currency_id']);
            $table->dropColumn('currency_id');
        });
    }
};
