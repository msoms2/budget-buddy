import React, { useState, useEffect } from 'react';
import { DollarSign, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency.jsx';
import { apiFetch } from '@/utils/api.js';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

export default function CurrencySettings() {
    const { error } = useCurrency();
    const [currencies, setCurrencies] = useState([]);
    const [selectedCurrencies, setSelectedCurrencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCurrencies();
    }, []);

    const fetchCurrencies = async () => {
        try {
            const response = await apiFetch('/api/currencies');
            if (!response.ok) {
                throw new Error('Failed to fetch currencies');
            }
            const data = await response.json();
            setCurrencies(data.currencies);
            // Initialize with all currencies selected
            setSelectedCurrencies(data.currencies.map(c => c.id));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching currencies:', error);
        }
    };

    const handleToggleCurrency = (currencyId) => {
        setSelectedCurrencies(prev => {
            if (prev.includes(currencyId)) {
                return prev.filter(id => id !== currencyId);
            }
            return [...prev, currencyId];
        });
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            const response = await apiFetch('/api/currencies/display-settings', {
                method: 'POST',
                body: JSON.stringify({
                    displayed_currencies: selectedCurrencies
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save currency settings');
            }

            // Show success state
            setSaving(false);
        } catch (error) {
            console.error('Error saving currency settings:', error);
            setSaving(false);
        }
    };

    if (loading) {
        return <div>Loading currencies...</div>;
    }

    return (
        <div className="space-y-4">
            <div>
                <Label className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-4 w-4" />
                    Display Currencies
                </Label>

                <p className="text-sm text-muted-foreground mb-4">
                    Select which currencies you want to see in your transactions and reports.
                </p>

                <ScrollArea className="h-[200px] rounded-md border p-4">
                    <div className="space-y-4">
                        {currencies.map(currency => (
                            <div key={currency.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`currency-${currency.id}`}
                                    checked={selectedCurrencies.includes(currency.id)}
                                    onCheckedChange={() => handleToggleCurrency(currency.id)}
                                />
                                <label
                                    htmlFor={`currency-${currency.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {currency.code} ({currency.symbol}) - {currency.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <Button
                    onClick={handleSaveSettings}
                    className="mt-4"
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="ml-2">{error}</span>
                </Alert>
            )}
        </div>
    );
}