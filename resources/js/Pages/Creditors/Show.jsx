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
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Edit, 
  ArrowLeft, 
  DollarSign, 
  Percent, 
  Calendar, 
  Phone, 
  User, 
  FileText,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import RepaymentStrategyComparison from './components/RepaymentStrategyComparison';
import InterestCalculator from './components/InterestCalculator';
import CreditorModal from '@/components/Creditors/CreditorModal';
import { useCurrency } from '@/hooks/useCurrency.jsx';

export default function Show({ auth, creditor, allDebts }) {
  const [isCreditorModalOpen, setIsCreditorModalOpen] = useState(false);
  const { formatCurrency } = useCurrency();
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const openEditModal = () => {
    setIsCreditorModalOpen(true);
  };

  const closeModal = () => {
    setIsCreditorModalOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'paid':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Paid Off</Badge>;
      case 'defaulted':
        return <Badge variant="destructive">Defaulted</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getInterestRateBadge = (rate) => {
    const numRate = parseFloat(rate || 0);
    if (numRate >= 20) {
      return <Badge variant="destructive">{numRate}%</Badge>;
    } else if (numRate >= 15) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">{numRate}%</Badge>;
    } else if (numRate >= 10) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{numRate}%</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">{numRate}%</Badge>;
    }
  };

  const monthlyInterest = (parseFloat(creditor.amount_owed || creditor.balance || 0) * parseFloat(creditor.interest_rate || 0)) / 100 / 12;
  const isHighInterest = parseFloat(creditor.interest_rate || 0) >= 15;

  return (
    <SidebarProvider>
      <Head title={`Debt Details - ${creditor.name}`} />
      <AppSidebar />
      
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb className="whitespace-nowrap overflow-hidden flex-shrink min-w-0">
              <BreadcrumbList className="flex-nowrap overflow-hidden">
                <BreadcrumbItem className="overflow-hidden text-ellipsis">
                  <BreadcrumbLink href={route('creditors.index')} className="text-muted-foreground hover:text-foreground">
                    Debt Management
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="overflow-hidden text-ellipsis">
                  <BreadcrumbPage className="font-semibold flex items-center gap-1 max-w-[200px] truncate">
                    <CreditCard className="h-4 w-4 flex-shrink-0" />
                    {creditor.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto mr-4 flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" onClick={openEditModal}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Debt
            </Button>
            <Button variant="outline" asChild>
              <Link href={route('creditors.index')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to List
              </Link>
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* High Interest Warning */}
          {isHighInterest && (
            <Card className="border-l-4 border-l-red-500 bg-red-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <CardTitle className="text-red-700">High Interest Rate</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-red-600">
                  This debt has a high interest rate of {creditor.interest_rate}%. 
                  Consider prioritizing this debt for faster payoff to save on interest costs.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Main Information */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Basic Debt Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Debt Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Creditor Name</p>
                    <p className="text-lg font-semibold">{creditor.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                    <div>{getStatusBadge(creditor.status)}</div>
                  </div>
                </div>

                {creditor.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{creditor.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Current Balance</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(creditor.amount_owed || creditor.balance || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Minimum Payment</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(creditor.minimum_payment || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Interest Rate</p>
                      <div>{getInterestRateBadge(creditor.interest_rate)}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Monthly Interest</p>
                      <p className="text-lg font-semibold text-orange-600">
                        {formatCurrency(monthlyInterest)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Details */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Payment Frequency</p>
                    <p className="text-sm capitalize">
                      {creditor.payment_frequency || 'Monthly'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Next Due Date</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm">{formatDate(creditor.due_date)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Contact Info</p>
                  <p className="text-sm">{creditor.contact_info || 'Not provided'}</p>
                </div>
                {creditor.account_number && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Account Number</p>
                    <p className="text-sm font-mono">{creditor.account_number}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes Section */}
          {creditor.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{creditor.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Interest Calculator */}
          <InterestCalculator debt={creditor} />

          {/* Repayment Strategy Comparison */}
          {allDebts && allDebts.length > 1 && (
            <RepaymentStrategyComparison
              debts={allDebts}
              monthlyPayment={allDebts.reduce(
                (sum, debt) => sum + parseFloat(debt.minimum_payment || 0),
                0
              )}
            />
          )}
        </div>
      </SidebarInset>

      {/* Creditor Modal */}
      <CreditorModal
        isOpen={isCreditorModalOpen}
        onClose={closeModal}
        creditor={creditor}
      />
    </SidebarProvider>
  );
}