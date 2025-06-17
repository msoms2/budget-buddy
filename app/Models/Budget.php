<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;
use App\Traits\CurrencyHelper;
use Illuminate\Support\Facades\Log;

class Budget extends Model
{
    use HasFactory, SoftDeletes, CurrencyHelper;

    protected $fillable = [
        'name',
        'description',
        'amount',
        'start_date',
        'end_date',
        'user_id',
        'currency_id',
        'category_id',
        'recurring',
        'frequency',
        'next_renewal_date',
        'rollover_enabled',
        'rollover_amount',
        'rollover_cap',
        'period',
        'time_frame',
        'time_frame_value',
        'time_frame_unit',
        'overall_end_date',
        'notes',
        'enable_rollover',
        'budget_method',
        'method_settings'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'next_renewal_date' => 'date',
        'recurring' => 'boolean',
        'rollover_enabled' => 'boolean',
        'rollover_amount' => 'decimal:2',
        'rollover_cap' => 'decimal:2',
        'method_settings' => 'array',
    ];

    /**
     * Get the user that owns the budget.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the currency of this budget.
     */
    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    /**
     * Get the category this budget is for.
     */
    public function category()
    {
        return $this->belongsTo(ExpenseCategory::class, 'category_id');
    }

    /**
     * Get the expenses for this budget.
     * Only includes expenses within the budget period and category.
     */
    public function expenses()
    {
        try {
            // Ensure budget has a valid currency
            if (!$this->currency) {
                Log::warning("Budget {$this->id} has no currency, using default");
                $this->currency_id = Currency::getDefaultCurrency()->id;
                $this->save();
            }

            $query = Expense::where('user_id', $this->user_id)
                ->whereBetween('date', [$this->start_date, $this->end_date ?? now()]);
                
            if ($this->category_id) {
                $query->where('category_id', $this->category_id);
            }
            
            $expenses = $query->with(['currency', 'category'])->get();
            
            // Convert amounts to budget's currency
            return $expenses->map(function ($expense) {
                try {
                    // Ensure expense has a valid currency
                    if (!$expense->currency) {
                        Log::warning("Expense {$expense->id} has no currency, using budget's currency");
                        $expense->currency_id = $this->currency_id;
                        $expense->save();
                    }

                    // Only convert if currencies are different
                    if ($expense->currency_id !== $this->currency_id) {
                        $originalAmount = $expense->amount;
                        $expense->amount = $this->convertCurrency(
                            $expense->amount,
                            $expense->currency ?? Currency::getDefaultCurrency(),
                            $this->currency
                        );
                        Log::debug("Budget {$this->id} expense conversion", [
                            'expense_id' => $expense->id,
                            'from_currency' => $expense->currency->code ?? 'unknown',
                            'to_currency' => $this->currency->code,
                            'original_amount' => $originalAmount,
                            'converted_amount' => $expense->amount
                        ]);
                    }
                    return $expense;
                } catch (\Exception $e) {
                    Log::error("Failed to convert expense currency for budget {$this->id}", [
                        'expense_id' => $expense->id,
                        'error' => $e->getMessage()
                    ]);
                    // Return expense with original amount instead of throwing
                    return $expense;
                }
            });
        } catch (\Exception $e) {
            Log::error("Failed to fetch expenses for budget {$this->id}", [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Calculate the amount spent for this budget period.
     */
    public function getSpentAttribute()
    {
        return $this->expenses()->sum('amount');
    }

    /**
     * Calculate the remaining amount for this budget period.
     */
    public function getRemainingAttribute()
    {
        // Include rollover amount if enabled
        $totalBudget = $this->amount;
        
        // Add the rollover amount from previous period if enabled
        if ($this->rollover_enabled && $this->rollover_amount > 0) {
            $totalBudget += $this->rollover_amount;
        }
        
        return $totalBudget - $this->spent;
    }

    /**
     * Calculate the percentage of budget used.
     */
    public function getPercentUsedAttribute()
    {
        // Total available budget including any rollovers
        $totalBudget = $this->amount + ($this->rollover_enabled ? $this->rollover_amount : 0);
        
        // Prevent division by zero
        if ($totalBudget == 0) {
            return 0;
        }
        
        return ($this->spent / $totalBudget) * 100;
    }
    
    /**
     * Calculate budget utilization statistics
     */
    public function calculateUtilization()
    {
        $spent = $this->getSpentAttribute();
        $total = $this->amount + ($this->rollover_enabled ? $this->rollover_amount : 0);
        $remaining = $total - $spent;
        $percentUsed = ($total > 0) ? ($spent / $total) * 100 : 0;
        
        return [
            'spent' => $spent,
            'total' => $total,
            'total_budget' => $total, // Add alias for frontend compatibility
            'remaining' => $remaining,
            'percentage' => $percentUsed, // Changed from 'percent_used' to 'percentage'
            'percent_used' => $percentUsed, // Keep backward compatibility
        ];
    }

    /**
     * Calculate and update rollover amount when current period ends
     */
    public function processRollover()
    {
        // Only process rollovers for recurring budgets with rollover enabled
        if (!$this->recurring || !$this->rollover_enabled) {
            return false;
        }

        // Check if the budget period has ended
        $endDate = $this->end_date ?? Carbon::now();
        if ($endDate->isFuture()) {
            return false; // Budget period hasn't ended yet
        }

        // Calculate the amount left from this period
        $leftover = $this->remaining;
        
        if ($leftover <= 0) {
            // No leftover to roll over
            $this->rollover_amount = 0;
            $this->save();
            return true;
        }

        // Apply cap if specified
        if ($this->rollover_cap > 0 && $leftover > $this->rollover_cap) {
            $leftover = $this->rollover_cap;
        }

        // Set rollover amount for next period
        $this->rollover_amount = $leftover;
        
        // Update the budget with new rollover amount
        $this->save();
        
        return true;
    }

    /**
     * Handle budget renewal for recurring budgets
     */
    public function renewBudget()
    {
        // Only renew recurring budgets
        if (!$this->recurring || !$this->next_renewal_date) {
            return false;
        }
        
        // Check if it's time to renew
        if (Carbon::now()->lt($this->next_renewal_date)) {
            return false; // Not time to renew yet
        }
        
        // Process rollover from previous period before renewing
        $this->processRollover();
        
        // Calculate new dates based on frequency
        $newStartDate = $this->next_renewal_date->copy();
        $newEndDate = null;
        
        switch ($this->frequency) {
            case 'daily':
                $newEndDate = $newStartDate->copy();
                $newNextRenewal = $newStartDate->copy()->addDay();
                break;
            case 'weekly':
                $newEndDate = $newStartDate->copy()->addWeek()->subDay();
                $newNextRenewal = $newStartDate->copy()->addWeek();
                break;
            case 'monthly':
                $newEndDate = $newStartDate->copy()->addMonth()->subDay();
                $newNextRenewal = $newStartDate->copy()->addMonth();
                break;
            case 'quarterly':
                $newEndDate = $newStartDate->copy()->addMonths(3)->subDay();
                $newNextRenewal = $newStartDate->copy()->addMonths(3);
                break;
            case 'yearly':
                $newEndDate = $newStartDate->copy()->addYear()->subDay();
                $newNextRenewal = $newStartDate->copy()->addYear();
                break;
            default:
                // Default to monthly if unspecified
                $newEndDate = $newStartDate->copy()->addMonth()->subDay();
                $newNextRenewal = $newStartDate->copy()->addMonth();
                break;
        }
        
        // Update the budget with new dates
        $this->start_date = $newStartDate;
        $this->end_date = $newEndDate;
        $this->next_renewal_date = $newNextRenewal;
        $this->save();
        
        return true;
    }
    
    /**
     * Get available budget methods
     */
    public static function getAvailableMethods()
    {
        return [
            'standard' => 'Standard Budget',
            '50-30-20' => '50/30/20 Rule',
            'zero-based' => 'Zero-Based Budgeting'
        ];
    }
    
    /**
     * Get available budget periods
     */
    public static function getAvailablePeriods()
    {
        return [
            'daily' => 'Daily',
            'weekly' => 'Weekly',
            'monthly' => 'Monthly',
            'yearly' => 'Yearly'
        ];
    }

    /**
     * Get available time frames
     */
    public static function getAvailableTimeFrames()
    {
        return [
            '1_week' => '1 Week',
            '1_month' => '1 Month',
            '3_months' => '3 Months',
            '6_months' => '6 Months',
            '1_year' => '1 Year',
            '2_years' => '2 Years',
            'custom' => 'Custom'
        ];
    }

    /**
     * Calculate overall end date based on time frame
     */
    public function calculateOverallEndDate($startDate = null)
    {
        $startDate = $startDate ? Carbon::parse($startDate) : Carbon::parse($this->start_date);
        
        if ($this->time_frame === 'custom' && $this->time_frame_value && $this->time_frame_unit) {
            return $this->calculateCustomTimeFrame($startDate);
        }
        
        switch ($this->time_frame) {
            case '1_week':
                return $startDate->copy()->addWeek()->subDay();
            case '1_month':
                return $startDate->copy()->addMonth()->subDay();
            case '3_months':
                return $startDate->copy()->addMonths(3)->subDay();
            case '6_months':
                return $startDate->copy()->addMonths(6)->subDay();
            case '1_year':
                return $startDate->copy()->addYear()->subDay();
            case '2_years':
                return $startDate->copy()->addYears(2)->subDay();
            default:
                // Default to 1 month if unspecified
                return $startDate->copy()->addMonth()->subDay();
        }
    }

    /**
     * Calculate custom time frame end date
     */
    private function calculateCustomTimeFrame($startDate)
    {
        $value = $this->time_frame_value;
        
        switch ($this->time_frame_unit) {
            case 'days':
                return $startDate->copy()->addDays($value)->subDay();
            case 'weeks':
                return $startDate->copy()->addWeeks($value)->subDay();
            case 'months':
                return $startDate->copy()->addMonths($value)->subDay();
            case 'years':
                return $startDate->copy()->addYears($value)->subDay();
            default:
                return $startDate->copy()->addMonth()->subDay();
        }
    }

    /**
     * Check if the overall budget time frame has ended
     */
    public function isTimeFrameExpired()
    {
        if (!$this->overall_end_date) {
            return false;
        }
        
        return Carbon::now()->gt($this->overall_end_date);
    }

    /**
     * Get the number of periods within the time frame
     */
    public function getPeriodsInTimeFrame()
    {
        if (!$this->overall_end_date) {
            return 1;
        }
        
        $startDate = Carbon::parse($this->start_date);
        $endDate = Carbon::parse($this->overall_end_date);
        
        switch ($this->period) {
            case 'daily':
                return $startDate->diffInDays($endDate) + 1;
            case 'weekly':
                return ceil($startDate->diffInDays($endDate) / 7);
            case 'monthly':
                return $startDate->diffInMonths($endDate) + 1;
            case 'yearly':
                return $startDate->diffInYears($endDate) + 1;
            default:
                return 1;
        }
    }

    /**
     * Calculate budget variance analysis
     */
    public function getVarianceAnalysis()
    {
        $expenses = $this->expenses();
        $totalBudget = $this->amount + ($this->rollover_enabled ? $this->rollover_amount : 0);
        $totalSpent = $this->spent;
        
        // Calculate absolute and percentage variance
        $variance = $totalBudget - $totalSpent;
        $variancePercent = $totalBudget > 0 ? ($variance / $totalBudget) * 100 : 0;
        
        // Get category-wise breakdown
        $categoryExpenses = $expenses->groupBy('category_id')
            ->map(function ($expenses) {
                return $expenses->sum('amount');
            });
            
        return [
            'total_budget' => $totalBudget,
            'total_spent' => $totalSpent,
            'variance' => $variance,
            'variance_percent' => $variancePercent,
            'status' => $variance >= 0 ? 'under_budget' : 'over_budget',
            'category_breakdown' => $categoryExpenses,
        ];
    }

    /**
     * Get monthly comparison data
     */
    public function getMonthlyComparison()
    {
        $expenses = $this->expenses();
        return $expenses->groupBy(function($expense) {
            return Carbon::parse($expense->date)->format('Y-m');
        })->map(function($monthExpenses) {
            return [
                'total' => $monthExpenses->sum('amount'),
                'count' => $monthExpenses->count(),
                'average' => $monthExpenses->avg('amount')
            ];
        });
    }

    /**
     * Get yearly comparison data
     */
    public function getYearlyComparison()
    {
        $expenses = $this->expenses();
        return $expenses->groupBy(function($expense) {
            return Carbon::parse($expense->date)->year;
        })->map(function($yearExpenses) {
            return [
                'total' => $yearExpenses->sum('amount'),
                'count' => $yearExpenses->count(),
                'average' => $yearExpenses->avg('amount'),
                'monthly_average' => $yearExpenses->sum('amount') / 12
            ];
        });
    }
    
    protected static function boot()
    {
        parent::boot();

        // Set default currency if not provided
        static::creating(function ($budget) {
            if (empty($budget->currency_id)) {
                $user = auth()->user();
                $budget->currency_id = $user && $user->currency_id 
                    ? $user->currency_id 
                    : Currency::getDefaultCurrency()->id;
            }
            
            // Set user_id if not provided (for API consistency)
            if (empty($budget->user_id)) {
                $budget->user_id = auth()->id();
            }
        });

        // Update currency if user changes their default
        static::updating(function ($budget) {
            // Only auto-update currency if it wasn't explicitly set in this update
            if (!$budget->isDirty('currency_id') && $budget->user) {
                $userCurrency = $budget->user->currency;
                if ($userCurrency && $budget->currency_id !== $userCurrency->id) {
                    // Convert amount to user's currency if different
                    if ($budget->currency) {
                        $budget->amount = $budget->currency->convertTo($budget->amount, $userCurrency);
                        if ($budget->rollover_amount > 0) {
                            $budget->rollover_amount = $budget->currency->convertTo($budget->rollover_amount, $userCurrency);
                        }
                        if ($budget->rollover_cap > 0) {
                            $budget->rollover_cap = $budget->currency->convertTo($budget->rollover_cap, $userCurrency);
                        }
                        $budget->currency_id = $userCurrency->id;
                    }
                }
            }
        });
    }
}
