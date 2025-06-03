<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\CurrencyHelper;

class Investment extends Model
{
    use HasFactory, CurrencyHelper;
    
    protected $fillable = [
        'user_id',
        'investment_category_id',
        'name',
        'description',
        'type',
        'status',
        'notes',
        'currency_id',
        'symbol',
        'initial_amount',
        'current_amount',
        'purchase_date'
    ];

    /**
     * Get the user that owns the investment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the currency of this investment.
     */
    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }

    /**
     * Get the category that owns the investment.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(InvestmentCategory::class, 'investment_category_id');
    }

    /**
     * Get the transactions for the investment.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(InvestmentTransaction::class);
    }

    /**
     * Get the performance logs for the investment.
     */
    public function performanceLogs(): HasMany
    {
        return $this->hasMany(InvestmentPerformanceLog::class);
    }

    /**
     * Calculate the current value based on the latest performance log.
     * Falls back to current_amount if no logs exist.
     */
    public function getCurrentValue()
    {
        return $this->performanceLogs()
            ->orderByDesc('date')
            ->value('current_value') ?? $this->current_amount ?? 0;
    }

    /**
     * Calculate total invested amount (purchases - sales).
     */
    public function getTotalInvestedAmount()
    {
        $purchases = $this->transactions()
            ->where('transaction_type', 'buy')
            ->sum('total_amount');
            
        $sales = $this->transactions()
            ->where('transaction_type', 'sell')
            ->sum('total_amount');

        return $purchases - $sales;
    }

    /**
     * Calculate total return percentage.
     */
    public function calculateTotalReturn()
    {
        $currentValue = $this->getCurrentValue();
        $investedAmount = $this->getTotalInvestedAmount();

        if ($investedAmount <= 0) {
            return 0;
        }

        return (($currentValue - $investedAmount) / $investedAmount) * 100;
    }

    /**
     * Get the latest performance metrics.
     */
    public function getLatestPerformance()
    {
        return $this->performanceLogs()
            ->orderByDesc('date')
            ->first();
    }

    protected static function boot()
    {
        parent::boot();

        // Set default currency if not provided
        static::creating(function ($investment) {
            if (empty($investment->currency_id)) {
                $user = auth()->user();
                $investment->currency_id = $user && $user->currency_id 
                    ? $user->currency_id 
                    : Currency::getDefaultCurrency()->id;
            }
            
            // Set user_id if not provided (for API consistency)
            if (empty($investment->user_id)) {
                $investment->user_id = auth()->id();
            }
        });

        // Update currency if user changes their default
        static::updating(function ($investment) {
            // Only auto-update currency if it wasn't explicitly set in this update
            if (!$investment->isDirty('currency_id') && $investment->relationLoaded('user') && $investment->user) {
                $userCurrency = $investment->user->currency;
                if ($userCurrency && $investment->currency_id !== $userCurrency->id) {
                    // Convert amounts to user's currency if different
                    if ($investment->currency) {
                        $investment->initial_amount = $investment->currency->convertTo($investment->initial_amount, $userCurrency);
                        $investment->current_amount = $investment->currency->convertTo($investment->current_amount, $userCurrency);
                        $investment->currency_id = $userCurrency->id;
                    }
                }
            }
        });
    }
}