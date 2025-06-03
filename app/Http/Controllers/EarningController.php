<?php

namespace App\Http\Controllers;

use App\Models\Earning;
use App\Models\EarningCategory;
use App\Models\Currency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EarningController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $earnings = Earning::where('user_id', Auth::id())
            ->with(['category', 'subcategory', 'currency'])
            ->get();
        $categories = EarningCategory::where('user_id', Auth::id())
                      ->whereNull('parent_id')
                      ->with('subcategories')
                      ->get();
        $totalAmount = Earning::where('user_id', Auth::id())->sum('amount');
        $currencies = Currency::all();
        
        return Inertia::render('Earnings/Index', [
            'earnings' => $earnings,
            'categories' => $categories,
            'totalAmount' => $totalAmount,
            'currencies' => $currencies
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        // Get parent categories for dropdown
        $categories = EarningCategory::where('user_id', Auth::id())
                      ->whereNull('parent_id')
                      ->get();
                      
        $selectedCategoryId = $request->query('category_id');
        $subcategories = [];
        
        // If a category is preselected, get its subcategories
        if ($selectedCategoryId) {
            $subcategories = EarningCategory::where('parent_id', $selectedCategoryId)
                            ->where('user_id', Auth::id())
                            ->get();
        }
                      
        $currencies = Currency::all();
        $baseCurrency = Currency::getBase();
        
        return Inertia::render('Earnings/Create', [
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
            'category_id' => ['required', 'exists:earning_categories,id'],
            'subcategory_id' => ['nullable', 'exists:earning_categories,id'],
            'currency_id' => ['required', 'exists:currencies,id'],
            'date' => ['nullable', 'date'],
            'is_recurring' => ['boolean'],
            'frequency' => ['nullable', 'string', 'required_if:is_recurring,true'],
            'stay_on_page' => ['boolean'],
            'source_page' => ['nullable', 'string'],
        ]);

        $validated['user_id'] = Auth::id();
        
        // Verify that the category belongs to the authenticated user
        $category = EarningCategory::where('id', $validated['category_id'])
            ->where('user_id', $validated['user_id'])
            ->firstOrFail();
            
        // If subcategory is provided, verify it belongs to the selected category
        if (isset($validated['subcategory_id']) && $validated['subcategory_id']) {
            $subcategory = EarningCategory::where('id', $validated['subcategory_id'])
                          ->where('parent_id', $validated['category_id'])
                          ->where('user_id', $validated['user_id'])
                          ->firstOrFail();
        }

        // Create database record with only valid fields
        $earningData = [
            'name' => $validated['name'],
            'description' => $validated['description'],
            'amount' => $validated['amount'],
            'category_id' => $validated['category_id'],
            'subcategory_id' => $validated['subcategory_id'],
            'currency_id' => $validated['currency_id'],
            'date' => $validated['date'],
            'is_recurring' => $validated['is_recurring'],
            'frequency' => $validated['is_recurring'] ? $validated['frequency'] : 'one-time',
            'user_id' => $validated['user_id']
        ];
        
        // Extract UI control fields for redirection logic
        $stayOnPage = $validated['stay_on_page'] ?? false;
        $sourcePage = $validated['source_page'] ?? null;
        
        $earning = Earning::create($earningData);

        // Handle redirection based on source page and stay_on_page preference
        if ($stayOnPage) {
            if ($sourcePage === 'transactions') {
                // Stay on transactions page
                return redirect()->route('transactions.index')
                    ->with('success', 'Income created successfully!');
            } else if ($sourcePage === 'category') {
                // Stay on category page
                return redirect()->route('income-category.show', $validated['category_id'])
                    ->with('success', 'Income created successfully!');
            } else if ($sourcePage === 'dashboard') {
                // Stay on dashboard
                return redirect()->route('dashboard')
                    ->with('success', 'Income created successfully!');
            }
        }
        
        // If sourcePage is specified but stay_on_page is false, 
        // we still want to respect the user's current context
        if (!$stayOnPage && $sourcePage) {
            if ($sourcePage === 'transactions') {
                return redirect()->route('transactions.index')
                    ->with('success', 'Income created successfully!');
            } else if ($sourcePage === 'category') {
                return redirect()->route('income-category.show', $validated['category_id'])
                    ->with('success', 'Income created successfully!');
            } else if ($sourcePage === 'dashboard') {
                return redirect()->route('dashboard')
                    ->with('success', 'Income created successfully!');
            }
        }
        
        // Default fallback behavior only when no sourcePage is specified
        if ($validated['category_id']) {
            return redirect()->route('income-category.show', $validated['category_id'])
                ->with('success', 'Income created successfully!');
        }

        return redirect()->route('earnings.index')
            ->with('success', 'Income created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Earning $earning)
    {
        $this->authorizeUser($earning);
        
        return Inertia::render('Earnings/Show', [
            'earning' => $earning->load(['category', 'subcategory', 'currency']),
            'currencies' => Currency::all()
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Earning $earning)
    {
        $this->authorizeUser($earning);
        
        // Get parent categories for dropdown
        $categories = EarningCategory::where('user_id', Auth::id())
                      ->whereNull('parent_id')
                      ->get();
        
        // Get subcategories for the selected category
        $subcategories = [];
        if ($earning->category_id) {
            $subcategories = EarningCategory::where('parent_id', $earning->category_id)
                            ->where('user_id', Auth::id())
                            ->get();
        }
        
        return Inertia::render('Earnings/Edit', [
            'earning' => $earning->load(['category', 'subcategory', 'currency']),
            'categories' => $categories,
            'subcategories' => $subcategories,
            'currencies' => Currency::all()
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Earning $earning)
    {
        $this->authorizeUser($earning);
        
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'amount' => ['required', 'numeric', 'min:0'],
            'category_id' => ['required', 'exists:earning_categories,id'],
            'subcategory_id' => ['nullable', 'exists:earning_categories,id'],
            'currency_id' => ['required', 'exists:currencies,id'],
            'date' => ['nullable', 'date'],
            'is_recurring' => ['boolean'],
            'frequency' => ['nullable', 'string', 'required_if:is_recurring,true'],
        ]);
        
        // Verify that the category belongs to the authenticated user
        $category = EarningCategory::where('id', $validated['category_id'])
            ->where('user_id', Auth::id())
            ->firstOrFail();
            
        // If subcategory is provided, verify it belongs to the selected category
        if (isset($validated['subcategory_id']) && $validated['subcategory_id']) {
            $subcategory = EarningCategory::where('id', $validated['subcategory_id'])
                          ->where('parent_id', $validated['category_id'])
                          ->where('user_id', Auth::id())
                          ->firstOrFail();
        }

        // Set a default frequency for non-recurring earnings
        if (!$validated['is_recurring']) {
            $validated['frequency'] = 'one-time';
        }

        $earning->update($validated);

        return redirect()->route('earnings.index')->with('success', 'Earning updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Earning $earning)
    {
        $this->authorizeUser($earning);
        
        $earning->delete();

        return redirect()->route('earnings.index')->with('success', 'Earning deleted successfully!');
    }

    /**
     * Authorize that the current user owns the earning.
     */
    private function authorizeUser(Earning $earning)
    {
        if ($earning->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
    }
}