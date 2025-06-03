import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Plus,
  DollarSign,
  Calendar,
  Percent
} from 'lucide-react';
import DebtList from './components/DebtList';
import CreditorModal from '@/components/Creditors/CreditorModal';
import { useCurrency } from '@/hooks/useCurrency.jsx';

export default function Index({ auth, debts }) {
  const [isCreditorModalOpen, setIsCreditorModalOpen] = useState(false);
  const [selectedCreditor, setSelectedCreditor] = useState(null);
  const { formatCurrency } = useCurrency();

  const totalDebt = debts.reduce((sum, debt) => sum + parseFloat(debt.amount_owed || debt.balance || 0), 0);
  const totalMinimumPayments = debts.reduce((sum, debt) => sum + parseFloat(debt.minimum_payment || 0), 0);
  const averageInterestRate = debts.length > 0 
    ? (debts.reduce((sum, debt) => sum + parseFloat(debt.interest_rate || 0), 0) / debts.length).toFixed(2)
    : 0;
  const monthlyInterest = debts.reduce((sum, debt) => {
    const balance = parseFloat(debt.amount_owed || debt.balance || 0);
    const rate = parseFloat(debt.interest_rate || 0);
    return sum + (balance * (rate / 100 / 12));
  }, 0);

  // Get high interest debts (>= 15%)
  const highInterestDebts = debts.filter(debt => parseFloat(debt.interest_rate || 0) >= 15);

  const openAddModal = () => {
    setSelectedCreditor(null);
    setIsCreditorModalOpen(true);
  };

  const openEditModal = (creditor) => {
    setSelectedCreditor(creditor);
    setIsCreditorModalOpen(true);
  };

  const closeModal = () => {
    setIsCreditorModalOpen(false);
    setSelectedCreditor(null);
  };

  return (
    <SidebarProvider>
      <Head title="Debt Management" />
      <AppSidebar />
      
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold">Debt Management</BreadcrumbPage>
              </BreadcrumbItem>
            </Breadcrumb>
          </div>
          <div className="ml-auto mr-4 flex items-center gap-2 flex-shrink-0">
            <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add New Debt
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Debt
                </CardTitle>
                <CreditCard className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalDebt)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {debts.length} debt{debts.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Monthly Payments
                </CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalMinimumPayments)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum required
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Interest
                </CardTitle>
                <Percent className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {averageInterestRate}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all debts
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Monthly Interest
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(monthlyInterest)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Interest cost per month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* High Interest Alert */}
          {highInterestDebts.length > 0 && (
            <Card className="border-l-4 border-l-red-500 bg-red-50/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <CardTitle className="text-red-700">High Interest Alert</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-red-600 mb-3">
                  You have {highInterestDebts.length} debt{highInterestDebts.length !== 1 ? 's' : ''} with interest rates ≥ 15%. 
                  Consider prioritizing these for faster payoff.
                </p>
                <div className="flex flex-wrap gap-2">
                  {highInterestDebts.map(debt => (
                    <Badge key={debt.id} variant="destructive" className="text-xs">
                      {debt.name}: {debt.interest_rate}%
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Debts List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Your Debts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {debts.length > 0 ? (
                <DebtList debts={debts} onEditDebt={openEditModal} />
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No debts found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Start managing your debts by adding your first entry.</p>
                  <Button onClick={openAddModal}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Debt
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Creditor Modal */}
        <CreditorModal
          isOpen={isCreditorModalOpen}
          onClose={closeModal}
          creditor={selectedCreditor}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}