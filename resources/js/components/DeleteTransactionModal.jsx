import { useForm } from '@inertiajs/react';
import Modal from '@/components/Modal';
import DangerButton from '@/components/DangerButton';
import SecondaryButton from '@/components/SecondaryButton';
import { useToast } from "@/hooks/use-toast.js";

export default function DeleteTransactionModal({ isOpen, onClose, transaction }) {
    const { toast } = useToast();
    const { delete: destroy, processing } = useForm();

    const handleDelete = () => {
        destroy(route('transactions.destroy', transaction), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                toast({
                    title: "Success",
                    description: "Transaction deleted successfully",
                });
            },
            onError: () => {
                toast({
                    title: "Error",
                    description: "Failed to delete transaction",
                    variant: "destructive",
                });
            },
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900">
                    Delete Transaction
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                    Are you sure you want to delete this transaction? This action cannot be undone.
                </p>

                <div className="mt-6 flex justify-end space-x-3">
                    <SecondaryButton onClick={onClose} disabled={processing}>
                        Cancel
                    </SecondaryButton>

                    <DangerButton onClick={handleDelete} disabled={processing}>
                        Delete Transaction
                    </DangerButton>
                </div>
            </div>
        </Modal>
    );
}