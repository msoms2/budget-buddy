<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class PopulatePasswordHistory extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'password:populate-history';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Populate password history for existing users who don\'t have any password history records';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Populating password history for existing users...');

        $usersWithoutHistory = User::whereDoesntHave('passwordHistory')->get();

        if ($usersWithoutHistory->isEmpty()) {
            $this->info('All users already have password history records.');
            return;
        }

        $count = 0;
        foreach ($usersWithoutHistory as $user) {
            $user->passwordHistory()->create([
                'password' => $user->password, // Store current hashed password
            ]);
            $count++;
        }

        $this->info("Successfully created password history records for {$count} users.");
    }
}