<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates the currencies table that stores currency information including:
     * - Basic currency details (code, name, symbol)
     * - Exchange rate relative to base currency
     * - Format pattern for displaying amounts
     * - Number of decimal places for the currency
     * - Default currency flag
     */
    public function up(): void
    {
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
            $table->string('code');                                // Currency code (e.g., USD, EUR)
            $table->string('name');                               // Currency name (e.g., US Dollar)
            $table->string('symbol');                             // Currency symbol (e.g., $, €)
            $table->decimal('exchange_rate', 10, 4);              // Exchange rate relative to base currency
            $table->string('format');                             // Currency format pattern (e.g., "$#,##0.00")
            $table->integer('decimal_places');                    // Number of decimal places for the currency
            $table->boolean('is_default')->default(false);        // Indicates if this is the default currency
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};