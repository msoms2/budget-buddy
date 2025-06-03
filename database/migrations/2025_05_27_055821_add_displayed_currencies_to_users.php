<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;


return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('displayed_currencies')->nullable()->after('currency_id');
        });

        // Set all currencies as displayed by default for existing users
        try {
            // Fetch currency codes instead of IDs
            $currencyCodes = DB::table('currencies')->pluck('code')->toArray();
            DB::table('users')->whereNotNull('id')->update([
                'displayed_currencies' => json_encode($currencyCodes)
            ]);
        } catch (\Exception $e) {
            // Log error but don't fail migration
            \Log::error('Failed to set default displayed currencies: ' . $e->getMessage());
        }
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('displayed_currencies');
        });
    }
};