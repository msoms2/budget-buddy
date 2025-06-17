import React from "react";
import { cn } from "@/lib/utils";
import { AddTransactionButton } from "@/components/add-transaction-button";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  PlusIcon, 
  ArrowUpRightIcon, 
  CalendarIcon,
  Target,
  Briefcase,
  CreditCard,
  Clock,
  AlertCircle,
  DollarSign,
  Goal,
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Head, Link } from "@inertiajs/react";
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, PieChart, Pie, Cell, Line, LineChart, Sector, Label } from "recharts";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useTransactionSheet } from '@/hooks/use-transaction-sheet';
import { useCurrency } from '@/hooks/useCurrency.jsx';

export default function Page({ 
  totalBalance, 
  monthlySpending, 
  monthlyIncome, 
  recentTransactions, 
  expenseCategoryBreakdown, 
  incomeCategoryBreakdown, 
  budgets, 
  goals,
  goalsSummary,
  investments,
  investmentsSummary,
  debts,
  debtSummary,
  paymentSchedules,
  schedulesSummary,
  categories = {}, 
  monthlyFinanceData, 
  changes = {} 
}) {
  const [timeRange, setTimeRange] = useState("monthly");
  const [categoryType, setCategoryType] = useState(localStorage.getItem('categoryType') || 'expenses');
  const [activeFinanceTab, setActiveFinanceTab] = useState("both");
  const [activeIndex, setActiveIndex] = useState(0);
  const { sheet, transactionSheet } = useTransactionSheet();
  const { formatCurrency } = useCurrency();

  // Debug logs to check values coming from backend
  console.log('Dashboard received props:', {
    totalBalance,
    monthlySpending,
    monthlyIncome,
    recentTransactions: recentTransactions?.length,
    categories,
    monthlyFinanceData,
    changes,
    goals,
    investments,
    debts,
    paymentSchedules,
    budgets: budgets?.length,
    budgetsData: budgets
  });

  // More detailed debug for budget structure
  if (budgets && budgets.length > 0) {
    console.log('First budget sample:', budgets[0]);
    console.log('Budget has utilization property:', budgets[0].hasOwnProperty('utilization'));
    if (budgets[0].utilization) {
      console.log('Budget utilization structure:', budgets[0].utilization);
    }
  } else {
    console.log('No budgets available or budgets is not an array:', budgets);
  }

  // Ensure categories is properly structured for filtering
  const expenseCategories = Array.isArray(categories?.expense) ? categories.expense : [];
  const earningCategories = Array.isArray(categories?.income) ? categories.income : [];

  useEffect(() => {
    localStorage.setItem('categoryType', categoryType);
  }, [categoryType]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // Calculate monthly budget progress
  const calculateBudgetProgress = (budget) => {
    const currentDate = new Date();
    const startDate = new Date(budget.start_date);
    const endDate = new Date(budget.end_date);

    // Calculate how much of the budget period has passed
    const periodTotal = endDate - startDate;
    const periodPassed = currentDate - startDate;
    const percentPassed = Math.min(100, Math.max(0, (periodPassed / periodTotal) * 100));

    return percentPassed;
  }

  // Chart configuration
  const chartConfig = {
    income: {
      label: "Income",
      color: "#10b981", // green
    },
    expenses: {
      label: "Expenses",
      color: "#ef4444", // red
    }
  };

  const categoryBreakdown = categoryType === 'expenses' ? expenseCategoryBreakdown : incomeCategoryBreakdown;

  return (
    <SidebarProvider>
      <Head title="Dashboard"/>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Financial Summary Cards */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-4">
            <Card className="bg-green-50 dark:bg-green-900/20">
              <CardHeader className="relative">
                <CardDescription>Total Balance</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">
                  {formatCurrency(totalBalance)}
                </CardTitle>
                <div className="absolute right-4 top-4">
                  <Badge variant="outline" className={`flex gap-1 rounded-lg text-xs ${totalBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {totalBalance >= 0 ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
                    {totalBalance >= 0 ? 'Positive' : 'Negative'}
                  </Badge>
                </div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Net worth {totalBalance >= 0 ? 'is growing' : 'needs attention'}
                </div>
              </CardFooter>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-900/20">
              <CardHeader className="relative">
                <CardDescription>Monthly Income</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">
                  {formatCurrency(monthlyIncome)}
                </CardTitle>
                <div className="absolute right-4 top-4">
                  <Badge variant="outline" className="flex gap-1 rounded-lg text-xs text-blue-600 dark:text-blue-400">
                    <CalendarIcon className="size-3" />
                    This Month
                  </Badge>
                </div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="flex items-center gap-1">
                  {changes?.earnings > 0 ? (
                    <TrendingUpIcon className="size-3.5 text-green-500" />
                  ) : changes?.earnings < 0 ? (
                    <TrendingDownIcon className="size-3.5 text-red-500" />
                  ) : (
                    <div className="w-3.5"></div>
                  )}
                  <span className={`font-medium ${changes?.earnings > 0 ? 'text-green-600 dark:text-green-400' : changes?.earnings < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                    Earnings {changes?.earnings > 0 ? 'up' : changes?.earnings < 0 ? 'down' : 'unchanged'} by {Math.abs(Math.round(changes?.earnings || 0))}%
                  </span>
                </div>
              </CardFooter>
            </Card>

            <Card className="bg-red-50 dark:bg-red-900/20">
              <CardHeader className="relative">
                <CardDescription>Monthly Expenses</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">
                  {formatCurrency(monthlySpending)}
                </CardTitle>
                <div className="absolute right-4 top-4">
                  <Badge variant="outline" className="flex gap-1 rounded-lg text-xs text-red-600 dark:text-red-400">
                    <CalendarIcon className="size-3" />
                    This Month
                  </Badge>
                </div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="flex items-center gap-1">
                  {changes?.expenses < 0 ? (
                    <TrendingDownIcon className="size-3.5 text-green-500" />
                  ) : changes?.expenses > 0 ? (
                    <TrendingUpIcon className="size-3.5 text-red-500" />
                  ) : (
                    <div className="w-3.5"></div>
                  )}
                  <span className={`font-medium ${changes?.expenses < 0 ? 'text-green-600 dark:text-green-400' : changes?.expenses > 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                    Expenses {changes?.expenses > 0 ? 'up' : changes?.expenses < 0 ? 'down' : 'unchanged'} by {Math.abs(Math.round(changes?.expenses || 0))}%
                  </span>
                </div>
              </CardFooter>
            </Card>

            <Card className="bg-purple-50 dark:bg-purple-900/20">
              <CardHeader className="relative">
                <CardDescription>Monthly Savings</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">
                  {formatCurrency(monthlyIncome - monthlySpending)}
                </CardTitle>
                <div className="absolute right-4 top-4">
                  <Badge variant="outline" className={`flex gap-1 rounded-lg text-xs ${monthlyIncome < monthlySpending ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {monthlyIncome < monthlySpending ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
                    {monthlyIncome < monthlySpending ? '+' + Math.round((monthlyIncome - monthlySpending) / monthlyIncome * 100) + '%' : Math.round((monthlySpending - monthlyIncome) / monthlyIncome * 100) + '%'}
                  </Badge>
                </div>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  {monthlyIncome < monthlySpending ? 'Income exceeds expenses' : 'Spending exceeds income'}
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Feature Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Goals Summary */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Financial Goals</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {goalsSummary?.active_goals || 0}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Active goals • {formatCurrency(goalsSummary?.total_current_amount || 0)} saved
                </p>
                <div className="mt-3">
                  <Progress 
                    value={goalsSummary?.total_target_amount ? (goalsSummary.total_current_amount / goalsSummary.total_target_amount) * 100 : 0}
                    className="h-2 bg-blue-100 dark:bg-blue-900/50"
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50" asChild>
                  <Link href="/goals">
                    Manage Goals
                    <ArrowUpRightIcon className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Investments Summary */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Investments</CardTitle>
                <Briefcase className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(investmentsSummary?.total_value || 0)}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Portfolio value • {investmentsSummary?.total_investments || 0} investments
                </p>
                <div className="mt-2">
                  <div className="flex items-center gap-1">
                    {(investmentsSummary?.total_return || 0) >= 0 ? (
                      <TrendingUpIcon className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDownIcon className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs font-medium ${(investmentsSummary?.total_return || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(investmentsSummary?.total_return || 0) >= 0 ? '+' : ''}{formatCurrency(investmentsSummary?.total_return || 0)} return
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full border-green-200 text-green-700 hover:bg-green-50" asChild>
                  <Link href="/investments">
                    View Portfolio
                    <ArrowUpRightIcon className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Debt Summary */}
            <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Debt Management</CardTitle>
                <CreditCard className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {formatCurrency(debtSummary?.total_amount_owed || 0)}
                </div>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Total debt • {debtSummary?.total_debts || 0} creditors
                </p>
                {debtSummary?.overdue_debts > 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-600 font-medium">
                      {debtSummary.overdue_debts} overdue
                    </span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full border-red-200 text-red-700 hover:bg-red-50" asChild>
                  <Link href="/creditors">
                    Manage Debts
                    <ArrowUpRightIcon className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Payment Schedules Summary */}
            <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled Payments</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {formatCurrency(schedulesSummary?.upcoming_amount || 0)}
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Due this week • {schedulesSummary?.pending_schedules || 0} pending
                </p>
                {schedulesSummary?.overdue_schedules > 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-red-600 font-medium">
                      {schedulesSummary.overdue_schedules} overdue
                    </span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50" asChild>
                  <Link href="/payment-schedules">
                    View Schedules
                    <ArrowUpRightIcon className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Charts and Detailed Information */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            {/* Monthly Income vs Expenses Chart */}
            <Card className="lg:col-span-3 shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                  <CardTitle>Income vs Expenses</CardTitle>
                  <CardDescription>Financial data statistics for the last 6 months</CardDescription>
                </div>
                <div className="flex">
                  {["income", "expenses", "both"].map((key) => {
                    const total = key === "both" 
                      ? monthlyFinanceData.reduce((acc, curr) => acc + (curr.income || 0) + (curr.expenses || 0), 0)
                      : monthlyFinanceData.reduce((acc, curr) => acc + (curr[key] || 0), 0);
                    return (
                      <button
                        key={key}
                        data-active={key === activeFinanceTab}
                        className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                        onClick={() => setActiveFinanceTab(key)}
                      >
                        <span className="text-xs text-muted-foreground">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                        <span className="text-lg font-bold leading-none sm:text-3xl">
                          {formatCurrency(total).replace('.00', '')}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </CardHeader>
              <CardContent className="px-2 sm:p-6">
                <ChartContainer
                  config={chartConfig}
                  className="aspect-auto h-[250px] w-full"
                >
                  <LineChart
                    accessibilityLayer
                    data={monthlyFinanceData}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="w-[150px]"
                          formatter={(value) => formatCurrency(value)}
                        />
                      }
                    />
                    {(activeFinanceTab === "income" || activeFinanceTab === "both") && (
                      <Line
                        dataKey="income"
                        type="monotone"
                        stroke="var(--color-income, #10b981)"
                        strokeWidth={2}
                        dot={false}
                      />
                    )}
                    {(activeFinanceTab === "expenses" || activeFinanceTab === "both") && (
                      <Line
                        dataKey="expenses"
                        type="monotone"
                        stroke="var(--color-expenses, #ef4444)"
                        strokeWidth={2}
                        dot={false}
                      />
                    )}
                  </LineChart>
                </ChartContainer>
              </CardContent>
              <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm justify-between">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 font-medium leading-none">
                      {monthlyIncome > monthlySpending ? (
                        <>Income trending up by {Math.round((monthlyIncome - monthlySpending) / monthlySpending * 100)}% <TrendingUpIcon className="h-4 w-4 text-green-500" /></>
                      ) : (
                        <>Expenses trending {monthlySpending > monthlyIncome ? 'up' : 'down'} by {Math.abs(Math.round((monthlySpending - monthlyIncome) / monthlyIncome * 100))}% {monthlySpending > monthlyIncome ? <TrendingUpIcon className="h-4 w-4 text-red-500" /> : <TrendingDownIcon className="h-4 w-4 text-green-500" />}</>
                      )}
                    </div>
                    {/* <div className="flex items-center gap-2 leading-none text-muted-foreground">
                      Showing financial data for the last 6 months
                    </div> */}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                  <Link href="/statistics">
                    View All
                    <ArrowUpRightIcon className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
                </div>
              </CardFooter>
            </Card>

            {/* Category Breakdown */}
            <Card className="shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="flex flex-row items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>
                      Category Breakdown
                    </CardTitle>
                    <CardDescription>
                      Displaying top {categoryType === 'expenses' ? 'spending' : 'income'} categories
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/categories">
                      View All
                      <ArrowUpRightIcon className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
                <div className="flex items-center mt-2">
                  <div className="inline-flex rounded-md shadow-sm bg-gray-100">
                    <button
                      className={`px-3 py-1.5 text-sm rounded-md ${categoryType === 'income' ? 'bg-purple-600 text-white' : 'text-gray-700'}`}
                      onClick={() => setCategoryType('income')}
                    >
                      Income
                    </button>
                    <button
                      className={`px-3 py-1.5 text-sm rounded-md ${categoryType === 'expenses' ? 'bg-purple-600 text-white' : 'text-gray-700'}`}
                      onClick={() => setCategoryType('expenses')}
                    >
                      Expenses
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex items-center justify-center">
                <div className="w-[280px] h-[280px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryType === 'expenses' ? expenseCategoryBreakdown.slice(0, 8) : incomeCategoryBreakdown.slice(0, 8)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="amount"
                        nameKey="name"
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
                        {(categoryType === 'expenses' ? expenseCategoryBreakdown.slice(0, 8) : incomeCategoryBreakdown.slice(0, 8) || []).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color || `#${Math.floor(Math.random()*16777215).toString(16)}`} 
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        ))}
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              const currentData = categoryType === 'expenses' ? expenseCategoryBreakdown.slice(0, 8) : incomeCategoryBreakdown.slice(0, 8);
                              const activeData = currentData[activeIndex];
                              const totalAmount = currentData?.reduce((total, item) => total + (parseFloat(item.amount) || 0), 0) || 0;
                              const percentage = activeData && totalAmount > 0 ? ((parseFloat(activeData.amount) || 0) / totalAmount * 100) : 0;
                              
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
                                    {activeData?.name || (categoryType === 'expenses' ? 'Expenses' : 'Income')}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 15}
                                    className="fill-muted-foreground text-xs"
                                  >
                                    {activeData ? `${percentage.toFixed(1)}%` : formatCurrency(totalAmount)}
                                  </tspan>
                                </text>
                              );
                            }
                            return null;
                          }}
                        />
                      </Pie>

                      <Tooltip
                        cursor={false}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const currentData = categoryType === 'expenses' ? expenseCategoryBreakdown.slice(0, 8) : incomeCategoryBreakdown.slice(0, 8);
                            const totalAmount = currentData?.reduce((total, item) => total + (parseFloat(item.amount) || 0), 0) || 0;
                            const percentage = totalAmount > 0 ? ((parseFloat(data.amount) || 0) / totalAmount * 100) : 0;
                            
                            return (
                              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border dark:border-gray-700">
                                <p className="font-medium text-sm">{data.name}</p>
                                <div className="mt-2 space-y-1">
                                  <p className="text-sm">
                                    <span className="text-muted-foreground">Amount:</span> 
                                    <span className="font-semibold ml-2">{formatCurrency(data.amount)}</span>
                                  </p>
                                  <p className="text-sm">
                                    <span className="text-muted-foreground">Share:</span> 
                                    <span className="font-semibold ml-2">{percentage.toFixed(1)}%</span>
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-4">
                {/* Button moved to header - this section can be empty or removed */}
              </CardFooter>
            </Card>
          </div>

          {/* Recent Transactions and Budget Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recent Transactions */}
            <Card className="md:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest financial activities</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/transactions">
                    View All
                    <ArrowUpRightIcon className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((transaction) => (
                        <TableRow key={`${transaction.type}-${transaction.id}`}>
                          <TableCell>{formatDate(transaction.date)}</TableCell>
                          <TableCell className="font-medium">{transaction.name}</TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell className={`text-right ${transaction.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">No recent transactions found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Budget Tracking */}
            <Card className="md:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Budget Tracking</CardTitle>
                  <CardDescription>Your active budgets</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/budgets">
                    View All
                    <ArrowUpRightIcon className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgets && Array.isArray(budgets) && budgets.length > 0 ? (
                    budgets.map((budget) => {
                      // Handle different potential data structures
                      // 1. Standard format with utilization property
                      // 2. Format with spent and amount directly on budget
                      // 3. Format with percent_used and budget_amount (from Reports)
                      const utilization = budget.utilization || {};
                      
                      // Determine spent amount from various possible sources
                      let spent = 0;
                      if (utilization.spent !== undefined) {
                        spent = utilization.spent;
                      } else if (budget.spent !== undefined) {
                        spent = budget.spent;
                      } else if (budget.expenses !== undefined) {
                        spent = budget.expenses;
                      }
                      
                      // Determine budget amount from various possible sources
                      let totalBudget = 0;
                      if (utilization.total_budget !== undefined) {
                        totalBudget = utilization.total_budget;
                      } else if (budget.amount !== undefined) {
                        totalBudget = budget.amount;
                      } else if (budget.budget_amount !== undefined) {
                        totalBudget = budget.budget_amount;
                      }
                      
                      // Calculate percentage or use provided percentage
                      let percentage = 0;
                      if (budget.percent_used !== undefined) {
                        percentage = Math.round(budget.percent_used);
                      } else if (totalBudget > 0) {
                        percentage = Math.min(Math.round((spent / totalBudget) * 100), 100);
                      }
                      
                      const isOverBudget = spent > totalBudget;
                      const budgetName = budget.name || 'Unnamed Budget';

                      return (
                        <div key={budget.id || `budget-${Math.random()}`} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{budgetName}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(spent)} of {formatCurrency(totalBudget)}
                            </span>
                          </div>
                          <Progress 
                            value={percentage} 
                            className={cn(
                              "h-2",
                              isOverBudget ? "bg-red-100" : "bg-gray-100"
                            )}
                            indicatorClassName={cn(
                              isOverBudget ? "bg-red-500" : percentage > 80 ? "bg-amber-500" : "bg-green-500"
                            )}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{percentage}% used</span>
                            <span className={cn(
                              "font-medium",
                              isOverBudget ? "text-red-600" : "text-green-600"
                            )}>
                              {isOverBudget 
                                ? `${formatCurrency(spent - totalBudget)} over` 
                                : `${formatCurrency(totalBudget - spent)} left`}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-2">No active budgets</p>
                      <div className="flex justify-center">
                        <Button variant="default" asChild>
                          <Link href="/budgets">Get Started</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Goals and Upcoming Payments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Active Goals */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Active Goals</CardTitle>
                  <CardDescription>Your progress towards financial goals</CardDescription>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/goals">
                    View All
                    <ArrowUpRightIcon className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals && goals.length > 0 ? (
                    goals.slice(0, 3).map((goal) => (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{goal.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(goal.current_amount)} of {formatCurrency(goal.target_amount)}
                            </p>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {Math.round(goal.progress_percentage)}%
                          </Badge>
                        </div>
                        <Progress 
                          value={goal.progress_percentage} 
                          className="h-2"
                          indicatorClassName={goal.progress_percentage >= 100 ? "bg-green-500" : "bg-blue-500"}
                        />
                        {goal.target_date && (
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Target: {formatDate(goal.target_date)}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <Target className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-muted-foreground">No active goals</p>
                      <Button size="sm" className="mt-2" asChild>
                        <Link href="/goals/create">Create Your First Goal</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Payments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Upcoming Payments</CardTitle>
                  <CardDescription>Scheduled payments and bills</CardDescription>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/payment-schedules">
                    View All
                    <ArrowUpRightIcon className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentSchedules && paymentSchedules.length > 0 ? (
                    paymentSchedules.slice(0, 4).map((payment) => {
                      const isOverdue = new Date(payment.due_date) < new Date();
                      const isDueSoon = new Date(payment.due_date) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
                      
                      return (
                        <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{payment.name}</p>
                              {isOverdue && <XCircle className="h-4 w-4 text-red-500" />}
                              {!isOverdue && isDueSoon && <AlertCircle className="h-4 w-4 text-orange-500" />}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {payment.category} • Due {formatDate(payment.due_date)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatCurrency(payment.amount)}</p>
                            <Badge 
                              variant={isOverdue ? "destructive" : isDueSoon ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {isOverdue ? "Overdue" : isDueSoon ? "Due Soon" : "Scheduled"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6">
                      <Clock className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-muted-foreground">No upcoming payments</p>
                      <Button size="sm" className="mt-2" asChild>
                        <Link href="/payment-schedules/create">Schedule a Payment</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Transaction Sheet */}
        {transactionSheet}
      </SidebarInset>
    </SidebarProvider>
  );
}
