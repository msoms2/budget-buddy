<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\ExpenseCategory;
use App\Models\EarningCategory;
use App\Models\Expense;
use App\Models\Earning;
use App\Models\PaymentSchedule;
use App\Traits\CurrencyHelper;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class TransactionController extends Controller
{
    use AuthorizesRequests, CurrencyHelper;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Get expenses with payment schedules
        $expensesQuery = Expense::where('user_id', Auth::id())
            ->with(['category', 'subcategory', 'user']);
            
        // Get earnings with payment schedules
        $earningsQuery = Earning::where('user_id', Auth::id())
            ->with(['category', 'subcategory', 'user']);

        // Apply type filter - if type is set to 'income', exclude expenses, and vice versa
        $includeExpenses = !$request->filled('type') || $request->type === 'expense';
        $includeEarnings = !$request->filled('type') || $request->type === 'income';

        // Get active payment schedules
        $paymentSchedules = PaymentSchedule::where('user_id', Auth::id())
            ->when($request->filter, function($query, $filter) {
                return $query->where('status', $filter);
            })
            ->when($request->type, function($query, $type) {
                return $query->where('type', $type);
            })
            ->orderBy($request->sort ?? 'due_date', $request->direction ?? 'asc')
            ->with(['category', 'subcategory'])
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => 'schedule-' . $schedule->id,
                    'name' => $schedule->name,
                    'description' => $schedule->description,
                    'amount' => $schedule->type === 'expense' ? -$schedule->amount : $schedule->amount,
                    'next_date' => $schedule->due_date,
                    'category' => $schedule->category ? $schedule->category->name : 'Uncategorized',
                    'category_id' => $schedule->category_id,
                    'subcategory_id' => $schedule->subcategory_id,
                    'type' => $schedule->type,
                    'frequency' => $schedule->frequency,
                    'is_scheduled' => true,
                    'raw_amount' => $schedule->amount
                ];
            });

        // Apply filters to both queries
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            
            $expensesQuery->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('description', 'like', '%' . $searchTerm . '%')
                  ->orWhereHas('category', function($q) use ($searchTerm) {
                      $q->where('name', 'like', '%' . $searchTerm . '%');
                  });
                if (is_numeric($searchTerm)) {
                    $q->orWhere('amount', $searchTerm);
                }
            });
        }

        // Calculate the total income and expenses from the database directly
        $totalIncome = Earning::where('user_id', Auth::id())->sum('amount');
        $totalExpenses = Expense::where('user_id', Auth::id())->sum('amount');

        // Apply filters and get results
        $expenses = $includeExpenses ? $expensesQuery->with('currency')->get()->map(function ($expense) {
            // Determine the category name to show - prefer subcategory if available
            $categoryName = 'Uncategorized';
            if ($expense->subcategory) {
                $categoryName = $expense->subcategory->name;
            } else if ($expense->category) {
                $categoryName = $expense->category->name;
            }
            
            return [
                'id' => 'expense-' . $expense->id,
                'name' => $expense->name,
                'description' => $expense->description,
                'amount' => -$expense->amount,
                'original_amount' => $expense->original_amount,
                'exchange_rate' => $expense->exchange_rate,
                'currency_id' => $expense->currency_id,
                'currency' => $expense->currency,
                'date' => $expense->date,
                'category' => $categoryName,
                'category_id' => $expense->category_id,
                'subcategory_id' => $expense->subcategory_id,
                'type' => 'expense',
                'raw_amount' => $expense->amount
            ];
        }) : collect([]);

        $earnings = $includeEarnings ? $earningsQuery->with('currency')->get()->map(function ($earning) {
            // Determine the category name to show - prefer subcategory if available
            $categoryName = 'Uncategorized';
            if ($earning->subcategory) {
                $categoryName = $earning->subcategory->name;
            } else if ($earning->category) {
                $categoryName = $earning->category->name;
            }
            
            return [
                'id' => 'income-' . $earning->id,
                'name' => $earning->name,
                'description' => $earning->description,
                'amount' => $earning->amount,
                'original_amount' => $earning->original_amount,
                'exchange_rate' => $earning->exchange_rate,
                'currency_id' => $earning->currency_id,
                'currency' => $earning->currency,
                'date' => $earning->date,
                'category' => $categoryName,
                'category_id' => $earning->category_id,
                'subcategory_id' => $earning->subcategory_id,
                'type' => 'income',
                'raw_amount' => $earning->amount
            ];
        }) : collect([]);

        // Combine transactions and payment schedules
        $collection = $expenses->concat($earnings)->concat($paymentSchedules);
        
        // Apply sorting
        $sortField = $request->input('sort_by', 'date');
        $sortDirection = $request->input('sort_direction', 'desc');
        
        if ($sortField === 'amount') {
            // Sort by raw_amount for consistent sorting
            $collection = $sortDirection === 'asc' 
                ? $collection->sortBy('raw_amount')
                : $collection->sortByDesc('raw_amount');
        } else {
            $collection = $sortDirection === 'asc' 
                ? $collection->sortBy($sortField)
                : $collection->sortByDesc($sortField);
        }

        // Paginate the results
        $perPage = 15;
        $page = $request->input('page', 1);
        $total = $collection->count();
        $items = $collection->forPage($page, $perPage)->values()->all();
        
        // Create a paginator
        $paginator = new \Illuminate\Pagination\LengthAwarePaginator(
            $items,
            $total,
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        // Get categories for filtering
        $expenseCategories = ExpenseCategory::where('user_id', Auth::id())
            ->get()
            ->map(function ($category) {
                $category->category_type = 'expense';
                return $category;
            });
            
        $earningCategories = EarningCategory::where('user_id', Auth::id())
            ->get()
            ->map(function ($category) {
                $category->category_type = 'income';
                return $category;
            });

        $allCategories = $expenseCategories->concat($earningCategories);

        // Create stats object with direct database totals
        $stats = [
            'transactions' => [
                'income' => $totalIncome,
                'expenses' => $totalExpenses
            ],
            'schedules' => [
                'upcoming' => PaymentSchedule::upcoming()->count(),
                'overdue' => PaymentSchedule::overdue()->count(),
                'recurring' => PaymentSchedule::recurring()->count(),
                'completed' => PaymentSchedule::completed()->count()
            ]
        ];
        
        // Add debug logging for stats structure
        \Illuminate\Support\Facades\Log::debug('Stats data:', ['stats' => $stats]);

        // Get user's preferred currency with proper loading
        $userCurrency = $this->getUserCurrency();
        
        // Get authenticated user with currency relationship
        $user = Auth::user();
        $user->load('currency');

        // Return the view with data
        return Inertia::render('Transactions/Index', [
            'transactions' => $paginator,
            'categories' => $allCategories,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'type' => $request->type,
                'category' => $request->category,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
                'amount_min' => $request->amount_min,
                'amount_max' => $request->amount_max,
                'sort_by' => $sortField,
                'sort_direction' => $sortDirection,
            ],
            'currencies' => \App\Models\Currency::all(),
            'paymentMethods' => \App\Models\PaymentMethod::all(),
            'userCurrency' => $userCurrency,
            'currentCurrency' => $user->currency ?: \App\Models\Currency::where('is_default', true)->first(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Fetch expense categories for the authenticated user
        $expenseCategories = ExpenseCategory::where('user_id', Auth::id())->get();
        
        // Fetch earning categories for the authenticated user
        $earningCategories = EarningCategory::where('user_id', Auth::id())->get();
        
        // Add type identifier to each category
        $expenseCategories = $expenseCategories->map(function ($category) {
            $category->category_type = 'expense';
            return $category;
        });
        
        $earningCategories = $earningCategories->map(function ($category) {
            $category->category_type = 'income';
            return $category;
        });
        
        // Combine both category types
        $allCategories = $expenseCategories->concat($earningCategories);

        // Pass both category types to the Inertia view
        return Inertia::render('Transactions/Create', [
            'categories' => $allCategories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:income,expense',
            'date' => 'required|date',
            'description' => 'nullable|string|max:255',
            'category_id' => [
                'nullable',
                function ($attribute, $value, $fail) use ($request) {
                    if ($value) {
                        $tableName = $request->type === 'income' ? 'earning_categories' : 'expense_categories';
                        $exists = \Illuminate\Support\Facades\DB::table($tableName)
                            ->where('id', $value)
                            ->where('user_id', Auth::id())
                            ->exists();
                        if (!$exists) {
                            $fail('The selected category is invalid.');
                        }
                    }
                }
            ],
            'subcategory_id' => [
                'nullable',
                function ($attribute, $value, $fail) use ($request) {
                    if ($value && $request->category_id) {
                        $tableName = $request->type === 'income' ? 'earning_categories' : 'expense_categories';
                        $exists = \Illuminate\Support\Facades\DB::table($tableName)
                            ->where('id', $value)
                            ->where('parent_id', $request->category_id)
                            ->where('user_id', Auth::id())
                            ->exists();
                        if (!$exists) {
                            $fail('The selected subcategory is invalid or does not belong to the selected category.');
                        }
                    }
                }
            ],
            'payment_method' => 'nullable|string|max:50',
            'is_recurring' => 'boolean',
            'recurring_frequency' => 'nullable|string|max:50',
            'currency_id' => 'nullable|exists:currencies,id',
        ]);

        // Determine the currency to use
        $currencyId = $validated['currency_id'] ?? (Auth::user()->currency_id ?? \App\Models\Currency::getDefaultCurrency()->id);
        $currency = \App\Models\Currency::find($currencyId);
        $baseCurrency = \App\Models\Currency::getDefaultCurrency();

        // Store original amount and calculate exchange rate
        $originalAmount = $validated['amount'];
        
        // If transaction currency is the same as user's default currency, no conversion needed
        if ($currency && $baseCurrency && $currency->id === $baseCurrency->id) {
            $exchangeRate = 1.0;
            $amountInBase = $originalAmount;
        } else {
            // Calculate the direct exchange rate between transaction currency and user's default currency
            $exchangeRate = $currency && $baseCurrency ? $currency->getExchangeRate($baseCurrency) : 1.0;
            $amountInBase = $originalAmount * $exchangeRate;
            
            // Log the conversion for debugging
            \Illuminate\Support\Facades\Log::info('Currency conversion', [
                'from_currency' => $currency ? $currency->code : 'unknown',
                'to_currency' => $baseCurrency ? $baseCurrency->code : 'unknown',
                'original_amount' => $originalAmount,
                'exchange_rate' => $exchangeRate,
                'converted_amount' => $amountInBase
            ]);
        }

        $data = [
            'name' => $validated['name'],
            'amount' => $amountInBase,
            'original_amount' => $originalAmount,
            'exchange_rate' => $exchangeRate,
            'currency_id' => $currencyId,
            'date' => $validated['date'],
            'description' => $validated['description'],
            'category_id' => $validated['category_id'],
            'subcategory_id' => $validated['subcategory_id'] ?? null,
            'payment_method' => $validated['payment_method'] ?? null,
            'is_recurring' => $validated['is_recurring'] ?? false,
            'frequency' => $validated['recurring_frequency'] ?? null,
        ];

        if ($validated['type'] === 'income') {
            // For Earning, add original_amount and exchange_rate if not present in fillable
            Auth::user()->earnings()->create($data);
        } else {
            Auth::user()->expenses()->create($data);
        }

        return redirect()->route('transactions.index')->with('success', 'Transaction added successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id): Response
    {
        $type = explode('-', $id)[0];
        $actualId = explode('-', $id)[1];
        
        if ($type === 'expense') {
            $transaction = Expense::with(['category', 'subcategory'])->findOrFail($actualId);
        } else {
            $transaction = Earning::with(['category', 'subcategory'])->findOrFail($actualId);
        }
        
        return Inertia::render('Transactions/Show', [
            'transaction' => array_merge($transaction->toArray(), ['type' => $type])
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, string $id): Response
    {
        $type = explode('-', $id)[0];
        $actualId = explode('-', $id)[1];
        
        if ($type === 'expense') {
            $transaction = Expense::with(['category', 'subcategory'])->findOrFail($actualId);
            $categories = ExpenseCategory::where('user_id', Auth::id())->whereNull('parent_id')->get();
            $subcategories = $transaction->category_id ? 
                ExpenseCategory::where('parent_id', $transaction->category_id)->where('user_id', Auth::id())->get() : 
                [];
        } else {
            $transaction = Earning::with(['category', 'subcategory'])->findOrFail($actualId);
            $categories = EarningCategory::where('user_id', Auth::id())->whereNull('parent_id')->get();
            $subcategories = $transaction->category_id ? 
                EarningCategory::where('parent_id', $transaction->category_id)->where('user_id', Auth::id())->get() : 
                [];
        }
        
        return Inertia::render('Transactions/Edit', [
            'transaction' => array_merge($transaction->toArray(), ['type' => $type]),
            'categories' => $categories,
            'subcategories' => $subcategories
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $type = explode('-', $id)[0];
        $actualId = explode('-', $id)[1];
        
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'name' => 'required|string|max:255',
            'date' => 'required|date',
            'description' => 'nullable|string|max:255',
            'category_id' => [
                'nullable',
                function ($attribute, $value, $fail) use ($type) {
                    if ($value) {
                        $tableName = $type === 'income' ? 'earning_categories' : 'expense_categories';
                        $exists = \Illuminate\Support\Facades\DB::table($tableName)
                            ->where('id', $value)
                            ->where('user_id', Auth::id())
                            ->exists();
                        
                        if (!$exists) {
                            $fail('The selected category is invalid.');
                        }
                    }
                }
            ],
            'subcategory_id' => [
                'nullable',
                function ($attribute, $value, $fail) use ($request, $type) {
                    if ($value && $request->category_id) {
                        $tableName = $type === 'income' ? 'earning_categories' : 'expense_categories';
                        $exists = \Illuminate\Support\Facades\DB::table($tableName)
                            ->where('id', $value)
                            ->where('parent_id', $request->category_id)
                            ->where('user_id', Auth::id())
                            ->exists();
                        
                        if (!$exists) {
                            $fail('The selected subcategory is invalid or does not belong to the selected category.');
                        }
                    }
                }
            ],
            'payment_method' => 'nullable|string|max:50',
            'is_recurring' => 'boolean',
            'recurring_frequency' => 'nullable|string|max:50',
            'currency_id' => 'nullable|exists:currencies,id',
        ]);
        
        if ($type === 'expense') {
            $transaction = Expense::findOrFail($actualId);
        } else {
            $transaction = Earning::findOrFail($actualId);
        }

        // Get the transaction's current currency and the target currency
        $currentCurrency = $transaction->currency;
        $targetCurrencyId = $validated['currency_id'] ?? $transaction->currency_id;
        $targetCurrency = \App\Models\Currency::find($targetCurrencyId);
        
        // Handle currency conversion if the currency is changing
        if ($currentCurrency && $targetCurrency && $currentCurrency->id !== $targetCurrency->id) {
            // Disable auto-loading to prevent model mutators from auto-converting
            $transaction->disableAutoLoading();
            
            // Convert the amount from current currency to target currency
            $amount = $validated['amount'];
            $exchangeRate = $currentCurrency->getExchangeRate($targetCurrency);
            $convertedAmount = $currentCurrency->convertTo($amount, $targetCurrency);
            
            // Handle very large exchange rates (for cryptocurrencies)
            // MySQL DECIMAL can handle large values but has precision limits
            // We'll scale down if needed to stay within database limits
            if ($exchangeRate > 9999.99) {
                // We need to store the exchange rate in a way that can be recovered
                // Scale it down by a factor and store that factor for later use
                $scaleFactor = 1000.0; // or any suitable scaling factor
                $scaledExchangeRate = $exchangeRate / $scaleFactor;
                
                // Add exchange rate and scaling information
                $validated['original_amount'] = $amount;
                $validated['exchange_rate'] = $scaledExchangeRate;
                $validated['amount'] = $convertedAmount;
                
                // Add a note to the transaction description about scaling
                if (!isset($validated['description']) || empty($validated['description'])) {
                    $validated['description'] = "Converted with scaled rate: original {$currentCurrency->code}{$amount} → {$targetCurrency->code}{$convertedAmount}";
                } else {
                    $validated['description'] .= " (Converted with scaled rate: original {$currentCurrency->code}{$amount} → {$targetCurrency->code}{$convertedAmount})";
                }
            } else {
                // Normal exchange rate case
                $validated['original_amount'] = $amount;
                $validated['exchange_rate'] = $exchangeRate;
                $validated['amount'] = $convertedAmount;
            }
        }
        
        $transaction->update($validated);
        
        return redirect()->route('transactions.index')
            ->with('success', 'Transaction updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $type = explode('-', $id)[0];
        $actualId = explode('-', $id)[1];
        
        if ($type === 'expense') {
            $transaction = Expense::findOrFail($actualId);
        } else {
            $transaction = Earning::findOrFail($actualId);
        }
        
        $transaction->delete();
        
        return redirect()->route('transactions.index')
            ->with('success', 'Transaction deleted successfully!');
    }

    /**
     * Calculate combined statistics for transactions and payment schedules
     */
    private function calculateCombinedStats($collection): array
    {
        // Calculate transaction stats
        $transactionStats = [
            'income' => 0,
            'expenses' => 0
        ];

        // Calculate schedule stats
        $scheduleStats = [
            'upcoming' => PaymentSchedule::upcoming()->count(),
            'overdue' => PaymentSchedule::overdue()->count(),
            'recurring' => PaymentSchedule::recurring()->count(),
            'completed' => PaymentSchedule::completed()->count()
        ];

        // Process collection for transaction totals
        foreach ($collection as $item) {
            // Use the actual amount directly from the transaction data
            if ($item['type'] === 'income') {
                $transactionStats['income'] += abs($item['amount']);
            } else {
                $transactionStats['expenses'] += abs($item['amount']);
            }
        }

        return [
            'transactions' => $transactionStats,
            'schedules' => $scheduleStats
        ];
    }

    /**
     * Store a new payment schedule.
     */
    public function storeSchedule(Request $request)
    {
        \Illuminate\Support\Facades\Log::debug('Payment Schedule Data:', [
            'request_data' => $request->all(),
            'validation_rules' => [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'amount' => 'required|numeric|min:0.01',
                'due_date' => 'required|date',
                'reminder_date' => 'nullable|date|before_or_equal:due_date',
                'type' => 'required|in:expense,income',
                'category_id' => 'nullable|exists:expense_categories,id',
            ]
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0.01',
            'due_date' => 'required|date',
            'reminder_date' => 'nullable|date|before_or_equal:due_date',
            'type' => 'required|in:expense,income',
            'category_id' => 'nullable|exists:expense_categories,id',
            'subcategory_id' => 'nullable|exists:expense_categories,id',
            'payment_method_id' => 'nullable|exists:payment_methods,id',
            'currency_id' => 'required|exists:currencies,id',
            'recipient' => 'nullable|string|max:255',
            'is_recurring' => 'boolean',
            'frequency' => 'nullable|required_if:is_recurring,true|string',
            'recurring_end_date' => 'nullable|date|after:due_date',
            'auto_process' => 'boolean',
        ]);

        $schedule = PaymentSchedule::create([
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'description' => $validated['description'],
            'amount' => $validated['amount'],
            'due_date' => $validated['due_date'],
            'reminder_date' => $validated['reminder_date'],
            'type' => $validated['type'],
            'category_id' => $validated['category_id'],
            'subcategory_id' => $validated['subcategory_id'],
            'payment_method_id' => $validated['payment_method_id'],
            'currency_id' => $validated['currency_id'],
            'recipient' => $validated['recipient'],
            'status' => 'pending',
            'is_recurring' => $validated['is_recurring'] ?? false,
            'frequency' => $validated['frequency'],
            'recurring_end_date' => $validated['recurring_end_date'],
            'auto_process' => $validated['auto_process'] ?? false,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Payment schedule created successfully!',
                'schedule' => $schedule
            ]);
        }

        return redirect()->route('payment-schedules.index')->with('success', 'Payment schedule created successfully!');
    }

    /**
     * Get subcategories for a payment schedule.
     */
    public function getScheduleSubcategories($categoryId)
    {
        $subcategories = ExpenseCategory::where('parent_id', $categoryId)
            ->where('user_id', Auth::id())
            ->get();
            
        return response()->json([
            'subcategories' => $subcategories
        ]);
    }

    /**
     * Display the specified payment schedule.
     */
    public function showSchedule(PaymentSchedule $schedule)
    {
        if ($schedule->user_id !== Auth::id()) {
            abort(403);
        }
        
        $schedule->load(['category', 'subcategory', 'currency', 'paymentMethod']);
        
        return Inertia::render('Transactions/PaymentScheduleShow', [
            'schedule' => $schedule,
            'transactions' => $schedule->transactions()->with(['category', 'currency'])->get()
        ]);
    }

    /**
     * Show the form for editing the specified payment schedule.
     */
    public function editSchedule(PaymentSchedule $schedule)
    {
        if ($schedule->user_id !== Auth::id()) {
            abort(403);
        }
        
        $schedule->load(['category', 'subcategory', 'currency', 'paymentMethod']);
        
        $subcategories = $schedule->category_id ? 
            ExpenseCategory::where('parent_id', $schedule->category_id)
                ->where('user_id', Auth::id())
                ->get() : 
            [];
        
        return Inertia::render('Transactions/PaymentScheduleEdit', [
            'schedule' => $schedule,
            'subcategories' => $subcategories,
            'categories' => ExpenseCategory::where('user_id', Auth::id())->whereNull('parent_id')->get(),
            'currencies' => \App\Models\Currency::all(),
            'paymentMethods' => \App\Models\PaymentMethod::all(),
        ]);
    }

    /**
     * Update the specified payment schedule.
     */
    public function updateSchedule(Request $request, PaymentSchedule $schedule)
    {
        if ($schedule->user_id !== Auth::id()) {
            abort(403);
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0.01',
            'due_date' => 'required|date',
            'reminder_date' => 'nullable|date|before_or_equal:due_date',
            'type' => 'required|in:expense,income',
            'category_id' => 'nullable|exists:expense_categories,id',
            'subcategory_id' => 'nullable|exists:expense_categories,id',
            'payment_method_id' => 'nullable|exists:payment_methods,id',
            'currency_id' => 'required|exists:currencies,id',
            'recipient' => 'nullable|string|max:255',
            'is_recurring' => 'boolean',
            'frequency' => 'nullable|required_if:is_recurring,true|string',
            'recurring_end_date' => 'nullable|date|after:due_date',
            'auto_process' => 'boolean',
        ]);
        
        $schedule->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'amount' => $validated['amount'],
            'due_date' => $validated['due_date'],
            'reminder_date' => $validated['reminder_date'],
            'type' => $validated['type'],
            'category_id' => $validated['category_id'],
            'subcategory_id' => $validated['subcategory_id'],
            'payment_method_id' => $validated['payment_method_id'],
            'currency_id' => $validated['currency_id'],
            'recipient' => $validated['recipient'],
            'is_recurring' => $validated['is_recurring'] ?? false,
            'frequency' => $validated['frequency'],
            'recurring_end_date' => $validated['recurring_end_date'],
            'auto_process' => $validated['auto_process'] ?? false,
        ]);
        
        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Payment schedule updated successfully!',
                'schedule' => $schedule
            ]);
        }
        
        return redirect()->route('transactions.index')->with('success', 'Payment schedule updated successfully!');
    }

    /**
     * Process a payment schedule.
     */
    public function processSchedule(PaymentSchedule $schedule)
    {
        if ($schedule->user_id !== Auth::id()) {
            abort(403);
        }
        
        $schedule->process();
        
        return redirect()->back()->with('success', 'Payment schedule processed successfully!');
    }

    /**
     * Cancel a payment schedule.
     */
    public function cancelSchedule(PaymentSchedule $schedule)
    {
        if ($schedule->user_id !== Auth::id()) {
            abort(403);
        }
        
        $schedule->cancel();
        
        return redirect()->back()->with('success', 'Payment schedule canceled successfully!');
    }

    /**
     * Remove the specified payment schedule from storage.
     */
    public function destroySchedule(PaymentSchedule $schedule)
    {
        if ($schedule->user_id !== Auth::id()) {
            abort(403);
        }
        
        $schedule->delete();
        
        return redirect()->route('payment-schedules.index')->with('success', 'Payment schedule deleted successfully!');
    }

    /**
     * Display a listing of payment schedules.
     */
    public function scheduleIndex()
    {
        // Get active payment schedules
        $schedules = PaymentSchedule::where('user_id', Auth::id())
            ->with(['category', 'subcategory', 'currency', 'paymentMethod'])
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => 'schedule-' . $schedule->id,
                    'name' => $schedule->name,
                    'description' => $schedule->description,
                    'amount' => $schedule->amount,
                    'due_date' => $schedule->due_date,
                    'reminder_date' => $schedule->reminder_date,
                    'category' => $schedule->category ? $schedule->category->name : 'Uncategorized',
                    'category_id' => $schedule->category_id,
                    'subcategory_id' => $schedule->subcategory_id,
                    'type' => $schedule->type,
                    'frequency' => $schedule->frequency,
                    'is_recurring' => $schedule->is_recurring,
                    'recurring_end_date' => $schedule->recurring_end_date,
                    'status' => $schedule->status,
                    'currency' => $schedule->currency,
                    'payment_method' => $schedule->paymentMethod
                ];
            });

        // Get statistics
        $stats = [
            'upcoming' => PaymentSchedule::upcoming()->where('user_id', Auth::id())->count(),
            'overdue' => PaymentSchedule::overdue()->where('user_id', Auth::id())->count(),
            'recurring' => PaymentSchedule::recurring()->where('user_id', Auth::id())->count(),
            'completed' => PaymentSchedule::completed()->where('user_id', Auth::id())->count()
        ];

        // Get categories for the schedule creation form
        $categories = ExpenseCategory::where('user_id', Auth::id())
            ->whereNull('parent_id')
            ->get();

        return Inertia::render('PaymentSchedules/Index', [
            'schedules' => $schedules,
            'stats' => $stats,
            'categories' => $categories,
            'currencies' => \App\Models\Currency::all(),
            'paymentMethods' => \App\Models\PaymentMethod::all(),
        ]);
    }
}
