<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
    ];

    protected $casts = [
        'exchange_rate' => 'decimal:4',
        'decimal_places' => 'integer',
        'is_default' => 'boolean',
    ];

    /**
     * Get the countries that use this currency.
     */
    public function countries(): HasMany
    {
        return $this->hasMany(Country::class);
    }

    /**
     * Get expenses using this currency.
     */
    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    /**
     * Get earnings using this currency.
     */
    public function earnings(): HasMany
    {
        return $this->hasMany(Earning::class);
    }

    /**
     * Get investments using this currency.
     */
    public function investments(): HasMany
    {
        return $this->hasMany(Investment::class);
    }

    /**
     * Get budgets using this currency.
     */
    public function budgets(): HasMany
    {
        return $this->hasMany(Budget::class);
    }

    /**
     * Get goals using this currency.
     */
    public function goals(): HasMany
    {
        return $this->hasMany(Goal::class);
    }

    /**
     * Get the default currency.
     */
    public static function getDefault()
    {
        return static::where('is_default', true)->first();
    }

    /**
     * Alias for getDefault() to maintain compatibility with existing code.
     */
    public static function getDefaultCurrency()
    {
        return static::getDefault();
    }

    /**
     * Get the base currency (alias for getDefault).
     */
    public static function getBase()
    {
        return static::getDefault();
    }

    /**
     * Format a given amount according to the currency's format pattern.
     */
    public function formatAmount($amount)
    {
        $formatted = number_format(
            $amount,
            $this->decimal_places,
            '.',
            ','
        );

        return str_replace('#,##0.00', $formatted, $this->format);
    }
}