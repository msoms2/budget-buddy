<?php

namespace App\Http\Controllers;

use App\Models\EarningCategory;
use App\Models\Currency;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EarningCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Get top-level categories first, with their subcategories
        $categories = EarningCategory::where('user_id', Auth::id())
                        ->whereNull('parent_id')
                        ->with('subcategories')
                        ->get();
                        
        return Inertia::render('EarningCategories/Index', compact('categories'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get all parent categories for dropdown selection
        $parentCategories = EarningCategory::where('user_id', Auth::id())
                            ->whereNull('parent_id')
                            ->get();
                            
        return Inertia::render('EarningCategories/Create', [
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
            'parent_id' => ['nullable', 'exists:earning_categories,id'],
        ]);

        $validated['user_id'] = Auth::id();

        // Ensure we don't create subcategories of subcategories
        if (!empty($validated['parent_id'])) {
            $parent = EarningCategory::find($validated['parent_id']);
            if ($parent && $parent->parent_id !== null) {
                return redirect()->back()->with('error', 'Cannot create nested subcategories. Choose a top-level category as parent.');
            }
        }

        $category = EarningCategory::create($validated);

        return redirect()->route('earning-categories.index')->with('success', 'Earning category created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(EarningCategory $earningCategory)
    {
        $this->authorizeUser($earningCategory);
        
        // Load the earnings related to this category
        $earnings = $earningCategory->earnings()->latest()->get();
        
        // Load subcategories if this is a parent category
        $subcategories = [];
        if ($earningCategory->parent_id === null) {
            $subcategories = $earningCategory->subcategories;
        }
        
        // Get currencies and payment methods for the transaction form
        $currencies = Currency::where('is_active', true)->get();
        $paymentMethods = PaymentMethod::where('user_id', Auth::id())->get();

        return Inertia::render('EarningCategories/Show', [
            'category' => $earningCategory,
            'earnings' => $earnings,
            'subcategories' => $subcategories,
            'currencies' => $currencies,
            'paymentMethods' => $paymentMethods
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EarningCategory $earningCategory)
    {
        $this->authorizeUser($earningCategory);
        
        // Get all possible parent categories (excluding itself and its subcategories)
        $parentCategories = EarningCategory::where('user_id', Auth::id())
                            ->where('id', '!=', $earningCategory->id)
                            ->whereNull('parent_id')
                            ->get();
        
        return Inertia::render('EarningCategories/Edit', [
            'earningCategory' => $earningCategory,
            'parentCategories' => $parentCategories
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EarningCategory $earningCategory)
    {
        $this->authorizeUser($earningCategory);
        
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'icon' => ['nullable', 'string', 'max:255'],
            'icon_color' => ['nullable', 'string', 'max:255'],
            'bg_color' => ['nullable', 'string', 'max:255'],
            'parent_id' => ['nullable', 'exists:earning_categories,id'],
        ]);

        // Don't allow setting a subcategory as parent
        if (!empty($validated['parent_id'])) {
            $parent = EarningCategory::find($validated['parent_id']);
            if ($parent && $parent->parent_id !== null) {
                return redirect()->back()->with('error', 'Cannot select a subcategory as parent.');
            }
        }

        // Don't allow a category with subcategories to become a subcategory
        if (!empty($validated['parent_id']) && $earningCategory->hasSubcategories()) {
            return redirect()->back()->with('error', 'Cannot convert a category with subcategories into a subcategory.');
        }

        $earningCategory->update($validated);

        return redirect()->route('earning-categories.index')->with('success', 'Earning category updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EarningCategory $earningCategory)
    {
        $this->authorizeUser($earningCategory);
        
        $earningCategory->delete();

        return redirect()->route('earning-categories.index')->with('success', 'Earning category deleted successfully!');
    }

    /**
     * Get subcategories for a specific parent category
     */
    public function getSubcategories($parentId)
    {
        $subcategories = EarningCategory::where('parent_id', $parentId)
                         ->where('user_id', Auth::id())
                         ->get();
                         
        return response()->json($subcategories);
    }

    /**
     * Authorize that the current user owns the category.
     */
    private function authorizeUser(EarningCategory $earningCategory)
    {
        if ($earningCategory->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
    }
}