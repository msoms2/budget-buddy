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
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { CalendarIcon, XIcon, CheckIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function GoalModal({ isOpen, onClose, goal = null, categories = [] }) {
    // Initialize form with existing data if editing, otherwise use defaults
    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: goal?.title || '',
        target_amount: goal?.target_amount || '',
        target_date: goal?.target_date || '',
        category_id: goal?.category_id || 'none',
        description: goal?.description || '',
        current_amount: goal?.current_amount || 0
    });

    // Reset form when goal changes
    useEffect(() => {
        if (goal) {
            reset({
                title: goal.title || '',
                target_amount: goal.target_amount || '',
                target_date: goal.target_date || '',
                category_id: goal.category_id || 'none',
                description: goal.description || '',
                current_amount: goal.current_amount || 0
            });
        } else {
            reset({
                title: '',
                target_amount: '',
                target_date: '',
                category_id: 'none',
                description: '',
                current_amount: 0
            });
        }
    }, [goal, isOpen]);

    // Form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Create a copy of data to modify before submission
        const formData = { ...data };
        
        // Convert "none" value to null for the backend
        if (formData.category_id === 'none') {
            formData.category_id = null;
        }
        
        if (goal) {
            // Update existing goal
            put(route('goals.update', goal.id), {
                ...formData,
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                }
            });
        } else {
            // Create new goal
            post(route('goals.store'), {
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
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{goal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
                    <DialogDescription>
                        {goal ? 'Update your financial goal details below.' : 'Set up a new financial goal with target amount and deadline.'}
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Goal Title</Label>
                        <Input
                            id="title"
                            type="text"
                            value={data.title}
                            onChange={e => setData('title', e.target.value)}
                            placeholder="e.g., New Car, Emergency Fund"
                        />
                        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="target_amount">Target Amount</Label>
                        <Input
                            id="target_amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.target_amount}
                            onChange={e => setData('target_amount', e.target.value)}
                            placeholder="0.00"
                        />
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
                                <SelectItem value="none">No Category</SelectItem>

                                {/* Income Categories Section */}
                                <SelectGroup>
                                    <SelectLabel
                                        className="font-semibold text-gray-500 dark:text-gray-400 pointer-events-none select-none"
                                    >
                                        ---INCOME---
                                    </SelectLabel>
                                    
                                    {categories.mainCategories?.filter(cat => cat.type === 'income').map(mainCategory => (
                                        <React.Fragment key={mainCategory.id}>
                                            <SelectItem
                                                value={mainCategory.id.toString()}
                                                className="font-medium"
                                            >
                                                {mainCategory.name}
                                            </SelectItem>
                                            
                                            {categories.subcategories?.[mainCategory.id]?.map(subcategory => (
                                                <SelectItem
                                                    key={`income-${mainCategory.id}-${subcategory.id}`}
                                                    value={subcategory.id.toString()}
                                                    className="pl-6"
                                                >
                                                    {subcategory.name}
                                                </SelectItem>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </SelectGroup>

                                {/* Expense Categories Section */}
                                <SelectGroup>
                                    <SelectLabel
                                        className="font-semibold text-gray-500 dark:text-gray-400 pointer-events-none select-none mt-2"
                                    >
                                        ---EXPENSE---
                                    </SelectLabel>
                                    
                                    {categories.mainCategories?.filter(cat => cat.type === 'expense').map(mainCategory => (
                                        <React.Fragment key={mainCategory.id}>
                                            <SelectItem
                                                value={mainCategory.id.toString()}
                                                className="font-medium"
                                            >
                                                {mainCategory.name}
                                            </SelectItem>
                                            
                                            {categories.subcategories?.[mainCategory.id]?.map(subcategory => (
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
                                </SelectGroup>

                                {/* Other Categories */}
                                {categories.subcategories?.null && categories.subcategories.null.length > 0 && (
                                    <SelectGroup>
                                        <SelectLabel className="font-medium text-gray-700 dark:text-gray-300 mt-2">
                                            Other
                                        </SelectLabel>
                                        {categories.subcategories.null.map(subcategory => (
                                            <SelectItem
                                                key={`other-${subcategory.id}`}
                                                value={subcategory.id.toString()}
                                            >
                                                {subcategory.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                )}
                            </SelectContent>
                        </Select>
                        {errors.category_id && <p className="text-sm text-red-500">{errors.category_id}</p>}
                    </div>

                    {goal && (
                        <div className="space-y-2">
                            <Label htmlFor="current_amount">Current Amount</Label>
                            <Input
                                id="current_amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={data.current_amount}
                                onChange={e => setData('current_amount', e.target.value)}
                                placeholder="0.00"
                            />
                            <p className="text-xs text-gray-500">
                                Current progress towards your goal
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
                            placeholder="Describe your financial goal..."
                        />
                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                    </div>
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
                        {goal ? 'Update' : 'Create'} Goal
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}