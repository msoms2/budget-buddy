import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency.jsx';
import { apiFetch } from '@/Utils/api.js';
import { useToast } from '@/hooks/use-toast.js';

export default function UserCurrencyPreference() {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { currency: currentCurrency, updateUserCurrency } = useCurrency();
  const { toast } = useToast();

  // Fetch available currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoading(true);
        const response = await apiFetch('/api/currencies');
        if (!response.ok) {
          throw new Error('Failed to fetch currencies');
        }
        
        const data = await response.json();
        setCurrencies(data.currencies || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching currencies:', err);
        setError('Failed to load currencies');
        toast({
          title: "Error Loading Currencies",
          description: "Could not load available currencies. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, [toast]);

  // Handle currency change
  const handleCurrencyChange = async (newCurrencyId) => {
    try {
      setSaving(true);
      await updateUserCurrency(parseInt(newCurrencyId));
      // Page will refresh to apply changes
      window.location.reload();
    } catch (err) {
      console.error('Error updating currency:', err);
    } finally {
      setSaving(false);
    }
  };

  // Find the selected currency
  const selected = currentCurrency ? currencies.find(c => c.id === currentCurrency.id) : null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Your Currency Preference</CardTitle>
        <CardDescription>
          Choose your preferred currency. All amounts throughout the application will be displayed in this currency.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-md bg-destructive/15 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-x-2">
              <span className="text-sm font-medium">Current currency:</span>
              {currentCurrency && (
                <div className="flex items-center rounded-md bg-muted px-3 py-1">
                  <span className="text-xl font-semibold mr-2">{currentCurrency.symbol}</span>
                  <span>{currentCurrency.name}</span>
                  <span className="ml-1 text-xs text-muted-foreground">({currentCurrency.code})</span>
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <span className="text-sm font-medium">Choose currency:</span>
              <Select
                disabled={saving || loading}
                value={selected?.id?.toString()}
                onValueChange={handleCurrencyChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a currency">
                    {selected && (
                      <span className="flex items-center gap-2">
                        <span className="text-lg font-medium">{selected.symbol}</span>
                        <span>{selected.name}</span>
                        <span className="ml-1 text-xs text-muted-foreground">({selected.code})</span>
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.id} value={currency.id.toString()}>
                      <span className="flex items-center gap-2">
                        <span className="text-lg font-medium">{currency.symbol}</span>
                        <span>{currency.name}</span>
                        <span className="ml-1 text-xs text-muted-foreground">({currency.code})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between bg-muted/20 text-sm text-muted-foreground">
        <div className="flex items-center">
          <Check className="mr-2 h-4 w-4 text-primary" />
          Changes take effect immediately
        </div>
      </CardFooter>
    </Card>
  );
}
