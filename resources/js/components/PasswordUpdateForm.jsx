import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast.js';

export default function PasswordUpdateForm() {
    const { toast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    
    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: ''
    });

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(prev => !prev);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Add explicit method override for debugging
        put(route('password.update'), {
            preserveScroll: true,
            forceFormData: true,
            onBefore: () => {
                console.log('Submitting password update form with PUT method');
            },
            onSuccess: () => {
                reset('current_password', 'password', 'password_confirmation');
                toast({
                    title: 'Password Updated',
                    description: 'Your password has been successfully changed.',
                });
            },
            onError: (errors) => {
                console.error('Password update error:', errors);
            },
        });
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Password Security</CardTitle>
                        <CardDescription>
                            Update your password to maintain account security.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {/* Password Policy Information */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Password Policy:</strong> You cannot reuse your current password or any of your last 3 passwords for security reasons.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="current_password">Current Password</Label>
                        <div className="relative">
                            <Input
                                id="current_password"
                                type={showPassword ? "text" : "password"}
                                value={data.current_password}
                                onChange={e => setData('current_password', e.target.value)}
                                className="pr-10 transition-all focus:ring-2 focus:ring-blue-500/20"
                            />
                            <button 
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.current_password && (
                            <p className="text-sm text-red-500 mt-1">{errors.current_password}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showNewPassword ? "text" : "password"}
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className="pr-10 transition-all focus:ring-2 focus:ring-blue-500/20"
                            />
                            <button 
                                type="button"
                                onClick={toggleNewPasswordVisibility}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                {showNewPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <div className="space-y-1 mt-1">
                                {Array.isArray(errors.password) ? (
                                    errors.password.map((error, index) => (
                                        <p key={index} className="text-sm text-red-500">{error}</p>
                                    ))
                                ) : (
                                    <p className="text-sm text-red-500">{errors.password}</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Confirm New Password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={e => setData('password_confirmation', e.target.value)}
                            className="transition-all focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/30">
                    <Button type="submit" disabled={processing} className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        {processing ? 'Updating...' : 'Update Password'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
