import React, { useState } from 'react';
import TransactionSheet from '@/Pages/Transactions/Partials/TransactionSheet';

export const useTransactionSheet = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({
        transactionType: 'expense',
        categories: [],
        allCategories: null,
        initialCategory: null,
        onSuccess: null,
        initialData: null,
        sourcePage: null,
        currencies: [],
        paymentMethods: [],
    });

    const openSheet = (sheetConfig = {}) => {
        setConfig({
            transactionType: sheetConfig.type || sheetConfig.transactionType || 'expense',
            categories: sheetConfig.categories || [],
            allCategories: sheetConfig.allCategories || null,
            initialCategory: sheetConfig.initialCategory || null,
            onSuccess: sheetConfig.onSuccess || null,
            initialData: sheetConfig.initialData || null,
            sourcePage: sheetConfig.sourcePage || null,
            currencies: sheetConfig.currencies || [],
            paymentMethods: sheetConfig.paymentMethods || [],
        });
        setIsOpen(true);
    };

    const closeSheet = () => {
        setIsOpen(false);
    };

    // Create the component that will be rendered
    const transactionSheetComponent = (
        <TransactionSheet
            isOpen={isOpen}
            onClose={closeSheet}
            {...config}
        />
    );

    // Create the sheet object with both methods and the component
    const sheet = {
        show: openSheet,
        hide: closeSheet
    };

    return {
        openSheet,
        closeSheet,
        sheet,
        // Return the actual component separately
        transactionSheet: transactionSheetComponent
    };
};