import React, { useState, useCallback, useContext, createContext, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast.js';
import { apiFetch, apiJsonFetch } from '@/utils/api.js';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children, initialCurrency = null, initialDisplayedCurrencies = [] }) => {
    const [converting, setConverting] = useState(false);
    const [error, setError] = useState(null);
    const [currentCurrency, setCurrentCurrency] = useState(initialCurrency);
    const [displayedCurrencies, setDisplayedCurrencies] = useState(initialDisplayedCurrencies);
    const { toast } = useToast();

    useEffect(() => {
        // Only fetch if we don't have initial data
        if (!initialCurrency) {
            const fetchCurrencySettings = async () => {
                try {
                    const currencyResponse = await apiFetch('/api/currencies/current');
                    if (!currencyResponse.ok) {
                        // If 401, the user is likely not authenticated properly
                        if (currencyResponse.status === 401) {
                            console.warn('Currency API returned 401 - user may not be fully authenticated yet');
                            return; // Don't show error for 401, just skip loading
                        }
                        throw new Error(`HTTP ${currencyResponse.status}: Failed to fetch currency`);
                    }
                    const currencyData = await currencyResponse.json();
                    setCurrentCurrency(currencyData.currency);
                    
                    if (currencyData.user && currencyData.user.displayed_currencies) {
                        setDisplayedCurrencies(currencyData.user.displayed_currencies);
                    }
                } catch (err) {
                    console.error('Currency loading error:', err);
                    setError('Failed to load currency settings');
                    // Only show toast for non-401 errors
                    if (!err.message?.includes('401')) {
                        toast({
                            title: "Error Loading Currency",
                            description: "Could not load currency settings. Using default.",
                            variant: "destructive"
                        });
                    }
                }
            };
            
            fetchCurrencySettings();
        }
    }, [toast, initialCurrency]);

    const convertAmount = useCallback(async (amount, fromCurrencyId, toCurrencyId) => {
        if (fromCurrencyId === toCurrencyId) return amount;
        
        setConverting(true);
        setError(null);
        
        try {
            const response = await apiJsonFetch('/api/currencies/convert', {
                amount,
                from_currency_id: fromCurrencyId,
                to_currency_id: toCurrencyId
            }, { method: 'POST' });

            if (!response.ok) throw new Error('Conversion failed');
            
            const data = await response.json();
            return data.amount;
        } catch (err) {
            setError('Failed to convert currency');
            toast({
                title: "Currency Conversion Failed",
                description: "There was an error converting the amount.",
                variant: "destructive"
            });
            return amount;
        } finally {
            setConverting(false);
        }
    }, [toast]);

    const updateUserCurrency = useCallback(async (currencyId) => {
        setConverting(true);
        setError(null);

        try {
            const response = await apiJsonFetch('/api/currencies/user-preference', 
                { currency_id: currencyId }, 
                { method: 'POST' }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || 'Failed to update currency preference');
            }

            const data = await response.json();
            setCurrentCurrency(data.user.currency);
            
            toast({
                title: "Currency Updated",
                description: "Your currency preference has been updated. All amounts and currency symbols have been converted to " + data.user.currency.code + " (" + data.user.currency.symbol + ").",
            });

            return data;
        } catch (err) {
            console.error('Currency update error:', err);
            setError(err.message || 'Failed to update currency preference');
            toast({
                title: "Update Failed",
                description: err.message || "Failed to update currency preference. Please try again.",
                variant: "destructive"
            });
            throw err;
        } finally {
            setConverting(false);
        }
    }, [toast]);

    const updateDisplaySettings = useCallback(async (currencyIds) => {
        setError(null);

        try {
            const response = await apiJsonFetch('/api/settings/currency/display',
                { displayed_currencies: currencyIds },
                { method: 'POST' }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || 'Failed to update display settings');
            }

            const data = await response.json();
            setDisplayedCurrencies(data.user.displayed_currencies || []);
            
            toast({
                title: "Display Settings Updated",
                description: "Your currency display preferences have been updated.",
            });

            return data;
        } catch (err) {
            console.error('Currency display settings error:', err);
            setError(err.message || 'Failed to update display settings');
            toast({
                title: "Update Failed",
                description: err.message || "Failed to update currency display settings. Please try again.",
                variant: "destructive"
            });
            throw err;
        }
    }, [toast]);

    const formatCurrency = useCallback((amount, options = {}) => {
        if (!currentCurrency) return '—';

        const value = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(value)) return '—';

        const {
            minimumFractionDigits = 2,
            maximumFractionDigits = 2,
            compact = false
        } = options;

        const converted = value * (currentCurrency.exchange_rate ?? 1);

        const formattedNumber = new Intl.NumberFormat(undefined, {
            minimumFractionDigits,
            maximumFractionDigits,
            notation: compact ? 'compact' : 'standard'
        }).format(converted);

        return `${currentCurrency.symbol}${formattedNumber}`;
    }, [currentCurrency]);

    const value = {
        converting,
        error,
        currentCurrency,
        currency: currentCurrency, // Make 'currency' available directly
        displayedCurrencies,
        convertAmount,
        updateUserCurrency,
        updateDisplaySettings,
        formatCurrency,
        setError, // Expose setError if needed by consumers
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
