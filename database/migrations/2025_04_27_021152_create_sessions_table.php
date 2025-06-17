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
        // Only try to create the table if it doesn't exist already
        if (!Schema::hasTable('sessions')) {
            Schema::create('sessions', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->foreignId('user_id')->nullable()->index();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->text('payload');
                $table->integer('last_activity')->index();
            });
        } else {
            // Table exists, check if payload column exists and add it if missing
            Schema::table('sessions', function (Blueprint $table) {
                if (!Schema::hasColumn('sessions', 'payload')) {
                    $table->text('payload');
                }
                
                // Make sure other expected columns exist too
                if (!Schema::hasColumn('sessions', 'user_id')) {
                    $table->foreignId('user_id')->nullable()->index();
                }
                if (!Schema::hasColumn('sessions', 'ip_address')) {
                    $table->string('ip_address', 45)->nullable();
                }
                if (!Schema::hasColumn('sessions', 'user_agent')) {
                    $table->text('user_agent')->nullable();
                }
                if (!Schema::hasColumn('sessions', 'last_activity')) {
                    $table->integer('last_activity')->index();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }
};