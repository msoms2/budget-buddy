import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import TransactionFormModal from '@/components/TransactionFormModal';

/**
 * Custom hook for managing the TransactionFormModal component's state.
 * This hook provides an easy way to open and close the modal from anywhere in your application.
 * 
 * @returns {Object} Object containing the modal state and control functions
 */
export function useTransactionForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [modalData, setModalData] = useState({
        transactionType: 'expense',
        categories: [],
        initialCategory: null,
        initialData: null
    });

    /**
     * Opens the transaction modal with specified options
     * 
     * @param {Object} options - Modal options
     * @param {string} options.transactionType - Type of transaction ('expense' or 'earning')
     * @param {Array} options.categories - List of available categories
     * @param {string|null} options.initialCategory - Initial category ID to select
     * @param {Object|null} options.initialData - Data for editing an existing transaction
     */
    const openModal = useCallback(({ 
        transactionType = 'expense', 
        categories = [], 
        initialCategory = null,
        initialData = null
    } = {}) => {
        setModalData({
            transactionType,
            categories,
            initialCategory,
            initialData
        });
        setIsOpen(true);
    }, []);

    /**
     * Closes the transaction modal
     */
    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    /**
     * Handles successful transaction submission
     * By default, it will reload the page, but you can override this behavior
     */
    const handleSuccess = useCallback(() => {
        // You can customize this to update specific parts of your UI instead of reloading the whole page
        router.reload();
    }, []);

    // The modal component to render
    const modal = (
        <TransactionFormModal
            isOpen={isOpen}
            onClose={closeModal}
            transactionType={modalData.transactionType}
            categories={modalData.categories}
            initialCategory={modalData.initialCategory}
            initialData={modalData.initialData}
            onSuccess={handleSuccess}
        />
    );

    return {
        isOpen,
        openModal,
        closeModal,
        modal
    };
}