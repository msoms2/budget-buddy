<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\NotificationType;
use Illuminate\Support\Facades\DB;

class SeedNotificationTypes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:seed-types';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed notification types into the database if they do not exist';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for notification types...');

        $existingTypes = NotificationType::count();
        $this->info("Found {$existingTypes} notification type(s)");

        if ($existingTypes === 0) {
            $this->info('Seeding notification types...');

            // Define notification types to seed
            $types = [
                [
                    'slug' => 'bill_payment_reminder',
                    'name' => 'Bill Payment Reminder',
                    'description' => 'Reminds users about upcoming bill payments',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'slug' => 'budget_limit_alert',
                    'name' => 'Budget Limit Alert',
                    'description' => 'Alerts users when they are approaching their budget limits',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'slug' => 'goal_progress_update',
                    'name' => 'Goal Progress Update',
                    'description' => 'Updates users on their progress towards financial goals',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'slug' => 'large_expense',
                    'name' => 'Large Expense',
                    'description' => 'Notifies users about unusually large expenses',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'slug' => 'investment_update',
                    'name' => 'Investment Update',
                    'description' => 'Updates users on their investment performance',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ];

            // Insert the notification types
            foreach ($types as $type) {
                try {
                    NotificationType::create($type);
                    $this->info("Created notification type: {$type['name']}");
                } catch (\Exception $e) {
                    $this->error("Failed to create notification type {$type['name']}: " . $e->getMessage());
                }
            }

            $newCount = NotificationType::count();
            $this->info("Successfully seeded notification types. Total types now: {$newCount}");
        } else {
            $this->info('Notification types already exist. Nothing to seed.');
            
            // Display existing notification types
            $types = NotificationType::all();
            $this->table(
                ['ID', 'Slug', 'Name', 'Description'],
                $types->map(function ($type) {
                    return [
                        'id' => $type->id,
                        'slug' => $type->slug,
                        'name' => $type->name,
                        'description' => $type->description,
                    ];
                })
            );
        }

        return Command::SUCCESS;
    }
}
