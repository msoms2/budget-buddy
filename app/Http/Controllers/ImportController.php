<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessImport;
use App\Models\Import;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImportController extends Controller
{
    /**
     * Handle the import request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,xlsx', 'max:10240'],
            'type' => ['nullable', 'string', 'in:expenses,earnings,all,auto'],
        ]);

        $file = $request->file('file');
        $fileName = time() . '_' . $file->getClientOriginalName();
        
        // Store the file
        $path = $file->storeAs('imports', $fileName, 'local');
        
        // Determine import type - use auto-detection if not specified or if 'auto' is specified
        $importType = $request->type;
        if (!$importType || $importType === 'auto') {
            $importService = new \App\Services\ImportService();
            $detectedType = $importService->detectImportType($path);
            $importType = $detectedType === 'transactions' ? 'all' : $detectedType;
        }
        
        // Create import record
        $import = Import::create([
            'user_id' => auth()->id(),
            'file_name' => $fileName,
            'file_path' => $path,
            'importer' => $importType,
        ]);

        // Dispatch import job
        ProcessImport::dispatch($import);

        return response()->json([
            'message' => 'Import started successfully',
            'import' => $import,
        ]);
    }

    /**
     * Get import status.
     */
    public function status(Import $import)
    {
        // Ensure user can only access their own imports
        if ($import->user_id !== auth()->id()) {
            abort(403);
        }

        return response()->json([
            'import' => $import->load('failedRows'),
        ]);
    }

    /**
     * Delete an import.
     */
    public function destroy(Import $import)
    {
        // Ensure user can only delete their own imports
        if ($import->user_id !== auth()->id()) {
            abort(403);
        }

        // Delete the file if it exists
        if (Storage::disk('local')->exists($import->file_path)) {
            Storage::disk('local')->delete($import->file_path);
        }

        $import->delete();

        return response()->json([
            'message' => 'Import deleted successfully',
        ]);
    }
}
