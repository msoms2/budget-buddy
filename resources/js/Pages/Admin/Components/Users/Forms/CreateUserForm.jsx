import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    UserPlusIcon,
    MailIcon,
    LockIcon,
    UserIcon,
    PhoneIcon,
    MapPinIcon,
    AlertCircleIcon
} from "lucide-react";

/**
 * CreateUserForm Component
 * 
 * Form for creating new users with:
 * - Personal information fields
 * - Account credentials
 * - Role assignment
 * - Contact information
 * - Validation and error handling
 */
export default function CreateUserForm({ 
    availableRoles = [], 
    countries = [], 
    currencies = [],
    onSuccess,
    onCancel,
    className = "" 
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        address: '',
        bio: '',
        date_of_birth: '',
        country_id: "none",
        currency_id: "none",
        roles: [],
        send_welcome_email: true,
        require_password_change: true
    });

    const [showPassword, setShowPassword] = useState(false);

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Convert "none" values to null before submitting
        const formData = {
            ...data,
            country_id: data.country_id === "none" ? null : data.country_id,
            currency_id: data.currency_id === "none" ? null : data.currency_id
        };
        
        post(route('admin.users.store'), {
            onSuccess: () => {
                reset();
                onSuccess?.();
            },
            onError: (errors) => {
                console.error('Validation errors:', errors);
            }
        });
    };

    // Handle role selection
    const handleRoleChange = (roleId, checked) => {
        if (checked) {
            setData('roles', [...data.roles, roleId]);
        } else {
            setData('roles', data.roles.filter(id => id !== roleId));
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
            {/* Personal Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5" />
                        Personal Information
                    </CardTitle>
                    <CardDescription>
                        Basic user information and contact details
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
                                onChange={(e) => setData('name', e.target.value)}
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
                                    onChange={(e) => setData('email', e.target.value)}
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
                                    onChange={(e) => setData('phone', e.target.value)}
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
                                onChange={(e) => setData('date_of_birth', e.target.value)}
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
                                onChange={(e) => setData('address', e.target.value)}
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
                            onChange={(e) => setData('bio', e.target.value)}
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
                                value={data.country_id}
                                onValueChange={(value) => setData('country_id', value)}
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
                                value={data.currency_id}
                                onValueChange={(value) => setData('currency_id', value)}
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

            {/* Account Security */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LockIcon className="h-5 w-5" />
                        Account Security
                    </CardTitle>
                    <CardDescription>
                        Set up account credentials and security options
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Password <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Enter password"
                                required
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">
                                Confirm Password <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password_confirmation"
                                type={showPassword ? 'text' : 'password'}
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="Confirm password"
                                required
                                className={errors.password_confirmation ? 'border-red-500' : ''}
                            />
                            {errors.password_confirmation && (
                                <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                            )}
                        </div>
                    </div>

                    {/* Show Password Toggle */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="show_password"
                            checked={showPassword}
                            onCheckedChange={setShowPassword}
                        />
                        <Label htmlFor="show_password" className="text-sm">
                            Show passwords
                        </Label>
                    </div>

                    {/* Security Options */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="require_password_change"
                                checked={data.require_password_change}
                                onCheckedChange={(checked) => setData('require_password_change', checked)}
                            />
                            <Label htmlFor="require_password_change" className="text-sm">
                                Require password change on first login
                            </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="send_welcome_email"
                                checked={data.send_welcome_email}
                                onCheckedChange={(checked) => setData('send_welcome_email', checked)}
                            />
                            <Label htmlFor="send_welcome_email" className="text-sm">
                                Send welcome email with login instructions
                            </Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Role Assignment */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlusIcon className="h-5 w-5" />
                        Role Assignment
                    </CardTitle>
                    <CardDescription>
                        Assign roles and permissions to the user
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {availableRoles.length > 0 ? (
                            availableRoles.map((role) => (
                                <div key={role.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`role_${role.id}`}
                                        checked={data.roles.includes(role.id)}
                                        onCheckedChange={(checked) => handleRoleChange(role.id, checked)}
                                    />
                                    <div>
                                        <Label htmlFor={`role_${role.id}`} className="font-medium">
                                            {role.name}
                                        </Label>
                                        {role.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {role.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <Alert>
                                <AlertCircleIcon className="h-4 w-4" />
                                <AlertDescription>
                                    No roles are available for assignment. Contact your system administrator.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                    {errors.roles && (
                        <p className="text-sm text-red-500 mt-2">{errors.roles}</p>
                    )}
                </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex items-center gap-4">
                <Button type="submit" disabled={processing} className="flex items-center gap-2">
                    <UserPlusIcon className="h-4 w-4" />
                    {processing ? 'Creating User...' : 'Create User'}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={processing}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}