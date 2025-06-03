import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  CheckCircle,
  Calendar,
  ClockIcon,
  DollarSign,
  Plus,
  RefreshCw,
  SearchIcon,
  TagIcon,
  MoreHorizontal,
  XCircle,
  BellIcon,
} from "lucide-react";
import { format, isAfter } from 'date-fns';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast.js';
import { useCurrency } from '@/hooks/useCurrency';
import PaymentScheduleSheet from '../Transactions/Partials/PaymentScheduleSheet';
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function PaymentSchedules({
  auth,
  schedules = [],
  categories = [],
  currencies = [],
  paymentMethods = [],
  stats = {
    upcoming: 0,
    overdue: 0,
    recurring: 0,
    completed: 0
  }
}) {
  const { toast } = useToast();
  const { flash = {} } = usePage().props;
  
  // Filter states
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Show toast for flash messages
  useEffect(() => {
    if (flash?.success) {
      toast({
        title: "Success",
        description: flash.success,
        variant: "success",
      });
    } else if (flash?.error) {
      toast({
        title: "Error",
        description: flash.error,
        variant: "destructive",
      });
    }
  }, [flash]);

  // Use global currency formatter
  const { formatCurrency } = useCurrency();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      completed: 'success',
      cancelled: 'destructive',
      overdue: 'destructive',
      recurring: 'secondary'
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      biweekly: 'Bi-weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      biannually: 'Bi-annually',
      annually: 'Annually',
      'one-time': 'One-time'
    };
    return labels[frequency] || frequency;
  };

  // Filter schedules based on active tab and search term
  const filteredSchedules = schedules.filter(schedule => {
    // Apply tab filter
    if (activeTab === 'upcoming' && (!schedule.due_date || isAfter(new Date(schedule.due_date), new Date()))) return false;
    if (activeTab === 'overdue' && (!schedule.due_date || !isAfter(new Date(), new Date(schedule.due_date)))) return false;
    if (activeTab === 'recurring' && !schedule.is_recurring) return false;
    if (activeTab === 'completed' && schedule.status !== 'completed') return false;
    
    // Apply search filter
    if (searchTerm && !schedule.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !schedule.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Apply type filter
    if (typeFilter !== 'all' && schedule.type !== typeFilter) {
      return false;
    }
    
    return true;
  });

  // Handle schedule actions
  const processSchedule = (scheduleId) => {
    router.post(route('transactions.schedules.process', scheduleId), {}, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Payment processed successfully",
          variant: "success",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to process payment",
          variant: "destructive",
        });
      }
    });
  };

  const cancelSchedule = (scheduleId) => {
    router.post(route('transactions.schedules.cancel', scheduleId), {}, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Payment schedule cancelled",
          variant: "success",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to cancel payment schedule",
          variant: "destructive",
        });
      }
    });
  };

  const deleteSchedule = (scheduleId) => {
    if (confirm('Are you sure you want to delete this payment schedule?')) {
      router.delete(route('transactions.schedules.destroy', scheduleId), {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Payment schedule deleted",
            variant: "success",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete payment schedule",
            variant: "destructive",
          });
        }
      });
    }
  };

  const editSchedule = (scheduleId) => {
    router.get(route('transactions.schedules.edit', scheduleId));
  };

  return (
    <div>
      <SidebarProvider>
        <Head title="Payment Schedules" />
        <AppSidebar />
        
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={route('transactions.index')}>Transactions</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Payment Schedules</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="flex gap-4 px-4">
              <Button onClick={() => setIsSheetOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            </div>
          </header>
          
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Upcoming</p>
                      <h3 className="text-2xl font-bold">{stats.upcoming}</h3>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <CalendarIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-amber-50 to-amber-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Overdue</p>
                      <h3 className="text-2xl font-bold">{stats.overdue}</h3>
                    </div>
                    <div className="bg-amber-100 p-3 rounded-full">
                      <AlertCircle className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Recurring</p>
                      <h3 className="text-2xl font-bold">{stats.recurring}</h3>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <RefreshCw className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Completed</p>
                      <h3 className="text-2xl font-bold">{stats.completed}</h3>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
                <TabsTrigger value="recurring">Recurring</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payment schedules..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="expense">Expenses</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <TabsContent value={activeTab} className="mt-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSchedules.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No payment schedules found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSchedules.map(schedule => (
                          <TableRow key={schedule.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{schedule.name}</div>
                                {schedule.description && (
                                  <div className="text-sm text-muted-foreground line-clamp-1">
                                    {schedule.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                {formatDate(schedule.due_date)}
                              </div>
                              {schedule.reminder_date && (
                                <div className="text-xs text-muted-foreground flex items-center mt-1">
                                  <BellIcon className="mr-1 h-3 w-3" />
                                  Reminder: {formatDate(schedule.reminder_date)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell className={`font-medium ${schedule.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                              <div className="flex items-center">
                                {formatCurrency(schedule.amount)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {schedule.is_recurring ? (
                                <div>
                                  <Badge variant="secondary">
                                    {getFrequencyLabel(schedule.frequency)}
                                  </Badge>
                                  {schedule.recurring_end_date && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Until {formatDate(schedule.recurring_end_date)}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <Badge variant="outline">One-time</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(schedule.status)}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {schedule.status === 'pending' && (
                                    <DropdownMenuItem onClick={() => processSchedule(schedule.id.replace('schedule-', ''))}>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Process Now
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => editSchedule(schedule.id.replace('schedule-', ''))}>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Edit Schedule
                                  </DropdownMenuItem>
                                  {schedule.status === 'pending' && (
                                    <DropdownMenuItem onClick={() => cancelSchedule(schedule.id.replace('schedule-', ''))}>
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Cancel Schedule
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => deleteSchedule(schedule.id.replace('schedule-', ''))}>
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Delete Schedule
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
        
        <PaymentScheduleSheet 
          isOpen={isSheetOpen} 
          onClose={() => setIsSheetOpen(false)} 
          categories={categories}
          currencies={currencies}
          paymentMethods={paymentMethods}
        />
        <Toaster />
      </SidebarProvider>
    </div>
  );
}