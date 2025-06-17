<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\DisableAutoLoading;
use App\Traits\CurrencyHelper;

class Expense extends Model
{
    use HasFactory, DisableAutoLoading, CurrencyHelper;

    protected $fillable = [
        'name',
        'amount',
        'original_amount',
        'exchange_rate',
        'description',
        'date',
        'user_id',
        'category_id',
        'subcategory_id',
        'payment_method_id',
        'is_recurring',
        'frequency',
        'recurring_end_date',
        'currency_id'
    ];

    protected $casts = [
        'date' => 'date',
        'recurring_end_date' => 'date',
        'is_recurring' => 'boolean',
        'amount' => 'decimal:4',
        'original_amount' => 'decimal:4',
        'exchange_rate' => 'decimal:6',
    ];

    // Boot the model
    protected static function boot()
    {
        parent::boot();

        // Set default currency if not provided
        static::creating(function ($expense) {
            if (empty($expense->currency_id)) {
                $user = auth()->user();
                $expense->currency_id = $user && $user->currency_id 
                    ? $user->currency_id 
                    : Currency::getDefaultCurrency()->id;
            }
            
            // Set user_id if not provided (for API consistency)
            if (empty($expense->user_id)) {
                $expense->user_id = auth()->id();
            }
        });

        // Update currency if user changes their default
        static::updating(function ($expense) {
            // Only auto-update currency if it wasn't explicitly set in this update
            if (!$expense->isDirty('currency_id') && $expense->user) {
                $userCurrency = $expense->user->currency;
                if ($userCurrency && $expense->currency_id !== $userCurrency->id) {
                    // Convert amount to user's currency if different
                    if ($expense->currency) {
                        $expense->amount = $expense->currency->convertTo($expense->amount, $userCurrency);
                        $expense->currency_id = $userCurrency->id;
                    }
                }
            }
        });
    }

    /**
     * Get the amount attribute.
     * This helps maintain compatibility as the system transitions from 'sum' to 'amount'.
     */
    public function getAmountAttribute($value)
    {
        // If amount is set directly, use it
        if (!is_null($value)) {
            return $value;
        }
        
        // If auto-loading is disabled, just return the amount without conversion
        if ($this->isAutoLoadingDisabled()) {
            return $this->attributes['amount'] ?? 0;
        }
        
        // Check if there's a sum column being used instead
        if (isset($this->attributes['sum'])) {
            return $this->attributes['sum'];
        }
        
        // Default to 0 if not available
        return 0;
    }

    /**
     * Set the amount attribute with currency conversion handling
     */
    public function setAmountAttribute($value)
    {
        $this->attributes['amount'] = $value;
        
        // Handle currency conversion only if we have a currency set
        if ($this->currency_id) {
            $userCurrency = auth()->user()->currency;
            
            // Only convert if currencies differ and we haven't stored original amount yet
            if ($userCurrency && 
                $this->currency_id !== $userCurrency->id && 
                empty($this->attributes['original_amount'])) {
                
                $this->attributes['original_amount'] = $value;
                $this->attributes['exchange_rate'] = $this->currency->getExchangeRate($userCurrency);
                $this->attributes['amount'] = $value * $this->attributes['exchange_rate'];
            }
        }
    }

    /**
     * Get the amount in user's preferred currency
     */
    public function getConvertedAmountAttribute()
    {
        // If we already have converted amount stored with original amount
        if (!empty($this->original_amount)) {
            return $this->amount;
        }
        
        // If we need to convert on the fly
        $userCurrency = auth()->user()->currency;
        if ($userCurrency && $this->currency_id !== $userCurrency->id) {
            return $this->amount * $this->currency->getExchangeRate($userCurrency);
        }
        
        return $this->amount;
    }

    /**
     * Get the user that owns the expense.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category that the expense belongs to.
     */
    public function category()
    {
        return $this->belongsTo(ExpenseCategory::class, 'category_id');
    }

    /**
     * Get the subcategory that the expense belongs to.
     */
    public function subcategory()
    {
        return $this->belongsTo(ExpenseCategory::class, 'subcategory_id');
    }

    /**
     * Get the payment method used for the expense.
     */
    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    /**
     * Get the tags associated with the expense.
     */
    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'expense_tag');
    }

    /**
     * Get the creditor associated with the expense.
     */
    public function creditor()
    {
        return $this->belongsTo(Creditor::class);
    }

    /**
     * Get the currency associated with the expense.
     */
    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    /**
     * Scope a query to only include expenses within a date range.
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope a query to only include expenses for specific categories.
     */
    public function scopeInCategories($query, array $categoryIds)
    {
        return $query->whereIn('category_id', $categoryIds);
    }

    /**
     * Scope a query to only include expenses for specific subcategories.
     */
    public function scopeInSubcategories($query, array $subcategoryIds)
    {
        return $query->whereIn('subcategory_id', $subcategoryIds);
    }

    /**
     * Scope a query to only include expenses with specific tags.
     */
    public function scopeWithTags($query, array $tagIds)
    {
        return $query->whereHas('tags', function ($q) use ($tagIds) {
            $q->whereIn('tags.id', $tagIds);
        });
    }

    /**
     * Scope a query to only include expenses with specific payment methods.
     */
    public function scopeWithPaymentMethods($query, array $paymentMethodIds)
    {
        return $query->whereIn('payment_method_id', $paymentMethodIds);
    }
}