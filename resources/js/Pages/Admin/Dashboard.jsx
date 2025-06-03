import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  UsersIcon, 
  ArrowUpRightIcon,
  DollarSignIcon, 
  CreditCardIcon, 
  PieChartIcon, 
  PercentIcon,
  LineChartIcon,
  Activity,
  TrendingUpIcon,
  TrendingDownIcon,
  Settings,
  Shield,
  Database,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  BarChart3,
  Target,
  Calendar,
  TrendingUp
} from "lucide-react";

export default function AdminDashboard({ auth, stats, recentActivity }) {
    return (
        <SidebarProvider>
            <Head title="Admin Dashboard" />
            <AppSidebar />
            
            <SidebarInset>
                <header
                    className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <BreadcrumbPage>Admin Dashboard</BreadcrumbPage>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </div>
                </header>
                
                <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
                    {/* Admin Overview Header */}
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20"></div>
                                    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                                        <Activity className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                System Overview
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Monitor and manage your Budget Buddy platform with real-time insights
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                System Healthy
                            </Badge>
                            <Badge variant="outline" className="px-3 py-1.5">
                                {new Date().toLocaleDateString()}
                            </Badge>
                        </div>
                    </div>
                    
                    {/* Main Statistics Cards */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Total Users Card */}
                        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/40 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/10"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/50 to-transparent dark:from-blue-900/20 rounded-bl-full"></div>
                            
                            <CardHeader className="relative pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                            <CardDescription className="text-blue-700 dark:text-blue-300 font-semibold text-xs uppercase tracking-wider">
                                                Total Users
                                            </CardDescription>
                                        </div>
                                        <CardTitle className="text-4xl font-bold tabular-nums text-blue-900 dark:text-blue-100 leading-none">
                                            {stats.users?.toLocaleString() || '0'}
                                        </CardTitle>
                                        <div className="flex items-center gap-2 pt-1">
                                            <div className="flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                                <TrendingUpIcon className="h-3.5 w-3.5 text-green-600" />
                                                <span className="text-xs font-bold text-green-700 dark:text-green-300">
                                                    {stats.active_users || 0}
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground font-medium">active users</span>
                                        </div>
                                    </div>
                                    <div className="relative flex-shrink-0">
                                        <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                                        <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-3.5 rounded-2xl shadow-lg">
                                            <UsersIcon className="h-7 w-7 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardFooter className="relative pt-0 pb-4">
                                <div className="w-full space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-blue-600 dark:text-blue-400 font-medium">Activity Rate</span>
                                        <span className="font-bold text-blue-800 dark:text-blue-200">
                                            {stats.user_activity_rate || 0}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={stats.user_activity_rate || 0}
                                        className="h-2 bg-blue-100 dark:bg-blue-900/30"
                                    />
                                    <Link
                                        href={route('admin.users')}
                                        className="inline-flex items-center justify-center w-full text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors group/link py-2 px-4 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    >
                                        Manage Users
                                        <ArrowUpRightIcon className="ml-2 h-4 w-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                    </Link>
                                </div>
                            </CardFooter>
                        </Card>
                        
                        {/* Total Earnings Card */}
                        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-green-50/60 to-teal-50/40 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-teal-950/10"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100/50 to-transparent dark:from-emerald-900/20 rounded-bl-full"></div>
                            
                            <CardHeader className="relative pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                            <CardDescription className="text-emerald-700 dark:text-emerald-300 font-semibold text-xs uppercase tracking-wider">
                                                Total Earnings
                                            </CardDescription>
                                        </div>
                                        <CardTitle className="text-4xl font-bold tabular-nums text-emerald-900 dark:text-emerald-100 leading-none">
                                            {stats.earnings?.toLocaleString() || '0'}
                                        </CardTitle>
                                        <div className="text-lg font-bold text-emerald-800 dark:text-emerald-200 pt-1">
                                            ${(stats.total_earning_amount || 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="relative flex-shrink-0">
                                        <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                                        <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 p-3.5 rounded-2xl shadow-lg">
                                            <TrendingUpIcon className="h-7 w-7 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardFooter className="relative pt-0 pb-4">
                                <div className="w-full space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-semibold">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Income Tracked
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                        All earnings recorded across the platform • Positive financial flow monitoring
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                        
                        {/* Total Expenses Card */}
                        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900">
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/80 via-pink-50/60 to-red-50/40 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-red-950/10"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-100/50 to-transparent dark:from-rose-900/20 rounded-bl-full"></div>
                            
                            <CardHeader className="relative pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                                            <CardDescription className="text-rose-700 dark:text-rose-300 font-semibold text-xs uppercase tracking-wider">
                                                Total Expenses
                                            </CardDescription>
                                        </div>
                                        <CardTitle className="text-4xl font-bold tabular-nums text-rose-900 dark:text-rose-100 leading-none">
                                            {stats.expenses?.toLocaleString() || '0'}
                                        </CardTitle>
                                        <div className="text-lg font-bold text-rose-800 dark:text-rose-200 pt-1">
                                            ${(stats.total_expense_amount || 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="relative flex-shrink-0">
                                        <div className="absolute inset-0 bg-rose-500 rounded-2xl blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                                        <div className="relative bg-gradient-to-br from-rose-500 to-rose-600 p-3.5 rounded-2xl shadow-lg">
                                            <CreditCardIcon className="h-7 w-7 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardFooter className="relative pt-0 pb-4">
                                <div className="w-full space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-semibold">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            Expenses Tracked
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                                        All expenses recorded across the platform • Financial outflow monitoring
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                        
                        {/* System Activity Card */}
                        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-50/80 via-purple-50/60 to-indigo-50/40 dark:from-violet-950/30 dark:via-purple-950/20 dark:to-indigo-950/10"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-100/50 to-transparent dark:from-violet-900/20 rounded-bl-full"></div>
                            
                            <CardHeader className="relative pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
                                            <CardDescription className="text-violet-700 dark:text-violet-300 font-semibold text-xs uppercase tracking-wider">
                                                System Activity
                                            </CardDescription>
                                        </div>
                                        <CardTitle className="text-4xl font-bold tabular-nums text-violet-900 dark:text-violet-100 leading-none">
                                            {stats.transactions?.toLocaleString() || '0'}
                                        </CardTitle>
                                        <div className="text-sm font-bold text-violet-800 dark:text-violet-200 pt-1">
                                            Avg {stats.avg_transactions_per_user || 0} per user
                                        </div>
                                    </div>
                                    <div className="relative flex-shrink-0">
                                        <div className="absolute inset-0 bg-violet-500 rounded-2xl blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                                        <div className="relative bg-gradient-to-br from-violet-500 to-violet-600 p-3.5 rounded-2xl shadow-lg">
                                            <Activity className="h-7 w-7 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            
                            <CardFooter className="relative pt-0 pb-4">
                                <div className="w-full space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-violet-600 dark:text-violet-400 font-medium">Total Transactions</span>
                                        <span className="font-bold text-violet-800 dark:text-violet-200">
                                            {((stats.expenses || 0) + (stats.earnings || 0)).toLocaleString()}
                                        </span>
                                    </div>
                                    <Link
                                        href={route('admin.transactions')}
                                        className="inline-flex items-center justify-center w-full text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-200 transition-colors group/link py-2 px-4 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20"
                                    >
                                        View Transactions
                                        <ArrowUpRightIcon className="ml-2 h-4 w-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                    </Link>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* System Health & Analytics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* System Health */}
                        <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/50 dark:via-orange-950/50 dark:to-yellow-950/50 border-0 shadow-md hover:shadow-lg transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
                            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-semibold text-amber-800 dark:text-amber-200">System Health</CardTitle>
                                    <CardDescription className="text-amber-600 dark:text-amber-400">Platform performance metrics</CardDescription>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-amber-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                    <div className="relative bg-gradient-to-br from-amber-500 to-orange-500 p-2.5 rounded-xl">
                                        <Shield className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="relative space-y-4">
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-amber-800 dark:text-amber-200">
                                            {stats.user_activity_rate || 0}%
                                        </span>
                                        <span className="text-sm text-amber-600 dark:text-amber-400">activity rate</span>
                                    </div>
                                    <Progress 
                                        value={stats.user_activity_rate || 0}
                                        className="h-2 mt-3 bg-amber-100 dark:bg-amber-900/30"
                                    />
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-amber-700 dark:text-amber-300">Active budgets</span>
                                    <span className="font-semibold text-amber-800 dark:text-amber-200">{stats.budgets || 0}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Data Insights */}
                        <Card className="group relative overflow-hidden bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 dark:from-cyan-950/50 dark:via-sky-950/50 dark:to-blue-950/50 border-0 shadow-md hover:shadow-lg transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-sky-500/5"></div>
                            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-semibold text-cyan-800 dark:text-cyan-200">Data Insights</CardTitle>
                                    <CardDescription className="text-cyan-600 dark:text-cyan-400">Financial data classification</CardDescription>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-cyan-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                    <div className="relative bg-gradient-to-br from-cyan-500 to-sky-500 p-2.5 rounded-xl">
                                        <Database className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="relative space-y-4">
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-cyan-800 dark:text-cyan-200">
                                            {stats.categories || 0}
                                        </span>
                                        <span className="text-sm text-cyan-600 dark:text-cyan-400">categories</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-cyan-500" />
                                    <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                                        Active data classification system
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance */}
                        <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950/50 dark:via-teal-950/50 dark:to-green-950/50 border-0 shadow-md hover:shadow-lg transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5"></div>
                            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Performance</CardTitle>
                                    <CardDescription className="text-emerald-600 dark:text-emerald-400">Platform financial balance</CardDescription>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                    <div className="relative bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 rounded-xl">
                                        <Target className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="relative space-y-4">
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-3xl font-bold ${((stats.total_earning_amount || 0) - (stats.total_expense_amount || 0)) >= 0 ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-600 dark:text-red-400'}`}>
                                            {((stats.total_earning_amount || 0) - (stats.total_expense_amount || 0)) >= 0 ? '+' : ''}
                                            ${Math.abs((stats.total_earning_amount || 0) - (stats.total_expense_amount || 0)).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {((stats.total_earning_amount || 0) - (stats.total_expense_amount || 0)) >= 0 ? (
                                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                        <TrendingDownIcon className="h-4 w-4 text-red-500" />
                                    )}
                                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                        {((stats.total_earning_amount || 0) - (stats.total_expense_amount || 0)) >= 0 ? 'Positive' : 'Negative'} balance
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity & Quick Actions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Activity */}
                        <Card className="group relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-900/50 dark:to-gray-900/50"></div>
                            <CardHeader className="relative">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-20"></div>
                                        <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-2.5 rounded-xl">
                                            <Clock className="h-5 w-5 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
                                        <CardDescription className="text-muted-foreground">Latest platform activity and user registrations</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="relative space-y-6">
                                {/* Recent Users */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">New Users</h4>
                                        <Badge variant="outline" className="text-xs">{recentActivity?.users?.length || 0} recent</Badge>
                                    </div>
                                    <div className="space-y-3">
                                        {recentActivity?.users?.slice(0, 3).map((user, index) => (
                                            <div key={user.id} className="group/item relative overflow-hidden rounded-lg bg-gradient-to-r from-white/50 to-slate-50/50 dark:from-slate-800/50 dark:to-slate-700/50 p-4 border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur opacity-20"></div>
                                                        <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                            <Users className="h-5 w-5 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                                                            {index === 0 && (
                                                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                                                    Latest
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge variant="outline" className="text-xs">
                                                            {new Date(user.created_at).toLocaleDateString()}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="relative">
                                <Button variant="outline" size="sm" className="w-full hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950 dark:hover:border-blue-800 transition-colors group/button" asChild>
                                    <Link href={route('admin.users')}>
                                        View All Activity
                                        <ArrowUpRightIcon className="ml-2 h-4 w-4 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5 transition-transform" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                        
                        {/* Quick Actions */}
                        <Card className="group relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-900/50 dark:to-gray-900/50"></div>
                            <CardHeader className="relative">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-20"></div>
                                        <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 p-2.5 rounded-xl">
                                            <Settings className="h-5 w-5 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-semibold">Admin Actions</CardTitle>
                                        <CardDescription className="text-muted-foreground">Quick access to administrative functions</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="relative space-y-4">
                                <Button className="w-full justify-start h-auto p-4 group/action bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-cyan-950/50 dark:to-sky-950/50 border-cyan-200 dark:border-cyan-800 hover:from-cyan-100 hover:to-sky-100 dark:hover:from-cyan-900/50 dark:hover:to-sky-900/50 text-slate-900 dark:text-slate-100 hover:text-cyan-900 dark:hover:text-cyan-100 transition-all duration-200" variant="outline" asChild>
                                    <Link href={route('admin.analytics.index')} className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-cyan-500 rounded-xl blur opacity-20"></div>
                                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                                                <BarChart3 className="h-5 w-5 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="font-semibold">Analytics Dashboard</div>
                                            <div className="text-sm text-muted-foreground">View detailed platform analytics</div>
                                        </div>
                                        <ArrowUpRightIcon className="h-5 w-5 group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5 transition-transform" />
                                    </Link>
                                </Button>

                                <Button className="w-full justify-start h-auto p-4 group/action bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 text-slate-900 dark:text-slate-100 hover:text-blue-900 dark:hover:text-blue-100 transition-all duration-200" variant="outline" asChild>
                                    <Link href={route('admin.users')} className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-blue-500 rounded-xl blur opacity-20"></div>
                                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                                <UsersIcon className="h-5 w-5 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="font-semibold">Manage Users</div>
                                            <div className="text-sm text-muted-foreground">View and control user accounts</div>
                                        </div>
                                        <ArrowUpRightIcon className="h-5 w-5 group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5 transition-transform" />
                                    </Link>
                                </Button>
                                
                                <Button className="w-full justify-start h-auto p-4 group/action bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-violet-100 dark:hover:from-purple-900/50 dark:hover:to-violet-900/50 text-slate-900 dark:text-slate-100 hover:text-purple-900 dark:hover:text-purple-100 transition-all duration-200" variant="outline" asChild>
                                    <Link href={route('admin.transactions')} className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-purple-500 rounded-xl blur opacity-20"></div>
                                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                                <LineChartIcon className="h-5 w-5 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="font-semibold">View Transactions</div>
                                            <div className="text-sm text-muted-foreground">Monitor all platform transactions</div>
                                        </div>
                                        <ArrowUpRightIcon className="h-5 w-5 group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5 transition-transform" />
                                    </Link>
                                </Button>
                                
                                <Button className="w-full justify-start h-auto p-4 group/action bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 border-emerald-200 dark:border-emerald-800 hover:from-emerald-100 hover:to-green-100 dark:hover:from-emerald-900/50 dark:hover:to-green-900/50 text-slate-900 dark:text-slate-100 hover:text-emerald-900 dark:hover:text-emerald-100 transition-all duration-200" variant="outline" asChild>
                                    <Link href={route('dashboard')} className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-emerald-500 rounded-xl blur opacity-20"></div>
                                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                                <BarChart3 className="h-5 w-5 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="font-semibold">Main Dashboard</div>
                                            <div className="text-sm text-muted-foreground">Return to user dashboard</div>
                                        </div>
                                        <ArrowUpRightIcon className="h-5 w-5 group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5 transition-transform" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}