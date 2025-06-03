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
        // First step: Add the column
        Schema::table('earnings', function (Blueprint $table) {
            // Check if sum column exists before adding it
            if (!Schema::hasColumn('earnings', 'sum')) {
                $table->decimal('sum', 10, 2)->after('description')->nullable();
            }
        });
        
        // Second step: Update the data (separate from the schema modification)
        if (Schema::hasColumn('earnings', 'sum')) {
            DB::statement('UPDATE earnings SET sum = amount');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('earnings', function (Blueprint $table) {
            // Only remove if column exists
            if (Schema::hasColumn('earnings', 'sum')) {
                $table->dropColumn('sum');
            }
        });
    }
};
