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
        Schema::table('expenses', function (Blueprint $table) {
            $table->decimal('original_amount', 15, 4)->nullable()->after('amount');
            $table->decimal('exchange_rate', 10, 6)->default(1.0)->after('original_amount');
        });

        Schema::table('earnings', function (Blueprint $table) {
            $table->decimal('original_amount', 15, 4)->nullable()->after('amount');
            $table->decimal('exchange_rate', 10, 6)->default(1.0)->after('original_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn(['original_amount', 'exchange_rate']);
        });

        Schema::table('earnings', function (Blueprint $table) {
            $table->dropColumn(['original_amount', 'exchange_rate']);
        });
    }
};