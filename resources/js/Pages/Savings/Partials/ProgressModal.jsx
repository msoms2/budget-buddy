import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
    XIcon, 
    CheckIcon, 
    PlusCircleIcon, 
    TrendingUpIcon,
    DollarSignIcon,
    TargetIcon 
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency.jsx';

export default function ProgressModal({ isOpen, onClose, savings }) {
    const { formatCurrency, currency } = useCurrency();
    const [previewProgress, setPreviewProgress] = useState(0);
    
    // Initialize form for adding progress
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        description: ''
    });

    // Calculate current progress and remaining amount
    const currentProgress = (savings.current_amount / savings.target_amount) * 100;
    const remainingAmount = savings.target_amount - savings.current_amount;

    // Handle amount change and update preview
    const handleAmountChange = (value) => {
        setData('amount', value);
        const addedAmount = parseFloat(value) || 0;
        const newCurrentAmount = savings.current_amount + addedAmount;
        const newProgress = Math.min(100, (newCurrentAmount / savings.target_amount) * 100);
        setPreviewProgress(newProgress);
    };

    // Form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        post(route('savings.update-progress', savings.id), {
            ...data,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            }
        });
    };

    // Handle close and reset
    const handleClose = () => {
        reset();
        setPreviewProgress(0);
        onClose();
    };

    // Quick amount buttons
    const quickAmounts = [
        { label: '10', value: 10 },
        { label: '25', value: 25 },
        { label: '50', value: 50 },
        { label: '100', value: 100 },
        { label: 'Half Remaining', value: remainingAmount / 2 },
        { label: 'Full Goal', value: remainingAmount }
    ];

    const addedAmount = parseFloat(data.amount) || 0;
    const newCurrentAmount = savings.current_amount + addedAmount;
    const displayProgress = previewProgress || currentProgress;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <PlusCircleIcon className="h-5 w-5 text-green-600" />
                        <DialogTitle>Add Progress to {savings.name}</DialogTitle>
                    </div>
                    <DialogDescription>
                        Add money to your savings plan and track your progress towards your goal.
                    </DialogDescription>
                </DialogHeader>
                
                {/* Current Progress Display */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Current Progress</span>
                        <span className="text-lg font-bold text-blue-600">
                            {Math.round(displayProgress)}%
                        </span>
                    </div>
                    <Progress value={displayProgress} className="mb-3" />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <DollarSignIcon className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">Current</span>
                            </div>
                            <div className="font-bold text-gray-800 dark:text-gray-200">
                                {formatCurrency(addedAmount > 0 ? newCurrentAmount : savings.current_amount)}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <TargetIcon className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">Target</span>
                            </div>
                            <div className="font-bold text-gray-800 dark:text-gray-200">
                                {formatCurrency(savings.target_amount)}
                            </div>
                        </div>
                    </div>
                    
                    {addedAmount > 0 && (
                        <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/30 rounded text-center">
                            <div className="text-xs text-green-600 dark:text-green-400">Adding</div>
                            <div className="font-bold text-green-700 dark:text-green-300">
                                +{formatCurrency(addedAmount)}
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">
                            Amount to Add {currency && <span className="text-gray-500">({currency.code})</span>}
                        </Label>
                        <div className="relative">
                            {currency && (
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                    {currency.symbol}
                                </span>
                            )}
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={remainingAmount}
                                value={data.amount}
                                onChange={e => handleAmountChange(e.target.value)}
                                placeholder="0.00"
                                className={currency ? "pl-8" : ""}
                                required
                            />
                        </div>
                        {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                        
                        <div className="text-xs text-gray-500">
                            Remaining to goal: {formatCurrency(Math.max(0, remainingAmount - addedAmount))}
                        </div>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="space-y-2">
                        <Label className="text-sm">Quick Add</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {quickAmounts.map((quick, index) => (
                                <Button
                                    key={index}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => handleAmountChange(quick.value.toString())}
                                    disabled={quick.value > remainingAmount}
                                >
                                    {quick.label === 'Half Remaining' || quick.label === 'Full Goal' 
                                        ? quick.label 
                                        : `${currency?.symbol || '$'}${quick.value}`
                                    }
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            rows={2}
                            placeholder="e.g., Monthly savings, Bonus money, Birthday gift..."
                        />
                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                    </div>

                    {/* Preview of completion */}
                    {addedAmount > 0 && newCurrentAmount >= savings.target_amount && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                <CheckIcon className="h-5 w-5" />
                                <span className="font-medium">Congratulations! 🎉</span>
                            </div>
                            <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                                You'll reach your savings goal with this addition!
                            </p>
                        </div>
                    )}
                </form>
                
                <DialogFooter className="mt-4">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="gap-2"
                    >
                        <XIcon className="h-4 w-4" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={processing || !data.amount || parseFloat(data.amount) <= 0}
                        className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                        <TrendingUpIcon className="h-4 w-4" />
                        Add Progress
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}