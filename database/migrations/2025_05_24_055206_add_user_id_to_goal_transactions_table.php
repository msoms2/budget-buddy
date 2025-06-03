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
        // First check if the column exists
        if (!Schema::hasColumn('goal_transactions', 'user_id')) {
            // Add the user_id column as nullable with foreign key constraint
            Schema::table('goal_transactions', function (Blueprint $table) {
                $table->foreignId('user_id')->after('goal_id')->nullable()->constrained()->nullOnDelete();
            });

            // Update existing records with user_id from goals table
            DB::statement('UPDATE goal_transactions SET user_id = (SELECT goals.user_id FROM goals WHERE goal_transactions.goal_id = goals.id)');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('goal_transactions', 'user_id')) {
            Schema::table('goal_transactions', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            });
        }
    }
};
