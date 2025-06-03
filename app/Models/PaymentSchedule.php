<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\CurrencyHelper;

class PaymentSchedule extends Model
{
    use HasFactory, SoftDeletes, CurrencyHelper;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'description',
        'amount',
        'due_date',
        'reminder_date',
        'category_id',
        'subcategory_id',
        'payment_method_id',
        'currency_id',
        'recipient',
        'is_recurring',
        'frequency',
        'recurring_end_date',
        'auto_process',
        'status',
        'payment_details',
    ];

    protected $casts = [
        'due_date' => 'date',
        'reminder_date' => 'date',
        'recurring_end_date' => 'date',
        'is_recurring' => 'boolean',
        'auto_process' => 'boolean',
        'payment_details' => 'array',
    ];

    /**
     * Get the user that owns this payment schedule.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category for this payment schedule.
     */
    public function category()
    {
        return $this->belongsTo(ExpenseCategory::class, 'category_id');
    }

    /**
     * Get the subcategory for this payment schedule.
     */
    public function subcategory()
    {
        return $this->belongsTo(ExpenseCategory::class, 'subcategory_id');
    }

    /**
     * Get the payment method for this schedule.
     */
    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    /**
     * Get the currency for this schedule.
     */
    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    /**
     * Check if the payment is overdue.
     */
    public function isOverdue()
    {
        return $this->status === 'pending' && now()->gt($this->due_date);
    }

    /**
     * Process this payment schedule.
     * This is an alias for processPayment() to match the controller's expectations.
     */
    public function process()
    {
        return $this->processPayment();
    }

    /**
     * Cancel this payment schedule.
     */
    public function cancel()
    {
        $this->status = 'cancelled';
        $this->save();
        return $this;
    }

    /**
     * Create an expense from this scheduled payment.
     */
    public function processPayment()
    {
        // Only process if not already completed
        if ($this->status !== 'pending') {
            return null;
        }

        // Ensure we have a valid category_id - create default if null
        $categoryId = $this->category_id;
        if (!$categoryId) {
            $categoryId = $this->getOrCreateDefaultCategory();
        }

        // Create the expense
        $expense = Expense::create([
            'user_id' => $this->user_id,
            'name' => $this->name,
            'description' => $this->description . ' (Scheduled Payment)',
            'amount' => $this->amount,
            'date' => now(),
            'category_id' => $categoryId,
            'subcategory_id' => $this->subcategory_id,
            'payment_method_id' => $this->payment_method_id,
            'currency_id' => $this->currency_id,
        ]);

        // Mark as completed
        $this->status = 'completed';
        $this->save();

        // Create next payment if recurring
        if ($this->is_recurring && (!$this->recurring_end_date || now()->lt($this->recurring_end_date))) {
            $this->createNextRecurringPayment();
        }

        return $expense;
    }

    /**
     * Get or create a default "General" expense category for the user.
     */
    protected function getOrCreateDefaultCategory()
    {
        $defaultCategory = ExpenseCategory::where('user_id', $this->user_id)
            ->where('name', 'General')
            ->whereNull('parent_id')
            ->first();

        if (!$defaultCategory) {
            $defaultCategory = ExpenseCategory::create([
                'name' => 'General',
                'description' => 'General expenses and miscellaneous payments',
                'user_id' => $this->user_id,
                'icon' => '📝',
                'icon_color' => '#6b7280',
                'bg_color' => '#f3f4f6',
                'is_system' => false,
            ]);
        }

        return $defaultCategory->id;
    }

    /**
     * Create the next recurring payment based on frequency.
     */
    protected function createNextRecurringPayment()
    {
        $nextDueDate = $this->calculateNextDueDate();
        
        if ($nextDueDate && (!$this->recurring_end_date || $nextDueDate->lte($this->recurring_end_date))) {
            $newSchedule = $this->replicate();
            $newSchedule->due_date = $nextDueDate;
            $newSchedule->status = 'pending';
            
            // Calculate new reminder date if set
            if ($this->reminder_date) {
                $daysBeforeDue = $this->due_date->diffInDays($this->reminder_date, false);
                $newSchedule->reminder_date = $nextDueDate->copy()->addDays($daysBeforeDue);
            }
            
            $newSchedule->save();
            return $newSchedule;
        }
        
        return null;
    }

    /**
     * Calculate the next due date based on frequency.
     */
    protected function calculateNextDueDate()
    {
        $currentDueDate = $this->due_date;
        
        return match ($this->frequency) {
            'daily' => $currentDueDate->addDay(),
            'weekly' => $currentDueDate->addWeek(),
            'biweekly' => $currentDueDate->addWeeks(2),
            'monthly' => $currentDueDate->addMonth(),
            'quarterly' => $currentDueDate->addMonths(3),
            'biannually' => $currentDueDate->addMonths(6),
            'annually' => $currentDueDate->addYear(),
            default => null,
        };
    }

    /**
     * Scope a query to return only upcoming payments.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('status', 'pending')
                    ->where('due_date', '>=', now())
                    ->orderBy('due_date');
    }

    /**
     * Scope a query to return only overdue payments.
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', 'pending')
                    ->where('due_date', '<', now())
                    ->orderBy('due_date');
    }

    /**
     * Scope a query to return only recurring payments.
     */
    public function scopeRecurring($query)
    {
        return $query->where('is_recurring', true);
    }

    /**
     * Scope a query to return only completed payments.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    protected static function boot()
    {
        parent::boot();

        // Set default currency if not provided
        static::creating(function ($paymentSchedule) {
            if (empty($paymentSchedule->currency_id)) {
                $user = auth()->user();
                $paymentSchedule->currency_id = $user && $user->currency_id 
                    ? $user->currency_id 
                    : Currency::getDefaultCurrency()->id;
            }
            
            // Set user_id if not provided (for API consistency)
            if (empty($paymentSchedule->user_id)) {
                $paymentSchedule->user_id = auth()->id();
            }
        });

        // Update currency if user changes their default
        static::updating(function ($paymentSchedule) {
            // Only auto-update currency if it wasn't explicitly set in this update
            if (!$paymentSchedule->isDirty('currency_id') && $paymentSchedule->user) {
                $userCurrency = $paymentSchedule->user->currency;
                if ($userCurrency && $paymentSchedule->currency_id !== $userCurrency->id) {
                    // Convert amount to user's currency if different
                    if ($paymentSchedule->currency) {
                        $paymentSchedule->amount = $paymentSchedule->currency->convertTo($paymentSchedule->amount, $userCurrency);
                        $paymentSchedule->currency_id = $userCurrency->id;
                    }
                }
            }
        });
    }
}
