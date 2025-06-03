import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from './Components/Layout/AdminLayout';
import DataTable, { createColumn } from './Components/Shared/DataTable';
import FilterPanel, { createFilter } from './Components/Shared/FilterPanel';
import ActionMenu, { createAction } from './Components/Shared/ActionMenu';
import StatCard from './Components/Shared/StatCard';
import ConfirmDialog, { useConfirmDialog, DialogCreators } from './Components/Shared/ConfirmDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UsersIcon,
  UserIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  UserPlusIcon,
  MoreHorizontal,
  Download,
  Upload,
  Filter
} from "lucide-react";

export default function AdminUsers({ auth, users, stats = {} }) {
    const [filters, setFilters] = useState({});
    const [loading, setLoading] = useState(false);
    
    // Confirm dialog state
    const confirmDialog = useConfirmDialog();
    
    // Check if users exists and has the expected properties
    const hasUsers = users && users.data && Array.isArray(users.data);
    const userData = hasUsers ? users.data : [];

    // Handle user deletion
    const handleDeleteUser = (userId) => {
        const user = userData.find(u => u.id === userId);
        if (!user) return;
        
        confirmDialog.openDialog({
            ...DialogCreators.delete(user.name, async () => {
                confirmDialog.setLoading(true);
                try {
                    await router.delete(route('admin.users.destroy', userId));
                    confirmDialog.closeDialog();
                    // Refresh the page to update the user list
                    router.reload({ only: ['users', 'stats'] });
                } catch (error) {
                    console.error('Error deleting user:', error);
                    confirmDialog.setLoading(false);
                    // You could show an error message here if needed
                }
            })
        });
    };

    // Handle bulk actions
    const handleBulkAction = (action, selectedIds) => {
        console.log('Bulk action:', action, selectedIds);
        if (action.key === 'delete') {
            confirmDialog.openDialog({
                ...DialogCreators.bulkDelete(selectedIds.length, async () => {
                    confirmDialog.setLoading(true);
                    try {
                        // Add your bulk delete logic here
                        console.log('Bulk delete users:', selectedIds);
                        confirmDialog.closeDialog();
                    } catch (error) {
                        console.error('Error bulk deleting users:', error);
                        confirmDialog.setLoading(false);
                    }
                })
            });
        }
    };

    // Handle filters
    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        // Add your filter logic here
        console.log('Filters changed:', newFilters);
    };

    // Handle sorting
    const handleSort = (key, direction) => {
        // Add your sort logic here
        console.log('Sort:', key, direction);
    };

    // User table columns
    const columns = [
        createColumn({
            key: 'id',
            label: 'ID',
            sortable: true,
            width: '80px',
            className: 'text-center'
        }),
        createColumn({
            key: 'name',
            label: 'User',
            sortable: true,
            render: (value, user) => (
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="size-8 bg-muted rounded-full flex items-center justify-center">
                            <UserIcon className="size-4 text-muted-foreground" />
                        </div>
                        {user.is_online && (
                            <div className="absolute -top-1 -right-1 size-3 bg-green-500 border-2 border-white rounded-full" />
                        )}
                    </div>
                    <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                </div>
            )
        }),
        createColumn({
            key: 'online_status',
            label: 'Status',
            sortable: true,
            render: (_, user) => (
                <div className="flex flex-col gap-1">
                    <Badge 
                        variant={user.is_online ? "default" : "secondary"} 
                        className={user.is_online ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                        {user.is_online ? "Online" : "Offline"}
                    </Badge>
                    {user.last_seen_formatted && !user.is_online && (
                        <span className="text-xs text-muted-foreground">
                            Last seen: {user.last_seen_formatted}
                        </span>
                    )}
                </div>
            )
        }),
        createColumn({
            key: 'roles',
            label: 'Roles',
            render: (roles) => (
                <div className="flex flex-wrap gap-1">
                    {roles && roles.map(role => (
                        <Badge key={role.id} variant="outline" className="text-xs">
                            {role.name}
                        </Badge>
                    ))}
                </div>
            )
        }),
        createColumn({
            key: 'created_at',
            label: 'Created',
            sortable: true,
            render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
        }),
        createColumn({
            key: 'actions',
            label: 'Actions',
            width: '100px',
            className: 'text-right',
            render: (_, user) => (
                <ActionMenu
                    actions={[
                        createAction({
                            label: 'View Details',
                            icon: EyeIcon,
                            href: route('admin.users.show', user.id),
                            internalLink: true
                        }),
                        createAction({
                            label: 'Edit User',
                            icon: EditIcon,
                            href: route('admin.users.edit', user.id),
                            internalLink: true
                        }),
                        createAction({ type: 'separator' }),
                        createAction({
                            label: 'Delete User',
                            icon: TrashIcon,
                            variant: 'destructive',
                            onClick: () => handleDeleteUser(user.id)
                        })
                    ]}
                />
            )
        })
    ];

    // Filter definitions
    const filterDefinitions = [
        createFilter({
            key: 'search',
            label: 'Search',
            type: 'search',
            placeholder: 'Search by name or email...'
        }),
        createFilter({
            key: 'role',
            label: 'Role',
            type: 'select',
            options: [
                { value: 'admin', label: 'Admin' },
                { value: 'user', label: 'User' },
                { value: 'moderator', label: 'Moderator' }
            ],
            clearable: true
        }),
        createFilter({
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'suspended', label: 'Suspended' }
            ],
            clearable: true
        }),
        createFilter({
            key: 'created_at',
            label: 'Registration Date',
            type: 'daterange'
        })
    ];

    // Bulk actions
    const bulkActions = [
        {
            key: 'export',
            label: 'Export Selected',
            icon: Download,
            variant: 'outline'
        },
        {
            key: 'delete',
            label: 'Delete Selected',
            icon: TrashIcon,
            variant: 'destructive'
        }
    ];

    // Statistics for overview
    const userStats = [
        {
            title: 'Total Users',
            value: users?.total || 0,
            icon: UsersIcon,
            theme: 'blue',
            trend: stats.userGrowth ? {
                value: `+${stats.userGrowth}%`,
                direction: 'up',
                label: 'this month'
            } : null
        },
        {
            title: 'Active Users',
            value: stats?.active || 0,
            icon: UserIcon,
            theme: 'green',
            description: `${stats?.active || 0} users online now`,
            indicator: stats?.activeUsers > 0 ? {
                color: 'green',
                pulse: true
            } : null
        },
        {
            title: 'Monthly Active',
            value: stats?.monthly_active || 0,
            icon: UserIcon,
            theme: 'emerald',
            description: 'Active in past 30 days',
            progress: users?.total > 0 ? {
                value: stats?.monthly_active || 0,
                max: users.total,
                label: 'Activity Rate'
            } : null
        },
        {
            title: 'New This Month',
            value: stats?.new_this_month || 0,
            icon: UserPlusIcon,
            theme: 'violet',
            trend: stats.monthlyGrowth ? {
                value: `${stats.monthlyGrowth > 0 ? '+' : ''}${stats.monthlyGrowth}%`,
                direction: stats.monthlyGrowth > 0 ? 'up' : 'down',
                label: 'vs last month'
            } : null
        }
    ];

    const breadcrumbs = [
        {
            label: 'User Management',
            icon: UsersIcon
        }
    ];

    const headerActions = (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
                <Link href={route('admin.analytics')}>
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Analytics
                </Link>
            </Button>
            <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import Users
            </Button>
            <Button size="sm">
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Add User
            </Button>
            <AdminLayout.BackButton />
        </div>
    );

    return (
        <AdminLayout
            title="User Management"
            breadcrumbs={breadcrumbs}
            headerActions={headerActions}
            className="gap-6"
        >
            <AdminLayout.PageHeader
                title="User Management"
                description="View and manage all users in the system"
                icon={UsersIcon}
            />

            {/* Statistics Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {userStats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Filters */}
            <FilterPanel
                filters={filterDefinitions}
                values={filters}
                onFiltersChange={handleFiltersChange}
                collapsible={true}
                defaultExpanded={false}
            />

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>All Users</CardTitle>
                            <CardDescription>
                                {users?.total ?
                                    `${users.total} user${users.total !== 1 ? 's' : ''} in the system` :
                                    "Manage user accounts and permissions"
                                }
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={userData}
                        columns={columns}
                        pagination={users}
                        onSort={handleSort}
                        onFilter={handleFiltersChange}
                        onBulkAction={handleBulkAction}
                        bulkActions={bulkActions}
                        loading={loading}
                        selectable={true}
                        searchPlaceholder="Search users..."
                    />
                </CardContent>
            </Card>

            {/* Confirm Dialog */}
            <ConfirmDialog {...confirmDialog.config} onOpenChange={confirmDialog.closeDialog} />
        </AdminLayout>
    );
}