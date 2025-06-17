import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AnalyticsLayout from '@/Pages/Admin/Components/Layouts/AnalyticsLayout';
import { 
  MetricsDashboard, 
  ChartContainer 
} from '@/Pages/Admin/Components/Analytics';
import LoadingSkeleton from '@/Pages/Admin/Components/Analytics/LoadingSkeleton';
import AnalyticsCard from '@/Pages/Admin/Components/Analytics/AnalyticsCard';
import DataTable, { createColumn } from '@/Pages/Admin/Components/Shared/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Legend,
    Area,
    AreaChart,
    ComposedChart,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    ChartContainer as RechartsChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    Target,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    AlertCircle,
    Trophy,
    BarChart3,
    Activity,
    Flag,
    Star
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";

export default function GoalsAnalytics({ 
    auth, 
    analytics = {}, 
    goals = [], 
    goalStats = [],
    progressData = [],
    completionTrends = [],
    timelineData = [],
    achievementData = [],
    filters = {}
}) {
    const [loading, setLoading] = useState(false);

    // Chart configuration
    const chartConfig = {
        current_amount: {
            label: "Current Amount",
            color: "hsl(var(--chart-1))",
        },
        target_amount: {
            label: "Target Amount",
            color: "hsl(var(--chart-2))",
        },
        progress_percentage: {
            label: "Progress %",
            color: "hsl(var(--chart-3))",
        },
        completed: {
            label: "Completed",
            color: "hsl(var(--chart-4))",
        },
        in_progress: {
            label: "In Progress",
            color: "hsl(var(--chart-5))",
        }
    };

    // Color palette for pie chart
    const COLORS = [
        'hsl(var(--chart-1))',
        'hsl(var(--chart-2))',
        'hsl(var(--chart-3))',
        'hsl(var(--chart-4))',
        'hsl(var(--chart-5))',
    ];

    // Handle filter changes
    const handleFiltersChange = (newFilters) => {
        setLoading(true);
        router.get(route('admin.analytics.goals'), {
            ...filters,
            ...newFilters
        }, {
            preserveState: true,
            onFinish: () => setLoading(false)
        });
    };

    // Handle export
    const handleExport = (format, options) => {
        setLoading(true);
        const exportData = {
            type: format,
            ...options,
            ...filters
        };
        
        window.open(route('admin.analytics.goals.export', exportData));
        setLoading(false);
    };

    // Handle refresh
    const handleRefresh = () => {
        handleFiltersChange({});
    };

    // Calculate goal status
    const getGoalStatus = (progress, target_date) => {
        const today = new Date();
        const targetDate = target_date ? parseISO(target_date) : null;
        const daysRemaining = targetDate ? differenceInDays(targetDate, today) : null;
        
        if (progress >= 100) {
            return { label: 'Completed', color: 'green', variant: 'success', icon: CheckCircle };
        }
        if (daysRemaining !== null && daysRemaining < 0) {
            return { label: 'Overdue', color: 'red', variant: 'destructive', icon: AlertCircle };
        }
        if (daysRemaining !== null && daysRemaining <= 7) {
            return { label: 'Due Soon', color: 'amber', variant: 'warning', icon: Clock };
        }
        if (progress >= 75) {
            return { label: 'On Track', color: 'blue', variant: 'default', icon: TrendingUp };
        }
        if (progress >= 25) {
            return { label: 'In Progress', color: 'violet', variant: 'secondary', icon: Activity };
        }
        return { label: 'Just Started', color: 'gray', variant: 'outline', icon: Flag };
    };

    // Prepare metrics data
    const metricsData = [
        {
            id: 'total_goals',
            title: 'Total Goals',
            value: analytics.total_goals || 0,
            icon: Target,
            theme: 'blue',
            description: 'Total goals created',
            trend: {
                value: `${analytics.goals_growth || 0}%`,
                direction: (analytics.goals_growth || 0) >= 0 ? 'up' : 'down',
                label: 'vs last period'
            }
        },
        {
            id: 'completion_rate',
            title: 'Completion Rate',
            value: analytics.completion_rate || 0,
            icon: CheckCircle,
            theme: 'emerald',
            description: 'Goals successfully completed',
            format: 'percentage',
            trend: {
                value: `${analytics.completion_trend || 0}%`,
                direction: (analytics.completion_trend || 0) >= 0 ? 'up' : 'down',
                label: 'completion rate'
            }
        },
        {
            id: 'avg_progress',
            title: 'Avg Progress',
            value: analytics.avg_progress || 0,
            icon: Activity,
            theme: 'violet',
            description: 'Average goal progress',
            format: 'percentage'
        },
        {
            id: 'avg_completion_time',
            title: 'Avg Time to Complete',
            value: analytics.avg_completion_time || 0,
            icon: Clock,
            theme: 'amber',
            description: 'Average days to complete goals',
            suffix: ' days'
        }
    ];

    // Prepare chart data
    const progressChartData = goalStats.slice(0, 10).map(goal => ({
        name: goal.name.length > 15 ? goal.name.substring(0, 15) + '...' : goal.name,
        fullName: goal.name,
        current_amount: goal.current_amount,
        target_amount: goal.target_amount,
        progress_percentage: goal.progress_percentage,
    }));

    const statusDistributionData = [
        { name: 'Completed', value: analytics.completed_goals || 0, color: COLORS[0] },
        { name: 'In Progress', value: analytics.active_goals || 0, color: COLORS[1] },
        { name: 'Overdue', value: analytics.overdue_goals || 0, color: COLORS[2] },
        { name: 'Not Started', value: analytics.pending_goals || 0, color: COLORS[3] },
    ];

    // Table columns
    const tableColumns = [
        createColumn({
            key: 'name',
            label: 'Goal Name',
            sortable: true,
            render: (value, row) => {
                const status = getGoalStatus(row.progress_percentage, row.target_date);
                return (
                    <div className="flex items-center gap-2">
                        <status.icon className={`w-4 h-4 ${
                            status.color === 'green' ? 'text-green-500' :
                            status.color === 'red' ? 'text-red-500' :
                            status.color === 'amber' ? 'text-amber-500' :
                            status.color === 'blue' ? 'text-blue-500' :
                            status.color === 'violet' ? 'text-violet-500' :
                            'text-gray-500'
                        }`} />
                        <div>
                            <span className="font-medium">{value}</span>
                            <p className="text-xs text-muted-foreground">{row.description}</p>
                        </div>
                    </div>
                );
            }
        }),
        createColumn({
            key: 'target_amount',
            label: 'Target',
            sortable: true,
            render: (value) => (
                <span className="font-mono font-semibold">
                    ${value?.toLocaleString() || '0.00'}
                </span>
            )
        }),
        createColumn({
            key: 'current_amount',
            label: 'Current',
            sortable: true,
            render: (value) => (
                <span className="font-mono">
                    ${value?.toLocaleString() || '0.00'}
                </span>
            )
        }),
        createColumn({
            key: 'progress_percentage',
            label: 'Progress',
            sortable: true,
            render: (value, row) => {
                const status = getGoalStatus(value, row.target_date);
                return (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{value?.toFixed(1)}%</span>
                            <Badge variant={status.variant} className="text-xs">
                                {status.label}
                            </Badge>
                        </div>
                        <Progress 
                            value={Math.min(value || 0, 100)} 
                            className={cn(
                                "h-2",
                                value >= 100 && "bg-green-100 dark:bg-green-900/30",
                                value >= 75 && value < 100 && "bg-blue-100 dark:bg-blue-900/30"
                            )}
                        />
                    </div>
                );
            }
        }),
        createColumn({
            key: 'target_date',
            label: 'Target Date',
            sortable: true,
            render: (value, row) => {
                if (!value) return <span className="text-muted-foreground">No deadline</span>;
                
                const targetDate = parseISO(value);
                const today = new Date();
                const daysRemaining = differenceInDays(targetDate, today);
                
                return (
                    <div className="text-sm">
                        <span>{format(targetDate, 'MMM dd, yyyy')}</span>
                        <p className={cn(
                            "text-xs",
                            daysRemaining < 0 ? "text-red-500" :
                            daysRemaining <= 7 ? "text-amber-500" :
                            "text-muted-foreground"
                        )}>
                            {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` :
                             daysRemaining === 0 ? 'Due today' :
                             `${daysRemaining} days left`}
                        </p>
                    </div>
                );
            }
        }),
        createColumn({
            key: 'created_at',
            label: 'Created',
            render: (value) => (
                <span className="text-sm text-muted-foreground">
                    {format(new Date(value), 'MMM dd, yyyy')}
                </span>
            )
        }),
        createColumn({
            key: 'user_name',
            label: 'User',
            render: (value) => (
                <span className="text-sm font-medium">{value}</span>
            )
        }),
    ];

    // Custom filter controls
    const filterControls = (
        <>
            {/* Goal Filter */}
            <div className="space-y-2">
                <Label>Goal</Label>
                <Select 
                    value={filters.goal || 'all'} 
                    onValueChange={(value) => handleFiltersChange({ goal: value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="All Goals" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Goals</SelectItem>
                        {goals.map((goal) => (
                            <SelectItem key={goal.id} value={goal.id.toString()}>
                                {goal.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                    value={filters.status || 'all'} 
                    onValueChange={(value) => handleFiltersChange({ status: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="pending">Not Started</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Period Filter */}
            <div className="space-y-2">
                <Label>Period</Label>
                <Select 
                    value={filters.period || '30'} 
                    onValueChange={(value) => handleFiltersChange({ period: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                        <SelectItem value="365">Last year</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </>
    );

    if (loading) {
        return <LoadingSkeleton type="dashboard" count={8} />;
    }

    return (
        <AnalyticsLayout
            title="Goals Analytics"
            description="Track goal progress, completion rates, and achievement patterns across your platform"
            icon={Target}
            breadcrumbs={[
                { label: "Goals", icon: Target }
            ]}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onExport={handleExport}
            onRefresh={handleRefresh}
            exportFormats={['csv', 'pdf', 'excel']}
            loading={loading}
            filterControls={filterControls}
            metadata={{
                lastUpdated: 'just now',
                dataPoints: goalStats.length,
                timeRange: filters.period ? `Last ${filters.period} days` : 'All time'
            }}
        >
            <Head title="Goals Analytics - Admin" />

            {/* Key Metrics Dashboard */}
            <MetricsDashboard
                metrics={metricsData}
                layout="grid"
                columns="4"
                loading={loading}
                showMetaInfo={false}
            />

            {/* Charts Section */}
            <AnalyticsLayout.Grid columns="2">
                {/* Goal Progress Overview */}
                <ChartContainer
                    title="Goal Progress Overview"
                    description="Current vs target amounts for active goals"
                    chartType="bar"
                    loading={loading}
                    exportable={true}
                    onExport={(format) => handleExport(format, { chart: 'progress' })}
                    metadata={{
                        dataPoints: progressChartData.length
                    }}
                >
                    <RechartsChartContainer config={chartConfig} className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={progressChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 12 }}
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis yAxisId="amount" orientation="left" />
                                <YAxis yAxisId="percent" orientation="right" />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Bar yAxisId="amount" dataKey="target_amount" fill="var(--color-target_amount)" name="Target" opacity={0.7} />
                                <Bar yAxisId="amount" dataKey="current_amount" fill="var(--color-current_amount)" name="Current" />
                                <Line yAxisId="percent" type="monotone" dataKey="progress_percentage" stroke="var(--color-progress_percentage)" name="Progress %" strokeWidth={2} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </RechartsChartContainer>
                </ChartContainer>

                {/* Goal Status Distribution */}
                <ChartContainer
                    title="Goal Status Distribution"
                    description="Distribution of goals by completion status"
                    chartType="pie"
                    loading={loading}
                    exportable={true}
                    onExport={(format) => handleExport(format, { chart: 'status_distribution' })}
                    metadata={{
                        dataPoints: statusDistributionData.length
                    }}
                >
                    <RechartsChartContainer config={chartConfig} className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statusDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </RechartsChartContainer>
                </ChartContainer>
            </AnalyticsLayout.Grid>

            {/* Completion Trends */}
            <ChartContainer
                title="Goal Completion Trends"
                description="Monthly goal completion and creation trends"
                chartType="area"
                loading={loading}
                exportable={true}
                onExport={(format) => handleExport(format, { chart: 'completion_trends' })}
                metadata={{
                    dataPoints: completionTrends.length
                }}
            >
                <RechartsChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={completionTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Area 
                                type="monotone" 
                                dataKey="completed" 
                                stackId="1"
                                stroke="var(--color-completed)" 
                                fill="var(--color-completed)"
                                fillOpacity={0.6}
                                name="Completed Goals"
                            />
                            <Area 
                                type="monotone" 
                                dataKey="in_progress" 
                                stackId="1"
                                stroke="var(--color-in_progress)" 
                                fill="var(--color-in_progress)"
                                fillOpacity={0.6}
                                name="Goals in Progress"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </RechartsChartContainer>
            </ChartContainer>

            {/* Performance Insights */}
            <AnalyticsLayout.Grid columns="3">
                {/* Top Achievers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Top Achievers
                        </CardTitle>
                        <CardDescription>
                            Users with highest goal completion rates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {achievementData.slice(0, 5).map((user, index) => (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {user.completed_goals} goals completed
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                            <Star className="h-3 w-3 mr-1" />
                                            {user.completion_rate}%
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Completions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Recent Completions
                        </CardTitle>
                        <CardDescription>
                            Recently completed goals
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {goalStats.filter(g => g.progress_percentage >= 100).slice(0, 5).map((goal, index) => (
                                <div key={goal.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 w-8 h-8 rounded-full flex items-center justify-center">
                                            <CheckCircle className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{goal.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                ${goal.target_amount?.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">
                                            {goal.completed_at && format(new Date(goal.completed_at), 'MMM dd')}
                                        </p>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            Completed
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Goals at Risk */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            Goals at Risk
                        </CardTitle>
                        <CardDescription>
                            Goals that may need attention
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {goalStats.filter(g => {
                                const status = getGoalStatus(g.progress_percentage, g.target_date);
                                return status.color === 'red' || status.color === 'amber';
                            }).slice(0, 5).map((goal, index) => {
                                const status = getGoalStatus(goal.progress_percentage, goal.target_date);
                                return (
                                    <div key={goal.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center",
                                                status.color === 'red' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                                            )}>
                                                <status.icon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{goal.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {goal.progress_percentage?.toFixed(1)}% complete
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={status.variant} className="text-xs">
                                            {status.label}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </AnalyticsLayout.Grid>

            {/* Detailed Goals Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Detailed Goal Analysis
                    </CardTitle>
                    <CardDescription>
                        Comprehensive view of all goal progress and metrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={goalStats}
                        columns={tableColumns}
                        loading={loading}
                        searchPlaceholder="Search goals..."
                        className="mt-4"
                    />
                </CardContent>
            </Card>
        </AnalyticsLayout>
    );
}