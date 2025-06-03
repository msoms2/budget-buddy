<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\CurrencyHelper;

class Goal extends Model
{
    use HasFactory, SoftDeletes, CurrencyHelper;

    protected $fillable = [
        'user_id',
        'currency_id',
        'category_id',
        'title',
        'target_amount',
        'current_amount',
        'target_date',
        'description',
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
        return $this->hasMany(GoalTransaction::class);
    }

    public function updateProgress($amount)
    {
        $this->current_amount += $amount;
        
        if ($this->current_amount >= $this->target_amount) {
            $this->status = 'completed';
        }
        
        $this->save();
    }

    public function calculateRequiredSavings($period = 'monthly')
    {
        $remainingAmount = $this->target_amount - $this->getTotalAmountAttribute();
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

    public function getProgressPercentageAttribute()
    {
        return $this->target_amount > 0 
            ? round(($this->current_amount / $this->target_amount) * 100, 2) 
            : 0;
    }

    /**
     * Calculate the total contribution amount including both goal transactions
     * and regular expenses in the same category
     */
    public function getTotalProgressAttribute()
    {
        // Sum direct goal transactions
        $goalTransactionsTotal = $this->transactions()->sum('amount');
        
        // Sum expenses in the same category (if applicable)
        $categoryExpensesTotal = 0;
        if ($this->category_id) {
            $categoryExpensesTotal = \App\Models\Expense::where('user_id', $this->user_id)
                ->where('subcategory_id', $this->category_id)
                ->sum('amount');
        }
        
        return $goalTransactionsTotal + $categoryExpensesTotal;
    }
    
    /**
     * Accessor to get the total amount including both direct goal contributions
     * and expenses in the associated category
     */
    public function getTotalAmountAttribute()
    {
        // Sum direct goal transactions
        $directAmount = $this->transactions()->sum('amount');
        
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
     * Accessor to get the percentage of progress based on total contributions
     */
    public function getTotalProgressPercentageAttribute()
    {
        return $this->target_amount > 0 
            ? min(100, round(($this->total_amount / $this->target_amount) * 100)) 
            : 0;
    }
    
    /**
     * Accessor to get direct goal transactions amount only
     */
    public function getDirectAmountAttribute()
    {
        return $this->transactions()->sum('amount');
    }
    
    /**
     * Accessor to get category expenses amount only
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
    
    protected static function boot()
    {
        parent::boot();

        // Set default currency if not provided
        static::creating(function ($goal) {
            if (empty($goal->currency_id)) {
                $user = auth()->user();
                $goal->currency_id = $user && $user->currency_id 
                    ? $user->currency_id 
                    : Currency::getDefaultCurrency()->id;
            }
            
            // Set user_id if not provided (for API consistency)
            if (empty($goal->user_id)) {
                $goal->user_id = auth()->id();
            }
        });

        // Update currency if user changes their default
        static::updating(function ($goal) {
            // Only auto-update currency if it wasn't explicitly set in this update
            if (!$goal->isDirty('currency_id') && $goal->user) {
                $userCurrency = $goal->user->currency;
                if ($userCurrency && $goal->currency_id !== $userCurrency->id) {
                    // Convert amounts to user's currency if different
                    if ($goal->currency) {
                        $goal->target_amount = $goal->currency->convertTo($goal->target_amount, $userCurrency);
                        $goal->current_amount = $goal->currency->convertTo($goal->current_amount, $userCurrency);
                        $goal->currency_id = $userCurrency->id;
                    }
                }
            }
        });
    }
}