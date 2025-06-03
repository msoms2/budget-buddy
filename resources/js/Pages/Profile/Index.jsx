import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast.js';
import { 
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Globe,
    DollarSign,
    Activity,
    TrendingUp,
    Target,
    CreditCard,
    PieChart,
    Clock,
    CheckCircle,
    AlertCircle,
    Edit3,
    Save,
    Shield,
    WifiOff,
    Wifi,
    Eye,
    BarChart3,
    UserCheck,
    Settings
} from 'lucide-react';

export default function Index({ user, activitySummary, financialSummary, recentActivity, flash }) {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    
    // Ensure recentActivity is properly structured and handle edge cases
    const safeRecentActivity = recentActivity && typeof recentActivity === 'object' ? recentActivity : {
        recent_expenses: 0,
        recent_earnings: 0,
        recent_transactions: 0
    };
    
    // Initialize the form with current user data
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || '',
    });
    
    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        put(route('profile.update'), {
            onSuccess: () => {
                setIsEditing(false);
                toast({
                    title: "Profile updated",
                    description: "Your profile has been updated successfully.",
                    variant: "default",
                });
            },
            onError: () => {
                toast({
                    title: "Error",
                    description: "There was an error updating your profile.",
                    variant: "destructive",
                });
            }
        });
    };
    
    // Utility functions
    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    const formatCurrency = (amount, currency = user.currency) => {
        if (amount === null || amount === undefined) return 'N/A';
        const symbol = currency?.symbol || '$';
        return `${symbol}${Math.abs(amount).toLocaleString(undefined, { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        })}`;
    };
    
    const getUserInitials = (name) => {
        return name
            ?.split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';
    };
    
    const getStatusInfo = (isOnline) => {
        return isOnline 
            ? { 
                color: 'bg-green-500', 
                textColor: 'text-green-700 dark:text-green-300',
                bgColor: 'bg-green-50 dark:bg-green-950/20',
                label: 'Online',
                icon: Wifi
            }
            : { 
                color: 'bg-gray-500', 
                textColor: 'text-gray-700 dark:text-gray-300',
                bgColor: 'bg-gray-50 dark:bg-gray-950/20',
                label: user.last_seen_formatted || 'Offline',
                icon: WifiOff
            };
    };
    
    const statusInfo = getStatusInfo(user.is_online);
    const StatusIcon = statusInfo.icon;
    
    return (
        <AuthenticatedLayout>
            <Head title="Profile" />
            <SidebarInset>
                <header className="flex h-16 items-center gap-2 border-b">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <BreadcrumbPage className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Profile
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </div>
                </header>
                
                <div className="flex flex-1 flex-col gap-6 p-6">
                    {/* Page Header */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                        <p className="text-muted-foreground">
                            Manage your personal information and view your account overview.
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

                    {/* Profile Header Card */}
                    <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-4">
                                    <Avatar className="w-20 h-20 ring-4 ring-white dark:ring-gray-800 shadow-lg">
                                        <AvatarImage
                                            src={user.avatar}
                                            alt={user.name || 'User Avatar'}
                                        />
                                        <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                            {getUserInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {user.name || 'No Name Set'}
                                            </h2>
                                            {user.email_verified_at && (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="flex items-center space-x-1">
                                                <Mail className="w-4 h-4" />
                                                <span>{user.email}</span>
                                            </span>
                                            {user.username && (
                                                <span className="flex items-center space-x-1">
                                                    <User className="w-4 h-4" />
                                                    <span>@{user.username}</span>
                                                </span>
                                            )}
                                        </div>
                                        {user.bio && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                                                {user.bio}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right space-y-2">
                                    <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} border-0`}>
                                        <StatusIcon className="w-3 h-3 mr-1" />
                                        {statusInfo.label}
                                    </Badge>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Member since {formatDate(user.created_at)}
                                    </div>
                                    {user.roles?.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.map((role) => (
                                                <Badge key={role.id} variant="outline" className="text-xs">
                                                    <Shield className="w-3 h-3 mr-1" />
                                                    {role.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Personal Information Card */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center space-x-2">
                                            <User className="w-5 h-5" />
                                            <span>Personal Information</span>
                                        </CardTitle>
                                        <CardDescription>
                                            Update your personal details and profile information
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant={isEditing ? "secondary" : "outline"}
                                        size="sm"
                                        onClick={() => setIsEditing(!isEditing)}
                                    >
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        {isEditing ? 'Cancel' : 'Edit'}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isEditing ? (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={e => setData('name', e.target.value)}
                                                    className={errors.name ? "border-red-500" : ""}
                                                />
                                                {errors.name && (
                                                    <p className="text-sm text-red-500">{errors.name}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="username">Username</Label>
                                                <Input
                                                    id="username"
                                                    value={data.username}
                                                    onChange={e => setData('username', e.target.value)}
                                                    className={errors.username ? "border-red-500" : ""}
                                                />
                                                {errors.username && (
                                                    <p className="text-sm text-red-500">{errors.username}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input
                                                    id="phone"
                                                    value={data.phone}
                                                    onChange={e => setData('phone', e.target.value)}
                                                    className={errors.phone ? "border-red-500" : ""}
                                                />
                                                {errors.phone && (
                                                    <p className="text-sm text-red-500">{errors.phone}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="date_of_birth">Date of Birth</Label>
                                                <Input
                                                    id="date_of_birth"
                                                    type="date"
                                                    value={data.date_of_birth}
                                                    onChange={e => setData('date_of_birth', e.target.value)}
                                                    className={errors.date_of_birth ? "border-red-500" : ""}
                                                />
                                                {errors.date_of_birth && (
                                                    <p className="text-sm text-red-500">{errors.date_of_birth}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bio">Bio</Label>
                                            <Textarea
                                                id="bio"
                                                value={data.bio}
                                                onChange={e => setData('bio', e.target.value)}
                                                rows={4}
                                                placeholder="Tell us about yourself..."
                                                className={errors.bio ? "border-red-500" : ""}
                                            />
                                            {errors.bio && (
                                                <p className="text-sm text-red-500">{errors.bio}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Button type="submit" disabled={processing}>
                                                <Save className="w-4 h-4 mr-2" />
                                                {processing ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Full Name
                                                </Label>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {user.name || 'Not set'}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Username
                                                </Label>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {user.username ? `@${user.username}` : 'Not set'}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Email Address
                                                </Label>
                                                <div className="flex items-center space-x-2">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {user.email}
                                                    </p>
                                                    {user.email_verified_at ? (
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Phone Number
                                                </Label>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {user.phone || 'Not set'}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Date of Birth
                                                </Label>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {formatDate(user.date_of_birth)}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Currency & Country
                                                </Label>
                                                <div className="flex items-center space-x-2">
                                                    <DollarSign className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {user.currency?.name || 'USD'} ({user.currency?.symbol || '$'})
                                                    </span>
                                                    {user.country && (
                                                        <>
                                                            <Globe className="w-4 h-4 text-blue-600 ml-2" />
                                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                {user.country.name}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {user.bio && (
                                            <div className="md:col-span-2 space-y-2">
                                                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                    Bio
                                                </Label>
                                                <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                                                    {user.bio}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Activity Summary Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <BarChart3 className="w-5 h-5" />
                                    <span>Activity Summary</span>
                                </CardTitle>
                                <CardDescription>
                                    Your account activity and engagement metrics
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                        <div className="flex items-center justify-center mb-2">
                                            <CreditCard className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                            {activitySummary?.total_transactions || 0}
                                        </div>
                                        <div className="text-xs text-blue-600 dark:text-blue-400">
                                            Transactions
                                        </div>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                        <div className="flex items-center justify-center mb-2">
                                            <Target className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                                            {activitySummary?.total_goals || 0}
                                        </div>
                                        <div className="text-xs text-green-600 dark:text-green-400">
                                            Goals
                                        </div>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                                        <div className="flex items-center justify-center mb-2">
                                            <PieChart className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                            {activitySummary?.total_budgets || 0}
                                        </div>
                                        <div className="text-xs text-purple-600 dark:text-purple-400">
                                            Budgets
                                        </div>
                                    </div>
                                    <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
                                        <div className="flex items-center justify-center mb-2">
                                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                                            {activitySummary?.total_investments || 0}
                                        </div>
                                        <div className="text-xs text-indigo-600 dark:text-indigo-400">
                                            Investments
                                        </div>
                                    </div>
                                </div>
                                
                                <Separator />
                                
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                        Recent Activity (Last 30 days)
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="text-center p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                            <div className="text-lg font-bold text-green-900 dark:text-green-100">
                                                {safeRecentActivity.recent_earnings || 0}
                                            </div>
                                            <div className="text-xs text-green-600 dark:text-green-400">
                                                Earnings
                                            </div>
                                        </div>
                                        <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                            <div className="text-lg font-bold text-red-900 dark:text-red-100">
                                                {safeRecentActivity.recent_expenses || 0}
                                            </div>
                                            <div className="text-xs text-red-600 dark:text-red-400">
                                                Expenses
                                            </div>
                                        </div>
                                        <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                            <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                                {safeRecentActivity.recent_transactions || 0}
                                            </div>
                                            <div className="text-xs text-blue-600 dark:text-blue-400">
                                                Total
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Financial Summary Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <DollarSign className="w-5 h-5" />
                                    <span>Financial Summary</span>
                                </CardTitle>
                                <CardDescription>
                                    Overview of your financial activity and balances
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {financialSummary ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                                        Total Income
                                                    </span>
                                                </div>
                                                <span className="font-bold text-green-900 dark:text-green-100">
                                                    {formatCurrency(financialSummary.total_income)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <Activity className="w-4 h-4 text-red-600" />
                                                    <span className="text-sm font-medium text-red-800 dark:text-red-200">
                                                        Total Expenses
                                                    </span>
                                                </div>
                                                <span className="font-bold text-red-900 dark:text-red-100">
                                                    {formatCurrency(financialSummary.total_expenses)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <PieChart className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                                        Net Balance
                                                    </span>
                                                </div>
                                                <span className="font-bold text-blue-900 dark:text-blue-100">
                                                    {formatCurrency((financialSummary.total_income || 0) - (financialSummary.total_expenses || 0))}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {financialSummary.savings_rate !== undefined && (
                                            <>
                                                <Separator />
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                            Savings Rate
                                                        </span>
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {financialSummary.savings_rate}%
                                                        </span>
                                                    </div>
                                                    <Progress value={financialSummary.savings_rate} className="h-2" />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <p className="text-sm">No financial data available</p>
                                        <p className="text-xs">Start by adding some transactions</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </AuthenticatedLayout>
    );
}