<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InvestmentCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Get the investments that belong to this category.
     */
    public function investments(): HasMany
    {
        return $this->hasMany(Investment::class, 'investment_category_id');
    }
}