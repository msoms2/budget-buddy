<?php

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
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('amount', 10, 2);
            $table->string('period')->default('monthly'); // monthly, weekly, yearly
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->date('next_renewal_date')->nullable();
            $table->foreignId('category_id')->nullable()->constrained('expense_categories')->nullOnDelete();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('notes')->nullable();
            // Rollover budget features
            $table->boolean('rollover_enabled')->default(false);
            $table->decimal('rollover_amount', 10, 2)->default(0);
            $table->decimal('rollover_cap', 10, 2)->nullable();
            // Advanced budget features
            $table->string('budget_method')->default('standard'); // standard, 50-30-20, zero-based
            $table->json('method_settings')->nullable(); // For storing method-specific settings
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};