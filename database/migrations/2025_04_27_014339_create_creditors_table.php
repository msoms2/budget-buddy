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
        Schema::create('creditors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('amount_owed', 10, 2)->default(0);
            $table->decimal('interest_rate', 5, 2)->nullable();
            $table->date('due_date')->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('payment_frequency')->nullable(); // monthly, weekly, etc.
            $table->decimal('minimum_payment', 10, 2)->nullable();
            $table->string('contact_info')->nullable();
            $table->string('status')->default('active'); // active, paid, defaulted
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('creditors');
    }
};