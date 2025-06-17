import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/Pages/Admin/Components/Shared/StatCard";
import ActivityTimeline from "@/Pages/Admin/Components/Users/ActivityTimeline";
import {
    ActivityIcon,
    CreditCardIcon,
    DollarSignIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    TargetIcon,
    CalendarIcon,
    PieChartIcon,
    BarChartIcon
} from "lucide-react";

/**
 * UserActivity Component
 * 
 * Displays user activity statistics and analytics including:
 * - Transaction counts and totals
 * - Income and expense summaries
 * - Budget and goal statistics
 * - Activity trends and patterns
 */
export default function UserActivity({ user, activityData, timelineData }) {
    // Validate that we have activity data
    if (!activityData) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <p className="text-gray-500">No activity data available</p>
                </div>
            </div>
        );
    }

    // Use the provided activity data with safe fallbacks for any missing properties
    const stats = {
        transactions: {
            total: 0,
            thisMonth: 0,
            lastMonth: 0,
            ...activityData.transactions
        },
        expenses: {
            total: 0,
            thisMonth: 0,
            averageDaily: 0,
            topCategory: null,
            ...activityData.expenses
        },
        income: {
            total: 0,
            thisMonth: 0,
            averageMonthly: 0,
            sources: 0,
            ...activityData.income
        },
        budgets: {
            active: 0,
            total: 0,
            compliance: 0,
            ...activityData.budgets
        },
        goals: {
            active: 0,
            completed: 0,
            totalProgress: 0,
            ...activityData.goals
        },
        lastActivity: activityData.lastActivity || null
    };

    // Calculate percentage changes
    const getPercentageChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous * 100).toFixed(1);
    };

    const transactionChange = getPercentageChange(
        stats.transactions.thisMonth,
        stats.transactions.lastMonth
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: user.currency?.code || 'USD'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Activity Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <ActivityIcon className="h-5 w-5" />
                        Activity Overview
                    </CardTitle>
                    <CardDescription>
                        User's financial activity statistics and trends
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Transaction Stats */}
                        <StatCard
                            title="Total Transactions"
                            value={stats.transactions.total.toLocaleString()}
                            description={`${stats.transactions.thisMonth} this month`}
                            icon={CreditCardIcon}
                            trend={transactionChange > 0 ? 'up' : transactionChange < 0 ? 'down' : 'neutral'}
                            trendValue={`${transactionChange}%`}
                            className="bg-blue-50 dark:bg-blue-900/20"
                        />

                        {/* Total Expenses */}
                        <StatCard
                            title="Total Expenses"
                            value={formatCurrency(stats.expenses.total)}
                            description={`${formatCurrency(stats.expenses.thisMonth)} this month`}
                            icon={TrendingDownIcon}
                            className="bg-red-50 dark:bg-red-900/20"
                        />

                        {/* Total Income */}
                        <StatCard
                            title="Total Income"
                            value={formatCurrency(stats.income.total)}
                            description={`${formatCurrency(stats.income.thisMonth)} this month`}
                            icon={TrendingUpIcon}
                            className="bg-green-50 dark:bg-green-900/20"
                        />

                        {/* Active Goals */}
                        <StatCard
                            title="Active Goals"
                            value={stats.goals.active.toString()}
                            description={`${stats.goals.completed} completed`}
                            icon={TargetIcon}
                            className="bg-purple-50 dark:bg-purple-900/20"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending Analysis */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="h-5 w-5" />
                            Spending Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Average Daily Spending</span>
                                <span className="font-semibold">{formatCurrency(stats.expenses.averageDaily)}</span>
                            </div>
                            
                            {stats.expenses.topCategory && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Top Category</span>
                                    <Badge variant="secondary">{stats.expenses.topCategory}</Badge>
                                </div>
                            )}
                            
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Monthly Average</span>
                                <span className="font-semibold">
                                    {formatCurrency(stats.expenses.total / Math.max(1, new Date().getMonth() + 1))}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Income Analysis */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChartIcon className="h-5 w-5" />
                            Income Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Average Monthly Income</span>
                                <span className="font-semibold">{formatCurrency(stats.income.averageMonthly)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Income Sources</span>
                                <Badge variant="outline">{stats.income.sources} active</Badge>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Net Income (This Month)</span>
                                <span className={`font-semibold ${
                                    stats.income.thisMonth - stats.expenses.thisMonth >= 0 
                                        ? 'text-green-600' 
                                        : 'text-red-600'
                                }`}>
                                    {formatCurrency(stats.income.thisMonth - stats.expenses.thisMonth)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Budget & Goals Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TargetIcon className="h-5 w-5" />
                            Budget & Goals
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Active Budgets</span>
                                <span className="font-semibold">{stats.budgets.active}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Budget Compliance</span>
                                <Badge variant={stats.budgets.compliance >= 80 ? "default" : "destructive"}>
                                    {stats.budgets.compliance}%
                                </Badge>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Goal Progress</span>
                                <Badge variant={stats.goals.totalProgress >= 50 ? "default" : "secondary"}>
                                    {stats.goals.totalProgress}% avg
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            Activity Timeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Last Activity</span>
                                <span className="text-sm text-muted-foreground">
                                    {formatDate(stats.lastActivity)}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Account Age</span>
                                <span className="text-sm text-muted-foreground">
                                    {Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))} days
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Activity Level</span>
                                <Badge variant={
                                    stats.transactions.thisMonth > 10 ? "default" : 
                                    stats.transactions.thisMonth > 5 ? "secondary" : "outline"
                                }>
                                    {stats.transactions.thisMonth > 10 ? "High" : 
                                     stats.transactions.thisMonth > 5 ? "Medium" : "Low"}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Timeline Section */}
            <ActivityTimeline
                timeline={timelineData || []}
                user={user}
            />
        </div>
    );
}