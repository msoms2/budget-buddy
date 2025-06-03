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
    ComposedChart
} from 'recharts';
import {
    ChartContainer as RechartsChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Target,
    AlertTriangle,
    CheckCircle,
    Clock,
    BarChart3,
    Activity
} from "lucide-react";
import { format } from "date-fns";

export default function BudgetAnalytics({
    auth,
    analytics = {},
    budgets = [],
    budgetStats = [],
    budgetTrends = [],
    utilizationData = [],
    adherenceData = [],
    monthlyComparison = [],
    filters = {},
    // Unified dashboard props
    data = null,
    isLoading = false,
    embedded = false
}) {
    const [loading, setLoading] = useState(false);
    
    // Use unified data if in embedded mode
    const actualAnalytics = embedded && data ? data.analytics || {} : analytics;
    const actualBudgets = embedded && data ? data.budgets || [] : budgets;
    const actualBudgetStats = embedded && data ? data.budgetStats || [] : budgetStats;
    const actualBudgetTrends = embedded && data ? data.budgetTrends || [] : budgetTrends;
    const actualUtilizationData = embedded && data ? data.utilizationData || [] : utilizationData;
    const actualAdherenceData = embedded && data ? data.adherenceData || [] : adherenceData;
    const actualLoading = embedded ? isLoading : loading;

    // Chart configuration
    const chartConfig = {
        budgeted: {
            label: "Budgeted Amount",
            color: "hsl(var(--chart-1))",
        },
        spent: {
            label: "Spent Amount",
            color: "hsl(var(--chart-2))",
        },
        remaining: {
            label: "Remaining",
            color: "hsl(var(--chart-3))",
        },
        utilization: {
            label: "Utilization %",
            color: "hsl(var(--chart-4))",
        },
        adherence: {
            label: "Adherence Rate",
            color: "hsl(var(--chart-5))",
        }
    };

    // Handle filter changes
    const handleFiltersChange = (newFilters) => {
        setLoading(true);
        router.get(route('admin.analytics.budgets'), {
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
        
        window.open(route('admin.analytics.budgets.export', exportData));
        setLoading(false);
    };

    // Handle refresh
    const handleRefresh = () => {
        handleFiltersChange({});
    };

    // Prepare metrics data
    const metricsData = [
        {
            id: 'total_budgets',
            title: 'Total Budgets',
            value: actualAnalytics.total_budgets || 0,
            icon: Wallet,
            theme: 'blue',
            description: 'Active budgets in the system',
            trend: {
                value: `${actualAnalytics.budgets_growth || 0}%`,
                direction: (actualAnalytics.budgets_growth || 0) >= 0 ? 'up' : 'down',
                label: 'vs last period'
            }
        },
        {
            id: 'total_budgeted',
            title: 'Total Budgeted',
            value: actualAnalytics.total_budgeted || 0,
            icon: DollarSign,
            theme: 'emerald',
            description: 'Total allocated budget amount',
            format: 'currency',
            trend: {
                value: `${actualAnalytics.budget_growth || 0}%`,
                direction: (actualAnalytics.budget_growth || 0) >= 0 ? 'up' : 'down',
                label: 'budget increase'
            }
        },
        {
            id: 'avg_utilization',
            title: 'Avg Utilization',
            value: actualAnalytics.avg_utilization || 0,
            icon: Target,
            theme: 'violet',
            description: 'Average budget utilization rate',
            format: 'percentage'
        },
        {
            id: 'adherence_rate',
            title: 'Adherence Rate',
            value: actualAnalytics.avg_adherence || 0,
            icon: CheckCircle,
            theme: 'amber',
            description: 'Average budget adherence score',
            format: 'percentage'
        }
    ];

    // Prepare chart data
    const utilizationChartData = actualUtilizationData.map(item => ({
        name: item.name,
        budgeted: item.budgeted_amount,
        spent: item.spent_amount,
        utilization: item.utilization_percentage,
        remaining: item.remaining_amount,
    }));

    const trendsChartData = actualBudgetTrends.map(item => ({
        month: item.month,
        budgeted: item.total_budgeted,
        spent: item.total_spent,
        adherence: item.adherence_rate,
        variance: item.variance_percentage,
    }));

    // Calculate budget status
    const getBudgetStatus = (utilization) => {
        if (utilization >= 100) return { label: 'Over Budget', color: 'red', variant: 'destructive' };
        if (utilization >= 80) return { label: 'Near Limit', color: 'amber', variant: 'warning' };
        if (utilization >= 60) return { label: 'On Track', color: 'blue', variant: 'default' };
        return { label: 'Under Used', color: 'green', variant: 'success' };
    };

    // Table columns
    const tableColumns = [
        createColumn({
            key: 'name',
            label: 'Budget Name',
            sortable: true,
            render: (value, row) => (
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                        row.status === 'active' ? 'bg-green-500' : 
                        row.status === 'paused' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <div>
                        <span className="font-medium">{value}</span>
                        <p className="text-xs text-muted-foreground">{row.category_name}</p>
                    </div>
                </div>
            )
        }),
        createColumn({
            key: 'budgeted_amount',
            label: 'Budgeted',
            sortable: true,
            render: (value) => (
                <span className="font-mono font-semibold">
                    ${value?.toLocaleString() || '0.00'}
                </span>
            )
        }),
        createColumn({
            key: 'spent_amount',
            label: 'Spent',
            sortable: true,
            render: (value) => (
                <span className="font-mono">
                    ${value?.toLocaleString() || '0.00'}
                </span>
            )
        }),
        createColumn({
            key: 'remaining_amount',
            label: 'Remaining',
            sortable: true,
            render: (value, row) => (
                <span className={cn(
                    "font-mono",
                    value < 0 ? "text-red-600" : "text-green-600"
                )}>
                    ${Math.abs(value || 0).toLocaleString()}
                    {value < 0 && ' over'}
                </span>
            )
        }),
        createColumn({
            key: 'utilization_percentage',
            label: 'Utilization',
            sortable: true,
            render: (value, row) => {
                const status = getBudgetStatus(value);
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
                                value >= 100 && "bg-red-100 dark:bg-red-900/30",
                                value >= 80 && value < 100 && "bg-amber-100 dark:bg-amber-900/30"
                            )}
                        />
                    </div>
                );
            }
        }),
        createColumn({
            key: 'period',
            label: 'Period',
            render: (value, row) => (
                <div className="text-sm">
                    <span className="capitalize">{value}</span>
                    {row.end_date && (
                        <p className="text-xs text-muted-foreground">
                            Ends {format(new Date(row.end_date), 'MMM dd')}
                        </p>
                    )}
                </div>
            )
        }),
        createColumn({
            key: 'adherence_score',
            label: 'Adherence',
            render: (value) => (
                <div className="flex items-center gap-2">
                    {value >= 80 ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : value >= 60 ? (
                        <Clock className="h-4 w-4 text-yellow-500" />
                    ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={cn(
                        "text-sm font-medium",
                        value >= 80 && "text-green-600",
                        value >= 60 && value < 80 && "text-yellow-600",
                        value < 60 && "text-red-600"
                    )}>
                        {value?.toFixed(0)}%
                    </span>
                </div>
            )
        }),
    ];

    // Custom filter controls
    const filterControls = (
        <>
            {/* Budget Filter */}
            <div className="space-y-2">
                <Label>Budget</Label>
                <Select 
                    value={filters.budget || 'all'} 
                    onValueChange={(value) => handleFiltersChange({ budget: value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="All Budgets" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Budgets</SelectItem>
                        {actualBudgets.map((budget) => (
                            <SelectItem key={budget.id} value={budget.id.toString()}>
                                {budget.name}
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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="over_budget">Over Budget</SelectItem>
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
            title="Budget Analytics"
            description="Monitor budget utilization, adherence rates, and spending patterns across your platform"
            icon={Wallet}
            breadcrumbs={[
                { label: "Budgets", icon: Wallet }
            ]}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onExport={handleExport}
            onRefresh={handleRefresh}
            exportFormats={['csv', 'pdf', 'excel']}
            loading={actualLoading}
            filterControls={filterControls}
            metadata={{
                lastUpdated: 'just now',
                dataPoints: actualBudgetStats.length,
                timeRange: filters.period ? `Last ${filters.period} days` : 'All time'
            }}
        >
            <Head title="Budget Analytics - Admin" />

            {/* Key Metrics Dashboard */}
            <MetricsDashboard
                metrics={metricsData}
                layout="grid"
                columns="4"
                loading={actualLoading}
                showMetaInfo={false}
            />

            {/* Charts Section */}
            <AnalyticsLayout.Grid columns="2">
                {/* Budget Utilization Chart */}
                <ChartContainer
                    title="Budget Utilization"
                    description="Comparison of budgeted vs spent amounts"
                    chartType="bar"
                    loading={loading}
                    exportable={true}
                    onExport={(format) => handleExport(format, { chart: 'utilization' })}
                    metadata={{
                        dataPoints: utilizationChartData.length
                    }}
                >
                    <RechartsChartContainer config={chartConfig} className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={utilizationChartData}>
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
                                <Bar yAxisId="amount" dataKey="budgeted" fill="var(--color-budgeted)" name="Budgeted" />
                                <Bar yAxisId="amount" dataKey="spent" fill="var(--color-spent)" name="Spent" />
                                <Line yAxisId="percent" type="monotone" dataKey="utilization" stroke="var(--color-utilization)" name="Utilization %" strokeWidth={2} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </RechartsChartContainer>
                </ChartContainer>

                {/* Spending Trends Chart */}
                <ChartContainer
                    title="Spending Trends"
                    description="Monthly budget vs spending trends"
                    chartType="area"
                    loading={loading}
                    exportable={true}
                    onExport={(format) => handleExport(format, { chart: 'trends' })}
                    metadata={{
                        dataPoints: trendsChartData.length
                    }}
                >
                    <RechartsChartContainer config={chartConfig} className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendsChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Area 
                                    type="monotone" 
                                    dataKey="budgeted" 
                                    stackId="1"
                                    stroke="var(--color-budgeted)" 
                                    fill="var(--color-budgeted)"
                                    fillOpacity={0.6}
                                    name="Budgeted"
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="spent" 
                                    stackId="1"
                                    stroke="var(--color-spent)" 
                                    fill="var(--color-spent)"
                                    fillOpacity={0.6}
                                    name="Spent"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </RechartsChartContainer>
                </ChartContainer>
            </AnalyticsLayout.Grid>

            {/* Budget Status Overview */}
            <AnalyticsLayout.Grid columns="3">
                {/* Budget Adherence Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            Budget Adherence
                        </CardTitle>
                        <CardDescription>
                            Budget adherence status breakdown
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {adherenceData.slice(0, 4).map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                            item.status === 'excellent' && "bg-green-100 text-green-600",
                                            item.status === 'good' && "bg-blue-100 text-blue-600",
                                            item.status === 'fair' && "bg-yellow-100 text-yellow-600",
                                            item.status === 'poor' && "bg-red-100 text-red-600"
                                        )}>
                                            {item.count}
                                        </div>
                                        <div>
                                            <p className="font-medium capitalize">{item.status}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.percentage}% of budgets
                                            </p>
                                        </div>
                                    </div>
                                    <Progress 
                                        value={item.percentage} 
                                        className="w-16 h-2"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Performing Budgets */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            Top Performing
                        </CardTitle>
                        <CardDescription>
                            Budgets with best adherence rates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {budgetStats.filter(b => b.adherence_score >= 80).slice(0, 5).map((budget, index) => (
                                <div key={budget.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{budget.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {budget.utilization_percentage?.toFixed(1)}% utilized
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        {budget.adherence_score?.toFixed(0)}%
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Budget Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Budget Alerts
                        </CardTitle>
                        <CardDescription>
                            Budgets requiring attention
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {budgetStats.filter(b => b.utilization_percentage >= 80).slice(0, 5).map((budget, index) => (
                                <div key={budget.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                            budget.utilization_percentage >= 100 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                                        )}>
                                            {budget.utilization_percentage >= 100 ? '!' : '⚠'}
                                        </div>
                                        <div>
                                            <p className="font-medium">{budget.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {budget.utilization_percentage?.toFixed(1)}% utilized
                                            </p>
                                        </div>
                                    </div>
                                    <Badge 
                                        variant={budget.utilization_percentage >= 100 ? "destructive" : "secondary"}
                                        className="text-xs"
                                    >
                                        {budget.utilization_percentage >= 100 ? 'Over Budget' : 'Near Limit'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </AnalyticsLayout.Grid>

            {/* Detailed Budgets Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Detailed Budget Analysis
                    </CardTitle>
                    <CardDescription>
                        Comprehensive view of all budget performance metrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={budgetStats}
                        columns={tableColumns}
                        loading={loading}
                        searchPlaceholder="Search budgets..."
                        className="mt-4"
                    />
                </CardContent>
            </Card>
        </AnalyticsLayout>
    );
}