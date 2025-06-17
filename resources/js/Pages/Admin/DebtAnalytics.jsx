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
    CreditCard,
    TrendingUp,
    TrendingDown,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Clock,
    Percent,
    BarChart3,
    Activity,
    Banknote,
    Calculator
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";

export default function DebtAnalytics({ 
    auth, 
    analytics = {}, 
    debts = [], 
    debtStats = [],
    paymentSchedules = [],
    interestAnalysis = [],
    payoffProjections = [],
    creditorStats = [],
    filters = {}
}) {
    const [loading, setLoading] = useState(false);

    // Chart configuration
    const chartConfig = {
        total_debt: {
            label: "Total Debt",
            color: "hsl(var(--chart-1))",
        },
        paid_amount: {
            label: "Paid Amount",
            color: "hsl(var(--chart-2))",
        },
        remaining_debt: {
            label: "Remaining Debt",
            color: "hsl(var(--chart-3))",
        },
        interest_rate: {
            label: "Interest Rate",
            color: "hsl(var(--chart-4))",
        },
        monthly_payment: {
            label: "Monthly Payment",
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
    ];

    // Handle filter changes
    const handleFiltersChange = (newFilters) => {
        setLoading(true);
        router.get(route('admin.analytics.debts'), {
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
        
        window.open(route('admin.analytics.debts.export', exportData));
        setLoading(false);
    };

    // Handle refresh
    const handleRefresh = () => {
        handleFiltersChange({});
    };

    // Calculate debt status
    const getDebtStatus = (remainingDebt, totalDebt, paymentStatus) => {
        const paidPercentage = ((totalDebt - remainingDebt) / totalDebt) * 100;
        
        if (paymentStatus === 'paid_off') {
            return { label: 'Paid Off', color: 'green', variant: 'success', icon: CheckCircle };
        }
        if (paymentStatus === 'overdue') {
            return { label: 'Overdue', color: 'red', variant: 'destructive', icon: AlertTriangle };
        }
        if (paidPercentage >= 75) {
            return { label: 'Nearly Paid', color: 'blue', variant: 'default', icon: TrendingUp };
        }
        if (paidPercentage >= 25) {
            return { label: 'In Progress', color: 'violet', variant: 'secondary', icon: Activity };
        }
        return { label: 'Just Started', color: 'gray', variant: 'outline', icon: CreditCard };
    };

    // Prepare metrics data
    const metricsData = [
        {
            id: 'total_debt',
            title: 'Total Debt',
            value: analytics.total_debt || 0,
            icon: CreditCard,
            theme: 'rose',
            description: 'Outstanding debt amount',
            format: 'currency',
            trend: {
                value: `${analytics.debt_trend || 0}%`,
                direction: (analytics.debt_trend || 0) <= 0 ? 'down' : 'up',
                label: 'vs last period'
            }
        },
        {
            id: 'avg_interest_rate',
            title: 'Avg Interest Rate',
            value: analytics.avg_interest_rate || 0,
            icon: Percent,
            theme: 'amber',
            description: 'Average interest across debts',
            format: 'percentage'
        },
        {
            id: 'monthly_payments',
            title: 'Monthly Payments',
            value: analytics.monthly_payments || 0,
            icon: Banknote,
            theme: 'blue',
            description: 'Total monthly debt payments',
            format: 'currency'
        },
        {
            id: 'debt_to_income',
            title: 'Debt-to-Income',
            value: analytics.debt_to_income_ratio || 0,
            icon: Calculator,
            theme: 'violet',
            description: 'Average debt-to-income ratio',
            format: 'percentage'
        }
    ];

    // Prepare chart data
    const debtOverviewData = debtStats.slice(0, 10).map(debt => ({
        name: debt.creditor_name.length > 12 ? debt.creditor_name.substring(0, 12) + '...' : debt.creditor_name,
        fullName: debt.creditor_name,
        total_debt: debt.total_debt,
        remaining_debt: debt.remaining_debt,
        paid_amount: debt.total_debt - debt.remaining_debt,
        interest_rate: debt.interest_rate,
    }));

    const payoffTrendsData = payoffProjections.map(item => ({
        month: item.month,
        projected_balance: item.projected_balance,
        actual_payments: item.actual_payments,
        interest_paid: item.interest_paid,
    }));

    const creditorDistributionData = creditorStats.map(creditor => ({
        name: creditor.name,
        value: creditor.total_debt,
        count: creditor.debt_count,
    }));

    // Table columns
    const tableColumns = [
        createColumn({
            key: 'creditor_name',
            label: 'Creditor',
            sortable: true,
            render: (value, row) => {
                const status = getDebtStatus(row.remaining_debt, row.total_debt, row.payment_status);
                return (
                    <div className="flex items-center gap-2">
                        <status.icon className={`w-4 h-4 ${
                            status.color === 'green' ? 'text-green-500' :
                            status.color === 'red' ? 'text-red-500' :
                            status.color === 'blue' ? 'text-blue-500' :
                            status.color === 'violet' ? 'text-violet-500' :
                            'text-gray-500'
                        }`} />
                        <div>
                            <span className="font-medium">{value}</span>
                            <p className="text-xs text-muted-foreground">{row.debt_type}</p>
                        </div>
                    </div>
                );
            }
        }),
        createColumn({
            key: 'total_debt',
            label: 'Total Debt',
            sortable: true,
            render: (value) => (
                <span className="font-mono font-semibold">
                    ${value?.toLocaleString() || '0.00'}
                </span>
            )
        }),
        createColumn({
            key: 'remaining_debt',
            label: 'Remaining',
            sortable: true,
            render: (value) => (
                <span className="font-mono text-red-600">
                    ${value?.toLocaleString() || '0.00'}
                </span>
            )
        }),
        createColumn({
            key: 'progress',
            label: 'Progress',
            render: (value, row) => {
                const paidPercentage = ((row.total_debt - row.remaining_debt) / row.total_debt) * 100;
                const status = getDebtStatus(row.remaining_debt, row.total_debt, row.payment_status);
                
                return (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{paidPercentage.toFixed(1)}%</span>
                            <Badge variant={status.variant} className="text-xs">
                                {status.label}
                            </Badge>
                        </div>
                        <Progress 
                            value={paidPercentage} 
                            className={cn(
                                "h-2",
                                paidPercentage >= 75 && "bg-blue-100 dark:bg-blue-900/30",
                                paidPercentage >= 100 && "bg-green-100 dark:bg-green-900/30"
                            )}
                        />
                    </div>
                );
            }
        }),
        createColumn({
            key: 'interest_rate',
            label: 'Interest Rate',
            sortable: true,
            render: (value) => (
                <div className="flex items-center gap-1">
                    <Percent className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono">{value?.toFixed(2)}%</span>
                </div>
            )
        }),
        createColumn({
            key: 'monthly_payment',
            label: 'Monthly Payment',
            sortable: true,
            render: (value) => (
                <span className="font-mono">
                    ${value?.toLocaleString() || '0.00'}
                </span>
            )
        }),
        createColumn({
            key: 'next_payment_date',
            label: 'Next Payment',
            render: (value) => {
                if (!value) return <span className="text-muted-foreground">No schedule</span>;
                
                const paymentDate = parseISO(value);
                const today = new Date();
                const daysUntil = differenceInDays(paymentDate, today);
                
                return (
                    <div className="text-sm">
                        <span>{format(paymentDate, 'MMM dd, yyyy')}</span>
                        <p className={cn(
                            "text-xs",
                            daysUntil < 0 ? "text-red-500" :
                            daysUntil <= 3 ? "text-amber-500" :
                            "text-muted-foreground"
                        )}>
                            {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` :
                             daysUntil === 0 ? 'Due today' :
                             `in ${daysUntil} days`}
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
            {/* Creditor Filter */}
            <div className="space-y-2">
                <Label>Creditor</Label>
                <Select 
                    value={filters.creditor || 'all'} 
                    onValueChange={(value) => handleFiltersChange({ creditor: value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="All Creditors" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Creditors</SelectItem>
                        {creditorStats.map((creditor) => (
                            <SelectItem key={creditor.id} value={creditor.id.toString()}>
                                {creditor.name}
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
                        <SelectItem value="paid_off">Paid Off</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="defaulted">Defaulted</SelectItem>
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
            title="Debt Analytics"
            description="Monitor debt management, payment schedules, and reduction progress across your platform"
            icon={CreditCard}
            breadcrumbs={[
                { label: "Debts", icon: CreditCard }
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
                dataPoints: debtStats.length,
                timeRange: filters.period ? `Last ${filters.period} days` : 'All time'
            }}
        >
            <Head title="Debt Analytics - Admin" />

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
                {/* Debt Overview Chart */}
                <ChartContainer
                    title="Debt Overview by Creditor"
                    description="Total debt vs remaining debt by creditor"
                    chartType="bar"
                    loading={loading}
                    exportable={true}
                    onExport={(format) => handleExport(format, { chart: 'debt_overview' })}
                    metadata={{
                        dataPoints: debtOverviewData.length
                    }}
                >
                    <RechartsChartContainer config={chartConfig} className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={debtOverviewData}>
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
                                <YAxis yAxisId="rate" orientation="right" />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Bar yAxisId="amount" dataKey="total_debt" fill="var(--color-total_debt)" name="Total Debt" opacity={0.7} />
                                <Bar yAxisId="amount" dataKey="remaining_debt" fill="var(--color-remaining_debt)" name="Remaining" />
                                <Line yAxisId="rate" type="monotone" dataKey="interest_rate" stroke="var(--color-interest_rate)" name="Interest Rate %" strokeWidth={2} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </RechartsChartContainer>
                </ChartContainer>

                {/* Creditor Distribution */}
                <ChartContainer
                    title="Debt Distribution by Creditor"
                    description="Distribution of total debt across creditors"
                    chartType="pie"
                    loading={loading}
                    exportable={true}
                    onExport={(format) => handleExport(format, { chart: 'creditor_distribution' })}
                    metadata={{
                        dataPoints: creditorDistributionData.length
                    }}
                >
                    <RechartsChartContainer config={chartConfig} className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={creditorDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {creditorDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </RechartsChartContainer>
                </ChartContainer>
            </AnalyticsLayout.Grid>

            {/* Payoff Projections */}
            <ChartContainer
                title="Debt Payoff Projections"
                description="Projected debt reduction timeline and interest payments"
                chartType="area"
                loading={loading}
                exportable={true}
                onExport={(format) => handleExport(format, { chart: 'payoff_projections' })}
                metadata={{
                    dataPoints: payoffTrendsData.length
                }}
            >
                <RechartsChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={payoffTrendsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Area 
                                type="monotone" 
                                dataKey="projected_balance" 
                                stackId="1"
                                stroke="var(--color-remaining_debt)" 
                                fill="var(--color-remaining_debt)"
                                fillOpacity={0.6}
                                name="Projected Balance"
                            />
                            <Area 
                                type="monotone" 
                                dataKey="interest_paid" 
                                stackId="2"
                                stroke="var(--color-interest_rate)" 
                                fill="var(--color-interest_rate)"
                                fillOpacity={0.4}
                                name="Interest Paid"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </RechartsChartContainer>
            </ChartContainer>

            {/* Debt Insights */}
            <AnalyticsLayout.Grid columns="3">
                {/* Highest Interest Debts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Highest Interest Debts
                        </CardTitle>
                        <CardDescription>
                            Debts with highest interest rates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {debtStats.sort((a, b) => b.interest_rate - a.interest_rate).slice(0, 5).map((debt, index) => (
                                <div key={debt.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{debt.creditor_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                ${debt.remaining_debt?.toLocaleString()} remaining
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                            <Percent className="h-3 w-3 mr-1" />
                                            {debt.interest_rate?.toFixed(2)}%
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Schedule Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-amber-500" />
                            Upcoming Payments
                        </CardTitle>
                        <CardDescription>
                            Payments due soon
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {paymentSchedules.filter(p => p.next_payment_date).slice(0, 5).map((payment, index) => {
                                const paymentDate = parseISO(payment.next_payment_date);
                                const daysUntil = differenceInDays(paymentDate, new Date());
                                
                                return (
                                    <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                                daysUntil <= 0 ? "bg-red-100 text-red-600" :
                                                daysUntil <= 3 ? "bg-amber-100 text-amber-600" :
                                                "bg-blue-100 text-blue-600"
                                            )}>
                                                <Clock className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{payment.creditor_name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    ${payment.payment_amount?.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">
                                                {format(paymentDate, 'MMM dd')}
                                            </p>
                                            <Badge 
                                                variant={
                                                    daysUntil <= 0 ? "destructive" :
                                                    daysUntil <= 3 ? "secondary" : "outline"
                                                }
                                                className="text-xs"
                                            >
                                                {daysUntil <= 0 ? 'Overdue' :
                                                 daysUntil <= 3 ? 'Due Soon' : `${daysUntil} days`}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Debt Reduction Progress */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingDown className="h-5 w-5 text-green-500" />
                            Best Progress
                        </CardTitle>
                        <CardDescription>
                            Debts with best reduction progress
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {debtStats.map(debt => ({
                                ...debt,
                                progress: ((debt.total_debt - debt.remaining_debt) / debt.total_debt) * 100
                            })).sort((a, b) => b.progress - a.progress).slice(0, 5).map((debt, index) => (
                                <div key={debt.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{debt.creditor_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                ${debt.remaining_debt?.toLocaleString()} of ${debt.total_debt?.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            <TrendingDown className="h-3 w-3 mr-1" />
                                            {debt.progress?.toFixed(1)}%
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </AnalyticsLayout.Grid>

            {/* Detailed Debts Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Detailed Debt Analysis
                    </CardTitle>
                    <CardDescription>
                        Comprehensive view of all debt accounts and payment schedules
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={debtStats}
                        columns={tableColumns}
                        loading={loading}
                        searchPlaceholder="Search debts..."
                        className="mt-4"
                    />
                </CardContent>
            </Card>
        </AnalyticsLayout>
    );
}