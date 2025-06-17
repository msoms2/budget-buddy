<?php

namespace App\Jobs;

use App\Models\Export;
use App\Exports\FinancialDataExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ProcessExport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $export;

    /**
     * Create a new job instance.
     *
     * @param  Export  $export
     * @return void
     */
    public function __construct(Export $export)
    {
        $this->export = $export;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        try {
            // Log the start of the export process
            Log::info('Starting export process', [
                'export_id' => $this->export->id,
                'user_id' => $this->export->user_id,
                'type' => $this->export->type
            ]);

            // Update progress to 10% when starting
            $this->export->update(['progress' => 10, 'status' => 'processing']);
            Log::info('Export progress: 10%', ['export_id' => $this->export->id]);
            sleep(1); // Allow frontend to catch progress update

            $fileName = 'financial_export_' . time() . '.xlsx';
            $path = 'exports/' . $fileName;

            // Ensure the exports directory exists
            if (!Storage::disk('local')->exists('exports')) {
                Storage::disk('local')->makeDirectory('exports');
                Log::info('Created exports directory', ['export_id' => $this->export->id]);
            }

            // Update progress to 50% before generating file
            $this->export->update(['progress' => 50]);
            Log::info('Export progress: 50%', ['export_id' => $this->export->id]);
            sleep(1); // Allow frontend to catch progress update

            // Generate Excel file using Laravel Excel
            Excel::store(
                new FinancialDataExport($this->export->type, $this->export->user_id),
                $path,
                'local'
            );

            // Update progress to 90% after file generation
            $this->export->update(['progress' => 90]);
            Log::info('Export progress: 90%', ['export_id' => $this->export->id]);
            sleep(1); // Allow frontend to catch progress update

            // Update export record with completion
            $this->export->update([
                'file_path' => $path,
                'file_name' => $fileName,
                'completed_at' => now(),
                'status' => 'completed',
                'progress' => 100
            ]);

            Log::info('Export completed successfully', [
                'export_id' => $this->export->id,
                'file_path' => $path
            ]);

        } catch (\Exception $e) {
            Log::error('Export failed: ' . $e->getMessage(), [
                'export_id' => $this->export->id,
                'user_id' => $this->export->user_id,
                'type' => $this->export->type,
                'exception' => [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ]
            ]);
            
            // Make sure the export status is updated even if there's an error
            $this->export->update([
                'completed_at' => now(),
                'status' => 'failed',
                'error' => $e->getMessage(),
                'progress' => 0
            ]);
            
            // Don't rethrow the exception - let the job be considered completed
            // This prevents the job from being retried and potentially getting stuck
        }
    }
}
