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
        Schema::table('earnings', function (Blueprint $table) {
            if (!Schema::hasColumn('earnings', 'currency_id')) {
                $table->foreignId('currency_id')->nullable()->constrained('currencies')->after('user_id');
            }
            if (!Schema::hasColumn('earnings', 'original_amount')) {
                $table->decimal('original_amount', 15, 4)->nullable()->after('amount');
            }
            if (!Schema::hasColumn('earnings', 'exchange_rate')) {
                $table->decimal('exchange_rate', 15, 6)->nullable()->after('original_amount');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('earnings', function (Blueprint $table) {
            if (Schema::hasColumn('earnings', 'currency_id')) {
                $table->dropForeign(['currency_id']);
                $table->dropColumn('currency_id');
            }
            if (Schema::hasColumn('earnings', 'original_amount')) {
                $table->dropColumn('original_amount');
            }
            if (Schema::hasColumn('earnings', 'exchange_rate')) {
                $table->dropColumn('exchange_rate');
            }
        });
    }
};
