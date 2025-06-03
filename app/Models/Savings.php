<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\CurrencyHelper;

class Savings extends Model
{
    use HasFactory, SoftDeletes, CurrencyHelper;

    protected $fillable = [
        'user_id',
        'currency_id',
        'category_id',
        'name',
        'description',
        'target_amount',
        'current_amount',
        'target_date',
        'status',
    ];

    protected $casts = [
        'target_date' => 'date',
        'target_amount' => 'decimal:2',
        'current_amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    public function category()
    {
        return $this->belongsTo(ExpenseCategory::class, 'category_id');
    }

    public function transactions()
    {
        return $this->hasMany(SavingsTransaction::class)->orderBy('transaction_date', 'desc');
    }

    /**
     * Get the progress percentage for the savings goal
     */
    public function getProgressPercentageAttribute()
    {
        return $this->target_amount > 0 
            ? round(($this->current_amount / $this->target_amount) * 100, 2) 
            : 0;
    }

    /**
     * Get the remaining amount needed to reach the target
     */
    public function getRemainingAmountAttribute()
    {
        return max(0, $this->target_amount - $this->current_amount);
    }

    /**
     * Calculate how much needs to be saved per period to reach the target
     */
    public function calculateMonthlySavingsNeeded($period = 'monthly')
    {
        $remainingAmount = $this->remaining_amount;
        $daysRemaining = now()->diffInDays($this->target_date);

        if ($remainingAmount <= 0 || $daysRemaining <= 0) {
            return 0;
        }

        return match ($period) {
            'daily' => $remainingAmount / $daysRemaining,
            'weekly' => $remainingAmount / ceil($daysRemaining / 7),
            'monthly' => $remainingAmount / ceil($daysRemaining / 30),
            default => 0,
        };
    }

    /**
     * Calculate the total savings including category expenses
     */
    public function getTotalAmountAttribute()
    {
        $directAmount = $this->current_amount;
        
        // Sum expenses in the same category (if applicable)
        $categoryAmount = 0;
        if ($this->category_id) {
            $categoryAmount = Expense::where('user_id', $this->user_id)
                ->where('subcategory_id', $this->category_id)
                ->sum('amount');
        }
        
        return $directAmount + $categoryAmount;
    }

    /**
     * Get percentage of progress based on total contributions including category expenses
     */
    public function getTotalProgressPercentageAttribute()
    {
        return $this->target_amount > 0 
            ? min(100, round(($this->total_amount / $this->target_amount) * 100)) 
            : 0;
    }

    /**
     * Get category expenses amount only
     */
    public function getCategoryAmountAttribute()
    {
        if (!$this->category_id) {
            return 0;
        }
        
        return Expense::where('user_id', $this->user_id)
            ->where('subcategory_id', $this->category_id)
            ->sum('amount');
    }

    /**
     * Check if the savings goal is overdue
     */
    public function getIsOverdueAttribute()
    {
        return $this->target_date < now() && $this->status !== 'completed';
    }

    /**
     * Get days remaining until target date
     */
    public function getDaysRemainingAttribute()
    {
        return now()->diffInDays($this->target_date, false);
    }

    /**
     * Update savings progress
     */
    public function updateProgress($amount)
    {
        $this->current_amount += $amount;
        
        if ($this->current_amount >= $this->target_amount) {
            $this->status = 'completed';
        }
        
        $this->save();
    }

    /**
     * Calculate savings velocity (amount saved per day on average)
     */
    public function getSavingsVelocityAttribute()
    {
        $daysSinceCreated = $this->created_at->diffInDays(now());
        
        if ($daysSinceCreated <= 0) {
            return 0;
        }
        
        return $this->current_amount / $daysSinceCreated;
    }

    /**
     * Estimate completion date based on current savings velocity
     */
    public function getEstimatedCompletionDateAttribute()
    {
        if ($this->savings_velocity <= 0 || $this->remaining_amount <= 0) {
            return null;
        }
        
        $daysNeeded = ceil($this->remaining_amount / $this->savings_velocity);
        return now()->addDays($daysNeeded);
    }

    protected static function boot()
    {
        parent::boot();

        // Set default currency if not provided
        static::creating(function ($savings) {
            if (empty($savings->currency_id)) {
                $user = auth()->user();
                $savings->currency_id = $user && $user->currency_id 
                    ? $user->currency_id 
                    : Currency::getDefaultCurrency()->id;
            }
            
            // Set user_id if not provided (for API consistency)
            if (empty($savings->user_id)) {
                $savings->user_id = auth()->id();
            }
        });

        // Update currency if user changes their default
        static::updating(function ($savings) {
            // Only auto-update currency if it wasn't explicitly set in this update
            if (!$savings->isDirty('currency_id') && $savings->user) {
                $userCurrency = $savings->user->currency;
                if ($userCurrency && $savings->currency_id !== $userCurrency->id) {
                    // Convert amounts to user's currency if different
                    if ($savings->currency) {
                        $savings->target_amount = $savings->currency->convertTo($savings->target_amount, $userCurrency);
                        $savings->current_amount = $savings->currency->convertTo($savings->current_amount, $userCurrency);
                        $savings->currency_id = $userCurrency->id;
                    }
                }
            }
        });
    }
}