// filepath: /usr/local/budget-buddy-nosleguma-darbs/resources/js/Pages/Settings/Account.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileInput } from '@/components/ui/file-input';
import { useToast } from '@/hooks/use-toast.js';
import PasswordUpdateForm from '@/components/PasswordUpdateForm';
import SecuritySection from '@/components/SecuritySection';
import AccountManagementCard from '@/components/AccountManagementCard';
import { 
    Settings, 
    Lock,
    Globe,
    Shield,
    Monitor,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle,
    Download,
    Upload,
    Trash2,
    Save,
    DollarSign
} from 'lucide-react';

export default function Account({ data, setData, processing, handleSubmit, options }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <div className="space-y-6">
            {/* Account Settings Card */}
            <Card className="shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <Settings className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Account Settings</CardTitle>
                            <CardDescription>
                                Configure your account preferences and regional settings.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="language" className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    Language
                                </Label>
                                <Select 
                                    value={data.language} 
                                    onValueChange={(value) => setData('language', value)}
                                >
                                    <SelectTrigger id="language" className="transition-all focus:ring-2 focus:ring-green-500/20">
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(options.languages || {'en': 'English'}).map(([code, name]) => (
                                            <SelectItem key={code} value={code}>
                                                {name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Interface language for the application.
                                </p>
                            </div>

                            <div className="space-y-2">
                                {/* Default Currency selector removed */}
                            </div>
                        </div>

                        {/* Add other settings sections here */}
                    </CardContent>
                    <CardFooter className="bg-muted/30">
                        <Button type="submit" disabled={processing} className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Account Settings'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {/* Password Security Card */}
            <PasswordUpdateForm />

            {/* Enhanced Security Section */}
            <SecuritySection />

            {/* Account Management Card */}
            <AccountManagementCard />
        </div>
    );
}
