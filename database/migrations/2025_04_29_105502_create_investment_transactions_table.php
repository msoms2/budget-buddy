<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('investment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('investment_id')->constrained()->onDelete('cascade');
            $table->string('transaction_type');  // buy, sell, dividend, etc.
            $table->date('date');
            $table->decimal('quantity', 15, 6);
            $table->decimal('price_per_unit', 15, 2);
            $table->decimal('total_amount', 15, 2);
            $table->decimal('fees', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['investment_id', 'date']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('investment_transactions');
    }
};