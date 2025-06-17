import React, { useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { AppSidebar } from "@/components/app-sidebar";
import { apiFetch } from '@/Utils/api.js';
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/hooks/useCurrency.jsx';
import { Progress } from '@/components/ui/progress';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Edit3,
  Download,
  Share2
} from 'lucide-react';
import BudgetModal from '../Budgets/Partials/BudgetModal';

export default function Show({ auth, budget, expenses, budgetMethods, budgetPeriods, expenseCategories }) {
  const [monthlyComparison, setMonthlyComparison] = useState(null);
  const [yearlyComparison, setYearlyComparison] = useState(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const { formatCurrency } = useCurrency();
  
  useEffect(() => {
    // Fetch monthly comparison data
    apiFetch(route('budgets.monthly', budget.id))
      .then(res => res.json())
      .then(data => setMonthlyComparison(
        Object.entries(data.monthly_comparison).map(([month, data]) => ({
          month,
          spent: data.total,
          average: data.average,
          transactions: data.count
        }))
      ));

    // Fetch yearly comparison data
    apiFetch(route('budgets.yearly', budget.id))
      .then(res => res.json())
      .then(data => setYearlyComparison(
        Object.entries(data.yearly_comparison).map(([year, data]) => ({
          year,
          spent: data.total,
          average: data.average,
          monthlyAverage: data.monthly_average,
          transactions: data.count
        }))
      ));
  }, [budget.id]);

  const utilization = budget.utilization;
  const percentage = Math.min(Math.round(utilization?.percentage || 0), 100);
  const isOverBudget = utilization?.spent > utilization?.total_budget;
  const remaining = utilization?.remaining;
  const remainingPercentage = utilization?.total_budget ? (remaining / utilization.total_budget) * 100 : 0;

  // Calculate budget insights
  const currentDate = new Date();
  const startDate = new Date(budget.start_date);
  const endDate = new Date(budget.end_date || currentDate);
  const totalDays = differenceInDays(endDate, startDate) + 1;
  const daysElapsed = Math.min(differenceInDays(currentDate, startDate), totalDays);
  const daysRemaining = Math.max(0, differenceInDays(endDate, currentDate));
  const expectedSpentByNow = (utilization?.total_budget || budget.amount) * (daysElapsed / totalDays);
  const isAheadOfSchedule = (utilization?.spent || 0) < expectedSpentByNow;
  const dailyBudget = (utilization?.total_budget || budget.amount) / totalDays;
  const avgDailySpending = daysElapsed > 0 ? (utilization?.spent || 0) / daysElapsed : 0;

  // Status determination
  const getStatusInfo = () => {
    if (isOverBudget) {
      return {
        status: 'Over Budget',
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: AlertTriangle,
        description: 'You have exceeded your budget limit'
      };
    } else if (percentage > 90) {
      return {
        status: 'Critical',
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        icon: AlertCircle,
        description: 'Budget is nearly exhausted'
      };
    } else if (percentage > 75) {
      return {
        status: 'Warning',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        icon: Clock,
        description: 'Monitor spending carefully'
      };
    } else {
      return {
        status: 'On Track',
        color: 'text-green-600 bg-green-50 border-green-200',
        icon: CheckCircle,
        description: 'Budget is healthy'
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  // Chart colors
  const chartColors = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4'];

  return (
    <SidebarProvider>
      <Head title={`Budget: ${budget.name}`} />
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 flex-grow overflow-hidden">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb className="whitespace-nowrap overflow-hidden flex-shrink min-w-0">
              <BreadcrumbList className="flex-nowrap overflow-hidden">
                <BreadcrumbItem className="overflow-hidden text-ellipsis">
                  <BreadcrumbLink href={route('budgets.index')} className="text-muted-foreground">Budgets</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="overflow-hidden text-ellipsis">
                  <BreadcrumbPage className="overflow-hidden text-ellipsis block">{budget.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto mr-4 flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              size="sm"
              onClick={() => setShowBudgetModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Budget
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          {/* Header Section with Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{budget.name}</h1>
                <p className="text-muted-foreground">
                  {budget.category ? budget.category.name : "General"} • {budget.period} budget
                </p>
              </div>
              <Badge className={cn("px-3 py-1 font-medium", statusInfo.color)}>
                <StatusIcon className="h-4 w-4 mr-2" />
                {statusInfo.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
          </div>

          {/* Main Budget Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Large Progress Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Budget Progress</CardTitle>
                    <CardDescription>
                      {formatCurrency(utilization?.spent || 0)} of {formatCurrency(utilization?.total_budget || budget.amount)} used
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{percentage}%</div>
                    <div className="text-sm text-muted-foreground">Used</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Progress 
                    value={percentage} 
                    className={cn(
                      "h-4 transition-all duration-1000",
                      isOverBudget ? "bg-red-100" : "bg-gray-100"
                    )}
                    indicatorClassName={cn(
                      "transition-all duration-1000",
                      isOverBudget ? "bg-red-500" : 
                      percentage > 90 ? "bg-orange-500" :
                      percentage > 75 ? "bg-yellow-500" : "bg-green-500"
                    )}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Started {format(new Date(budget.start_date), 'MMM d, yyyy')}</span>
                    <span>
                      {budget.end_date ? 
                        `Ends ${format(new Date(budget.end_date), 'MMM d, yyyy')}` : 
                        'Ongoing budget'
                      }
                    </span>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-sm font-medium text-blue-900">Daily Budget</div>
                    <div className="text-lg font-bold text-blue-600">{formatCurrency(dailyBudget)}</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Activity className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                    <div className="text-sm font-medium text-purple-900">Avg Daily</div>
                    <div className="text-lg font-bold text-purple-600">{formatCurrency(avgDailySpending)}</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600 mx-auto mb-1" />
                    <div className="text-sm font-medium text-green-900">Days Left</div>
                    <div className="text-lg font-bold text-green-600">{daysRemaining}</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Target className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                    <div className="text-sm font-medium text-orange-900">Transactions</div>
                    <div className="text-lg font-bold text-orange-600">{expenses.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Summary Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Budget Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Budget</span>
                      <span className="font-semibold">{formatCurrency(utilization?.total_budget || budget.amount)}</span>
                    </div>
                    {budget.rollover_enabled && budget.rollover_amount > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">• Rollover</span>
                        <span className="text-green-600">+{formatCurrency(budget.rollover_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Spent</span>
                      <span className="font-semibold text-red-600">-{formatCurrency(utilization?.spent || 0)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Remaining</span>
                      <span className={cn(
                        "font-bold text-lg",
                        remaining < 0 ? "text-red-600" : "text-green-600"
                      )}>
                        {formatCurrency(Math.abs(remaining))}
                        {remaining < 0 && " over"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Spending Pace</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {isAheadOfSchedule ? (
                        <TrendingDown className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium">
                          {isAheadOfSchedule ? "Under Expected" : "Over Expected"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Expected: {formatCurrency(expectedSpentByNow)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Based on {daysElapsed} of {totalDays} days elapsed
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Budget Details Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Budget Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Time Period
                  </div>
                  <div>
                    <div className="font-medium capitalize">{budget.period}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(budget.start_date), 'MMM d, yyyy')} - 
                      {budget.end_date ? format(new Date(budget.end_date), ' MMM d, yyyy') : ' Ongoing'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Wallet className="h-4 w-4" />
                    Category
                  </div>
                  <div>
                    <div className="font-medium">
                      {budget.category ? budget.category.name : "General Budget"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <BarChart3 className="h-4 w-4" />
                    Budget Method
                  </div>
                  <div>
                    <Badge variant="outline" className="capitalize">
                      {budget.budget_method === 'standard' ? 'Standard' : budget.budget_method}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {budget.budget_method === 'standard' && 'Traditional budgeting approach'}
                      {budget.budget_method === '50-30-20' && '50% needs, 30% wants, 20% savings'}
                      {budget.budget_method === 'zero-based' && 'Every dollar has a purpose'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <ArrowUpRight className="h-4 w-4" />
                    Rollover
                  </div>
                  <div>
                    {budget.rollover_enabled ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100">Disabled</Badge>
                    )}
                    {budget.rollover_enabled && budget.rollover_amount > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Current: {formatCurrency(budget.rollover_amount)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {budget.notes && (
                <div className="mt-6 pt-6 border-t">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Notes</div>
                  <div className="text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-line">{budget.notes}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analytics and Charts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Budget Analytics
              </CardTitle>
              <CardDescription>
                Detailed analysis of spending patterns and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="monthly" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="monthly" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Monthly
                  </TabsTrigger>
                  <TabsTrigger value="yearly" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Yearly
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4" />
                    Insights
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="monthly" className="space-y-4">
                  <div className="h-[400px]">
                    {monthlyComparison && monthlyComparison.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyComparison}>
                          <defs>
                            <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="spent" 
                            stroke="#10b981" 
                            fillOpacity={1} 
                            fill="url(#colorSpent)"
                            name="Amount Spent"
                          />
                          <Bar dataKey="average" name="Average" fill="#3b82f6" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No monthly data available yet</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="yearly" className="space-y-4">
                  <div className="h-[400px]">
                    {yearlyComparison && yearlyComparison.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={yearlyComparison}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="spent" name="Annual Spent" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="monthlyAverage" name="Monthly Average" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No yearly data available yet</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="insights" className="space-y-6">
                  {budget.utilization?.variance_analysis ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="border-2">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Variance Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className={cn(
                            "text-3xl font-bold mb-2",
                            budget.utilization.variance >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {budget.utilization.variance >= 0 ? "+" : ""}
                            {formatCurrency(budget.utilization.variance)}
                          </div>
                          <div className="text-sm text-muted-foreground mb-4">
                            {Math.abs(budget.utilization.variance_percent).toFixed(1)}%
                            {budget.utilization.variance >= 0 ? " under budget" : " over budget"}
                          </div>
                          <div className={cn(
                            "flex items-center gap-2 text-sm",
                            budget.utilization.variance >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {budget.utilization.variance >= 0 ? (
                              <ArrowDownRight className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                            {budget.utilization.variance >= 0 ? "Savings opportunity" : "Over spending"}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-2">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <PieChartIcon className="h-5 w-5" />
                            Category Breakdown
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {Object.entries(budget.utilization.category_breakdown || {}).slice(0, 5).map(([category, amount], index) => (
                              <div key={category} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                                  />
                                  <span className="text-sm">{category}</span>
                                </div>
                                <span className="text-sm font-medium">{formatCurrency(amount)}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-2">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Spending Insights
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Daily average</div>
                            <div className="text-xl font-semibold">{formatCurrency(avgDailySpending)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Spending trend</div>
                            <div className="flex items-center gap-2">
                              {isAheadOfSchedule ? (
                                <>
                                  <TrendingDown className="h-4 w-4 text-green-600" />
                                  <span className="text-green-600 font-medium">Below pace</span>
                                </>
                              ) : (
                                <>
                                  <TrendingUp className="h-4 w-4 text-red-600" />
                                  <span className="text-red-600 font-medium">Above pace</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Projected end</div>
                            <div className="font-medium">
                              {avgDailySpending > 0 ? 
                                formatCurrency((utilization?.total_budget || budget.amount) / avgDailySpending * avgDailySpending) :
                                "N/A"
                              }
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No insights available yet. Start tracking expenses to see detailed analytics.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Recent Transactions
                  </CardTitle>
                  <CardDescription>
                    Expenses in this budget category during the budget period
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-normal">
                  {expenses.length} transaction{expenses.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No transactions yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start adding expenses to track your budget progress
                  </p>
                  <Button asChild>
                    <Link href={route('expenses.create')}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Add Expense
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                        <TableHead className="font-semibold">Category</TableHead>
                        <TableHead className="text-right font-semibold">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.slice(0, 10).map((expense) => (
                        <TableRow key={expense.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium">
                            {format(new Date(expense.date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>{expense.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {expense.category?.name || 'Uncategorized'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(expense.amount || expense.sum)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {expenses.length > 10 && (
                    <div className="p-4 text-center border-t bg-muted/20">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={route('expenses.index', { budget: budget.id })}>
                          View All {expenses.length} Transactions
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Budget Modal */}
        <BudgetModal 
          isOpen={showBudgetModal} 
          onClose={() => setShowBudgetModal(false)} 
          budget={budget}
          expenseCategories={expenseCategories}
          budgetMethods={budgetMethods} 
          budgetPeriods={budgetPeriods} 
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
