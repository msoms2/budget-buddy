import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from './Components/Layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeftIcon,
  ReceiptIcon,
  UserIcon,
  CalendarIcon,
  DollarSignIcon,
  TagIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ActivityIcon,
  UsersIcon,
  AlertCircleIcon,
  SearchIcon,
  FilterIcon,
  ChevronDown,
  ArrowUpRightIcon,
  PieChartIcon,
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency.jsx";
import { cn } from "@/lib/utils";

export default function Transactions({ auth, transactions, statistics: backendStatistics, filters, categories, users }) {
    // Use the centralized currency hook
    const { formatCurrency } = useCurrency();
    
    // State for filters
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [typeFilter, setTypeFilter] = useState(filters?.type || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters?.category_id || 'all');
    const [userFilter, setUserFilter] = useState(filters?.user_id || 'all');
    const [amountMinFilter, setAmountMinFilter] = useState(filters?.amount_min || '');
    const [amountMaxFilter, setAmountMaxFilter] = useState(filters?.amount_max || '');
    const [sortField, setSortField] = useState(filters?.sort_field || 'date');
    const [sortDirection, setSortDirection] = useState(filters?.sort_direction || 'desc');

    // Check if transactions exists and has the expected properties
    const hasTransactions = transactions && transactions.data && Array.isArray(transactions.data);
    const hasPagination = transactions && transactions.from && transactions.to && transactions.total;
    
    // Calculate statistics from transaction data
    const statistics = useMemo(() => {
        if (!backendStatistics) {
            return {
                totalTransactions: 0,
                totalVolume: 0,
                activeUsers: 0,
                recentActivity: 0,
                incomeTransactions: 0,
                expenseTransactions: 0,
                averageTransaction: 0
            };
        }

        // Log statistics for debugging
        console.log('Backend statistics:', backendStatistics);
        console.log('Total volume type:', typeof backendStatistics.total_volume, 'Value:', backendStatistics.total_volume);
        
        return {
            totalTransactions: backendStatistics.total_count ?? 0,
            totalVolume: parseFloat(backendStatistics.total_volume) || 0,
            activeUsers: hasTransactions ? new Set(transactions.data.map(t => t.user_id)).size : 0,
            recentActivity: backendStatistics.recent_activity ?? 0,
            incomeTransactions: backendStatistics.total_income ?? 0,
            expenseTransactions: backendStatistics.total_expenses ?? 0,
            averageTransaction: backendStatistics.total_count > 0
                ? parseFloat(backendStatistics.total_volume) / backendStatistics.total_count
                : 0
        };
    }, [transactions, backendStatistics, hasTransactions]);

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Handle filter changes
    const applyFilters = () => {
        let url = route('admin.transactions');
        let params = {};
        
        if (searchTerm) params.search = searchTerm;
        if (typeFilter !== 'all') params.type = typeFilter;
        if (categoryFilter && categoryFilter !== 'all') params.category_id = categoryFilter;
        if (userFilter && userFilter !== 'all') params.user_id = userFilter;
        if (amountMinFilter) params.amount_min = amountMinFilter;
        if (amountMaxFilter) params.amount_max = amountMaxFilter;
        if (sortField) params.sort_field = sortField;
        if (sortDirection) params.sort_direction = sortDirection;
        
        if (Object.keys(params).length > 0) {
            url += '?' + new URLSearchParams(params).toString();
        }
        
        window.location.href = url;
    };

    // Handle filter reset
    const resetFilters = () => {
        setSearchTerm('');
        setTypeFilter('all');
        setCategoryFilter('all');
        setUserFilter('all');
        setAmountMinFilter('');
        setAmountMaxFilter('');
        setSortField('date');
        setSortDirection('desc');
        window.location.href = route('admin.transactions');
    };

    // Handle sorting
    const toggleSort = (field) => {
        const newSortField = field;
        const newSortDirection = (sortField === field && sortDirection === 'desc') ? 'asc' : 'desc';
        
        setSortField(newSortField);
        setSortDirection(newSortDirection);
        
        let url = route('admin.transactions');
        let params = new URLSearchParams(window.location.search);
        
        params.set('sort_field', newSortField);
        params.set('sort_direction', newSortDirection);
        
        url += '?' + params.toString();
        window.location.href = url;
    };

    // Define breadcrumbs for AdminLayout
    const breadcrumbs = [
        {
            label: 'Transaction Management',
            icon: ReceiptIcon
        }
    ];

    return (
        <AdminLayout
            title="Transaction Management"
            breadcrumbs={breadcrumbs}
        >
            {hasTransactions && transactions.data.length > 0 ? (
                <>
                    {/* Summary Statistics Cards */}
                    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                        {/* Total Transactions Card */}
                        <Card className="bg-blue-50 dark:bg-blue-900/20">
                            <CardHeader className="relative">
                                <CardDescription>Total Transactions</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">
                                    {statistics.totalTransactions.toLocaleString()}
                                </CardTitle>
                                <div className="absolute right-4 top-4">
                                    <Badge variant="outline" className="flex gap-1 rounded-lg text-xs text-blue-600 dark:text-blue-400">
                                        <ReceiptIcon className="size-3" />
                                        Total
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardFooter className="flex-col items-start gap-1 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    <ReceiptIcon className="h-4 w-4 text-blue-500" />
                                    All transactions
                                </div>
                            </CardFooter>
                        </Card>

                        {/* Total Volume Card */}
                        <Card className="bg-emerald-50 dark:bg-emerald-900/20">
                            <CardHeader className="relative">
                                <CardDescription>Total Volume</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">
                                    {formatCurrency(Number(statistics.totalVolume))}
                                </CardTitle>
                                <div className="absolute right-4 top-4">
                                    <Badge variant="outline" className="flex gap-1 rounded-lg text-xs text-emerald-600 dark:text-emerald-400">
                                        <DollarSignIcon className="size-3" />
                                        Volume
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardFooter className="flex-col items-start gap-1 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    <DollarSignIcon className="h-4 w-4 text-emerald-500" />
                                    Combined value
                                </div>
                            </CardFooter>
                        </Card>

                        {/* Active Users Card */}
                        <Card className="bg-violet-50 dark:bg-violet-900/20">
                            <CardHeader className="relative">
                                <CardDescription>Active Users</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">
                                    {statistics.activeUsers}
                                </CardTitle>
                                <div className="absolute right-4 top-4">
                                    <Badge variant="outline" className="flex gap-1 rounded-lg text-xs text-violet-600 dark:text-violet-400">
                                        <UsersIcon className="size-3" />
                                        Users
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardFooter className="flex-col items-start gap-1 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    <UsersIcon className="h-4 w-4 text-violet-500" />
                                    With transactions
                                </div>
                            </CardFooter>
                        </Card>

                        {/* Recent Activity Card */}
                        <Card className="bg-amber-50 dark:bg-amber-900/20">
                            <CardHeader className="relative">
                                <CardDescription>Recent Activity</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">
                                    {statistics.recentActivity}
                                </CardTitle>
                                <div className="absolute right-4 top-4">
                                    <Badge variant="outline" className="flex gap-1 rounded-lg text-xs text-amber-600 dark:text-amber-400">
                                        <ActivityIcon className="size-3" />
                                        Last 7 days
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardFooter className="flex-col items-start gap-1 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    <ActivityIcon className="h-4 w-4 text-amber-500" />
                                    Recent transactions
                                </div>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Main Content Card */}
                    <Card className="flex-1">
                        <CardHeader className="space-y-4">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <ReceiptIcon className="h-5 w-5" />
                                        All Transactions
                                    </CardTitle>
                                    <CardDescription>
                                        {hasPagination ? 
                                            `Showing ${transactions.from} to ${transactions.to} of ${transactions.total} transactions` : 
                                            "Comprehensive view of all financial transactions"
                                        }
                                    </CardDescription>
                                </div>
                                
                                {/* Transaction Type Summary */}
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        <TrendingUpIcon className="h-3 w-3 mr-1" />
                                        {backendStatistics.total_income || 0} Income
                                    </Badge>
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                        <TrendingDownIcon className="h-3 w-3 mr-1" />
                                        {backendStatistics.total_expenses || 0} Expenses
                                    </Badge>
                                </div>
                            </div>

                            {/* Enhanced Filters */}
                            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2">
                                <div className="relative flex-1">
                                    <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search transactions..."
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                    />
                                </div>
                                
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="expense">Expenses</SelectItem>
                                        <SelectItem value="income">Income</SelectItem>
                                    </SelectContent>
                                </Select>

                                {categories && categories.length > 0 && (
                                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                {users && users.length > 0 && (
                                    <Select value={userFilter} onValueChange={setUserFilter}>
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue placeholder="All Users" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Users</SelectItem>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                
                                <Button variant="outline" size="sm" onClick={resetFilters}>
                                    Reset
                                </Button>
                                
                                <Button variant="default" size="sm" className="bg-black text-white" onClick={applyFilters}>
                                    <FilterIcon className="h-4 w-4 mr-2" />
                                    Apply
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                                        <TableHead className="cursor-pointer w-[15%]" onClick={() => toggleSort('date')}>
                                            <div className="flex items-center">
                                                Date
                                                {sortField === 'date' && (
                                                    <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform",
                                                        sortDirection === 'asc' ? 'rotate-180' : '')} />
                                                )}
                                            </div>
                                        </TableHead>
                                        <TableHead className="w-[25%]">Description</TableHead>
                                        <TableHead className="w-[15%]">User</TableHead>
                                        <TableHead className="w-[15%]">Category</TableHead>
                                        <TableHead className="cursor-pointer w-[15%]" onClick={() => toggleSort('amount')}>
                                            <div className="flex items-center">
                                                Amount
                                                {sortField === 'amount' && (
                                                    <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform",
                                                        sortDirection === 'asc' ? 'rotate-180' : '')} />
                                                )}
                                            </div>
                                        </TableHead>
                                        <TableHead className="w-[15%]">Type</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.data.map((transaction) => (
                                        <TableRow key={transaction.id} className="hover:bg-muted/50">
                                            <TableCell className="flex items-center gap-2">
                                                <div className="flex items-center">
                                                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    {formatDate(transaction.date)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px]">
                                                <div className="font-medium truncate">
                                                    {transaction.name || transaction.description}
                                                </div>
                                                {transaction.description && transaction.name && (
                                                    <div className="text-sm text-muted-foreground truncate">
                                                        {transaction.description}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="size-7 bg-muted rounded-full flex items-center justify-center">
                                                        <UserIcon className="size-3.5 text-muted-foreground" />
                                                    </div>
                                                    <span className="font-medium truncate">{transaction.user_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <TagIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                                    <span className="truncate">{transaction.category}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className={`font-medium ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                                                <div className="flex items-center">
                                                    <DollarSignIcon className="mr-1 h-4 w-4" />
                                                    {transaction.type === 'expense' ? '-' : '+'}
                                                    {formatCurrency(Math.abs(transaction.amount))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant="outline" 
                                                    className={transaction.type === 'expense' ? 
                                                        'bg-red-50 text-red-700 border-red-200' : 
                                                        'bg-green-50 text-green-700 border-green-200'
                                                    }
                                                >
                                                    {transaction.type === 'expense' ? 'Expense' : 'Income'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            
                            {transactions?.links && transactions.total > 0 && (
                                <div className="flex items-center justify-between p-4 border-t">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {transactions.from} to {transactions.to} of {transactions.total} transactions
                                    </p>
                                    <div className="flex gap-1">
                                        {transactions.links.map((link, i) => (
                                            <React.Fragment key={i}>
                                                {link.url ? (
                                                    <Button
                                                        variant={link.active ? "default" : "outline"}
                                                        size="sm"
                                                        className={link.active ? "bg-black text-white" : ""}
                                                        onClick={() => window.location.href = link.url}
                                                    >
                                                        {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                                    </Button>
                                                ) : (
                                                    <Button variant="outline" size="sm" disabled>
                                                        {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                                    </Button>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <div className="rounded-full bg-gradient-to-br from-blue-50 to-purple-50 p-8 mb-6">
                        <ReceiptIcon className="h-20 w-20 text-blue-600" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                        No Transactions Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 mb-8 max-w-lg text-lg">
                        There are currently no transactions in the system. Check back later or adjust your filters.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <AdminLayout.BackButton />
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
