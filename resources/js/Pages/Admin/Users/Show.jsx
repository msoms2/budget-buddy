import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Pages/Admin/Components/Layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, UserIcon, CalendarIcon, ActivityIcon, DollarSignIcon } from 'lucide-react';
import ActivityTimeline from '@/Pages/Admin/Components/Users/ActivityTimeline';

export default function Show({ user, timeline = [], stats = {} }) {
    const formatDate = (date) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleDateString();
    };

    const formatDateTime = (date) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleString();
    };

    return (
        <AdminLayout>
            <Head title={`User Details - ${user.name}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.users')}
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-1" />
                            Back to Users
                        </Link>
                    </div>
                </div>

                {/* User Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-3">
                            <UserIcon className="h-6 w-6" />
                            <span>{user.name}</span>
                        </CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Member Since</div>
                                <div className="flex items-center space-x-2">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <span>{formatDate(user.created_at)}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Last Seen</div>
                                <div className="flex items-center space-x-2">
                                    <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                                    <span>{formatDateTime(stats.last_seen)}</span>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Status</div>
                                <Badge variant={stats.last_seen && new Date(stats.last_seen) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 'default' : 'secondary'}>
                                    {stats.last_seen && new Date(stats.last_seen) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_transactions || 0}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Budgets</CardTitle>
                            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_budgets || 0}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Goals</CardTitle>
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_goals || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Activity Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Recent transactions, budgets, and goals for this user
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ActivityTimeline
                            timeline={timeline}
                            user={user}
                        />
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}