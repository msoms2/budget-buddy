import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import TransactionsPdfDialog from '@/components/Reports/TransactionsPdfDialog';
import ExtensionWarningBanner from '@/components/ExtensionWarningBanner';
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FilterIcon,
  ChevronDown,
  CalendarIcon,
  DollarSign,
  Plus,
  Receipt, // Added
  SearchIcon,
  TagIcon,
  Tags, // Added
  MoreHorizontal,
  ArrowUpDown,
  CheckIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  ActivityIcon,
  // ReceiptIcon, // Removed as new empty state uses Receipt
  ArrowUpRightIcon,
  PieChartIcon,
} from "lucide-react";
import { format } from 'date-fns';
import { useTransactionSheet } from "@/hooks/use-transaction-sheet";
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast.js';
import { useCurrency } from '@/hooks/useCurrency.jsx';
import axios from 'axios';
import { cn } from '@/lib/utils';

export default function Index({
  auth,
  transactions,
  filters,
  categories,
  users = [],
  stats = {
    transactions: { income: 0, expenses: 0 }
  },
  sortField,
  sortDirection,
  currencies = [],
  paymentMethods = []
}) {
  // Add debug logging for props
  console.log('Received props:', { auth, transactions, filters, categories, users, stats });

  // Data structure validation function
  const validateStats = (stats) => {
    if (!stats) return false;
    return (
      stats.transactions?.income !== undefined &&
      stats.transactions?.expenses !== undefined
    );
  };

  // Ensure stats has default structure and validate
  const safeStats = validateStats(stats) ? stats : {
    transactions: { income: 0, expenses: 0 }
  };

  // Add debug logging for validation
  console.log('Stats validation result:', validateStats(stats));
  console.log('Using stats:', safeStats);
  const { toast } = useToast();
  const { flash = {} } = usePage().props;

  const { formatCurrency, currency } = useCurrency();

  // Transaction states
  const [searchTerm, setSearchTerm] = useState(filters?.search || "");
  const [typeFilter, setTypeFilter] = useState(filters?.type || "all");
  const [categoryFilter, setCategoryFilter] = useState(filters?.category_id || "");
  const [userFilter, setUserFilter] = useState(filters?.user_id || "");
  const [amountMinFilter, setAmountMinFilter] = useState(filters?.amount_min || "");
  const [amountMaxFilter, setAmountMaxFilter] = useState(filters?.amount_max || "");
  const [startDate, setStartDate] = useState(filters?.start_date ? new Date(filters.start_date) : null);
  const [endDate, setEndDate] = useState(filters?.end_date ? new Date(filters.end_date) : null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [transactionSortField, setTransactionSortField] = useState(filters?.sort_field || "date");
  const [transactionSortDirection, setTransactionSortDirection] = useState(filters?.sort_direction || "desc");
  const [showPdfDialog, setShowPdfDialog] = useState(false);

  // Initialize transaction sheet
  const { openSheet, transactionSheet } = useTransactionSheet();

  const openTransactionModal = () => {
    openSheet({
      transactionType: 'expense', // Default to expense, similar to previous empty state button
      categories: categories.filter(c => c.category_type === 'expense'),
      allCategories: categories,
      sourcePage: 'transactions',
      currencies,
      paymentMethods,
      onSuccess: () => router.reload()
    });
  };

  // Show toast for flash messages
  React.useEffect(() => {
    if (flash?.success) {
      toast({
        title: "Success",
        description: flash.success,
        variant: "success",
      });
    } else if (flash?.error) {
      toast({
        title: "Error",
        description: flash.error,
        variant: "destructive",
      });
    }
  }, [flash]);


  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return 'Invalid Date'; // Or return an empty string, or handle as needed
    }
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  };

  // Transaction filter functions
  const applyFilters = () => {
    let url = route('transactions.index');
    let params = {};
    
    // Add filters only if they have values
    if (searchTerm) params.search = searchTerm;
    if (typeFilter !== 'all') params.type = typeFilter;
    if (categoryFilter) params.category_id = categoryFilter;
    if (amountMinFilter) params.amount_min = amountMinFilter;
    if (amountMaxFilter) params.amount_max = amountMaxFilter;
    if (transactionSortField) params.sort_by = transactionSortField;
    if (transactionSortDirection) params.sort_direction = transactionSortDirection;
    
    // Log the parameters being sent for debugging
    console.log('Applying filters with params:', params);
    
    router.get(url, params);
  };

  const resetFilters = () => {
    // Reset all filter states
    setSearchTerm("");
    setTypeFilter("all");
    setCategoryFilter("");
    setUserFilter("");
    setAmountMinFilter("");
    setAmountMaxFilter("");
    setStartDate(null);
    setEndDate(null);
    setTransactionSortField("date");
    setTransactionSortDirection("desc");
    
    // Navigate to transactions page with no filters
    router.get(route('transactions.index'));
  };

  // Sort handlers
  const toggleTransactionSort = (field) => {
    const newSortField = field;
    const newSortDirection = (transactionSortField === field && transactionSortDirection === 'desc') ? 'asc' : 'desc';
    
    setTransactionSortField(newSortField);
    setTransactionSortDirection(newSortDirection);
    
    // Apply sorting immediately
    let url = route('transactions.index');
    let params = {
      sort_by: newSortField,
      sort_direction: newSortDirection
    };
    
    // Maintain existing filters when sorting
    if (searchTerm) params.search = searchTerm;
    if (typeFilter !== 'all') params.type = typeFilter;
    if (categoryFilter) params.category_id = categoryFilter;
    if (amountMinFilter) params.amount_min = amountMinFilter;
    if (amountMaxFilter) params.amount_max = amountMaxFilter;
    
    console.log('Applying sort with params:', params);
    router.get(url, params);
  };

  // Calculate additional stats for summary cards
  const totalTransactions = transactions?.total || 0;
  const currentBalance = (safeStats?.transactions?.income || 0) - (safeStats?.transactions?.expenses || 0);
  const balanceChange = currentBalance >= 0 ? 'positive' : 'negative';

  return (
    <div>
      <SidebarProvider>
        <Head title="Transactions" />
        <AppSidebar />
        
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Transactions</BreadcrumbPage>
                  </BreadcrumbItem>
              </Breadcrumb>
            </div>
            <div className="flex gap-4 px-4">
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => openSheet({
                transactionType: typeFilter === 'income' ? 'earning' : 'expense',
                categories: categories.filter(c => c.category_type === (typeFilter === 'income' ? 'earning' : 'expense')),
                allCategories: categories,
                sourcePage: 'transactions',
                currencies,
                paymentMethods,
                onSuccess: () => router.reload()
              })}>
                <Plus className="h-4 w-4 mr-2" />
                New Transaction
              </Button>
            </div>
          </header>
          
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {/* Extension Warning Banner */}
            <ExtensionWarningBanner />

            {transactions?.data && transactions.data.length > 0 ? (
              <>
                {/* Summary Statistics Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                  {/* Total Income Card */}
                  <Card className="bg-green-50 dark:bg-green-900/20">
                    <CardHeader className="relative">
                      <CardDescription>Total Income</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">
                        {(() => {
                          try {
                            return formatCurrency(safeStats?.transactions?.income || 0);
                          } catch (error) {
                            console.error('Error formatting income:', error);
                            return `${safeStats?.transactions?.income || 0}`;
                          }
                        })()}
                      </CardTitle>
                      <div className="absolute right-4 top-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs text-green-600 dark:text-green-400">
                          <TrendingUpIcon className="size-3" />
                          Income
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        <TrendingUpIcon className="h-4 w-4 text-green-500" />
                        Earnings this period
                      </div>
                    </CardFooter>
                  </Card>

                  {/* Total Expenses Card */}
                  <Card className="bg-red-50 dark:bg-red-900/20">
                    <CardHeader className="relative">
                      <CardDescription>Total Expenses</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">
                        {(() => {
                          try {
                            return formatCurrency(safeStats?.transactions?.expenses || 0);
                          } catch (error) {
                            console.error('Error formatting expenses:', error);
                            return `${safeStats?.transactions?.expenses || 0}`;
                          }
                        })()}
                      </CardTitle>
                      <div className="absolute right-4 top-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs text-red-600 dark:text-red-400">
                          <TrendingDownIcon className="size-3" />
                          Expenses
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        <TrendingDownIcon className="h-4 w-4 text-red-500" />
                        Spending this period
                      </div>
                    </CardFooter>
                  </Card>

                  {/* Net Balance Card */}
                  <Card className={`${currentBalance >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
                    <CardHeader className="relative">
                      <CardDescription>Net Balance</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">
                        {(() => {
                          try {
                            return formatCurrency(currentBalance);
                          } catch (error) {
                            console.error('Error formatting balance:', error);
                            return `${currentBalance}`;
                          }
                        })()}
                      </CardTitle>
                      <div className="absolute right-4 top-4">
                        <Badge variant="outline" className={`flex gap-1 rounded-lg text-xs ${currentBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                          {currentBalance >= 0 ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
                          {balanceChange}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        {currentBalance >= 0 ? (
                          <>
                            <TrendingUpIcon className="h-4 w-4 text-blue-500" />
                            Positive cash flow
                          </>
                        ) : (
                          <>
                            <TrendingDownIcon className="h-4 w-4 text-orange-500" />
                            Monitor spending
                          </>
                        )}
                      </div>
                    </CardFooter>
                  </Card>

                  {/* Total Transactions Count Card */}
                  <Card className="bg-purple-50 dark:bg-purple-900/20">
                    <CardHeader className="relative">
                      <CardDescription>Total Transactions</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">
                        {totalTransactions.toLocaleString()}
                      </CardTitle>
                      <div className="absolute right-4 top-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs text-purple-600 dark:text-purple-400">
                          <ActivityIcon className="size-3" />
                          Activity
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                        <ActivityIcon className="h-4 w-4 text-purple-500" />
                        Financial activity
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
                          <PieChartIcon className="h-5 w-5" />
                          Transaction History
                        </CardTitle>
                        <CardDescription>
                          {transactions?.total ? 
                            `Showing ${transactions.from} to ${transactions.to} of ${transactions.total} transactions` : 
                            "Manage your financial transactions"
                          }
                        </CardDescription>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/statistics" className="flex items-center gap-1">
                            <PieChartIcon className="h-4 w-4" />
                            View Analytics
                            <ArrowUpRightIcon className="h-3 w-3" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/categories" className="flex items-center gap-1">
                            <TagIcon className="h-4 w-4" />
                            Manage Categories
                            <ArrowUpRightIcon className="h-3 w-3" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPdfDialog(true)}
                          className="flex items-center gap-1"
                        >
                          <PieChartIcon className="h-4 w-4" />
                          Generate Report
                          <ArrowUpRightIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Enhanced Filters */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
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
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="expense">Expenses</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                        </SelectContent>
                      </Select>
                      
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
                    {(!transactions?.data || transactions.data.length === 0) ? (
                      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <div className="rounded-full bg-gradient-to-br from-green-50 to-blue-50 p-8 mb-6">
                          <Receipt className="h-20 w-20 text-green-600" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                          Start Tracking Your Transactions
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 mb-8 max-w-lg text-lg">
                          Begin your financial journey by recording your income and expenses. Track your spending patterns and take control of your finances.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button
                            size="lg"
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                            onClick={openTransactionModal}
                          >
                            <Plus className="h-5 w-5" />
                            Add Your First Transaction
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={() => router.visit(route('categories.index'))}
                          >
                            <Tags className="h-5 w-5 mr-2" />
                            Manage Categories
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                              <TableHead className="cursor-pointer w-[15%]" onClick={() => toggleTransactionSort('date')}>
                                <div className="flex items-center">
                                  Date
                                  {transactionSortField === 'date' && (
                                    <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform",
                                      transactionSortDirection === 'asc' ? 'rotate-180' : '')} />
                                  )}
                                </div>
                              </TableHead>
                              <TableHead className="w-[35%]">Description</TableHead>
                              <TableHead className="w-[20%]">Category</TableHead>
                              <TableHead className="cursor-pointer w-[15%]" onClick={() => toggleTransactionSort('amount')}>
                                <div className="flex items-center">
                                  Amount
                                  {transactionSortField === 'amount' && (
                                    <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform",
                                      transactionSortDirection === 'asc' ? 'rotate-180' : '')} />
                                  )}
                                </div>
                              </TableHead>
                              <TableHead className="w-[15%]">Type</TableHead>
                              <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transactions.data.map((transaction) => (
                              <TableRow key={transaction.id} className="hover:bg-muted/50 group relative">
                                <TableCell className="flex items-center gap-2">
                                  <div className="flex items-center">
                                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                    {formatDate(transaction.date)}
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-[300px]">
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
                                  <div className="flex items-center">
                                    <TagIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span className="truncate">{transaction.category}</span>
                                  </div>
                                </TableCell>
                                <TableCell className={`font-medium ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                                  <div className="flex flex-col">
                                    {/* Always show the amount in user's default currency */}
                                    <div className="flex items-center">
                                      {transaction.type === 'expense' ? '-' : '+'}
                                      {(() => {
                                        try {
                                          return formatCurrency(Math.abs(transaction.amount));
                                        } catch (error) {
                                          console.error('Error formatting currency:', error);
                                          return `${transaction.amount}`;
                                        }
                                      })()}
                                    </div>
                                    
                                    {/* Show original amount if it exists and is different */}
                                    {(() => {
                                      try {
                                        if (transaction.original_amount &&
                                            transaction.currency &&
                                            (Math.abs(Math.abs(transaction.original_amount) - Math.abs(transaction.amount)) > 0.01 ||
                                            (transaction.currency && currency && transaction.currency.id !== currency.id))) {
                                          return (
                                            <div className="text-xs text-muted-foreground">
                                              {transaction.type === 'expense' ? '-' : '+'}
                                              {transaction.currency.symbol}{Math.abs(transaction.original_amount).toFixed(2)}
                                            </div>
                                          );
                                        }
                                        return null;
                                      } catch (error) {
                                        console.error('Error displaying original amount:', error);
                                        return null;
                                      }
                                    })()}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={transaction.type === 'expense' ? 'destructive' : 'default'} className="capitalize">
                                    {transaction.type}
                                  </Badge>
                                </TableCell>
                                <TableCell className="w-[100px]">
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => openSheet({
                                        transactionType: transaction.type === 'expense' ? 'expense' : 'earning',
                                        categories: categories.filter(c => c.category_type === transaction.type),
                                        allCategories: categories,
                                        sourcePage: 'transactions',
                                        currencies,
                                        paymentMethods,
                                        initialData: {
                                          ...transaction,
                                          type: transaction.type === 'expense' ? 'expense' : 'earning'
                                        },
                                        onSuccess: () => router.reload()
                                      })}
                                      className="h-8 w-8"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                      <span className="sr-only">Edit</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                      onClick={() => {
                                        if(confirm('Are you sure you want to delete this transaction?')) {
                                          router.delete(route('transactions.destroy', transaction.id), {
                                            onSuccess: () => router.reload()
                                          });
                                        }
                                      }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                      <span className="sr-only">Delete</span>
                                    </Button>
                                  </div>
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
                                      onClick={() => router.visit(link.url)}
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
                      </>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">No transactions found.</div>
              </div>
            )}
          </div>
        </SidebarInset>
        {transactionSheet}
        <TransactionsPdfDialog
          open={showPdfDialog}
          onClose={() => setShowPdfDialog(false)}
        />
        <Toaster />
      </SidebarProvider>
    </div>
  );
}
