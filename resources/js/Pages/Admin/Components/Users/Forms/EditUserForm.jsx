import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    EditIcon,
    MailIcon,
    UserIcon,
    PhoneIcon,
    MapPinIcon,
    SaveIcon,
    AlertCircleIcon,
    CheckCircleIcon
} from "lucide-react";

/**
 * EditUserForm Component
 * 
 * Form for editing existing user information:
 * - Personal information updates
 * - Contact details
 * - Account settings
 * - Validation and error handling
 * - Change tracking
 */
export default function EditUserForm({ 
    user,
    countries = [], 
    currencies = [],
    onSuccess,
    onCancel,
    className = "" 
}) {
    const { data, setData, patch, processing, errors, reset, isDirty, recentlySuccessful } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        date_of_birth: user.date_of_birth || '',
        country_id: user.country_id || 'none',
        currency_id: user.currency_id || 'none',
        email_verified_at: user.email_verified_at || null
    });

    const [hasChanges, setHasChanges] = useState(false);

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Convert "none" values to null before submitting
        const formData = {
            ...data,
            country_id: data.country_id === "none" ? null : data.country_id,
            currency_id: data.currency_id === "none" ? null : data.currency_id
        };
        
        patch(route('admin.users.update', user.id), {
            data: formData,
            onSuccess: () => {
                setHasChanges(false);
                onSuccess?.();
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
            }
        });
    };

    // Handle form reset
    const handleReset = () => {
        reset();
        setHasChanges(false);
    };

    // Track changes
    const handleFieldChange = (field, value) => {
        setData(field, value);
        setHasChanges(true);
    };

    // Toggle email verification
    const handleEmailVerificationToggle = (verified) => {
        const value = verified ? new Date().toISOString() : null;
        handleFieldChange('email_verified_at', value);
    };

    return (
        <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
            {/* Success Message */}
            {recentlySuccessful && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                    <CheckCircleIcon className="h-4 w-4" />
                    <AlertDescription>
                        User information has been updated successfully.
                    </AlertDescription>
                </Alert>
            )}

            {/* Changes Warning */}
            {hasChanges && (
                <Alert>
                    <AlertCircleIcon className="h-4 w-4" />
                    <AlertDescription>
                        You have unsaved changes. Please save or cancel to continue.
                    </AlertDescription>
                </Alert>
            )}

            {/* Personal Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5" />
                        Personal Information
                    </CardTitle>
                    <CardDescription>
                        Update user's basic information and contact details
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Full Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => handleFieldChange('name', e.target.value)}
                                placeholder="Enter full name"
                                required
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        {/* Email Address */}
                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email Address <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => handleFieldChange('email', e.target.value)}
                                    placeholder="Enter email address"
                                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                                    required
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <PhoneIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                                    placeholder="Enter phone number"
                                    className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                                />
                            </div>
                            {errors.phone && (
                                <p className="text-sm text-red-500">{errors.phone}</p>
                            )}
                        </div>

                        {/* Date of Birth */}
                        <div className="space-y-2">
                            <Label htmlFor="date_of_birth">Date of Birth</Label>
                            <Input
                                id="date_of_birth"
                                type="date"
                                value={data.date_of_birth}
                                onChange={(e) => handleFieldChange('date_of_birth', e.target.value)}
                                className={errors.date_of_birth ? 'border-red-500' : ''}
                            />
                            {errors.date_of_birth && (
                                <p className="text-sm text-red-500">{errors.date_of_birth}</p>
                            )}
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <div className="relative">
                            <MapPinIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Textarea
                                id="address"
                                value={data.address}
                                onChange={(e) => handleFieldChange('address', e.target.value)}
                                placeholder="Enter address"
                                className={`pl-10 ${errors.address ? 'border-red-500' : ''}`}
                                rows={3}
                            />
                        </div>
                        {errors.address && (
                            <p className="text-sm text-red-500">{errors.address}</p>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            value={data.bio}
                            onChange={(e) => handleFieldChange('bio', e.target.value)}
                            placeholder="Enter user bio"
                            className={errors.bio ? 'border-red-500' : ''}
                            rows={3}
                        />
                        {errors.bio && (
                            <p className="text-sm text-red-500">{errors.bio}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Country */}
                        <div className="space-y-2">
                            <Label htmlFor="country_id">Country</Label>
                            <Select
                                value={data.country_id?.toString() || 'none'}
                                onValueChange={(value) => handleFieldChange('country_id', value)}
                            >
                                <SelectTrigger className={errors.country_id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No country selected</SelectItem>
                                    {countries.map((country) => (
                                        <SelectItem key={country.id} value={country.id.toString()}>
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.country_id && (
                                <p className="text-sm text-red-500">{errors.country_id}</p>
                            )}
                        </div>

                        {/* Default Currency */}
                        <div className="space-y-2">
                            <Label htmlFor="currency_id">Default Currency</Label>
                            <Select
                                value={data.currency_id?.toString() || 'none'}
                                onValueChange={(value) => handleFieldChange('currency_id', value)}
                            >
                                <SelectTrigger className={errors.currency_id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No currency selected</SelectItem>
                                    {currencies.map((currency) => (
                                        <SelectItem key={currency.id} value={currency.id.toString()}>
                                            {currency.code} - {currency.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.currency_id && (
                                <p className="text-sm text-red-500">{errors.currency_id}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                        Manage account status and verification settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Email Verification */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                            <Label className="font-medium">Email Verification</Label>
                            <p className="text-sm text-muted-foreground">
                                Control whether the user's email is verified
                            </p>
                        </div>
                        <Switch
                            checked={!!data.email_verified_at}
                            onCheckedChange={handleEmailVerificationToggle}
                        />
                    </div>

                    {/* Account Information Display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
                            <p className="font-medium">
                                {new Date(user.created_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                            <p className="font-medium">
                                {new Date(user.updated_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex items-center gap-4">
                <Button 
                    type="submit" 
                    disabled={processing || !hasChanges} 
                    className="flex items-center gap-2"
                >
                    <SaveIcon className="h-4 w-4" />
                    {processing ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={processing || !hasChanges}
                >
                    Reset Changes
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={processing}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}