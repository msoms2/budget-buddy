<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * This migration fixes the foreign key constraint for subcategory_id in expenses table
     * to point to expense_categories instead of sub_categories
     */
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            // Drop the existing foreign key constraint
            $table->dropForeign(['subcategory_id']);
            
            // Add the correct foreign key constraint pointing to expense_categories table
            $table->foreign('subcategory_id')
                  ->references('id')
                  ->on('expense_categories')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            // Drop the new foreign key constraint
            $table->dropForeign(['subcategory_id']);
            
            // Restore the original foreign key constraint pointing to sub_categories table
            $table->foreign('subcategory_id')
                  ->references('id')
                  ->on('sub_categories')
                  ->onDelete('set null');
        });
    }
};
