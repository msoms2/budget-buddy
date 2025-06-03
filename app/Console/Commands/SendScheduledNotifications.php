<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\NotificationService;

class SendScheduledNotifications extends Command
{
    protected $signature = 'notifications:send-scheduled';
    protected $description = 'Send scheduled notification digests (daily/weekly) based on user preferences';

    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        parent::__construct();
        $this->notificationService = $notificationService;
    }

    public function handle()
    {
        $this->info('Starting to send scheduled notifications...');
        
        try {
            $count = $this->notificationService->sendScheduledNotifications();
            $this->info("Successfully sent {$count} notification digests.");
        } catch (\Exception $e) {
            $this->error("Error sending scheduled notifications: {$e->getMessage()}");
            return 1;
        }
        
        return 0;
    }
}