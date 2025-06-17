<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\CurrencyHelper;

class Earning extends Model
{
    use HasFactory, CurrencyHelper;

    protected $fillable = [
        'name',
        'amount',
        'original_amount',
        'exchange_rate',
        'description',
        'source',
        'date',
        'user_id',
        'category_id',
        'subcategory_id',
        'currency_id',
        'payment_method_id',
        'is_recurring',
        'frequency'
    ];

    protected $casts = [
        'date' => 'date',
        'is_recurring' => 'boolean',
        'amount' => 'decimal:4',
        'original_amount' => 'decimal:4',
        'exchange_rate' => 'decimal:6'
    ];

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
        
        // Check if there's a sum column being used instead
        if (isset($this->attributes['sum'])) {
            return $this->attributes['sum'];
        }
        
        // Default to 0 if not available
        return 0;
    }

    /**
     * Set the amount attribute.
     */
    public function setAmountAttribute($value)
    {
        $this->attributes['amount'] = $value;
    }

    /**
     * Get the user that owns this earning.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category of this earning.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(EarningCategory::class, 'category_id');
    }
    
    /**
     * Get the subcategory of this earning.
     */
    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(EarningCategory::class, 'subcategory_id');
    }

    /**
     * Get the currency of this earning.
     */
    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    /**
     * Get the payment method of this earning.
     */
    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    protected static function boot()
    {
        parent::boot();

        // Set default currency if not provided
        static::creating(function ($earning) {
            if (empty($earning->currency_id)) {
                $user = auth()->user();
                $earning->currency_id = $user && $user->currency_id 
                    ? $user->currency_id 
                    : Currency::getDefaultCurrency()->id;
            }
            
            // Set user_id if not provided (for API consistency)
            if (empty($earning->user_id)) {
                $earning->user_id = auth()->id();
            }
        });

        // Update linked goals when a new earning is created
        static::created(function ($earning) {
            // Find all goals that use this category
            if ($earning->subcategory_id) {
                $goals = Goal::where('user_id', $earning->user_id)
                    ->where('category_id', $earning->subcategory_id)
                    ->where('status', 'active')
                    ->get();
                
                // Goals are already automatically updated through the relationship
                // but we'll update the status if needed
                foreach ($goals as $goal) {
                    // Check if the goal has reached or exceeded its target
                    $totalAmount = $goal->getTotalAmountAttribute();
                    if ($totalAmount >= $goal->target_amount && $goal->status !== 'completed') {
                        $goal->status = 'completed';
                        $goal->save();
                    }
                }
            }
        });

        // Update currency if user changes their default
        static::updating(function ($earning) {
            // Only auto-update currency if it wasn't explicitly set in this update
            if (!$earning->isDirty('currency_id') && $earning->user) {
                $userCurrency = $earning->user->currency;
                if ($userCurrency && $earning->currency_id !== $userCurrency->id) {
                    // Convert amount to user's currency if different
                    if ($earning->currency) {
                        $earning->amount = $earning->currency->convertTo($earning->amount, $userCurrency);
                        $earning->currency_id = $userCurrency->id;
                    }
                }
            }
        });
    }
}