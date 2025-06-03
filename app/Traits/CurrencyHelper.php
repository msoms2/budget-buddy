<?php

namespace App\Traits;

use App\Models\Currency;
use Illuminate\Support\Facades\Auth;

trait CurrencyHelper
{
    /**
     * Get the user's preferred currency, or system default if not set
     */
    public function getUserCurrency()
    {
        $user = Auth::user();
        if ($user && $user->currency) {
            return $user->currency;
        }
        // Fallback to system default
        return Currency::where('is_default', true)->first()
            ?? Currency::where('code', 'EUR')->first()
            ?? Currency::where('code', 'USD')->first()
            ?? new Currency(['code' => 'EUR', 'symbol' => '€', 'name' => 'Euro']);
    }
    
    /**
     * Format currency amount according to user's preference
     */
    public function formatCurrency($amount, $currencyOverride = null)
    {
        $currency = $currencyOverride ?? $this->getUserCurrency();
        
        if (!$currency) {
            return '$' . number_format($amount, 2);
        }
        
        $formatter = new \NumberFormatter('en_US', \NumberFormatter::CURRENCY);
        $formatter->setTextAttribute(\NumberFormatter::CURRENCY_CODE, $currency->code);
        
        return $formatter->formatCurrency($amount, $currency->code);
    }
    
    /**
     * Convert amount from one currency to another
     */
    public function convertCurrency($amount, $fromCurrency, $toCurrency = null)
    {
        $toCurrency = $toCurrency ?? $this->getUserCurrency();
        
        if ($fromCurrency->id === $toCurrency->id) {
            return $amount;
        }
        
        return $fromCurrency->convertTo($amount, $toCurrency);
    }
    
    /**
     * Get formatted currency symbol
     */
    public function getCurrencySymbol($currencyOverride = null)
    {
        $currency = $currencyOverride ?? $this->getUserCurrency();
        return $currency ? $currency->symbol : '$';
    }
    
    /**
     * Get currency code
     */
    public function getCurrencyCode($currencyOverride = null)
    {
        $currency = $currencyOverride ?? $this->getUserCurrency();
        return $currency ? $currency->code : 'USD';
    }

    /**
     * Batch convert amounts from one currency to another
     *
     * @param array $amounts Array of amounts to convert
     * @param Currency $fromCurrency Source currency
     * @param Currency|null $toCurrency Target currency (defaults to user's currency)
     * @return array Converted amounts
     */
    public function batchConvertCurrency(array $amounts, Currency $fromCurrency, Currency $toCurrency = null)
    {
        $toCurrency = $toCurrency ?? $this->getUserCurrency();
        
        if ($fromCurrency->id === $toCurrency->id) {
            return $amounts;
        }
        
        return array_map(function ($amount) use ($fromCurrency, $toCurrency) {
            return $fromCurrency->convertTo($amount, $toCurrency);
        }, $amounts);
    }

    /**
     * Convert all financial data for a user from one currency to another
     *
     * @param Currency $fromCurrency Source currency
     * @param Currency $toCurrency Target currency
     * @throws \Exception If conversion fails
     */
    public function convertUserFinancialData(Currency $fromCurrency, Currency $toCurrency)
    {
        if ($fromCurrency->id === $toCurrency->id) {
            return;
        }

        try {
            // Get authenticated user with relationships eager loaded
            $user = auth()->user()->load([
                'earnings.user', 'earnings.currency',
                'expenses.user', 'expenses.currency',
                'budgets.user', 'budgets.currency', // Assuming Budget model has a currency relationship
                'goals.user', 'goals.currency' // Assuming Goal model has a currency relationship
            ]);

            // Convert earnings
            if ($user->earnings) {
                foreach ($user->earnings as $earning) {
                    $earning->amount = $fromCurrency->convertTo($earning->amount, $toCurrency);
                    $earning->save();
                }
            }

            // Convert expenses
            if ($user->expenses) {
                foreach ($user->expenses as $expense) {
                    $expense->amount = $fromCurrency->convertTo($expense->amount, $toCurrency);
                    $expense->save();
                }
            }

            // Convert budgets
            if ($user->budgets) {
                foreach ($user->budgets as $budget) {
                    $budget->amount = $fromCurrency->convertTo($budget->amount, $toCurrency);
                    $budget->save();
                }
            }

            // Convert goals
            if ($user->goals) {
                foreach ($user->goals as $goal) {
                    $goal->target_amount = $fromCurrency->convertTo($goal->target_amount, $toCurrency);
                    $goal->current_amount = $fromCurrency->convertTo($goal->current_amount, $toCurrency);
                    $goal->save();
                }
            }

        } catch (\Exception $e) {
            throw new \Exception('Failed to convert user financial data: ' . $e->getMessage());
        }
    }

    /**
     * Ensure all user's financial records use the system default currency
     */
    public function ensureUserCurrencyConsistency(): void
    {
        $user = auth()->user();
        $systemCurrency = $this->getUserCurrency(); // Now returns system default
        
        if (!$user || !$systemCurrency) {
            return;
        }

        // Update expenses that don't have currency set
        $user->expenses()->whereNull('currency_id')->update([
            'currency_id' => $systemCurrency->id
        ]);

        // Update earnings that don't have currency set
        $user->earnings()->whereNull('currency_id')->update([
            'currency_id' => $systemCurrency->id
        ]);
    }

    /**
     * Get user's financial data in the system default currency
     *
     * @param string $type Type of data: 'expenses', 'earnings', 'budgets', 'goals'
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getUserFinancialDataInDefaultCurrency(string $type)
    {
        $user = auth()->user();
        $systemCurrency = $this->getUserCurrency(); // Now returns system default
        
        if (!$user || !$systemCurrency) {
            return collect();
        }

        switch ($type) {
            case 'expenses':
                return $user->expenses->map(function ($expense) use ($systemCurrency) {
                    if ($expense->currency_id !== $systemCurrency->id) {
                        $expense->amount = $this->convertCurrency(
                            $expense->amount,
                            $expense->currency,
                            $systemCurrency
                        );
                    }
                    return $expense;
                });

            case 'earnings':
                return $user->earnings->map(function ($earning) use ($systemCurrency) {
                    if ($earning->currency_id !== $systemCurrency->id) {
                        $earning->amount = $this->convertCurrency(
                            $earning->amount,
                            $earning->currency,
                            $systemCurrency
                        );
                    }
                    return $earning;
                });

            case 'budgets':
                return $user->budgets->map(function ($budget) use ($systemCurrency) {
                    if (isset($budget->currency_id) && $budget->currency_id !== $systemCurrency->id) {
                        $budget->amount = $this->convertCurrency(
                            $budget->amount,
                            $budget->currency,
                            $systemCurrency
                        );
                    }
                    return $budget;
                });

            case 'goals':
                return $user->goals->map(function ($goal) use ($systemCurrency) {
                    // Goals might not have direct currency, so we assume they're in system currency
                    return $goal;
                });

            default:
                return collect();
        }
    }
}
