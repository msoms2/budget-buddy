import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from "@/Pages/Admin/Components/Layout/AdminLayout";
import UserProfile from "@/Pages/Admin/Components/Users/UserProfile";
import UserActivity from "@/Pages/Admin/Components/Users/UserActivity";
import UserTransactions from "@/Pages/Admin/Components/Users/UserTransactions";
import UserActions from "@/Pages/Admin/Components/Users/UserActions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    UserIcon, 
    UsersIcon, 
    ActivityIcon, 
    HistoryIcon, 
    SettingsIcon,
    EditIcon,
    ArrowLeftIcon
} from "lucide-react";

/**
 * UserDetails Page
 * 
 * Comprehensive user detail view with:
 * - User profile information
 * - Activity statistics and analytics
 * - Transaction history with filtering
 * - User management actions
 * - Tabbed interface for organization
 */
export default function UserDetails({
    auth,
    user,
    activityData,
    timelineData = [],
    transactions = [],
    categories = [],
    paymentMethods = [],
    availableRoles = []
}) {
    const [activeTab, setActiveTab] = useState('profile');

    // Breadcrumb configuration
    const breadcrumbs = [
        {
            label: "Users",
            href: route('admin.users'),
            icon: UsersIcon
        },
        {
            label: user.name,
            href: route('admin.users.show', user.id),
            icon: UserIcon
        }
    ];

    // Handle user updates (refresh page data)
    const handleUserUpdate = () => {
        router.reload({
            only: ['user', 'activityData', 'transactions']
        });
    };

    // Header actions
    const headerActions = (
        <div className="flex items-center gap-2">
            <Button variant="default" size="sm" asChild>
                <Link 
                    href={route('admin.users.edit', user.id)} 
                    className="flex items-center gap-2"
                >
                    <EditIcon className="h-4 w-4" />
                    Edit User
                </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
                <Link 
                    href={route('admin.users')} 
                    className="flex items-center gap-2"
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back to Users
                </Link>
            </Button>
        </div>
    );

    return (
        <AdminLayout
            title={`User: ${user.name}`}
            breadcrumbs={breadcrumbs}
            headerActions={headerActions}
        >
            {/* Page Header */}
            <AdminLayout.PageHeader
                title={user.name}
                description={`User details and management for ${user.email}`}
                icon={UserIcon}
            />

            {/* Tabbed Interface */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="flex items-center gap-2">
                        <ActivityIcon className="h-4 w-4" />
                        Activity
                    </TabsTrigger>
                    <TabsTrigger value="transactions" className="flex items-center gap-2">
                        <HistoryIcon className="h-4 w-4" />
                        Transactions
                    </TabsTrigger>
                    <TabsTrigger value="actions" className="flex items-center gap-2">
                        <SettingsIcon className="h-4 w-4" />
                        Actions
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                    <UserProfile user={user} />
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-6">
                    <UserActivity
                        user={user}
                        activityData={activityData}
                        timelineData={timelineData}
                    />
                </TabsContent>

                {/* Transactions Tab */}
                <TabsContent value="transactions" className="space-y-6">
                    <UserTransactions
                        user={user}
                        transactions={transactions}
                        categories={categories}
                        paymentMethods={paymentMethods}
                    />
                </TabsContent>

                {/* Actions Tab */}
                <TabsContent value="actions" className="space-y-6">
                    <UserActions
                        user={user}
                        availableRoles={availableRoles}
                        onUserUpdate={handleUserUpdate}
                    />
                </TabsContent>
            </Tabs>
        </AdminLayout>
    );
}