<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Export;
use Illuminate\Support\Facades\Log;

class CheckStuckExports extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'exports:check-stuck';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for and fix stuck exports';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Checking for stuck exports...');
        
        // Find exports that have been in pending or processing state for too long
        $stuckExports = Export::where(function($query) {
                $query->where('status', 'pending')
                    ->orWhere('status', 'processing');
            })
            ->where('created_at', '<', now()->subMinutes(15))
            ->get();
            
        $count = $stuckExports->count();
        $this->info("Found {$count} stuck exports");
        
        foreach ($stuckExports as $export) {
            $this->warn("Marking export #{$export->id} as failed (stuck for " . 
                $export->created_at->diffInMinutes(now()) . " minutes)");
                
            $export->update([
                'status' => 'failed',
                'error' => 'Export timed out after 15 minutes',
                'completed_at' => now()
            ]);
            
            Log::warning("Fixed stuck export #{$export->id}", [
                'export_id' => $export->id,
                'user_id' => $export->user_id,
                'stuck_duration' => $export->created_at->diffInMinutes(now()) . ' minutes'
            ]);
        }
        
        $this->info('Finished checking for stuck exports');
        return 0;
    }
}
