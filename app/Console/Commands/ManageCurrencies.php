<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Currency;
use App\Services\ExchangeRateService;
use Illuminate\Support\Facades\Log;

class ManageCurrencies extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'currencies:manage 
                            {action : The action to perform (update-rates, list, status, add)}
                            {--currency= : Specific currency code for operations}
                            {--name= : Currency name when adding}
                            {--symbol= : Currency symbol when adding}
                            {--default : Set as default currency}
                            {--force : Force operation without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage currencies and exchange rates';

    protected ExchangeRateService $exchangeRateService;

    public function __construct(ExchangeRateService $exchangeRateService)
    {
        parent::__construct();
        $this->exchangeRateService = $exchangeRateService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action = $this->argument('action');

        try {
            switch ($action) {
                case 'update-rates':
                    return $this->updateExchangeRates();
                case 'list':
                    return $this->listCurrencies();
                case 'status':
                    return $this->showStatus();
                case 'add':
                    return $this->addCurrency();
                default:
                    $this->error("Unknown action: {$action}");
                    $this->info("Available actions: update-rates, list, status, add");
                    return 1;
            }
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
            Log::error("Currency management command failed: " . $e->getMessage());
            return 1;
        }
    }

    /**
     * Update exchange rates for currencies
     */
    protected function updateExchangeRates()
    {
        $this->info('🔄 Updating exchange rates...');
        
        $currency = $this->option('currency');
        $onlyCurrencies = $currency ? [strtoupper($currency)] : [];

        if ($currency) {
            $this->info("Updating rates only for: {$currency}");
        } else {
            $this->info("Updating rates for all currencies");
        }

        $result = $this->exchangeRateService->updateDatabaseRates($onlyCurrencies);

        if (!empty($result['updated'])) {
            $this->info("✅ Successfully updated " . count($result['updated']) . " currencies:");
            
            $headers = ['Currency', 'Old Rate', 'New Rate', 'Change %'];
            $rows = [];
            
            foreach ($result['updated'] as $update) {
                $changePercent = number_format($update['change_percent'], 2);
                $changeColor = $update['change_percent'] >= 0 ? '🟢' : '🔴';
                
                $rows[] = [
                    $update['currency'],
                    number_format($update['old_rate'], 4),
                    number_format($update['new_rate'], 4),
                    "{$changeColor} {$changePercent}%"
                ];
            }
            
            $this->table($headers, $rows);
        }

        if (!empty($result['failed'])) {
            $this->warn("⚠️ Failed to update " . count($result['failed']) . " currencies:");
            foreach ($result['failed'] as $failedCurrency) {
                $this->line("  - {$failedCurrency}");
            }
        }

        if (empty($result['updated']) && empty($result['failed'])) {
            $this->info("ℹ️ No currencies to update");
        }

        return 0;
    }

    /**
     * List all currencies
     */
    protected function listCurrencies()
    {
        $this->info('💱 Currency List');
        
        $currencies = Currency::orderBy('is_default', 'desc')
                             ->orderBy('code')
                             ->get();

        if ($currencies->isEmpty()) {
            $this->warn("No currencies found in the system");
            return 0;
        }

        $headers = ['Code', 'Name', 'Symbol', 'Rate', 'Decimal Places', 'Status', 'Last Updated'];
        $rows = [];

        foreach ($currencies as $currency) {
            $status = [];
            if ($currency->is_default) {
                $status[] = '⭐ Default';
            }
            
            $lastUpdated = $currency->last_updated 
                ? $currency->last_updated->format('Y-m-d H:i')
                : 'Never';

            $rows[] = [
                $currency->code,
                $currency->name,
                $currency->symbol,
                $currency->is_default ? '1.0000 (base)' : number_format($currency->exchange_rate, 4),
                $currency->decimal_places,
                implode(', ', $status) ?: '-',
                $lastUpdated
            ];
        }

        $this->table($headers, $rows);
        $this->info("Total: {$currencies->count()} currencies");

        return 0;
    }

    /**
     * Show system status
     */
    protected function showStatus()
    {
        $this->info('📊 Currency System Status');
        
        try {
            $statistics = $this->exchangeRateService->getUpdateStatistics();
            
            $this->info("System Information:");
            $this->line("  Total currencies: {$statistics['total_currencies']}");
            $this->line("  Currencies with rates: {$statistics['currencies_with_rates']}");
            $this->line("  Default currency: {$statistics['default_currency']}");
            $this->line("  Last update: " . ($statistics['last_update'] ? date('Y-m-d H:i:s', strtotime($statistics['last_update'])) : 'Never'));
            $this->line("  Update needed: " . ($statistics['update_needed'] ? '⚠️ Yes' : '✅ No'));
            $this->line("  Never updated: {$statistics['currencies_never_updated']}");
            $this->line("  Stale currencies: {$statistics['stale_currencies']}");

            // API Health Check
            $this->info("\nAPI Health Check:");
            $apiHealth = $this->exchangeRateService->monitorApiHealth();
            
            foreach ($apiHealth as $endpoint) {
                $status = $endpoint['status'] === 'healthy' ? '✅' : '❌';
                $this->line("  {$status} {$endpoint['endpoint']} ({$endpoint['response_time_ms']}ms)");
            }

            // Integrity Check
            $this->info("\nIntegrity Check:");
            $integrity = $this->exchangeRateService->validateCurrencyIntegrity();
            
            if ($integrity['integrity_status'] === 'healthy') {
                $this->info("  ✅ All checks passed");
            } else {
                $this->warn("  ⚠️ Issues found:");
                foreach ($integrity['issues_found'] as $issue) {
                    $this->line("    - {$issue}");
                }
                
                if (!empty($integrity['fixes_applied'])) {
                    $this->info("  🔧 Fixes applied:");
                    foreach ($integrity['fixes_applied'] as $fix) {
                        $this->line("    - {$fix}");
                    }
                }
            }

        } catch (\Exception $e) {
            $this->error("Failed to get system status: " . $e->getMessage());
            return 1;
        }

        return 0;
    }

    /**
     * Add a new currency
     */
    protected function addCurrency()
    {
        $code = $this->option('currency');
        $name = $this->option('name');
        $symbol = $this->option('symbol');
        $setDefault = $this->option('default');

        if (!$code) {
            $code = $this->ask('Currency code (3 letters, e.g., USD)');
        }

        if (!$name) {
            $name = $this->ask('Currency name (e.g., US Dollar)');
        }

        if (!$symbol) {
            $symbol = $this->ask('Currency symbol (e.g., $)');
        }

        $code = strtoupper($code);

        // Validate inputs
        if (!preg_match('/^[A-Z]{3}$/', $code)) {
            $this->error("Currency code must be exactly 3 letters");
            return 1;
        }

        if (Currency::where('code', $code)->exists()) {
            $this->error("Currency {$code} already exists");
            return 1;
        }

        if (!$this->option('force')) {
            if (!$this->confirm("Add currency {$code} ({$name}) with symbol '{$symbol}'?")) {
                $this->info("Operation cancelled");
                return 0;
            }
        }

        try {
            // Handle default currency logic
            if ($setDefault) {
                Currency::where('is_default', true)->update(['is_default' => false]);
            }

            $currency = Currency::create([
                'code' => $code,
                'name' => $name,
                'symbol' => $symbol,
                'exchange_rate' => $setDefault ? 1.0 : 1.0, // Will be updated by API
                'format' => '{symbol} {amount}',
                'decimal_places' => 2,
                'is_default' => $setDefault,
            ]);

            $this->info("✅ Currency {$code} created successfully");

            // Try to get exchange rate from API if not default
            if (!$setDefault) {
                $this->info("🔄 Fetching exchange rate from API...");
                try {
                    $this->exchangeRateService->updateDatabaseRates([$code]);
                    $currency->refresh();
                    $this->info("✅ Exchange rate updated: " . number_format($currency->exchange_rate, 4));
                } catch (\Exception $e) {
                    $this->warn("⚠️ Could not fetch exchange rate: " . $e->getMessage());
                }
            }

            return 0;

        } catch (\Exception $e) {
            $this->error("Failed to add currency: " . $e->getMessage());
            return 1;
        }
    }
}