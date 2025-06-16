import React, { useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, XIcon, CheckIcon, PiggyBankIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency.jsx';

export default function SavingsModal({ isOpen, onClose, savings = null, categories = [] }) {
    const { currency } = useCurrency();

    // Transform categories into a flat list for display
    const flattenedCategories = (categories || []).map(category => ({
        id: category.id,
        name: category.name,
        icon: category.icon || '💰',
        icon_color: category.icon_color || '#000000',
        bg_color: category.bg_color || '#ffffff'
    }));
    
    // Initialize form with existing data if editing, otherwise use defaults
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: savings?.name || '',
        target_amount: savings?.target_amount || '',
        target_date: savings?.target_date || '',
        category_id: savings?.category_id || '',
        description: savings?.description || '',
        current_amount: savings?.current_amount || 0
    });

    // Reset form when savings changes
    useEffect(() => {
        if (savings) {
            reset({
                name: savings.name || '',
                target_amount: savings.target_amount || '',
                target_date: savings.target_date || '',
                category_id: savings.category_id || '',
                description: savings.description || '',
                current_amount: savings.current_amount || 0
            });
        } else {
            reset({
                name: '',
                target_amount: '',
                target_date: '',
                category_id: '',
                description: '',
                current_amount: 0
            });
        }
    }, [savings, isOpen]);

    // Form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Create a copy of data to modify before submission
        const formData = { ...data };
        
        // Convert empty strings to null for optional fields
        if (!formData.category_id || formData.category_id === '') {
            formData.category_id = null;
        }
        
        if (savings) {
            // Update existing savings plan
            put(route('savings.update', savings.id), {
                ...formData,
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                }
            });
        } else {
            // Create new savings plan
            post(route('savings.store'), {
                ...formData,
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                }
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <PiggyBankIcon className="h-5 w-5 text-blue-600" />
                        <DialogTitle>{savings ? 'Edit Savings Plan' : 'Create New Savings Plan'}</DialogTitle>
                    </div>
                    <DialogDescription>
                        {savings ? 'Update your savings plan details below.' : 'Set up a new savings plan with target amount and deadline.'}
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Plan Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="e.g., Emergency Fund, Vacation Fund"
                            required
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="target_amount">
                            Target Amount {currency && <span className="text-gray-500">({currency.code})</span>}
                        </Label>
                        <div className="relative">
                            {currency && (
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                    {currency.symbol}
                                </span>
                            )}
                            <Input
                                id="target_amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.target_amount}
                                onChange={e => setData('target_amount', e.target.value)}
                                placeholder="0.00"
                                className={currency ? "pl-8" : ""}
                                required
                            />
                        </div>
                        {errors.target_amount && <p className="text-sm text-red-500">{errors.target_amount}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="target_date">Target Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !data.target_date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {data.target_date ? format(new Date(data.target_date), "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={data.target_date ? new Date(data.target_date) : undefined}
                                    onSelect={(selectedDate) => selectedDate && setData('target_date', format(selectedDate, 'yyyy-MM-dd'))}
                                    initialFocus
                                    disabled={(date) => date < new Date()}
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.target_date && <p className="text-sm text-red-500">{errors.target_date}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={data.category_id}
                            onValueChange={value => setData('category_id', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                                {flattenedCategories.map(category => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                        <div className="flex items-center gap-2">
                                            <span style={{ color: category.icon_color }}>{category.icon}</span>
                                            {category.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
                    </div>

                    {savings && (
                        <div className="space-y-2">
                            <Label htmlFor="current_amount">
                                Current Amount {currency && <span className="text-gray-500">({currency.code})</span>}
                            </Label>
                            <div className="relative">
                                {currency && (
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                        {currency.symbol}
                                    </span>
                                )}
                                <Input
                                    id="current_amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max={data.target_amount}
                                    value={data.current_amount}
                                    onChange={e => setData('current_amount', e.target.value)}
                                    placeholder="0.00"
                                    className={currency ? "pl-8" : ""}
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Current progress towards your savings goal
                            </p>
                            {errors.current_amount && <p className="text-sm text-red-500">{errors.current_amount}</p>}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            rows={3}
                            placeholder="Describe what you're saving for..."
                        />
                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                    </div>

                    {/* Savings Calculator Preview */}
                    {data.target_amount && data.target_date && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Savings Calculator</h4>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                {(() => {
                                    const targetAmount = parseFloat(data.target_amount) || 0;
                                    const currentAmount = parseFloat(data.current_amount) || 0;
                                    const remainingAmount = Math.max(0, targetAmount - currentAmount);
                                    const targetDate = new Date(data.target_date);
                                    const today = new Date();
                                    const daysRemaining = Math.max(1, Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24)));
                                    
                                    const dailyRequired = remainingAmount / daysRemaining;
                                    const weeklyRequired = dailyRequired * 7;
                                    const monthlyRequired = dailyRequired * 30;
                                    
                                    return (
                                        <>
                                            <div className="text-center">
                                                <div className="font-bold text-gray-800 dark:text-gray-200">
                                                    {currency?.symbol || '$'}{dailyRequired.toFixed(2)}
                                                </div>
                                                <div className="text-gray-500">Daily</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-bold text-gray-800 dark:text-gray-200">
                                                    {currency?.symbol || '$'}{weeklyRequired.toFixed(2)}
                                                </div>
                                                <div className="text-gray-500">Weekly</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="font-bold text-gray-800 dark:text-gray-200">
                                                    {currency?.symbol || '$'}{monthlyRequired.toFixed(2)}
                                                </div>
                                                <div className="text-gray-500">Monthly</div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                To reach your goal, you need to save these amounts consistently.
                            </p>
                        </div>
                    )}
                </form>
                
                <DialogFooter className="mt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="gap-2"
                    >
                        <XIcon className="h-4 w-4" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={processing}
                        className="gap-2"
                    >
                        <CheckIcon className="h-4 w-4" />
                        {savings ? 'Update' : 'Create'} Plan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}