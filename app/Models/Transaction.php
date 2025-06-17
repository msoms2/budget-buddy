<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;
    
    protected static function boot()
    {
        parent::boot();

        // Add global scope to only show current user's transactions
        static::addGlobalScope('user', function ($builder) {
            if (auth()->check()) {
                $builder->where('user_id', auth()->id());
            }
        });
    }
    
    protected $fillable = [
        'name',
        'amount',
        'original_amount',
        'exchange_rate',
        'type',
        'date',
        'description',
        'category_id',
        'user_id',
        'currency_id',
        'payment_method',
        'is_recurring',
        'recurring_frequency',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'original_amount' => 'decimal:2',
        'exchange_rate' => 'decimal:6',
        'is_recurring' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
    
    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }
}
