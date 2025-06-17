<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use App\Models\GoalTransaction;
use App\Models\EarningCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class GoalController extends Controller
{
    public function index(Request $request)
    {
        // Get income categories (main and sub) only
        $earningCategories = EarningCategory::where('user_id', Auth::id())
            ->orderBy('name')
            ->get();

        // Organize categories into required format - only income categories
        $mainCategories = $earningCategories->whereNull('parent_id')
            ->map(function($cat) {
                $cat->type = 'income';
                return $cat;
            })
            ->sortBy('name')
            ->values();

        // Organize subcategories by parent - only income subcategories
        $subcategories = [];
        
        foreach($earningCategories->whereNotNull('parent_id') as $sub) {
            if (!isset($subcategories[$sub->parent_id])) {
                $subcategories[$sub->parent_id] = [];
            }
            $subcategories[$sub->parent_id][] = $sub;
        }

        $goals = Goal::query()
            ->where('user_id', Auth::id())
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->category_id, function ($query, $categoryId) {
                return $query->where('category_id', $categoryId);
            })
            ->with('category')
            ->get();

        return Inertia::render('Goals/Index', [
            'goals' => $goals,
            'mainCategories' => $mainCategories,
            'subcategories' => $subcategories
        ]);
    }

    public function create()
    {
        // Get income categories (main and sub) only
        $earningCategories = EarningCategory::where('user_id', Auth::id())
            ->orderBy('name')
            ->get();

        // Organize categories into required format - only income categories
        $mainCategories = $earningCategories->whereNull('parent_id')
            ->map(function($cat) {
                $cat->type = 'income';
                return $cat;
            })
            ->sortBy('name')
            ->values();

        // Organize subcategories by parent - only income subcategories
        $subcategories = [];
        
        foreach($earningCategories->whereNotNull('parent_id') as $sub) {
            if (!isset($subcategories[$sub->parent_id])) {
                $subcategories[$sub->parent_id] = [];
            }
            $subcategories[$sub->parent_id][] = $sub;
        }
        
        return Inertia::render('Goals/Create', [
            'mainCategories' => $mainCategories,
            'subcategories' => $subcategories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:0',
            'target_date' => 'required|date|after:today',
            'category_id' => 'nullable|exists:earning_categories,id',
            'description' => 'nullable|string',
        ]);

        $goal = Goal::create([
            'user_id' => Auth::id(),
            ...$validated
        ]);

        return redirect()->route('goals.show', $goal->id)->with('success', 'Goal created successfully!');
    }

    public function show(Goal $goal)
    {
        Gate::authorize('view', $goal);
        
        // Get direct goal transactions
        $goalTransactions = $goal->transactions()
            ->orderBy('transaction_date', 'desc')
            ->get();
        
        // Get earnings in the same category (if goal has a category)
        $categoryEarnings = collect([]);
        if ($goal->category_id) {
            $categoryEarnings = \App\Models\Earning::where('user_id', Auth::id())
                ->where('subcategory_id', $goal->category_id) // Using subcategory_id which links to EarningCategory
                ->orderBy('date', 'desc')
                ->get()
                ->map(function ($earning) {
                    return [
                        'id' => 'earn_' . $earning->id,
                        'amount' => $earning->amount,
                        'transaction_date' => $earning->date,
                        'notes' => $earning->name . ' (Category Earning)',
                        'is_category_earning' => true
                    ];
                });
        }
        
        // Merge and sort all transactions
        $allTransactions = $goalTransactions->map(function ($transaction) {
            return [
                'id' => 'goal_' . $transaction->id,
                'amount' => $transaction->amount,
                'transaction_date' => $transaction->transaction_date,
                'notes' => $transaction->notes,
                'is_category_earning' => false
            ];
        })->concat($categoryEarnings)
        ->sortByDesc('transaction_date')
        ->values();
        
        // Calculate the total progress including both direct transactions and category earnings
        $directAmount = $goalTransactions->sum('amount');
        $categoryAmount = $categoryEarnings->sum('amount');
        $totalAmount = $directAmount + $categoryAmount;
        $totalProgressPercentage = $goal->target_amount > 0 
            ? min(100, round(($totalAmount / $goal->target_amount) * 100)) 
            : 0;
        
        // Add total progress data to the goal
        $goal->total_amount = $totalAmount;
        $goal->total_progress_percentage = $totalProgressPercentage;
        $goal->direct_amount = $directAmount;
        $goal->category_amount = $categoryAmount;
        
        return Inertia::render('Goals/Show', [
            'goal' => $goal->load('category'),
            'transactions' => $allTransactions,
        ]);
    }

    public function edit(Goal $goal)
    {
        Gate::authorize('view', $goal);
        
        // Get income categories (main and sub) only
        $earningCategories = \App\Models\EarningCategory::where('user_id', Auth::id())
            ->orderBy('name')
            ->get();

        // Organize categories into required format - only income categories
        $mainCategories = $earningCategories->whereNull('parent_id')
            ->map(function($cat) {
                $cat->type = 'income';
                return $cat;
            })
            ->sortBy('name')
            ->values();

        // Organize subcategories by parent - only income subcategories
        $subcategories = [];
        
        foreach($earningCategories->whereNotNull('parent_id') as $sub) {
            if (!isset($subcategories[$sub->parent_id])) {
                $subcategories[$sub->parent_id] = [];
            }
            $subcategories[$sub->parent_id][] = $sub;
        }
    
        $transactions = $goal->transactions()
            ->orderBy('transaction_date', 'desc')
            ->get();
        
        return Inertia::render('Goals/Edit', [
            'goal' => $goal->load('category'),
            'mainCategories' => $mainCategories,
            'subcategories' => $subcategories,
            'transactions' => $transactions,
        ]);
    }

    public function update(Request $request, Goal $goal)
    {
        Gate::authorize('update', $goal);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'target_amount' => 'sometimes|numeric|min:0',
            'target_date' => 'sometimes|date|after:today',
            'category_id' => 'nullable|exists:earning_categories,id',
            'description' => 'nullable|string',
            'status' => ['sometimes', Rule::in(['active', 'completed', 'cancelled'])],
        ]);

        $goal->update($validated);

        return redirect()->route('goals.show', $goal->id)->with('success', 'Goal updated successfully!');
    }

    public function destroy(Goal $goal)
    {
        Gate::authorize('delete', $goal);

        $goal->delete();

        return redirect()->route('goals.index')->with('success', 'Goal deleted successfully!');
    }


    public function getProgress(Request $request, Goal $goal)
    {
        Gate::authorize('view', $goal);

        $transactions = $goal->transactions()
            ->when($request->from_date, function ($query, $date) {
                return $query->where('transaction_date', '>=', $date);
            })
            ->when($request->to_date, function ($query, $date) {
                return $query->where('transaction_date', '<=', $date);
            })
            ->orderBy('transaction_date', 'desc')
            ->get();

        return response()->json([
            'transactions' => $transactions,
            'current_amount' => $goal->current_amount,
            'progress_percentage' => $goal->progress_percentage,
        ]);
    }

    public function calculateSavings(Request $request, Goal $goal)
    {
        Gate::authorize('view', $goal);

        $validated = $request->validate([
            'period' => ['required', Rule::in(['daily', 'weekly', 'monthly'])],
        ]);

        $requiredAmount = $goal->calculateRequiredSavings($validated['period']);
        $remainingDays = now()->diffInDays($goal->target_date);
        
        // If required amount is 0 or negative, the goal is effectively complete
        if ($requiredAmount <= 0) {
            return response()->json([
                'required_amount' => 0,
                'period' => $validated['period'],
                'remaining_days' => 0,
                'probability_of_success' => 100,
            ]);
        }
        
        // Simple probability calculation based on total progress and time remaining
        // Calculate progress metrics
        $totalDays = $goal->created_at->diffInDays($goal->target_date);
        $elapsedDays = $goal->created_at->diffInDays(now());
        $timeProgress = $totalDays > 0 ? ($elapsedDays / $totalDays) : 0;
        $amountProgress = $goal->getTotalProgressPercentageAttribute() / 100;

        // Calculate probability based on progress vs expected progress
        $expectedProgress = $timeProgress; // Linear expectation
        $actualProgress = $amountProgress;
        
        // If we're ahead of expected progress, probability should be high
        // If we're behind expected progress, probability should be lower
        $progressRatio = $expectedProgress > 0 ? ($actualProgress / $expectedProgress) : ($actualProgress > 0 ? 1 : 0);
        $probabilityOfSuccess = min(100, max(0, round($progressRatio * 100)));

        return response()->json([
            'required_amount' => $requiredAmount,
            'period' => $validated['period'],
            'remaining_days' => $remainingDays,
            'probability_of_success' => $probabilityOfSuccess,
        ]);
    }

    public function updateProgress(Request $request, Goal $goal)
    {
        Gate::authorize('update', $goal);

        // This function is now disabled - progress should only come from income transactions
        return redirect()->route('goals.show', $goal->id)
            ->with('error', 'Manual progress updates have been disabled. Progress is automatically tracked from income transactions in the associated category.');
    }
}