import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
    UserIcon,
    MailIcon,
    PhoneIcon,
    ShieldIcon,
    CheckCircleIcon,
    CalendarIcon,
    MapPinIcon,
    CreditCardIcon,
    GlobeIcon,
    ActivityIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    DollarSignIcon,
    TargetIcon,
    PieChartIcon,
    ClockIcon,
    EyeIcon,
    AlertTriangleIcon,
    InfoIcon,
    Settings2Icon,
    UserCogIcon,
    LogInIcon,
    WifiIcon,
    SmartphoneIcon,
    CopyIcon
} from "lucide-react";

/**
 * UserProfile Component
 * 
 * Enhanced admin view displaying comprehensive user profile information including:
 * - User identity and contact information
 * - Account status and security details
 * - Financial overview and activity metrics
 * - Role assignments and permissions
 * - System information and preferences
 * - Quick action buttons for admin tasks
 */
export default function UserProfile({ user }) {
    // Utility functions
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatShortDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount, currency = user?.currency) => {
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

    const getAccountAge = () => {
        if (!user.created_at) return 'N/A';
        const createdDate = new Date(user.created_at);
        const now = new Date();
        const diffTime = Math.abs(now - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) return `${diffDays} days`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
        return `${Math.floor(diffDays / 365)} years`;
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'active':
                return { 
                    color: 'bg-green-500', 
                    textColor: 'text-green-700 dark:text-green-300', 
                    bgColor: 'bg-green-50 dark:bg-green-950/20', 
                    label: 'Active',
                    description: 'Account is active and functional'
                };
            case 'suspended':
                return { 
                    color: 'bg-red-500', 
                    textColor: 'text-red-700 dark:text-red-300', 
                    bgColor: 'bg-red-50 dark:bg-red-950/20', 
                    label: 'Suspended',
                    description: 'Account has been temporarily suspended'
                };
            case 'inactive':
                return { 
                    color: 'bg-yellow-500', 
                    textColor: 'text-yellow-700 dark:text-yellow-300', 
                    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20', 
                    label: 'Inactive',
                    description: 'Account is inactive or not verified'
                };
            default:
                return { 
                    color: 'bg-gray-500', 
                    textColor: 'text-gray-700 dark:text-gray-300', 
                    bgColor: 'bg-gray-50 dark:bg-gray-950/20', 
                    label: 'Unknown',
                    description: 'Account status is unknown'
                };
        }
    };

    const calculateActivityScore = () => {
        const recentActivity = user.recent_activity || {};
        const activitySummary = user.activity_summary || {};
        
        let score = 0;
        if (recentActivity.recent_transactions > 0) score += 30;
        if (activitySummary.total_goals > 0) score += 20;
        if (activitySummary.total_budgets > 0) score += 20;
        if (user.email_verified_at) score += 15;
        if (activitySummary.total_investments > 0) score += 15;
        
        return Math.min(score, 100);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const statusInfo = getStatusInfo(user.status || 'active');
    const activityScore = calculateActivityScore();

    return (
        <div className="space-y-6">
            {/* Profile Header */}
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
                                        {user.name || 'No Name'}
                                    </h2>
                                    {user.email_verified_at && (
                                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                    )}
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="flex items-center space-x-1">
                                        <MailIcon className="w-4 h-4" />
                                        <span>{user.email}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto p-1"
                                            onClick={() => copyToClipboard(user.email)}
                                        >
                                            <CopyIcon className="w-3 h-3" />
                                        </Button>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                        <UserIcon className="w-4 h-4" />
                                        <span>ID: {user.id}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right space-y-2">
                            <Badge 
                                className={`${statusInfo.bgColor} ${statusInfo.textColor} border-0`}
                            >
                                <div className={`w-2 h-2 rounded-full ${statusInfo.color} mr-2`}></div>
                                {statusInfo.label}
                            </Badge>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Member for {getAccountAge()}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Account Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <UserIcon className="w-5 h-5" />
                            <span>Account Information</span>
                        </CardTitle>
                        <CardDescription>
                            Basic account details and verification status
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Full Name
                                </label>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {user.name || 'Not provided'}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Email Address
                                </label>
                                <div className="flex items-center space-x-2">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {user.email}
                                    </p>
                                    {user.email_verified_at ? (
                                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <AlertTriangleIcon className="w-4 h-4 text-yellow-500" />
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Phone Number
                                </label>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {user.phone || 'Not provided'}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Location
                                </label>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {user.location || 'Not provided'}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Account Created
                                </label>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {formatShortDate(user.created_at)}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Email Verified
                                </label>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {user.email_verified_at ? formatShortDate(user.email_verified_at) : 'Not verified'}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Last Updated
                                </label>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {formatShortDate(user.updated_at)}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Time Zone
                                </label>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {user.timezone || 'Not set'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* System Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Settings2Icon className="w-5 h-5" />
                            <span>System Information</span>
                        </CardTitle>
                        <CardDescription>
                            System preferences and technical details
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    User Role
                                </label>
                                <Badge variant="outline" className="w-fit">
                                    <ShieldIcon className="w-3 h-3 mr-1" />
                                    {user.role || 'User'}
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Currency
                                </label>
                                <div className="flex items-center space-x-2">
                                    <DollarSignIcon className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {user.currency?.name || 'USD'} ({user.currency?.symbol || '$'})
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Language
                                </label>
                                <div className="flex items-center space-x-2">
                                    <GlobeIcon className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {user.language || 'English'}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Date Format
                                </label>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {user.date_format || 'MM/DD/YYYY'}
                                </span>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Activity Score
                                </span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {activityScore}%
                                </span>
                            </div>
                            <Progress value={activityScore} className="h-2" />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Based on transactions, goals, budgets, and verification status
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <PieChartIcon className="w-5 h-5" />
                            <span>Financial Overview</span>
                        </CardTitle>
                        <CardDescription>
                            Financial activity and account statistics
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Budgets
                                </label>
                                <div className="flex items-center space-x-2">
                                    <TargetIcon className="w-4 h-4 text-blue-600" />
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                        {user.activity_summary?.total_budgets || 0}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Goals
                                </label>
                                <div className="flex items-center space-x-2">
                                    <ActivityIcon className="w-4 h-4 text-green-600" />
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                        {user.activity_summary?.total_goals || 0}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Transactions
                                </label>
                                <div className="flex items-center space-x-2">
                                    <CreditCardIcon className="w-4 h-4 text-purple-600" />
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                        {user.activity_summary?.total_transactions || 0}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Investments
                                </label>
                                <div className="flex items-center space-x-2">
                                    <TrendingUpIcon className="w-4 h-4 text-indigo-600" />
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                        {user.activity_summary?.total_investments || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                Recent Activity (Last 30 days)
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                                        {user.recent_activity?.recent_transactions || 0}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                        Transactions
                                    </div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                                        {user.recent_activity?.login_count || 0}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                        Logins
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security & Access */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <ShieldIcon className="w-5 h-5" />
                            <span>Security & Access</span>
                        </CardTitle>
                        <CardDescription>
                            Security settings and access information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Last Login
                                </label>
                                <div className="flex items-center space-x-2">
                                    <LogInIcon className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {formatDate(user.last_login_at)}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Last IP Address
                                </label>
                                <div className="flex items-center space-x-2">
                                    <WifiIcon className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {user.last_ip || 'N/A'}
                                    </span>
                                    {user.last_ip && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto p-1"
                                            onClick={() => copyToClipboard(user.last_ip)}
                                        >
                                            <CopyIcon className="w-3 h-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    User Agent
                                </label>
                                <div className="flex items-center space-x-2">
                                    <SmartphoneIcon className="w-4 h-4 text-purple-600" />
                                    <span className="text-xs text-gray-900 dark:text-white truncate">
                                        {user.last_user_agent ? user.last_user_agent.substring(0, 30) + '...' : 'N/A'}
                                    </span>
                                    {user.last_user_agent && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto p-1"
                                            onClick={() => copyToClipboard(user.last_user_agent)}
                                        >
                                            <CopyIcon className="w-3 h-3" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Failed Login Attempts
                                </label>
                                <div className="flex items-center space-x-2">
                                    <AlertTriangleIcon className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {user.failed_login_attempts || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Two-Factor Authentication
                            </label>
                            <Badge 
                                variant={user.two_factor_enabled ? "default" : "secondary"}
                                className="w-fit"
                            >
                                {user.two_factor_enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Admin Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <UserCogIcon className="w-5 h-5" />
                        <span>Admin Actions</span>
                    </CardTitle>
                    <CardDescription>
                        Quick actions for user account management
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" size="sm">
                            <EyeIcon className="w-4 h-4 mr-2" />
                            View Full Profile
                        </Button>
                        <Button variant="outline" size="sm">
                            <MailIcon className="w-4 h-4 mr-2" />
                            Send Email
                        </Button>
                        <Button variant="outline" size="sm">
                            <UserCogIcon className="w-4 h-4 mr-2" />
                            Edit User
                        </Button>
                        <Button variant="outline" size="sm">
                            <ShieldIcon className="w-4 h-4 mr-2" />
                            Reset Password
                        </Button>
                        {user.status === 'active' ? (
                            <Button variant="destructive" size="sm">
                                <AlertTriangleIcon className="w-4 h-4 mr-2" />
                                Suspend Account
                            </Button>
                        ) : (
                            <Button variant="default" size="sm">
                                <CheckCircleIcon className="w-4 h-4 mr-2" />
                                Activate Account
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}