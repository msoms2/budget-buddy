<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration to create the investment_categories table.
 * This table stores categories for different types of investments with their risk levels.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates the investment_categories table with name, description, and risk level.
     */
    public function up()
    {
        Schema::create('investment_categories', function (Blueprint $table) {
            $table->id();                                     // Primary key
            $table->string('name');                          // Category name
            $table->text('description')->nullable();         // Optional description
            $table->string('risk_level')->default('medium'); // Risk level: low, medium, high
            $table->timestamps();                            // Created and updated timestamps
        });
    }

    /**
     * Reverse the migrations.
     * Drops the investment_categories table.
     */
    public function down()
    {
        Schema::dropIfExists('investment_categories');
    }
};