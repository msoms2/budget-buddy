import React from 'react';
import Modal from '@/components/Modal';
import DangerButton from '@/components/DangerButton';
import SecondaryButton from '@/components/SecondaryButton';

export default function DeleteConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Confirm Deletion", 
    message = "Are you sure you want to delete this item? This action cannot be undone."
}) {
    return (
        <Modal show={isOpen} onClose={onClose} maxWidth="md">
            <div className="p-6 bg-background">
                <h2 className="text-lg font-medium text-foreground">{title}</h2>
                
                <p className="mt-3 text-sm text-muted-foreground">
                    {message}
                </p>

                <div className="mt-6 flex justify-end space-x-3">
                    <SecondaryButton 
                        onClick={onClose}
                        className="border-border hover:bg-muted"
                    >
                        Cancel
                    </SecondaryButton>
                    <DangerButton 
                        onClick={onConfirm}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Delete
                    </DangerButton>
                </div>
            </div>
        </Modal>
    );
}