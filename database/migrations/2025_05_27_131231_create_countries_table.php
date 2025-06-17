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
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->string('name');                // Full country name
            $table->string('code', 2);             // ISO 3166-1 alpha-2 code
            $table->string('currency_code', 3);    // ISO 4217 currency code
            $table->foreignId('currency_id')->nullable()->constrained('currencies')->onDelete('set null');
            $table->string('flag_emoji')->nullable(); // Unicode flag emoji
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->unique('code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('countries');
    }
};
