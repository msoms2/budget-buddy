import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  Sector,
  Label 
} from 'recharts';
import { 
  CreditCardIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  ActivityIcon,
  DollarSignIcon,
  ArrowUpRightIcon,
  PieChartIcon,
  BarChart3Icon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency.jsx';

export default function PaymentMethodAnalysis({ paymentMethodStats = [], dateRange = 'month' }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedMethod, setSelectedMethod] = useState('');
    const { formatCurrency } = useCurrency();

    const formatPercentage = (value) => {
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    };

    // Filter out stats with null method before processing
    const validStats = paymentMethodStats.filter(stat => stat && stat.method);

    // Calculate total amount for percentage calculations
    const totalAmount = validStats.reduce((sum, stat) => sum + stat.total, 0);

    // Prepare data for distribution chart
    const distributionData = validStats.map((stat, index) => ({
        name: stat.method?.name || 'Unknown',
        amount: stat.total,
        count: stat.count,
        average: stat.total / (stat.count || 1),
        color: stat.method?.icon_color || '#3b82f6',
        percentage: totalAmount > 0 ? (stat.total / totalAmount) * 100 : 0,
        id: stat.method?.id || index
    })).sort((a, b) => b.amount - a.amount);

    // Get the top payment method for highlighting
    const topMethod = distributionData[0];

    // Chart colors
    const COLORS = [
        "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", 
        "#82CA9D", "#FFC658", "#FF7C7C", "#8DD1E1", "#D084D0"
    ];

    // If no valid data, show empty state
    if (validStats.length === 0) {
        return (
            <div className="flex flex-1 flex-col gap-4">
                {/* Empty State */}
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="h-5 w-5" />
                            No Payment Method Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-12">
                            <CreditCardIcon className="h-16 w-16 text-muted-foreground mb-4" />
                            <p className="text-center text-lg font-medium text-muted-foreground mb-2">
                                No payment method data available
                            </p>
                            <p className="text-center text-sm text-muted-foreground mb-6">
                                Start recording transactions with payment methods to see analytics here
                            </p>
                            <Button asChild>
                                <a href="/transactions">
                                    <DollarSignIcon className="h-4 w-4 mr-2" />
                                    Add Transactions
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border dark:border-gray-700">
                    <p className="font-medium text-sm">{data.name}</p>
                    <div className="mt-2 space-y-1">
                        <p className="text-sm">
                            <span className="text-muted-foreground">Amount:</span> 
                            <span className="font-semibold ml-2">{formatCurrency(data.amount)}</span>
                        </p>
                        <p className="text-sm">
                            <span className="text-muted-foreground">Transactions:</span> 
                            <span className="font-semibold ml-2">{data.count}</span>
                        </p>
                        <p className="text-sm">
                            <span className="text-muted-foreground">Average:</span> 
                            <span className="font-semibold ml-2">{formatCurrency(data.average)}</span>
                        </p>
                        <p className="text-sm">
                            <span className="text-muted-foreground">Share:</span> 
                            <span className="font-semibold ml-2">{data.percentage.toFixed(1)}%</span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-1 flex-col gap-4">
            {/* Summary Cards */}
            <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                {/* Total Spending Card */}
                <Card className="bg-blue-50 dark:bg-blue-900/20">
                    <CardHeader className="relative">
                        <CardDescription>Total Spending</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">
                            {formatCurrency(totalAmount)}
                        </CardTitle>
                        <div className="absolute right-4 top-4">
                            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs text-blue-600 dark:text-blue-400">
                                <DollarSignIcon className="size-3" />
                                Total
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            <ActivityIcon className="h-4 w-4 text-blue-500" />
                            Across all payment methods
                        </div>
                    </CardFooter>
                </Card>

                {/* Most Used Method Card */}
                <Card className="bg-green-50 dark:bg-green-900/20">
                    <CardHeader className="relative">
                        <CardDescription>Most Used Method</CardDescription>
                        <CardTitle className="text-lg font-semibold text-foreground truncate">
                            {topMethod?.name || 'N/A'}
                        </CardTitle>
                        <div className="absolute right-4 top-4">
                            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs text-green-600 dark:text-green-400">
                                <TrendingUpIcon className="size-3" />
                                Top
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            <CreditCardIcon className="h-4 w-4 text-green-500" />
                            {topMethod ? `${formatCurrency(topMethod.amount)} (${topMethod.percentage.toFixed(1)}%)` : 'No data'}
                        </div>
                    </CardFooter>
                </Card>

                {/* Total Transactions Card */}
                <Card className="bg-purple-50 dark:bg-purple-900/20">
                    <CardHeader className="relative">
                        <CardDescription>Total Transactions</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">
                            {validStats.reduce((sum, stat) => sum + stat.count, 0).toLocaleString()}
                        </CardTitle>
                        <div className="absolute right-4 top-4">
                            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs text-purple-600 dark:text-purple-400">
                                <ActivityIcon className="size-3" />
                                Count
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            <BarChart3Icon className="h-4 w-4 text-purple-500" />
                            Financial activity
                        </div>
                    </CardFooter>
                </Card>

                {/* Payment Methods Count Card */}
                <Card className="bg-orange-50 dark:bg-orange-900/20">
                    <CardHeader className="relative">
                        <CardDescription>Active Methods</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">
                            {validStats.length}
                        </CardTitle>
                        <div className="absolute right-4 top-4">
                            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs text-orange-600 dark:text-orange-400">
                                <CreditCardIcon className="size-3" />
                                Methods
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            <PieChartIcon className="h-4 w-4 text-orange-500" />
                            Different payment types
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Distribution Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3Icon className="h-5 w-5" />
                            Payment Method Distribution
                        </CardTitle>
                        <CardDescription>
                            Spending breakdown by payment method
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={distributionData}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12 }}
                                        interval={0}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) => formatCurrency(value).replace(/\.00$/, '')}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="amount"
                                        fill="#3b82f6"
                                        radius={[8, 8, 0, 0]}
                                        onClick={(data) => setSelectedMethod(data.name)}
                                    >
                                        {distributionData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.color || COLORS[index % COLORS.length]}
                                                stroke={selectedMethod === entry.name ? '#1e40af' : 'transparent'}
                                                strokeWidth={2}
                                                cursor="pointer"
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="flex w-full items-start gap-2 text-sm">
                            <div className="grid gap-2">
                                <div className="flex items-center gap-2 font-medium leading-none">
                                    Distribution across {validStats.length} payment methods
                                    <TrendingUpIcon className="h-4 w-4" />
                                </div>
                                <div className="leading-none text-muted-foreground">
                                    Click on bars to highlight specific payment methods
                                </div>
                            </div>
                        </div>
                    </CardFooter>
                </Card>

                {/* Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="h-5 w-5" />
                            Usage Share
                        </CardTitle>
                        <CardDescription>
                            Percentage breakdown
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={distributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={120}
                                        paddingAngle={2}
                                        dataKey="amount"
                                        activeIndex={activeIndex}
                                        activeShape={({
                                            cx,
                                            cy,
                                            innerRadius,
                                            outerRadius = 0,
                                            startAngle,
                                            endAngle,
                                            fill,
                                        }) => (
                                            <g>
                                                <Sector
                                                    cx={cx}
                                                    cy={cy}
                                                    innerRadius={innerRadius}
                                                    outerRadius={outerRadius + 10}
                                                    startAngle={startAngle}
                                                    endAngle={endAngle}
                                                    fill={fill}
                                                />
                                            </g>
                                        )}
                                        onMouseEnter={(_, index) => setActiveIndex(index)}
                                    >
                                        {distributionData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={entry.color || COLORS[index % COLORS.length]}
                                                stroke="#ffffff"
                                                strokeWidth={2}
                                            />
                                        ))}
                                        <Label
                                            content={({ viewBox }) => {
                                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                    const activeData = distributionData[activeIndex];
                                                    return (
                                                        <text
                                                            x={viewBox.cx}
                                                            y={viewBox.cy}
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                        >
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={(viewBox.cy || 0) - 10}
                                                                className="fill-foreground text-sm font-bold"
                                                            >
                                                                {activeData?.name || 'No data'}
                                                            </tspan>
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={(viewBox.cy || 0) + 15}
                                                                className="fill-muted-foreground text-xs"
                                                            >
                                                                {activeData ? `${activeData.percentage.toFixed(1)}%` : ''}
                                                            </tspan>
                                                        </text>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Summary Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCardIcon className="h-5 w-5" />
                        Payment Method Summary
                    </CardTitle>
                    <CardDescription>
                        Detailed breakdown of spending by payment method
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableHead className="w-[30%]">Payment Method</TableHead>
                                <TableHead className="w-[20%]">Total Spent</TableHead>
                                <TableHead className="w-[15%]">Share</TableHead>
                                <TableHead className="w-[15%]">Transactions</TableHead>
                                <TableHead className="w-[20%]">Average</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {distributionData.map((stat, index) => (
                                <TableRow 
                                    key={stat.id} 
                                    className="hover:bg-muted/50 cursor-pointer"
                                    onClick={() => setSelectedMethod(stat.name)}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className="w-4 h-4 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: stat.color || COLORS[index % COLORS.length] }}
                                            />
                                            <span className="font-medium">{stat.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {formatCurrency(stat.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="tabular-nums">
                                            {stat.percentage.toFixed(1)}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="tabular-nums">
                                        {stat.count.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="font-medium tabular-nums">
                                        {formatCurrency(stat.average)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ActivityIcon className="h-4 w-4" />
                        Payment method usage overview
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <a href="/transactions" className="flex items-center gap-1">
                            <ArrowUpRightIcon className="h-3 w-3" />
                            View Transactions
                        </a>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
