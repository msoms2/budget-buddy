<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('savings_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('savings_id')->constrained('savings')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->text('description')->nullable();
            $table->date('transaction_date');
            $table->enum('type', ['deposit', 'withdrawal', 'adjustment'])->default('deposit');
            $table->timestamps();

            // Add indexes for better performance
            $table->index(['savings_id', 'transaction_date']);
            $table->index(['user_id', 'transaction_date']);
            $table->index(['savings_id', 'type']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('savings_transactions');
    }
};