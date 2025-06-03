import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import TransactionSheet from '../Partials/TransactionSheet';

export function useTransactionModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [modalData, setModalData] = useState({
        transactionType: 'expense',
        categories: [],
        initialCategory: null
    });

    // Function to open the modal
    const openModal = useCallback(({ 
        transactionType = 'expense', 
        categories = [], 
        initialCategory = null 
    } = {}) => {
        setModalData({
            transactionType,
            categories,
            initialCategory
        });
        setIsOpen(true);
    }, []);

    // Function to close the modal
    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    // Function to handle successful transaction submission
    const handleSuccess = useCallback(() => {
        // Reload page data if needed
        router.reload();
    }, []);

    // The modal component to render
    const modal = (
        <TransactionSheet
            isOpen={isOpen}
            onClose={closeModal}
            transactionType={modalData.transactionType}
            categories={modalData.categories}
            initialCategory={modalData.initialCategory}
            onSuccess={handleSuccess}
            allCategories={modalData.categories}
        />
    );

    return {
        openModal,
        closeModal,
        modal
    };
}