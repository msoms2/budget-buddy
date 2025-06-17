import React from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from "@/Pages/Admin/Components/Layout/AdminLayout";
import CreateUserForm from "@/Pages/Admin/Components/Users/Forms/CreateUserForm";
import { Button } from "@/components/ui/button";
import { UserPlusIcon, UsersIcon, ArrowLeftIcon } from "lucide-react";

/**
 * Create User Page
 * 
 * Admin page for creating new users with:
 * - User creation form
 * - Role assignment
 * - Proper navigation and breadcrumbs
 * - Success/error handling
 */
export default function Create({ 
    auth, 
    availableRoles = [], 
    countries = [], 
    currencies = [] 
}) {
    // Breadcrumb configuration
    const breadcrumbs = [
        {
            label: "Users",
            href: route('admin.users'),
            icon: UsersIcon
        },
        {
            label: "Create User",
            href: route('admin.users.create'),
            icon: UserPlusIcon
        }
    ];

    // Handle successful user creation
    const handleSuccess = () => {
        // Redirect to users list with success message
        router.visit(route('admin.users'), {
            data: { 
                success: 'User created successfully!' 
            }
        });
    };

    // Handle form cancellation
    const handleCancel = () => {
        router.visit(route('admin.users'));
    };

    // Header actions
    const headerActions = (
        <Button variant="outline" size="sm" asChild>
            <Link 
                href={route('admin.users')} 
                className="flex items-center gap-2"
            >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Users
            </Link>
        </Button>
    );

    return (
        <AdminLayout
            title="Create User"
            breadcrumbs={breadcrumbs}
            headerActions={headerActions}
        >
            {/* Page Header */}
            <AdminLayout.PageHeader
                title="Create New User"
                description="Add a new user to the system with appropriate roles and permissions"
                icon={UserPlusIcon}
            />

            {/* Create User Form */}
            <div className="max-w-4xl">
                <CreateUserForm
                    availableRoles={availableRoles}
                    countries={countries}
                    currencies={currencies}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </div>
        </AdminLayout>
    );
}