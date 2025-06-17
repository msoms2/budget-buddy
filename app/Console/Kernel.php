<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // Send daily notification digests at 8:00 AM
        $schedule->command('notifications:send-scheduled')
                 ->dailyAt('08:00')
                 ->description('Send scheduled notification digests');
        
        // Check for budget limits and create notifications
        $schedule->command('budget:check-limits')
                 ->dailyAt('00:01')
                 ->description('Check budget limits and create notifications if exceeded');
        
        // Check for goal deadlines and send reminders
        $schedule->command('goals:check-deadlines')
                 ->dailyAt('09:00')
                 ->description('Check goal deadlines and send reminders');
                 
        // Check for stuck exports every 5 minutes
        $schedule->command('exports:check-stuck')
                 ->everyFiveMinutes()
                 ->description('Check for and fix stuck exports');
        
        // Update exchange rates every hour
        $schedule->command('exchange-rates:update')
                 ->hourly()
                 ->description('Update currency exchange rates from fawazahmed0/exchange-api');
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}