<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Currency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $expenses = Expense::where('user_id', Auth::id())
            ->with(['category', 'subcategory', 'currency'])
            ->get();
        $currencies = Currency::all();
        return Inertia::render('Expenses/Index', [
            'expenses' => $expenses,
            'currencies' => $currencies
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        // Get parent categories for dropdown
        $categories = ExpenseCategory::where('user_id', Auth::id())
                      ->whereNull('parent_id')
                      ->get();
                      
        $selectedCategoryId = $request->query('category_id');
        $subcategories = [];
        
        // If a category is preselected, get its subcategories
        if ($selectedCategoryId) {
            $subcategories = ExpenseCategory::where('parent_id', $selectedCategoryId)
                            ->where('user_id', Auth::id())
                            ->get();
        }
        
        $currencies = Currency::all();
        $baseCurrency = Currency::getBase();
        
        return Inertia::render('Expenses/Create', [
            'categories' => $categories,
            'subcategories' => $subcategories,
            'currencies' => $currencies,
            'baseCurrency' => $baseCurrency,
            'category_id' => $selectedCategoryId,
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
            'amount' => ['required', 'numeric', 'min:0'],
            'category_id' => ['required', 'exists:expense_categories,id'],
            'subcategory_id' => ['nullable', 'exists:expense_categories,id'],
            'currency_id' => ['required', 'exists:currencies,id'],
            'date' => ['nullable', 'date'],
            'is_recurring' => ['boolean'],
            'frequency' => ['nullable', 'string', 'required_if:is_recurring,true'],
            'stay_on_page' => ['boolean'],
            'source_page' => ['nullable', 'string'],
        ]);

        $validated['user_id'] = Auth::id();
        
        // Verify that the category belongs to the authenticated user
        $category = ExpenseCategory::where('id', $validated['category_id'])
            ->where('user_id', $validated['user_id'])
            ->firstOrFail();
            
        // If subcategory is provided, verify it belongs to the selected category
        if (isset($validated['subcategory_id']) && $validated['subcategory_id']) {
            $subcategory = ExpenseCategory::where('id', $validated['subcategory_id'])
                          ->where('parent_id', $validated['category_id'])
                          ->where('user_id', $validated['user_id'])
                          ->firstOrFail();
        }
        
        // Extract UI control fields and remove them from validated data
        $stayOnPage = $validated['stay_on_page'] ?? false;
        $sourcePage = $validated['source_page'] ?? null;
        unset($validated['stay_on_page'], $validated['source_page']);
        
        // Create expense with only model-related data
        $expense = Expense::create($validated);
        
        // Handle redirection based on source page and stay_on_page preference
        if ($stayOnPage) {
            if ($sourcePage === 'transactions') {
                return redirect()->route('transactions.index')
                    ->with('success', 'Expense created successfully!');
            } else if ($sourcePage === 'category') {
                return redirect()->route('expense-category.show', $validated['category_id'])
                    ->with('success', 'Expense created successfully!');
            } else if ($sourcePage === 'dashboard') {
                return redirect()->route('dashboard')
                    ->with('success', 'Expense created successfully!');
            }
        }
        
        // If sourcePage is specified but stay_on_page is false, 
        // we still want to respect the user's current context
        if (!$stayOnPage && $sourcePage) {
            if ($sourcePage === 'transactions') {
                return redirect()->route('transactions.index')
                    ->with('success', 'Expense created successfully!');
            } else if ($sourcePage === 'category') {
                return redirect()->route('expense-category.show', $validated['category_id'])
                    ->with('success', 'Expense created successfully!');
            } else if ($sourcePage === 'dashboard') {
                return redirect()->route('dashboard')
                    ->with('success', 'Expense created successfully!');
            }
        }
        
        // Default fallback behavior only when no sourcePage is specified
        if ($validated['category_id']) {
            return redirect()->route('expense-category.show', $validated['category_id'])
                ->with('success', 'Expense created successfully!');
        }

        return redirect()->route('expenses.index')
            ->with('success', 'Expense created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Expense $expense)
    {
        $this->authorizeUser($expense);
        
        return Inertia::render('Expenses/Show', [
            'expense' => $expense->load(['category', 'subcategory', 'currency']),
            'currencies' => Currency::all()
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Expense $expense)
    {
        $this->authorizeUser($expense);
        
        // Get parent categories for dropdown
        $categories = ExpenseCategory::where('user_id', Auth::id())
                      ->whereNull('parent_id')
                      ->get();
        
        // Get subcategories for the selected category
        $subcategories = [];
        if ($expense->category_id) {
            $subcategories = ExpenseCategory::where('parent_id', $expense->category_id)
                            ->where('user_id', Auth::id())
                            ->get();
        }
        
        $currencies = Currency::all();
        
        return Inertia::render('Expenses/Edit', [
            'expense' => $expense->load(['category', 'subcategory', 'currency']),
            'categories' => $categories,
            'subcategories' => $subcategories,
            'currencies' => $currencies
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Expense $expense)
    {
        $this->authorizeUser($expense);
        
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'amount' => ['required', 'numeric', 'min:0'],
            'category_id' => ['required', 'exists:expense_categories,id'],
            'subcategory_id' => ['nullable', 'exists:expense_categories,id'],
            'currency_id' => ['required', 'exists:currencies,id'],
            'date' => ['nullable', 'date'],
            'is_recurring' => ['boolean'],
            'frequency' => ['nullable', 'string', 'required_if:is_recurring,true'],
        ]);
        
        // Verify that the category belongs to the authenticated user
        $category = ExpenseCategory::where('id', $validated['category_id'])
            ->where('user_id', Auth::id())
            ->firstOrFail();
            
        // If subcategory is provided, verify it belongs to the selected category
        if (isset($validated['subcategory_id']) && $validated['subcategory_id']) {
            $subcategory = ExpenseCategory::where('id', $validated['subcategory_id'])
                          ->where('parent_id', $validated['category_id'])
                          ->where('user_id', Auth::id())
                          ->firstOrFail();
        }

        // Update the expense with all validated data
        $expense->update($validated);

        return redirect()->route('expenses.index')->with('success', 'Expense updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Expense $expense)
    {
        $this->authorizeUser($expense);
        
        $expense->delete();

        return redirect()->route('expenses.index')->with('success', 'Expense deleted successfully!');
    }

    /**
     * Authorize that the current user owns the expense.
     */
    private function authorizeUser(Expense $expense)
    {
        if ($expense->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
    }
}