import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency.jsx';
import { cn } from '@/lib/utils';

export default function CurrencyDisplay({
  amount,
  fromCurrencyId,
  toCurrencyId = null,
  className = '',
  showConversionInfo = true
}) {
  const [displayAmount, setDisplayAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const { convertAmount: apiConvertAmount, formatCurrency, currency: userCurrency, converting, error } = useCurrency();

  const convertAmount = useCallback(async (amount, fromCurrencyId, toCurrencyId) => {
    if (fromCurrencyId === toCurrencyId) return amount;

    setLoading(true);
    // ← map IDs to ISO codes so the backend can do a direct lookup
    const fromObj = displayedCurrencies.find(c => c.id === fromCurrencyId);
    const toObj   = displayedCurrencies.find(c => c.id === toCurrencyId);
    const fromCode = fromObj?.code;
    const toCode   = toObj?.code;

    try {
      const response = await apiJsonFetch('/api/currencies/convert', {
        amount,
        // note: these keys must match what your controller expects
        from_currency: fromCode,
        to_currency: toCode
      }, { method: 'POST' });

      if (!response.ok) throw new Error('Conversion failed');
      const data = await response.json();
      return data.amount;
    } catch (err) {
      setError('Failed to convert currency');
      toast({
        title: "Currency Conversion Failed",
      });
      return amount;
    } finally {
      setLoading(false);
    }
  }, [displayedCurrencies, toast]);

  useEffect(() => {
    let mounted = true;
    const updateDisplay = async () => {
      setLoading(true);

      // determine the true target currency: prop or user's
      const targetId = toCurrencyId ?? userCurrency?.id;

      // if currencies differ, convert; otherwise leave as-is
      let value = amount;
      if (targetId && fromCurrencyId !== targetId) {
        try {
          value = await convertAmount(amount, fromCurrencyId, targetId);
        } catch {
          // fallback to raw amount
        }
      }

      // format once converted
      const formatted = userCurrency
        ? formatCurrency(value)
        : value.toString();

      if (mounted) {
        setDisplayAmount(formatted);
        setLoading(false);
      }
    };

    updateDisplay();
    return () => {
      mounted = false;
    };
  }, [amount, fromCurrencyId, toCurrencyId, userCurrency, convertAmount, formatCurrency]);

  if (loading || converting) {
    return <Loader2 className={cn('animate-spin', className)} />;
  }

  if (error) {
    return <span className={cn('text-red-500', className)} title={error}>—</span>;
  }

  return <span className={className}>{displayAmount}</span>;
}