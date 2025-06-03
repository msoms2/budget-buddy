<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('earnings', function (Blueprint $table) {
            // First copy any sum values to amount where amount is null
            DB::statement('UPDATE earnings SET amount = sum WHERE amount IS NULL');
            
            // Drop the redundant sum column
            $table->dropColumn('sum');
            
            // Add currency_id foreign key if it doesn't exist
            if (!Schema::hasColumn('earnings', 'currency_id')) {
                $table->foreignId('currency_id')->nullable()->constrained()->onDelete('set null');
            }
            
            // Ensure amount is required and has proper constraints
            $table->decimal('amount', 10, 2)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('earnings', function (Blueprint $table) {
            // Recreate the sum column
            $table->decimal('sum', 10, 2)->after('amount');
            
            // Copy amount values to sum
            DB::statement('UPDATE earnings SET sum = amount');
            
            // Remove currency_id foreign key if we added it
            if (Schema::hasColumn('earnings', 'currency_id')) {
                $table->dropForeign(['currency_id']);
                $table->dropColumn('currency_id');
            }
        });
    }
};