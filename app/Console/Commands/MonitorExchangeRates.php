<?php

namespace App\Console\Commands;

use App\Services\ExchangeRateService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class MonitorExchangeRates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'exchange-rates:monitor 
                            {--health : Check API endpoint health}
                            {--stats : Show update statistics}
                            {--integrity : Check currency data integrity}
                            {--fix : Fix integrity issues automatically}
                            {--full : Run full status report}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Monitor exchange rate system health and performance';

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
        try {
            if ($this->option('health')) {
                $this->checkApiHealth();
            } elseif ($this->option('stats')) {
                $this->showStatistics();
            } elseif ($this->option('integrity')) {
                $this->checkIntegrity();
            } elseif ($this->option('full')) {
                $this->showFullReport();
            } else {
                // Default: show basic status
                $this->showBasicStatus();
            }

            return self::SUCCESS;

        } catch (\Exception $e) {
            $this->error("Failed to monitor exchange rates: {$e->getMessage()}");
            Log::error('Exchange rate monitoring failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return self::FAILURE;
        }
    }

    private function checkApiHealth(): void
    {
        $this->info('Checking API endpoint health...');
        
        $healthResults = $this->exchangeService->monitorApiHealth();
        
        $tableData = collect($healthResults)->map(function ($result) {
            $status = $result['status'];
            $statusIcon = match ($status) {
                'healthy' => '<info>✓</info>',
                'failed' => '<error>✗</error>',
                'error' => '<error>⚠</error>',
                default => '?'
            };
            
            return [
                $statusIcon,
                $result['endpoint'],
                $status,
                $result['response_time_ms'] . 'ms',
                $result['http_status'] ?? ($result['error'] ?? 'N/A')
            ];
        });
        
        $this->table(
            ['Status', 'Endpoint', 'Health', 'Response Time', 'Details'],
            $tableData
        );
        
        $healthyCount = collect($healthResults)->where('status', 'healthy')->count();
        $totalCount = count($healthResults);
        
        if ($healthyCount === $totalCount) {
            $this->info("All {$totalCount} API endpoints are healthy.");
        } else {
            $this->warn("{$healthyCount}/{$totalCount} API endpoints are healthy.");
        }
    }

    private function showStatistics(): void
    {
        $this->info('Exchange Rate System Statistics:');
        
        $stats = $this->exchangeService->getUpdateStatistics();
        
        $this->table(
            ['Metric', 'Value'],
            [
                ['Total Currencies', $stats['total_currencies']],
                ['Currencies with Rates', $stats['currencies_with_rates']],
                ['Default Currency', $stats['default_currency'] ?? 'Not Set'],
                ['Last Update', $stats['last_update'] ?? 'Never'],
                ['Update Needed', $stats['update_needed'] ? 'Yes' : 'No'],
                ['Never Updated', $stats['currencies_never_updated']],
                ['Stale Currencies (>24h)', $stats['stale_currencies']]
            ]
        );
        
        if ($stats['update_needed']) {
            $this->warn('Exchange rates need updating. Run: php artisan exchange-rates:update');
        }
        
        if ($stats['currencies_never_updated'] > 0) {
            $this->warn("{$stats['currencies_never_updated']} currencies have never been updated.");
        }
    }

    private function checkIntegrity(): void
    {
        $this->info('Checking currency data integrity...');
        
        $integrityResults = $this->exchangeService->validateCurrencyIntegrity();
        
        if ($integrityResults['integrity_status'] === 'healthy') {
            $this->info('✓ Currency data integrity is healthy.');
        } else {
            $this->warn('⚠ Currency data integrity issues detected:');
            
            foreach ($integrityResults['issues_found'] as $issue) {
                $this->line("  • {$issue}");
            }
            
            if (!empty($integrityResults['fixes_applied'])) {
                $this->info('Fixes applied:');
                foreach ($integrityResults['fixes_applied'] as $fix) {
                    $this->line("  ✓ {$fix}");
                }
            }
            
            if ($this->option('fix') && !empty($integrityResults['issues_found'])) {
                $this->info('Integrity issues have been automatically fixed.');
            } elseif (!empty($integrityResults['issues_found'])) {
                $this->warn('Run with --fix flag to automatically resolve issues.');
            }
        }
    }

    private function showFullReport(): void
    {
        $this->info('Generating full exchange rate system report...');
        $this->newLine();
        
        $report = $this->exchangeService->generateStatusReport();
        
        // API Health
        $this->line('<comment>📡 API Health Status</comment>');
        $healthyApis = collect($report['api_health'])->where('status', 'healthy')->count();
        $totalApis = count($report['api_health']);
        $this->line("Status: {$healthyApis}/{$totalApis} endpoints healthy");
        $this->newLine();
        
        // Update Statistics
        $this->line('<comment>📊 Update Statistics</comment>');
        $stats = $report['update_statistics'];
        $this->line("Total Currencies: {$stats['total_currencies']}");
        $this->line("With Exchange Rates: {$stats['currencies_with_rates']}");
        $this->line("Default Currency: " . ($stats['default_currency'] ?? 'Not Set'));
        $this->line("Last Update: " . ($stats['last_update'] ?? 'Never'));
        $this->line("Update Needed: " . ($stats['update_needed'] ? 'Yes' : 'No'));
        $this->newLine();
        
        // Integrity Status
        $this->line('<comment>🔍 Data Integrity</comment>');
        $integrity = $report['integrity_check'];
        $this->line("Status: " . ucfirst(str_replace('_', ' ', $integrity['integrity_status'])));
        
        if (!empty($integrity['issues_found'])) {
            $this->line("Issues: " . count($integrity['issues_found']));
            foreach ($integrity['issues_found'] as $issue) {
                $this->line("  • {$issue}");
            }
        }
        $this->newLine();
        
        // Cache Status
        $this->line('<comment>💾 Cache Status</comment>');
        $cache = $report['cache_status'];
        $this->line("Driver: {$cache['cache_driver']}");
        $this->line("Expiry: {$cache['cache_expiry_hours']} hours");
        $this->line("Currencies Cached: " . ($cache['cached_currencies_exist'] ? 'Yes' : 'No'));
        $this->newLine();
        
        $this->info("Report generated at: {$report['report_generated_at']}");
        
        // Recommendations
        $this->newLine();
        $this->line('<comment>💡 Recommendations</comment>');
        
        if ($stats['update_needed']) {
            $this->line("• Run exchange rate update: php artisan exchange-rates:update");
        }
        
        if ($healthyApis < $totalApis) {
            $this->line("• Check API endpoint connectivity and fallback mechanisms");
        }
        
        if (!empty($integrity['issues_found'])) {
            $this->line("• Fix data integrity issues: php artisan exchange-rates:monitor --integrity --fix");
        }
        
        if ($stats['currencies_never_updated'] > 0) {
            $this->line("• Initialize exchange rates for new currencies");
        }
    }

    private function showBasicStatus(): void
    {
        $this->info('Exchange Rate System Status:');
        
        $stats = $this->exchangeService->getUpdateStatistics();
        $lastUpdate = $stats['last_update'] ? 
            \Carbon\Carbon::parse($stats['last_update'])->diffForHumans() : 
            'Never';
        
        $statusIcon = $stats['update_needed'] ? '⚠' : '✓';
        $statusText = $stats['update_needed'] ? 'Needs Update' : 'Up to Date';
        
        $this->line("Status: {$statusIcon} {$statusText}");
        $this->line("Currencies: {$stats['currencies_with_rates']}/{$stats['total_currencies']} with rates");
        $this->line("Last Update: {$lastUpdate}");
        $this->line("Default Currency: " . ($stats['default_currency'] ?? 'Not Set'));
        
        $this->newLine();
        $this->line('Available commands:');
        $this->line('  --health     Check API endpoint health');
        $this->line('  --stats      Show detailed statistics');
        $this->line('  --integrity  Check data integrity');
        $this->line('  --full       Generate full report');
    }
}
