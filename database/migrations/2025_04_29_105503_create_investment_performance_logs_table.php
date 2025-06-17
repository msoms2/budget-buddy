<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('investment_performance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('investment_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->decimal('current_value', 15, 2);
            $table->decimal('unrealized_gain', 15, 2);
            $table->decimal('realized_gain', 15, 2)->default(0);
            $table->decimal('total_return_percentage', 8, 4);
            $table->timestamps();

            $table->index(['investment_id', 'date']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('investment_performance_logs');
    }
};