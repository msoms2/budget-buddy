<?php
// This is a migration to update the decimal precision for exchange rates in expenses and earnings tables

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update expenses table to increase precision for exchange_rate
        Schema::table('expenses', function (Blueprint $table) {
            // Modify exchange_rate column to support larger values
            $table->decimal('exchange_rate', 20, 6)->nullable()->change();
        });

        // Update earnings table to increase precision for exchange_rate
        Schema::table('earnings', function (Blueprint $table) {
            // Modify exchange_rate column to support larger values
            $table->decimal('exchange_rate', 20, 6)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert expenses table back to original precision
        Schema::table('expenses', function (Blueprint $table) {
            $table->decimal('exchange_rate', 15, 6)->nullable()->change();
        });

        // Revert earnings table back to original precision
        Schema::table('earnings', function (Blueprint $table) {
            $table->decimal('exchange_rate', 15, 6)->nullable()->change();
        });
    }
};
