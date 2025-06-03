<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Currency;

class CheckCurrencies extends Command
{
    protected $signature = 'currencies:check';
    protected $description = 'Check the currencies table and seed if necessary';

    public function handle()
    {
        $this->info('Checking currencies...');

        // Count existing currencies
        $count = Currency::count();
        $this->info("Found {$count} currencies");

        if ($count === 0) {
            $this->info('No currencies found. Creating default currencies...');
            
            // Create USD as default
            Currency::create([
                'code' => 'USD',
                'name' => 'US Dollar',
                'symbol' => '$',
                'exchange_rate' => 1.00,
                'format' => '$%s',
                'decimal_places' => 2,
                'is_default' => true,
            ]);
            
            // Create EUR
            Currency::create([
                'code' => 'EUR',
                'name' => 'Euro',
                'symbol' => '€',
                'exchange_rate' => 0.92,
                'format' => '€%s',
                'decimal_places' => 2,
                'is_default' => false,
            ]);
            
            // Create GBP
            Currency::create([
                'code' => 'GBP',
                'name' => 'British Pound',
                'symbol' => '£',
                'exchange_rate' => 0.79,
                'format' => '£%s',
                'decimal_places' => 2,
                'is_default' => false,
            ]);
            
            $this->info('Created default currencies');
        }
        
        // Check if we have a default currency
        $default = Currency::where('is_default', true)->first();
        
        if (!$default) {
            $this->info('No default currency found. Setting USD as default...');
            
            // Try to find USD
            $usd = Currency::where('code', 'USD')->first();
            
            if ($usd) {
                $usd->is_default = true;
                $usd->save();
                $this->info('Set USD as default currency');
            } else {
                $this->error('Could not find USD currency to set as default');
            }
        } else {
            $this->info("Default currency is: {$default->code}");
        }

        // Show all currencies
        $this->table(
            ['ID', 'Code', 'Name', 'Exchange Rate', 'Is Default'],
            Currency::get()->map(function ($currency) {
                return [
                    $currency->id,
                    $currency->code,
                    $currency->name,
                    $currency->exchange_rate,
                    $currency->is_default ? 'Yes' : 'No',
                ];
            })
        );
    }
}
