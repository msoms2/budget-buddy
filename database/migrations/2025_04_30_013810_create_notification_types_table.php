<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('notification_types', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('description');
            $table->timestamps();
        });

        // Seed initial notification types
        DB::table('notification_types')->insert([
            [
                'slug' => 'bill_payment_reminder',
                'name' => 'Bill Payment Reminder',
                'description' => 'Reminds users about upcoming bill payments',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'budget_limit_alert',
                'name' => 'Budget Limit Alert',
                'description' => 'Alerts users when they are approaching their budget limits',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'goal_progress_update',
                'name' => 'Goal Progress Update',
                'description' => 'Updates users on their progress towards financial goals',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_types');
    }
};