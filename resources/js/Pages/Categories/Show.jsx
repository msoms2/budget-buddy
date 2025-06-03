import React, { useState } from 'react';
import SubcategoryAnalysis from './Partials/SubcategoryAnalysis';
import { Head, Link, router } from '@inertiajs/react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import CategorySheet from './Partials/CategorySheet';
import { AppSidebar } from "@/components/app-sidebar";
import { AddTransactionButton } from "@/components/add-transaction-button";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
    ArrowUpRightIcon, 
    PencilIcon, 
    TrashIcon, 
    PlusIcon, 
    ArrowLeftIcon, 
    CalendarIcon, 
    BarChart3Icon, 
    HashIcon, 
    TrendingUpIcon,
    FolderIcon,
    TagIcon,
    ChevronRightIcon,
    EyeIcon
} from "lucide-react";
import {
    Pagination, 
    PaginationContent, 
    PaginationItem, 
    PaginationLink, 
    PaginationNext, 
    PaginationPrevious 
} from '@/components/ui/pagination';
export default function Show({ auth, category, transactions, allTransactionsData, type, subcategories = [] }) {
    // State for delete confirmation modal
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    // State for category edit modal
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const transactionsPerPage = 10;
    
    // Safely handle different data structures
    const totalAmount = allTransactionsData?.total || 0;
    const averageAmount = allTransactionsData?.average || 0;
    const transactionsCount = allTransactionsData?.count || 0;
    const highestAmount = allTransactionsData?.highest || 0;
    
    // Process subcategories data - ensuring we have complete information
    const processedSubcategories = (allTransactionsData?.subcategories || []).map(subcat => ({
        id: subcat.id,
        name: subcat.name,
        description: subcat.description,
        icon: subcat.icon,
        icon_color: subcat.icon_color,
        bg_color: subcat.bg_color,
        total: subcat.total || 0,
        count: subcat.count || 0
    }));
    
    const categoryTotals = allTransactionsData?.categoryTotals || [];
    const period = allTransactionsData?.period || 'month';
    
    const isExpense = type === 'expense';
    
    // Routes for buttons and links
    const editRoute = isExpense 
        ? route('expense-category.edit', { category: category.id }) 
        : route('income-category.edit', { category: category.id });
    
    const deleteRoute = isExpense 
        ? route('expense-category.destroy', { category: category.id }) 
        : route('income-category.destroy', { category: category.id });
    
    const newTransactionRoute = isExpense
        ? route('expenses.create', { category_id: category.id })
        : route('earnings.create', { category_id: category.id });

    // Format currency
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '€0.00';
        return new Intl.NumberFormat('en-EU', {
            style: 'currency',
            currency: 'EUR', 
            minimumFractionDigits: 2
        }).format(Math.abs(amount));
    };

    // Get transaction amount helper
    const getTransactionAmount = (transaction) => {
        // Try amount first, then sum, fallback to 0
        const value = transaction.amount ?? transaction.sum ?? 0;
        return isExpense ? -Math.abs(value) : Math.abs(value);
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    // Delete category confirmation handlers
    const confirmDelete = () => {
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
    };

    const handleDelete = () => {
        router.delete(deleteRoute);
    };

    // Transaction delete confirmation handlers
    const confirmDeleteTransaction = (transaction) => {
        setTransactionToDelete(transaction);
        setDeleteModalOpen(true);
    };

    const closeDeleteTransactionModal = () => {
        setTransactionToDelete(null);
        setDeleteModalOpen(false);
    };

    const handleDeleteTransaction = () => {
        if (!transactionToDelete) return;

        const deleteTransactionRoute = isExpense
            ? route('expenses.destroy', transactionToDelete.id)
            : route('earnings.destroy', transactionToDelete.id);

        router.delete(deleteTransactionRoute);
        setTransactionToDelete(null);
        setDeleteModalOpen(false);
    };
    
    // Category edit modal handlers
    const openEditModal = () => {
        setShowCategoryModal(true);
    };
    
    const closeEditModal = () => {
        setShowCategoryModal(false);
    };
    
    // Pagination handlers
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };
    
    // Handle any transaction data structure
    const transactionItems = transactions?.data ? transactions.data : 
                           Array.isArray(transactions) ? transactions : [];
    const hasTransactions = transactionItems.length > 0;
    
    // Calculate pagination
    const totalPages = Math.ceil(transactionItems.length / transactionsPerPage);
    const indexOfLastTransaction = currentPage * transactionsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
    const currentTransactions = transactionItems.slice(indexOfFirstTransaction, indexOfLastTransaction);

    // Style variables based on category type
    const primaryColor = isExpense ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
    const primaryColorDarker = isExpense ? 'text-red-700 dark:text-red-500' : 'text-green-700 dark:text-green-500';
    const bgGradient = isExpense ? 'from-red-50 to-white dark:from-red-950/20 dark:to-transparent' : 'from-green-50 to-white dark:from-green-950/20 dark:to-transparent';
    const badgeBg = isExpense ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50' : 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50';
    const buttonColor = isExpense ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600/90 dark:hover:bg-red-700/90' : 'bg-green-600 hover:bg-green-700 dark:bg-green-600/90 dark:hover:bg-green-700/90';
    const headerBorder = isExpense ? 'border-t-red-500 dark:border-t-red-600' : 'border-t-green-500 dark:border-t-green-600';
    
    // Get icon colors with dark mode support
    const getIconBg = () => {
        if (category.bg_color) return category.bg_color;
        return isExpense 
            ? 'var(--tw-gradient-from, rgb(254 226 226 / 1))' 
            : 'var(--tw-gradient-from, rgb(220 252 231 / 1))';
    };
    
    const getIconColor = () => {
        if (category.icon_color) return category.icon_color;
        return isExpense ? '#dc2626' : '#059669'; 
    };

    // Navigate to subcategory detail view
    const navigateToSubcategory = (subcategory) => {
        const subcategoryRoute = isExpense 
            ? route('expense-category.show', { category: subcategory.id }) 
            : route('income-category.show', { category: subcategory.id });
        
        router.visit(subcategoryRoute);
    };

    return (
        <SidebarProvider>
            <Head title={`${category.name} | Category Details`} />
            <AppSidebar />

            <SidebarInset>
                {/* Header with breadcrumb */}
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={route('categories.index')}>
                                        Categories
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{category.name}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {/* Category header */}
                    <Card className={`bg-gradient-to-b ${bgGradient} border-l-4 ${isExpense ? 'border-l-red-500 dark:border-l-red-600' : 'border-l-green-500 dark:border-l-green-600'}`}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 dark:border-opacity-50"
                                        style={{ 
                                            backgroundColor: `${getIconBg()}`,
                                            borderColor: isExpense ? 'var(--red-border-color, #ef4444)' : 'var(--green-border-color, #10b981)',
                                            borderWidth: '2px',
                                            '--red-border-color': 'rgb(239 68 68 / var(--tw-border-opacity, 1))',
                                            '--green-border-color': 'rgb(16 185 129 / var(--tw-border-opacity, 1))'
                                        }}
                                    >
                                        <span 
                                            className="text-2xl"
                                            style={{ color: getIconColor() }}
                                        >
                                            {category.icon || (isExpense ? '🛒' : '💰')}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className={`text-2xl font-bold ${primaryColorDarker}`}>{category.name}</h2>
                                            <Badge variant="outline" className={badgeBg}>
                                                {isExpense ? 'Expense' : 'Income'}
                                            </Badge>
                                        </div>
                                        {category.description && (
                                            <p className="text-gray-600 dark:text-gray-300">{category.description}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline"
                                        size="icon"
                                        onClick={openEditModal}
                                        className="h-9 w-9 text-orange-500 hover:text-orange-600 hover:bg-orange-50 border-orange-200 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-900/20 dark:border-orange-800/30"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                        <span className="sr-only">Edit</span>
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        size="icon"
                                        onClick={confirmDelete}
                                        className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 dark:border-red-800/30"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                        <span className="sr-only">Delete</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Cards - Changed to match the master branch layout with 5 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <Card className={`bg-gradient-to-b ${bgGradient}`}>
                            <CardHeader className="pb-2">
                                <CardDescription className="flex items-center gap-1.5">
                                    <BarChart3Icon className="h-4 w-4" /> 
                                    Total {isExpense ? 'Spent' : 'Earned'}
                                </CardDescription>
                                <CardTitle className={`text-2xl font-bold ${primaryColorDarker}`}>
                                    {formatCurrency(totalAmount)}
                                </CardTitle>
                            </CardHeader>
                            <CardFooter className="pt-0">
                                <span className="text-xs text-muted-foreground">
                                    All time total in this category
                                </span>
                            </CardFooter>
                        </Card>

                        <Card className={`bg-gradient-to-b ${bgGradient}`}>
                            <CardHeader className="pb-2">
                                <CardDescription className="flex items-center gap-1.5">
                                    <FolderIcon className="h-4 w-4" /> 
                                    Subcategories
                                </CardDescription>
                                <CardTitle className="text-2xl font-bold">
                                    {processedSubcategories.length}
                                </CardTitle>
                            </CardHeader>
                            <CardFooter className="pt-0">
                                <span className="text-xs text-muted-foreground">
                                    Number of subcategories
                                </span>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription className="flex items-center gap-1.5">
                                    <HashIcon className="h-4 w-4" /> 
                                    Transaction Count
                                </CardDescription>
                                <CardTitle className="text-2xl font-bold">
                                    {transactionsCount}
                                </CardTitle>
                            </CardHeader>
                            <CardFooter className="pt-0">
                                <span className="text-xs text-muted-foreground">
                                    Number of {isExpense ? 'expenses' : 'earnings'} recorded
                                </span>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardDescription className="flex items-center gap-1.5">
                                    <TrendingUpIcon className="h-4 w-4" /> 
                                    Average Amount
                                </CardDescription>
                                <CardTitle className="text-2xl font-bold">
                                    {formatCurrency(averageAmount)}
                                </CardTitle>
                            </CardHeader>
                            <CardFooter className="pt-0">
                                <span className="text-xs text-muted-foreground">
                                    Per transaction average
                                </span>
                            </CardFooter>
                        </Card>

                        <Card className={`bg-gradient-to-b ${bgGradient}`}>
                            <CardHeader className="pb-2">
                                <CardDescription className="flex items-center gap-1.5">
                                    <TrendingUpIcon className="h-4 w-4" /> 
                                    Highest {isExpense ? 'Expense' : 'Income'}
                                </CardDescription>
                                <CardTitle className={`text-2xl font-bold ${primaryColorDarker}`}>
                                    {formatCurrency(highestAmount)}
                                </CardTitle>
                            </CardHeader>
                            <CardFooter className="pt-0">
                                <span className="text-xs text-muted-foreground">
                                    Largest single transaction
                                </span>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Subcategory Analysis Section */}
                    {processedSubcategories.length > 0 && !category.parent_id && (
                        <div className="mb-6">
                            <SubcategoryAnalysis
                                subcategories={processedSubcategories}
                                categoryTotals={categoryTotals}
                                period={period}
                            />
                        </div>
                    )}
                    
                    {/* Subcategories List Section */}
                    {processedSubcategories.length > 0 && !category.parent_id && (
                        <Card className={`shadow-sm border-t-2 ${headerBorder} mb-6`}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className={primaryColor}>
                                            <div className="flex items-center gap-2">
                                                <FolderIcon className="h-5 w-5" />
                                                Subcategories
                                            </div>
                                        </CardTitle>
                                        <CardDescription>
                                            Subcategories of {category.name}
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.visit(route('categories.index'))}
                                        className={`gap-2 ${primaryColor}`}
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        Add Subcategory
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Subcategory List Section */}
                                    <Table>
                                        <TableHeader className="bg-muted/30 dark:bg-muted/10">
                                            <TableRow>
                                                <TableHead>Category</TableHead>
                                                <TableHead className="hidden md:table-cell">Description</TableHead>
                                                <TableHead className="text-center">Transactions</TableHead>
                                                <TableHead className="text-center">Amount</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {processedSubcategories.map((subcategory) => {
                                                const subcategoryRouteName = isExpense 
                                                    ? 'expense-category.show' 
                                                    : 'income-category.show';
                                                const subcategoryRoute = route(subcategoryRouteName, { category: subcategory.id });
                                                
                                                return (
                                                    <TableRow 
                                                        key={subcategory.id}
                                                        className={`cursor-pointer hover:bg-muted/50`}
                                                        onClick={() => navigateToSubcategory(subcategory)}
                                                    >
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div 
                                                                    className="w-8 h-8 rounded-full flex items-center justify-center"
                                                                    style={{ 
                                                                        backgroundColor: subcategory.bg_color || '#f3f4f6',
                                                                        borderColor: isExpense ? '#ef4444' : '#10b981',
                                                                        borderWidth: '2px'
                                                                    }}
                                                                >
                                                                    <span 
                                                                        className="text-md"
                                                                        style={{ color: subcategory.icon_color || '#000' }}
                                                                    >
                                                                        {subcategory.icon || (isExpense ? '🛒' : '💰')}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <div className="font-medium">{subcategory.name}</div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            {subcategory.description ? (
                                                                <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                                                                    {subcategory.description}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground">No description</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <span className="font-medium">{subcategory.count || 0}</span>
                                                        </TableCell>
                                                        <TableCell className={`text-center ${primaryColor}`}>
                                                            <span className="font-medium">{formatCurrency(subcategory.total || 0)}</span>
                                                        </TableCell>
                                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex justify-end gap-2">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm" 
                                                                    className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                                                                    asChild
                                                                >
                                                                    <Link href={subcategoryRoute}>
                                                                        <EyeIcon className="h-4 w-4" />
                                                                        <span className="sr-only">View</span>
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>

                                    {/* Subcategory Card Grid Section for Mobile View */}
                                    <div className="grid grid-cols-1 md:hidden gap-4">
                                        {processedSubcategories.map(subcategory => (
                                            <Card 
                                                key={subcategory.id} 
                                                className={`hover:shadow-md transition-shadow cursor-pointer border-l-4`}
                                                style={{ borderLeftColor: isExpense ? '#fecaca' : '#d1fae5' }}
                                                onClick={() => navigateToSubcategory(subcategory)}
                                            >
                                                <CardHeader className="pb-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div 
                                                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                                                style={{ 
                                                                    backgroundColor: subcategory.bg_color || '#f3f4f6',
                                                                    borderColor: isExpense ? '#ef4444' : '#10b981',
                                                                    borderWidth: '2px'
                                                                }}
                                                            >
                                                                <span 
                                                                    className="text-lg"
                                                                    style={{ color: subcategory.icon_color || '#000' }}
                                                                >
                                                                    {subcategory.icon || (isExpense ? '🛒' : '💰')}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <CardTitle className="text-base flex items-center">
                                                                    {subcategory.name}
                                                                </CardTitle>
                                                                <div className="flex gap-2">
                                                                    <Badge variant="outline" className={`mt-0.5 ${isExpense ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                                                                        {isExpense ? 'Expense' : 'Income'}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pb-2">
                                                    {subcategory.description && (
                                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                                            {subcategory.description}
                                                        </p>
                                                    )}
                                                    <div className="mt-2 flex items-center justify-between">
                                                        <div className="text-sm">
                                                            <span className={`font-medium ${primaryColorDarker}`}>
                                                                {formatCurrency(subcategory.total || 0)}
                                                            </span>
                                                            <span className="text-muted-foreground ml-1">
                                                                total
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            <span className="font-medium">{subcategory.count || 0}</span> transactions
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Transactions Section */}
                    <Card className={`shadow-sm border-t-2 ${headerBorder}`}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className={primaryColor}>
                                        {isExpense ? 'Expenses' : 'Income'} in this category
                                    </CardTitle>
                                    <CardDescription>
                                        Listing all {isExpense ? 'expenses' : 'income'} in the {category.name} category
                                    </CardDescription>
                                </div>
                                <AddTransactionButton
                                    transactionType={isExpense ? 'expense' : 'earning'}
                                    categories={[category]}
                                    initialCategory={category.id}
                                    size="sm"
                                    variant="default"
                                    sourcePage="category"
                                    onSuccess={() => {
                                        router.reload({
                                            preserveScroll: true,
                                            preserveState: true
                                        });
                                    }}
                                    className={`gap-2 ${isExpense
                                        ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600'
                                        : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
                                    } text-white`}
                                >
                                    Add {isExpense ? 'Expense' : 'Income'}
                                </AddTransactionButton>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            {!hasTransactions ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-muted/20 dark:bg-muted/10">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isExpense ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                                        <span className="text-2xl">{isExpense ? '📊' : '💸'}</span>
                                    </div>
                                    <h3 className="text-lg font-medium mb-2">No {isExpense ? 'expenses' : 'income'} found</h3>
                                    <p className="text-muted-foreground mb-6 max-w-md">
                                        You haven't added any {isExpense ? 'expenses' : 'income'} to this category yet. 
                                        Start tracking your finances by adding your first transaction.
                                    </p>
                                    <AddTransactionButton 
                                        transactionType={isExpense ? 'expense' : 'earning'}
                                        categories={[category]}
                                        initialCategory={category.id}
                                        sourcePage="category"
                                        onSuccess={() => router.reload()}
                                    >
                                        Add Your First {isExpense ? 'Expense' : 'Income'}
                                    </AddTransactionButton>
                                </div>
                            ) : (
                                <div>
                                    <Table>
                                        <TableHeader className="bg-muted/30 dark:bg-muted/10">
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Subcategory</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentTransactions.map((transaction) => {
                                                const transactionRoute = isExpense
                                                    ? route('expenses.show', transaction.id)
                                                    : route('earnings.show', transaction.id);
                                                
                                                const editTransactionRoute = isExpense
                                                    ? route('expenses.edit', transaction.id)
                                                    : route('earnings.edit', transaction.id);
                                                
                                                const amount = getTransactionAmount(transaction);
                                                
                                                const hoverClass = isExpense 
                                                    ? 'hover:bg-red-50/40 dark:hover:bg-red-900/20' 
                                                    : 'hover:bg-green-50/40 dark:hover:bg-green-900/20';
                                                
                                                return (
                                                    <TableRow 
                                                        key={transaction.id}
                                                        className={`cursor-pointer ${hoverClass}`}
                                                        onClick={() => router.visit(transactionRoute)}
                                                    >
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                                                {formatDate(transaction.date || transaction.created_at)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">{transaction.name || transaction.description}</div>
                                                            {transaction.description && transaction.name && (
                                                                <div className="text-xs text-muted-foreground truncate max-w-xs">{transaction.description}</div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {transaction.subcategory ? (
                                                                <Badge variant="outline" className="bg-muted/50">
                                                                    {transaction.subcategory.name}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground">None</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className={primaryColor}>
                                                            <span className="font-semibold">{formatCurrency(amount)}</span>
                                                        </TableCell>
                                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex justify-end gap-2">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm" 
                                                                    className="h-8 w-8 p-0 text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-900/20"
                                                                    asChild
                                                                >
                                                                    <Link href={editTransactionRoute}>
                                                                        <PencilIcon className="h-4 w-4" />
                                                                        <span className="sr-only">Edit</span>
                                                                    </Link>
                                                                </Button>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm" 
                                                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                                                    onClick={() => confirmDeleteTransaction(transaction)}
                                                                >
                                                                    <TrashIcon className="h-4 w-4" />
                                                                    <span className="sr-only">Delete</span>
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                    
                                    {/* Pagination controls */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center py-4">
                                            <Pagination>
                                                <PaginationContent>
                                                    <PaginationItem>
                                                        <PaginationPrevious 
                                                            href="#" 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handlePreviousPage();
                                                            }}
                                                            className={`${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}
                                                        />
                                                    </PaginationItem>
                                                    
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                                        const activeClass = page === currentPage 
                                                            ? (isExpense 
                                                                ? 'bg-red-600 text-white border-red-600 dark:bg-red-700 dark:border-red-700' 
                                                                : 'bg-green-600 text-white border-green-600 dark:bg-green-700 dark:border-green-700') 
                                                            : '';
                                                        
                                                        return (
                                                            <PaginationItem key={page}>
                                                                <PaginationLink
                                                                    href="#"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        setCurrentPage(page);
                                                                    }}
                                                                    isActive={page === currentPage}
                                                                    className={activeClass}
                                                                >
                                                                    {page}
                                                                </PaginationLink>
                                                            </PaginationItem>
                                                        );
                                                    })}
                                                    
                                                    <PaginationItem>
                                                        <PaginationNext 
                                                            href="#" 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleNextPage();
                                                            }}
                                                            className={`${currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                                                        />
                                                    </PaginationItem>
                                                </PaginationContent>
                                            </Pagination>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="flex justify-between pt-4">
                            <Button 
                                variant="outline" 
                                size="sm"
                                className="gap-2"
                                asChild
                            >
                                <Link href={route('categories.index')}>
                                    <ArrowLeftIcon className="h-4 w-4" />
                                    Back to Categories
                                </Link>
                            </Button>
                            
                            <Button 
                                variant="outline" 
                                size="sm"
                                className={`gap-2 ${primaryColor} ${isExpense ? 'border-red-200 dark:border-red-800/30' : 'border-green-200 dark:border-green-800/30'}`}
                                asChild
                            >
                                <Link href="/dashboard">
                                    Go to Dashboard
                                    <ArrowUpRightIcon className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </SidebarInset>

            {/* Delete category confirmation modal */}
            {!transactionToDelete && (
                <DeleteConfirmationModal
                    isOpen={deleteModalOpen}
                    onClose={closeDeleteModal}
                    onConfirm={handleDelete}
                    title={`Delete ${isExpense ? 'Expense' : 'Income'} Category`}
                    message={`Are you sure you want to delete the "${category.name}" category? This action cannot be undone and all associated transactions will lose their category.`}
                />
            )}

            {/* Delete transaction confirmation modal */}
            {transactionToDelete && (
                <DeleteConfirmationModal
                    isOpen={deleteModalOpen}
                    onClose={closeDeleteTransactionModal}
                    onConfirm={handleDeleteTransaction}
                    title={`Delete ${isExpense ? 'Expense' : 'Income'} Transaction`}
                    message={`Are you sure you want to delete this ${isExpense ? 'expense' : 'income'} transaction? This action cannot be undone.`}
                />
            )}
            
            {/* Category Edit Modal */}
            <CategorySheet
                isOpen={showCategoryModal}
                onClose={closeEditModal}
                category={category}
                categoryType={type}
            />
            {/* The AddTransactionButton component handles the transaction sheet internally */}
            
            
        </SidebarProvider>
    );
}