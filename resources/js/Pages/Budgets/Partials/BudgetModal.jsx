import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
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
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { XIcon, CheckIcon, CalendarIcon } from 'lucide-react';

export default function BudgetModal({ isOpen, onClose, budget = null, expenseCategories = [], mainCategories = [], subcategories = {}, budgetMethods = {}, budgetPeriods = {} }) {
    // Initialize form with existing data if editing, otherwise use defaults
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: budget?.name || '',
        amount: budget?.amount || '',
        period: budget?.period || 'monthly',
        time_frame: budget?.time_frame || '1_month',
        time_frame_value: budget?.time_frame_value || '',
        time_frame_unit: budget?.time_frame_unit || 'months',
        start_date: budget?.start_date ? format(new Date(budget.start_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        end_date: budget?.end_date ? format(new Date(budget.end_date), 'yyyy-MM-dd') : '',
        category_id: budget?.category_id ? budget.category_id.toString() : 'none',
        notes: budget?.notes || '',
        rollover_enabled: budget?.rollover_enabled || false,
        rollover_amount: budget?.rollover_amount || 0,
        budget_method: budget?.budget_method || 'standard',
        method_settings: budget?.method_settings || {},
    });

    // State for locally managed categories if needed
    const [localExpenseCategories, setLocalExpenseCategories] = useState([]);
    
    // Fetch expense categories if not provided via props
    useEffect(() => {
        if (isOpen && (!expenseCategories || expenseCategories.length === 0)) {
            axios.get(route('categories.index') + '?type=expense')
                .then(response => {
                    setLocalExpenseCategories(response.data);
                })
                .catch(error => {
                    console.error('Error fetching expense categories:', error);
                });
        }
    }, [isOpen, expenseCategories]);
    
    // Use provided categories or locally fetched ones
    const categoriesToUse = expenseCategories && expenseCategories.length > 0 
        ? expenseCategories 
        : localExpenseCategories;

    // Time frame options
    const timeFrameOptions = {
        '1_week': '1 Week',
        '1_month': '1 Month',
        '3_months': '3 Months',
        '6_months': '6 Months',
        '1_year': '1 Year',
        '2_years': '2 Years',
        'custom': 'Custom'
    };

    // Calculate end date based on period whenever start date or period changes
    const calculateEndDate = () => {
        if (!data.start_date) return;
        
        const startDate = new Date(data.start_date);
        let endDate;
        
        switch (data.period) {
            case 'daily':
                endDate = new Date(startDate);
                break;
            case 'weekly':
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6);
                break;
            case 'monthly':
                // Create a date on the same day of the next month
                endDate = new Date(startDate);
                endDate.setMonth(startDate.getMonth() + 1);
                
                // If the day is not the same, it means we've rolled over to the next month
                // due to the current month having fewer days than the start month
                if (endDate.getDate() !== startDate.getDate()) {
                    // Go back to the last day of the intended month
                    endDate = new Date(endDate); // Create a new date to avoid modifying the original
                    endDate.setDate(0); // Setting to 0 gets the last day of the previous month
                } else {
                    // Subtract one day to get the last day of the period
                    endDate.setDate(endDate.getDate() - 1);
                }
                break;
            case 'yearly':
                endDate = new Date(startDate);
                endDate.setFullYear(startDate.getFullYear() + 1);
                endDate.setDate(endDate.getDate() - 1);
                break;
            default:
                return;
        }
        
        setData('end_date', format(endDate, 'yyyy-MM-dd'));
    };

    // Reset form when budget changes
    useEffect(() => {
        if (budget) {
            setData({
                name: budget.name || '',
                amount: budget.amount || '',
                period: budget.period || 'monthly',
                time_frame: budget.time_frame || '1_month',
                time_frame_value: budget.time_frame_value || '',
                time_frame_unit: budget.time_frame_unit || 'months',
                start_date: budget.start_date ? format(new Date(budget.start_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
                end_date: budget.end_date ? format(new Date(budget.end_date), 'yyyy-MM-dd') : '',
                category_id: budget.category_id ? budget.category_id.toString() : 'none',
                notes: budget.notes || '',
                rollover_enabled: budget.rollover_enabled || false,
                rollover_amount: budget.rollover_amount || 0,
                budget_method: budget.budget_method || 'standard',
                method_settings: budget.method_settings || {},
            });
        } else {
            reset();
            setData({
                name: '',
                amount: '',
                period: 'monthly',
                time_frame: '1_month',
                time_frame_value: '',
                time_frame_unit: 'months',
                start_date: format(new Date(), 'yyyy-MM-dd'),
                end_date: '',
                category_id: 'none',
                notes: '',
                rollover_enabled: false,
                rollover_amount: 0,
                budget_method: 'standard',
                method_settings: {},
            });
            // Calculate initial end date for new budgets
            setTimeout(calculateEndDate, 0);
        }
    }, [budget, isOpen]);

    // Form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Convert 'none' back to empty string/null before submitting
        const submissionData = {
            ...data,
            category_id: data.category_id === 'none' ? '' : data.category_id
        };
        
        if (budget) {
            // Update existing budget
            patch(route('budgets.update', budget.id), {
                data: submissionData,
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                    reset();
                }
            });
        } else {
            // Create new budget
            post(route('budgets.store'), {
                data: submissionData,
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                    reset();
                }
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{budget ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
                    <DialogDescription>
                        {budget ? 'Update your budget details below.' : 'Set up a new budget to track your spending for a specific category and period.'}
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name, Amount, and Category in a single row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Budget Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Budget Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                            />
                            {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={data.category_id}
                                onValueChange={(value) => setData('category_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    <SelectItem value="none">General (No Category)</SelectItem>
                                    
                                    {/* Expense Categories and Subcategories */}
                                    {mainCategories?.map(mainCategory => (
                                        <React.Fragment key={mainCategory.id}>
                                            <SelectItem
                                                value={mainCategory.id.toString()}
                                                className="font-medium"
                                            >
                                                {mainCategory.name}
                                            </SelectItem>
                                            
                                            {subcategories?.[mainCategory.id]?.map(subcategory => (
                                                <SelectItem
                                                    key={`expense-${mainCategory.id}-${subcategory.id}`}
                                                    value={subcategory.id.toString()}
                                                    className="pl-6"
                                                >
                                                    {subcategory.name}
                                                </SelectItem>
                                            ))}
                                        </React.Fragment>
                                    ))}

                                    {/* Other Categories */}
                                    {subcategories?.null && subcategories.null.length > 0 && (
                                        <React.Fragment>
                                            <SelectLabel className="font-medium text-gray-700 dark:text-gray-300 mt-2">
                                                Other
                                            </SelectLabel>
                                            {subcategories.null.map(subcategory => (
                                                <SelectItem
                                                    key={`other-${subcategory.id}`}
                                                    value={subcategory.id.toString()}
                                                >
                                                    {subcategory.name}
                                                </SelectItem>
                                            ))}
                                        </React.Fragment>
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
                        </div>
                    </div>

                    {/* Period, Time Frame, and Budget Method */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="period">Period</Label>
                            <Select
                                value={data.period}
                                onValueChange={(value) => {
                                    setData('period', value);
                                    calculateEndDate();
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a period" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(budgetPeriods).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.period && <p className="text-sm text-red-500">{errors.period}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="time_frame">Time Frame</Label>
                            <Select
                                value={data.time_frame}
                                onValueChange={(value) => setData('time_frame', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a time frame" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(timeFrameOptions).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">
                                How long this budget runs overall
                            </p>
                            {errors.time_frame && <p className="text-sm text-red-500">{errors.time_frame}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="budget_method">Budget Method</Label>
                            <Select
                                value={data.budget_method}
                                onValueChange={(value) => setData('budget_method', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a budget method" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(budgetMethods).map(([key, value]) => (
                                        <SelectItem key={key} value={key}>
                                            {value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.budget_method && <p className="text-sm text-red-500">{errors.budget_method}</p>}
                        </div>
                    </div>

                    {/* Custom Time Frame (conditional) */}
                    {data.time_frame === 'custom' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="time_frame_value">Custom Duration</Label>
                                <Input
                                    id="time_frame_value"
                                    type="number"
                                    min="1"
                                    value={data.time_frame_value}
                                    onChange={(e) => setData('time_frame_value', e.target.value)}
                                    placeholder="Enter number"
                                />
                                {errors.time_frame_value && <p className="text-sm text-red-500">{errors.time_frame_value}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="time_frame_unit">Time Unit</Label>
                                <Select
                                    value={data.time_frame_unit}
                                    onValueChange={(value) => setData('time_frame_unit', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="days">Days</SelectItem>
                                        <SelectItem value="weeks">Weeks</SelectItem>
                                        <SelectItem value="months">Months</SelectItem>
                                        <SelectItem value="years">Years</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.time_frame_unit && <p className="text-sm text-red-500">{errors.time_frame_unit}</p>}
                            </div>
                        </div>
                    )}

                    {/* Start Date and End Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_date">Start Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !data.start_date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {data.start_date ? format(new Date(data.start_date), "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={data.start_date ? new Date(data.start_date) : undefined}
                                        onSelect={(selectedDate) => {
                                            if (selectedDate) {
                                                const formattedDate = format(selectedDate, 'yyyy-MM-dd');
                                                setData('start_date', formattedDate);
                                                // Recalculate end date when start date changes
                                                calculateEndDate();
                                            }
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.start_date && <p className="text-sm text-red-500">{errors.start_date}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="end_date">End Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !data.end_date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {data.end_date ? format(new Date(data.end_date), "PPP") : <span>Auto-calculated</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={data.end_date ? new Date(data.end_date) : undefined}
                                        onSelect={(selectedDate) => selectedDate && setData('end_date', format(selectedDate, 'yyyy-MM-dd'))}
                                        initialFocus
                                        disabled={(date) => date < new Date(data.start_date)}
                                    />
                                </PopoverContent>
                            </Popover>
                            <p className="text-xs text-gray-500">
                                Automatically calculated based on period
                            </p>
                            {errors.end_date && <p className="text-sm text-red-500">{errors.end_date}</p>}
                        </div>
                    </div>

                    {/* Rollover Settings */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="rollover_enabled"
                            checked={data.rollover_enabled}
                            onCheckedChange={(checked) => setData('rollover_enabled', checked)}
                        />
                        <Label htmlFor="rollover_enabled">Enable Budget Rollover</Label>
                    </div>

                    {/* Budget Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Add any additional notes about this budget..."
                            rows={3}
                        />
                        {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                    </div>

                    {/* Current Rollover Amount (only for editing) */}
                    {budget && data.rollover_enabled && (
                        <div className="space-y-2">
                            <Label htmlFor="rollover_amount">Current Rollover Amount</Label>
                            <Input
                                id="rollover_amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.rollover_amount}
                                onChange={(e) => setData('rollover_amount', e.target.value)}
                            />
                            <p className="text-xs text-gray-500">
                                Amount rolled over from previous periods
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
                        {budget ? 'Update' : 'Create'} Budget
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
