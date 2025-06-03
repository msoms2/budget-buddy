<?php

namespace App\Jobs;

use App\Models\Import;
use App\Services\ImportService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\Currency;
use App\Models\Category;
use App\Models\PaymentMethod;
use App\Models\Expense;
use Carbon\Carbon;

class ProcessImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $import;

    /**
     * Create a new job instance.
     *
     * @param  Import  $import
     * @return void
     */
    public function __construct(Import $import)
    {
        $this->import = $import;
    }

    /**
     * Execute the job.
     *
     * @param  ImportService  $importService
     * @return void
     */
    public function handle(ImportService $importService)
    {
        $filePath = Storage::disk('local')->path($this->filePath);
        $data = $this->importClass->toArray(filePath: $filePath, disk: 'local')[0] ?? [];

        DB::beginTransaction();
        try {
            foreach ($data as $row) {
                if (empty($row['amount']) || !is_numeric($row['amount'])) {
                    continue;
                }

                // Handle currency detection and conversion
                $currency = null;
                if (!empty($row['currency'])) {
                    $currency = Currency::where('code', strtoupper($row['currency']))
                        ->orWhere('symbol', $row['currency'])
                        ->first();
                }

                // Fallback to user's default currency if not found
                if (!$currency) {
                    $currency = $this->user->currency ?? Currency::getDefaultCurrency();
                }

                $category = $this->findOrCreateCategory($row['category'] ?? '');
                $paymentMethod = $this->findOrCreatePaymentMethod($row['payment_method'] ?? '');

                $expense = new Expense([
                    'name' => $row['name'] ?? 'Imported Expense',
                    'amount' => $row['amount'],
                    'description' => $row['description'] ?? '',
                    'date' => Carbon::parse($row['date']) ?? now(),
                    'user_id' => $this->user->id,
                    'category_id' => $category->id,
                    'payment_method_id' => $paymentMethod->id,
                    'currency_id' => $currency->id,
                ]);

                $expense->save();
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    protected function findOrCreateCategory($name)
    {
        if (empty($name)) {
            return Category::firstOrCreate(
                ['name' => 'Uncategorized'],
                ['user_id' => $this->user->id]
            );
        }

        return Category::firstOrCreate(
            ['name' => $name, 'user_id' => $this->user->id],
            ['user_id' => $this->user->id]
        );
    }

    protected function findOrCreatePaymentMethod($name)
    {
        if (empty($name)) {
            return PaymentMethod::firstOrCreate(
                ['name' => 'Other'],
                ['user_id' => $this->user->id]
            );
        }

        return PaymentMethod::firstOrCreate(
            ['name' => $name, 'user_id' => $this->user->id],
            ['user_id' => $this->user->id]
        );
    }
}
