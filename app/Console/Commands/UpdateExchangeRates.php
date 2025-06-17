<?php

namespace App\Console\Commands;

use App\Services\ExchangeRateService;
use App\Mail\ExchangeRateUpdateFailed;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class UpdateExchangeRates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'exchange-rates:update 
                            {--force : Force update even if rates are recent}
                            {--dry-run : Show what would be updated without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update exchange rates from the fawazahmed0/exchange-api';

    protected ExchangeRateService $exchangeService;

    /**
     * Create a new command instance.
     */
    public function __construct(ExchangeRateService $exchangeService)
    {
        parent::__construct();
        $this->exchangeService = $exchangeService;
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        $this->info('Checking exchange rates...');

        try {
            // Check if update is needed (unless forced)
            if (!$this->option('force') && !$this->exchangeService->ratesNeedUpdate()) {
                $lastUpdate = $this->exchangeService->getLastUpdateTime();
                $this->info("Exchange rates are up to date. Last updated: {$lastUpdate?->format('Y-m-d H:i:s')}");
                return self::SUCCESS;
            }

            if ($this->option('dry-run')) {
                $this->info('Dry run mode - no changes will be made');
                
                // Get available currencies to show what would be updated
                $currencies = \App\Models\Currency::where('is_default', false)->get();
                
                $this->table(
                    ['Currency', 'Current Rate', 'Last Updated'],
                    $currencies->map(function ($currency) {
                        return [
                            $currency->code,
                            $currency->exchange_rate ?: 'Not set',
                            $currency->last_updated?->format('Y-m-d H:i:s') ?: 'Never'
                        ];
                    })
                );
                
                return self::SUCCESS;
            }

            $this->info('Updating exchange rates...');
            
            $results = $this->exchangeService->updateDatabaseRates();
            
            // Display results
            if (!empty($results['updated'])) {
                $this->info('Successfully updated exchange rates:');
                
                $tableData = collect($results['updated'])->map(function ($item) {
                    $changePercent = number_format($item['change_percent'], 2);
                    $changeDirection = $item['change_percent'] > 0 ? '↑' : ($item['change_percent'] < 0 ? '↓' : '→');
                    
                    return [
                        $item['currency'],
                        number_format($item['old_rate'], 6),
                        number_format($item['new_rate'], 6),
                        "{$changeDirection} {$changePercent}%"
                    ];
                });
                
                $this->table(
                    ['Currency', 'Old Rate', 'New Rate', 'Change'],
                    $tableData
                );
            }
            
            if (!empty($results['failed'])) {
                $this->warn('Failed to update rates for: ' . implode(', ', $results['failed']));
            }
            
            $this->info("Exchange rates updated successfully at {$results['timestamp']}");
            
            Log::info('Exchange rates updated via console command', [
                'updated_count' => count($results['updated']),
                'failed_count' => count($results['failed']),
                'timestamp' => $results['timestamp']
            ]);
            
            return self::SUCCESS;
            
        } catch (\Exception $e) {
            $this->error("Failed to update exchange rates: {$e->getMessage()}");
            
            // Log the error
            Log::error('Exchange rate update failed via console command', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Send email notification for critical failures
            try {
                $lastUpdate = $this->exchangeService->getLastUpdateTime();
                $adminEmail = config('mail.admin_email', 'admin@budgetbuddy.local');
                
                if ($adminEmail && config('mail.notifications.exchange_rate_failures', true)) {
                    Mail::to($adminEmail)->send(new ExchangeRateUpdateFailed(
                        $e->getMessage(),
                        1, // attempt count
                        $lastUpdate
                    ));
                }
            } catch (\Exception $mailException) {
                Log::error('Failed to send exchange rate failure notification', [
                    'mail_error' => $mailException->getMessage()
                ]);
            }
            
            return self::FAILURE;
        }
    }
}
