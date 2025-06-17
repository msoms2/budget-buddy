import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, RefreshCw, AlertCircle, UserIcon } from 'lucide-react';
import { apiFetch } from '@/Utils/api.js';
import CurrencyManagement from '@/components/CurrencyManagement';
import UserCurrencyPreference from '@/components/UserCurrencyPreference';

export default function Currency() {
    const [currencyStats, setCurrencyStats] = useState({ total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch currency statistics
    const fetchCurrencyStats = async () => {
        try {
            setLoading(true);
            const response = await apiFetch('/api/currencies');
            if (!response.ok) throw new Error('Failed to fetch currency data');
            
            const data = await response.json();
            setCurrencyStats({
                total: data.currencies?.length || 0
            });
            setError(null);
        } catch (err) {
            console.error('Failed to fetch currency stats:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrencyStats();
    }, []);

    return (
        <div className="space-y-6">
            {/* Personal Currency Preference */}
            <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Your Currency Preference</CardTitle>
                                <CardDescription>
                                    Set your personal currency preference for displaying amounts
                                </CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <UserCurrencyPreference />
                </CardContent>
            </Card>

            {/* Currency Overview Card */}
            <Card className="border-emerald-200 dark:border-emerald-800">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                                <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">System Currency Management</CardTitle>
                                <CardDescription>
                                    Manage system currencies, exchange rates, and default currency settings
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {!loading && (
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground">
                                        {currencyStats.total} currencies available
                                    </div>
                                </div>
                            )}
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
                            <span className="ml-2 text-muted-foreground">Loading currency settings...</span>
                        </div>
                    ) : (
                        <div className="mt-6">
                            <CurrencyManagement />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}