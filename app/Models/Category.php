<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'name',
        'type',
        'color',
        'user_id',
        'description',
        'parent_id',
        'icon',
        'is_system',
        'is_fixed_type',
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'is_fixed_type' => 'boolean',
    ];

    protected static function booted()
    {
        static::saving(function ($category) {
            if ($category->is_fixed_type) {
                // If category was a parent and is being changed to subcategory
                if ($category->isDirty('parent_id') && $category->parent_id !== null && $category->hasSubcategories()) {
                    throw new \Exception('Cannot convert a parent category with subcategories to a subcategory when is_fixed_type is true.');
                }
                
                // If category was a subcategory and is being changed to parent
                if ($category->isDirty('parent_id') && $category->parent_id === null && $category->getOriginal('parent_id') !== null) {
                    throw new \Exception('Cannot convert a subcategory to a parent category when is_fixed_type is true.');
                }
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function subcategories(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class, 'category_id');
    }

    public function earnings(): HasMany
    {
        return $this->hasMany(Earning::class, 'category_id');
    }

    public function budgets(): HasMany
    {
        return $this->hasMany(Budget::class);
    }

    /**
     * Check if this category is a subcategory
     */
    public function isSubcategory(): bool
    {
        return $this->parent_id !== null;
    }

    /**
     * Check if this category has subcategories
     */
    public function hasSubcategories(): bool
    {
        return $this->subcategories()->count() > 0;
    }

    /**
     * Get total expenses for this category and all its subcategories
     */
    public function getTotalExpenses($startDate = null, $endDate = null)
    {
        $query = Expense::where(function($q) {
            $q->where('category_id', $this->id)
              ->orWhereIn('category_id', $this->subcategories()->pluck('id'));
        })->where('user_id', $this->user_id);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->sum('amount');
    }

    /**
     * Get total earnings for this category and all its subcategories
     */
    public function getTotalEarnings($startDate = null, $endDate = null)
    {
        $query = Earning::where(function($q) {
            $q->where('category_id', $this->id)
              ->orWhere('subcategory_id', $this->id)
              ->orWhereIn('category_id', $this->subcategories()->pluck('id'));
        })->where('user_id', $this->user_id);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->sum('amount');
    }

    /**
     * Get all top-level categories (no parent) by type
     */
    public static function getTopLevelCategories($type, $userId)
    {
        return self::where('type', $type)
            ->where('user_id', $userId)
            ->whereNull('parent_id')
            ->with('subcategories')
            ->get();
    }
}
