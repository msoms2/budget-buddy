import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {
  PlusIcon,
  PiggyBankIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  ClockIcon,
  TargetIcon,
  DollarSignIcon,
  CalendarIcon,
  EditIcon,
  TrashIcon,
  ArrowLeftIcon,
  HistoryIcon
} from "lucide-react";
import { useCurrency } from '@/hooks/useCurrency.jsx';
import ProgressModal from './Partials/ProgressModal';
import SavingsModal from './Partials/SavingsModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

export default function Show({ auth, saving, transactions }) {
  const { formatCurrency } = useCurrency();
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Calculate progress percentage
  const progressPercentage = saving.target_amount > 0 
    ? Math.min(100, (saving.current_amount / saving.target_amount) * 100)
    : 0;

  // Calculate remaining amount
  const remainingAmount = Math.max(0, saving.target_amount - saving.current_amount);

  // Calculate days remaining
  const getDaysRemaining = () => {
    const target = new Date(saving.target_date);
    const today = new Date();
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysRemaining();

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon };
      case 'active':
        return { color: 'bg-blue-100 text-blue-800', icon: ClockIcon };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800', icon: TrashIcon };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: ClockIcon };
    }
  };

  const statusInfo = getStatusInfo(saving.status);
  const StatusIcon = statusInfo.icon;

  const handleDelete = () => {
    router.delete(route('savings.destroy', saving.id), {
      onSuccess: () => {
        // Redirect handled by controller
      }
    });
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 min-h-screen">
      <SidebarProvider>
        <Head title={`${saving.name} - Savings Plan`} />
        <AppSidebar />

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={route('savings.index')}>Savings</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{saving.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex gap-2 px-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1"
              >
                <EditIcon className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-1 text-red-600 hover:text-red-700"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </Button>
              <Link href={route('savings.index')}>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back to Savings
                </Button>
              </Link>
            </div>
          </header>

          <div className="flex flex-1 flex-col p-4 space-y-6">
            {/* Main Savings Info Card */}
            <Card className="bg-white dark:bg-gray-800/50 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
                      <PiggyBankIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">{saving.name}</CardTitle>
                      <CardDescription className="text-base mt-1">
                        {saving.description || 'No description provided'}
                      </CardDescription>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {saving.status.charAt(0).toUpperCase() + saving.status.slice(1)}
                        </Badge>
                        {saving.category && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Category: {saving.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Target Date</div>
                    <div className="text-lg font-semibold flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      {formatDate(saving.target_date)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {daysRemaining > 0 
                        ? `${daysRemaining} days remaining`
                        : daysRemaining === 0 
                        ? 'Due today'
                        : `${Math.abs(daysRemaining)} days overdue`
                      }
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Progress Overview</h3>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  
                  <Progress value={progressPercentage} className="h-3" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <DollarSignIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Current Amount</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {formatCurrency(saving.current_amount)}
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TargetIcon className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-300">Target Amount</span>
                      </div>
                      <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {formatCurrency(saving.target_amount)}
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUpIcon className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Remaining</span>
                      </div>
                      <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                        {formatCurrency(remainingAmount)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {saving.status === 'active' && (
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={() => setShowProgressModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Progress
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transactions History */}
            <Card className="bg-white dark:bg-gray-800/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HistoryIcon className="h-5 w-5" />
                  Transaction History
                </CardTitle>
                <CardDescription>
                  Track all progress updates and related transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((transaction, index) => (
                      <div key={transaction.id || index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${transaction.is_category_expense ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                            {transaction.is_category_expense ? (
                              <DollarSignIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            ) : (
                              <TrendingUpIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{transaction.notes}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(transaction.transaction_date)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600 dark:text-green-400">
                            +{formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <HistoryIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No transaction history yet</p>
                    <p className="text-sm text-gray-400">Progress updates will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Modals */}
          {showProgressModal && (
            <ProgressModal
              isOpen={showProgressModal}
              onClose={() => setShowProgressModal(false)}
              savings={saving}
            />
          )}

          {showEditModal && (
            <SavingsModal
              isOpen={showEditModal}
              onClose={() => setShowEditModal(false)}
              savings={saving}
              categories={[]} // Pass categories if available
            />
          )}

          {showDeleteModal && (
            <DeleteConfirmationModal
              isOpen={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              onConfirm={handleDelete}
              title="Delete Savings Plan"
              message={`Are you sure you want to delete "${saving.name}"? This action cannot be undone.`}
            />
          )}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}