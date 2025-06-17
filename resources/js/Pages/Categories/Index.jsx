import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import CategorySheet from './Partials/CategorySheet';
import { AppSidebar } from "@/components/app-sidebar";
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
  PlusIcon, 
  ArrowUpRightIcon, 
  ListIcon, 
  GridIcon, 
  PencilIcon, 
  TrashIcon,
  TagIcon,
  FolderIcon,
  ChevronDown,
  ChevronRight
} from "lucide-react";

export default function Index({ auth, expenseCategories, earningCategories }) {
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'expense', or 'earning'
    const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryType, setCategoryType] = useState('expense');
    const [expandedCategories, setExpandedCategories] = useState({});
    
    // Transform expense categories to include their subcategories
    const processedExpenseCategories = expenseCategories.map(category => {
        // Get subcategories for this category
        const subcategories = expenseCategories
            .filter(subcat => subcat.parent_id === category.id)
            .map(subcat => ({
                ...subcat,
                isSubcategory: true
            }));
        
        return {
            ...category,
            hasSubcategories: subcategories.length > 0,
            subcategories: subcategories
        };
    }).filter(category => !category.parent_id); // Only return parent categories
    
    // Transform earning categories to include their subcategories
    const processedEarningCategories = earningCategories.map(category => {
        // Get subcategories for this category
        const subcategories = earningCategories
            .filter(subcat => subcat.parent_id === category.id)
            .map(subcat => ({
                ...subcat,
                isSubcategory: true
            }));
        
        return {
            ...category,
            hasSubcategories: subcategories.length > 0,
            subcategories: subcategories
        };
    }).filter(category => !category.parent_id); // Only return parent categories
    
    // Filter categories based on active tab
    const filteredCategories = activeTab === 'all' 
        ? [...processedExpenseCategories, ...processedEarningCategories].filter(cat => !cat.parent_id)
        : activeTab === 'expense'
            ? processedExpenseCategories.filter(cat => !cat.parent_id)
            : processedEarningCategories.filter(cat => !cat.parent_id);

    const confirmDelete = (category) => {
        setCategoryToDelete(category);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
    };

    const handleDelete = () => {
        if (!categoryToDelete) return;
        
        const isExpense = categoryToDelete.type === 'expense';
        const deleteRoute = isExpense 
            ? route('expense-category.destroy', { category: categoryToDelete.id })
            : route('income-category.destroy', { category: categoryToDelete.id });
        
        router.delete(deleteRoute);
        closeDeleteModal();
    };
    
    // Function to open modal for creating a new category
    const openCreateModal = (type = 'expense') => {
        setEditingCategory(null);
        setCategoryType(type);
        setShowCategoryModal(true);
    };
    
    // Function to open modal for creating a new subcategory
    const openCreateSubcategoryModal = (parentCategory) => {
        setEditingCategory(null);
        setCategoryType(parentCategory.type);
        setShowCategoryModal(true);
    };
    
    // Function to open modal for editing an existing category
    const openEditModal = (category) => {
        setEditingCategory(category);
        setCategoryType(category.type);
        setShowCategoryModal(true);
    };
    
    // Function to close the category modal
    const closeCategoryModal = () => {
        setShowCategoryModal(false);
        setEditingCategory(null);
    };

    // Toggle category expansion (for showing/hiding subcategories)
    const toggleCategoryExpansion = (categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    // Function to render a single category as a card
    const renderCategoryCard = (category) => {
        // Rely solely on the type property passed from the backend
        const isExpense = category.type === 'expense'; 
        
        // Use our specific routes for expense and income categories
        const categoryRouteName = isExpense ? 'expense-category.show' : 'income-category.show';
        const categoryRouteParams = { category: category.id };
        
        // Function to navigate to the category's view page
        const navigateToView = () => {
            router.visit(route(categoryRouteName, categoryRouteParams));
        };
        
        return (
            <React.Fragment key={`${category.type}-${category.id}`}>
                <Card
                    className="hover:shadow-md transition-shadow"
                    onClick={navigateToView}
                >
                    <CardHeader className="pb-2 cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center">
                                <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center"
                                    style={{ 
                                        backgroundColor: category.bg_color || '#f3f4f6',
                                        borderColor: isExpense ? '#ef4444' : '#10b981',
                                        borderWidth: '2px'
                                    }}
                                >
                                    <span 
                                        className="text-lg"
                                        style={{ color: category.icon_color || '#000' }}
                                    >
                                        {category.icon || (isExpense ? '🛒' : '💰')}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <CardTitle className="text-base">{category.name}</CardTitle>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className={`mt-0.5 ${isExpense ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                                        {isExpense ? 'Expense' : 'Income'}
                                    </Badge>
                                    {category.hasSubcategories && (
                                        <Badge variant="outline" className="mt-0.5 bg-blue-50 text-blue-600">
                                            <FolderIcon className="h-3 w-3 mr-1" />
                                            {category.subcategories.length} subcategories
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="pb-1">
                        {category.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {category.description}
                            </p>
                        )}
                    </CardContent>
                    
                    <CardFooter className="justify-between pt-2 border-t">
                        <div className="text-sm text-muted-foreground">
                            <span className="font-medium">{category.count || '0'}</span> transactions
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            {/* Add Subcategory button */}
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openCreateSubcategoryModal(category);
                                }}
                                title="Add Subcategory"
                            >
                                <FolderIcon className="h-4 w-4" />
                                <span className="sr-only">Add Subcategory</span>
                            </Button>
                            
                            {/* Edit button */}
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(category);
                                }}
                            >
                                <PencilIcon className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                            </Button>
                            
                            {/* Delete button */}
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDelete(category);
                                }}
                            >
                                <TrashIcon className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </React.Fragment>
        );
    };

    // Function to render a single category as a list item
    const renderCategoryListItem = (category) => {
        const isExpense = category.type === 'expense';
        const categoryRouteName = isExpense ? 'expense-category.show' : 'income-category.show';
        const categoryRouteParams = { category: category.id };
        
        // Function to navigate to the category's view page
        const navigateToView = () => {
            router.visit(route(categoryRouteName, categoryRouteParams));
        };
        
        return (
            <React.Fragment key={`list-${category.type}-${category.id}`}>
                <TableRow 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={navigateToView}
                >
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ 
                                    backgroundColor: category.bg_color || '#f3f4f6',
                                    borderColor: isExpense ? '#ef4444' : '#10b981',
                                    borderWidth: '2px'
                                }}
                            >
                                <span 
                                    className="text-md"
                                    style={{ color: category.icon_color || '#000' }}
                                >
                                    {category.icon || (isExpense ? '🛒' : '💰')}
                                </span>
                            </div>
                            <div>
                                <div className="font-medium">{category.name}</div>
                                {category.description && (
                                    <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                                        {category.description}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex gap-2">
                            <Badge variant="outline" className={isExpense ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}>
                                {isExpense ? 'Expense' : 'Income'}
                            </Badge>
                            {category.hasSubcategories && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-600">
                                    <FolderIcon className="h-3 w-3 mr-1" />
                                    {category.subcategories.length} subcategories
                                </Badge>
                            )}
                        </div>
                    </TableCell>
                    <TableCell className="text-center">
                        <span className="font-medium">{category.count || '0'}</span>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                            {/* Add Subcategory button */}
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openCreateSubcategoryModal(category);
                                }}
                                title="Add Subcategory"
                            >
                                <FolderIcon className="h-4 w-4" />
                                <span className="sr-only">Add Subcategory</span>
                            </Button>
                            
                            {/* Edit button */}
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(category);
                                }}
                            >
                                <PencilIcon className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                            </Button>
                            
                            {/* Delete button */}
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    confirmDelete(category);
                                }}
                            >
                                <TrashIcon className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
            </React.Fragment>
        );
    };

    // Count main and subcategories 
    const expenseMainCount = processedExpenseCategories.length;
    const expenseSubCount = processedExpenseCategories.reduce(
        (total, cat) => total + (cat.subcategories?.length || 0), 
        0
    );
    const incomeMainCount = processedEarningCategories.length;
    const incomeSubCount = processedEarningCategories.reduce(
        (total, cat) => total + (cat.subcategories?.length || 0), 
        0
    );
    const totalCount = expenseMainCount + expenseSubCount + incomeMainCount + incomeSubCount;

    return (
        <SidebarProvider>
            <Head title="Categories Management" />
            <AppSidebar />
            
            <SidebarInset>
                {/* Header with breadcrumb */}
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <BreadcrumbPage>Categories Management</BreadcrumbPage>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {/* Summary cards */}
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardDescription>Total Categories</CardDescription>
                                <CardTitle className="text-2xl font-semibold">{totalCount}</CardTitle>
                            </CardHeader>
                            <CardFooter className="flex-col items-start gap-1 text-sm">
                                <div className="line-clamp-1 flex gap-2 font-medium">
                                    <TagIcon className="h-4 w-4 text-muted-foreground" /> All your transaction categories
                                </div>
                            </CardFooter>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardDescription>Expense Categories</CardDescription>
                                <CardTitle className="text-2xl font-semibold">{expenseMainCount}</CardTitle>
                                <p className="text-sm text-muted-foreground">+ {expenseSubCount} subcategories</p>
                            </CardHeader>
                            <CardFooter>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full"
                                    onClick={() => {
                                        setActiveTab('expense');
                                        openCreateModal('expense');
                                    }}
                                >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Add Expense Category
                                </Button>
                            </CardFooter>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <CardDescription>Income Categories</CardDescription>
                                <CardTitle className="text-2xl font-semibold">{incomeMainCount}</CardTitle>
                                <p className="text-sm text-muted-foreground">+ {incomeSubCount} subcategories</p>
                            </CardHeader>
                            <CardFooter>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full"
                                    onClick={() => {
                                        setActiveTab('earning');
                                        openCreateModal('earning');
                                    }}
                                >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Add Income Category
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                    
                    {/* Tab Selection and View Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex bg-muted rounded-md p-1">
                            <Button 
                                variant={activeTab === 'all' ? "secondary" : "ghost"}
                                onClick={() => setActiveTab('all')}
                                className="text-sm"
                                size="sm"
                            >
                                All Categories
                            </Button>
                            <Button 
                                variant={activeTab === 'expense' ? "secondary" : "ghost"}
                                onClick={() => setActiveTab('expense')}
                                className="text-sm"
                                size="sm"
                            >
                                Expenses
                            </Button>
                            <Button 
                                variant={activeTab === 'earning' ? "secondary" : "ghost"}
                                onClick={() => setActiveTab('earning')}
                                className="text-sm"
                                size="sm"
                            >
                                Income
                            </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openCreateModal(activeTab === 'earning' ? 'earning' : 'expense')}
                                className="gap-2"
                            >
                                <PlusIcon className="h-4 w-4" />
                                New Category
                            </Button>
                            
                            <div className="bg-muted rounded-md p-1 flex">
                                <Button
                                    variant={viewMode === 'cards' ? "secondary" : "ghost"}
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                    onClick={() => setViewMode('cards')}
                                    title="Card View"
                                >
                                    <GridIcon className="h-4 w-4" />
                                    <span className="sr-only">Card View</span>
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? "secondary" : "ghost"}
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                    onClick={() => setViewMode('list')}
                                    title="List View"
                                >
                                    <ListIcon className="h-4 w-4" />
                                    <span className="sr-only">List View</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Categories Content Area */}
                    <div className="flex-1">
                        {filteredCategories.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <TagIcon className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-lg font-medium mb-4">No {activeTab === 'all' ? '' : activeTab} categories found</p>
                                    <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                                        Categories help you organize your transactions and track your spending patterns.
                                    </p>
                                    <Button onClick={() => openCreateModal(activeTab === 'earning' ? 'earning' : 'expense')}>
                                        <PlusIcon className="h-4 w-4 mr-2" />
                                        Create Your First Category
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : viewMode === 'cards' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredCategories.map(renderCategoryCard)}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead className="text-center">Transactions</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredCategories.map(renderCategoryListItem)}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                    
                    {/* Back to Dashboard link */}
                    <div className="flex justify-end mt-2">
                        <Link href="/dashboard" className="text-blue-600 hover:underline flex items-center text-sm">
                            Back to Dashboard
                            <ArrowUpRightIcon className="ml-1 size-3" />
                        </Link>
                    </div>
                </div>
            </SidebarInset>
            
            {/* Category Modal */}
            {showCategoryModal && (
                <CategorySheet
                    isOpen={showCategoryModal}
                    onClose={closeCategoryModal}
                    category={editingCategory}
                    categoryType={categoryType}
                    parentCategories={[...expenseCategories, ...earningCategories]} // Pass all categories for parent selection
                />
            )}

            {/* Delete confirmation modal */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                title={`Delete ${categoryToDelete?.type === 'expense' ? 'Expense' : 'Income'} Category`}
                message={
                    categoryToDelete ? 
                    `Are you sure you want to delete the "${categoryToDelete.name}" category? This action cannot be undone and all associated transactions will lose their category.` :
                    'Are you sure you want to delete this category?'
                }
            />
        </SidebarProvider>
    );
}