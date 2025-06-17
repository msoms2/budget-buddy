<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubCategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'icon',
        'icon_color',
        'bg_color',
        'user_id',
        'category_id',
    ];

    /**
     * Get the user that owns the subcategory.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent category that owns the subcategory.
     */
    public function category()
    {
        return $this->belongsTo(ExpenseCategory::class, 'category_id');
    }

    /**
     * Get the expenses for this subcategory.
     */
    public function expenses()
    {
        return $this->hasMany(Expense::class, 'subcategory_id');
    }
}