<?php

namespace App\Console\Commands;

use App\Models\PaymentSchedule;
use App\Services\NotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ProcessScheduledPayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:process {--force : Process all payments regardless of date} {--notify : Send notifications for processed payments}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process scheduled payments that are due today';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $force = $this->option('force');
        $notify = $this->option('notify');
        $today = Carbon::today();
        
        $this->info("Processing scheduled payments for {$today->format('Y-m-d')}...");
        
        try {
            // Find all due and pending payment schedules
            $query = PaymentSchedule::query()
                ->where('status', 'pending')
                ->where(function($q) use ($force, $today) {
                    // If force option is used, process all pending payments
                    // Otherwise, only process those due today or earlier with auto_process enabled
                    if (!$force) {
                        $q->where('due_date', '<=', $today)
                            ->where('auto_process', true);
                    }
                });
            
            $count = $query->count();
            $this->info("Found {$count} payment(s) to process");
            
            if ($count > 0) {
                $bar = $this->output->createProgressBar($count);
                $bar->start();
                
                $processedCount = 0;
                $failedCount = 0;
                
                $query->chunk(50, function($payments) use (&$processedCount, &$failedCount, $bar, $notify) {
                    foreach ($payments as $payment) {
                        try {
                            // Create an expense from this payment
                            $expense = $payment->processPayment();
                            
                            // Send notification if requested and expense was created
                            if ($notify && $expense) {
                                $this->sendPaymentProcessedNotification($payment, $expense);
                            }
                            
                            $processedCount++;
                        } catch (\Exception $e) {
                            $failedCount++;
                            Log::error("Failed to process payment #{$payment->id} - {$payment->name}: {$e->getMessage()}");
                        }
                        
                        $bar->advance();
                    }
                });
                
                $bar->finish();
                $this->newLine();
                
                $this->info("Successfully processed {$processedCount} payment(s)");
                
                if ($failedCount > 0) {
                    $this->warn("Failed to process {$failedCount} payment(s). See log for details.");
                }
            }
            
            // Now process reminder notifications for upcoming payments
            if ($notify) {
                $this->processReminders($today);
            }
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Error processing payments: {$e->getMessage()}");
            Log::error("Payment processing error: {$e->getMessage()}", [
                'trace' => $e->getTraceAsString()
            ]);
            
            return Command::FAILURE;
        }
    }
    
    /**
     * Process reminder notifications for upcoming payments
     */
    protected function processReminders($today)
    {
        $this->info("Processing payment reminders...");
        
        // Find payments with reminder date set to today
        $reminders = PaymentSchedule::where('status', 'pending')
            ->where('reminder_date', $today)
            ->get();
            
        $reminderCount = $reminders->count();
        $this->info("Found {$reminderCount} payment reminder(s) to send");
        
        if ($reminderCount > 0) {
            foreach ($reminders as $payment) {
                try {
                    $this->sendPaymentReminderNotification($payment);
                } catch (\Exception $e) {
                    Log::error("Failed to send payment reminder for #{$payment->id}: {$e->getMessage()}");
                }
            }
        }
    }
    
    /**
     * Send notification when payment is processed
     */
    protected function sendPaymentProcessedNotification($payment, $expense)
    {
        try {
            $user = $payment->user;
            if ($user) {
                app(NotificationService::class)->notifyPaymentProcessed($user, $payment, $expense);
            }
        } catch (\Exception $e) {
            Log::error("Failed to send payment processed notification: {$e->getMessage()}");
        }
    }
    
    /**
     * Send reminder notification for upcoming payments
     */
    protected function sendPaymentReminderNotification($payment)
    {
        try {
            $user = $payment->user;
            if ($user) {
                app(NotificationService::class)->notifyBillPayment($user, $payment);
            }
        } catch (\Exception $e) {
            Log::error("Failed to send payment reminder notification: {$e->getMessage()}");
        }
    }
}
