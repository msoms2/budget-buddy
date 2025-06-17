import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from "@/Pages/Admin/Components/Layout/AdminLayout";
import EditUserForm from "@/Pages/Admin/Components/Users/Forms/EditUserForm";
import UserRoleManager from "@/Pages/Admin/Components/Users/Forms/UserRoleManager";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    EditIcon, 
    UsersIcon, 
    UserIcon, 
    ShieldIcon, 
    ArrowLeftIcon 
} from "lucide-react";

/**
 * Edit User Page
 * 
 * Admin page for editing existing users with:
 * - User profile editing
 * - Role management
 * - Tabbed interface for organization
 * - Proper navigation and breadcrumbs
 */
export default function Edit({ 
    auth, 
    user,
    availableRoles = [], 
    countries = [], 
    currencies = [],
    roleHistory = []
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
        },
        {
            label: "Edit",
            href: route('admin.users.edit', user.id),
            icon: EditIcon
        }
    ];

    // Handle successful updates
    const handleSuccess = () => {
        // Redirect to user details with success message
        router.visit(route('admin.users.show', user.id), {
            data: { 
                success: 'User updated successfully!' 
            }
        });
    };

    // Handle form cancellation
    const handleCancel = () => {
        router.visit(route('admin.users.show', user.id));
    };

    // Header actions
    const headerActions = (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
                <Link 
                    href={route('admin.users.show', user.id)} 
                    className="flex items-center gap-2"
                >
                    <UserIcon className="h-4 w-4" />
                    View User
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
            title={`Edit User: ${user.name}`}
            breadcrumbs={breadcrumbs}
            headerActions={headerActions}
        >
            {/* Page Header */}
            <AdminLayout.PageHeader
                title={`Edit ${user.name}`}
                description="Update user information, manage roles and permissions"
                icon={EditIcon}
            />

            {/* Tabbed Interface */}
            <div className="max-w-5xl">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="profile" className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            Profile Information
                        </TabsTrigger>
                        <TabsTrigger value="roles" className="flex items-center gap-2">
                            <ShieldIcon className="h-4 w-4" />
                            Role Management
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Information Tab */}
                    <TabsContent value="profile" className="space-y-6">
                        <EditUserForm
                            user={user}
                            countries={countries}
                            currencies={currencies}
                            onSuccess={handleSuccess}
                            onCancel={handleCancel}
                        />
                    </TabsContent>

                    {/* Role Management Tab */}
                    <TabsContent value="roles" className="space-y-6">
                        <UserRoleManager
                            user={user}
                            availableRoles={availableRoles}
                            roleHistory={roleHistory}
                            onSuccess={handleSuccess}
                            onCancel={handleCancel}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}