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
        Schema::create('earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained('earning_categories')->onDelete('cascade');
            $table->foreignId('currency_id')->constrained()->onDelete('restrict');
            $table->foreignId('payment_method_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('sum', 10, 2);
            $table->decimal('amount', 10, 2); // Added amount column directly
            $table->timestamp('date')->useCurrent();
            // Income analysis fields
            $table->string('source')->nullable();
            $table->string('source_type')->nullable();
            $table->boolean('is_recurring')->default(false);
            $table->enum('frequency', ['monthly', 'weekly', 'yearly', 'one-time'])->default('one-time');
            $table->decimal('confidence_score', 5, 2)->nullable();
            $table->decimal('stability_score', 5, 2)->nullable();
            $table->boolean('is_passive')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('earnings');
    }
};