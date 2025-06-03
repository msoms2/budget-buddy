import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DataTable from "@/Pages/Admin/Components/Shared/DataTable";
import FilterPanel from "@/Pages/Admin/Components/Shared/FilterPanel";
import {
    HistoryIcon,
    SearchIcon,
    FilterIcon,
    DownloadIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    CalendarIcon,
    CreditCardIcon
} from "lucide-react";

/**
 * UserTransactions Component
 * 
 * Displays user's transaction history with filtering and search capabilities:
 * - Transaction list with pagination
 * - Advanced filtering options
 * - Search functionality
 * - Transaction type categorization
 * - Export capabilities
 */
export default function UserTransactions({ user, transactions = [], categories = [], paymentMethods = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: user.currency?.code || 'USD'
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get transaction type badge
    const getTransactionTypeBadge = (type) => {
        const configs = {
            income: { variant: 'default', icon: TrendingUpIcon, className: 'bg-green-100 text-green-800' },
            expense: { variant: 'destructive', icon: TrendingDownIcon, className: 'bg-red-100 text-red-800' },
            transfer: { variant: 'secondary', icon: CreditCardIcon, className: 'bg-blue-100 text-blue-800' }
        };
        
        const config = configs[type] || configs.expense;
        const Icon = config.icon;
        
        return (
            <Badge variant={config.variant} className={`${config.className} flex items-center gap-1`}>
                <Icon className="h-3 w-3" />
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
        );
    };

    // Filter transactions based on current filters
    const filteredTransactions = transactions.filter(transaction => {
        // Search filter
        if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }
        
        // Type filter
        if (selectedType !== 'all' && transaction.type !== selectedType) {
            return false;
        }
        
        // Category filter
        if (selectedCategory !== 'all' && transaction.category_id !== parseInt(selectedCategory)) {
            return false;
        }
        
        // Payment method filter
        if (selectedPaymentMethod !== 'all' && transaction.payment_method_id !== parseInt(selectedPaymentMethod)) {
            return false;
        }
        
        // Date range filter
        if (dateRange !== 'all') {
            const transactionDate = new Date(transaction.date);
            const now = new Date();
            let startDate;
            
            switch (dateRange) {
                case 'week':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'quarter':
                    startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                    break;
                case 'year':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
                default:
                    return true;
            }
            
            if (transactionDate < startDate) {
                return false;
            }
        }
        
        return true;
    });

    // Table columns configuration
    const columns = [
        {
            key: 'date',
            title: 'Date',
            render: (transaction) => (
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(transaction.date)}</span>
                </div>
            )
        },
        {
            key: 'description',
            title: 'Description',
            render: (transaction) => (
                <div>
                    <p className="font-medium">{transaction.description}</p>
                    {transaction.notes && (
                        <p className="text-sm text-muted-foreground">{transaction.notes}</p>
                    )}
                </div>
            )
        },
        {
            key: 'type',
            title: 'Type',
            render: (transaction) => getTransactionTypeBadge(transaction.type)
        },
        {
            key: 'category',
            title: 'Category',
            render: (transaction) => (
                <Badge variant="outline">
                    {transaction.category?.name || 'Uncategorized'}
                </Badge>
            )
        },
        {
            key: 'amount',
            title: 'Amount',
            render: (transaction) => (
                <span className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 
                    transaction.type === 'expense' ? 'text-red-600' : 
                    'text-blue-600'
                }`}>
                    {transaction.type === 'expense' ? '-' : '+'}
                    {formatCurrency(Math.abs(transaction.amount))}
                </span>
            )
        },
        {
            key: 'payment_method',
            title: 'Payment Method',
            render: (transaction) => (
                <Badge variant="secondary">
                    {transaction.payment_method?.name || 'N/A'}
                </Badge>
            )
        }
    ];

    // Filter options
    const filterOptions = [
        {
            key: 'search',
            label: 'Search',
            type: 'search',
            value: searchTerm,
            onChange: setSearchTerm,
            placeholder: 'Search transactions...'
        },
        {
            key: 'type',
            label: 'Type',
            type: 'select',
            value: selectedType,
            onChange: setSelectedType,
            options: [
                { value: 'all', label: 'All Types' },
                { value: 'income', label: 'Income' },
                { value: 'expense', label: 'Expense' },
                { value: 'transfer', label: 'Transfer' }
            ]
        },
        {
            key: 'category',
            label: 'Category',
            type: 'select',
            value: selectedCategory,
            onChange: setSelectedCategory,
            options: [
                { value: 'all', label: 'All Categories' },
                ...categories
                    .filter(cat => cat && cat.id && cat.name)
                    .map(cat => ({ value: cat.id.toString(), label: cat.name }))
            ]
        },
        {
            key: 'payment_method',
            label: 'Payment Method',
            type: 'select',
            value: selectedPaymentMethod,
            onChange: setSelectedPaymentMethod,
            options: [
                { value: 'all', label: 'All Methods' },
                ...paymentMethods
                    .filter(pm => pm && pm.id && pm.name)
                    .map(pm => ({ value: pm.id.toString(), label: pm.name }))
            ]
        },
        {
            key: 'date_range',
            label: 'Date Range',
            type: 'select',
            value: dateRange,
            onChange: setDateRange,
            options: [
                { value: 'all', label: 'All Time' },
                { value: 'week', label: 'Last Week' },
                { value: 'month', label: 'This Month' },
                { value: 'quarter', label: 'Last 3 Months' },
                { value: 'year', label: 'This Year' }
            ]
        }
    ];

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedType('all');
        setSelectedCategory('all');
        setSelectedPaymentMethod('all');
        setDateRange('all');
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-3">
                            <HistoryIcon className="h-5 w-5" />
                            Transaction History
                        </CardTitle>
                        <CardDescription>
                            Complete history of user's financial transactions
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <FilterIcon className="h-4 w-4" />
                            Filters
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <DownloadIcon className="h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Filter Panel */}
                    {showFilters && (
                        <FilterPanel
                            filters={filterOptions}
                            onClear={clearFilters}
                            className="border rounded-lg p-4"
                        />
                    )}

                    {/* Transaction Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Total Transactions</p>
                            <p className="text-2xl font-bold">{filteredTransactions.length}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Total Income</p>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(
                                    filteredTransactions
                                        .filter(t => t.type === 'income')
                                        .reduce((sum, t) => sum + t.amount, 0)
                                )}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Total Expenses</p>
                            <p className="text-2xl font-bold text-red-600">
                                {formatCurrency(
                                    filteredTransactions
                                        .filter(t => t.type === 'expense')
                                        .reduce((sum, t) => sum + t.amount, 0)
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <DataTable
                        data={filteredTransactions}
                        columns={columns}
                        searchable={false} // We handle search in filters
                        sortable={true}
                        pagination={true}
                        emptyMessage="No transactions found for this user."
                        className="border-0"
                    />
                </div>
            </CardContent>
        </Card>
    );
}