<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('earning_categories', function (Blueprint $table) {
            $table->boolean('is_system')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('earning_categories', function (Blueprint $table) {
            $table->dropColumn('is_system');
        });
    }
};