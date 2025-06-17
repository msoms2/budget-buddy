<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migration to create the income_analyses table.
     * This table stores detailed income analysis data for users including
     * stability assessments, forecasting, and risk metrics.
     */
    public function up()
    {
        Schema::create('income_analyses', function (Blueprint $table) {
            // Primary key
            $table->id();
            
            // Foreign key to users table
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade');
            
            // Core analysis fields
            $table->timestamp('analysis_date')
                  ->comment('Date when the income analysis was performed');
            $table->decimal('total_income', 15, 2)
                  ->comment('Total income amount for the analysis period');
            
            // Analysis metrics
            $table->integer('stability_score')
                  ->comment('Income stability score (0-100)');
            $table->decimal('growth_rate', 8, 4)
                  ->comment('Calculated income growth rate as decimal');
            $table->integer('risk_assessment')
                  ->comment('Overall risk assessment score (0-100)');
            $table->integer('seasonality_impact')
                  ->comment('Impact of seasonal variations (0-100)');
            
            // JSON data fields
            $table->json('income_sources')
                  ->comment('Detailed breakdown of income sources and their contributions');
            $table->json('stability_factors')
                  ->comment('Factors contributing to income stability assessment');
            $table->json('forecast_data')
                  ->comment('Income forecasting data and predictions');
            
            // Timestamps for record keeping
            $table->timestamps();

            // Index common query fields
            $table->index(['user_id', 'analysis_date']);
            $table->index('analysis_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('income_analyses');
    }
};