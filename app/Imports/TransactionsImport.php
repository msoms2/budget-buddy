<?php

namespace App\Imports;

use App\Models\Expense;
use App\Models\Earning;
use App\Models\ExpenseCategory;
use App\Models\EarningCategory;
use App\Models\PaymentMethod;
use App\Models\Currency;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Carbon\Carbon;

class TransactionsImport implements ToModel, WithHeadingRow, WithValidation, SkipsOnError
{
    use Importable, SkipsErrors;

    protected $userId;
    protected $importRecord;
    protected $processedRows = 0;
    protected $successfulRows = 0;

    public function __construct($userId, $importRecord = null)
    {
        $this->userId = $userId;
        $this->importRecord = $importRecord;
    }

    protected function getUser()
    {
        return \App\Models\User::find($this->userId);
    }

    public function model(array $row)
    {
        $this->processedRows++;

        try {
            $user = $this->getUser();
            $userCurrency = $user->currency;

            // Determine transaction type
            $type = strtolower($row['type'] ?? 'expense');
            
            // Handle category based on type
            $categoryId = null;
            if (!empty($row['category'])) {
                if ($type === 'earning') {
                    $category = EarningCategory::firstOrCreate(
                        ['name' => $row['category'], 'user_id' => $this->userId],
                        ['user_id' => $this->userId]
                    );
                } else {
                    $category = ExpenseCategory::firstOrCreate(
                        ['name' => $row['category'], 'user_id' => $this->userId],
                        ['user_id' => $this->userId]
                    );
                }
                $categoryId = $category->id;
            }

            // Handle payment method
            $paymentMethodId = null;
            if (!empty($row['payment_method'])) {
                $paymentMethod = PaymentMethod::firstOrCreate(
                    ['name' => $row['payment_method'], 'user_id' => $this->userId],
                    ['name' => $row['payment_method'], 'user_id' => $this->userId]
                );
                $paymentMethodId = $paymentMethod->id;
            }

            // Handle currency and amount conversion
            $amount = floatval($row['amount'] ?? 0);
            $originalAmount = floatval($row['original_amount'] ?? $amount);
            $exchangeRate = floatval($row['exchange_rate'] ?? 1);
            
            // Get or set transaction currency
            $transactionCurrency = null;
            if (!empty($row['currency'])) {
                $transactionCurrency = Currency::where('code', $row['currency'])->first();
            }
            
            // If no transaction currency specified, use user's default
            if (!$transactionCurrency) {
                $transactionCurrency = $userCurrency;
            }
            
            // Convert amount if currencies differ
            if ($transactionCurrency && $userCurrency && $transactionCurrency->id !== $userCurrency->id) {
                if (!isset($row['original_amount'])) {
                    // If no original amount provided, current amount is original
                    $originalAmount = $amount;
                    $exchangeRate = $transactionCurrency->getExchangeRate($userCurrency);
                    $amount = $originalAmount * $exchangeRate;
                }
            }

            // Parse date
            $date = now()->format('Y-m-d');
            if (!empty($row['date'])) {
                try {
                    $date = Carbon::parse($row['date'])->format('Y-m-d');
                } catch (\Exception $e) {
                    // Use current date if parsing fails
                }
            }

            // Create the appropriate model based on type
            if ($type === 'earning') {
                $transaction = new Earning([
                    'user_id' => $this->userId,
                    'name' => $row['name'] ?? $row['description'] ?? 'Imported Earning',
                    'amount' => $amount,
                    'original_amount' => $originalAmount,
                    'exchange_rate' => $exchangeRate,
                    'date' => $date,
                    'description' => $row['description'] ?? null,
                    'category_id' => $categoryId,
                    'payment_method_id' => $paymentMethodId,
                    'currency_id' => $transactionCurrency ? $transactionCurrency->id : null,
                ]);
            } else {
                $transaction = new Expense([
                    'user_id' => $this->userId,
                    'name' => $row['name'] ?? $row['description'] ?? 'Imported Expense',
                    'amount' => $amount,
                    'original_amount' => $originalAmount,
                    'exchange_rate' => $exchangeRate,
                    'date' => $date,
                    'description' => $row['description'] ?? null,
                    'category_id' => $categoryId,
                    'payment_method_id' => $paymentMethodId,
                    'currency_id' => $transactionCurrency ? $transactionCurrency->id : null,
                ]);
            }

            $this->successfulRows++;

            // Update import progress if we have the import record
            if ($this->importRecord && $this->processedRows % 10 === 0) {
                $this->importRecord->update([
                    'processed_rows' => $this->processedRows,
                    'successful_rows' => $this->successfulRows,
                ]);
            }

            return $transaction;

        } catch (\Exception $e) {
            // Log failed row if we have the import record
            if ($this->importRecord) {
                $this->importRecord->failedRows()->create([
                    'data' => json_encode($row),
                    'validation_error' => $e->getMessage()
                ]);
            }
            
            throw $e;
        }
    }

    public function rules(): array
    {
        return [
            'type' => 'nullable|string|in:expense,earning',
            'name' => 'nullable|string|max:255',
            'amount' => 'required|numeric|min:0',
            'original_amount' => 'nullable|numeric|min:0',
            'exchange_rate' => 'nullable|numeric|min:0',
            'date' => 'nullable|date',
            'description' => 'nullable|string|max:1000',
            'category' => 'nullable|string|max:255',
            'payment_method' => 'nullable|string|max:255',
            'currency' => 'nullable|string|max:10|exists:currencies,code',
        ];
    }

    public function getProcessedRows()
    {
        return $this->processedRows;
    }

    public function getSuccessfulRows()
    {
        return $this->successfulRows;
    }
}
