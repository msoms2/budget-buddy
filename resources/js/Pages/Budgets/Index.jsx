import * as React from 'react';
import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useCurrency } from '@/hooks/useCurrency.jsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  PlusIcon, 
  ArrowUpRightIcon, 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  BarChart3, 
  TrendingUpIcon, 
  TrendingDownIcon, 
  DollarSignIcon,
  Target,
  CalendarIcon,
  AlertTriangleIcon
} from "lucide-react";
import BudgetModal from './Partials/BudgetModal';

export default function Index({ auth, budgets, expenseCategories, budgetMethods, budgetPeriods }) {
  const [isRolloverDialogOpen, setIsRolloverDialogOpen] = useState(false);
  const [isMethodDialogOpen, setIsMethodDialogOpen] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [date, setDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const { formatCurrency } = useCurrency();

  const { data, setData, post, processing, errors, reset } = useForm({
    budget_method: 'standard',
    total_amount: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    period: 'monthly',
  });

  // Calculate budget statistics
  const activeBudgets = budgets.filter(b => new Date(b.end_date) >= new Date() || b.end_date === null);
  const totalBudgeted = budgets.reduce((sum, b) => sum + (b.utilization?.total_budget || b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.utilization?.spent || 0), 0);
  const onTrackBudgets = activeBudgets.filter(b => (b.utilization?.spent || 0) <= (b.utilization?.total_budget || b.amount));
  const overBudgetCount = activeBudgets.filter(b => (b.utilization?.spent || 0) > (b.utilization?.total_budget || b.amount)).length;

  const openCreateBudgetModal = () => {
    setSelectedBudget(null);
    setShowBudgetModal(true);
  };

  const openEditBudgetModal = (budget) => {
    setSelectedBudget(budget);
    setShowBudgetModal(true);
  };

  const closeBudgetModal = () => {
    setShowBudgetModal(false);
    setSelectedBudget(null);
  };

  const handleApplyBudgetMethod = (e) => {
    e.preventDefault();
    post(route('budgets.apply-method'), {
      onSuccess: () => {
        setIsMethodDialogOpen(false);
        reset();
      },
    });
  };

  const handleProcessRollovers = () => {
    post(route('budgets.rollover'), {
      onSuccess: () => {
        setIsRolloverDialogOpen(false);
      },
    });
  };

  return (
    <SidebarProvider>
      <Head title="Budgets" />
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbItem>
                <BreadcrumbPage>Budgets</BreadcrumbPage>
              </BreadcrumbItem>
            </Breadcrumb>
          </div>
          <div className="ml-auto mr-4 flex items-center gap-2">
            <Button onClick={() => setIsMethodDialogOpen(true)} variant="outline" size="sm">
              Apply Budget Method
            </Button>
            <Button onClick={() => setIsRolloverDialogOpen(true)} variant="outline" size="sm">
              Process Rollovers
            </Button>
            <Button 
              onClick={openCreateBudgetModal} 
              className="bg-green-600 hover:bg-green-700 flex items-center gap-1" 
              size="sm"
            >
              <PlusIcon className="h-4 w-4" />
              Create Budget
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="rounded-full bg-gradient-to-br from-green-50 to-blue-50 p-6 mb-6">
                <Target className="h-16 w-16 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Start Your Budget Journey</h3>
              <p className="text-gray-500 mt-1 mb-8 max-w-lg text-lg">
                Take control of your finances by creating budgets that help you track spending and reach your financial goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  onClick={openCreateBudgetModal}
                >
                  <Target className="h-5 w-5" />
                  Create Your First Budget
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => setIsMethodDialogOpen(true)}
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Use Budget Method
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Budget Statistics Cards */}
              <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                <Card className="bg-green-50 dark:bg-green-900/20">
                  <CardHeader className="relative">
                    <CardDescription>Total Budgeted</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">
                      {formatCurrency(totalBudgeted)}
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                      <Badge variant="outline" className="flex gap-1 rounded-lg text-xs text-green-600 dark:text-green-400">
                        <DollarSignIcon className="size-3" />
                        Budget
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Across {budgets.length} budget{budgets.length !== 1 ? 's' : ''}
                    </div>
                  </CardFooter>
                </Card>

                <Card className="bg-blue-50 dark:bg-blue-900/20">
                  <CardHeader className="relative">
                    <CardDescription>Total Spent</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">
                      {formatCurrency(totalSpent)}
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                      <Badge variant="outline" className="flex gap-1 rounded-lg text-xs text-blue-600 dark:text-blue-400">
                        <TrendingUpIcon className="size-3" />
                        Spent
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      {totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0}% of total budget
                    </div>
                  </CardFooter>
                </Card>

                <Card className="bg-purple-50 dark:bg-purple-900/20">
                  <CardHeader className="relative">
                    <CardDescription>Active Budgets</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">
                      {activeBudgets.length}
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                      <Badge variant="outline" className="flex gap-1 rounded-lg text-xs text-purple-600 dark:text-purple-400">
                        <CalendarIcon className="size-3" />
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      {onTrackBudgets.length} on track, {overBudgetCount} over budget
                    </div>
                  </CardFooter>
                </Card>

                <Card className="bg-orange-50 dark:bg-orange-900/20">
                  <CardHeader className="relative">
                    <CardDescription>Remaining Budget</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">
                      {formatCurrency(Math.max(0, totalBudgeted - totalSpent))}
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                      <Badge variant="outline" className={`flex gap-1 rounded-lg text-xs ${totalSpent > totalBudgeted ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                        {totalSpent > totalBudgeted ? <AlertTriangleIcon className="size-3" /> : <Target className="size-3" />}
                        {totalSpent > totalBudgeted ? 'Over' : 'Left'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      {totalSpent > totalBudgeted ? 'Over budget' : 'Available to spend'}
                    </div>
                  </CardFooter>
                </Card>
              </div>

              {/* View Toggle and Budget List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Your Budgets</CardTitle>
                      <CardDescription>Manage and track your financial plans</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex rounded-md border">
                        <Button
                          variant={viewMode === 'cards' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('cards')}
                          className="rounded-r-none"
                        >
                          Cards
                        </Button>
                        <Button
                          variant={viewMode === 'table' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('table')}
                          className="rounded-l-none"
                        >
                          Table
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="active">
                    <TabsList className="mb-6">
                      <TabsTrigger value="active">Active Budgets ({activeBudgets.length})</TabsTrigger>
                      <TabsTrigger value="all">All Budgets ({budgets.length})</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="active">
                      {viewMode === 'cards' ? (
                        <BudgetCardList
                          budgets={activeBudgets}
                          onEdit={openEditBudgetModal}
                          formatCurrency={formatCurrency}
                        />
                      ) : (
                        <BudgetTableList
                          budgets={activeBudgets}
                          onEdit={openEditBudgetModal}
                          formatCurrency={formatCurrency}
                        />
                      )}
                    </TabsContent>
                    
                    <TabsContent value="all">
                      {viewMode === 'cards' ? (
                        <BudgetCardList
                          budgets={budgets}
                          onEdit={openEditBudgetModal}
                          formatCurrency={formatCurrency}
                        />
                      ) : (
                        <BudgetTableList
                          budgets={budgets}
                          onEdit={openEditBudgetModal}
                          formatCurrency={formatCurrency}
                        />
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Fixed Action Button for quick budget creation */}
        <div className="fixed bottom-8 right-8">
          <Button 
            onClick={openCreateBudgetModal} 
            className="h-14 w-14 rounded-full shadow-lg bg-green-600 hover:bg-green-700" 
            size="icon"
          >
            <PlusIcon className="h-6 w-6" />
          </Button>
        </div>

        {/* Apply Budget Method Dialog */}
        <Dialog open={isMethodDialogOpen} onOpenChange={setIsMethodDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Apply Budget Method</DialogTitle>
              <DialogDescription>
                Apply a budgeting method to automatically create budgets based on your expense categories.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleApplyBudgetMethod}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="budget_method" className="text-right">
                    Method
                  </Label>
                  <Select
                    value={data.budget_method}
                    onValueChange={(value) => setData('budget_method', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(budgetMethods).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="total_amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="total_amount"
                    type="number"
                    step="0.01"
                    className="col-span-3"
                    value={data.total_amount}
                    onChange={(e) => setData('total_amount', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="period" className="text-right">
                    Period
                  </Label>
                  <Select
                    value={data.period}
                    onValueChange={(value) => setData('period', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(budgetPeriods).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start_date" className="text-right">
                    Start Date
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !data.start_date && "text-muted-foreground"
                          )}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                          {data.start_date ? format(new Date(data.start_date), "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={data.start_date ? new Date(data.start_date) : undefined}
                          onSelect={(selectedDate) => selectedDate && setData('start_date', format(selectedDate, 'yyyy-MM-dd'))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={processing}>Apply Method</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Process Rollovers Dialog */}
        <Dialog open={isRolloverDialogOpen} onOpenChange={setIsRolloverDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Process Budget Rollovers</DialogTitle>
              <DialogDescription>
                This will process all eligible budgets with rollover enabled that have ended, creating new budgets for the next period.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">How Budget Rollover Works:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Finds budgets with rollover enabled that have ended</li>
                  <li>• Creates new budgets for the next period (same duration)</li>
                  <li>• Carries over any unused money from the previous budget</li>
                  <li>• Skips budgets that already have rollovers for the next period</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-medium text-amber-900 mb-2">Eligible Budgets:</h4>
                <p className="text-sm text-amber-800">
                  Only budgets with "Rollover Enabled" that have passed their end date will be processed. 
                  You'll see a detailed summary after processing.
                </p>
              </div>
              
              <p className="text-sm text-gray-600">
                Are you sure you want to process rollovers for eligible budgets?
              </p>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsRolloverDialogOpen(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleProcessRollovers} 
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                {processing ? 'Processing...' : 'Process Rollovers'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Budget Modal */}
        <BudgetModal 
          isOpen={showBudgetModal} 
          onClose={closeBudgetModal} 
          budget={selectedBudget}
          expenseCategories={expenseCategories}
          budgetMethods={budgetMethods}
          budgetPeriods={budgetPeriods}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

// New card-based budget list component
function BudgetCardList({ budgets, onEdit, formatCurrency }) {
  if (budgets.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets in this category</h3>
        <p className="text-gray-500">Create a budget to get started with financial tracking.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {budgets.map((budget) => {
        const utilization = budget.utilization;
        const spent = utilization?.spent || 0;
        const totalBudget = utilization?.total_budget || budget.amount;
        const percentage = totalBudget > 0 ? Math.min((spent / totalBudget) * 100, 100) : 0;
        const isOverBudget = spent > totalBudget;
        const remaining = totalBudget - spent;

        return (
          <Card key={budget.id} className={cn(
            "hover:shadow-md transition-shadow cursor-pointer",
            isOverBudget ? "border-red-200 bg-red-50/50" : percentage > 80 ? "border-amber-200 bg-amber-50/50" : "border-green-200 bg-green-50/50"
          )}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-1">{budget.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <span className="capitalize">{budget.period}</span>
                    •
                    <span>{budget.category ? budget.category.name : 'General'}</span>
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={route('budgets.show', budget.id)} className="flex items-center">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(budget)} className="flex items-center cursor-pointer">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Budget
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={route('budgets.comparison', budget.id)} className="flex items-center">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Compare & Analyze
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Budget Amount and Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{formatCurrency(spent)} spent</span>
                  <span className="text-muted-foreground">of {formatCurrency(totalBudget)}</span>
                </div>
                <Progress 
                  value={percentage} 
                  className={cn(
                    "h-3",
                    isOverBudget ? "bg-red-100" : percentage > 80 ? "bg-amber-100" : "bg-green-100"
                  )}
                  indicatorClassName={cn(
                    isOverBudget ? "bg-red-500" : percentage > 80 ? "bg-amber-500" : "bg-green-500"
                  )}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{Math.round(percentage)}% used</span>
                  <span className={cn(
                    "font-medium",
                    remaining < 0 ? "text-red-600" : "text-green-600"
                  )}>
                    {remaining < 0 ? `${formatCurrency(Math.abs(remaining))} over` : `${formatCurrency(remaining)} left`}
                  </span>
                </div>
              </div>

              {/* Budget Details */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <div className="text-xs text-muted-foreground">Method</div>
                  <Badge variant="outline" className="text-xs capitalize mt-1">
                    {budget.budget_method === 'standard' ? 'Standard' : budget.budget_method}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Rollover</div>
                  <div className="mt-1">
                    {budget.rollover_enabled ? (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Enabled
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Disabled</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Time Period */}
              {budget.start_date && budget.end_date && (
                <div className="text-xs text-muted-foreground border-t pt-2">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {format(new Date(budget.start_date), 'MMM dd')} - {format(new Date(budget.end_date), 'MMM dd, yyyy')}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                asChild
              >
                <Link href={route('budgets.show', budget.id)}>
                  View Budget
                  <ArrowUpRightIcon className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

// Keep the table view as an option
function BudgetTableList({ budgets, onEdit, formatCurrency }) {
  return (
    <div className="grid grid-cols-1 gap-6">
      {budgets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No budgets found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>A list of your budgets</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Time Frame</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Rollover</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget) => {
                const utilization = budget.utilization;
                const spent = utilization?.spent || 0;
                const totalBudget = utilization?.total_budget || budget.amount;
                // Calculate percentage directly from amounts, not relying on pre-calculated percentage
                const calculatedPercentage = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;
                const percentage = Math.min(Math.round(calculatedPercentage), 100);
                const displayPercentage = calculatedPercentage > 100 ? Math.round(calculatedPercentage) : percentage;
                const isOverBudget = spent > totalBudget;

                return (
                  <TableRow key={budget.id}>
                    <TableCell className="font-medium">{budget.name}</TableCell>
                    <TableCell>{budget.category ? budget.category.name : 'General'}</TableCell>
                    <TableCell className="capitalize">{budget.period}</TableCell>
                    <TableCell>
                      {budget.start_date && budget.end_date ? (
                        <span className="text-sm text-gray-700">
                          {format(new Date(budget.start_date), 'MMM dd')} - {format(new Date(budget.end_date), 'MMM dd, yyyy')}
                        </span>
                      ) : (
                        <span className="text-gray-500">Ongoing</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(utilization?.total_budget || budget.amount)}
                      {budget.rollover_enabled && budget.rollover_amount > 0 && (
                        <div className="text-xs text-gray-500">
                          (includes {formatCurrency(budget.rollover_amount)} rollover)
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="w-40">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Progress 
                            value={percentage} 
                            className={cn(
                              "h-3 w-full",
                              isOverBudget ? "bg-red-100" : "bg-gray-200"
                            )}
                            indicatorClassName={cn(
                              "transition-all duration-300",
                              isOverBudget ? "bg-red-500" : percentage > 80 ? "bg-amber-500" : percentage > 60 ? "bg-yellow-500" : "bg-green-500"
                            )}
                          />
                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>{isOverBudget ? displayPercentage : percentage}%</span>
                            <span className={cn(
                              "font-medium",
                              isOverBudget ? "text-red-600" : "text-gray-600"
                            )}>
                              {formatCurrency(spent)} / {formatCurrency(totalBudget)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {budget.budget_method !== 'standard' ? (
                        <Badge variant="outline" className="capitalize">
                          {budget.budget_method}
                        </Badge>
                      ) : (
                        <span className="text-gray-500">Standard</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {budget.enable_rollover ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Enabled
                        </Badge>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {utilization?.variance !== undefined && (
                        <Badge
                          variant="outline"
                          className={cn(
                            utilization.variance < 0
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-green-50 text-green-700 border-green-200"
                          )}
                        >
                          {utilization.variance > 0 ? '+' : ''}
                          {formatCurrency(utilization.variance)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={route('budgets.show', budget.id)} className="flex items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(budget)} className="flex items-center cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link 
                                href={route('budgets.comparison', budget.id)} 
                                className={cn(
                                  "flex items-center",
                                  utilization?.variance < 0 ? "text-red-600" : "text-green-600"
                                )}
                              >
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Compare
                                {utilization?.variance_percent && (
                                  <span className="ml-1 text-xs">
                                    ({utilization.variance_percent > 0 ? '+' : ''}
                                    {Math.round(utilization.variance_percent)}%)
                                  </span>
                                )}
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
