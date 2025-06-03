<?php

namespace App\Http\Controllers;

use App\Models\ExpenseCategory;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ExpenseCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Get top-level categories first, with their subcategories
        $categories = ExpenseCategory::where('user_id', Auth::id())
                        ->whereNull('parent_id')
                        ->with('subcategories')
                        ->get();
                        
        return Inertia::render('ExpenseCategories/Index', compact('categories'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get all parent categories for dropdown selection
        $parentCategories = ExpenseCategory::where('user_id', Auth::id())
                            ->whereNull('parent_id')
                            ->get();
                            
        return Inertia::render('ExpenseCategories/Create', [
            'parentCategories' => $parentCategories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'icon' => ['nullable', 'string', 'max:255'],
            'icon_color' => ['nullable', 'string', 'max:255'],
            'bg_color' => ['nullable', 'string', 'max:255'],
            'parent_id' => ['nullable', 'exists:expense_categories,id'],
        ]);

        $validated['user_id'] = Auth::id();

        // Ensure we don't create subcategories of subcategories
        if (!empty($validated['parent_id'])) {
            $parent = ExpenseCategory::find($validated['parent_id']);
            if ($parent && $parent->parent_id !== null) {
                return redirect()->back()->with('error', 'Cannot create nested subcategories. Choose a top-level category as parent.');
            }
        }

        $category = ExpenseCategory::create($validated);

        return redirect()->route('expense-categories.index')->with('success', 'Expense category created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(ExpenseCategory $expenseCategory, Request $request)
    {
        $this->authorizeUser($expenseCategory);
        
        $period = $request->input('period', 'month');
        $dates = $this->generateDateRange($period);
        
        // Load the expenses related to this category
        $expenses = $expenseCategory->expenses()
            ->whereBetween('date', [$dates['start'], $dates['end']])
            ->latest()
            ->get();
        
        // Get subcategories for this category
        $subcategories = [];
        if ($expenseCategory->parent_id === null) {
            $subcategories = $expenseCategory->subcategories()->get();
        }
        
        // Calculate totals for subcategories
        $subcategoryTotals = [];
        foreach ($subcategories as $subcategory) {
            $total = $subcategory->expenses()
                ->whereBetween('date', [$dates['start'], $dates['end']])
                ->sum('amount');
                
            $subcategoryTotals[] = [
                'id' => $subcategory->id,
                'name' => $subcategory->name,
                'total' => $total,
                'count' => $subcategory->expenses()->whereBetween('date', [$dates['start'], $dates['end']])->count()
            ];
        }

        $allTransactionsData = [
            'total' => $expenses->sum('amount'),
            'average' => $expenses->avg('amount'),
            'count' => $expenses->count(),
            'highest' => $expenses->max('amount'),
            'subcategories' => $subcategoryTotals,
            'period' => $period
        ];

        return Inertia::render('ExpenseCategories/Show', [
            'expenseCategory' => $expenseCategory,
            'expenses' => $expenses,
            'subcategories' => $subcategories,
            'allTransactionsData' => $allTransactionsData
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ExpenseCategory $expenseCategory)
    {
        $this->authorizeUser($expenseCategory);
        
        // Get all possible parent categories (excluding itself and its subcategories)
        $parentCategories = ExpenseCategory::where('user_id', Auth::id())
                            ->where('id', '!=', $expenseCategory->id)
                            ->whereNull('parent_id')
                            ->get();
        
        return Inertia::render('ExpenseCategories/Edit', [
            'expenseCategory' => $expenseCategory,
            'parentCategories' => $parentCategories
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ExpenseCategory $expenseCategory)
    {
        $this->authorizeUser($expenseCategory);
        
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'icon' => ['nullable', 'string', 'max:255'],
            'icon_color' => ['nullable', 'string', 'max:255'],
            'bg_color' => ['nullable', 'string', 'max:255'],
            'parent_id' => ['nullable', 'exists:expense_categories,id'],
        ]);

        // Don't allow setting a subcategory as parent
        if (!empty($validated['parent_id'])) {
            $parent = ExpenseCategory::find($validated['parent_id']);
            if ($parent && $parent->parent_id !== null) {
                return redirect()->back()->with('error', 'Cannot select a subcategory as parent.');
            }
        }

        // Don't allow a category with subcategories to become a subcategory
        if (!empty($validated['parent_id']) && $expenseCategory->subcategories()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot convert a category with subcategories into a subcategory.');
        }

        $expenseCategory->update($validated);

        return redirect()->route('expense-categories.index')->with('success', 'Expense category updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ExpenseCategory $expenseCategory)
    {
        $this->authorizeUser($expenseCategory);
        
        $expenseCategory->delete();

        return redirect()->route('expense-categories.index')->with('success', 'Expense category deleted successfully!');
    }
    
    /**
     * Get subcategories for a specific parent category
     */
    public function getSubcategories($categoryId)
    {
        try {
            // First verify the parent category exists and belongs to user
            $category = ExpenseCategory::where('id', $categoryId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $subcategories = ExpenseCategory::where('parent_id', $categoryId)
                ->where('user_id', Auth::id())
                ->get()
                ->map(function ($subcategory) {
                    return [
                        'id' => $subcategory->id,
                        'name' => $subcategory->name,
                        'description' => $subcategory->description,
                        'icon' => $subcategory->icon,
                        'icon_color' => $subcategory->icon_color,
                        'bg_color' => $subcategory->bg_color,
                        'transaction_count' => $subcategory->expenses()->count()
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data' => $subcategories
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Category not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while fetching subcategories'
            ], 500);
        }
    }

    /**
     * Authorize that the current user owns the category.
     */
    private function authorizeUser(ExpenseCategory $expenseCategory)
    {
        if ($expenseCategory->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
    }

    /**
     * Helper method to generate date range based on period
     */
    private function generateDateRange($period)
    {
        $now = now();
        
        switch ($period) {
            case 'year':
                $start = $now->startOfYear();
                $end = $now->copy()->endOfYear();
                break;
            case 'quarter':
                $start = $now->startOfQuarter();
                $end = $now->copy()->endOfQuarter();
                break;
            case 'month':
            default:
                $start = $now->startOfMonth();
                $end = $now->copy()->endOfMonth();
                break;
        }

        return [
            'start' => $start,
            'end' => $end
        ];
    }
}