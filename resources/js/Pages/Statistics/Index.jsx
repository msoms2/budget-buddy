import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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
    AreaChart,
    Area,
    Sector,
    Label,
    LabelList,
    Rectangle,
} from 'recharts';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUpIcon, TrendingDownIcon, PlusIcon, ArrowUpRightIcon, CalendarIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, subDays, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from "date-fns";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { useCurrency } from '@/hooks/useCurrency.jsx';

export default function Index({
    auth,
    earnings,
    expenses,
    earningCategories,
    expenseCategories,
    totalEarnings,
    totalExpenses,
    paymentMethodStats,
    monthlyTrends,
    weeklyTrends,
    categoryTrends,
    periodComparison,
    incomeAnalysis,
    dateRange = 'month',
    periodType = 'last'
}) {
    const [activeTab, setActiveTab] = useState('earnings');
    const [filter, setFilter] = useState('all');
    const [trendView, setTrendView] = useState('line'); // 'line' or 'area'
    const [activeCategory, setActiveCategory] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');  // Add this line
    const [timeRange, setTimeRange] = useState('90d'); // Add timeRange state
    
    // Track selected time period and period type
    const [selectedTimePeriod, setSelectedTimePeriod] = useState(dateRange);
    const [selectedPeriodType, setSelectedPeriodType] = useState(periodType);
    
    // Date range state
    const [dates, setDates] = useState({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default to last 30 days
        to: new Date()
    });
    
    // Effect to handle initial date ranges based on dateRange and periodType props
    useEffect(() => {
        const now = new Date();
        let from, to;
        
        // Update selected time period and type with props
        setSelectedTimePeriod(dateRange);
        setSelectedPeriodType(periodType);
        
        switch (dateRange) {
            case 'week':
                from = subDays(now, 7);
                to = now;
                break;
            case 'current_week':
                from = startOfWeek(now);
                to = endOfWeek(now);
                break;
            case 'month':
                from = subMonths(now, 1);
                to = now;
                break;
            case 'current_month':
                from = startOfMonth(now);
                to = endOfMonth(now);
                break;
            case 'year':
                from = subMonths(now, 12);
                to = now;
                break;
            case 'current_year':
                from = startOfYear(now);
                to = endOfYear(now);
                break;
            case 'all':
                from = new Date(0); // Beginning of time
                to = now;
                break;
            default:
                from = subMonths(now, 1);
                to = now;
        }
        
        setDates({ from, to });
    }, [dateRange, periodType]);
    
    // Date range presets
    const dateRangePresets = [
        {
            name: 'Last 7 days',
            dates: {
                from: subDays(new Date(), 7),
                to: new Date(),
            },
        },
        {
            name: 'Last 30 days',
            dates: {
                from: subDays(new Date(), 30),
                to: new Date(),
            },
        },
        {
            name: 'This month',
            dates: {
                from: startOfMonth(new Date()),
                to: new Date(),
            },
        },
        {
            name: 'Last month',
            dates: {
                from: startOfMonth(subMonths(new Date(), 1)),
                to: endOfMonth(subMonths(new Date(), 1)),
            },
        },
        {
            name: 'This year',
            dates: {
                from: startOfYear(new Date()),
                to: new Date(),
            },
        },
        {
            name: 'All time',
            dates: {
                from: new Date(0),
                to: new Date(),
            },
        },
    ];
    
    // Handle date range change
    const handleDateChange = (newDates) => {
        if (!newDates.from || !newDates.to) return;
        
        setDates(newDates);
        
        // Format dates for backend
        const formattedFrom = format(newDates.from, 'yyyy-MM-dd');
        const formattedTo = format(newDates.to, 'yyyy-MM-dd');
        
        router.visit(route('statistics.index'), {
            data: { 
                dateRange: 'custom',
                dateFrom: formattedFrom,
                dateTo: formattedTo
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Current data based on active tab
    const currentData = activeTab === 'earnings' ? earnings : 
                        activeTab === 'expenses' ? expenses : 
                        [...earnings, ...expenses];
    const currentCategories = activeTab === 'earnings' ? earningCategories : 
                             activeTab === 'expenses' ? expenseCategories : 
                             [...earningCategories.map(cat => ({...cat, key: `income-${cat.id}`})), 
                              ...expenseCategories.map(cat => ({...cat, key: `expense-${cat.id}`}))];
    const totalAmount = activeTab === 'earnings' ? totalEarnings : 
                       activeTab === 'expenses' ? totalExpenses : 
                       (totalEarnings + totalExpenses);
    const currentCategoryTrends = activeTab === 'earnings' ? categoryTrends.earnings : 
                                 activeTab === 'expenses' ? categoryTrends.expenses :
                                 [...categoryTrends.earnings, ...categoryTrends.expenses];

    // Format percentage
    const formatPercentage = (value) => {
        return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    };

    // Format data for chart
    const chartData = currentCategories.map(category => {
        const filteredItems = currentData.filter(item => item.category_id === category.id);
        const totalAmount = filteredItems.reduce((sum, item) => sum + parseFloat(item.amount), 0);
        
        return {
            name: category.name,
            amount: totalAmount,
            icon: category.icon || '💰',
            color: category.icon_color || '#3b82f6'
        };
    });

    // Add state for pagination
    const [categoryStartIndex, setCategoryStartIndex] = useState(0);
    
    // Get visible chart data (limit to 10 items)
    const visibleChartData = useMemo(() => {
        return chartData.slice(categoryStartIndex, categoryStartIndex + 10);
    }, [chartData, categoryStartIndex]);
    
    // Handle category navigation
    const handleCategoryNavigation = (direction) => {
        if (direction === 'next') {
            setCategoryStartIndex(prev => Math.min(prev + 2, chartData.length - 10));
        } else if (direction === 'prev') {
            setCategoryStartIndex(prev => Math.max(prev - 2, 0));
        }
    };

    // Calculate the active index for the pie chart based on the selected category
    const activeIndex = useMemo(() => {
        if (!activeCategory || !chartData.length) return 0;
        const index = chartData.findIndex(item => item.name === activeCategory);
        return index >= 0 ? index : 0;
    }, [activeCategory, chartData]);
    
    // Filter items based on selected category filter only
    const filteredItems = currentData.filter(item => {
        if (filter !== 'all' && item.category_id !== parseInt(filter)) return false;
        return true;
    });

    // Period comparison display data
    const currentPeriod = periodComparison.current_period;
    const previousPeriod = periodComparison.previous_period;
    const changes = periodComparison.changes;

    // Chart colors
    const chartColors = {
        income: "#10b981",
        expense: "#ef4444",
        net: "#6366f1"
    };

    // Process weekly trends data for chart display while preserving monthly labels
    const processWeeklyDataForChart = () => {
        if (!weeklyTrends || weeklyTrends.length === 0) {
            return monthlyTrends; // Fallback to monthly data if weekly isn't available
        }

        // Return weekly data with proper formatting for display
        return weeklyTrends.map(week => ({
            ...week,
            // Ensure week information is preserved
            originalLabel: week.week,
            // This will be used to determine which ticks to show in the XAxis
            tickValue: week.month
        }));
    };

    const { formatCurrency } = useCurrency();

    return (
        <SidebarProvider>
            <Head title="Financial Statistics" />
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4 justify-between">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                            <Breadcrumb>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Financial Statistics</BreadcrumbPage>
                                </BreadcrumbItem>
                            </Breadcrumb>
                        </div>
                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-md p-1">
                            <button
                                onClick={() => setActiveTab('earnings')}
                                className={`px-4 py-1 rounded-md transition-colors ${
                                    activeTab === 'earnings'
                                        ? 'bg-white dark:bg-gray-700'
                                        : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                Income
                            </button>
                            <button
                                onClick={() => setActiveTab('expenses')}
                                className={`px-4 py-1 rounded-md transition-colors ${
                                    activeTab === 'expenses'
                                        ? 'bg-white dark:bg-gray-700'
                                        : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                Expenses
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {/* Date Range Selector */}
                    <div className="flex justify-end items-center mb-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-[260px] justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedTimePeriod === 'all' ? (
                                        "All Time"
                                    ) : dates?.from ? (
                                        dates.to ? (
                                            <>
                                                {format(dates.from, "MMM dd, yyyy")} -{" "}
                                                {format(dates.to, "MMM dd, yyyy")}
                                            </>
                                        ) : (
                                            format(dates.from, "MMM dd, yyyy")
                                        )
                                    ) : (
                                        <span>Select date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <div className="flex flex-col">
                                    {/* Calendar */}
                                    <div className="flex flex-col p-4 sm:flex-row space-x-0 sm:space-x-4">
                                        <div className="mb-4 sm:mb-0">
                                            <p className="mb-2 text-sm font-medium">Start Date</p>
                                            <Calendar
                                                initialFocus
                                                mode="single"
                                                selected={dates?.from}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        // Ensure we don't select a start date after the end date
                                                        const newEnd = dates?.to && date > dates.to ? date : dates?.to;
                                                        setDates({
                                                            from: date,
                                                            to: newEnd || date
                                                        });
                                                    }
                                                }}
                                                disabled={(date) => 
                                                    // Can't select dates in the future
                                                    date > new Date()
                                                }
                                            />
                                        </div>
                                        <div>
                                            <p className="mb-2 text-sm font-medium">End Date</p>
                                            <Calendar
                                                initialFocus
                                                mode="single"
                                                selected={dates?.to}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        setDates({
                                                            from: dates?.from || date,
                                                            to: date
                                                        });

                                                        // Apply the date selection if both dates are selected
                                                        if (dates?.from) {
                                                            handleDateChange({
                                                                from: dates.from,
                                                                to: date
                                                            });
                                                        }
                                                    }
                                                }}
                                                disabled={(date) => 
                                                    // Can't select dates before the start date or in the future
                                                    (dates?.from && date < dates.from) || date > new Date()
                                                }
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Time Period Options */}
                                    <div className="grid grid-cols-2 gap-2 p-3 border-t border-border">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between">
                                                <Button 
                                                    variant={(selectedTimePeriod === 'week' || selectedTimePeriod === 'current_week') ? "default" : "outline"} 
                                                    size="sm" 
                                                    className="w-full"
                                                    onClick={() => {
                                                        setSelectedTimePeriod('week');
                                                        setSelectedPeriodType('last');
                                                        handleDateChange({
                                                            from: subDays(new Date(), 7),
                                                            to: new Date()
                                                        });
                                                        
                                                        router.visit(route('statistics.index'), {
                                                            data: { 
                                                                dateRange: 'week',
                                                                periodType: 'last'
                                                            },
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        });
                                                    }}
                                                >
                                                    Week
                                                </Button>
                                                
                                                <Button 
                                                    variant={(selectedTimePeriod === 'month' || selectedTimePeriod === 'current_month') ? "default" : "outline"} 
                                                    size="sm" 
                                                    className="w-full"
                                                    onClick={() => {
                                                        setSelectedTimePeriod('month');
                                                        setSelectedPeriodType('last');
                                                        handleDateChange({
                                                            from: subDays(new Date(), 30),
                                                            to: new Date()
                                                        });
                                                        
                                                        router.visit(route('statistics.index'), {
                                                            data: { 
                                                                dateRange: 'month',
                                                                periodType: 'last'
                                                            },
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        });
                                                    }}
                                                >
                                                    Month
                                                </Button>
                                            </div>
                                            <div className="flex justify-between">
                                                <Button 
                                                    variant={(selectedTimePeriod === 'year' || selectedTimePeriod === 'current_year') ? "default" : "outline"} 
                                                    size="sm" 
                                                    className="w-full"
                                                    onClick={() => {
                                                        setSelectedTimePeriod('year');
                                                        setSelectedPeriodType('last');
                                                        handleDateChange({
                                                            from: subMonths(new Date(), 12),
                                                            to: new Date()
                                                        });
                                                        
                                                        router.visit(route('statistics.index'), {
                                                            data: { 
                                                                dateRange: 'year',
                                                                periodType: 'last'
                                                            },
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        });
                                                    }}
                                                >
                                                    Year
                                                </Button>
                                                
                                                <Button 
                                                    variant={(selectedTimePeriod === 'all') ? "default" : "outline"} 
                                                    size="sm" 
                                                    className="w-full"
                                                    onClick={() => {
                                                        setSelectedTimePeriod('all');
                                                        setSelectedPeriodType('last');
                                                        
                                                        // Let the server handle finding the earliest record date
                                                        router.visit(route('statistics.index'), {
                                                            data: { 
                                                                dateRange: 'all',
                                                                periodType: 'last'
                                                            },
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        });
                                                    }}
                                                >
                                                    All
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-between gap-1">
                                            <div className="flex justify-between">
                                                <Button 
                                                    variant={selectedPeriodType === 'current' ? "default" : "outline"} 
                                                    size="sm" 
                                                    className={`w-full ${selectedPeriodType === 'current' ? 'bg-primary hover:bg-primary/90' : ''}`}
                                                    onClick={() => {
                                                        setSelectedPeriodType('current');
                                                        let newDateRange;
                                                        let from, to;
                                                        
                                                        switch(selectedTimePeriod) {
                                                            case 'week':
                                                            case 'current_week':
                                                                newDateRange = 'current_week';
                                                                from = startOfWeek(new Date());
                                                                to = endOfWeek(new Date());
                                                                break;
                                                            case 'month':
                                                            case 'current_month':
                                                            default:
                                                                newDateRange = 'current_month';
                                                                from = startOfMonth(new Date());
                                                                to = endOfMonth(new Date());
                                                                break;
                                                            case 'year':
                                                            case 'current_year':
                                                                newDateRange = 'current_year';
                                                                from = startOfYear(new Date());
                                                                to = endOfYear(new Date());
                                                                break;
                                                            case 'all':
                                                                newDateRange = 'all';
                                                                from = new Date(0);
                                                                to = new Date();
                                                                break;
                                                        }
                                                        
                                                        handleDateChange({
                                                            from: from,
                                                            to: to
                                                        });
                                                        
                                                        router.visit(route('statistics.index'), {
                                                            data: { 
                                                                dateRange: newDateRange,
                                                                periodType: 'current'
                                                            },
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        });
                                                    }}
                                                >
                                                    Current
                                                </Button>
                                                
                                                <Button 
                                                    variant={selectedPeriodType === 'last' ? "default" : "outline"} 
                                                    size="sm" 
                                                    className={`w-full ${selectedPeriodType === 'last' ? 'bg-primary hover:bg-primary/90' : ''}`}
                                                    onClick={() => {
                                                        setSelectedPeriodType('last');
                                                        let from, to;
                                                        let actualTimePeriod = selectedTimePeriod;
                                                        
                                                        // Convert current_* periods to their base period type
                                                        if (selectedTimePeriod === 'current_week') actualTimePeriod = 'week';
                                                        else if (selectedTimePeriod === 'current_month') actualTimePeriod = 'month';
                                                        else if (selectedTimePeriod === 'current_year') actualTimePeriod = 'year';
                                                        
                                                        switch(actualTimePeriod) {
                                                            case 'week':
                                                                from = subDays(new Date(), 7);
                                                                to = new Date();
                                                                break;
                                                            case 'month':
                                                            default:
                                                                from = startOfMonth(subMonths(new Date(), 1));
                                                                to = endOfMonth(subMonths(new Date(), 1));
                                                                break;
                                                            case 'year':
                                                                from = subMonths(new Date(), 12);
                                                                to = new Date();
                                                                break;
                                                            case 'all':
                                                                from = new Date(0);
                                                                to = new Date();
                                                                break;
                                                        }
                                                        
                                                        handleDateChange({
                                                            from: from,
                                                            to: to
                                                        });
                                                        
                                                        router.visit(route('statistics.index'), {
                                                            data: { 
                                                                dateRange: actualTimePeriod,
                                                                periodType: 'last'
                                                            },
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        });
                                                    }}
                                                >
                                                    Last
                                                </Button>
                                            </div>
                                            <Button 
                                                variant="secondary" 
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedTimePeriod('month');
                                                    setSelectedPeriodType('last');
                                                    handleDateChange({
                                                        from: subDays(new Date(), 30),
                                                        to: new Date()
                                                    });
                                                    
                                                    router.visit(route('statistics.index'), {
                                                        data: { 
                                                            dateRange: 'month',
                                                            periodType: 'last'
                                                        },
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                    });
                                                }}
                                            >
                                                Reset
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                        {/* Current Period Card */}
                        <Card className={`${
                            activeTab === 'earnings' 
                                ? 'bg-green-50 dark:bg-green-900/20' 
                                : 'bg-red-50 dark:bg-red-900/20'
                        }`}>
                            <CardHeader className="relative">
                                <CardDescription>
                                    {(() => {
                                        // Create a dynamic period label based on the selected period type and period name
                                        const periodLabel = selectedPeriodType === 'current' ? 'Current' : 'Last';
                                        let timeframeLabel = '';
                                        
                                        // Calculate the difference in days for custom periods
                                        const isCustomPeriod = periodComparison.period_name === 'custom';
                                        let daysDifference = 0;
                                        
                                        if (isCustomPeriod && dates.from && dates.to) {
                                            const diffTime = Math.abs(dates.to - dates.from);
                                            daysDifference = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                        }
                                        
                                        switch(periodComparison.period_name) {
                                            case 'week':
                                            case 'current_week':
                                                timeframeLabel = 'Week';
                                                break;
                                            case 'month':
                                            case 'current_month':
                                                timeframeLabel = 'Month';
                                                break;
                                            case 'year':
                                            case 'current_year':
                                                timeframeLabel = 'Year';
                                                break;
                                            case 'all':
                                                timeframeLabel = 'All Time';
                                                break;
                                            case 'custom':
                                                // If it's exactly 7 days, call it a week
                                                if (daysDifference === 6 || daysDifference === 7) {
                                                    timeframeLabel = 'Week';
                                                } 
                                                // If it's between 28-31 days, call it a month
                                                else if (daysDifference >= 28 && daysDifference <= 31) {
                                                    timeframeLabel = 'Month';
                                                }
                                                // If it's between 364-366 days, call it a year
                                                else if (daysDifference >= 364 && daysDifference <= 366) {
                                                    timeframeLabel = 'Year';
                                                }
                                                else {
                                                    timeframeLabel = 'Custom Period';
                                                }
                                                break;
                                            default:
                                                timeframeLabel = 'Period';
                                        }
                                        
                                        // Special case for 'All Time'
                                        if (timeframeLabel === 'All Time') {
                                            return `${timeframeLabel} ${activeTab === 'earnings' ? 'Income' : 'Expenses'}`;
                                        }
                                        
                                        return `${periodLabel} ${timeframeLabel} ${activeTab === 'earnings' ? 'Income' : 'Expenses'}`;
                                    })()}
                                </CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums">
                                    {formatCurrency(activeTab === 'earnings' ? periodComparison.current_period.earnings : periodComparison.current_period.expenses)}
                                </CardTitle>
                                <div className="absolute right-4 top-4">
                                    <Badge variant="outline" className={`flex gap-1 rounded-lg text-xs ${
                                        activeTab === 'earnings'
                                            ? changes.earnings >= 0 ? 'text-green-600' : 'text-red-600'
                                            : changes.expenses <= 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {activeTab === 'earnings'
                                            ? formatPercentage(changes.earnings)
                                            : formatPercentage(changes.expenses)
                                        }
                                        {(activeTab === 'earnings' 
                                            ? changes.earnings 
                                            : changes.expenses) >= 0
                                            ? <TrendingUpIcon className="size-3" />
                                            : <TrendingDownIcon className="size-3" />
                                        }
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardFooter className="text-sm text-muted-foreground">
                                {(() => {
                                    // Determine the previous period text based on the current timeframe label
                                    const getPreviousPeriodText = () => {
                                        // Calculate the difference in days for custom periods
                                        const isCustomPeriod = periodComparison.period_name === 'custom';
                                        let daysDifference = 0;
                                        
                                        if (isCustomPeriod && dates.from && dates.to) {
                                            const diffTime = Math.abs(dates.to - dates.from);
                                            daysDifference = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                        }
                                        
                                        // Determine the appropriate label for the previous period
                                        switch(periodComparison.period_name) {
                                            case 'week':
                                            case 'current_week':
                                                return 'vs. Previous Week: ';
                                            case 'month':
                                            case 'current_month':
                                                return 'vs. Previous Month: ';
                                            case 'year':
                                            case 'current_year':
                                                return 'vs. Previous Year: ';
                                            case 'custom':
                                                // If it's approximately a week, month, or year, use that term
                                                if (daysDifference === 6 || daysDifference === 7) {
                                                    return 'vs. Previous Week: ';
                                                } else if (daysDifference >= 28 && daysDifference <= 31) {
                                                    return 'vs. Previous Month: ';
                                                } else if (daysDifference >= 364 && daysDifference <= 366) {
                                                    return 'vs. Previous Year: ';
                                                } else {
                                                    return 'vs. Previous Period: '; // Default for truly custom periods
                                                }
                                            case 'all':
                                                return ''; // No comparison for "All Time"
                                            default:
                                                return 'vs. Previous Period: ';
                                        }
                                    };
                                    
                                    return (
                                        <>
                                            {getPreviousPeriodText()}
                                            {periodComparison.period_name !== 'all' && 
                                                formatCurrency(activeTab === 'earnings' 
                                                    ? periodComparison.previous_period.earnings 
                                                    : periodComparison.previous_period.expenses)}
                                            {periodComparison.period_name === 'all' && 'No previous period available'}
                                        </>
                                    );
                                })()}
                            </CardFooter>
                        </Card>

                        {/* Other Summary Cards */}
                        <Card>
                            <CardHeader>
                                <CardDescription>Number of Entries</CardDescription>
                                <CardTitle className="text-2xl font-semibold">
                                    {currentData.length}
                                </CardTitle>
                            </CardHeader>
                            <CardFooter className="text-sm text-muted-foreground">
                                Total {activeTab === 'earnings' ? 'income' : 'expense'} records
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardDescription>Categories</CardDescription>
                                <CardTitle className="text-2xl font-semibold">
                                    {currentCategories.length}
                                </CardTitle>
                            </CardHeader>
                            <CardFooter>
                                <Link 
                                    href={route('categories.index')}
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                                >
                                    Manage categories
                                    <ArrowUpRightIcon className="ml-1 size-3" />
                                </Link>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardDescription>Average {activeTab === 'earnings' ? 'Earning' : 'Expense'}</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums">
                                    {formatCurrency(currentData.length > 0 ? (totalAmount / currentData.length) : 0)}
                                </CardTitle>
                            </CardHeader>
                            <CardFooter className="text-sm text-muted-foreground">
                                Per transaction average
                            </CardFooter>
                        </Card>
                    </div>

                  {/* Charts */}
                  {chartData.length > 0 && (
                      <Card>
                          <CardHeader>
                              <div className="flex justify-between items-start">
                                  <div>
                                      <CardTitle>{activeTab === 'earnings' ? 'Income' : 'Expenses'} Analysis</CardTitle>
                                      <CardDescription>Distribution and breakdown by category</CardDescription>
                                  </div>
                              </div>
                          </CardHeader>
                          <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                  {/* Bar Chart Column */}
                                  <div className="md:col-span-9">
                                      <ChartContainer
                                          id="bar-chart"
                                          className="w-full h-[400px]"
                                          config={{
                                              visitors: {
                                                  label: "Amount",
                                              },
                                              ...chartData.reduce((acc, item) => ({
                                                  ...acc,
                                                  [item.name]: {
                                                      label: item.name,
                                                      color: item.color,
                                                  }
                                              }), {})
                                          }}
                                      >
                                          <BarChart 
                                              accessibilityLayer 
                                              data={visibleChartData.map(item => ({
                                                  browser: item.name,
                                                  visitors: item.amount,
                                                  fill: item.color,
                                                  name: item.name
                                              }))}
                                              margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
                                          >
                                              <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                              <XAxis
                                                  dataKey="browser"
                                                  tickLine={false}
                                                  axisLine={false}
                                                  height={50}
                                                  tickMargin={12}
                                                  tick={props => {
                                                      const { x, y, payload } = props;
                                                      const words = payload.value.split(' ');
                                                      
                                                      // For single word, just render it normally
                                                      if (words.length === 1) {
                                                          return (
                                                              <g transform={`translate(${x},${y})`}>
                                                                  <text
                                                                      x={0}
                                                                      y={0}
                                                                      dy={16}
                                                                      textAnchor="middle"
                                                                      fill="#666"
                                                                      fontSize={12}
                                                                  >
                                                                      {payload.value}
                                                                  </text>
                                                              </g>
                                                          );
                                                      }
                                                      
                                                      // For multi-word, split into multiple lines
                                                      return (
                                                          <g transform={`translate(${x},${y})`}>
                                                              {words.map((word, index) => (
                                                                  <text
                                                                      key={index}
                                                                      x={0}
                                                                      y={0}
                                                                      dy={16 + index * 16}
                                                                      textAnchor="middle"
                                                                      fill="#666"
                                                                      fontSize={12}
                                                                  >
                                                                      {word}
                                                                  </text>
                                                              ))}
                                                          </g>
                                                      );
                                                  }}
                                              />
                                              <YAxis
                                                  tickFormatter={(value) => formatCurrency(value).replace(/\.00$/, "")}
                                                  tickLine={false}
                                                  axisLine={false}
                                              />
                                              <ChartTooltip
                                                  cursor={false}
                                                  content={
                                                      <ChartTooltipContent 
                                                          formatter={(value) => formatCurrency(value)}
                                                      />
                                                  }
                                              />
                                              <Bar
                                                  dataKey="visitors"
                                                  onClick={(data) => setActiveCategory(data.name)}
                                                  strokeWidth={2}
                                                  stroke="#0369a1" // Add border/stroke to the bars
                                                  radius={8}
                                              >
                                                  {/* Add coloring for each bar based on whether it's active or not */}
                                                  {visibleChartData.map((entry, index) => (
                                                      <Cell 
                                                          key={`cell-${index}`} 
                                                          fill={entry.name === activeCategory 
                                                              ? (activeTab === 'earnings' ? '#109db9' : '#008b8b') // Highlight color when selected
                                                              : (activeTab === 'earnings' ? '#10b981' : '#ef4444') // Default colors
                                                          }
                                                          cursor="pointer"
                                                          stroke={entry.name === activeCategory 
                                                              ? (activeTab === 'earnings' ? '#0c4a6e' : '#9f1239') // Darker outline for selected bar
                                                              : '#0369a1'} // Default outline
                                                          strokeWidth={2} // Make outline clearly visible
                                                      />
                                                  ))}
                                              </Bar>
                                          </BarChart>
                                      </ChartContainer>
                                      
                                      {/* Pagination Display and Navigation */}
                                      {chartData.length > 10 && (
                                          <div className="flex justify-center items-center mt-4 text-sm gap-4">
                                              <span>Showing {categoryStartIndex + 1}-{Math.min(categoryStartIndex + 10, chartData.length)} of {chartData.length} categories</span>
                                              <div className="flex gap-2">
                                                  <Button 
                                                      variant="outline" 
                                                      size="icon" 
                                                      className="rounded-full h-8 w-8"
                                                      onClick={() => handleCategoryNavigation('prev')}
                                                      disabled={categoryStartIndex === 0}
                                                  >
                                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                          <path d="m15 18-6-6 6-6"/>
                                                      </svg>
                                                      <span className="sr-only">Previous</span>
                                                  </Button>
                                                  <Button 
                                                      variant="outline" 
                                                      size="icon" 
                                                      className="rounded-full h-8 w-8"
                                                      onClick={() => handleCategoryNavigation('next')}
                                                      disabled={categoryStartIndex >= chartData.length - 10}
                                                  >
                                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                          <path d="m9 18 6-6-6-6"/>
                                                      </svg>
                                                      <span className="sr-only">Next</span>
                                                  </Button>
                                              </div>
                                          </div>
                                      )}
                                  </div>

                                  {/* Pie Chart Column */}
                                  <div className="md:col-span-3">
                                      <ChartContainer
                                          id="pie-chart"
                                          className="h-[400px] w-full flex items-center justify-center"
                                          config={{
                                              [activeTab]: {
                                                  label: activeTab === 'earnings' ? 'Income' : 'Expenses',
                                                  color: activeTab === 'earnings' ? chartColors.income : chartColors.expense
                                              }
                                          }}
                                      >
                                          <PieChart>
                                              {/* Custom tooltip that appears on hover */}
                                              <Tooltip 
                                                  content={({ active, payload }) => {
                                                      if (active && payload && payload.length) {
                                                          const data = payload[0].payload;
                                                          return (
                                                              <div className="rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg px-4 py-2 text-sm">
                                                                  <div className="flex items-center gap-2">
                                                                      <div 
                                                                          className="w-3 h-3 rounded-full flex-shrink-0" 
                                                                          style={{ backgroundColor: data.color || '#666' }}
                                                                      />
                                                                      <span className="font-medium">{data.name}</span>
                                                                  </div>
                                                                  <div className="mt-1 pl-5 flex justify-between gap-4">
                                                                      <span className="text-gray-500">Amount:</span>
                                                                      <span className="font-semibold">{formatCurrency(data.amount)}</span>
                                                                  </div>
                                                                  <div className="mt-1 pl-5 flex justify-between gap-4">
                                                                      <span className="text-gray-500">Percentage:</span>
                                                                      <span className="font-semibold">
                                                                          {((data.amount / totalAmount) * 100).toFixed(1)}%
                                                                      </span>
                                                                  </div>
                                                              </div>
                                                          );
                                                      }
                                                      return null;
                                                  }}
                                                  cursor={false}
                                              />
                                              <Pie
                                                  data={chartData}
                                                  dataKey="amount"
                                                  nameKey="name"
                                                  innerRadius={70}
                                                  outerRadius={120}
                                                  activeIndex={activeIndex}
                                                  activeShape={({
                                                      cx,
                                                      cy,
                                                      innerRadius,
                                                      outerRadius = 0,
                                                      startAngle,
                                                      endAngle,
                                                      fill,
                                                      ...props
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
                                                          <Sector
                                                              cx={cx}
                                                              cy={cy}
                                                              startAngle={startAngle}
                                                              endAngle={endAngle}
                                                              innerRadius={outerRadius + 12}
                                                              outerRadius={outerRadius + 20}
                                                              fill={fill}
                                                          />
                                                      </g>
                                                  )}
                                              >
                                                  {chartData.map((entry, index) => (
                                                      <Cell 
                                                          key={`cell-${index}`} 
                                                          fill={entry.color} 
                                                          strokeWidth={1}
                                                          stroke="#ffffff"
                                                      />
                                                  ))}
                                                  <Label
                                                      content={({ viewBox }) => {
                                                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                              const selectedCategory = chartData[activeIndex];
                                                              
                                                              return (
                                                                  <text
                                                                      x={viewBox.cx}
                                                                      y={viewBox.cy}
                                                                      textAnchor="middle"
                                                                      dominantBaseline="middle"
                                                                  >
                                                                      <tspan
                                                                          x={viewBox.cx}
                                                                          y={viewBox.cy}
                                                                          className="fill-foreground text-base font-bold"
                                                                      >
                                                                          {selectedCategory?.name || 'No data'}
                                                                      </tspan>
                                                                      <tspan
                                                                          x={viewBox.cx}
                                                                          y={(viewBox.cy || 0) + 24}
                                                                          className="fill-muted-foreground text-sm"
                                                                      >
                                                                          {chartData.length > 0 ?
                                                                              `${((selectedCategory?.amount || 0) / totalAmount * 100).toFixed(1)}%` :
                                                                              'No data'
                                                                          }
                                                                      </tspan>
                                                                  </text>
                                                              );
                                                          }
                                                          return null;
                                                      }}
                                                  />
                                              </Pie>
                                          </PieChart>
                                      </ChartContainer>
                                  </div>
                              </div>
                          </CardContent>
                          <CardFooter className="flex-col items-start gap-2 text-sm">
                              <div className="flex gap-2 font-medium leading-none">
                                  {activeTab === 'earnings'
                                      ? `Income increased by ${changes.earnings > 0 ? changes.earnings.toFixed(1) : 0}% this period`
                                      : `Expenses ${changes.expenses <= 0 ? 'decreased' : 'increased'} by ${Math.abs(changes.expenses).toFixed(1)}% this period`
                                  }
                                  <TrendingUp className={`h-4 w-4 ${
                                      activeTab === 'earnings'
                                          ? changes.earnings >= 0 ? 'text-green-500' : 'text-red-500'
                                          : changes.expenses <= 0 ? 'text-green-500' : 'text-red-500'
                                  }`} />
                              </div>
                              <div className="leading-none text-muted-foreground">
                                  Showing total {activeTab === 'earnings' ? 'income' : 'expenses'} distribution for the selected period
                              </div>
                          </CardFooter>
                      </Card>
                    )}

                    {/* Monthly Trends */}
                    <Card>
                        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
                            <div className="grid flex-1 gap-1 text-center sm:text-left">
                              <CardTitle>Monthly Financial Trends</CardTitle>
                              <CardDescription>
                                Income and expense trends over time
                              </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                          <ChartContainer
                            config={{
                              income: {
                                label: "Income",
                                color: chartColors.income,
                              },
                              expense: {
                                label: "Expenses",
                                color: chartColors.expense,
                              },
                              net: {
                                label: "Net",
                                color: chartColors.net,
                              }
                            }}
                            className="aspect-auto h-[350px] w-full"
                          >
                            <AreaChart data={processWeeklyDataForChart()}>
                              <defs>
                                <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                                  <stop
                                    offset="5%"
                                    stopColor={chartColors.income}
                                    stopOpacity={0.8}
                                  />
                                  <stop
                                    offset="95%"
                                    stopColor={chartColors.income}
                                    stopOpacity={0.1}
                                  />
                                </linearGradient>
                                <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                                  <stop
                                    offset="5%"
                                    stopColor={chartColors.expense}
                                    stopOpacity={0.8}
                                  />
                                  <stop
                                    offset="95%"
                                    stopColor={chartColors.expense}
                                    stopOpacity={0.1}
                                  />
                                </linearGradient>
                                <linearGradient id="fillNet" x1="0" y1="0" x2="0" y2="1">
                                  <stop
                                    offset="5%"
                                    stopColor={chartColors.net}
                                    stopOpacity={0.8}
                                  />
                                  <stop
                                    offset="95%"
                                    stopColor={chartColors.net}
                                    stopOpacity={0.1}
                                  />
                                </linearGradient>
                              </defs>
                              <CartesianGrid vertical={false} />
                              <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                              />
                              <ChartTooltip
                                cursor={false}
                                content={
                                  <ChartTooltipContent
                                    formatter={(value) => formatCurrency(value)}
                                    indicator="dot"
                                  />
                                }
                              />
                              <Area
                                type="natural"
                                dataKey="income"
                                name="Income"
                                fill="url(#fillIncome)"
                                stroke={chartColors.income}
                                strokeWidth={2}
                                activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
                                stackId="a"
                              />
                              <Area
                                type="natural"
                                dataKey="expense"
                                name="Expenses"
                                fill="url(#fillExpense)"
                                stroke={chartColors.expense}
                                strokeWidth={2}
                                activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
                                stackId="a"
                              />
                              <ChartLegend content={<ChartLegendContent />} />
                            </AreaChart>
                          </ChartContainer>
                        </CardContent>
                        <CardFooter>
                          <div className="flex w-full items-start gap-2 text-sm justify-between">
                            <div className="grid gap-2">
                              <div className="flex items-center gap-2 font-medium leading-none">
                                {monthlyTrends.length > 0 && (
                                  <>
                                    {monthlyTrends[monthlyTrends.length - 1].net >= 0 ? (
                                      <>Net positive this month ({formatCurrency(monthlyTrends[monthlyTrends.length - 1].net)}) <TrendingUpIcon className="h-4 w-4 text-green-500" /></>
                                    ) : (
                                      <>Net negative this month ({formatCurrency(monthlyTrends[monthlyTrends.length - 1].net)}) <TrendingDownIcon className="h-4 w-4 text-red-500" /></>
                                    )}
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                                Showing financial data for the last {timeRange === "7d" ? "week" : timeRange === "30d" ? "month" : "3 months"}
                              </div>
                            </div>
                          </div>
                        </CardFooter>
                    </Card>

                    {/* Back to Dashboard button */}
                    <div className="flex justify-end mt-2 mb-6">
                        <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                            Back to Dashboard
                            <ArrowUpRightIcon className="ml-1 size-3" />
                        </Link>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}