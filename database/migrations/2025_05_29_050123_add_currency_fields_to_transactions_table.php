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
        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('currency_id')->nullable()->constrained('currencies')->after('user_id');
            $table->decimal('original_amount', 15, 4)->nullable()->after('amount');
            $table->decimal('exchange_rate', 15, 6)->nullable()->after('original_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['currency_id']);
            $table->dropColumn(['currency_id', 'original_amount', 'exchange_rate']);
        });
    }
};
