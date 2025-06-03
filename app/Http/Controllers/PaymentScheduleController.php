<?php

namespace App\Http\Controllers;

use App\Models\PaymentSchedule;
use App\Models\ExpenseCategory;
use App\Models\PaymentMethod;
use App\Models\Currency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class PaymentScheduleController extends Controller
{
    /**
     * Display a listing of the payment schedules.
     */
    public function index(Request $request)
    {
        $filter = $request->input('filter', 'upcoming');
        
        $query = PaymentSchedule::where('user_id', Auth::id())
            ->with(['category', 'subcategory', 'paymentMethod', 'currency']);
            
        // Apply filtering
        $query = match($filter) {
            'overdue' => $query->where('status', 'pending')->where('due_date', '<', now()),
            'completed' => $query->where('status', 'completed'),
            'cancelled' => $query->where('status', 'cancelled'),
            'recurring' => $query->where('is_recurring', true),
            'upcoming' => $query->where('status', 'pending')->where('due_date', '>=', now()),
            default => $query->where('status', 'pending'),
        };
        
        // Apply sorting
        $sortField = $request->input('sort_field', 'due_date');
        $sortDirection = $request->input('sort_direction', 'asc');
        $query = $query->orderBy($sortField, $sortDirection);
        
        // Paginate results
        $paymentSchedules = $query->paginate(10);
        
        return Inertia::render('PaymentSchedules/Index', [
            'paymentSchedules' => $paymentSchedules,
            'filter' => $filter,
            'sortField' => $sortField,
            'sortDirection' => $sortDirection,
            'stats' => [
                'upcoming' => PaymentSchedule::where('user_id', Auth::id())
                    ->where('status', 'pending')
                    ->where('due_date', '>=', now())
                    ->count(),
                'overdue' => PaymentSchedule::where('user_id', Auth::id())
                    ->where('status', 'pending')
                    ->where('due_date', '<', now())
                    ->count(),
                'recurring' => PaymentSchedule::where('user_id', Auth::id())
                    ->where('is_recurring', true)
                    ->count(),
                'completed' => PaymentSchedule::where('user_id', Auth::id())
                    ->where('status', 'completed')
                    ->count(),
            ]
        ]);
    }

    /**
     * Show the form for creating a new payment schedule.
     */
    public function create()
    {
        $expenseCategories = ExpenseCategory::where('user_id', Auth::id())
            ->whereNull('parent_id')
            ->get();
            
        $paymentMethods = PaymentMethod::where('user_id', Auth::id())
            ->where('is_active', true)
            ->get();
            
        $currencies = Currency::all();
        
        return Inertia::render('PaymentSchedules/Create', [
            'categories' => $expenseCategories,
            'paymentMethods' => $paymentMethods,
            'currencies' => $currencies
        ]);
    }

    /**
     * Store a newly created payment schedule in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'amount' => ['required', 'numeric', 'min:0'],
            'due_date' => ['required', 'date'],
            'reminder_date' => ['nullable', 'date', 'before_or_equal:due_date'],
            'category_id' => ['nullable', 'exists:expense_categories,id'],
            'subcategory_id' => ['nullable', 'exists:expense_categories,id'],
            'payment_method_id' => ['nullable', 'exists:payment_methods,id'],
            'currency_id' => ['nullable', 'exists:currencies,id'],
            'recipient' => ['nullable', 'string', 'max:255'],
            'is_recurring' => ['boolean'],
            'frequency' => ['nullable', 'string', 'required_if:is_recurring,true'],
            'recurring_end_date' => ['nullable', 'date', 'after:due_date'],
            'auto_process' => ['boolean'],
        ]);
        
        // Verify category belongs to user
        if (!empty($validated['category_id'])) {
            $category = ExpenseCategory::where('id', $validated['category_id'])
                ->where('user_id', Auth::id())
                ->firstOrFail();
        }
        
        // Verify subcategory belongs to category
        if (!empty($validated['subcategory_id']) && !empty($validated['category_id'])) {
            $subcategory = ExpenseCategory::where('id', $validated['subcategory_id'])
                ->where('parent_id', $validated['category_id'])
                ->where('user_id', Auth::id())
                ->firstOrFail();
        }
        
        // Add user_id to validated data
        $validated['user_id'] = Auth::id();
        
        // Create payment schedule
        $paymentSchedule = PaymentSchedule::create($validated);
        
        return redirect()->route('payment-schedules.index')
            ->with('success', 'Payment schedule created successfully!');
    }

    /**
     * Display the specified payment schedule.
     */
    public function show(PaymentSchedule $paymentSchedule)
    {
        if ($paymentSchedule->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $paymentSchedule->load(['category', 'subcategory', 'paymentMethod', 'currency']);
        
        return Inertia::render('PaymentSchedules/Show', [
            'paymentSchedule' => $paymentSchedule
        ]);
    }

    /**
     * Show the form for editing the specified payment schedule.
     */
    public function edit(PaymentSchedule $paymentSchedule)
    {
        if ($paymentSchedule->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $expenseCategories = ExpenseCategory::where('user_id', Auth::id())
            ->whereNull('parent_id')
            ->get();
            
        $subcategories = [];
        if ($paymentSchedule->category_id) {
            $subcategories = ExpenseCategory::where('user_id', Auth::id())
                ->where('parent_id', $paymentSchedule->category_id)
                ->get();
        }
            
        $paymentMethods = PaymentMethod::where('user_id', Auth::id())
            ->where('is_active', true)
            ->get();
            
        $currencies = Currency::all();
        
        return Inertia::render('PaymentSchedules/Edit', [
            'paymentSchedule' => $paymentSchedule,
            'categories' => $expenseCategories,
            'subcategories' => $subcategories,
            'paymentMethods' => $paymentMethods,
            'currencies' => $currencies
        ]);
    }

    /**
     * Update the specified payment schedule in storage.
     */
    public function update(Request $request, PaymentSchedule $paymentSchedule)
    {
        if ($paymentSchedule->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'amount' => ['required', 'numeric', 'min:0'],
            'due_date' => ['required', 'date'],
            'reminder_date' => ['nullable', 'date', 'before_or_equal:due_date'],
            'category_id' => ['nullable', 'exists:expense_categories,id'],
            'subcategory_id' => ['nullable', 'exists:expense_categories,id'],
            'payment_method_id' => ['nullable', 'exists:payment_methods,id'],
            'currency_id' => ['nullable', 'exists:currencies,id'],
            'recipient' => ['nullable', 'string', 'max:255'],
            'is_recurring' => ['boolean'],
            'frequency' => ['nullable', 'string', 'required_if:is_recurring,true'],
            'recurring_end_date' => ['nullable', 'date', 'after:due_date'],
            'auto_process' => ['boolean'],
        ]);
        
        // Verify category belongs to user
        if (!empty($validated['category_id'])) {
            $category = ExpenseCategory::where('id', $validated['category_id'])
                ->where('user_id', Auth::id())
                ->firstOrFail();
        }
        
        // Verify subcategory belongs to category
        if (!empty($validated['subcategory_id']) && !empty($validated['category_id'])) {
            $subcategory = ExpenseCategory::where('id', $validated['subcategory_id'])
                ->where('parent_id', $validated['category_id'])
                ->where('user_id', Auth::id())
                ->firstOrFail();
        }
        
        // Update payment schedule
        $paymentSchedule->update($validated);
        
        return redirect()->route('payment-schedules.show', $paymentSchedule)
            ->with('success', 'Payment schedule updated successfully!');
    }

    /**
     * Remove the specified payment schedule from storage.
     */
    public function destroy(PaymentSchedule $paymentSchedule)
    {
        if ($paymentSchedule->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $paymentSchedule->delete();
        
        return redirect()->route('payment-schedules.index')
            ->with('success', 'Payment schedule deleted successfully!');
    }
    
    /**
     * Process a payment schedule to create an expense.
     */
    public function process(PaymentSchedule $paymentSchedule)
    {
        if ($paymentSchedule->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        if ($paymentSchedule->status !== 'pending') {
            return redirect()->back()->with('error', 'This payment has already been processed.');
        }
        
        $expense = $paymentSchedule->processPayment();
        
        return redirect()->route('payment-schedules.index')
            ->with('success', 'Payment processed successfully!');
    }
    
    /**
     * Cancel a payment schedule.
     */
    public function cancel(PaymentSchedule $paymentSchedule)
    {
        if ($paymentSchedule->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        if ($paymentSchedule->status !== 'pending') {
            return redirect()->back()->with('error', 'This payment cannot be cancelled.');
        }
        
        $paymentSchedule->status = 'cancelled';
        $paymentSchedule->save();
        
        return redirect()->route('payment-schedules.index')
            ->with('success', 'Payment cancelled successfully!');
    }
    
    /**
     * Get subcategories for a category.
     */
    public function getSubcategories(Request $request, $categoryId)
    {
        $subcategories = ExpenseCategory::where('user_id', Auth::id())
            ->where('parent_id', $categoryId)
            ->get();
            
        return response()->json(['subcategories' => $subcategories]);
    }
}
