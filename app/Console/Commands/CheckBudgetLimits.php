<?php

namespace App\Console\Commands;

use App\Models\Budget;
use App\Models\Expense;
use App\Models\Notification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CheckBudgetLimits extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'budget:check-limits 
                            {--dry-run : Show what notifications would be created without sending them}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check budget limits and create notifications for exceeded budgets';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        $this->info('Checking budget limits...');

        try {
            $exceededBudgets = [];
            $warningBudgets = [];
            
            // Get all active budgets (not soft deleted and within date range)
            $budgets = Budget::with('user')
                            ->whereNull('deleted_at')
                            ->where(function ($query) {
                                $query->whereNull('end_date')
                                      ->orWhere('end_date', '>=', now());
                            })->get();
            
            foreach ($budgets as $budget) {
                $currentPeriod = $this->getCurrentPeriod($budget);
                $spent = $this->getSpentAmount($budget, $currentPeriod['start'], $currentPeriod['end']);
                $percentage = ($spent / $budget->amount) * 100;
                
                // Check if budget is exceeded (100%+)
                if ($percentage >= 100) {
                    $exceededBudgets[] = [
                        'budget' => $budget,
                        'spent' => $spent,
                        'percentage' => $percentage,
                        'overspent' => $spent - $budget->amount
                    ];
                }
                // Check if budget is at warning level (80%+)
                else if ($percentage >= 80) {
                    $warningBudgets[] = [
                        'budget' => $budget,
                        'spent' => $spent,
                        'percentage' => $percentage,
                        'remaining' => $budget->amount - $spent
                    ];
                }
            }
            
            if ($this->option('dry-run')) {
                $this->showResults($exceededBudgets, $warningBudgets, true);
                return self::SUCCESS;
            }
            
            // Create notifications for exceeded budgets
            foreach ($exceededBudgets as $item) {
                $this->createBudgetNotification($item, 'exceeded');
            }
            
            // Create notifications for warning budgets
            foreach ($warningBudgets as $item) {
                $this->createBudgetNotification($item, 'warning');
            }
            
            $this->showResults($exceededBudgets, $warningBudgets, false);
            
            Log::info('Budget limits check completed', [
                'exceeded_count' => count($exceededBudgets),
                'warning_count' => count($warningBudgets)
            ]);
            
            return self::SUCCESS;
            
        } catch (\Exception $e) {
            $this->error("Failed to check budget limits: {$e->getMessage()}");
            Log::error('Budget limits check failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return self::FAILURE;
        }
    }
    
    private function getCurrentPeriod(Budget $budget): array
    {
        $now = Carbon::now();
        
        switch ($budget->period) {
            case 'daily':
                return [
                    'start' => $now->copy()->startOfDay(),
                    'end' => $now->copy()->endOfDay()
                ];
            case 'weekly':
                return [
                    'start' => $now->copy()->startOfWeek(),
                    'end' => $now->copy()->endOfWeek()
                ];
            case 'monthly':
                return [
                    'start' => $now->copy()->startOfMonth(),
                    'end' => $now->copy()->endOfMonth()
                ];
            case 'yearly':
                return [
                    'start' => $now->copy()->startOfYear(),
                    'end' => $now->copy()->endOfYear()
                ];
            default:
                return [
                    'start' => $now->copy()->startOfMonth(),
                    'end' => $now->copy()->endOfMonth()
                ];
        }
    }
    
    private function getSpentAmount(Budget $budget, Carbon $start, Carbon $end): float
    {
        $query = Expense::where('user_id', $budget->user_id)
                        ->whereBetween('date', [$start, $end]);
        
        if ($budget->category_id) {
            $query->where('category_id', $budget->category_id);
        }
        
        return $query->sum('amount');
    }
    
    private function createBudgetNotification(array $item, string $type): void
    {
        $budget = $item['budget'];
        $spent = $item['spent'];
        $percentage = $item['percentage'];
        
        // Check if we already sent a notification for this budget today
        $existingNotification = Notification::where('user_id', $budget->user_id)
                                           ->where('type', 'budget_' . $type)
                                           ->where('data->budget_id', $budget->id)
                                           ->whereDate('created_at', Carbon::today())
                                           ->first();
        
        if ($existingNotification) {
            return; // Don't spam notifications
        }
        
        if ($type === 'exceeded') {
            $title = "Budget Exceeded: {$budget->name}";
            $message = "You've exceeded your budget by " . number_format($item['overspent'], 2) . 
                      ". Total spent: " . number_format($spent, 2);
        } else {
            $title = "Budget Warning: {$budget->name}";
            $message = "You've used " . number_format($percentage, 1) . 
                      "% of your budget. Remaining: " . number_format($item['remaining'], 2);
        }
        
        Notification::create([
            'user_id' => $budget->user_id,
            'type' => 'budget_' . $type,
            'title' => $title,
            'message' => $message,
            'data' => [
                'budget_id' => $budget->id,
                'spent' => $spent,
                'percentage' => $percentage,
                'budget_amount' => $budget->amount
            ]
        ]);
    }
    
    private function showResults(array $exceededBudgets, array $warningBudgets, bool $isDryRun): void
    {
        if (!empty($exceededBudgets)) {
            $this->error('Budgets exceeded:');
            
            $tableData = collect($exceededBudgets)->map(function ($item) {
                return [
                    $item['budget']->name,
                    $item['budget']->user->name ?? 'Unknown',
                    number_format($item['budget']->amount, 2),
                    number_format($item['spent'], 2),
                    number_format($item['percentage'], 1) . '%',
                    '+' . number_format($item['overspent'], 2)
                ];
            });
            
            $this->table(
                ['Budget', 'User', 'Limit', 'Spent', 'Usage', 'Overspent'],
                $tableData
            );
        }
        
        if (!empty($warningBudgets)) {
            $this->warn('Budgets at warning level (80%+):');
            
            $tableData = collect($warningBudgets)->map(function ($item) {
                return [
                    $item['budget']->name,
                    $item['budget']->user->name ?? 'Unknown',
                    number_format($item['budget']->amount, 2),
                    number_format($item['spent'], 2),
                    number_format($item['percentage'], 1) . '%',
                    number_format($item['remaining'], 2)
                ];
            });
            
            $this->table(
                ['Budget', 'User', 'Limit', 'Spent', 'Usage', 'Remaining'],
                $tableData
            );
        }
        
        if (empty($exceededBudgets) && empty($warningBudgets)) {
            $this->info('All budgets are within normal limits.');
        }
        
        if ($isDryRun) {
            $this->info('Dry run completed - no notifications were sent.');
        } else {
            $notificationCount = count($exceededBudgets) + count($warningBudgets);
            $this->info("Created {$notificationCount} budget notifications.");
        }
    }
}
