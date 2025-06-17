<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'phone',
        'goals',
        'role',
        'avatar',
        'bio',
        'date_of_birth',
        'currency_id',
        'country_id',
        'displayed_currencies',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'displayed_currencies' => 'array',
        'last_seen' => 'datetime',
    ];

    protected $appends = [
        'status',
    ];

    public function notificationSettings()
    {
        return $this->hasMany(NotificationSetting::class);
    }

    public function customNotifications()
    {
        return $this->hasMany(Notification::class);
    }
    
    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }
    
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
    
    public function budgets(): HasMany
    {
        return $this->hasMany(Budget::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function earnings(): HasMany
    {
        return $this->hasMany(Earning::class);
    }

    public function expenseCategories(): HasMany
    {
        return $this->hasMany(ExpenseCategory::class);
    }

    public function earningCategories(): HasMany
    {
        return $this->hasMany(EarningCategory::class);
    }

    public function expenseReports(): HasMany
    {
        return $this->hasMany(ExpensesReport::class);
    }

    public function earningReports(): HasMany
    {
        return $this->hasMany(EarningReport::class);
    }

    public function imports(): HasMany
    {
        return $this->hasMany(Import::class);
    }

    public function exports(): HasMany
    {
        return $this->hasMany(Export::class);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }
    
    public function creditors(): HasMany
    {
        return $this->hasMany(Creditor::class);
    }

    public function investments(): HasMany
    {
        return $this->hasMany(Investment::class);
    }

    public function passwordHistory(): HasMany
    {
        return $this->hasMany(PasswordHistory::class);
    }

    public function goals(): HasMany
    {
        return $this->hasMany(Goal::class);
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    public function country()
    {
        return $this->belongsTo(Country::class);
    }
    /**
     * Check if user has a specific role.
     */
    public function hasRole($roleName)
    {
        return $this->roles()->where('name', $roleName)->exists() || $this->role === $roleName;
    }
    
    /**
     * Check if user has any of the specified roles.
     */
    public function hasAnyRole($roles)
    {
        if (is_string($roles)) {
            $roles = [$roles];
        }
        
        return $this->roles()->whereIn('name', $roles)->exists() || in_array($this->role, $roles);
    }
    
    /**
     * Get user's activity summary.
     */
    public function getActivitySummary()
    {
        return [
            'total_transactions' => $this->expenses()->count() + $this->earnings()->count(),
            'total_expenses' => $this->expenses()->count(),
            'total_earnings' => $this->earnings()->count(),
            'total_goals' => $this->goals()->count(),
            'active_goals' => $this->goals()->where('status', 'active')->count(),
            'total_budgets' => $this->budgets()->count(),
            'total_investments' => $this->investments()->count(),
        ];
    }
    
    /**
     * Get user's financial summary.
     */
    public function getFinancialSummary()
    {
        $totalExpenses = $this->expenses()->sum('amount');
        $totalEarnings = $this->earnings()->sum('amount');
        
        return [
            'total_expenses' => $totalExpenses,
            'total_income' => $totalEarnings,
            'total_earnings' => $totalEarnings, // Keep for backward compatibility
            'net_worth' => $totalEarnings - $totalExpenses,
            'average_expense' => $this->expenses()->avg('amount') ?? 0,
            'average_earning' => $this->earnings()->avg('amount') ?? 0,
        ];
    }
    
    /**
     * Get user's recent activity count (last 30 days).
     */
    public function getRecentActivityCount($days = 30)
    {
        $cutoffDate = now()->subDays($days);
        
        return [
            'recent_expenses' => $this->expenses()->where('date', '>=', $cutoffDate)->count(),
            'recent_earnings' => $this->earnings()->where('date', '>=', $cutoffDate)->count(),
            'recent_transactions' => $this->expenses()->where('date', '>=', $cutoffDate)->count() +
                                   $this->earnings()->where('date', '>=', $cutoffDate)->count(),
        ];
    }
    
    /**
     * Check if user account is active.
     */
    public function isActive()
    {
        return $this->email_verified_at !== null;
    }
    
    /**
     * Check if user account is suspended.
     */
    public function isSuspended()
    {
        return $this->email_verified_at === null && $this->created_at < now()->subDay();
    }
    
    /**
     * Get user status string.
     */
    public function getStatusAttribute()
    {
        if ($this->email_verified_at === null) {
            return $this->created_at < now()->subDay() ? 'suspended' : 'inactive';
        }
        return 'active';
    }
    
    /**
     * Scope to filter active users.
     */
    public function scopeActive($query)
    {
        return $query->whereNotNull('email_verified_at');
    }
    
    /**
     * Scope to filter suspended users.
     */
    public function scopeSuspended($query)
    {
        return $query->whereNull('email_verified_at')->where('created_at', '<', now()->subDay());
    }
    
    /**
     * Scope to filter users with recent activity.
     */
    public function scopeWithRecentActivity($query, $days = 30)
    {
        $cutoffDate = now()->subDays($days);
        
        return $query->where(function($q) use ($cutoffDate) {
            $q->whereHas('expenses', function($sq) use ($cutoffDate) {
                $sq->where('date', '>=', $cutoffDate);
            })->orWhereHas('earnings', function($sq) use ($cutoffDate) {
                $sq->where('date', '>=', $cutoffDate);
            });
        });
    }

    /**
     * Update user's last seen timestamp.
     */
    public function updateLastSeen()
    {
        $this->last_seen = now();
        $this->save();
    }

    /**
     * Check if user is currently online.
     * Consider user online if they were active in the last 5 minutes.
     */
    public function isOnline()
    {
        if (!$this->last_seen) {
            return false;
        }
        
        return $this->last_seen->gt(now()->subMinutes(5));
    }

    /**
     * Scope to filter online users.
     */
    public function scopeOnline($query)
    {
        return $query->where('last_seen', '>', now()->subMinutes(5));
    }

    /**
     * Get formatted last seen time.
     */
    public function getLastSeenFormatted()
    {
        if (!$this->last_seen) {
            return 'Never';
        }

        if ($this->isOnline()) {
            return 'Online';
        }

        return $this->last_seen->diffForHumans();
    }
}
