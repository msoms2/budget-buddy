import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { XIcon, CheckIcon } from 'lucide-react';

const commonIcons = ['💰', '🏦', '💳', '🎯', '📈', '🏠', '🚗', '✈️', '📚', '🎓', '👶', '🏥', '🛍️', '⚡'];
const commonColors = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0d9488', '#4f46e5', '#0369a1'];

export default function SavingsCategoryModal({ isOpen, onClose, category = null, onSuccess }) {
    const { props } = usePage();
    const { auth } = props;
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [data, setData] = useState({
        name: '',
        description: '',
        icon: '💰',
        icon_color: '#2563eb',
        bg_color: '#ffffff',
    });

    const setFormData = (key, value) => {
        setData(prev => ({ ...prev, [key]: value }));
        setErrors(prev => ({ ...prev, [key]: null }));
    };

    useEffect(() => {
        if (category) {
            setData({
                name: category.name || '',
                description: category.description || '',
                icon: category.icon || '💰',
                icon_color: category.icon_color || '#2563eb',
                bg_color: category.bg_color || '#ffffff',
            });
        } else {
            setData({
                name: '',
                description: '',
                icon: '💰',
                icon_color: '#2563eb',
                bg_color: '#ffffff',
            });
        }
        setErrors({});
    }, [category, isOpen]);
const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (processing) return;
    
    setProcessing(true);
    setErrors({});

    // Validate required fields
    const validationErrors = {};
    if (!data.name?.trim()) {
        validationErrors.name = 'Name is required';
    }
    if (!data.icon) {
        validationErrors.icon = 'Icon is required';
    }
    if (!data.icon_color) {
        validationErrors.icon_color = 'Icon color is required';
    }
    if (!data.bg_color) {
        validationErrors.bg_color = 'Background color is required';
    }

    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setProcessing(false);
        return;
    }

    console.log('Submitting form with data:', data);
    
    try {
        if (!auth?.user?.id) {
            setErrors({ general: 'User authentication required.' });
            setProcessing(false);
            return;
        }

        const payload = { ...data };
            
            
            let response;
            if (category) {
                console.log('Updating category:', category.id);
                response = await axios.put(route('api.savings-categories.update', category.id), payload);
            } else {
                console.log('Creating new category');
                response = await axios.post(route('api.savings-categories.store'), payload);
            }
            console.log('Server response:', response.data);
            
            if (onSuccess) {
                await onSuccess();
            }
            onClose();
        } catch (error) {
            console.error('Error:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else if (error.response?.data?.message) {
                setErrors({ general: error.response.data.message });
            } else if (error.message) {
                setErrors({ general: error.message });
            } else {
                setErrors({ general: 'An error occurred while saving the category.' });
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{category ? 'Edit Category' : 'Create New Category'}</DialogTitle>
                    <DialogDescription>
                        {category ? 'Update category details below.' : 'Create a new savings category to organize your savings goals.'}
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {errors.general && (
                        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded p-4">
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="name">Category Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={e => setFormData('name', e.target.value)}
                            placeholder="e.g., Emergency Fund, Vacation"
                        />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Icon</Label>
                        <div className="grid grid-cols-7 gap-2">
                            {commonIcons.map(icon => (
                                <Button
                                    key={icon}
                                    type="button"
                                    variant={data.icon === icon ? "default" : "outline"}
                                    className="h-10 w-10 p-0"
                                    onClick={() => setFormData('icon', icon)}
                                >
                                    {icon}
                                </Button>
                            ))}
                        </div>
                        {errors.icon && <p className="text-sm text-red-500">{errors.icon}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Icon Color</Label>
                        <div className="grid grid-cols-8 gap-2">
                            {commonColors.map(color => (
                                <Button
                                    key={color}
                                    type="button"
                                    variant="outline"
                                    className={`h-8 w-8 rounded-full p-0 ${data.icon_color === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setFormData('icon_color', color)}
                                />
                            ))}
                        </div>
                        {errors.icon_color && <p className="text-sm text-red-500">{errors.icon_color}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Background Color</Label>
                        <div className="grid grid-cols-8 gap-2">
                            {['#ffffff', '#f3f4f6', '#fef3c7', '#dcfce7', '#dbeafe', '#f3e8ff', '#ffe4e6', '#f1f5f9'].map(color => (
                                <Button
                                    key={color}
                                    type="button"
                                    variant="outline"
                                    className={`h-8 w-8 rounded-full p-0 ${data.bg_color === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setFormData('bg_color', color)}
                                />
                            ))}
                        </div>
                        {errors.bg_color && <p className="text-sm text-red-500">{errors.bg_color}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={e => setFormData('description', e.target.value)}
                            rows={3}
                            placeholder="Describe the purpose of this category..."
                        />
                        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                    </div>
                    
                    <DialogFooter className="mt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="gap-2"
                            type="button"
                        >
                            <XIcon className="h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="gap-2"
                        >
                            <CheckIcon className="h-4 w-4" />
                            {category ? 'Update' : 'Create'} Category
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}