<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Category;
use App\Models\ExpenseCategory;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class BudgetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $budgets = Budget::where('user_id', Auth::id())
            ->with(['category', 'currency'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        // Transform budgets to include utilization data
        $budgets = $budgets->map(function($budget) {
            $utilization = $budget->calculateUtilization();
            return array_merge($budget->toArray(), [
                'utilization' => $utilization,
                'enable_rollover' => $budget->rollover_enabled
            ]);
        });
        
        // Get expense categories organized hierarchically like goals    
        $expenseCategories = ExpenseCategory::where('user_id', Auth::id())
            ->orderBy('name')
            ->get();

        // Organize main categories
        $mainCategories = $expenseCategories->whereNull('parent_id')
            ->map(function($cat) {
                $cat->type = 'expense';
                return $cat;
            })
            ->sortBy('name')
            ->values();

        // Organize subcategories by parent
        $subcategories = [];
        foreach($expenseCategories->whereNotNull('parent_id') as $sub) {
            if (!isset($subcategories[$sub->parent_id])) {
                $subcategories[$sub->parent_id] = [];
            }
            $subcategories[$sub->parent_id][] = $sub;
        }
            
        return Inertia::render('Budgets/Index', [
            'budgets' => $budgets,
            'expenseCategories' => $expenseCategories,
            'mainCategories' => $mainCategories,
            'subcategories' => $subcategories,
            'budgetMethods' => Budget::getAvailableMethods(),
            'budgetPeriods' => Budget::getAvailablePeriods(),
            'budgetTimeFrames' => Budget::getAvailableTimeFrames(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get expense categories organized hierarchically like goals    
        $expenseCategories = ExpenseCategory::where('user_id', Auth::id())
            ->orderBy('name')
            ->get();

        // Organize main categories
        $mainCategories = $expenseCategories->whereNull('parent_id')
            ->map(function($cat) {
                $cat->type = 'expense';
                return $cat;
            })
            ->sortBy('name')
            ->values();

        // Organize subcategories by parent
        $subcategories = [];
        foreach($expenseCategories->whereNotNull('parent_id') as $sub) {
            if (!isset($subcategories[$sub->parent_id])) {
                $subcategories[$sub->parent_id] = [];
            }
            $subcategories[$sub->parent_id][] = $sub;
        }
        
        return Inertia::render('Budgets/Create', [
            'expenseCategories' => $expenseCategories,
            'mainCategories' => $mainCategories,
            'subcategories' => $subcategories,
            'budgetMethods' => Budget::getAvailableMethods(),
            'budgetPeriods' => Budget::getAvailablePeriods(),
            'budgetTimeFrames' => Budget::getAvailableTimeFrames(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'period' => ['required', 'string', 'in:daily,weekly,monthly,yearly'],
            'time_frame' => ['required', 'string', 'in:1_week,1_month,3_months,6_months,1_year,2_years,custom'],
            'time_frame_value' => ['nullable', 'integer', 'min:1', 'required_if:time_frame,custom'],
            'time_frame_unit' => ['nullable', 'string', 'in:days,weeks,months,years', 'required_if:time_frame,custom'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'category_id' => ['nullable', 'exists:expense_categories,id'],
            'notes' => ['nullable', 'string'],
            'enable_rollover' => ['nullable', 'boolean'],
            'budget_method' => ['nullable', 'string', 'in:standard,50-30-20,zero-based'],
            'method_settings' => ['nullable', 'array'],
        ]);
        
        // Map form field names to database column names
        if (isset($validated['enable_rollover'])) {
            $validated['rollover_enabled'] = $validated['enable_rollover'];
            unset($validated['enable_rollover']); 
        }
        
        $validated['user_id'] = Auth::id();
        $validated['rollover_amount'] = 0; // Initialize rollover amount as 0
        $validated['budget_method'] = $validated['budget_method'] ?? 'standard';
        
        // Set end date based on period if not provided
        if (empty($validated['end_date'])) {
            $startDate = Carbon::parse($validated['start_date']);
            switch ($validated['period']) {
                case 'daily':
                    $validated['end_date'] = $startDate->copy();
                    break;
                case 'weekly':
                    $validated['end_date'] = $startDate->copy()->addWeek()->subDay();
                    break;
                case 'monthly':
                    $validated['end_date'] = $startDate->copy()->addMonth()->subDay();
                    break;
                case 'yearly':
                    $validated['end_date'] = $startDate->copy()->addYear()->subDay();
                    break;
            }
        }
        
        $budget = Budget::create($validated);
        
        // Calculate and set the overall end date based on time frame
        $overallEndDate = $budget->calculateOverallEndDate();
        $budget->overall_end_date = $overallEndDate;
        $budget->save();
        
        if ($request->wantsJson()) {
            return response()->json([
                'budget' => $budget->load('category'),
                'message' => 'Budget created successfully!'
            ]);
        }
        
        return redirect()->route('budgets.show', $budget)
            ->with('success', 'Budget created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Budget $budget)
    {
        // Ensure the user owns this budget
        if ($budget->user_id !== Auth::id()) {
            abort(403);
        }
        
        // Get budget utilization data
        $utilization = $budget->calculateUtilization();
        
        // Get expenses for this budget's category within the budget date range
        $expenses = Expense::where('user_id', Auth::id())
            ->where('category_id', $budget->category_id)
            ->whereBetween('date', [$budget->start_date, $budget->end_date])
            ->orderBy('date', 'desc')
            ->get();
        
        return Inertia::render('Budgets/Show', [
            'budget' => array_merge($budget->load('category')->toArray(), [
                'utilization' => $utilization,
                'enable_rollover' => $budget->rollover_enabled
            ]),
            'expenses' => $expenses,
            'budgetMethods' => Budget::getAvailableMethods(),
            'budgetPeriods' => Budget::getAvailablePeriods(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Budget $budget)
    {
        // Ensure the user owns this budget
        if ($budget->user_id !== Auth::id()) {
            abort(403);
        }
        
        $expenseCategories = ExpenseCategory::where('user_id', Auth::id())->get();
        
        return Inertia::render('Budgets/Edit', [
            'budget' => array_merge($budget->toArray(), [
                'enable_rollover' => $budget->rollover_enabled
            ]),
            'expenseCategories' => $expenseCategories,
            'budgetMethods' => Budget::getAvailableMethods(),
            'budgetPeriods' => Budget::getAvailablePeriods(),
            'budgetTimeFrames' => Budget::getAvailableTimeFrames(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Budget $budget)
    {
        // Ensure the user owns this budget
        if ($budget->user_id !== Auth::id()) {
            abort(403);
        }
        
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'period' => ['required', 'string', 'in:daily,weekly,monthly,yearly'],
            'time_frame' => ['required', 'string', 'in:1_week,1_month,3_months,6_months,1_year,2_years,custom'],
            'time_frame_value' => ['nullable', 'integer', 'min:1', 'required_if:time_frame,custom'],
            'time_frame_unit' => ['nullable', 'string', 'in:days,weeks,months,years', 'required_if:time_frame,custom'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'category_id' => ['nullable', 'exists:expense_categories,id'],
            'notes' => ['nullable', 'string'],
            'enable_rollover' => ['nullable', 'boolean'],
            'rollover_amount' => ['nullable', 'numeric', 'min:0'],
            'budget_method' => ['nullable', 'string', 'in:standard,50-30-20,zero-based'],
            'method_settings' => ['nullable', 'array'],
        ]);
        
        // Set end date based on period if not provided
        if (empty($validated['end_date'])) {
            $startDate = Carbon::parse($validated['start_date']);
            switch ($validated['period']) {
                case 'daily':
                    $validated['end_date'] = $startDate->copy();
                    break;
                case 'weekly':
                    $validated['end_date'] = $startDate->copy()->addWeek()->subDay();
                    break;
                case 'monthly':
                    $validated['end_date'] = $startDate->copy()->addMonth()->subDay();
                    break;
                case 'yearly':
                    $validated['end_date'] = $startDate->copy()->addYear()->subDay();
                    break;
            }
        }
        
        // Map form field names to database column names
        if (isset($validated['enable_rollover'])) {
            $validated['rollover_enabled'] = $validated['enable_rollover'];
            unset($validated['enable_rollover']); 
        }
        
        $validated['budget_method'] = $validated['budget_method'] ?? 'standard';
        
        $budget->update($validated);
        
        // Recalculate and update the overall end date based on time frame
        $overallEndDate = $budget->calculateOverallEndDate();
        $budget->overall_end_date = $overallEndDate;
        $budget->save();
        
        if ($request->wantsJson()) {
            return response()->json([
                'budget' => $budget->fresh()->load('category'),
                'message' => 'Budget updated successfully!'
            ]);
        }
        
        return redirect()->route('budgets.show', $budget)
            ->with('success', 'Budget updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Budget $budget)
    {
        // Ensure the user owns this budget
        if ($budget->user_id !== Auth::id()) {
            abort(403);
        }
        
        $budget->delete();
        
        if (request()->wantsJson()) {
            return response()->json([
                'message' => 'Budget deleted successfully!'
            ]);
        }
        
        return redirect()->route('budgets.index')
            ->with('success', 'Budget deleted successfully!');
    }
    
    /**
     * Get budgets for the dashboard display
     */
    public function dashboardBudgets()
    {
        $budgets = Budget::where('user_id', Auth::id())
            ->with(['category', 'currency'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Transform budgets to include utilization data
        $budgets = $budgets->map(function($budget) {
            $utilization = $budget->calculateUtilization();
            return array_merge($budget->toArray(), [
                'utilization' => $utilization,
                'enable_rollover' => $budget->rollover_enabled
            ]);
        });
            
        return response()->json([
            'budgets' => $budgets
        ]);
    }
    
    /**
     * Process rollover for all of a user's active budgets
     */
    public function processRollovers()
    {
        $processedCount = 0;
        $skippedCount = 0;
        $errors = [];
        
        // Find budgets eligible for rollover
        $eligibleBudgets = Budget::where('user_id', Auth::id())
            ->where('rollover_enabled', true)
            ->where(function($query) {
                $query->where('end_date', '<', now())
                      ->orWhere(function($subQuery) {
                          // Also include budgets where end_date is null but period indicates they should have ended
                          $subQuery->whereNull('end_date')
                                   ->where('start_date', '<', now()->subDays(30)); // For monthly budgets older than 30 days
                      });
            })
            ->get();
            
        foreach ($eligibleBudgets as $budget) {
            try {
                // Calculate the date range for the new period
                $startDate = $budget->end_date ? 
                    Carbon::parse($budget->end_date)->addDay() : 
                    Carbon::parse($budget->start_date)->addMonth(); // Default to monthly if no end_date
                
                // Check if a rollover budget already exists for this period
                $existingBudget = Budget::where('user_id', Auth::id())
                    ->where('category_id', $budget->category_id)
                    ->where('start_date', $startDate)
                    ->where('name', 'like', '%' . $budget->name . '%')
                    ->first();
                    
                if ($existingBudget) {
                    $skippedCount++;
                    continue; // Skip if rollover already exists
                }
                
                // Create a new budget for the next period
                $newBudget = $budget->replicate();
                $newBudget->start_date = $startDate;
                
                switch ($budget->period) {
                    case 'daily':
                        $newBudget->end_date = $startDate->copy();
                        break;
                    case 'weekly':
                        $newBudget->end_date = $startDate->copy()->addWeek()->subDay();
                        break;
                    case 'monthly':
                        $newBudget->end_date = $startDate->copy()->addMonth()->subDay();
                        break;
                    case 'yearly':
                        $newBudget->end_date = $startDate->copy()->addYear()->subDay();
                        break;
                    default:
                        $newBudget->end_date = $startDate->copy()->addMonth()->subDay();
                }
                
                // Calculate rollover amount from the previous budget
                $utilization = $budget->calculateUtilization();
                $rolloverAmount = max(0, $utilization['remaining'] ?? 0);
                
                // Update the new budget with rollover amount
                $newBudget->rollover_amount = $rolloverAmount;
                $newBudget->name = $budget->name . ' (Rollover)';
                
                // Save the new budget
                $newBudget->save();
                $processedCount++;
                
            } catch (\Exception $e) {
                $errors[] = "Error processing rollover for budget '{$budget->name}': " . $e->getMessage();
            }
        }
        
        // Prepare success message based on results
        $message = "Rollover processing complete: ";
        $message .= "{$processedCount} budget(s) rolled over";
        
        if ($skippedCount > 0) {
            $message .= ", {$skippedCount} budget(s) skipped (already rolled over)";
        }
        
        if (empty($eligibleBudgets->toArray())) {
            $message = "No eligible budgets found for rollover. Budgets must have rollover enabled and be past their end date.";
        }
        
        if (!empty($errors)) {
            $message .= ". Errors: " . implode('; ', $errors);
        }
        
        return redirect()->route('budgets.index')
            ->with('success', $message);
    }
    
    /**
     * Apply a budget method to the user's budgets
     */
    public function applyBudgetMethod(Request $request)
    {
        $validated = $request->validate([
            'budget_method' => ['required', 'string', 'in:standard,50-30-20,zero-based'],
            'total_amount' => ['required', 'numeric', 'min:0'],
            'start_date' => ['required', 'date'],
            'period' => ['required', 'string', 'in:weekly,monthly,yearly'],
        ]);
        
        $method = $validated['budget_method'];
        $totalAmount = $validated['total_amount'];
        $startDate = Carbon::parse($validated['start_date']);
        $period = $validated['period'];
        
        // Calculate end date based on period
        $endDate = null;
        switch ($period) {
            case 'weekly':
                $endDate = $startDate->copy()->addWeek()->subDay();
                break;
            case 'monthly':
                $endDate = $startDate->copy()->addMonth()->subDay();
                break;
            case 'yearly':
                $endDate = $startDate->copy()->addYear()->subDay();
                break;
        }
        
        // Get all expense categories
        $expenseCategories = ExpenseCategory::where('user_id', Auth::id())->get();
        
        // Apply the selected budget method
        switch ($method) {
            case '50-30-20':
                $this->apply5030Rule($totalAmount, $startDate, $endDate, $period, $expenseCategories);
                break;
            case 'zero-based':
                $this->applyZeroBasedBudgeting($totalAmount, $startDate, $endDate, $period, $expenseCategories);
                break;
        }
        
        return redirect()->route('budgets.index')
            ->with('success', 'Budget method applied successfully!');
    }
    
    /**
     * Apply the 50/30/20 rule to budgeting
     */
    private function apply5030Rule($totalAmount, $startDate, $endDate, $period, $categories)
    {
        // 50% to needs, 30% to wants, 20% to savings/debt
        $needsAmount = $totalAmount * 0.5;
        $wantsAmount = $totalAmount * 0.3;
        $savingsAmount = $totalAmount * 0.2;
        
        // Create or update budgets for each category based on their type
        foreach ($categories as $category) {
            // Determine which allocation this category gets based on a simple tag in the name or description
            // This is a simplistic approach - in a real app, you'd have a proper category type field
            $amount = 0;
            $categoryLower = strtolower($category->name);
            
            // Very basic categorization based on category name
            if (
                str_contains($categoryLower, 'rent') || 
                str_contains($categoryLower, 'mortgage') || 
                str_contains($categoryLower, 'utilities') || 
                str_contains($categoryLower, 'groceries') || 
                str_contains($categoryLower, 'healthcare')
            ) {
                // Needs category - divide the needs amount evenly among needs categories
                $amount = $needsAmount / 5; // Simple division, could be more sophisticated
            } elseif (
                str_contains($categoryLower, 'entertainment') || 
                str_contains($categoryLower, 'dining') || 
                str_contains($categoryLower, 'shopping') || 
                str_contains($categoryLower, 'subscription')
            ) {
                // Wants category - divide the wants amount evenly among wants categories
                $amount = $wantsAmount / 4; // Simple division
            } elseif (
                str_contains($categoryLower, 'savings') || 
                str_contains($categoryLower, 'investment') || 
                str_contains($categoryLower, 'debt') || 
                str_contains($categoryLower, 'emergency')
            ) {
                // Savings category - divide the savings amount evenly among savings categories
                $amount = $savingsAmount / 4; // Simple division
            } else {
                // Skip categories that don't match our simple rules
                continue;
            }
            
            // Create or update budget for this category
            Budget::updateOrCreate(
                [
                    'user_id' => Auth::id(),
                    'category_id' => $category->id,
                    'period' => $period,
                    'start_date' => $startDate,
                ],
                [
                    'name' => '50/30/20 - ' . $category->name,
                    'amount' => $amount,
                    'end_date' => $endDate,
                    'budget_method' => '50-30-20',
                    'method_settings' => [
                        'allocation_type' => $this->getCategoryType($category),
                        'rule' => '50-30-20'
                    ],
                ]
            );
        }
    }
    
    /**
     * Apply zero-based budgeting
     */
    private function applyZeroBasedBudgeting($totalAmount, $startDate, $endDate, $period, $categories)
    {
        // Simple demonstration of zero-based budgeting
        // In a real app, you'd let users allocate specific amounts to each category

        // For now, distribute the total amount evenly across all categories
        $categoryCount = count($categories);
        if ($categoryCount > 0) {
            $amountPerCategory = $totalAmount / $categoryCount;
            
            foreach ($categories as $category) {
                Budget::updateOrCreate(
                    [
                        'user_id' => Auth::id(),
                        'category_id' => $category->id,
                        'period' => $period,
                        'start_date' => $startDate,
                    ],
                    [
                        'name' => 'Zero-Based - ' . $category->name,
                        'amount' => $amountPerCategory,
                        'end_date' => $endDate,
                        'budget_method' => 'zero-based',
                        'method_settings' => [
                            'zero_based_allocation' => $amountPerCategory,
                        ],
                    ]
                );
            }
        }
    }
    
    /**
     * Determine category type based on name/description (simple heuristic)
     */
    private function getCategoryType($category)
    {
        $categoryLower = strtolower($category->name);
        
        if (
            str_contains($categoryLower, 'rent') ||
            str_contains($categoryLower, 'mortgage') ||
            str_contains($categoryLower, 'utilities') ||
            str_contains($categoryLower, 'groceries') ||
            str_contains($categoryLower, 'healthcare')
        ) {
            return 'need';
        } elseif (
            str_contains($categoryLower, 'entertainment') ||
            str_contains($categoryLower, 'dining') ||
            str_contains($categoryLower, 'shopping') ||
            str_contains($categoryLower, 'subscription')
        ) {
            return 'want';
        } elseif (
            str_contains($categoryLower, 'savings') ||
            str_contains($categoryLower, 'investment') ||
            str_contains($categoryLower, 'debt') ||
            str_contains($categoryLower, 'emergency')
        ) {
            return 'savings';
        } else {
            return 'other';
        }
    }

    /**
     * Get budget variance analysis
     */
    public function getVarianceAnalysis(Budget $budget)
    {
        if ($budget->user_id !== Auth::id()) {
            abort(403);
        }

        $analysis = $budget->getVarianceAnalysis();
        
        return response()->json([
            'variance_analysis' => $analysis
        ]);
    }

    /**
     * Get monthly comparison data
     */
    public function getMonthlyComparison(Budget $budget)
    {
        if ($budget->user_id !== Auth::id()) {
            abort(403);
        }

        $comparison = $budget->getMonthlyComparison();
        
        return response()->json([
            'monthly_comparison' => $comparison
        ]);
    }

    /**
     * Get yearly comparison data
     */
    public function getYearlyComparison(Budget $budget)
    {
        if ($budget->user_id !== Auth::id()) {
            abort(403);
        }

        $comparison = $budget->getYearlyComparison();
        
        return response()->json([
            'yearly_comparison' => $comparison
        ]);
    }

    /**
     * Show budget comparison dashboard
     */
    public function showComparison(Budget $budget)
    {
        if ($budget->user_id !== Auth::id()) {
            abort(403);
        }

        $varianceAnalysis = $budget->getVarianceAnalysis();
        $monthlyComparison = $budget->getMonthlyComparison();
        $yearlyComparison = $budget->getYearlyComparison();
        
        return Inertia::render('Budgets/Show', [
            'budget' => array_merge($budget->load('category')->toArray(), [
                'utilization' => $budget->calculateUtilization(),
                'variance_analysis' => $varianceAnalysis,
                'monthly_comparison' => $monthlyComparison,
                'yearly_comparison' => $yearlyComparison,
                'enable_rollover' => $budget->rollover_enabled
            ]),
            'expenses' => $budget->expenses(),
        ]);
    }
}
