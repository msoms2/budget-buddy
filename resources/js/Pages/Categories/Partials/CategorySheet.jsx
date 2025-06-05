import React, { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/components/InputError';
import { 
    Sheet,
    SheetContent, 
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    PencilIcon, 
    XIcon,
    CheckIcon,
    PaintbrushIcon,
    ImageIcon,
    FolderTree
} from 'lucide-react';

// Simple emoji picker options
const emojiOptions = [
    '💰', '💵', '💸', '🤑', '💎', '👔', '💼', '🏢', '🏆', '📈', 
    '💹', '📊', '💻', '🖥️', '📱', '📝', '✏️', '🎓', '🎯', '⚙️'
];

// Additional emoji options for expense categories
const expenseEmojiOptions = [
    '🛒', '🍕', '🍔', '🚗', '🏠', '💊', '📚', '🎬', '✈️', '🚌',
    '🚄', '🏥', '💄', '👟', '👕', '💇', '🎭', '🎮', '📱', '💻'
];

// Background colors with labels
const bgColorOptions = [
    { color: '#f3f4f6', name: 'Light Gray' },
    { color: '#fee2e2', name: 'Light Red' },
    { color: '#fef3c7', name: 'Light Yellow' },
    { color: '#d1fae5', name: 'Light Green' },
    { color: '#dbeafe', name: 'Light Blue' },
    { color: '#e0e7ff', name: 'Light Indigo' },
    { color: '#ede9fe', name: 'Light Purple' },
    { color: '#fbcfe8', name: 'Light Pink' },
    { color: '#f8fafc', name: 'Off White' },
    { color: '#fff7ed', name: 'Light Orange' }
];

// Icon colors with labels
const iconColorOptions = [
    { color: '#000000', name: 'Black' },
    { color: '#ef4444', name: 'Red' },
    { color: '#f59e0b', name: 'Amber' },
    { color: '#10b981', name: 'Emerald' },
    { color: '#3b82f6', name: 'Blue' },
    { color: '#6366f1', name: 'Indigo' },
    { color: '#8b5cf6', name: 'Violet' },
    { color: '#ec4899', name: 'Pink' },
    { color: '#64748b', name: 'Slate' },
    { color: '#ea580c', name: 'Orange' }
];

export default function CategorySheet({ isOpen, onClose, category = null, categoryType = 'expense', parentCategories = [] }) {
    const defaultIcon = categoryType === 'expense' ? '🛒' : '💰';
    
    // Initialize form with existing data if editing, otherwise use defaults
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: category?.name || '',
        description: category?.description || '',
        icon: category?.icon || defaultIcon,
        icon_color: category?.icon_color || '#000000',
        bg_color: category?.bg_color || '#f3f4f6',
        type: category?.type || categoryType,
        parent_id: category?.parent_id || '',
        stay_on_page: false
    });
    
    // UI state
    const [activeTab, setActiveTab] = useState('general');
    const [editingName, setEditingName] = useState(false);
    const [editingDescription, setEditingDescription] = useState(false);
    const [isSubcategory, setIsSubcategory] = useState(!!data.parent_id);
    
    // Refs
    const nameInputRef = useRef(null);
    const descriptionInputRef = useRef(null);
    
    // Dynamically select emoji options based on category type
    const currentEmojiOptions = data.type === 'expense' 
        ? [...expenseEmojiOptions, ...emojiOptions.slice(0, 10)]
        : [...emojiOptions, ...expenseEmojiOptions.slice(0, 10)];
    
    // Reset form when category changes
    useEffect(() => {
        if (category) {
            setData({
                name: category.name || '',
                description: category.description || '',
                icon: category.icon || defaultIcon,
                icon_color: category.icon_color || '#000000',
                bg_color: category.bg_color || '#f3f4f6',
                type: category.type || categoryType,
                parent_id: category.parent_id || '',
                stay_on_page: false
            });
            setIsSubcategory(!!category.parent_id);
        } else {
            setData({
                name: '',
                description: '',
                icon: defaultIcon,
                icon_color: '#000000',
                bg_color: '#f3f4f6',
                type: categoryType,
                parent_id: '',
                stay_on_page: false
            });
            setIsSubcategory(false);
        }
    }, [category, categoryType]);
    
    // Form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Remove parent_id if not a subcategory
        const formData = { ...data };
        if (!isSubcategory) {
            formData.parent_id = '';
        }
        
        if (category) {
            // Update existing category
            patch(route('categories.update', {
                id: category.id,
                type: data.type
            }), {
                ...formData,
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                    reset();
                }
            });
        } else {
            // Create new category
            post(route('categories.store'), {
                ...formData,
                preserveScroll: true,
                onSuccess: () => {
                    if (!data.stay_on_page) {
                        onClose();
                    }
                    reset();
                    setIsSubcategory(false);
                }
            });
        }
    };
    
    // Switch category type
    const handleCategoryTypeChange = (type) => {
        setData('type', type);
        // Set a default icon based on the category type
        if (!data.icon) {
            setData('icon', type === 'expense' ? '🛒' : '💰');
        }
        // Clear parent_id when changing types
        if (isSubcategory) {
            setData('parent_id', '');
            setIsSubcategory(false);
        }
    };
    
    // Handle subcategory toggle
    const handleSubcategoryToggle = (checked) => {
        setIsSubcategory(checked);
        if (!checked) {
            setData('parent_id', '');
        }
    };
    
    // Focus input when editing starts
    useEffect(() => {
        if (editingName && nameInputRef.current) {
            nameInputRef.current.focus();
        }
        if (editingDescription && descriptionInputRef.current) {
            descriptionInputRef.current.focus();
        }
    }, [editingName, editingDescription]);
    
    // Style variables based on category type
    const primaryColor = data.type === 'expense' ? 'text-red-600' : 'text-green-600';
    const primaryBg = data.type === 'expense' ? 'bg-red-50' : 'bg-green-50';
    const primaryBorder = data.type === 'expense' ? 'border-red-200' : 'border-green-200';
    const primaryTabColor = data.type === 'expense' ? 'data-[state=active]:bg-red-50 data-[state=active]:text-red-700' : 'data-[state=active]:bg-green-50 data-[state=active]:text-green-700';
    const badgeBg = data.type === 'expense' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200';
    const buttonColor = data.type === 'expense' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700';

    // Get filtered parent categories based on current type (excluding subcategories)
    const filteredParentCategories = parentCategories.filter(cat =>
        cat.type === data.type &&
        (!category || cat.id !== category.id) &&
        !cat.parent_id
    );

    return (
        <Sheet
            open={isOpen}
            onOpenChange={(state) => {
                if (!state) onClose();
            }}
        >
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader className="pb-4">
                    <div className="flex justify-between items-center">
                        <SheetTitle className="text-2xl">
                            {category ? 'Edit Category' : 'Create New Category'}
                        </SheetTitle>
                        
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className={`${data.type === 'expense' ? 'border-red-200 bg-red-50 text-red-700' : 'border-gray-200'}`}
                                onClick={() => handleCategoryTypeChange('expense')}
                                disabled={category?.is_fixed_type}
                            >
                                Expense
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className={`${data.type === 'earning' ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200'}`}
                                onClick={() => handleCategoryTypeChange('earning')}
                                disabled={category?.is_fixed_type}
                            >
                                Income
                            </Button>
                        </div>
                    </div>
                    <SheetDescription>
                        {category ? 'Update your category details below.' : 'Create a new category to organize your finances.'}
                    </SheetDescription>
                </SheetHeader>
                
                <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 my-2">
                        <TabsTrigger value="general" className={primaryTabColor}>General</TabsTrigger>
                        <TabsTrigger value="appearance" className={primaryTabColor}>Appearance</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="general" className="mt-2">
                        <div className="space-y-4">
                            {/* Preview Card */}
                            <Card className={`border ${primaryBorder} overflow-hidden`}>
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Icon Preview */}
                                        <div 
                                            className={`w-16 h-16 rounded-full flex items-center justify-center relative cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-blue-400`}
                                            style={{ 
                                                backgroundColor: data.bg_color,
                                                borderColor: data.type === 'expense' ? '#ef4444' : '#10b981',
                                                borderWidth: '2px'
                                            }}
                                            onClick={() => setActiveTab('appearance')}
                                        >
                                            <span 
                                                className="text-3xl"
                                                style={{ color: data.icon_color }}
                                            >
                                                {data.icon}
                                            </span>
                                        </div>
                                        
                                        <div className="flex-grow">
                                            {/* Category Name */}
                                            <div className="mb-3">
                                                <Label htmlFor="name" className="text-sm font-medium text-muted-foreground mb-1 block">Name</Label>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    placeholder="Enter category name"
                                                    className={`font-medium ${errors.name ? 'border-red-500' : ''}`}
                                                />
                                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                            </div>
                                            
                                            {/* Category Description */}
                                            <div>
                                                <Label htmlFor="description" className="text-sm font-medium text-muted-foreground mb-1 block">Description (Optional)</Label>
                                                <Textarea
                                                    id="description"
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    placeholder="Add a brief description for this category"
                                                    rows={2}
                                                    className={errors.description ? 'border-red-500' : ''}
                                                />
                                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                                            </div>
                                            
                                            {/* Category Type Badge */}
                                            <div className="mt-3">
                                                <Badge variant="outline" className={badgeBg}>
                                                    {data.type === 'expense' ? 'Expense' : 'Income'} Category
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            {/* Subcategory Option */}
                            {(!category || (category && category.parent_id)) && (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_subcategory"
                                            checked={isSubcategory}
                                            onCheckedChange={handleSubcategoryToggle}
                                            disabled={category?.is_fixed_type}
                                        />
                                        <Label
                                            htmlFor="is_subcategory"
                                            className={`flex items-center gap-1.5 text-sm ${category?.is_fixed_type ? 'text-muted-foreground' : ''}`}
                                        >
                                            <FolderTree className="h-4 w-4" />
                                            This is a subcategory
                                            {category?.is_fixed_type && " (locked)"}
                                        </Label>
                                    </div>
                                {/* Parent Category Dropdown - only shown when isSubcategory is true */}
                                {isSubcategory && (
                                    <div className="ml-6 space-y-2">
                                        <Label 
                                            htmlFor="parent_id" 
                                            className="text-sm font-medium text-muted-foreground block"
                                        >
                                            Parent Category
                                        </Label>
                                        <select
                                            id="parent_id"
                                            value={data.parent_id}
                                            onChange={(e) => setData('parent_id', e.target.value)}
                                            className={`
                                                w-full h-10 px-3 py-2 rounded-md border bg-background text-foreground
                                                focus:outline-none focus:ring-2 ring-offset-background
                                                ${primaryTabColor}
                                                ${errors.parent_id ? 'border-red-500' : 'border-input'}
                                            `}
                                            required={isSubcategory}
                                        >
                                            <option value="">Select a parent category</option>
                                            {filteredParentCategories.map((parentCategory) => (
                                                <option key={parentCategory.id} value={parentCategory.id}>
                                                    {parentCategory.icon && `${parentCategory.icon} `}{parentCategory.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.parent_id && <p className="text-red-500 text-sm mt-1">{errors.parent_id}</p>}
                                        {filteredParentCategories.length === 0 && (
                                            <p className="text-orange-500 text-sm">
                                                No parent categories available. Please create a parent category first.
                                            </p>
                                        )}
                                    </div>
                                )}
                                </div>
                            )}
                            
                            {/* Stay on Page Option */}
                            {!category && (
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id="stay_on_page" 
                                        checked={data.stay_on_page}
                                        onCheckedChange={(checked) => setData('stay_on_page', checked)}
                                    />
                                    <Label htmlFor="stay_on_page" className="text-sm text-muted-foreground">
                                        Stay on this page after creating category
                                    </Label>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="appearance" className="mt-2">
                        {/* Icon Selection */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-base font-medium mb-3 flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4" /> 
                                    Select Icon
                                </h3>
                                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                                    {currentEmojiOptions.map((emoji, index) => (
                                        <TooltipProvider key={index} delayDuration={300}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={`h-10 w-10 p-0 ${data.icon === emoji ? 'bg-muted ring-2 ring-primary' : ''}`}
                                                        onClick={() => setData('icon', emoji)}
                                                    >
                                                        <span className="text-xl">{emoji}</span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Select {emoji}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Icon Color Selection */}
                            <div>
                                <h3 className="text-base font-medium mb-3 flex items-center gap-2">
                                    <PaintbrushIcon className="h-4 w-4" /> 
                                    Icon Color
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {iconColorOptions.map((option, index) => (
                                        <TooltipProvider key={index} delayDuration={300}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={`h-8 w-8 rounded-full p-0 ${data.icon_color === option.color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                                                        style={{ backgroundColor: option.color }}
                                                        onClick={() => setData('icon_color', option.color)}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{option.name}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ))}
                                    <input
                                        type="color"
                                        value={data.icon_color}
                                        onChange={(e) => setData('icon_color', e.target.value)}
                                        className="w-8 h-8 cursor-pointer border-none p-0 rounded-full overflow-hidden"
                                        title="Custom color"
                                    />
                                </div>
                            </div>
                            
                            {/* Background Color Selection */}
                            <div>
                                <h3 className="text-base font-medium mb-3">Background Color</h3>
                                <div className="flex flex-wrap gap-2">
                                    {bgColorOptions.map((option, index) => (
                                        <TooltipProvider key={index} delayDuration={300}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={`h-8 w-8 rounded-full p-0 ${data.bg_color === option.color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                                                        style={{ backgroundColor: option.color }}
                                                        onClick={() => setData('bg_color', option.color)}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{option.name}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ))}
                                    <input
                                        type="color"
                                        value={data.bg_color}
                                        onChange={(e) => setData('bg_color', e.target.value)}
                                        className="w-8 h-8 cursor-pointer border-none p-0 rounded-full overflow-hidden"
                                        title="Custom color"
                                    />
                                </div>
                            </div>
                            
                            {/* Preview */}
                            <div>
                                <h3 className="text-base font-medium mb-3">Preview</h3>
                                <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                                    <div 
                                        className="w-16 h-16 rounded-full flex items-center justify-center"
                                        style={{ 
                                            backgroundColor: data.bg_color,
                                            borderColor: data.type === 'expense' ? '#ef4444' : '#10b981',
                                            borderWidth: '2px'
                                        }}
                                    >
                                        <span 
                                            className="text-3xl"
                                            style={{ color: data.icon_color }}
                                        >
                                            {data.icon}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
                
                <SheetFooter className="absolute bottom-0 left-0 right-0 bg-muted/40 p-4 border-t">
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
                        disabled={processing || (isSubcategory && !data.parent_id)}
                        className={`gap-2 ${buttonColor}`}
                    >
                        <CheckIcon className="h-4 w-4" />
                        {category ? 'Update' : 'Create'} Category
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}