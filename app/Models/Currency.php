<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Cache;

class Currency extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'symbol',
        'exchange_rate',
        'format',
        'decimal_places',
        'is_default',
        'last_updated',
    ];

    protected $casts = [
        'exchange_rate' => 'decimal:4',
        'decimal_places' => 'integer',
        'is_default' => 'boolean',
        'last_updated' => 'datetime',
    ];

    // Relationships
    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function earnings()
    {
        return $this->hasMany(Earning::class);
    }

    public function investments()
    {
        return $this->hasMany(Investment::class);
    }

    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }

    public function goals()
    {
        return $this->hasMany(Goal::class);
    }

    /**
     * Get the default currency for the system.
     */
    public static function getDefaultCurrency()
    {
        return Cache::remember('default_currency', 60 * 24, function () {
            return static::where('is_default', true)
                ->orWhere('code', 'EUR')
                ->orWhere('code', 'USD')
                ->first() ?? static::first();
        });
    }

    // Helper methods
    public function convertTo(float $amount, Currency $targetCurrency): float
    {
        // If same currency, no conversion needed
        if ($this->id === $targetCurrency->id) {
            return $amount;
        }

        // Get the exchange rate and multiply by the amount
        $exchangeRate = $this->getExchangeRate($targetCurrency);
        return $amount * $exchangeRate;
    }

    public static function getBase()
    {
        return static::where('is_default', true)->firstOrFail();
    }

    /**
     * Format an amount in this currency
     */
    public function formatAmount($amount)
    {
        $formattedAmount = number_format($amount, $this->decimal_places);
        return str_replace(
            ['{symbol}', '{amount}'],
            [$this->symbol, $formattedAmount],
            $this->format ?? '{symbol} {amount}'
        );
    }

    /**
     * Get exchange rate to another currency
     */
    public function getExchangeRate(Currency $targetCurrency): float
    {
        // If same currency, return 1.0 (no conversion needed)
        if ($this->id === $targetCurrency->id) {
            return 1.0;
        }

        // For common currency pairs, use direct rates if available
        $directRates = [
            'GBP' => [
                'USD' => 1.33,
                'EUR' => 1.18,
                'JPY' => 147.5,
                'CAD' => 1.81,
                'AUD' => 2.0,
                'BTC' => 0.000027,
            ],
            'USD' => [
                'GBP' => 0.75,
                'EUR' => 0.92,
                'JPY' => 110.5,
                'CAD' => 1.36,
                'AUD' => 1.5,
                'BTC' => 0.000020,
            ],
            'EUR' => [
                'GBP' => 0.85,
                'USD' => 1.09,
                'JPY' => 131.27,
                'CAD' => 1.48,
                'AUD' => 1.63,
                'BTC' => 0.000022,
            ],
            'JPY' => [
                'USD' => 0.00905,
                'EUR' => 0.00762,
                'GBP' => 0.00678,
            ],
            'CAD' => [
                'USD' => 0.735,
                'EUR' => 0.675,
                'GBP' => 0.552,
            ],
            'AUD' => [
                'USD' => 0.667,
                'EUR' => 0.613,
                'GBP' => 0.5,
            ],
            'BTC' => [
                'USD' => 50000.0,
                'EUR' => 45900.0,
                'GBP' => 37000.0,
            ],
        ];

        // Check if we have a direct rate for this currency pair
        if (isset($directRates[$this->code][$targetCurrency->code])) {
            return $directRates[$this->code][$targetCurrency->code];
        }

        // If this is the base currency, return the target currency's rate
        if ($this->is_default) {
            return $targetCurrency->exchange_rate ?? 1.0;
        }

        // If target is the base currency, return 1 / this currency's rate
        if ($targetCurrency->is_default) {
            // Handle case where exchange_rate might be 0 or null
            return ($this->exchange_rate && $this->exchange_rate != 0) ? 
                   (1.0 / $this->exchange_rate) : 1.0;
        }

        // Calculate via the base currency (USD)
        $baseToTarget = $targetCurrency->is_default ? 
                      1.0 : 
                      ($targetCurrency->exchange_rate ?? 1.0);
                      
        $sourceToBase = $this->is_default ? 
                      1.0 : 
                      (($this->exchange_rate && $this->exchange_rate != 0) ? 
                      (1.0 / $this->exchange_rate) : 1.0);
        
        // Return the combined exchange rate
        return $baseToTarget * $sourceToBase;
    }
}