<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EarningCategory extends Model
{
    use HasFactory;

    protected $table = 'earning_categories';

    protected $fillable = [
        'name',
        'user_id',
        'description',
        'icon',
        'icon_color',
        'bg_color',
        'is_system',
        'parent_id',
        'is_fixed_type',
    ];

    /**
     * Get the user that owns this category.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the earnings for this category.
     */
    public function earnings(): HasMany
    {
        return $this->hasMany(Earning::class, 'category_id')
            ->orWhere('subcategory_id', $this->id);
    }

    /**
     * Get all earnings including those in subcategories
     */
    public function getAllEarnings()
    {
        return Earning::where(function($query) {
            $query->where('category_id', $this->id)
                  ->orWhere('subcategory_id', $this->id)
                  ->orWhereIn('category_id', $this->subcategories()->pluck('id'));
        });
    }
    
    /**
     * Get the parent category.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(EarningCategory::class, 'parent_id');
    }

    /**
     * Get the subcategories for this category.
     */
    public function subcategories(): HasMany
    {
        return $this->hasMany(EarningCategory::class, 'parent_id');
    }
}