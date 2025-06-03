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
        Schema::table('budgets', function (Blueprint $table) {
            $table->string('time_frame')->default('1_month')->after('period'); // 1_week, 1_month, 3_months, 6_months, 1_year, 2_years, custom
            $table->integer('time_frame_value')->nullable()->after('time_frame'); // For custom time frames
            $table->string('time_frame_unit')->nullable()->after('time_frame_value'); // days, weeks, months, years for custom
            $table->date('overall_end_date')->nullable()->after('end_date'); // The final end date considering time frame
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->dropColumn(['time_frame', 'time_frame_value', 'time_frame_unit', 'overall_end_date']);
        });
    }
};
