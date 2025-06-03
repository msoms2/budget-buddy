import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AnalyticsLayout from '@/Pages/Admin/Components/Layouts/AnalyticsLayout';
import MetricsDashboard from './Components/Analytics/MetricsDashboard';
import ChartContainer from './Components/Analytics/ChartContainer';
import LoadingSkeleton from './Components/Analytics/LoadingSkeleton';
import AnalyticsCard from './Components/Analytics/AnalyticsCard';
import DataTable, { createColumn } from '@/Pages/Admin/Components/Shared/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Legend,
    Tooltip
} from 'recharts';
import {
    ChartContainer as RechartsChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    PieChart as PieChartIcon,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Activity,
    Target,
    DollarSign
} from "lucide-react";
import { format } from "date-fns";

export default function CategoriesAnalytics({ 
    auth, 
    analytics = {}, 
    categories = [], 
    categoryStats = [],
    topCategories = [],
    bottomCategories = [],
    categoryTrends = [],
    filters = {}
}) {
    const [loading, setLoading] = useState(false);

    // Chart configuration
    const chartConfig = {
        usage_count: {
            label: "Usage Count",
            color: "hsl(var(--chart-1))",
        },
        total_amount: {
            label: "Total Amount",
            color: "hsl(var(--chart-2))",
        },
        income: {
            label: "Income",
            color: "hsl(var(--chart-3))",
        },
        expense: {
            label: "Expense",
            color: "hsl(var(--chart-4))",
        }
    };

    // Color palette for pie chart
    const COLORS = [
        'hsl(var(--chart-1))',
        'hsl(var(--chart-2))',
        'hsl(var(--chart-3))',
        'hsl(var(--chart-4))',
        'hsl(var(--chart-5))',
        '#8B5CF6',
        '#06B6D4',
        '#10B981',
        '#F59E0B',
        '#EF4444'
    ];

    // Handle filter changes
    const handleFiltersChange = (newFilters) => {
        setLoading(true);
        router.get(route('admin.analytics.categories'), {
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
        
        window.open(route('admin.analytics.categories.export', exportData));
        setLoading(false);
    };

    // Handle refresh
    const handleRefresh = () => {
        handleFiltersChange({});
    };

    // Prepare metrics data
    const metricsData = [
        {
            id: 'total_categories',
            title: 'Total Categories',
            value: analytics.total_categories || 0,
            icon: PieChartIcon,
            theme: 'blue',
            description: 'Active categories in the system',
            trend: {
                value: `${analytics.categories_growth || 0}%`,
                direction: (analytics.categories_growth || 0) >= 0 ? 'up' : 'down',
                label: 'vs last period'
            }
        },
        {
            id: 'total_usage',
            title: 'Total Usage',
            value: analytics.total_usage || 0,
            icon: Activity,
            theme: 'emerald',
            description: 'Total category transactions',
            trend: {
                value: `${analytics.usage_growth || 0}%`,
                direction: (analytics.usage_growth || 0) >= 0 ? 'up' : 'down',
                label: 'usage increase'
            }
        },
        {
            id: 'avg_usage',
            title: 'Avg Usage per Category',
            value: analytics.avg_usage_per_category || 0,
            icon: Target,
            theme: 'violet',
            description: 'Average transactions per category',
            format: 'number'
        },
        {
            id: 'most_popular',
            title: 'Most Popular',
            value: analytics.most_popular_category || 'N/A',
            icon: TrendingUp,
            theme: 'amber',
            description: 'Category with highest usage',
            suffix: ''
        }
    ];

    // Prepare chart data
    const pieChartData = categoryStats.slice(0, 10).map(category => ({
        name: category.name,
        value: category.usage_count,
        amount: category.total_amount,
    }));

    const barChartData = categoryStats.slice(0, 15).map(category => ({
        name: category.name.length > 12 ? category.name.substring(0, 12) + '...' : category.name,
        fullName: category.name,
        usage_count: category.usage_count,
        total_amount: category.total_amount,
        income: category.income_amount || 0,
        expense: category.expense_amount || 0,
    }));

    // Table columns
    const tableColumns = [
        createColumn({
            key: 'name',
            label: 'Category Name',
            sortable: true,
            render: (value, row) => (
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${row.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="font-medium">{value}</span>
                    <Badge variant="outline" className="text-xs">
                        {row.type}
                    </Badge>
                </div>
            )
        }),
        createColumn({
            key: 'usage_count',
            label: 'Usage Count',
            sortable: true,
            render: (value) => (
                <span className="font-mono">{value?.toLocaleString()}</span>
            )
        }),
        createColumn({
            key: 'total_amount',
            label: 'Total Amount',
            sortable: true,
            render: (value) => (
                <span className="font-mono font-semibold">
                    ${value?.toLocaleString() || '0.00'}
                </span>
            )
        }),
        createColumn({
            key: 'avg_transaction',
            label: 'Avg Transaction',
            sortable: true,
            render: (value) => (
                <span className="font-mono text-sm">
                    ${value?.toLocaleString() || '0.00'}
                </span>
            )
        }),
        createColumn({
            key: 'last_used',
            label: 'Last Used',
            render: (value) => (
                <span className="text-sm text-muted-foreground">
                    {value ? format(new Date(value), 'MMM dd, yyyy') : 'Never'}
                </span>
            )
        }),
        createColumn({
            key: 'trend',
            label: 'Trend',
            render: (value, row) => {
                const trend = row.trend_direction;
                const trendValue = row.trend_percentage;
                return (
                    <div className="flex items-center gap-1">
                        {trend === 'up' ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : trend === 'down' ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        ) : null}
                        <span className={cn(
                            "text-sm font-medium",
                            trend === 'up' && "text-green-600",
                            trend === 'down' && "text-red-600",
                            !trend && "text-muted-foreground"
                        )}>
                            {trendValue ? `${trendValue}%` : 'N/A'}
                        </span>
                    </div>
                );
            }
        }),
    ];

    // Custom filter controls
    const filterControls = (
        <>
            {/* Category Filter */}
            <div className="space-y-2">
                <Label>Category Type</Label>
                <Select 
                    value={filters.category || 'all'} 
                    onValueChange={(value) => handleFiltersChange({ category: value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="income">Income Categories</SelectItem>
                        <SelectItem value="expense">Expense Categories</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                            </SelectItem>
                        ))}
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
            title="Categories Analytics"
            description="Analyze category usage patterns, performance metrics, and distribution across your platform"
            icon={PieChartIcon}
            breadcrumbs={[
                { label: "Categories", icon: PieChartIcon }
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
                dataPoints: categoryStats.length,
                timeRange: filters.period ? `Last ${filters.period} days` : 'All time'
            }}
        >
            <Head title="Categories Analytics - Admin" />

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
                {/* Category Distribution Pie Chart */}
                <ChartContainer
                    title="Category Distribution"
                    description="Usage distribution across categories"
                    chartType="pie"
                    loading={loading}
                    exportable={true}
                    onExport={(format) => handleExport(format, { chart: 'pie_distribution' })}
                    metadata={{
                        dataPoints: pieChartData.length
                    }}
                >
                    <RechartsChartContainer config={chartConfig} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </RechartsChartContainer>
                </ChartContainer>

                {/* Usage Frequency Bar Chart */}
                <ChartContainer
                    title="Usage Frequency"
                    description="Transaction frequency by category"
                    chartType="bar"
                    loading={loading}
                    exportable={true}
                    onExport={(format) => handleExport(format, { chart: 'bar_frequency' })}
                    metadata={{
                        dataPoints: barChartData.length
                    }}
                >
                    <RechartsChartContainer config={chartConfig} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 12 }}
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="usage_count" fill="var(--color-usage_count)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </RechartsChartContainer>
                </ChartContainer>
            </AnalyticsLayout.Grid>

            {/* Performance Tables */}
            <AnalyticsLayout.Grid columns="2">
                {/* Top Performing Categories */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            Top Performing Categories
                        </CardTitle>
                        <CardDescription>
                            Categories with highest usage and amounts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topCategories.slice(0, 5).map((category, index) => (
                                <div key={category.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{category.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {category.usage_count} transactions
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono font-semibold">
                                            ${category.total_amount?.toLocaleString()}
                                        </p>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            +{category.growth_rate || 0}%
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Underperforming Categories */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingDown className="h-5 w-5 text-red-500" />
                            Underperforming Categories
                        </CardTitle>
                        <CardDescription>
                            Categories with low usage or declining trends
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {bottomCategories.slice(0, 5).map((category, index) => (
                                <div key={category.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{category.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {category.usage_count} transactions
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono font-semibold">
                                            ${category.total_amount?.toLocaleString()}
                                        </p>
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                            <TrendingDown className="h-3 w-3 mr-1" />
                                            {category.decline_rate || 0}%
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </AnalyticsLayout.Grid>

            {/* Detailed Categories Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Detailed Category Analysis
                    </CardTitle>
                    <CardDescription>
                        Comprehensive view of all category performance metrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={categoryStats}
                        columns={tableColumns}
                        loading={loading}
                        searchPlaceholder="Search categories..."
                        className="mt-4"
                    />
                </CardContent>
            </Card>
        </AnalyticsLayout>
    );
}