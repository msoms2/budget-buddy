import * as React from 'react';
import { useState, useEffect } from 'react';
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, AlertCircle, Check } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency.jsx';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/utils/api.js';

export default function EnhancedCurrencySelector({ onChange, className, value }) {
    const [currencies, setCurrencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { converting, updateUserCurrency, currency: currentCurrency } = useCurrency();
    const [error, setError] = useState(null);

    const fetchCurrencies = async () => {
        try {
            const [currenciesResponse, availableResponse] = await Promise.all([
                apiFetch('/api/currencies'),
                apiFetch('/api/currencies/available')
            ]);

            if (!currenciesResponse.ok || !availableResponse.ok) {
                throw new Error('Failed to fetch currencies');
            }

            const currenciesData = await currenciesResponse.json();
            const availableData = await availableResponse.json();

            // Combine both currency sources
            const availableCurrencies = Object.entries(availableData).map(([code, name]) => ({
                code,
                name,
                symbol: code // Use code as symbol for available currencies if not in system
            }));

            // Merge with existing currencies, preferring system currencies
            const existingCurrencies = currenciesData.currencies;
            const mergedCurrencies = [...existingCurrencies];

            // Add available currencies that aren't already in the system
            availableCurrencies.forEach(availableCurrency => {
                if (!existingCurrencies.some(c => c.code === availableCurrency.code)) {
                    mergedCurrencies.push(availableCurrency);
                }
            });

            setCurrencies(mergedCurrencies);
            setFetchError(null);
        } catch (error) {
            console.error('Error fetching currencies:', error);
            setFetchError('Failed to load currencies. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrencies();
    }, []);

    const handleCurrencyChange = async (newValue) => {
        try {
            setError(null);
            // Convert string ID to number if it's a numeric string
            const maybeId = parseInt(newValue, 10);
            
            // If newValue is not a number, it might be a currency code from the available list
            if (isNaN(maybeId)) {
                // Find currency in our merged list
                const selectedCurrency = currencies.find(c => c.code === newValue);
                if (!selectedCurrency) {
                    throw new Error('Invalid currency selected');
                }
                
                // First call the provided onChange handler if it exists
                if (typeof onChange === 'function') {
                    onChange(newValue); // Pass code for available currencies
                }
            } else {
                // First call the provided onChange handler if it exists
                if (typeof onChange === 'function') {
                    onChange(maybeId);
                }

                // Then update user's currency preference which triggers automatic conversion
                await updateUserCurrency(maybeId);
            }
        } catch (error) {
            console.error('Error updating currency:', error);
            setError(error.message || 'Failed to update currency');
            // The useCurrency hook will handle the error toast
        }
    };

    // Filter currencies based on search term
    const filteredCurrencies = currencies.filter(currency => 
        currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Select
            value={value || currentCurrency?.id?.toString() || ""}
            onValueChange={handleCurrencyChange}
            disabled={loading || converting}
            className={cn(
                className,
                error && "border-red-500 focus-within:ring-red-500"
            )}
        >
            <SelectTrigger className={cn(
                "transition-all focus:ring-2",
                fetchError ? "focus:ring-red-500/20 border-red-500/50" : "focus:ring-green-500/20",
                (loading || converting) && "opacity-70 cursor-not-allowed"
            )}>
                <SelectValue placeholder={
                    loading ? "Loading currencies..." :
                    converting ? "Converting..." :
                    fetchError ? "Currency loading failed" :
                    "Select currency"
                } />
                {(loading || converting) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : fetchError ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                ) : null}
            </SelectTrigger>

            <SelectContent>
                {fetchError ? (
                    <div className="p-4 text-center text-red-600">
                        Error loading currencies
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setFetchError(null);
                                setLoading(true);
                                fetchCurrencies();
                            }}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="p-2">
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Search currencies..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <ScrollArea className="h-[300px]">
                            {filteredCurrencies.map(currency => (
                                <SelectItem 
                                    key={currency.code} 
                                    value={currency.id ? currency.id.toString() : currency.code}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{currency.code} ({currency.symbol}) - {currency.name}</span>
                                        {currentCurrency?.code === currency.code && (
                                            <Check className="h-4 w-4 text-green-500 ml-2" />
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                        </ScrollArea>
                    </>
                )}
            </SelectContent>
        </Select>
    );
}
