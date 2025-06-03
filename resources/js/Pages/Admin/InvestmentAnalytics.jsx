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
    TrendingUp,
    TrendingDown,
    DollarSign,
    Percent,
    PieChart as PieChartIcon,
    BarChart3,
    Activity,
    Briefcase,
    Target,
    Star,
    AlertTriangle,
    CheckCircle,
    Zap
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function InvestmentAnalytics({ 
    auth, 
    analytics = {}, 
    investments = [], 
    investmentStats = [],
    portfolioData = [],
    performanceData = [],
    assetAllocation = [],
    roiComparison = [],
    riskAnalysis = [],
    filters = {}
}) {
    const [loading, setLoading] = useState(false);

    // Chart configuration
    const chartConfig = {
        current_value: {
            label: "Current Value",
            color: "hsl(var(--chart-1))",
        },
        initial_investment: {
            label: "Initial Investment",
            color: "hsl(var(--chart-2))",
        },
        roi_percentage: {
            label: "ROI %",
            color: "hsl(var(--chart-3))",
        },
        gain_loss: {
            label: "Gain/Loss",
            color: "hsl(var(--chart-4))",
        },
        portfolio_value: {
            label: "Portfolio Value",
            color: "hsl(var(--chart-5))",
        }
    };

    // Color palette for charts
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
        router.get(route('admin.analytics.investments'), {
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
        
        window.open(route('admin.analytics.investments.export', exportData));
        setLoading(false);
    };

    // Handle refresh
    const handleRefresh = () => {
        handleFiltersChange({});
    };

    // Calculate investment performance status
    const getPerformanceStatus = (roiPercentage) => {
        if (roiPercentage >= 15) {
            return { label: 'Excellent', color: 'green', variant: 'success', icon: TrendingUp };
        }
        if (roiPercentage >= 5) {
            return { label: 'Good', color: 'blue', variant: 'default', icon: CheckCircle };
        }
        if (roiPercentage >= 0) {
            return { label: 'Positive', color: 'emerald', variant: 'secondary', icon: Activity };
        }
        if (roiPercentage >= -10) {
            return { label: 'Minor Loss', color: 'amber', variant: 'warning', icon: AlertTriangle };
        }
        return { label: 'Major Loss', color: 'red', variant: 'destructive', icon: TrendingDown };
    };

    // Get risk level styling
    const getRiskStyling = (riskLevel) => {
        switch (riskLevel?.toLowerCase()) {
            case 'low':
                return { color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-200' };
            case 'medium':
                return { color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-200' };
            case 'high':
                return { color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-200' };
            default:
                return { color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-900/30', border: 'border-gray-200' };
        }
    };

    // Prepare metrics data
    const metricsData = [
        {
            id: 'total_portfolio_value',
            title: 'Total Portfolio Value',
            value: analytics.total_portfolio_value || 0,
            icon: Briefcase,
            theme: 'blue',
            description: 'Total value of all investments',
            format: 'currency',
            trend: {
                value: `${analytics.portfolio_growth || 0}%`,
                direction: (analytics.portfolio_growth || 0) >= 0 ? 'up' : 'down',
                label: 'vs last period'
            }
        },
        {
            id: 'avg_roi',
            title: 'Average ROI',
            value: analytics.avg_roi || 0,
            icon: TrendingUp,
            theme: 'emerald',
            description: 'Average return on investment',
            format: 'percentage',
            trend: {
                value: `${analytics.roi_trend || 0}%`,
                direction: (analytics.roi_trend || 0) >= 0 ? 'up' : 'down',
                label: 'performance change'
            }
        },
        {
            id: 'total_investments',
            title: 'Total Investments',
            value: analytics.total_investments || 0,
            icon: Target,
            theme: 'violet',
            description: 'Number of active investments',
            trend: {
                value: `${analytics.investments_growth || 0}%`,
                direction: (analytics.investments_growth || 0) >= 0 ? 'up' : 'down',
                label: 'new investments'
            }
        },
        {
            id: 'best_performer',
            title: 'Best Performer',
            value: analytics.best_performer_roi || 0,
            icon: Star,
            theme: 'amber',
            description: 'Highest ROI investment',
            format: 'percentage'
        }
    ];

    // Prepare chart data
    const performanceChartData = investmentStats.slice(0, 10).map(investment => ({
        name: investment.name.length > 15 ? investment.name.substring(0, 15) + '...' : investment.name,
        fullName: investment.name,
        current_value: investment.current_value,
        initial_investment: investment.initial_investment,
        roi_percentage: investment.roi_percentage,
        gain_loss: investment.current_value - investment.initial_investment,
    }));

    const allocationChartData = assetAllocation.map(allocation => ({
        name: allocation.category_name,
        value: allocation.total_value,
        percentage: allocation.percentage,
        count: allocation.investment_count,
    }));

    // Table columns
    const tableColumns = [
        createColumn({
            key: 'name',
            label: 'Investment',
            sortable: true,
            render: (value, row) => {
                const status = getPerformanceStatus(row.roi_percentage);
                const riskStyling = getRiskStyling(row.risk_level);
                return (
                    <div className="flex items-center gap-2">
                        <status.icon className={`w-4 h-4 ${
                            status.color === 'green' ? 'text-green-500' :
                            status.color === 'blue' ? 'text-blue-500' :
                            status.color === 'emerald' ? 'text-emerald-500' :
                            status.color === 'amber' ? 'text-amber-500' :
                            'text-red-500'
                        }`} />
                        <div>
                            <span className="font-medium">{value}</span>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-muted-foreground">{row.category_name}</p>
                                <Badge 
                                    variant="outline" 
                                    className={cn("text-xs", riskStyling.color, riskStyling.bg, riskStyling.border)}
                                >
                                    {row.risk_level} Risk
                                </Badge>
                            </div>
                        </div>
                    </div>
                );
            }
        }),
        createColumn({
            key: 'initial_investment',
            label: 'Initial Investment',
            sortable: true,
            render: (value) => (
                <span className="font-mono">
                    ${value?.toLocaleString() || '0.00'}
                </span>
            )
        }),
        createColumn({
            key: 'current_value',
            label: 'Current Value',
            sortable: true,
            render: (value) => (
                <span className="font-mono font-semibold">
                    ${value?.toLocaleString() || '0.00'}
                </span>
            )
        }),
        createColumn({
            key: 'roi_percentage',
            label: 'ROI',
            sortable: true,
            render: (value, row) => {
                const status = getPerformanceStatus(value);
                const gainLoss = row.current_value - row.initial_investment;
                
                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "font-mono font-semibold",
                                value >= 0 ? "text-green-600" : "text-red-600"
                            )}>
                                {value >= 0 ? '+' : ''}{value?.toFixed(2)}%
                            </span>
                            <Badge variant={status.variant} className="text-xs">
                                {status.label}
                            </Badge>
                        </div>
                        <p className={cn(
                            "text-xs font-mono",
                            gainLoss >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                            {gainLoss >= 0 ? '+' : ''}${gainLoss?.toLocaleString()}
                        </p>
                    </div>
                );
            }
        }),
        createColumn({
            key: 'quantity',
            label: 'Quantity',
            sortable: true,
            render: (value) => (
                <span className="font-mono">{value?.toLocaleString()}</span>
            )
        }),
        createColumn({
            key: 'purchase_date',
            label: 'Purchase Date',
            sortable: true,
            render: (value) => (
                <span className="text-sm">
                    {format(new Date(value), 'MMM dd, yyyy')}
                </span>
            )
        }),
        createColumn({
            key: 'days_held',
            label: 'Days Held',
            render: (value, row) => {
                const daysHeld = differenceInDays(new Date(), new Date(row.purchase_date));
                return (
                    <div className="text-sm">
                        <span className="font-medium">{daysHeld}</span>
                        <p className="text-xs text-muted-foreground">
                            {daysHeld > 365 ? `${Math.floor(daysHeld / 365)}y ${daysHeld % 365}d` : `${daysHeld} days`}
                        </p>
                    </div>
                );
            }
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
            {/* Category Filter */}
            <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                    value={filters.category || 'all'} 
                    onValueChange={(value) => handleFiltersChange({ category: value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="stocks">Stocks</SelectItem>
                        <SelectItem value="bonds">Bonds</SelectItem>
                        <SelectItem value="etf">ETFs</SelectItem>
                        <SelectItem value="crypto">Cryptocurrency</SelectItem>
                        <SelectItem value="real_estate">Real Estate</SelectItem>
                        <SelectItem value="commodities">Commodities</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Risk Level Filter */}
            <div className="space-y-2">
                <Label>Risk Level</Label>
                <Select 
                    value={filters.risk || 'all'} 
                    onValueChange={(value) => handleFiltersChange({ risk: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Risk Levels</SelectItem>
                        <SelectItem value="low">Low Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
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
            title="Investment Analytics"
            description="Monitor investment portfolio performance, asset allocation, and ROI analysis across your platform"
            icon={Briefcase}
            breadcrumbs={[
                { label: "Investments", icon: Briefcase }
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
                dataPoints: investmentStats.length,
                timeRange: filters.period ? `Last ${filters.period} days` : 'All time'
            }}
        >
            <Head title="Investment Analytics - Admin" />

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
                {/* Portfolio Allocation Chart */}
                <ChartContainer
                    title="Portfolio Allocation"
                    description="Asset distribution across investment categories"
                    chartType="pie"
                    loading={loading}
                    exportable={true}
                    onExport={(format) => handleExport(format, { chart: 'portfolio_allocation' })}
                    metadata={{
                        dataPoints: allocationChartData.length
                    }}
                >
                    <RechartsChartContainer config={chartConfig} className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={allocationChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percentage }) => `${name} (${percentage?.toFixed(1)}%)`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {allocationChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </RechartsChartContainer>
                </ChartContainer>

                {/* Performance Trends Chart */}
                <ChartContainer
                    title="Investment Performance"
                    description="ROI comparison across investments"
                    chartType="bar"
                    loading={loading}
                    exportable={true}
                    onExport={(format) => handleExport(format, { chart: 'performance_trends' })}
                    metadata={{
                        dataPoints: performanceChartData.length
                    }}
                >
                    <RechartsChartContainer config={chartConfig} className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={performanceChartData}>
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
                                <Bar yAxisId="amount" dataKey="initial_investment" fill="var(--color-initial_investment)" name="Initial" opacity={0.7} />
                                <Bar yAxisId="amount" dataKey="current_value" fill="var(--color-current_value)" name="Current Value" />
                                <Line yAxisId="percent" type="monotone" dataKey="roi_percentage" stroke="var(--color-roi_percentage)" name="ROI %" strokeWidth={2} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </RechartsChartContainer>
                </ChartContainer>
            </AnalyticsLayout.Grid>

            {/* Portfolio Performance Timeline */}
            <ChartContainer
                title="Portfolio Performance Timeline"
                description="Historical portfolio value and performance trends"
                chartType="area"
                loading={loading}
                exportable={true}
                onExport={(format) => handleExport(format, { chart: 'portfolio_timeline' })}
                metadata={{
                    dataPoints: performanceData.length
                }}
            >
                <RechartsChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Area 
                                type="monotone" 
                                dataKey="portfolio_value" 
                                stroke="var(--color-portfolio_value)" 
                                fill="var(--color-portfolio_value)"
                                fillOpacity={0.6}
                                name="Portfolio Value"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </RechartsChartContainer>
            </ChartContainer>

            {/* Investment Insights */}
            <AnalyticsLayout.Grid columns="3">
                {/* Top Performers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500" />
                            Top Performers
                        </CardTitle>
                        <CardDescription>
                            Investments with highest ROI
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {investmentStats.sort((a, b) => b.roi_percentage - a.roi_percentage).slice(0, 5).map((investment, index) => (
                                <div key={investment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{investment.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                ${investment.current_value?.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            +{investment.roi_percentage?.toFixed(2)}%
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Risk Analysis */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Risk Analysis
                        </CardTitle>
                        <CardDescription>
                            Portfolio risk distribution
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {riskAnalysis.map((risk, index) => {
                                const riskStyling = getRiskStyling(risk.risk_level);
                                return (
                                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                                riskStyling.bg, riskStyling.color
                                            )}>
                                                {risk.investment_count}
                                            </div>
                                            <div>
                                                <p className="font-medium capitalize">{risk.risk_level} Risk</p>
                                                <p className="text-sm text-muted-foreground">
                                                    ${risk.total_value?.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{risk.percentage?.toFixed(1)}%</p>
                                            <Progress 
                                                value={risk.percentage} 
                                                className="w-16 h-2 mt-1"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-blue-500" />
                            Recent Activity
                        </CardTitle>
                        <CardDescription>
                            Latest investment transactions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {investmentStats.sort((a, b) => new Date(b.last_transaction_date || 0) - new Date(a.last_transaction_date || 0)).slice(0, 5).map((investment, index) => (
                                <div key={investment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-8 h-8 rounded-full flex items-center justify-center">
                                            <Briefcase className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{investment.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {investment.last_transaction_type} - {investment.last_transaction_quantity} shares
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">
                                            {investment.last_transaction_date && format(new Date(investment.last_transaction_date), 'MMM dd')}
                                        </p>
                                        <Badge variant="outline" className="text-xs">
                                            ${investment.last_transaction_amount?.toLocaleString()}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </AnalyticsLayout.Grid>

            {/* Detailed Investments Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Detailed Investment Analysis
                    </CardTitle>
                    <CardDescription>
                        Comprehensive view of all investment positions and performance metrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={investmentStats}
                        columns={tableColumns}
                        loading={loading}
                        searchPlaceholder="Search investments..."
                        className="mt-4"
                    />
                </CardContent>
            </Card>
        </AnalyticsLayout>
    );
}