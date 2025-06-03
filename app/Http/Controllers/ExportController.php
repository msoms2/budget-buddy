<?php

namespace App\Http\Controllers;

use App\Models\Export;
use App\Jobs\ProcessExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ExportController extends Controller
{
    /**
     * Handle the export request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'type' => ['required', 'string', 'in:expenses,earnings,all'],
        ]);

        // Delete old exports for this user
        Export::where('user_id', auth()->id())
            ->where('created_at', '<', now()->subDay())
            ->each(function ($export) {
                if ($export->file_path && Storage::disk('local')->exists($export->file_path)) {
                    Storage::disk('local')->delete($export->file_path);
                }
                $export->delete();
            });

        // Check for any pending exports that might be stuck
        $pendingExports = Export::where('user_id', auth()->id())
            ->where('status', 'pending')
            ->where('created_at', '<', now()->subMinutes(15))
            ->get();
            
        foreach ($pendingExports as $export) {
            $export->update([
                'status' => 'failed',
                'error' => 'Export timed out',
                'completed_at' => now()
            ]);
        }

        // Create new export record
        $export = Export::create([
            'user_id' => auth()->id(),
            'type' => $request->type,
            'status' => 'pending',
            'progress' => 0
        ]);

        // Dispatch export job with high priority
        ProcessExport::dispatch($export)->onQueue('exports');

        return response()->json([
            'message' => 'Export started successfully',
            'export' => $export,
        ]);
    }

    /**
     * Get export status.
     */
    public function status(Export $export)
    {
        // Ensure user can only access their own exports
        if ($export->user_id !== auth()->id()) {
            abort(403);
        }

        // Refresh the export model to get latest status
        $export = Export::find($export->id);
        
        // Check for potential stuck exports (in pending state for too long)
        if ($export->status === 'pending' && $export->created_at->diffInMinutes(now()) > 15) {
            $export->update([
                'status' => 'failed',
                'error' => 'Export timed out after 15 minutes in pending state',
                'completed_at' => now()
            ]);
        }

        return response()->json([
            'export' => [
                'id' => $export->id,
                'status' => $export->status,
                'progress' => $export->progress ?? 0,
                'completed_at' => $export->completed_at,
                'error' => $export->error,
                'created_at' => $export->created_at,
                'wait_time' => $export->created_at ? $export->created_at->diffInSeconds(now()) : 0,
                'can_download' => $export->status === 'completed' &&
                                $export->file_path &&
                                Storage::disk('local')->exists($export->file_path)
            ],
        ]);
    }

    /**
     * Download the exported file.
     */
    public function download(Export $export)
    {
        // Ensure user can only download their own exports
        if ($export->user_id !== auth()->id()) {
            abort(403);
        }

        // Check if export is completed and file exists
        if (!$export->isCompleted()) {
            abort(400, 'Export is not ready for download');
        }

        if (!$export->file_path || !Storage::disk('local')->exists($export->file_path)) {
            abort(404, 'Export file not found');
        }

        $headers = [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . ($export->file_name ?? 'financial_export.xlsx') . '"'
        ];

        return Storage::disk('local')->download(
            $export->file_path,
            $export->file_name ?? 'financial_export.xlsx',
            $headers
        );
    }

    /**
     * Delete an export.
     */
    public function destroy(Export $export)
    {
        // Ensure user can only delete their own exports
        if ($export->user_id !== auth()->id()) {
            abort(403);
        }

        // Delete the file if it exists
        if ($export->file_path && Storage::disk('local')->exists($export->file_path)) {
            Storage::disk('local')->delete($export->file_path);
        }

        $export->delete();

        return response()->json([
            'message' => 'Export deleted successfully',
        ]);
    }
}
