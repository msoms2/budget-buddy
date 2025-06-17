import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
    RefreshCw, 
    AlertCircle, 
    Plus, 
    Search,
    Star,
    DollarSign,
    CheckCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/Utils/api.js';

const AddCurrencyModal = ({ isOpen, onClose, onCurrencyAdded }) => {
    const [availableCurrencies, setAvailableCurrencies] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [customCurrency, setCustomCurrency] = useState({
        code: '',
        name: '',
        symbol: '',
        format: '{symbol} {amount}',
        decimal_places: 2,
        is_default: false
    });
    const [mode, setMode] = useState('api'); // 'api' or 'custom'
    const { toast } = useToast();

    // Fetch available currencies from API
    const fetchAvailableCurrencies = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiFetch('/api/currencies/available');
            if (!response.ok) throw new Error('Failed to fetch available currencies');
            
            const data = await response.json();
            setAvailableCurrencies(data.available_for_add || {});
        } catch (err) {
            console.error('Failed to fetch available currencies:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Load available currencies when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchAvailableCurrencies();
            // Reset form
            setSelectedCurrency('');
            setCustomCurrency({
                code: '',
                name: '',
                symbol: '',
                format: '{symbol} {amount}',
                decimal_places: 2,
                is_default: false
            });
            setMode('api');
            setSearchTerm('');
        }
    }, [isOpen]);

    // Filter available currencies based on search
    const filteredCurrencies = Object.entries(availableCurrencies).filter(([code, name]) => 
        code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle adding currency from API
    const handleAddFromAPI = async () => {
        if (!selectedCurrency) {
            toast({
                title: "Error",
                description: "Please select a currency to add",
                variant: "destructive",
            });
            return;
        }

        try {
            setSubmitting(true);
            const currencyName = availableCurrencies[selectedCurrency];
            
            // Get common currency symbols (including cryptocurrencies)
            const symbolMap = {
                'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CAD': 'C$',
                'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥', 'SEK': 'kr', 'NOK': 'kr',
                'DKK': 'kr', 'PLN': 'zł', 'CZK': 'Kč', 'HUF': 'Ft', 'RUB': '₽',
                'TRY': '₺', 'BRL': 'R$', 'MXN': '$', 'ZAR': 'R', 'INR': '₹',
                'KRW': '₩', 'SGD': 'S$', 'HKD': 'HK$', 'NZD': 'NZ$', 'THB': '฿',
                // Common cryptocurrencies
                'BTC': '₿', 'ETH': 'Ξ', 'LTC': 'Ł', 'XRP': 'XRP', 'ADA': 'ADA',
                'DOT': 'DOT', 'BNB': 'BNB', 'SOL': 'SOL', 'MATIC': 'MATIC',
                'AVAX': 'AVAX', 'ATOM': 'ATOM', 'LINK': 'LINK', 'UNI': 'UNI',
                'USDT': '₮', 'USDC': 'USDC', 'BUSD': 'BUSD', 'DAI': 'DAI'
            };

            const payload = {
                code: selectedCurrency,
                name: currencyName,
                symbol: symbolMap[selectedCurrency] || selectedCurrency,
                format: '{symbol} {amount}',
                decimal_places: 2,
                is_default: false
            };

            const response = await apiFetch('/api/currencies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                
                // Handle specific validation errors
                if (response.status === 422 && errorData.errors) {
                    const validationErrors = Object.values(errorData.errors).flat();
                    throw new Error(validationErrors.join(', '));
                }
                
                throw new Error(errorData.message || 'Failed to add currency');
            }

            const data = await response.json();
            
            toast({
                title: "Success",
                description: `${selectedCurrency} has been added successfully`,
                variant: "default",
            });

            onCurrencyAdded?.(data.currency);
            onClose();

        } catch (err) {
            console.error('Failed to add currency:', err);
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Handle adding custom currency
    const handleAddCustom = async () => {
        // Validate required fields
        if (!customCurrency.code || !customCurrency.name || !customCurrency.symbol) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        // Validate currency code format
        if (!/^[A-Z]{2,5}$/.test(customCurrency.code.toUpperCase())) {
            toast({
                title: "Error",
                description: "Currency code must be 2-5 letters",
                variant: "destructive",
            });
            return;
        }

        try {
            setSubmitting(true);
            
            const payload = {
                ...customCurrency,
                code: customCurrency.code.toUpperCase()
            };

            const response = await apiFetch('/api/currencies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                
                // Handle specific validation errors
                if (response.status === 422 && errorData.errors) {
                    const validationErrors = Object.values(errorData.errors).flat();
                    throw new Error(validationErrors.join(', '));
                }
                
                throw new Error(errorData.message || 'Failed to add currency');
            }

            const data = await response.json();
            
            toast({
                title: "Success",
                description: `${customCurrency.code.toUpperCase()} has been added successfully`,
                variant: "default",
            });

            onCurrencyAdded?.(data.currency);
            onClose();

        } catch (err) {
            console.error('Failed to add custom currency:', err);
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add New Currency
                    </DialogTitle>
                    <DialogDescription>
                        Add a new currency to your system from available currencies or create a custom one.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Mode Selection */}
                    <div className="flex gap-2">
                        <Button
                            variant={mode === 'api' ? 'default' : 'outline'}
                            onClick={() => setMode('api')}
                            className="flex-1"
                        >
                            <DollarSign className="h-4 w-4 mr-2" />
                            From Available List
                        </Button>
                        <Button
                            variant={mode === 'custom' ? 'default' : 'outline'}
                            onClick={() => setMode('custom')}
                            className="flex-1"
                        >
                            <Star className="h-4 w-4 mr-2" />
                            Custom Currency
                        </Button>
                    </div>

                    {error && (
                        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <AlertDescription className="text-red-800 dark:text-red-200">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {mode === 'api' && (
                        <div className="space-y-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search currencies..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center p-8">
                                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                                    <span className="ml-2 text-muted-foreground">Loading available currencies...</span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label>Available Currencies ({filteredCurrencies.length})</Label>
                                    <div className="max-h-60 overflow-y-auto border rounded-lg p-2 space-y-1">
                                        {filteredCurrencies.length === 0 ? (
                                            <div className="text-center py-4 text-muted-foreground">
                                                {Object.keys(availableCurrencies).length === 0 
                                                    ? 'All available currencies have been added'
                                                    : 'No currencies match your search'
                                                }
                                            </div>
                                        ) : (
                                            filteredCurrencies.map(([code, name]) => (
                                                <div
                                                    key={code}
                                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                                        selectedCurrency === code
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'hover:bg-muted'
                                                    }`}
                                                    onClick={() => setSelectedCurrency(code)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium">{code}</div>
                                                            <div className="text-sm opacity-80">{name}</div>
                                                        </div>
                                                        {selectedCurrency === code && (
                                                            <CheckCircle className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {mode === 'custom' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Currency Code *</Label>
                                    <Input
                                        id="code"
                                        placeholder="USD"
                                        value={customCurrency.code}
                                        onChange={(e) => setCustomCurrency(prev => ({
                                            ...prev,
                                            code: e.target.value.toUpperCase()
                                        }))}
                                        maxLength={5}
                                    />
                                    <div className="text-xs text-muted-foreground">
                                        2-5 character currency code (e.g., BTC, ETH, USD, USDT)
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="symbol">Symbol *</Label>
                                    <Input
                                        id="symbol"
                                        placeholder="$"
                                        value={customCurrency.symbol}
                                        onChange={(e) => setCustomCurrency(prev => ({
                                            ...prev,
                                            symbol: e.target.value
                                        }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Currency Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="US Dollar"
                                    value={customCurrency.name}
                                    onChange={(e) => setCustomCurrency(prev => ({
                                        ...prev,
                                        name: e.target.value
                                    }))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="format">Display Format</Label>
                                    <Select
                                        value={customCurrency.format}
                                        onValueChange={(value) => setCustomCurrency(prev => ({
                                            ...prev,
                                            format: value
                                        }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="{symbol} {amount}">$ 1,234.56</SelectItem>
                                            <SelectItem value="{amount} {symbol}">1,234.56 $</SelectItem>
                                            <SelectItem value="{symbol}{amount}">$1,234.56</SelectItem>
                                            <SelectItem value="{amount}{symbol}">1,234.56$</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="decimal_places">Decimal Places</Label>
                                    <Select
                                        value={customCurrency.decimal_places.toString()}
                                        onValueChange={(value) => setCustomCurrency(prev => ({
                                            ...prev,
                                            decimal_places: parseInt(value)
                                        }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">0</SelectItem>
                                            <SelectItem value="1">1</SelectItem>
                                            <SelectItem value="2">2</SelectItem>
                                            <SelectItem value="3">3</SelectItem>
                                            <SelectItem value="4">4</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_default"
                                    checked={customCurrency.is_default}
                                    onCheckedChange={(checked) => setCustomCurrency(prev => ({
                                        ...prev,
                                        is_default: checked
                                    }))}
                                />
                                <Label htmlFor="is_default" className="text-sm font-normal">
                                    Set as system default currency
                                </Label>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={mode === 'api' ? handleAddFromAPI : handleAddCustom}
                            disabled={submitting || (mode === 'api' && !selectedCurrency)}
                        >
                            {submitting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                            Add Currency
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddCurrencyModal;