import * as React from "react";
import { useState } from "react";
import { Head, router } from "@inertiajs/react";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import InvestmentList from "@/components/Investments/InvestmentList";
import InvestmentForm from "@/components/Investments/InvestmentForm";
import PerformanceChart from "@/components/Investments/PerformanceChart";
import AssetAllocationChart from "@/components/Investments/AssetAllocationChart";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useCurrency } from "@/hooks/useCurrency";
import { 
  PlusIcon,
  TrendingUpIcon, 
  TrendingDownIcon, 
  DollarSignIcon,
  Briefcase,
  BarChart3,
  ArrowUpRightIcon,
  Target,
  Activity,
  Eye,
  Pencil,
  MoreHorizontal,
  TrendingUp,
  PieChart
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@inertiajs/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Index({ investments, categories, metrics, performance_data, asset_allocation }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [investmentToDelete, setInvestmentToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const { formatCurrency } = useCurrency();

  // Safety check for formatCurrency
  const safeFormatCurrency = (amount) => {
    try {
      if (typeof formatCurrency === 'function') {
        return formatCurrency(amount);
      }
      // Fallback formatting if formatCurrency is not available
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount || 0);
    } catch (err) {
      console.error('Currency formatting error:', err);
      return '0.00';
    }
  };

  const handleEdit = (investment) => {
    setSelectedInvestment(investment);
    setIsFormOpen(true);
  };

  const handleDelete = (investmentId) => {
    setInvestmentToDelete(investmentId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    router.delete(route("investments.destroy", investmentToDelete), {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setInvestmentToDelete(null);
      },
    });
  };

  const openCreateInvestmentModal = () => {
    setSelectedInvestment(null);
    setIsFormOpen(true);
  };

  // Calculate portfolio statistics using fixed metrics from backend
  const totalValue = metrics?.total_value || 0;
  const totalInvested = metrics?.total_invested || 0;
  const totalGainLoss = metrics?.total_gain_loss || (totalValue - totalInvested);
  const gainLossPercentage = metrics?.total_return || 0; // Now using portfolio-level return percentage
  const activeInvestments = investments?.filter(inv => inv.status === 'active') || [];
  const performingInvestments = activeInvestments.filter(inv => (inv.current_value || 0) > (inv.initial_amount || 0));

  return (
    <SidebarProvider>
      <Head title="Investments" />
      <AppSidebar />
      
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbItem>
                <BreadcrumbPage>Investment Portfolio</BreadcrumbPage>
              </BreadcrumbItem>
            </Breadcrumb>
          </div>
          <div className="ml-auto mr-4 flex items-center gap-2">
            <Button 
              onClick={openCreateInvestmentModal} 
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1" 
              size="sm"
            >
              <PlusIcon className="h-4 w-4" />
              Add Investment
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {investments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="rounded-full bg-gradient-to-br from-blue-50 to-purple-50 p-8 mb-6">
                <Briefcase className="h-20 w-20 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Build Your Investment Portfolio</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1 mb-8 max-w-lg text-lg">
                Start tracking your investments and watch your portfolio grow. Monitor performance, analyze returns, and make informed investment decisions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={openCreateInvestmentModal}
                >
                  <Briefcase className="h-5 w-5" />
                  Add Your First Investment
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Learn About Investing
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Portfolio Statistics Cards */}
              <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                <Card className="bg-blue-50 dark:bg-blue-900/20">
                  <CardHeader className="relative">
                    <CardDescription>Portfolio Value</CardDescription>
                    <CardTitle className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {safeFormatCurrency(totalValue)}
                    </CardTitle>
                    <DollarSignIcon className="absolute top-4 right-4 h-5 w-5 text-blue-600" />
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Total value of all investments
                    </div>
                  </CardFooter>
                </Card>

                <Card className="bg-green-50 dark:bg-green-900/20">
                  <CardHeader className="relative">
                    <CardDescription>Total Invested</CardDescription>
                    <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {safeFormatCurrency(totalInvested)}
                    </CardTitle>
                    <Target className="absolute top-4 right-4 h-5 w-5 text-green-600" />
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      Capital invested across portfolio
                    </div>
                  </CardFooter>
                </Card>

                <Card className={`${totalGainLoss >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <CardHeader className="relative">
                    <CardDescription>Total Gain/Loss</CardDescription>
                    <CardTitle className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                      {safeFormatCurrency(totalGainLoss)}
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                      <Badge variant="outline" className={`flex gap-1 rounded-lg text-xs ${totalGainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {totalGainLoss >= 0 ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
                        {gainLossPercentage.toFixed(2)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      {totalGainLoss >= 0 ? 'Portfolio is growing' : 'Portfolio needs attention'}
                    </div>
                  </CardFooter>
                </Card>

                <Card className="bg-purple-50 dark:bg-purple-900/20">
                  <CardHeader className="relative">
                    <CardDescription>Active Investments</CardDescription>
                    <CardTitle className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {activeInvestments.length}
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                      <Badge variant="outline" className="flex gap-1 rounded-lg text-xs text-purple-600 dark:text-purple-400">
                        <Activity className="size-3" />
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                      {performingInvestments.length} profitable investments
                    </div>
                  </CardFooter>
                </Card>
              </div>

              {/* Performance Charts */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUpIcon className="h-5 w-5 text-blue-600" />
                      Portfolio Performance
                    </CardTitle>
                    <CardDescription>
                      Track your portfolio's growth over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PerformanceChart data={performance_data} />
                  </CardContent>
                </Card>

                <div>
                  <AssetAllocationChart 
                    data={asset_allocation} 
                    title="Asset Allocation" 
                  />
                </div>
              </div>

              {/* Investment List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                        Your Investments
                      </CardTitle>
                      <CardDescription>
                        Manage and track all your investment holdings
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex rounded-lg border">
                        <Button
                          variant={viewMode === 'cards' ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode('cards')}
                          className="rounded-r-none"
                        >
                          Cards
                        </Button>
                        <Button
                          variant={viewMode === 'table' ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode('table')}
                          className="rounded-l-none"
                        >
                          Table
                        </Button>
                      </div>
                      <Button 
                        onClick={openCreateInvestmentModal} 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Add Investment
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="active">
                    <TabsList className="mb-6">
                      <TabsTrigger value="active">Active Investments ({activeInvestments.length})</TabsTrigger>
                      <TabsTrigger value="all">All Investments ({investments.length})</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="active">
                      {viewMode === 'cards' ? (
                        <InvestmentCardList 
                          investments={activeInvestments} 
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          formatCurrency={formatCurrency}
                        />
                      ) : (
                        <InvestmentList
                          investments={activeInvestments}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      )}
                    </TabsContent>
                    
                    <TabsContent value="all">
                      {viewMode === 'cards' ? (
                        <InvestmentCardList 
                          investments={investments} 
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          formatCurrency={formatCurrency}
                        />
                      ) : (
                        <InvestmentList
                          investments={investments}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </SidebarInset>

      <InvestmentForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedInvestment(null);
        }}
        investment={selectedInvestment}
        categories={categories}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the investment and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}

// Card-based investment list component
function InvestmentCardList({ investments, onEdit, onDelete, formatCurrency }) {
  // Safety check for formatCurrency
  const safeFormatCurrency = (amount) => {
    try {
      if (typeof formatCurrency === 'function') {
        return formatCurrency(amount);
      }
      // Fallback formatting if formatCurrency is not available
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount || 0);
    } catch (err) {
      console.error('Currency formatting error:', err);
      return '0.00';
    }
  };

  if (investments.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No investments in this category</h3>
        <p className="text-gray-500 dark:text-gray-400">Start building your portfolio by adding your first investment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {investments.map((investment) => {
        const currentValue = investment.current_value || 0;
        const initialValue = investment.initial_value || 0;
        const totalReturn = currentValue - initialValue;
        const returnPercentage = initialValue > 0 ? ((totalReturn / initialValue) * 100) : 0;
        const isProfit = totalReturn >= 0;

        return (
          <Card key={investment.id} className={`relative hover:shadow-md transition-shadow ${isProfit ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">{investment.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {investment.symbol && (
                      <Badge variant="outline" className="text-xs font-mono">
                        {investment.symbol}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {investment.category || 'Uncategorized'}
                    </Badge>
                    <Badge variant={investment.status === 'active' ? 'default' : 'secondary'} className="text-xs capitalize">
                      {investment.status}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(investment)} className="flex items-center cursor-pointer">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Investment
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(investment.id)} 
                      className="flex items-center cursor-pointer text-red-600"
                    >
                      <Target className="mr-2 h-4 w-4" />
                      Delete Investment
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Investment Value */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Value</span>
                  <span className="font-semibold">{safeFormatCurrency(currentValue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Initial Investment</span>
                  <span>{safeFormatCurrency(initialValue)}</span>
                </div>
              </div>

              {/* Performance */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Return</span>
                  <div className="flex items-center gap-1">
                    {isProfit ? (
                      <TrendingUpIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDownIcon className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                      {safeFormatCurrency(totalReturn)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">ROI</span>
                  <span className={`font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                    {returnPercentage.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Purchase Date */}
              {investment.purchase_date && (
                <div className="text-xs text-muted-foreground border-t pt-2">
                  Purchased: {new Date(investment.purchase_date).toLocaleDateString()}
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => onEdit(investment)}
              >
                Manage Investment
                <ArrowUpRightIcon className="ml-1 h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
