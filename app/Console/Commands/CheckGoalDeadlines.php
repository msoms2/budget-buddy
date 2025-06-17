<?php

namespace App\Console\Commands;

use App\Models\Goal;
use App\Models\Notification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CheckGoalDeadlines extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'goals:check-deadlines 
                            {--dry-run : Show what notifications would be created without sending them}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check goal deadlines and send reminders for approaching or overdue goals';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        $this->info('Checking goal deadlines...');

        try {
            $overdueGoals = [];
            $urgentGoals = [];
            $reminderGoals = [];
            
            // Get all active goals with deadlines
            $goals = Goal::with('user')
                        ->where('status', 'active')
                        ->whereNotNull('target_date')
                        ->get();
            
            $now = Carbon::now();
            
            foreach ($goals as $goal) {
                $targetDate = Carbon::parse($goal->target_date);
                $daysUntilDeadline = $now->diffInDays($targetDate, false);
                $progress = $this->calculateGoalProgress($goal);
                
                if ($daysUntilDeadline < 0) {
                    // Overdue goals
                    $overdueGoals[] = [
                        'goal' => $goal,
                        'days_overdue' => abs($daysUntilDeadline),
                        'progress' => $progress
                    ];
                } elseif ($daysUntilDeadline <= 3) {
                    // Urgent goals (3 days or less)
                    $urgentGoals[] = [
                        'goal' => $goal,
                        'days_remaining' => $daysUntilDeadline,
                        'progress' => $progress
                    ];
                } elseif ($daysUntilDeadline <= 7) {
                    // Reminder goals (1 week)
                    $reminderGoals[] = [
                        'goal' => $goal,
                        'days_remaining' => $daysUntilDeadline,
                        'progress' => $progress
                    ];
                }
            }
            
            if ($this->option('dry-run')) {
                $this->showResults($overdueGoals, $urgentGoals, $reminderGoals, true);
                return self::SUCCESS;
            }
            
            // Create notifications
            foreach ($overdueGoals as $item) {
                $this->createGoalNotification($item, 'overdue');
            }
            
            foreach ($urgentGoals as $item) {
                $this->createGoalNotification($item, 'urgent');
            }
            
            foreach ($reminderGoals as $item) {
                $this->createGoalNotification($item, 'reminder');
            }
            
            $this->showResults($overdueGoals, $urgentGoals, $reminderGoals, false);
            
            Log::info('Goal deadlines check completed', [
                'overdue_count' => count($overdueGoals),
                'urgent_count' => count($urgentGoals),
                'reminder_count' => count($reminderGoals)
            ]);
            
            return self::SUCCESS;
            
        } catch (\Exception $e) {
            $this->error("Failed to check goal deadlines: {$e->getMessage()}");
            Log::error('Goal deadlines check failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return self::FAILURE;
        }
    }
    
    private function calculateGoalProgress(Goal $goal): float
    {
        if ($goal->target_amount <= 0) {
            return 0;
        }
        
        return min(($goal->current_amount / $goal->target_amount) * 100, 100);
    }
    
    private function createGoalNotification(array $item, string $type): void
    {
        $goal = $item['goal'];
        $progress = $item['progress'];
        
        // Check if we already sent a notification for this goal today
        $existingNotification = Notification::where('user_id', $goal->user_id)
                                           ->where('type', 'goal_' . $type)
                                           ->where('data->goal_id', $goal->id)
                                           ->whereDate('created_at', Carbon::today())
                                           ->first();
        
        if ($existingNotification) {
            return; // Don't spam notifications
        }
        
        switch ($type) {
            case 'overdue':
                $title = "Goal Overdue: {$goal->title}";
                $message = "Your goal was due {$item['days_overdue']} day(s) ago. " .
                          "Current progress: " . number_format($progress, 1) . "% " .
                          "(" . number_format($goal->current_amount, 2) . " / " . number_format($goal->target_amount, 2) . ")";
                break;
                
            case 'urgent':
                $title = "Goal Deadline Approaching: {$goal->title}";
                $message = "Your goal deadline is in {$item['days_remaining']} day(s). " .
                          "Current progress: " . number_format($progress, 1) . "% " .
                          "(" . number_format($goal->current_amount, 2) . " / " . number_format($goal->target_amount, 2) . ")";
                break;
                
            case 'reminder':
                $title = "Goal Reminder: {$goal->title}";
                $message = "Your goal deadline is in {$item['days_remaining']} day(s). " .
                          "Current progress: " . number_format($progress, 1) . "% " .
                          "(" . number_format($goal->current_amount, 2) . " / " . number_format($goal->target_amount, 2) . ")";
                break;
                
            default:
                return;
        }
        
        Notification::create([
            'user_id' => $goal->user_id,
            'type' => 'goal_' . $type,
            'title' => $title,
            'message' => $message,
            'data' => [
                'goal_id' => $goal->id,
                'progress_percentage' => $progress,
                'current_amount' => $goal->current_amount,
                'target_amount' => $goal->target_amount,
                'target_date' => $goal->target_date,
                'days_remaining' => $item['days_remaining'] ?? null,
                'days_overdue' => $item['days_overdue'] ?? null
            ]
        ]);
    }
    
    private function showResults(array $overdueGoals, array $urgentGoals, array $reminderGoals, bool $isDryRun): void
    {
        if (!empty($overdueGoals)) {
            $this->error('Overdue goals:');
            
            $tableData = collect($overdueGoals)->map(function ($item) {
                return [
                    $item['goal']->title,
                    $item['goal']->user->name ?? 'Unknown',
                    Carbon::parse($item['goal']->target_date)->format('Y-m-d'),
                    $item['days_overdue'] . ' days ago',
                    number_format($item['progress'], 1) . '%',
                    number_format($item['goal']->current_amount, 2) . ' / ' . number_format($item['goal']->target_amount, 2)
                ];
            });
            
            $this->table(
                ['Goal', 'User', 'Due Date', 'Overdue', 'Progress', 'Amount'],
                $tableData
            );
        }
        
        if (!empty($urgentGoals)) {
            $this->warn('Urgent goals (≤3 days):');
            
            $tableData = collect($urgentGoals)->map(function ($item) {
                return [
                    $item['goal']->title,
                    $item['goal']->user->name ?? 'Unknown',
                    Carbon::parse($item['goal']->target_date)->format('Y-m-d'),
                    $item['days_remaining'] . ' days',
                    number_format($item['progress'], 1) . '%',
                    number_format($item['goal']->current_amount, 2) . ' / ' . number_format($item['goal']->target_amount, 2)
                ];
            });
            
            $this->table(
                ['Goal', 'User', 'Due Date', 'Remaining', 'Progress', 'Amount'],
                $tableData
            );
        }
        
        if (!empty($reminderGoals)) {
            $this->info('Reminder goals (≤7 days):');
            
            $tableData = collect($reminderGoals)->map(function ($item) {
                return [
                    $item['goal']->title,
                    $item['goal']->user->name ?? 'Unknown',
                    Carbon::parse($item['goal']->target_date)->format('Y-m-d'),
                    $item['days_remaining'] . ' days',
                    number_format($item['progress'], 1) . '%',
                    number_format($item['goal']->current_amount, 2) . ' / ' . number_format($item['goal']->target_amount, 2)
                ];
            });
            
            $this->table(
                ['Goal', 'User', 'Due Date', 'Remaining', 'Progress', 'Amount'],
                $tableData
            );
        }
        
        if (empty($overdueGoals) && empty($urgentGoals) && empty($reminderGoals)) {
            $this->info('No goals require deadline reminders at this time.');
        }
        
        if ($isDryRun) {
            $this->info('Dry run completed - no notifications were sent.');
        } else {
            $notificationCount = count($overdueGoals) + count($urgentGoals) + count($reminderGoals);
            $this->info("Created {$notificationCount} goal deadline notifications.");
        }
    }
}
