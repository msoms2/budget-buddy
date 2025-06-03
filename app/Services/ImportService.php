<?php

namespace App\Services;

use App\Models\Import;
use App\Models\Expense;
use App\Models\Earning;
use App\Models\ExpenseCategory;
use App\Models\EarningCategory;
use App\Models\PaymentMethod;
use App\Imports\ExpensesImport;
use App\Imports\EarningsImport;
use App\Imports\TransactionsImport;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;

class ImportService
{
    /**
     * Determine if the file is XLSX format
     */
    private function isXlsxFile($filePath)
    {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        return $extension === 'xlsx';
    }

    /**
     * Process an expense import (CSV or XLSX).
     *
     * @param Import $import
     * @return void
     */
    public function processExpenseImport(Import $import)
    {
        if ($this->isXlsxFile($import->file_path)) {
            $this->processExpenseXlsxImport($import);
        } else {
            $this->processExpenseCsvImport($import);
        }
    }

    /**
     * Process an expense XLSX import.
     *
     * @param Import $import
     * @return void
     */
    private function processExpenseXlsxImport(Import $import)
    {
        try {
            $expensesImport = new ExpensesImport($import->user_id, $import);
            
            // Set initial progress 
            $import->update(['processed_rows' => 0, 'total_rows' => 1]);
            
            Excel::import($expensesImport, Storage::disk('local')->path($import->file_path));
            
            $processedRows = $expensesImport->getProcessedRows();
            $import->update([
                'processed_rows' => $processedRows,
                'successful_rows' => $expensesImport->getSuccessfulRows(),
                'total_rows' => $processedRows, // For XLSX, total equals processed since it's done in one go
                'completed_at' => now()
            ]);
            
        } catch (\Exception $e) {
            Log::error('XLSX Expense import failed: ' . $e->getMessage(), [
                'import_id' => $import->id,
                'user_id' => $import->user_id,
            ]);
            throw $e;
        }
    }

    /**
     * Process an expense CSV import.
     *
     * @param Import $import
     * @return void
     */
    private function processExpenseCsvImport(Import $import)
    {
        $file = fopen(Storage::disk('local')->path($import->file_path), 'r');
        
        // Skip header row
        $headers = fgetcsv($file);
        
        $totalRows = 0;
        $processedRows = 0;
        $successfulRows = 0;
        
        // Count total rows
        while (!feof($file)) {
            if (fgetcsv($file) !== false) {
                $totalRows++;
            }
        }
        rewind($file);
        fgetcsv($file); // Skip header again
        
        $import->update(['total_rows' => $totalRows]);
        
        DB::beginTransaction();
        try {
            while (($row = fgetcsv($file)) !== false) {
                $processedRows++;
                
                try {
                    // Map CSV data to model fields
                    $data = [
                        'user_id' => $import->user_id,
                        'name' => $row[1] ?? null,
                        'amount' => $row[2] ?? 0,
                        'date' => $row[3] ?? now()->format('Y-m-d'),
                        'description' => $row[5] ?? null,
                    ];
                    
                    // Set default currency if not specified
                    $defaultCurrency = \App\Models\Currency::getBase();
                    $data['currency_id'] = $defaultCurrency->id;
                    
                    // Handle category
                    if (!empty($row[4])) {
                        $category = ExpenseCategory::firstOrCreate(
                            ['name' => $row[4], 'user_id' => $import->user_id]
                        );
                        $data['category_id'] = $category->id;
                    }
                    
                    // Handle payment method
                    if (!empty($row[6])) {
                        $paymentMethod = PaymentMethod::firstOrCreate(
                            ['name' => $row[6], 'user_id' => $import->user_id]
                        );
                        $data['payment_method_id'] = $paymentMethod->id;
                    }
                    
                    // Create expense record
                    Expense::create($data);
                    $successfulRows++;
                    
                } catch (\Exception $e) {
                    Log::error('Import row failed: ' . $e->getMessage(), [
                        'import_id' => $import->id,
                        'row' => $row
                    ]);
                }
                
                // Update progress
                if ($processedRows % 50 === 0 || $processedRows === $totalRows) {
                    $import->update([
                        'processed_rows' => $processedRows,
                        'successful_rows' => $successfulRows
                    ]);
                }
            }
            
            DB::commit();
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
        
        fclose($file);
        
        $import->update([
            'processed_rows' => $processedRows,
            'successful_rows' => $successfulRows,
            'completed_at' => now()
        ]);
    }
    
    /**
     * Process an earning import (CSV or XLSX).
     *
     * @param Import $import
     * @return void
     */
    public function processEarningImport(Import $import)
    {
        if ($this->isXlsxFile($import->file_path)) {
            $this->processEarningXlsxImport($import);
        } else {
            $this->processEarningCsvImport($import);
        }
    }

    /**
     * Process an earning XLSX import.
     *
     * @param Import $import
     * @return void
     */
    private function processEarningXlsxImport(Import $import)
    {
        try {
            $earningsImport = new EarningsImport($import->user_id, $import);
            
            // Set initial progress 
            $import->update(['processed_rows' => 0, 'total_rows' => 1]);
            
            Excel::import($earningsImport, Storage::disk('local')->path($import->file_path));
            
            $processedRows = $earningsImport->getProcessedRows();
            $import->update([
                'processed_rows' => $processedRows,
                'successful_rows' => $earningsImport->getSuccessfulRows(),
                'total_rows' => $processedRows, // For XLSX, total equals processed since it's done in one go
                'completed_at' => now()
            ]);
            
        } catch (\Exception $e) {
            Log::error('XLSX Earning import failed: ' . $e->getMessage(), [
                'import_id' => $import->id,
                'user_id' => $import->user_id,
            ]);
            throw $e;
        }
    }

    /**
     * Process an earning CSV import.
     *
     * @param Import $import
     * @return void
     */
    private function processEarningCsvImport(Import $import)
    {
        $file = fopen(Storage::disk('local')->path($import->file_path), 'r');
        
        // Skip header row
        $headers = fgetcsv($file);
        
        $totalRows = 0;
        $processedRows = 0;
        $successfulRows = 0;
        
        // Count total rows
        while (!feof($file)) {
            if (fgetcsv($file) !== false) {
                $totalRows++;
            }
        }
        rewind($file);
        fgetcsv($file); // Skip header again
        
        $import->update(['total_rows' => $totalRows]);
        
        DB::beginTransaction();
        try {
            while (($row = fgetcsv($file)) !== false) {
                $processedRows++;
                
                try {
                    // Map CSV data to model fields
                    $data = [
                        'user_id' => $import->user_id,
                        'source' => $row[1] ?? null,
                        'amount' => $row[2] ?? 0,
                        'date' => $row[3] ?? now()->format('Y-m-d'),
                        'description' => $row[5] ?? null,
                    ];
                    
                    // Set default currency if not specified
                    $defaultCurrency = \App\Models\Currency::getBase();
                    $data['currency_id'] = $defaultCurrency->id;
                    
                    // Handle category
                    if (!empty($row[4])) {
                        $category = EarningCategory::firstOrCreate(
                            ['name' => $row[4], 'user_id' => $import->user_id]
                        );
                        $data['category_id'] = $category->id;
                    }
                    
                    // Create earning record
                    Earning::create($data);
                    $successfulRows++;
                    
                } catch (\Exception $e) {
                    Log::error('Import row failed: ' . $e->getMessage(), [
                        'import_id' => $import->id,
                        'row' => $row
                    ]);
                }
                
                // Update progress
                if ($processedRows % 50 === 0 || $processedRows === $totalRows) {
                    $import->update([
                        'processed_rows' => $processedRows,
                        'successful_rows' => $successfulRows
                    ]);
                }
            }
            
            DB::commit();
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
        
        fclose($file);
        
        $import->update([
            'processed_rows' => $processedRows,
            'successful_rows' => $successfulRows,
            'completed_at' => now()
        ]);
    }

    /**
     * Process a system import (CSV or XLSX).
     *
     * @param Import $import
     * @return void
     * @deprecated Use processTransactionImport instead
     */
    public function processSystemImport(Import $import)
    {
        // For backward compatibility, now just call the new method
        $this->processTransactionImport($import);
    }

    /**
     * Process a system XLSX import.
     *
     * @param Import $import
     * @return void
     */
    private function processSystemXlsxImport(Import $import)
    {
        try {
            // For system import, we need to process both expenses and earnings
            // This assumes the XLSX file has separate sheets or a type column
            $expensesImport = new ExpensesImport($import->user_id, $import);
            $earningsImport = new EarningsImport($import->user_id, $import);
            
            // Try to import as expenses first, then earnings
            // This is a simplified approach - in practice you might want to detect the content type
            try {
                Excel::import($expensesImport, Storage::disk('local')->path($import->file_path));
            } catch (\Exception $e) {
                // If expenses import fails, try earnings
                Excel::import($earningsImport, Storage::disk('local')->path($import->file_path));
            }
            
            $totalProcessed = $expensesImport->getProcessedRows() + $earningsImport->getProcessedRows();
            $totalSuccessful = $expensesImport->getSuccessfulRows() + $earningsImport->getSuccessfulRows();
            
            $import->update([
                'processed_rows' => $totalProcessed,
                'successful_rows' => $totalSuccessful,
                'total_rows' => $totalProcessed,
                'completed_at' => now()
            ]);
            
        } catch (\Exception $e) {
            Log::error('XLSX System import failed: ' . $e->getMessage(), [
                'import_id' => $import->id,
                'user_id' => $import->user_id,
            ]);
            throw $e;
        }
    }

    /**
     * Process a system-wide CSV import.
     *
     * @param Import $import
     * @return void
     */
    private function processSystemCsvImport(Import $import)
    {
        $file = fopen(Storage::disk('local')->path($import->file_path), 'r');
        
        // Skip header row
        $headers = fgetcsv($file);
        
        $totalRows = 0;
        $processedRows = 0;
        $successfulRows = 0;
        
        // Count total rows
        while (!feof($file)) {
            if (fgetcsv($file) !== false) {
                $totalRows++;
            }
        }
        rewind($file);
        fgetcsv($file); // Skip header again
        
        $import->update(['total_rows' => $totalRows]);
        
        DB::beginTransaction();
        try {
            while (($row = fgetcsv($file)) !== false) {
                $processedRows++;
                
                try {
                    $type = $row[0] ?? '';
                    
                    switch ($type) {
                        case 'expense':
                            $this->processExpenseRow($row, $import->user_id);
                            break;
                        case 'earning':
                            $this->processEarningRow($row, $import->user_id);
                            break;
                        default:
                            throw new \Exception("Unknown record type: {$type}");
                    }
                    
                    $successfulRows++;
                    
                } catch (\Exception $e) {
                    Log::error('Import row failed: ' . $e->getMessage(), [
                        'import_id' => $import->id,
                        'row' => $row
                    ]);
                }
                
                // Update progress
                if ($processedRows % 50 === 0 || $processedRows === $totalRows) {
                    $import->update([
                        'processed_rows' => $processedRows,
                        'successful_rows' => $successfulRows
                    ]);
                }
            }
            
            DB::commit();
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
        
        fclose($file);
        
        $import->update([
            'processed_rows' => $processedRows,
            'successful_rows' => $successfulRows,
            'completed_at' => now()
        ]);
    }

    /**
     * Process a transaction import (mixed expenses and earnings).
     *
     * @param Import $import
     * @return void
     */
    public function processTransactionImport(Import $import)
    {
        if ($this->isXlsxFile($import->file_path)) {
            $this->processTransactionXlsxImport($import);
        } else {
            $this->processTransactionCsvImport($import);
        }
    }

    /**
     * Process a transaction XLSX import.
     *
     * @param Import $import
     * @return void
     */
    private function processTransactionXlsxImport(Import $import)
    {
        try {
            $transactionsImport = new TransactionsImport($import->user_id, $import);
            
            // Set initial progress 
            $import->update(['processed_rows' => 0, 'total_rows' => 1]);
            
            Excel::import($transactionsImport, Storage::disk('local')->path($import->file_path));
            
            $processedRows = $transactionsImport->getProcessedRows();
            $import->update([
                'processed_rows' => $processedRows,
                'successful_rows' => $transactionsImport->getSuccessfulRows(),
                'total_rows' => $processedRows,
                'completed_at' => now()
            ]);
            
        } catch (\Exception $e) {
            Log::error('XLSX Transaction import failed: ' . $e->getMessage(), [
                'import_id' => $import->id,
                'user_id' => $import->user_id,
            ]);
            throw $e;
        }
    }

    /**
     * Process a transaction CSV import.
     *
     * @param Import $import
     * @return void
     */
    private function processTransactionCsvImport(Import $import)
    {
        try {
            $transactionsImport = new TransactionsImport($import->user_id, $import);
            
            // Set initial progress 
            $import->update(['processed_rows' => 0, 'total_rows' => 1]);
            
            Excel::import($transactionsImport, Storage::disk('local')->path($import->file_path));
            
            $processedRows = $transactionsImport->getProcessedRows();
            $import->update([
                'processed_rows' => $processedRows,
                'successful_rows' => $transactionsImport->getSuccessfulRows(),
                'total_rows' => $processedRows,
                'completed_at' => now()
            ]);
            
        } catch (\Exception $e) {
            Log::error('CSV Transaction import failed: ' . $e->getMessage(), [
                'import_id' => $import->id,
                'user_id' => $import->user_id,
            ]);
            throw $e;
        }
    }

    /**
     * Determine the import type based on the file headers.
     *
     * @param string $filePath
     * @return string
     */
    public function detectImportType($filePath)
    {
        try {
            $file = fopen(Storage::disk('local')->path($filePath), 'r');
            $headers = fgetcsv($file);
            fclose($file);
            
            if (!$headers) {
                return 'unknown';
            }
            
            // Convert headers to lowercase for comparison
            $headers = array_map('strtolower', $headers);
            
            // Check if it has 'type' column - indicates mixed transactions
            if (in_array('type', $headers)) {
                return 'transactions';
            }
            
            // Check for earning-specific patterns
            if (in_array('source', $headers) || 
                (in_array('earning', $headers) || in_array('income', $headers))) {
                return 'earnings';
            }
            
            // Default to expenses for other cases
            return 'expenses';
            
        } catch (\Exception $e) {
            Log::error('Failed to detect import type: ' . $e->getMessage());
            return 'unknown';
        }
    }

    /**
     * Process an import based on auto-detected type.
     *
     * @param Import $import
     * @return void
     */
    public function processImportByType(Import $import)
    {
        $type = $this->detectImportType($import->file_path);
        
        switch ($type) {
            case 'transactions':
                $this->processTransactionImport($import);
                break;
            case 'earnings':
                $this->processEarningImport($import);
                break;
            case 'expenses':
            default:
                $this->processExpenseImport($import);
                break;
        }
    }

    /**
     * Process a single expense row from the system import.
     *
     * @param array $row
     * @param int $userId
     * @return void
     */
    private function processExpenseRow($row, $userId)
    {
        $data = [
            'user_id' => $userId,
            'name' => $row[2] ?? null,
            'amount' => $row[3] ?? 0,
            'date' => $row[4] ?? now()->format('Y-m-d'),
            'description' => $row[6] ?? null,
        ];
        
        // Handle category
        if (!empty($row[5])) {
            $category = ExpenseCategory::firstOrCreate(
                ['name' => $row[5], 'user_id' => $userId]
            );
            $data['expense_category_id'] = $category->id;
        }
        
        // Handle payment method
        if (!empty($row[7])) {
            $paymentMethod = PaymentMethod::firstOrCreate(
                ['name' => $row[7], 'user_id' => $userId]
            );
            $data['payment_method_id'] = $paymentMethod->id;
        }
        
        Expense::create($data);
    }

    /**
     * Process a single earning row from the system import.
     *
     * @param array $row
     * @param int $userId
     * @return void
     */
    private function processEarningRow($row, $userId)
    {
        $data = [
            'user_id' => $userId,
            'source' => $row[2] ?? null,
            'amount' => $row[3] ?? 0,
            'date' => $row[4] ?? now()->format('Y-m-d'),
            'description' => $row[6] ?? null,
        ];
        
        // Handle category
        if (!empty($row[5])) {
            $category = EarningCategory::firstOrCreate(
                ['name' => $row[5], 'user_id' => $userId]
            );
            $data['earning_category_id'] = $category->id;
        }
        
        Earning::create($data);
    }
}
