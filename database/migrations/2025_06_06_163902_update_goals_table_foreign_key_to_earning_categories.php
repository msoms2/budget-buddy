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
        // Update existing goals to have no category since they were linked to expense categories
        // and we're now switching to income categories
        DB::table('goals')->whereNotNull('category_id')->update(['category_id' => null]);
        
        Schema::table('goals', function (Blueprint $table) {
            // First drop the existing foreign key constraint to expense_categories
            $table->dropForeign(['category_id']);
            
            // Add the new foreign key constraint to earning_categories
            $table->foreign('category_id')->references('id')->on('earning_categories')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('goals', function (Blueprint $table) {
            // Drop the earning_categories foreign key
            $table->dropForeign(['category_id']);
            
            // Restore the original foreign key constraint to expense_categories
            $table->foreign('category_id')->references('id')->on('expense_categories')->onDelete('set null');
        });
    }
};
