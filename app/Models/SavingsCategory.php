<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class SavingsCategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'parent_id',
        'name',
        'description',
        'icon',
        'icon_color',
        'bg_color',
        'is_system'
    ];

    protected $casts = [
        'is_system' => 'boolean',
    ];

    /**
     * Get the user that owns the category
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent category
     */
    public function parent()
    {
        return $this->belongsTo(SavingsCategory::class, 'parent_id');
    }

    /**
     * Get the child categories
     */
    public function children()
    {
        return $this->hasMany(SavingsCategory::class, 'parent_id');
    }

    /**
     * Get all associated savings entries
     */
    public function savings()
    {
        return $this->hasMany(Savings::class, 'category_id');
    }

    /**
     * Get total savings amount for this category
     */
    public function getTotalSavingsAttribute()
    {
        return $this->savings()->sum('current_amount');
    }

    /**
     * Get the full hierarchy path of category names
     */
    public function getFullPathAttribute()
    {
        $path = collect([$this->name]);
        $category = $this;

        while ($category->parent) {
            $category = $category->parent;
            $path->prepend($category->name);
        }

        return $path->join(' > ');
    }

    /**
     * Scope query to root categories (no parent)
     */
    public function scopeRoot(Builder $query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope query to user's categories
     */
    public function scopeForUser(Builder $query, $userId)
    {
        return $query->where('user_id', $userId)->orWhere('is_system', true);
    }

    /**
     * Get all descendant categories (recursive)
     */
    public function descendants(): Collection
    {
        $descendants = collect();
        
        foreach ($this->children as $child) {
            $descendants->push($child);
            $descendants = $descendants->merge($child->descendants());
        }
        
        return $descendants;
    }

    /**
     * Check if category can be safely deleted
     */
    public function canDelete(): bool
    {
        return !$this->is_system && 
               $this->savings()->count() === 0 && 
               $this->children()->count() === 0;
    }

    /**
     * Move all savings to another category
     */
    public function moveSavingsTo(SavingsCategory $newCategory)
    {
        $this->savings()->update(['category_id' => $newCategory->id]);
    }

    protected static function booted()
    {
        static::deleting(function (SavingsCategory $category) {
            if (!$category->canDelete()) {
                return false;
            }
        });
    }
}
