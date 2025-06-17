import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
    Plus, 
    RefreshCw, 
    AlertCircle, 
    MoreHorizontal,
    Star,
    Trash2,
    Edit,
    DollarSign,
    TrendingUp,
    Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/Utils/api.js';
import AddCurrencyModal from './AddCurrencyModal';

const CurrencyManagement = () => {
    const [currencies, setCurrencies] = useState([]);
    const [defaultCurrency, setDefaultCurrency] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [updatingRates, setUpdatingRates] = useState(false);
    const { toast } = useToast();

    // Fetch currencies data
    const fetchCurrencies = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiFetch('/api/currencies');
            if (!response.ok) throw new Error('Failed to fetch currencies');
            
            const data = await response.json();
            setCurrencies(data.currencies || []);
            setDefaultCurrency(data.default_currency);
        } catch (err) {
            console.error('Failed to fetch currencies:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Update exchange rates
    const updateExchangeRates = async () => {
        try {
            setUpdatingRates(true);
            const response = await apiFetch('/api/currencies/update-rates', {
                method: 'POST'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update exchange rates');
            }
            
            const data = await response.json();
            
            // Safely access the result data
            const updatedCount = data.result?.updated?.length || 0;
            const failedCount = data.result?.failed?.length || 0;
            
            let description = `Updated rates for ${updatedCount} currencies`;
            if (failedCount > 0) {
                description += `, ${failedCount} failed`;
            }
            
            toast({
                title: "Success",
                description,
                variant: "default",
            });

            // Refresh currencies data
            await fetchCurrencies();

        } catch (err) {
            console.error('Failed to update exchange rates:', err);
            toast({
                title: "Error",
                description: err.message || 'Failed to update exchange rates',
                variant: "destructive",
            });
        } finally {
            setUpdatingRates(false);
        }
    };

    // Set default currency
    const setAsDefault = async (currencyId) => {
        try {
            const response = await apiFetch('/api/currencies/set-default', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ currency_id: currencyId }),
            });

            if (!response.ok) throw new Error('Failed to set default currency');
            
            toast({
                title: "Success",
                description: "Default currency updated successfully",
                variant: "default",
            });

            await fetchCurrencies();

        } catch (err) {
            console.error('Failed to set default currency:', err);
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            });
        }
    };


    // Delete currency
    const deleteCurrency = async (currencyId, currencyCode) => {
        if (!confirm(`Are you sure you want to delete ${currencyCode}? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await apiFetch(`/api/currencies/${currencyId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete currency');
            }
            
            toast({
                title: "Success",
                description: `${currencyCode} has been deleted successfully`,
                variant: "default",
            });

            await fetchCurrencies();

        } catch (err) {
            console.error('Failed to delete currency:', err);
            toast({
                title: "Error",
                description: err.message,
                variant: "destructive",
            });
        }
    };

    // Handle currency added
    const handleCurrencyAdded = (newCurrency) => {
        fetchCurrencies();
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString();
    };

    // Format exchange rate
    const formatRate = (rate) => {
        return parseFloat(rate).toFixed(4);
    };

    useEffect(() => {
        fetchCurrencies();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Currency Management</CardTitle>
                                <CardDescription>
                                    Manage system currencies, exchange rates, and default settings
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={updateExchangeRates}
                                disabled={updatingRates}
                            >
                                {updatingRates ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                )}
                                Update Rates
                            </Button>
                            <Button onClick={() => setShowAddModal(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Currency
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <AlertDescription className="text-red-800 dark:text-red-200">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-muted-foreground">Loading currencies...</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">{currencies.length}</div>
                                    <div className="text-sm text-muted-foreground">Total Currencies</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {defaultCurrency?.code || 'None'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">System Default</div>
                                </div>
                            </div>

                            {/* Currencies Table */}
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Currency</TableHead>
                                            <TableHead>Symbol</TableHead>
                                            <TableHead>Exchange Rate</TableHead>
                                            <TableHead>Last Updated</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-[70px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currencies.map((currency) => (
                                            <TableRow key={currency.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{currency.code}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {currency.name}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono">{currency.symbol}</span>
                                                </TableCell>
                                                <TableCell>
                                                    {currency.is_default ? (
                                                        <Badge variant="secondary">Base (1.0000)</Badge>
                                                    ) : (
                                                        <span className="font-mono">
                                                            {formatRate(currency.exchange_rate)}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">
                                                            {formatDate(currency.last_updated)}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {currency.is_default && (
                                                            <Badge variant="default">
                                                                <Star className="h-3 w-3 mr-1" />
                                                                System Default
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {!currency.is_default && (
                                                                <DropdownMenuItem
                                                                    onClick={() => setAsDefault(currency.id)}
                                                                >
                                                                    <Star className="h-4 w-4 mr-2" />
                                                                    Set as System Default
                                                                </DropdownMenuItem>
                                                            )}
                                                            {!currency.is_default && (
                                                                <DropdownMenuItem
                                                                    onClick={() => deleteCurrency(currency.id, currency.code)}
                                                                    className="text-red-600 dark:text-red-400"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Currency Modal */}
            <AddCurrencyModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onCurrencyAdded={handleCurrencyAdded}
            />
        </div>
    );
};

export default CurrencyManagement;