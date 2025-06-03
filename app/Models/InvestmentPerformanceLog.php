<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvestmentPerformanceLog extends Model
{
    protected $fillable = [
        'investment_id',
        'date',
        'current_value',
        'unrealized_gain',
        'realized_gain',
        'total_return_percentage',
    ];

    protected $casts = [
        'date' => 'date',
        'current_value' => 'decimal:2',
        'unrealized_gain' => 'decimal:2',
        'realized_gain' => 'decimal:2',
        'total_return_percentage' => 'decimal:4',
    ];

    /**
     * Get the investment that owns the performance log.
     */
    public function investment(): BelongsTo
    {
        return $this->belongsTo(Investment::class);
    }

    /**
     * Calculate total gain (realized + unrealized).
     */
    public function getTotalGain(): float
    {
        return $this->unrealized_gain + $this->realized_gain;
    }

    /**
     * Scope a query to get logs within a date range.
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Get the previous performance log.
     */
    public function getPreviousLog()
    {
        return static::where('investment_id', $this->investment_id)
            ->where('date', '<', $this->date)
            ->orderByDesc('date')
            ->first();
    }

    /**
     * Calculate performance change since previous log.
     */
    public function getValueChangeSinceLastLog(): float
    {
        $previousLog = $this->getPreviousLog();
        
        if (!$previousLog) {
            return 0;
        }

        return $this->current_value - $previousLog->current_value;
    }
}