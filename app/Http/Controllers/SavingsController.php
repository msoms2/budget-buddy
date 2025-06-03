<?php

namespace App\Http\Controllers;

use App\Models\Savings;
use App\Models\SavingsTransaction;
use App\Models\ExpenseCategory;
use App\Models\Currency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SavingsController extends Controller
{
    public function index(Request $request)
    {
        $savings = Savings::query()
            ->where('user_id', Auth::id())
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->category_id, function ($query, $categoryId) {
                return $query->where('category_id', $categoryId);
            })
            ->with(['category', 'currency'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Savings/Index', [
            'savings' => $savings
        ]);
    }

    public function create()
    {
        // Get main categories first
        $mainCategories = \App\Models\Category::where('user_id', Auth::id())
            ->orderBy('name')
            ->get();
        
        // Get subcategories (expense categories) organized by parent
        $subcategories = ExpenseCategory::where('user_id', Auth::id())
            ->with('parentCategory')
            ->orderBy('name')
            ->get()
            ->groupBy('category_id');

        // Get available currencies
        $currencies = Currency::where('is_active', true)
            ->orderBy('code')
            ->get();
        
        return Inertia::render('Savings/Create', [
            'mainCategories' => $mainCategories,
            'subcategories' => $subcategories,
            'currencies' => $currencies
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'target_amount' => 'required|numeric|min:0',
            'current_amount' => 'nullable|numeric|min:0',
            'target_date' => 'required|date|after:today',
            'category_id' => 'nullable|exists:expense_categories,id',
            'currency_id' => 'nullable|exists:currencies,id',
        ]);

        $savings = Savings::create([
            'user_id' => Auth::id(),
            'current_amount' => $validated['current_amount'] ?? 0,
            ...$validated
        ]);

        return redirect()->route('savings.show', $savings->id)->with('success', 'Savings goal created successfully!');
    }

    public function show(Savings $saving)
    {
        Gate::authorize('view', $saving);
        
        // Get savings transactions (progress updates)
        $savingsTransactions = $saving->transactions->map(function ($transaction) {
            return [
                'id' => 'tx_' . $transaction->id,
                'amount' => $transaction->amount,
                'transaction_date' => $transaction->transaction_date,
                'notes' => $transaction->description ?: 'Savings progress update',
                'is_category_expense' => false,
                'type' => $transaction->type
            ];
        });
        
        // Get expenses in the same category (if savings has a category)
        $categoryExpenses = collect([]);
        if ($saving->category_id) {
            $categoryExpenses = \App\Models\Expense::where('user_id', Auth::id())
                ->where('subcategory_id', $saving->category_id)
                ->orderBy('date', 'desc')
                ->get()
                ->map(function ($expense) {
                    return [
                        'id' => 'exp_' . $expense->id,
                        'amount' => $expense->amount,
                        'transaction_date' => $expense->date,
                        'notes' => $expense->name . ' (Category Expense)',
                        'is_category_expense' => true
                    ];
                });
        }
        
        // Merge and sort all transactions
        $allTransactions = $savingsTransactions->concat($categoryExpenses)
            ->sortByDesc('transaction_date')
            ->values();
        
        // Calculate the total progress including category expenses
        $categoryAmount = $categoryExpenses->sum('amount');
        $totalAmount = $saving->current_amount + $categoryAmount;
        $totalProgressPercentage = $saving->target_amount > 0 
            ? min(100, round(($totalAmount / $saving->target_amount) * 100)) 
            : 0;
        
        // Add total progress data to the savings
        $saving->total_amount = $totalAmount;
        $saving->total_progress_percentage = $totalProgressPercentage;
        $saving->category_amount = $categoryAmount;
        
        return Inertia::render('Savings/Show', [
            'saving' => $saving->load(['category', 'currency', 'transactions']),
            'transactions' => $allTransactions,
        ]);
    }

    public function edit(Savings $saving)
    {
        Gate::authorize('view', $saving);
        
        // Get main categories first
        $mainCategories = \App\Models\Category::where('user_id', Auth::id())
            ->orderBy('name')
            ->get();
    
        // Get subcategories (expense categories) organized by parent
        $subcategories = ExpenseCategory::where('user_id', Auth::id())
            ->with('parentCategory')
            ->orderBy('name')
            ->get()
            ->groupBy('category_id');

        // Get available currencies
        $currencies = Currency::where('is_active', true)
            ->orderBy('code')
            ->get();
        
        return Inertia::render('Savings/Edit', [
            'saving' => $saving->load(['category', 'currency']),
            'mainCategories' => $mainCategories,
            'subcategories' => $subcategories,
            'currencies' => $currencies,
        ]);
    }

    public function update(Request $request, Savings $saving)
    {
        Gate::authorize('update', $saving);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'target_amount' => 'sometimes|numeric|min:0',
            'current_amount' => 'sometimes|numeric|min:0',
            'target_date' => 'sometimes|date|after:today',
            'category_id' => 'nullable|exists:expense_categories,id',
            'currency_id' => 'nullable|exists:currencies,id',
            'status' => ['sometimes', Rule::in(['active', 'completed', 'cancelled'])],
        ]);

        $saving->update($validated);

        return redirect()->route('savings.show', $saving->id)->with('success', 'Savings goal updated successfully!');
    }

    public function destroy(Savings $saving)
    {
        Gate::authorize('delete', $saving);

        $saving->delete();

        return redirect()->route('savings.index')->with('success', 'Savings goal deleted successfully!');
    }

    public function dashboard(Request $request)
    {
        $user = Auth::user();
        
        // Get all active savings
        $activeSavings = Savings::where('user_id', $user->id)
            ->where('status', 'active')
            ->with(['category', 'currency'])
            ->get();

        // Calculate savings statistics
        $totalTargetAmount = $activeSavings->sum('target_amount');
        $totalCurrentAmount = $activeSavings->sum('current_amount');
        $totalProgressPercentage = $totalTargetAmount > 0 
            ? round(($totalCurrentAmount / $totalTargetAmount) * 100, 2) 
            : 0;

        // Get upcoming savings targets (next 30 days)
        $upcomingTargets = $activeSavings
            ->where('target_date', '<=', now()->addDays(30))
            ->where('target_date', '>=', now())
            ->sortBy('target_date')
            ->take(5);

        // Get overdue savings
        $overdueSavings = $activeSavings
            ->where('target_date', '<', now())
            ->where('progress_percentage', '<', 100)
            ->sortBy('target_date')
            ->take(5);

        return Inertia::render('Savings/Dashboard', [
            'savings' => $activeSavings,
            'statistics' => [
                'total_target_amount' => $totalTargetAmount,
                'total_current_amount' => $totalCurrentAmount,
                'total_progress_percentage' => $totalProgressPercentage,
                'active_count' => $activeSavings->count(),
                'completed_count' => Savings::where('user_id', $user->id)->where('status', 'completed')->count(),
            ],
            'upcoming_targets' => $upcomingTargets,
            'overdue_savings' => $overdueSavings,
        ]);
    }

    public function updateProgress(Request $request, Savings $saving)
    {
        Gate::authorize('update', $saving);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:255',
        ]);

        // Create savings transaction record
        SavingsTransaction::create([
            'savings_id' => $saving->id,
            'user_id' => Auth::id(),
            'amount' => $validated['amount'],
            'description' => $validated['description'] ?? 'Progress update',
            'transaction_date' => now()->toDateString(),
            'type' => 'deposit',
        ]);

        // Update current amount
        $saving->current_amount += $validated['amount'];
        
        // Check if target is reached
        if ($saving->current_amount >= $saving->target_amount) {
            $saving->status = 'completed';
        }
        
        $saving->save();

        // If the savings has a category, also create a regular expense
        if ($saving->category_id) {
            $expenseCategory = ExpenseCategory::find($saving->category_id);
            
            if ($expenseCategory && $expenseCategory->parent_id) {
                \App\Models\Expense::create([
                    'name' => $saving->name . ' - Savings Progress',
                    'amount' => $validated['amount'],
                    'description' => $validated['description'] ?? 'Savings progress payment',
                    'date' => now(),
                    'user_id' => auth()->id(),
                    'category_id' => $expenseCategory->parent_id,
                    'subcategory_id' => $saving->category_id,
                    'currency_id' => $saving->currency_id,
                ]);
            }
        }

        $responseData = [
            'current_amount' => $saving->current_amount,
            'progress_percentage' => $saving->progress_percentage,
            'status' => $saving->status,
            'remaining_amount' => $saving->remaining_amount,
        ];

        // For Inertia requests, always redirect back
        return redirect()->back()
            ->with('success', 'Savings progress updated successfully')
            ->with('savingsData', $responseData);
    }

    public function calculateTargets(Request $request, Savings $saving)
    {
        Gate::authorize('view', $saving);

        $validated = $request->validate([
            'period' => ['required', Rule::in(['daily', 'weekly', 'monthly'])],
        ]);

        $requiredAmount = $saving->calculateMonthlySavingsNeeded($validated['period']);
        $remainingDays = now()->diffInDays($saving->target_date);
        
        if ($requiredAmount <= 0) {
            return response()->json([
                'required_amount' => 0,
                'period' => $validated['period'],
                'remaining_days' => 0,
                'probability_of_success' => 100,
            ]);
        }
        
        // Calculate probability based on current progress and time remaining
        $totalDays = $saving->created_at->diffInDays($saving->target_date);
        $elapsedDays = $saving->created_at->diffInDays(now());
        $timeProgress = $totalDays > 0 ? ($elapsedDays / $totalDays) : 0;
        $amountProgress = $saving->progress_percentage / 100;

        $expectedProgress = $timeProgress;
        $actualProgress = $amountProgress;
        
        $progressRatio = $expectedProgress > 0 ? ($actualProgress / $expectedProgress) : ($actualProgress > 0 ? 1 : 0);
        $probabilityOfSuccess = min(100, max(0, round($progressRatio * 100)));

        return response()->json([
            'required_amount' => $requiredAmount,
            'period' => $validated['period'],
            'remaining_days' => $remainingDays,
            'probability_of_success' => $probabilityOfSuccess,
        ]);
    }
}