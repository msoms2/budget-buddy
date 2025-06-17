<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Creates the investments table with all necessary columns and relationships.
     * Includes tracking of investment details, amounts, and dates.
     */
    public function up()
    {
        Schema::create('investments', function (Blueprint $table) {
            // Primary key
            $table->id();
            
            // Foreign keys
            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade')
                ->comment('Reference to user who owns this investment');
                
            $table->foreignId('investment_category_id')
                ->constrained('investment_categories')
                ->onDelete('restrict')
                ->comment('Reference to investment category');
                
            $table->foreignId('currency_id')
                ->constrained('currencies')
                ->onDelete('restrict')
                ->comment('Reference to currency of the investment');
            
            // Basic investment information
            $table->string('name')
                ->comment('Name of the investment');
            $table->string('symbol')
                ->nullable()
                ->comment('Investment symbol/ticker if applicable');
            $table->text('description')
                ->nullable()
                ->comment('Detailed description of the investment');
            
            // Financial details
            $table->decimal('initial_amount', 15, 2)
                ->comment('Initial investment amount');
            $table->decimal('current_amount', 15, 2)
                ->comment('Current value of the investment');
            
            // Status and dates
            $table->string('status')
                ->default('active')
                ->comment('Current status of the investment');
            $table->date('purchase_date')
                ->comment('Date when investment was purchased');
            
            // Additional information
            $table->text('notes')
                ->nullable()
                ->comment('Additional notes about the investment');
            
            // Timestamps
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('investments');
    }
};