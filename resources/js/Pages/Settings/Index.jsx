import React, { useState, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import CurrencySettings from '@/components/CurrencySettings';
import NotificationSettings from '@/components/NotificationSettings';
import ExtensionCompatibility from '@/components/ExtensionCompatibility';
// Import separate settings components
import Account from './Account';
import Appearance from './Appearance';
import Notifications from './Notifications';
import Display from './Display';
import Currency from './Currency';
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardFooter, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Moon,
    Sun,
    Languages,
    DollarSign,
    Clock,
    CalendarDays,
    Bell,
    User,
    CreditCard,
    Home,
    FolderIcon,
    Settings,
    Save,
    Shield,
    Eye,
    EyeOff,
    Palette,
    Globe,
    Smartphone,
    Monitor,
    CheckCircle,
    AlertCircle,
    Info,
    UserCircle,
    Mail,
    Lock,
    ChevronRight,
    BarChart3,
    Target,
    TrendingUp,
    FileText,
    Camera,
    Download,
    Upload,
    Trash2,
    RefreshCw,
    AlertTriangle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast.js";
import { useTheme } from "@/components/theme/theme-provider";
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileInput } from '@/components/ui/file-input';
import { Breadcrumb, BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Index({ auth, settings, options, flash }) {
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('account');
    
    // Initialize the form with current settings
    const { data, setData, post, put, processing, errors } = useForm({
        theme: theme || settings.theme || 'light',
        language: settings.language || 'en',
        currency: settings.currency || 'USD',
        dateFormat: settings.dateFormat || 'MM/DD/YYYY',
        timeFormat: settings.timeFormat || '12h',
        // User profile fields
        name: auth.user?.name || '',
        username: auth.user?.username || '',
        email: auth.user?.email || '',
        bio: auth.user?.bio || 'I own a computer.',
        dateOfBirth: auth.user?.date_of_birth || '',
        // Display settings - updated to include real sidebar menu items
        sidebarItems: {
            dashboard: settings.sidebarItems?.dashboard ?? true,
            analyticsAndIncome: settings.sidebarItems?.analyticsAndIncome ?? true,
            categories: settings.sidebarItems?.categories ?? true,
            transactions: settings.sidebarItems?.transactions ?? true,
            budgets: settings.sidebarItems?.budgets ?? true,
            goals: settings.sidebarItems?.goals ?? true,
            savings: settings.sidebarItems?.savings ?? true,
            debtManagement: settings.sidebarItems?.debtManagement ?? true,
            investments: settings.sidebarItems?.investments ?? true,
            reports: settings.sidebarItems?.reports ?? true,
            adminPanel: settings.sidebarItems?.adminPanel ?? true,
        },
        // Notification settings
        notifyAbout: 'direct', // 'all', 'direct', or 'nothing'
        communicationEmails: true,
        marketingEmails: false,
        socialEmails: true,
        securityEmails: true,
        useDifferentSettings: false,
    });
    
    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Check if we have a photo file to upload
        const hasFileUpload = data.photo instanceof File;
        
        if (hasFileUpload) {
            // Use post with _method field for file uploads
            const formDataWithMethod = { ...data, _method: 'PUT' };
            
            post(route('settings.update'), formDataWithMethod, {
                forceFormData: true,
                onSuccess: () => {
                    // Update theme in the ThemeProvider
                    setTheme(data.theme);
                    
                    toast({
                        title: "Settings updated",
                        description: "Your preferences have been saved successfully.",
                        variant: "default",
                    });
                }
            });
        } else {
            // Use put for regular form data
            put(route('settings.update'), {
                onSuccess: () => {
                    // Update theme in the ThemeProvider
                    setTheme(data.theme);
                    
                    toast({
                        title: "Settings updated",
                        description: "Your preferences have been saved successfully.",
                        variant: "default",
                    });
                }
            });
        }
    };
    
    // Handle theme change
    const handleThemeChange = (newTheme) => {
        setData('theme', newTheme);
    };

    // Tab configuration with enhanced styling
    const tabs = [
        { 
            id: 'account', 
            label: 'Account', 
            icon: Settings, 
            description: 'Account settings and preferences',
            color: 'text-green-600 dark:text-green-400'
        },
        { 
            id: 'appearance', 
            label: 'Appearance', 
            icon: Palette, 
            description: 'Customize app appearance',
            color: 'text-purple-600 dark:text-purple-400'
        },
        { 
            id: 'notifications', 
            label: 'Notifications', 
            icon: Bell, 
            description: 'Notification preferences',
            color: 'text-orange-600 dark:text-orange-400'
        },
        { 
            id: 'display', 
            label: 'Display', 
            icon: Monitor, 
            description: 'Interface customization',
            color: 'text-indigo-600 dark:text-indigo-400'
        },
        { 
            id: 'currency', 
            label: 'Currency', 
            icon: DollarSign, 
            description: 'Currency management',
            color: 'text-emerald-600 dark:text-emerald-400'
        },
        { 
            id: 'extensions', 
            label: 'Browser Compatibility', 
            icon: AlertTriangle, 
            description: 'Check for extension conflicts',
            color: 'text-red-600 dark:text-red-400'
        }
    ];
    
    return (
        <AuthenticatedLayout>
            <Head title="Settings" />
            <SidebarInset>
                <header className="flex h-16 items-center gap-2 border-b">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <BreadcrumbPage className="flex items-center gap-2">
                                    <Settings className="h-4 w-4" />
                                    Settings
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </div>
                </header>
                
                <div className="flex flex-1 flex-col gap-6 p-6">
                    {/* Page Header */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                        <p className="text-muted-foreground">
                            Manage your account settings and application preferences.
                        </p>
                    </div>

                    {/* Success Message */}
                    {flash?.success && (
                        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertDescription className="text-green-800 dark:text-green-200">
                                {flash.success}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-1">
                            <nav className="space-y-2">
                                {tabs.map((tab) => {
                                    const IconComponent = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-all hover:bg-muted/50 ${
                                                isActive 
                                                    ? 'bg-muted border border-border shadow-sm' 
                                                    : 'hover:bg-muted/30'
                                            }`}
                                        >
                                            <IconComponent className={`h-5 w-5 ${isActive ? tab.color : 'text-muted-foreground'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {tab.label}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {tab.description}
                                                </p>
                                            </div>
                                            {isActive && (
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-3">
                            <div className="space-y-6">
                                {/* Account Tab */}
                                {activeTab === 'account' && (
                                    <Account
                                        data={data}
                                        setData={setData}
                                        processing={processing}
                                        handleSubmit={handleSubmit}
                                        options={options}
                                        post={post}
                                        route={route}
                                        toast={toast}
                                    />
                                )}

                                {/* Appearance Tab */}
                                {activeTab === 'appearance' && (
                                    <Appearance
                                        data={data}
                                        setData={setData}
                                        processing={processing}
                                        handleSubmit={handleSubmit}
                                        theme={theme}
                                        setTheme={setTheme}
                                        handleThemeChange={handleThemeChange}
                                    />
                                )}

                                {/* Notifications Tab */}
                                {activeTab === 'notifications' && (
                                    <Notifications />
                                )}

                                {/* Display Tab */}
                                {activeTab === 'display' && (
                                    <Display
                                        data={data}
                                        setData={setData}
                                        processing={processing}
                                        handleSubmit={handleSubmit}
                                        auth={auth}
                                    />
                                )}

                                {/* Currency Tab */}
                                {activeTab === 'currency' && (
                                    <Currency />
                                )}

                                {/* Browser Extensions Tab */}
                                {activeTab === 'extensions' && (
                                    <ExtensionCompatibility />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </AuthenticatedLayout>
    );
}
