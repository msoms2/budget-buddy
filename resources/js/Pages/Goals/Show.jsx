import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCurrency } from '@/hooks/useCurrency.jsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import SavingsCalculator from './components/SavingsCalculator';
import ProgressModal from './components/ProgressModal';
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
  CalendarIcon,
  TargetIcon,
  PlusIcon,
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrendingUpIcon,
  DollarSignIcon,
  BarChart3Icon,
  ChevronRightIcon,
  PencilIcon,
  ArrowUpRightIcon
} from 'lucide-react';

export default function Show({ auth, goal, transactions }) {
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressCounter, setProgressCounter] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 6; // Show 6 transactions per page
  const { formatCurrency } = useCurrency();
  
  // Get current transactions for pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);
  
  // Pagination controls
  const goToPreviousPage = () => {
    setCurrentPage(currentPage => Math.max(1, currentPage - 1));
  };
  
  const goToNextPage = () => {
    setCurrentPage(currentPage => Math.min(totalPages, currentPage + 1));
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    const targetDate = new Date(goal.target_date);
    const today = new Date();
    return Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate progress percentage (updated to include both direct and category transactions)
  const progressPercentage = goal.total_progress_percentage || Math.round((goal.current_amount / goal.target_amount) * 100);
  const daysRemaining = getDaysRemaining();
  
  const openProgressModal = () => {
    setShowProgressModal(true);
  };

  const closeProgressModal = () => {
    setShowProgressModal(false);
  };

  // Get appropriate icon and color based on goal status
  const getStatusDetails = () => {
    switch (goal.status) {
      case 'active':
        return {
          icon: <ClockIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          borderColor: 'border-blue-300 dark:border-blue-700',
          badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
          message: "You're on your way to achieving this goal!"
        };
      case 'completed':
        return {
          icon: <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" />,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          borderColor: 'border-green-300 dark:border-green-700',
          badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
          message: "Congratulations! Goal achieved!"
        };
      case 'cancelled':
        return {
          icon: <XCircleIcon className="h-6 w-6 text-red-500 dark:text-red-400" />,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          borderColor: 'border-red-300 dark:border-red-700',
          badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
          message: "This goal has been cancelled"
        };
      default:
        return {
          icon: <TargetIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-800/50',
          borderColor: 'border-gray-300 dark:border-gray-700',
          badgeClass: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
          message: "Goal status unknown"
        };
    }
  };

  const statusDetails = getStatusDetails();

  return (
    <SidebarProvider>
      <Head title={`Goal: ${goal.title}`} />
      <AppSidebar />

      <SidebarInset className="bg-slate-50 dark:bg-slate-900/50 min-h-screen">
        {/* Header with breadcrumb and action buttons */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={route('goals.index')}>
                    Goals
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{goal.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex gap-3 px-4">
            <Button variant="outline" asChild size="sm" className="gap-1">
              <Link href={route('goals.index')}>
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Goals
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700">
              <Link href={route('goals.edit', goal.id)}>
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit Goal
              </Link>
            </Button>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-6 p-4">
          {/* Goal Hero Banner */}
          <Card className={`bg-gradient-to-r from-${goal.status === 'active' ? 'blue' : goal.status === 'completed' ? 'green' : 'red'}-50 to-white dark:from-${goal.status === 'active' ? 'blue' : goal.status === 'completed' ? 'green' : 'red'}-950/20 dark:to-transparent border-l-4 ${goal.status === 'active' ? 'border-l-blue-500 dark:border-l-blue-600' : goal.status === 'completed' ? 'border-l-green-500 dark:border-l-green-600' : 'border-l-red-500 dark:border-l-red-600'} overflow-hidden shadow-sm`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${statusDetails.bgColor} border-2 ${statusDetails.borderColor}`}>
                    {statusDetails.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className={`text-2xl font-bold ${statusDetails.color}`}>{goal.title}</h2>
                      <Badge className={`capitalize ${statusDetails.badgeClass}`}>
                        {goal.status}
                      </Badge>
                    </div>
                    
                    {goal.category && (
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <span className="mr-2">Category:</span>
                        <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50">
                          {goal.category.name}
                        </Badge>
                      </div>
                    )}
                    
                    {goal.description && (
                      <p className="text-gray-600 dark:text-gray-300 mt-3 mb-4 max-w-xl">{goal.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Goal Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-gray-800/50">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Target Amount</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{formatCurrency(goal.target_amount)}</p>
                  </div>
                  <div className={`p-2 rounded-full ${statusDetails.bgColor}`}>
                    <TargetIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800/50">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Progress</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(goal.total_amount || goal.current_amount)}</p>
                  </div>
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <BarChart3Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800/50">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                      {goal.status === 'completed' 
                        ? formatCurrency(0) 
                        : formatCurrency(Math.max(0, goal.target_amount - (goal.total_amount || goal.current_amount)))}
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <DollarSignIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800/50">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Target Date</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{formatDate(goal.target_date)}</p>
                  </div>
                  <div className={`p-2 rounded-full ${daysRemaining < 14 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                    <CalendarIcon className={`h-5 w-5 ${daysRemaining < 14 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Progress Card with Combined Stats */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5 text-blue-500" />
                <CardTitle>Goal Progress</CardTitle>
              </div>
              <CardDescription>
                Track your progress towards the target amount
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Total Progress</p>
                    <span className="text-sm font-medium">
                      {goal.total_progress_percentage || progressPercentage}%
                    </span>
                  </div>
                  <Progress value={goal.total_progress_percentage || progressPercentage} className="h-2" />
                </div>
                
                {goal.category && (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Direct Goal Contributions</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(goal.direct_amount || 0)}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Category Earnings</p>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(goal.category_amount || 0)}</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-2 bg-gray-50 dark:bg-gray-800/50 rounded p-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Total Contributions</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(goal.total_amount || goal.current_amount)} 
                      <span className="text-xs text-gray-500 ml-1">/ {formatCurrency(goal.target_amount)}</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Transactions and Savings Calculator */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-1">
              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3Icon className="h-5 w-5 text-blue-500" />
                      <div>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>
                          Record of contributions to your goal
                        </CardDescription>
                      </div>
                    </div>
                    {goal.status === 'active' && (
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 gap-1"
                        onClick={openProgressModal}
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Progress
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="overflow-auto min-h-0">
                  {transactions.length > 0 ? (
                    <div className="transaction-table-container">
                      <Table className="transaction-table">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[20%]">Date</TableHead>
                            <TableHead className="w-[20%]">Amount</TableHead>
                            <TableHead className="w-[25%]">Source</TableHead>
                            <TableHead className="w-[35%]">Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentTransactions.map(transaction => (
                            <TableRow key={transaction.id} className="transaction-row">
                              <TableCell>
                                {formatDate(transaction.transaction_date)}
                              </TableCell>
                              <TableCell className={`font-medium ${transaction.amount >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                {formatCurrency(transaction.amount)}
                              </TableCell>
                              <TableCell>
                                {transaction.is_category_expense ? (
                                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                    Category Expense
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    Direct Goal Payment
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-sm truncate max-w-[200px]">{transaction.notes || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-slate-50">
                      <div className="bg-blue-100 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-3">
                        <BarChart3Icon className="h-6 w-6 text-blue-500" />
                      </div>
                      <h3 className="text-base font-semibold mb-1">No progress recorded yet</h3>
                      <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                        Start tracking your progress towards this goal by adding your first contribution.
                      </p>
                      {goal.status === 'active' && (
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={openProgressModal}
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add First Contribution
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between py-3">
                  <div className="text-sm text-gray-500">
                    Showing {indexOfFirstTransaction + 1}-{Math.min(indexOfLastTransaction, transactions.length)} of {transactions.length} transactions
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>

            <div className="md:col-span-1">
              {/* SavingsCalculator already has h-full and flex-col applied internally */}
              <SavingsCalculator 
                goalId={goal.id} 
                isCompleted={goal.status === 'completed'} 
                progressCounter={progressCounter}
              />
            </div>
          </div>

          {/* Progress Modal - Initially hidden */}
          <ProgressModal 
            isOpen={showProgressModal}
            onClose={closeProgressModal}
            goal={goal}
            onSuccessfulSubmit={() => setProgressCounter(prevCounter => prevCounter + 1)}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}