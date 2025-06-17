import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/components/Modal';
import InputError from '@/components/InputError';
import InputLabel from '@/components/InputLabel';
import PrimaryButton from '@/components/PrimaryButton';
import SecondaryButton from '@/components/SecondaryButton';
import TextInput from '@/components/TextInput';
import { useToast } from "@/hooks/use-toast.js";

export default function EditTransactionModal({ isOpen, onClose, transaction, categories }) {
    const { toast } = useToast();
    
    const { data, setData, put, processing, errors, reset } = useForm({
        amount: '',
        type: '',
        date: '',
        description: '',
        category_id: '',
        payment_method: '',
        is_recurring: false,
        recurring_frequency: '',
    });

    useEffect(() => {
        if (transaction) {
            setData({
                amount: transaction.amount,
                type: transaction.type,
                date: transaction.date,
                description: transaction.description || '',
                category_id: transaction.category_id || '',
                payment_method: transaction.payment_method || '',
                is_recurring: transaction.is_recurring || false,
                recurring_frequency: transaction.recurring_frequency || '',
            });
        }
    }, [transaction]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        put(route('transactions.update', transaction), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                reset();
                toast({
                    title: "Success",
                    description: "Transaction updated successfully",
                });
            },
            onError: () => {
                toast({
                    title: "Error",
                    description: "Failed to update transaction",
                    variant: "destructive",
                });
            },
        });
    };

    return (
        <Modal show={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-semibold text-gray-900">
                    Edit Transaction
                </h2>

                <div className="mt-6 space-y-6">
                    <div>
                        <InputLabel htmlFor="amount" value="Amount" />
                        <TextInput
                            id="amount"
                            type="number"
                            step="0.01"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.amount} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="type" value="Type" />
                        <select
                            id="type"
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select Type</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                        <InputError message={errors.type} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="date" value="Date" />
                        <TextInput
                            id="date"
                            type="date"
                            value={data.date}
                            onChange={(e) => setData('date', e.target.value)}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.date} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="category" value="Category" />
                        <select
                            id="category"
                            value={data.category_id}
                            onChange={(e) => setData('category_id', e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Select Category</option>
                            {categories?.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.category_id} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="description" value="Description" />
                        <TextInput
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.description} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="payment_method" value="Payment Method" />
                        <TextInput
                            id="payment_method"
                            value={data.payment_method}
                            onChange={(e) => setData('payment_method', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.payment_method} className="mt-2" />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="is_recurring"
                            checked={data.is_recurring}
                            onChange={(e) => setData('is_recurring', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <InputLabel htmlFor="is_recurring" value="Recurring Transaction" className="ml-2" />
                    </div>

                    {data.is_recurring && (
                        <div>
                            <InputLabel htmlFor="recurring_frequency" value="Recurring Frequency" />
                            <select
                                id="recurring_frequency"
                                value={data.recurring_frequency}
                                onChange={(e) => setData('recurring_frequency', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Select Frequency</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                            <InputError message={errors.recurring_frequency} className="mt-2" />
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <SecondaryButton onClick={onClose} disabled={processing}>
                        Cancel
                    </SecondaryButton>

                    <PrimaryButton type="submit" disabled={processing}>
                        Update Transaction
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}