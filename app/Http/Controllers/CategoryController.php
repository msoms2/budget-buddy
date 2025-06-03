<?php

namespace App\Http\Controllers;

use App\Models\ExpenseCategory;
use App\Models\EarningCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     */
    public function index(Request $request)
    {
        $userId = Auth::id();
        $type = $request->query('type');

        if ($request->wantsJson()) {
            // API request - return only requested category type
            if ($type === 'expense') {
                return ExpenseCategory::where('user_id', $userId)
                    ->get()
                    ->map(function ($category) {
                        $category->type = 'expense';
                        $category->count = $category->expenses()->count();
                        return $category;
                    });
            } elseif ($type === 'earning') {
                return EarningCategory::where('user_id', $userId)
                    ->get()
                    ->map(function ($category) {
                        $category->type = 'earning';
                        $category->count = $category->earnings()->count();
                        return $category;
                    });
            }
        }

        // Web request - return both types for the Inertia view
        $expenseCategories = ExpenseCategory::where('user_id', $userId)
            ->get()
            ->map(function ($category) {
                $category->type = 'expense';
                $category->count = $category->expenses()->count();
                return $category;
            });
        
        $earningCategories = EarningCategory::where('user_id', $userId)
            ->get()
            ->map(function ($category) {
                $category->type = 'earning';
                $category->count = $category->earnings()->count();
                return $category;
            });
        
        // If the user has no categories, copy the default ones from any existing user
        if ($expenseCategories->isEmpty() && $earningCategories->isEmpty()) {
            $this->copyDefaultCategoriesForUser($userId);
            
            // Fetch categories again after copying defaults
            $expenseCategories = ExpenseCategory::where('user_id', $userId)->get()->map(function ($category) {
                $category->type = 'expense';
                $category->count = $category->expenses()->count();
                return $category;
            });
            
            $earningCategories = EarningCategory::where('user_id', $userId)->get()->map(function ($category) {
                $category->type = 'earning';
                $category->count = $category->earnings()->count();
                return $category;
            });
        }

        return Inertia::render('Categories/Index', [
            'expenseCategories' => $expenseCategories,
            'earningCategories' => $earningCategories,
        ]);
    }
    
    /**
     * Copy default categories from other users or create new ones for a user with no categories
     */
    private function copyDefaultCategoriesForUser($userId)
    {
        // First check if we have categories in the main categories table to migrate
        $mainCategories = \App\Models\Category::get();
        
        if ($mainCategories->isNotEmpty()) {
            // We have categories in the main table, migrate them
            foreach ($mainCategories as $category) {
                if ($category->type === 'expense') {
                    // Import expense categories
                    ExpenseCategory::firstOrCreate(
                        [
                            'name' => $category->name,
                            'user_id' => $userId,
                        ],
                        [
                            'description' => $category->description,
                            'icon' => $category->icon ?? '🛒',
                            'icon_color' => $category->color ?? '#16a34a',
                            'bg_color' => '#e5e7eb',
                            'is_system' => true,
                        ]
                    );
                } elseif ($category->type === 'income' || $category->type === 'earning') {
                    // Import income categories
                    EarningCategory::firstOrCreate(
                        [
                            'name' => $category->name,
                            'user_id' => $userId,
                        ],
                        [
                            'description' => $category->description,
                            'icon' => $category->icon ?? '💰',
                            'icon_color' => $category->color ?? '#10b981',
                            'bg_color' => '#d1fae5',
                        ]
                    );
                }
            }
            
            return;
        }
        
        // If we didn't find any categories to migrate, try to copy from other users as fallback
        $anotherUserExpenseCategories = ExpenseCategory::where('user_id', '!=', $userId)
                                        ->where('is_system', true)
                                        ->get();
                                        
        $anotherUserEarningCategories = EarningCategory::where('user_id', '!=', $userId)
                                       ->get();
        
        // Copy expense categories if any exist
        if ($anotherUserExpenseCategories->isNotEmpty()) {
            foreach ($anotherUserExpenseCategories as $category) {
                ExpenseCategory::create([
                    'name' => $category->name,
                    'description' => $category->description,
                    'icon' => $category->icon,
                    'icon_color' => $category->icon_color,
                    'bg_color' => $category->bg_color,
                    'user_id' => $userId,
                    'is_system' => true
                ]);
            }
        } else {
            // Create default expense categories if no other user has them
            $defaultExpenseCategories = [
                [
                    'name' => 'Housing',
                    'description' => 'Rent, mortgage payments, property taxes, HOA fees',
                    'icon' => '🏠',
                    'icon_color' => '#4b5563',
                    'bg_color' => '#e5e7eb',
                ],
                [
                    'name' => 'Groceries',
                    'description' => 'Food and household supplies',
                    'icon' => '🛒', 
                    'icon_color' => '#16a34a',
                    'bg_color' => '#dcfce7',
                ],
                [
                    'name' => 'Utilities',
                    'description' => 'Electricity, water, gas, internet, phone',
                    'icon' => '💡',
                    'icon_color' => '#eab308',
                    'bg_color' => '#fef9c3',
                ],
                [
                    'name' => 'Transportation',
                    'description' => 'Gas, car payments, public transit, maintenance',
                    'icon' => '🚗',
                    'icon_color' => '#2563eb',
                    'bg_color' => '#dbeafe',
                ],
                [
                    'name' => 'Healthcare',
                    'description' => 'Insurance, medications, doctor visits',
                    'icon' => '🏥',
                    'icon_color' => '#dc2626',
                    'bg_color' => '#fee2e2',
                ],
                [
                    'name' => 'Entertainment',
                    'description' => 'Movies, streaming services, hobbies',
                    'icon' => '🎬',
                    'icon_color' => '#8b5cf6',
                    'bg_color' => '#ede9fe',
                ],
                [
                    'name' => 'Dining Out',
                    'description' => 'Restaurants, takeout, delivery',
                    'icon' => '🍽️',
                    'icon_color' => '#ea580c',
                    'bg_color' => '#ffedd5',
                ],
                [
                    'name' => 'Education',
                    'description' => 'Tuition, books, courses',
                    'icon' => '📚',
                    'icon_color' => '#0891b2',
                    'bg_color' => '#cffafe',
                ],
                [
                    'name' => 'Travel',
                    'description' => 'Flights, hotels, vacations',
                    'icon' => '✈️',
                    'icon_color' => '#0369a1',
                    'bg_color' => '#e0f2fe',
                ],
                [
                    'name' => 'Shopping',
                    'description' => 'Clothing, electronics, personal items',
                    'icon' => '🛍️',
                    'icon_color' => '#db2777',
                    'bg_color' => '#fce7f3',
                ]
            ];
            
            foreach ($defaultExpenseCategories as $category) {
                ExpenseCategory::create([
                    'name' => $category['name'],
                    'description' => $category['description'],
                    'icon' => $category['icon'],
                    'icon_color' => $category['icon_color'],
                    'bg_color' => $category['bg_color'],
                    'user_id' => $userId,
                    'is_system' => true
                ]);
            }
        }
        
        // Copy earning categories if any exist
        if ($anotherUserEarningCategories->isNotEmpty()) {
            foreach ($anotherUserEarningCategories as $category) {
                EarningCategory::create([
                    'name' => $category->name,
                    'description' => $category->description,
                    'icon' => $category->icon,
                    'icon_color' => $category->icon_color,
                    'bg_color' => $category->bg_color,
                    'user_id' => $userId
                ]);
            }
        } else {
            // Create default earning categories if no other user has them
            $defaultEarningCategories = [
                [
                    'name' => 'Salary',
                    'description' => 'Regular employment income',
                    'icon' => '💰',
                    'icon_color' => '#10b981',
                    'bg_color' => '#d1fae5',
                ],
                [
                    'name' => 'Freelance',
                    'description' => 'Contract and freelance work',
                    'icon' => '💻',
                    'icon_color' => '#6366f1',
                    'bg_color' => '#e0e7ff',
                ],
                [
                    'name' => 'Investments',
                    'description' => 'Dividends, capital gains, interest',
                    'icon' => '📈',
                    'icon_color' => '#0891b2',
                    'bg_color' => '#cffafe',
                ],
                [
                    'name' => 'Rental Income',
                    'description' => 'Income from rental properties',
                    'icon' => '🏢',
                    'icon_color' => '#4b5563',
                    'bg_color' => '#e5e7eb',
                ],
                [
                    'name' => 'Side Business',
                    'description' => 'Income from side businesses or gigs',
                    'icon' => '🛍️',
                    'icon_color' => '#db2777',
                    'bg_color' => '#fce7f3',
                ]
            ];
            
            foreach ($defaultEarningCategories as $category) {
                EarningCategory::create([
                    'name' => $category['name'],
                    'description' => $category['description'],
                    'icon' => $category['icon'],
                    'icon_color' => $category['icon_color'],
                    'bg_color' => $category['bg_color'],
                    'user_id' => $userId
                ]);
            }
        }
    }

    /**
     * Show the form for creating a new category.
     */
    public function create()
    {
        return Inertia::render('Categories/Create');
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'icon_color' => 'nullable|string',
            'bg_color' => 'nullable|string',
            'type' => 'required|in:expense,earning',
            'parent_id' => 'nullable|integer',
            'is_fixed_type' => 'nullable|boolean',
            'stay_on_page' => 'nullable|boolean',
        ]);

        $categoryData = [
            'name' => $request->name,
            'description' => $request->description,
            'icon' => $request->icon,
            'icon_color' => $request->icon_color,
            'bg_color' => $request->bg_color,
            'user_id' => Auth::id(),
            'is_fixed_type' => $request->boolean('is_fixed_type', false),
        ];
        
        // Add parent_id to categoryData if it's provided (for subcategories)
        if ($request->parent_id) {
            $categoryData['parent_id'] = $request->parent_id;
        }

        $type = $request->type;
        $isSubcategory = !empty($request->parent_id);
        $successMessage = $type === 'expense' 
            ? ($isSubcategory ? 'Expense subcategory created successfully' : 'Expense category created successfully')
            : ($isSubcategory ? 'Income subcategory created successfully' : 'Income category created successfully');

        if ($type === 'expense') {
            // Verify parent category exists if creating a subcategory
            if ($isSubcategory) {
                $parentCategory = ExpenseCategory::where('id', $request->parent_id)
                    ->where('user_id', Auth::id())
                    ->whereNull('parent_id')  // Ensure parent is a top-level category
                    ->firstOrFail();
            }
            ExpenseCategory::create($categoryData);
        } else {
            // Verify parent category exists if creating a subcategory
            if ($isSubcategory) {
                $parentCategory = EarningCategory::where('id', $request->parent_id)
                    ->where('user_id', Auth::id())
                    ->whereNull('parent_id')  // Ensure parent is a top-level category
                    ->firstOrFail();
            }
            EarningCategory::create($categoryData);
        }
        
        // If stay_on_page is true, redirect back to create with success message
        if ($request->stay_on_page) {
            return Redirect::route('categories.create')->with('success', $successMessage);
        }
        
        return Redirect::route('categories.index')->with('success', $successMessage);
    }

    /**
     * Display the specified category.
     */
    public function show(Request $request, $category)
    {
        // Get the category type from the request
        $type = $request->query('type', 'expense');
        
        if ($type === 'expense') {
            $categoryModel = ExpenseCategory::where('user_id', Auth::id())
                ->where('id', $category)
                ->firstOrFail();
            
            // Get expenses from both the main category and its subcategories
            $expenses = ExpenseCategory::where(function($query) use ($categoryModel) {
                $query->where('id', $categoryModel->id)
                    ->orWhereIn('id', ExpenseCategory::where('parent_id', $categoryModel->id)
                        ->where('user_id', Auth::id())
                        ->pluck('id'));
            })
            ->where('user_id', Auth::id())
            ->with(['expenses' => function($query) {
                $query->latest()->with('category'); // Include category relationship
            }])
            ->get()
            ->pluck('expenses')
            ->flatten()
            ->map(function($expense) {
                // Add subcategory info to each transaction
                $expense->subcategory = $expense->category->parent_id ? $expense->category : null;
                return $expense;
            });

            // Calculate totals including subcategory transactions
            $total = $expenses->sum('amount');
            $average = $expenses->count() > 0 ? $total / $expenses->count() : 0;
            $highest = $expenses->count() > 0 ? $expenses->max('amount') : 0;
            $lowest = $expenses->count() > 0 ? $expenses->min('amount') : 0;
            
            // Get subcategories with their aggregated data using Eloquent relationships
            $subcategories = ExpenseCategory::where('parent_id', $categoryModel->id)
                ->where('user_id', Auth::id())
                ->withCount('expenses')
                ->withSum('expenses', 'amount')
                ->get()
                ->map(function ($subcategory) {
                    // Include all necessary fields for the subcategory view
                    return [
                        'id' => $subcategory->id,
                        'name' => $subcategory->name,
                        'description' => $subcategory->description,
                        'icon' => $subcategory->icon,
                        'icon_color' => $subcategory->icon_color,
                        'bg_color' => $subcategory->bg_color,
                        'total' => $subcategory->expenses_sum_amount ?? 0,
                        'count' => $subcategory->expenses_count ?? 0
                    ];
                });
                
            // Get category totals for comparison
            $categoryTotals = DB::table('expenses')
                ->join('expense_categories', 'expenses.category_id', '=', 'expense_categories.id')
                ->select(
                    'expense_categories.id',
                    'expense_categories.name',
                    \DB::raw('SUM(expenses.amount) as total')
                )
                ->where('expenses.user_id', Auth::id())
                ->groupBy('expense_categories.id', 'expense_categories.name')
                ->orderBy('total', 'desc')
                ->get();
                
            // Set current period (can be enhanced later for selection)
            $period = 'month';
            
            return Inertia::render('Categories/Show', [
                'category' => $categoryModel,
                'transactions' => $expenses->sortByDesc('date')->values(),
                'allTransactionsData' => [
                    'total' => $total,
                    'count' => $expenses->count(),
                    'average' => $average,
                    'highest' => $highest,
                    'lowest' => $lowest,
                    'subcategories' => $subcategories // Include subcategory data here as well
                ],
                'subcategories' => $subcategories,
                'categoryTotals' => $categoryTotals,
                'period' => $period,
                'type' => 'expense'
            ]);
        } else { // For earnings
            $categoryModel = EarningCategory::where('user_id', Auth::id())
                ->where('id', $category)
                ->firstOrFail();
            
            // Get earnings from both the main category and its subcategories
            $earnings = EarningCategory::where(function($query) use ($categoryModel) {
                $query->where('id', $categoryModel->id)
                    ->orWhereIn('id', EarningCategory::where('parent_id', $categoryModel->id)
                        ->where('user_id', Auth::id())
                        ->pluck('id'));
            })
            ->where('user_id', Auth::id())
            ->with(['earnings' => function($query) {
                $query->latest()->with('category'); // Include category relationship
            }])
            ->get()
            ->pluck('earnings')
            ->flatten()
            ->map(function($earning) {
                // Add subcategory info to each transaction
                $earning->subcategory = $earning->category->parent_id ? $earning->category : null;
                return $earning;
            });

            // Calculate totals including subcategory transactions
            $total = $earnings->sum('amount');
            $average = $earnings->count() > 0 ? $total / $earnings->count() : 0;
            $highest = $earnings->count() > 0 ? $earnings->max('amount') : 0;
            $lowest = $earnings->count() > 0 ? $earnings->min('amount') : 0;
            
            // Also fetch subcategories for income categories
            $subcategories = EarningCategory::where('parent_id', $categoryModel->id)
                ->where('user_id', Auth::id())
                ->get()
                ->map(function ($subcategory) {
                    $earnings = $subcategory->getAllEarnings()->get();
                    return [
                        'id' => $subcategory->id,
                        'name' => $subcategory->name,
                        'description' => $subcategory->description,
                        'icon' => $subcategory->icon,
                        'icon_color' => $subcategory->icon_color,
                        'bg_color' => $subcategory->bg_color,
                        'total' => $earnings->sum('amount'),
                        'count' => $earnings->count()
                    ];
                })
                ->get()
                ->map(function ($subcategory) {
                    // Include all necessary fields for the subcategory view
                    return [
                        'id' => $subcategory->id,
                        'name' => $subcategory->name,
                        'description' => $subcategory->description,
                        'icon' => $subcategory->icon,
                        'icon_color' => $subcategory->icon_color,
                        'bg_color' => $subcategory->bg_color, 
                        'total' => $subcategory->earnings_sum_amount ?? 0,
                        'count' => $subcategory->earnings_count ?? 0
                    ];
                });
                
            $categoryTotals = \DB::table('earnings')
                ->join('earning_categories', 'earnings.category_id', '=', 'earning_categories.id')
                ->select(
                    'earning_categories.id',
                    'earning_categories.name',
                    \DB::raw('SUM(earnings.amount) as total')
                )
                ->where('earnings.user_id', Auth::id())
                ->groupBy('earning_categories.id', 'earning_categories.name')
                ->orderBy('total', 'desc')
                ->get();
                
            // Set current period (can be enhanced later for selection)
            $period = 'month';
            
            return Inertia::render('Categories/Show', [
                'category' => $categoryModel,
                'transactions' => $earnings->sortByDesc('date')->values(),
                'allTransactionsData' => [
                    'total' => $total,
                    'count' => $earnings->count(),
                    'average' => $average,
                    'highest' => $highest,
                    'lowest' => $lowest,
                    'subcategories' => $subcategories // Include subcategory data here as well
                ],
                'subcategories' => $subcategories,
                'categoryTotals' => $categoryTotals,
                'period' => $period,
                'type' => 'earning'
            ]);
        }
    }

    /**
     * Display the specified expense category.
     */
    public function showExpense($category)
    {
        $categoryModel = ExpenseCategory::where('user_id', Auth::id())
            ->where('id', $category)
            ->firstOrFail();
        
        $expenses = $categoryModel->expenses()->latest()->get();
        
        // Calculate total using either amount or sum field
        $total = $expenses->sum('amount');

        $average = $expenses->count() > 0 ? $total / $expenses->count() : 0;
        
        // Calculate highest using either amount or sum field
        $highest = 0;
        if ($expenses->count() > 0) {
            $highest = $expenses->max('amount');
        }

        // Calculate lowest using either amount or sum field
        $lowest = 0;
        if ($expenses->count() > 0) {
            $lowest = $expenses->min('amount');
        }
        
        // Get subcategories with their aggregated data using Eloquent relationships
        $subcategories = ExpenseCategory::where('parent_id', $categoryModel->id)
            ->where('user_id', Auth::id())
            ->withCount('expenses')
            ->withSum('expenses', 'amount')
            ->get()
            ->map(function ($subcategory) {
                // Include all necessary fields for the subcategory view
                return [
                    'id' => $subcategory->id,
                    'name' => $subcategory->name,
                    'description' => $subcategory->description,
                    'icon' => $subcategory->icon,
                    'icon_color' => $subcategory->icon_color,
                    'bg_color' => $subcategory->bg_color,
                    'total' => $subcategory->expenses_sum_amount ?? 0,
                    'count' => $subcategory->expenses_count ?? 0
                ];
            });
            
        // Get category totals for comparison
        $categoryTotals = DB::table('expenses')
            ->join('expense_categories', 'expenses.category_id', '=', 'expense_categories.id')
            ->select(
                'expense_categories.id',
                'expense_categories.name',
                DB::raw('SUM(expenses.amount) as total')
            )
            ->where('expenses.user_id', Auth::id())
            ->groupBy('expense_categories.id', 'expense_categories.name')
            ->orderBy('total', 'desc')
            ->get();
            
        // Set current period (can be enhanced later for selection)
        $period = 'month';
        
        return Inertia::render('Categories/Show', [
            'category' => $categoryModel,
            'transactions' => $expenses,
            'allTransactionsData' => [
                'total' => $total,
                'count' => $expenses->count(),
                'average' => $average,
                'highest' => $highest,
                'lowest' => $lowest,
                'subcategories' => $subcategories // Include subcategory data here as well
            ],
            'subcategories' => $subcategories,
            'categoryTotals' => $categoryTotals,
            'period' => $period,
            'type' => 'expense'
        ]);
    }

    /**
     * Display the specified income category.
     */
    public function showIncome($category)
    {
        $categoryModel = EarningCategory::where('user_id', Auth::id())
            ->where('id', $category)
            ->firstOrFail();
        
        $earnings = $categoryModel->earnings()->latest()->get();
        
        // For earnings, check if we need to use 'amount' field instead of 'sum'
        $total = $earnings->sum('amount');
        
        $average = $earnings->count() > 0 ? $total / $earnings->count() : 0;
        
        $highest = 0;
        if ($earnings->count() > 0) {
            $highest = $earnings->max('amount');
        }
        
        $lowest = 0;
        if ($earnings->count() > 0) {
            $lowest = $earnings->min('amount');
        }
        
        // Fetch subcategories for income categories
        $subcategories = EarningCategory::where('parent_id', $categoryModel->id)
            ->where('user_id', Auth::id())
            ->withCount('earnings')
            ->withSum('earnings', 'amount')
            ->get()
            ->map(function ($subcategory) {
                // Include all necessary fields for the subcategory view
                return [
                    'id' => $subcategory->id,
                    'name' => $subcategory->name,
                    'description' => $subcategory->description,
                    'icon' => $subcategory->icon,
                    'icon_color' => $subcategory->icon_color,
                    'bg_color' => $subcategory->bg_color,
                    'total' => $subcategory->earnings_sum_amount ?? 0,
                    'count' => $subcategory->earnings_count ?? 0
                ];
            });
            
        $categoryTotals = \DB::table('earnings')
            ->join('earning_categories', 'earnings.category_id', '=', 'earning_categories.id')
            ->select(
                'earning_categories.id',
                'earning_categories.name',
                \DB::raw('SUM(earnings.amount) as total')
            )
            ->where('earnings.user_id', Auth::id())
            ->groupBy('earning_categories.id', 'earning_categories.name')
            ->orderBy('total', 'desc')
            ->get();
            
        // Set current period (can be enhanced later for selection)
        $period = 'month';
        
        return Inertia::render('Categories/Show', [
            'category' => $categoryModel,
            'transactions' => $earnings,
            'allTransactionsData' => [
                'total' => $total,
                'count' => $earnings->count(),
                'average' => $average,
                'highest' => $highest,
                'lowest' => $lowest,
                'subcategories' => $subcategories // Include subcategory data here as well
            ],
            'subcategories' => $subcategories, 
            'categoryTotals' => $categoryTotals,
            'period' => $period,
            'type' => 'earning'
        ]);
    }

    /**
     * Show the form for editing the specified category.
     */
    public function edit(Request $request, $category)
    {
        $type = $request->query('type', 'expense');
        
        if ($type === 'expense') {
            $categoryModel = ExpenseCategory::where('user_id', Auth::id())
                ->where('id', $category)
                ->firstOrFail();
        } else { // Assuming 'earning'
            $categoryModel = EarningCategory::where('user_id', Auth::id())
                ->where('id', $category)
                ->firstOrFail();
        }
        
        return Inertia::render('Categories/Edit', [
            'category' => $categoryModel,
            'type' => $type
        ]);
    }

    /**
     * Show the form for editing the specified expense category.
     */
    public function editExpense($category)
    {
        $categoryModel = ExpenseCategory::where('user_id', Auth::id())
            ->where('id', $category)
            ->firstOrFail();
        
        return Inertia::render('Categories/Edit', [
            'category' => $categoryModel,
            'type' => 'expense'
        ]);
    }

    /**
     * Show the form for editing the specified income category.
     */
    public function editIncome($category)
    {
        $categoryModel = EarningCategory::where('user_id', Auth::id())
            ->where('id', $category)
            ->firstOrFail();
        
        return Inertia::render('Categories/Edit', [
            'category' => $categoryModel,
            'type' => 'earning'
        ]);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, $category)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string',
            'icon_color' => 'nullable|string',
            'bg_color' => 'nullable|string',
            'type' => 'required|in:expense,earning',
            'parent_id' => 'nullable|integer',
            'is_fixed_type' => 'nullable|boolean',
        ]);

        $categoryData = [
            'name' => $request->name,
            'description' => $request->description,
            'icon' => $request->icon,
            'icon_color' => $request->icon_color,
            'bg_color' => $request->bg_color,
            'is_fixed_type' => $request->boolean('is_fixed_type', false),
        ];
        
        // Handle parent_id for subcategories
        if ($request->has('parent_id')) {
            if ($request->parent_id) {
                $categoryData['parent_id'] = $request->parent_id;
            } else {
                $categoryData['parent_id'] = null; // Remove parent association if empty
            }
        }
        
        $isSubcategory = !empty($request->parent_id);
        $successMessage = $request->type === 'expense' 
            ? ($isSubcategory ? 'Expense subcategory updated successfully' : 'Expense category updated successfully') 
            : ($isSubcategory ? 'Income subcategory updated successfully' : 'Income category updated successfully');

        // Use the type from the request body to determine which model to update
        if ($request->type === 'expense') {
            $categoryModel = ExpenseCategory::where('user_id', Auth::id())
                ->where('id', $category)
                ->firstOrFail();
            
            // Verify parent exists when updating a subcategory
            if ($isSubcategory) {
                $parentCategory = ExpenseCategory::where('id', $request->parent_id)
                    ->where('user_id', Auth::id())
                    ->whereNull('parent_id')  // Ensure parent is a top-level category
                    ->firstOrFail();
                    
                // Don't allow setting itself as its own parent
                if ($parentCategory->id == $categoryModel->id) {
                    return Redirect::back()->withErrors(['parent_id' => 'A category cannot be its own parent']);
                }
            }
                
            $categoryModel->update($categoryData);
            
            return Redirect::route('categories.index')->with('success', $successMessage);
        } else { // Assuming 'earning'
            $categoryModel = EarningCategory::where('user_id', Auth::id())
                ->where('id', $category)
                ->firstOrFail();
            
            // Verify parent exists when updating a subcategory
            if ($isSubcategory) {
                $parentCategory = EarningCategory::where('id', $request->parent_id)
                    ->where('user_id', Auth::id())
                    ->whereNull('parent_id')  // Ensure parent is a top-level category
                    ->firstOrFail();
                    
                // Don't allow setting itself as its own parent
                if ($parentCategory->id == $categoryModel->id) {
                    return Redirect::back()->withErrors(['parent_id' => 'A category cannot be its own parent']);
                }
            }
                
            $categoryModel->update($categoryData);
            
            return Redirect::route('categories.index')->with('success', $successMessage);
        }
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Request $request, $category)
    {
        // Check both query string and request body for type, prioritize query
        // For DELETE via Inertia link, type might be in request body if sent as data
        $type = $request->query('type', $request->input('type', 'expense')); 
        
        if ($type === 'expense') {
            $categoryModel = ExpenseCategory::where('user_id', Auth::id())
                ->where('id', $category)
                ->firstOrFail();
            
            // Consider what to do with expenses in this category before deleting
            // You might want to reassign them to a default category or delete them
                
            $categoryModel->delete();
            
            return Redirect::route('categories.index')->with('success', 'Expense category deleted successfully');
        } else { // Assuming 'earning' if not 'expense'
            $categoryModel = EarningCategory::where('user_id', Auth::id())
                ->where('id', $category)
                ->firstOrFail();
            
            // Consider what to do with earnings in this category before deleting
                
            $categoryModel->delete();
            
            return Redirect::route('categories.index')->with('success', 'Income category deleted successfully');
        }
    }

    /**
     * Remove the specified expense category from storage.
     */
    public function destroyExpense($category)
    {
        $categoryModel = ExpenseCategory::where('user_id', Auth::id())
            ->where('id', $category)
            ->firstOrFail();
        
        // Consider what to do with expenses in this category before deleting
            
        $categoryModel->delete();
        
        return Redirect::route('categories.index')->with('success', 'Expense category deleted successfully');
    }

    /**
     * Remove the specified income category from storage.
     */
    public function destroyIncome($category)
    {
        $categoryModel = EarningCategory::where('user_id', Auth::id())
            ->where('id', $category)
            ->firstOrFail();
        
        // Consider what to do with earnings in this category before deleting
            
        $categoryModel->delete();
        
        return Redirect::route('categories.index')->with('success', 'Income category deleted successfully');
    }

    /**
     * Get subcategories for the specified category
     *
     * @param Request $request
     * @param string $categoryId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSubcategories(Request $request, $categoryId)
    {
        try {
            $type = $request->query('type', 'expense');
            $model = $type === 'expense' ? ExpenseCategory::class : EarningCategory::class;

            // Verify parent category exists and belongs to user
            $category = $model::where('id', $categoryId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            // Get subcategories with transaction counts
            $subcategories = $model::where('parent_id', $categoryId)
                ->where('user_id', Auth::id())
                ->get()
                ->map(function ($subcategory) use ($type) {
                    if ($type === 'expense') {
                        $transactions = $subcategory->expenses;
                        $amount = $transactions->sum('amount');
                        $count = $transactions->count();
                    } else {
                        $transactions = $subcategory->earnings;
                        $amount = $transactions->sum('amount');
                        $count = $transactions->count();
                    }
                    return [
                        'id' => $subcategory->id,
                        'name' => $subcategory->name,
                        'description' => $subcategory->description,
                        'icon' => $subcategory->icon,
                        'icon_color' => $subcategory->icon_color,
                        'bg_color' => $subcategory->bg_color,
                        'transaction_count' => $count,
                        'total_amount' => $amount
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
}
