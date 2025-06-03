import React, { useState, useEffect, useRef } from 'react';
import { useForm, router } from '@inertiajs/react';
import { useToast } from '@/hooks/use-toast.js';
import axios from 'axios';
import CategorySheet from '@/Pages/Categories/Partials/CategorySheet';
import { 
    Sheet,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { 
    PlusIcon,
    CalendarIcon,
    XIcon,
    CheckIcon,
    CreditCardIcon, 
    AlignLeftIcon,
    TagIcon,
    DollarSignIcon,
    AlertCircleIcon,
    Loader2Icon,
    FolderTree,
} from 'lucide-react';
import { format } from 'date-fns';

export default function TransactionSheet({
    isOpen,
    onClose,
    categories = [],
    transactionType = 'expense',
    initialCategory = null,
    onSuccess = null,
    initialData = null,
    allCategories = null,
    sourcePage = null,
    currencies = [],
    paymentMethods = [],
}) {
    // Toast notifications
    const { toast } = useToast();
    
    // State for the category creation sheet
    const [showCategorySheet, setShowCategorySheet] = useState(false);
    
    // State to track the current transaction type
    const [currentType, setCurrentType] = useState(transactionType);
    
    // State to track subcategories for the selected category
    const [subcategories, setSubcategories] = useState([]);
    
    // State to track if subcategories are loading
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);
    
    // UI states
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Reference for focus management
    const nameInputRef = useRef(null);
    
    // Create form with initial values for transactions
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: initialData?.name || '',
        description: initialData?.description || '',
        amount: initialData?.amount || initialData?.sum || '',
        category_id: initialData?.category_id || initialCategory || '',
        subcategory_id: initialData?.subcategory_id || '',
        date: initialData?.date || new Date().toISOString().substr(0, 10),
        stay_on_page: (sourcePage !== null) || (initialData?.stay_on_page ?? true),
        source_page: sourcePage || initialData?.source_page || '',
        type: currentType,
        currency_id: initialData?.currency_id || (currencies.length > 0 ? currencies[0]?.id : 1),
        payment_method_id: initialData?.payment_method_id || (paymentMethods.length > 0 ? paymentMethods[0]?.id : 1),
    });
    
    // Style variables based on transaction type with support for both light and dark themes
    const isExpense = currentType === 'expense';
    const themeStyles = {
        primaryColor: isExpense 
            ? 'text-red-600 dark:text-red-400' 
            : 'text-green-600 dark:text-green-400',
        primaryBg: isExpense 
            ? 'bg-red-50 dark:bg-red-900/20' 
            : 'bg-green-50 dark:bg-green-900/20',
        primaryBorder: isExpense 
            ? 'border-red-200 dark:border-red-800' 
            : 'border-green-200 dark:border-green-800',
        buttonColor: isExpense 
            ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600' 
            : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600',
        focusRing: isExpense 
            ? 'focus:ring-red-500 dark:focus:ring-red-400' 
            : 'focus:ring-green-500 dark:focus:ring-green-400',
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        clearErrors();

        try {
            // Handle regular transaction submission
            const endpoint = `/${currentType === 'expense' ? 'expenses' : 'earnings'}`;
            
            post(endpoint, {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: "Success!",
                        description: `${isExpense ? 'Expense' : 'Income'} has been ${initialData ? 'updated' : 'added'} successfully.`,
                        variant: "success",
                    });
                    
                    if (onSuccess) onSuccess();
                    
                    if (data.stay_on_page) {
                        setData({
                            ...data,
                            name: '',
                            description: '',
                            amount: '',
                            category_id: initialCategory || '',
                            subcategory_id: '',
                        });
                        setSubcategories([]);
                    } else {
                        reset();
                        onClose();
                    }
                }
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            
            toast({
                title: "Error",
                description: "There was a problem processing your request. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Load subcategories when a category is selected for transaction
    useEffect(() => {
        const fetchSubcategories = async () => {
            if (!data.category_id) {
                setSubcategories([]);
                return;
            }

            setLoadingSubcategories(true);

            try {
                // Use the correct API endpoint structure
                const endpoint = currentType === 'expense' 
                    ? `/api/categories/expense/${data.category_id}/subcategories`
                    : `/api/categories/earning/${data.category_id}/subcategories`;
                
                const response = await axios.get(endpoint, { withCredentials: true });

                // Handle both response formats (direct array or nested in data property)
                const subcategoriesData = response.data.data || response.data || [];
                setSubcategories(subcategoriesData);
            } catch (error) {
                console.error('Error loading subcategories:', error);
                
                let errorMessage = "Failed to load subcategories. Please try again.";
                if (error.response?.status === 401) {
                    errorMessage = "Please log in to view subcategories.";
                } else if (error.response?.status === 403) {
                    errorMessage = "You don't have permission to view these subcategories.";
                } else if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                }

                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
                
                setSubcategories([]);
            } finally {
                setLoadingSubcategories(false);
            }
        };

        fetchSubcategories();
    }, [data.category_id, currentType]);
    
    // Handle category change - clear subcategory when category changes
    const handleCategoryChange = (categoryId) => {
        setData(prevData => ({
            ...prevData,
            category_id: categoryId,
            subcategory_id: ''
        }));
    };
    
    // Set up CSRF token for axios when component mounts
    useEffect(() => {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) {
            axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
            axios.defaults.withCredentials = true;
            
            // Also set the Accept header for API requests
            axios.defaults.headers.common['Accept'] = 'application/json';
            axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
            
            // Force fetch the CSRF cookie first to ensure the CSRF token is available for API requests
            fetchCsrfCookie();
        } else {
            console.error('CSRF token not found in meta tags');
        }
    }, []);
    
    // Helper function to fetch CSRF cookie before making API requests
    const fetchCsrfCookie = async () => {
        try {
            await axios.get('/sanctum/csrf-cookie');
            console.log('CSRF cookie refreshed successfully');
        } catch (error) {
            console.error('Failed to refresh CSRF cookie:', error);
        }
    };
    
    // Derived categories based on current type - filter to only show parent (top-level) categories
    const filteredCategories = allCategories 
        ? allCategories.filter(c => c.category_type === (currentType === 'expense' ? 'expense' : 'income') && !c.parent_id) 
        : categories.filter(c => !c.parent_id);
    
    // Reset form when sheet opens/closes or when initialData changes
    useEffect(() => {
        if (isOpen) {
            // Reset the current type to the initial type
            setCurrentType(transactionType);
            
            setData({
                name: initialData?.name || '',
                description: initialData?.description || '',
                amount: initialData?.amount || initialData?.sum || '',
                category_id: initialData?.category_id || initialCategory || '',
                subcategory_id: initialData?.subcategory_id || '',
                date: initialData?.date || new Date().toISOString().substr(0, 10),
                stay_on_page: sourcePage !== null || (data?.stay_on_page ?? true),
                source_page: sourcePage || data?.source_page || '',
                currency_id: initialData?.currency_id || (currencies.length > 0 ? currencies[0]?.id : 1),
                type: currentType
            });
            clearErrors();
            
            // Load subcategories for initial category if provided
            if (initialData?.category_id) {
                // This will trigger the useEffect that loads subcategories
            }
            
            // Focus on the name input when the sheet opens
            setTimeout(() => {
                if (nameInputRef.current) {
                    nameInputRef.current.focus();
                }
            }, 100);
        }
    }, [isOpen, initialData, initialCategory]);

    return (
        <>
            <Sheet
                open={isOpen}
                onOpenChange={(state) => {
                    if (!state) onClose();
                }}
            >
                <SheetContent className="w-full sm:max-w-lg">
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <SheetHeader className={cn(
                            "pb-4",
                            "border-b",
                            themeStyles.primaryBorder
                        )}>
                            <div className="flex justify-between items-center">
                                <SheetTitle className={cn(
                                    "text-2xl font-bold",
                                    themeStyles.primaryColor
                                )}>
                                    {initialData 
                                        ? `Edit ${isExpense ? 'Expense' : 'Income'}`
                                        : "Add New Transaction"}
                                </SheetTitle>
                                <Badge 
                                    variant="outline" 
                                    className={cn(
                                        themeStyles.primaryBg,
                                        themeStyles.primaryColor,
                                        themeStyles.primaryBorder,
                                        "cursor-pointer hover:opacity-80 transition-opacity select-none"
                                    )}
                                    onClick={() => {
                                        const newType = isExpense ? 'earning' : 'expense';
                                        setCurrentType(newType);
                                        // Reset category selection when changing types
                                        setData(prevData => ({
                                            ...prevData,
                                            category_id: '',
                                            subcategory_id: ''
                                        }));
                                    }}
                                >
                                    {isExpense ? 'Expense' : 'Income'}
                                </Badge>
                            </div>
                            <SheetDescription>
                                Track your transactions by completing the form below.
                            </SheetDescription>
                        </SheetHeader>

                        {/* Form Content */}
                        <div className="flex-1 overflow-y-auto py-4">
                            <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4">
                                {/* Name Field */}
                                <div className="space-y-2">
                                    <Label 
                                        htmlFor="name" 
                                        className="flex items-center gap-1.5"
                                    >
                                        <CreditCardIcon className="h-4 w-4" />
                                        {isExpense ? 'Expense' : 'Income'} Name
                                    </Label>
                                    <Input
                                        id="name"
                                        ref={nameInputRef}
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData({...data, name: e.target.value})}
                                        className={cn(
                                            errors.name && "border-red-500 focus:ring-red-500"
                                        )}
                                        placeholder={isExpense ? 'e.g., Grocery shopping' : 'e.g., Monthly salary'}
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircleIcon className="h-3 w-3" />
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Amount Field */}
                                <div className="space-y-2">
                                    <Label 
                                        htmlFor="amount" 
                                        className="flex items-center gap-1.5"
                                    >
                                        <DollarSignIcon className="h-4 w-4" />
                                        Amount
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        value={data.amount}
                                        onChange={(e) => setData({...data, amount: e.target.value})}
                                        className={cn(
                                            errors.amount && "border-red-500 focus:ring-red-500"
                                        )}
                                        placeholder="0.00"
                                        required
                                    />
                                    {errors.amount && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircleIcon className="h-3 w-3" />
                                            {errors.amount}
                                        </p>
                                    )}
                                </div>

                                {/* Currency Selection - Show for all types */}
                                <div className="space-y-2">
                                    <Label htmlFor="currency_id">Currency</Label>
                                    <select
                                        id="currency_id"
                                        value={data.currency_id}
                                        onChange={(e) => setData({...data, currency_id: e.target.value})}
                                        className="w-full h-10 px-3 py-2 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 ring-offset-background"
                                    >
                                        {currencies.map((currency) => (
                                            <option key={currency.id} value={currency.id}>
                                                {currency.code} ({currency.symbol})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Category Selection */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label 
                                            htmlFor="category_id" 
                                            className="flex items-center gap-1.5"
                                        >
                                            <TagIcon className="h-4 w-4" />
                                            Category
                                        </Label>
                                        <Button
                                            onClick={() => setShowCategorySheet(true)}
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "h-8 gap-1 text-xs",
                                                themeStyles.primaryColor
                                            )}
                                        >
                                            <PlusIcon className="h-3 w-3" /> 
                                            Create New Category
                                        </Button>
                                    </div>
                                    <select
                                        id="category_id"
                                        value={data.category_id}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        className={cn(
                                            "w-full h-10 px-3 py-2 rounded-md border bg-background text-foreground",
                                            "focus:outline-none focus:ring-2 ring-offset-background",
                                            themeStyles.focusRing,
                                            errors.category_id ? "border-red-500" : "border-input"
                                        )}
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {filteredCategories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.icon ? `${category.icon} ` : ''}{category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {filteredCategories.length === 0 && (
                                        <p className="text-sm text-orange-500 dark:text-orange-400 flex items-center gap-1">
                                            <AlertCircleIcon className="h-3 w-3" />
                                            No {isExpense ? 'expense' : 'income'} categories found. Please create one first.
                                        </p>
                                    )}
                                    {errors.category_id && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircleIcon className="h-3 w-3" />
                                            {errors.category_id}
                                        </p>
                                    )}
                                </div>
                                
                                {/* Subcategory Selection - only shown when a category is selected */}
                                {data.category_id && (
                                    <div className="space-y-2 ml-6">
                                        <Label 
                                            htmlFor="subcategory_id" 
                                            className="flex items-center gap-1.5"
                                        >
                                            <FolderTree className="h-4 w-4" />
                                            Subcategory (Optional)
                                        </Label>
                                        <select
                                            id="subcategory_id"
                                            value={data.subcategory_id}
                                            onChange={(e) => setData({...data, subcategory_id: e.target.value})}
                                            className={cn(
                                                "w-full h-10 px-3 py-2 rounded-md border bg-background text-foreground",
                                                "focus:outline-none focus:ring-2 ring-offset-background",
                                                themeStyles.focusRing,
                                                errors.subcategory_id ? "border-red-500" : "border-input"
                                            )}
                                            disabled={loadingSubcategories}
                                        >
                                            <option value="">Select a subcategory (optional)</option>
                                            {subcategories.map((subcategory) => (
                                                <option key={subcategory.id} value={subcategory.id}>
                                                    {subcategory.icon ? `${subcategory.icon} ` : ''}{subcategory.name}
                                                </option>
                                            ))}
                                        </select>
                                        {loadingSubcategories && (
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Loader2Icon className="h-3 w-3 animate-spin" />
                                                Loading subcategories...
                                            </p>
                                        )}
                                        {!loadingSubcategories && subcategories.length === 0 && (
                                            <p className="text-sm text-muted-foreground italic">
                                                No subcategories available for this category
                                            </p>
                                        )}
                                        {errors.subcategory_id && (
                                            <p className="text-sm text-red-600 flex items-center gap-1">
                                                <AlertCircleIcon className="h-3 w-3" />
                                                {errors.subcategory_id}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Date Field */}
                                <div className="space-y-2">
                                    <Label 
                                        htmlFor="date" 
                                        className="flex items-center gap-1.5"
                                    >
                                        <CalendarIcon className="h-4 w-4" />
                                        Date
                                    </Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData({...data, date: e.target.value})}
                                        className={cn(
                                            errors.date && "border-red-500 focus:ring-red-500"
                                        )}
                                        required
                                    />
                                    {errors.date && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircleIcon className="h-3 w-3" />
                                            {errors.date}
                                        </p>
                                    )}
                                </div>

                                {/* Payment Method Selection */}
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="payment_method_id"
                                        className="flex items-center gap-1.5"
                                    >
                                        <CreditCardIcon className="h-4 w-4" />
                                        Payment Method
                                    </Label>
                                    <select
                                        id="payment_method_id"
                                        value={data.payment_method_id}
                                        onChange={(e) => setData({...data, payment_method_id: e.target.value})}
                                        className={cn(
                                            "w-full h-10 px-3 py-2 rounded-md border bg-background text-foreground",
                                            "focus:outline-none focus:ring-2 ring-offset-background",
                                            themeStyles.focusRing,
                                            errors.payment_method_id ? "border-red-500" : "border-input"
                                        )}
                                        required
                                    >
                                        <option value="">Select a payment method</option>
                                        {paymentMethods.map((method) => (
                                            <option key={method.id} value={method.id}>
                                                {method.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.payment_method_id && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircleIcon className="h-3 w-3" />
                                            {errors.payment_method_id}
                                        </p>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <SheetFooter className="sticky bottom-0 left-0 right-0 bg-background border-t p-4 mt-auto">
                            <div className="flex w-full justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    className="gap-2"
                                    disabled={isSubmitting}
                                >
                                    <XIcon className="h-4 w-4" />
                                    Cancel
                                </Button>
                                
                                <Button
                                    form="transaction-form"
                                    type="submit"
                                    disabled={processing || isSubmitting}
                                    className={cn(
                                        "gap-2 text-white", 
                                        themeStyles.buttonColor
                                    )}
                                >
                                    {isSubmitting ? (
                                        <Loader2Icon className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckIcon className="h-4 w-4" />
                                    )}
                                    {`${initialData ? 'Update' : 'Add'} ${isExpense ? 'Expense' : 'Income'}`}
                                </Button>
                            </div>
                        </SheetFooter>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Category Creation Sheet - Pass parent categories for subcategory selection */}
            <CategorySheet
                isOpen={showCategorySheet}
                onClose={() => setShowCategorySheet(false)}
                categoryType={isExpense ? 'expense' : 'earning'}
                parentCategories={filteredCategories}
            />
        </>
    );
}