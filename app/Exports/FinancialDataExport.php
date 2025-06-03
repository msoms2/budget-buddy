<?php

namespace App\Exports;

use App\Models\Transaction;
use App\Models\Expense;
use App\Models\Earning;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\Exportable;

class FinancialDataExport implements WithMultipleSheets
{
    use Exportable;

    protected $type;
    protected $userId;
    protected $chunkSize = 1000; // Process data in chunks to avoid memory issues

    public function __construct($type, $userId)
    {
        $this->type = $type;
        $this->userId = $userId;
    }

    public function sheets(): array
    {
        $sheets = [];

        try {
            switch ($this->type) {
                case 'expenses':
                    $sheets[] = new ExpensesSheet($this->userId, $this->chunkSize);
                    break;
                case 'earnings':
                    $sheets[] = new EarningsSheet($this->userId, $this->chunkSize);
                    break;
                case 'all':
                default:
                    $sheets[] = new TransactionsSheet($this->userId, $this->chunkSize);
                    $sheets[] = new ExpensesSheet($this->userId, $this->chunkSize);
                    $sheets[] = new EarningsSheet($this->userId, $this->chunkSize);
                    break;
            }
        } catch (\Exception $e) {
            \Log::error('Error creating export sheets: ' . $e->getMessage(), [
                'userId' => $this->userId,
                'type' => $this->type,
                'exception' => $e
            ]);
            throw $e;
        }

        return $sheets;
    }
}

class TransactionsSheet implements FromCollection, WithHeadings, WithMapping
{
    protected $userId;
    protected $chunkSize;

    public function __construct($userId, $chunkSize = 1000)
    {
        $this->userId = $userId;
        $this->chunkSize = $chunkSize;
    }

    public function collection()
    {
        try {
            // Get expenses and map them to a common format - using chunk to reduce memory usage
            $expenses = collect();
            Expense::where('user_id', $this->userId)
                ->with(['category', 'paymentMethod', 'currency'])
                ->orderBy('id')
                ->chunk($this->chunkSize, function ($chunk) use (&$expenses) {
                    foreach ($chunk as $expense) {
                        $expenses->push((object) [
                            'id' => 'expense-' . $expense->id,
                            'date' => $expense->date,
                            'type' => 'expense',
                            'name' => $expense->name,
                            'description' => $expense->description,
                            'amount' => $expense->amount,
                            'currency' => $expense->currency,
                            'category' => $expense->category,
                            'paymentMethod' => $expense->paymentMethod,
                            'created_at' => $expense->created_at,
                        ]);
                    }
                });

            // Get earnings and map them to a common format - using chunk to reduce memory usage
            $earnings = collect();
            Earning::where('user_id', $this->userId)
                ->with(['category', 'paymentMethod', 'currency'])
                ->orderBy('id')
                ->chunk($this->chunkSize, function ($chunk) use (&$earnings) {
                    foreach ($chunk as $earning) {
                        $earnings->push((object) [
                            'id' => 'earning-' . $earning->id,
                            'date' => $earning->date,
                            'type' => 'earning',
                            'name' => $earning->name,
                            'description' => $earning->description,
                            'amount' => $earning->amount,
                            'currency' => $earning->currency,
                            'category' => $earning->category,
                            'paymentMethod' => $earning->paymentMethod,
                            'created_at' => $earning->created_at,
                        ]);
                    }
                });

            // Combine and sort by date (newest first)
            return $expenses->concat($earnings)->sortByDesc('date')->values();
        } catch (\Exception $e) {
            \Log::error('Error in TransactionsSheet collection: ' . $e->getMessage(), [
                'userId' => $this->userId,
                'exception' => $e
            ]);
            throw $e;
        }
    }

    public function headings(): array
    {
        return [
            'type',
            'name',
            'amount',
            'original_amount',
            'currency',
            'exchange_rate',
            'date',
            'category',
            'description',
            'payment_method'
        ];
    }

    public function map($transaction): array
    {
        $userCurrency = auth()->user()->currency;
        $transactionCurrency = $transaction->currency;
        
        // Calculate exchange rate and converted amount if currencies differ
        $exchangeRate = 1;
        $originalAmount = $transaction->amount;
        $convertedAmount = $transaction->amount;
        
        if ($transactionCurrency && $userCurrency && $transactionCurrency->id !== $userCurrency->id) {
            $exchangeRate = $transactionCurrency->getExchangeRate($userCurrency);
            $convertedAmount = $originalAmount * $exchangeRate;
        }

        return [
            $transaction->type,
            $transaction->name,
            $convertedAmount,
            $originalAmount,
            $transactionCurrency ? $transactionCurrency->code : '',
            $exchangeRate,
            $transaction->date instanceof \Carbon\Carbon ? $transaction->date->format('Y-m-d') : $transaction->date,
            $transaction->category ? $transaction->category->name : '',
            $transaction->description ?? '',
            $transaction->paymentMethod ? $transaction->paymentMethod->name : ''
        ];
    }
}

class ExpensesSheet implements FromCollection, WithHeadings, WithMapping
{
    protected $userId;
    protected $chunkSize;

    public function __construct($userId, $chunkSize = 1000)
    {
        $this->userId = $userId;
        $this->chunkSize = $chunkSize;
    }

    public function collection()
    {
        try {
            $expenses = collect();
            
            Expense::where('user_id', $this->userId)
                ->with(['category', 'paymentMethod', 'currency'])
                ->orderBy('date', 'desc')
                ->chunk($this->chunkSize, function($chunk) use (&$expenses) {
                    foreach ($chunk as $expense) {
                        $expenses->push($expense);
                    }
                });
                
            return $expenses;
        } catch (\Exception $e) {
            \Log::error('Error in ExpensesSheet collection: ' . $e->getMessage(), [
                'userId' => $this->userId,
                'exception' => $e
            ]);
            throw $e;
        }
    }

    public function headings(): array
    {
        return [
            'type',
            'name',
            'amount',
            'original_amount',
            'currency',
            'exchange_rate',
            'date',
            'category',
            'description',
            'payment_method'
        ];
    }

    public function map($expense): array
    {
        $userCurrency = auth()->user()->currency;
        $expenseCurrency = $expense->currency;
        
        // Calculate exchange rate and converted amount if currencies differ
        $exchangeRate = 1;
        $originalAmount = $expense->amount;
        $convertedAmount = $expense->amount;
        
        if ($expenseCurrency && $userCurrency && $expenseCurrency->id !== $userCurrency->id) {
            $exchangeRate = $expenseCurrency->getExchangeRate($userCurrency);
            $convertedAmount = $originalAmount * $exchangeRate;
        }

        return [
            'expense',
            $expense->name ?? '',
            $convertedAmount,
            $originalAmount,
            $expenseCurrency ? $expenseCurrency->code : '',
            $exchangeRate,
            $expense->date instanceof \Carbon\Carbon ? $expense->date->format('Y-m-d') : $expense->date,
            $expense->category ? $expense->category->name : '',
            $expense->description ?? '',
            $expense->paymentMethod ? $expense->paymentMethod->name : ''
        ];
    }
}

class EarningsSheet implements FromCollection, WithHeadings, WithMapping
{
    protected $userId;
    protected $chunkSize;

    public function __construct($userId, $chunkSize = 1000)
    {
        $this->userId = $userId;
        $this->chunkSize = $chunkSize;
    }

    public function collection()
    {
        try {
            $earnings = collect();
            
            Earning::where('user_id', $this->userId)
                ->with(['category', 'paymentMethod', 'currency'])
                ->orderBy('date', 'desc')
                ->chunk($this->chunkSize, function($chunk) use (&$earnings) {
                    foreach ($chunk as $earning) {
                        $earnings->push($earning);
                    }
                });
                
            return $earnings;
        } catch (\Exception $e) {
            \Log::error('Error in EarningsSheet collection: ' . $e->getMessage(), [
                'userId' => $this->userId,
                'exception' => $e
            ]);
            throw $e;
        }
    }

    public function headings(): array
    {
        return [
            'type',
            'name',
            'amount',
            'original_amount',
            'currency',
            'exchange_rate',
            'date',
            'category',
            'description',
            'payment_method'
        ];
    }

    public function map($earning): array
    {
        $userCurrency = auth()->user()->currency;
        $earningCurrency = $earning->currency;
        
        // Calculate exchange rate and converted amount if currencies differ
        $exchangeRate = 1;
        $originalAmount = $earning->amount;
        $convertedAmount = $earning->amount;
        
        if ($earningCurrency && $userCurrency && $earningCurrency->id !== $userCurrency->id) {
            $exchangeRate = $earningCurrency->getExchangeRate($userCurrency);
            $convertedAmount = $originalAmount * $exchangeRate;
        }

        return [
            'earning',
            $earning->name ?? '',
            $convertedAmount,
            $originalAmount,
            $earningCurrency ? $earningCurrency->code : '',
            $exchangeRate,
            $earning->date instanceof \Carbon\Carbon ? $earning->date->format('Y-m-d') : $earning->date,
            $earning->category ? $earning->category->name : '',
            $earning->description ?? '',
            $earning->paymentMethod ? $earning->paymentMethod->name : ''
        ];
    }
}