import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTransactionSheet } from '@/hooks/use-transaction-sheet';

export default function Create({ auth, categories, category_id }) {
    const { openSheet, sheet } = useTransactionSheet();

    useEffect(() => {
        // Automatically open the transaction sheet when the page loads
        openSheet({
            transactionType: 'expense',
            categories,
            initialCategory: category_id,
            onSuccess: () => window.history.back()
        });
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="Add New Expense" />
            {sheet}
        </AuthenticatedLayout>
    );
}