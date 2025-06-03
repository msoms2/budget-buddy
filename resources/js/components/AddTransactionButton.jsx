import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTransactionSheet } from '@/hooks/use-transaction-sheet';

export default function AddTransactionButton({
    transactionType = 'expense',
    categories = [],
    initialCategory = null,
    onSuccess = null,
    size = 'default',
    variant = 'default',
    className = '',
    children,
    sourcePage = null, // Add sourcePage parameter with null default
}) {
    const { openSheet, sheet } = useTransactionSheet();

    // Style variables based on transaction type
    const isExpense = transactionType === 'expense';
    const buttonColor = variant === 'default' ? {
        base: isExpense 
            ? 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-600/90 dark:hover:bg-red-700/90' 
            : 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-600/90 dark:hover:bg-green-700/90',
        outline: isExpense
            ? 'border-red-200 hover:bg-red-50 dark:border-red-800/30 dark:hover:bg-red-900/20'
            : 'border-green-200 hover:bg-green-50 dark:border-green-800/30 dark:hover:bg-green-900/20'
    } : {};

    const handleClick = () => {
        openSheet({
            transactionType,
            categories,
            initialCategory,
            sourcePage, // Pass the sourcePage parameter to openSheet
            onSuccess,
        });
    };

    return (
        <>
            <Button
                onClick={handleClick}
                size={size}
                variant={variant}
                className={cn(
                    "gap-2",
                    variant === 'default' && buttonColor.base,
                    variant === 'outline' && buttonColor.outline,
                    className
                )}
            >
                {children || (
                    <>
                        <PlusIcon className="h-4 w-4" />
                        Add {isExpense ? 'Expense' : 'Income'}
                    </>
                )}
            </Button>
            {sheet}
        </>
    );
}