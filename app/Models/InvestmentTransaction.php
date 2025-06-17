<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InvestmentTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'investment_id',
        'transaction_type',
        'date',
        'quantity',
        'price_per_unit',
        'total_amount',
        'fees',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'quantity' => 'decimal:6',
        'price_per_unit' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'fees' => 'decimal:2',
    ];

    /**
     * Get the investment that owns the transaction.
     */
    public function investment(): BelongsTo
    {
        return $this->belongsTo(Investment::class);
    }

    /**
     * Calculate the total cost including fees.
     */
    public function getTotalCost(): float
    {
        return $this->total_amount + $this->fees;
    }

    /**
     * Calculate the average cost per unit including fees.
     */
    public function getCostPerUnit(): float
    {
        if ($this->quantity <= 0) {
            return 0;
        }

        return $this->getTotalCost() / $this->quantity;
    }

    /**
     * Scope a query to only include buy transactions.
     */
    public function scopeBuys($query)
    {
        return $query->where('transaction_type', 'buy');
    }

    /**
     * Scope a query to only include sell transactions.
     */
    public function scopeSells($query)
    {
        return $query->where('transaction_type', 'sell');
    }
}