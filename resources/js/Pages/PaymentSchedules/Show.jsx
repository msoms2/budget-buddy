import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast.js';
import { format } from 'date-fns';
import { AlertCircle, ArrowLeft, Calendar, CheckCircle, CreditCard, Edit, Repeat, Trash, XCircle } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app-sidebar';
import axios from 'axios';
import { useCurrency } from '@/hooks/useCurrency.jsx';

export default function Show({ paymentSchedule }) {
  const { toast } = useToast();
  const { flash } = usePage().props;
  const [isDeleting, setIsDeleting] = useState(false);
  const { formatCurrency } = useCurrency();
  
  // Show toast for flash messages
  React.useEffect(() => {
    if (flash.success) {
      toast({
        title: "Success",
        description: flash.success,
        variant: "success",
      });
    } else if (flash.error) {
      toast({
        title: "Error",
        description: flash.error,
        variant: "destructive",
      });
    }
  }, [flash]);

  // Process payment function
  const processPayment = async () => {
    try {
      await axios.post(route('payment-schedules.process', paymentSchedule.id));
      
      toast({
        title: "Success",
        description: "Payment processed successfully!",
        variant: "success",
      });
      
      // Redirect to the index page
      window.location.href = route('payment-schedules.index');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment.",
        variant: "destructive",
      });
    }
  };

  // Cancel payment function
  const cancelPayment = async () => {
    try {
      await axios.post(route('payment-schedules.cancel', paymentSchedule.id));
      
      toast({
        title: "Success",
        description: "Payment cancelled successfully!",
        variant: "success",
      });
      
      // Redirect to the index page
      window.location.href = route('payment-schedules.index');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel payment.",
        variant: "destructive",
      });
    }
  };

  // Delete payment schedule function
  const deletePaymentSchedule = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(route('payment-schedules.destroy', paymentSchedule.id));
      
      toast({
        title: "Success",
        description: "Payment schedule deleted successfully!",
        variant: "success",
      });
      
      // Redirect to the index page
      window.location.href = route('payment-schedules.index');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete payment schedule.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Cancelled</Badge>;
      case 'overdue':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <SidebarProvider>
      <Head title={`${paymentSchedule.name} - Payment Schedule`} />
      <AppSidebar />

      <SidebarInset>
        <div className="container mx-auto py-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Button variant="outline" size="icon" asChild className="mr-4">
                <Link href={route('payment-schedules.index')}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">{paymentSchedule.name}</h1>
                <p className="text-gray-500">Payment Schedule Details</p>
              </div>
            </div>

            <div className="flex space-x-3">
              {paymentSchedule.status === 'pending' && (
                <>
                  <Button onClick={processPayment} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Process Payment
                  </Button>
                  <Button onClick={cancelPayment} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Payment
                  </Button>
                </>
              )}
              <Button variant="outline" asChild>
                <Link href={route('payment-schedules.edit', paymentSchedule.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Payment Schedule</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this payment schedule? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deletePaymentSchedule} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                      {isDeleting ? 'Deleting...' : 'Delete Payment'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>
                    Information about this scheduled payment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Name</h3>
                      <p className="mt-1 text-base">{paymentSchedule.name}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                      <p className="mt-1 text-base font-semibold">
                        {formatCurrency(paymentSchedule.amount)}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                      <p className="mt-1 text-base">
                        {format(new Date(paymentSchedule.due_date), 'MMMM d, yyyy')}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Reminder Date</h3>
                      <p className="mt-1 text-base">
                        {paymentSchedule.reminder_date 
                          ? format(new Date(paymentSchedule.reminder_date), 'MMMM d, yyyy')
                          : 'Not set'
                        }
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <p className="mt-1">{getStatusBadge(paymentSchedule.status)}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Recipient/Payee</h3>
                      <p className="mt-1 text-base">{paymentSchedule.recipient || 'Not specified'}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Category</h3>
                      <p className="mt-1 text-base">
                        {paymentSchedule.category?.name || 'Uncategorized'}
                        {paymentSchedule.subcategory && (
                          <span className="ml-2 text-gray-400">
                            &rsaquo; {paymentSchedule.subcategory.name}
                          </span>
                        )}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                      <p className="mt-1 text-base">
                        {paymentSchedule.payment_method?.name || 'Not specified'}
                      </p>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1 text-base">
                        {paymentSchedule.description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Recurring Information</CardTitle>
                  <CardDescription>
                    Schedule and payment processing settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <div className="mr-3">
                      {paymentSchedule.is_recurring ? (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Repeat className="h-5 w-5 text-blue-600" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {paymentSchedule.is_recurring ? 'Recurring Payment' : 'One-Time Payment'}
                      </h3>
                      {paymentSchedule.is_recurring && (
                        <p className="text-gray-500 text-sm">
                          {paymentSchedule.frequency.charAt(0).toUpperCase() + paymentSchedule.frequency.slice(1)} payment
                        </p>
                      )}
                    </div>
                  </div>

                  {paymentSchedule.is_recurring && (
                    <>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Frequency</h3>
                        <p className="mt-1 text-base capitalize">{paymentSchedule.frequency}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                        <p className="mt-1 text-base">
                          {paymentSchedule.recurring_end_date 
                            ? format(new Date(paymentSchedule.recurring_end_date), 'MMMM d, yyyy')
                            : 'Ongoing (no end date)'
                          }
                        </p>
                      </div>
                    </>
                  )}

                  <div className="flex items-center pt-2">
                    <div className="mr-3">
                      <div className={`h-10 w-10 rounded-full ${paymentSchedule.auto_process ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                        <CreditCard className={`h-5 w-5 ${paymentSchedule.auto_process ? 'text-green-600' : 'text-gray-600'}`} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {paymentSchedule.auto_process ? 'Automatic Processing' : 'Manual Processing'}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {paymentSchedule.auto_process 
                          ? 'Expense will be created automatically on the due date' 
                          : 'You need to manually process this payment'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link href={route('payment-schedules.edit', paymentSchedule.id)}>
                        <Edit className="mr-3 h-4 w-4" />
                        Edit Payment Schedule
                      </Link>
                    </Button>

                    {paymentSchedule.status === 'pending' && (
                      <>
                        <Button onClick={processPayment} className="w-full bg-green-600 hover:bg-green-700 justify-start">
                          <CheckCircle className="mr-3 h-4 w-4" />
                          Process Now
                        </Button>

                        <Button onClick={cancelPayment} variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50 justify-start">
                          <XCircle className="mr-3 h-4 w-4" />
                          Cancel Payment
                        </Button>
                      </>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full justify-start">
                          <Trash className="mr-3 h-4 w-4" />
                          Delete Payment Schedule
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Payment Schedule</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this payment schedule? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={deletePaymentSchedule} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                            {isDeleting ? 'Deleting...' : 'Delete Payment'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}

Show.layout = page => <AuthenticatedLayout>{page}</AuthenticatedLayout>;