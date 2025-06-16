import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
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
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbList, 
  BreadcrumbPage 
} from "@/components/ui/breadcrumb";
import { 
  PlusIcon, 
  PiggyBankIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  ClockIcon,
  TargetIcon,
  DollarSignIcon,
  CogIcon,
  BarChart3Icon,
  CalendarIcon,
  TimerIcon,
  StarIcon,
  SearchIcon
} from "lucide-react";
import { Input } from '@/components/ui/input';
import { useCurrency } from '@/hooks/useCurrency.jsx';
 
import SavingsModal from './Partials/SavingsModal';
import ProgressModal from './Partials/ProgressModal';
import SavingsCategoryModal from './Partials/SavingsCategoryModal';
import SavingsPlanCard from './components/SavingsPlanCard';

export default function Index({ auth, savings, categories }) {
  const { formatCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedSavings, setSelectedSavings] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [summaryStats, setSummaryStats] = useState({
    totalPlans: 0,
    activePlans: 0,
    completedPlans: 0,
    totalTargetAmount: 0,
    totalCurrentAmount: 0,
    totalProgress: 0
  });

  // Calculate summary statistics
  useEffect(() => {
    const activePlans = savings.filter(plan => plan.status === 'active');
    const completedPlans = savings.filter(plan => plan.status === 'completed');
    
    const totalTargetAmount = savings.reduce((sum, plan) => sum + parseFloat(plan.target_amount), 0);
    const totalCurrentAmount = savings.reduce((sum, plan) => sum + parseFloat(plan.current_amount), 0);
    const totalProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;
    
    setSummaryStats({
      totalPlans: savings.length,
      activePlans: activePlans.length,
      completedPlans: completedPlans.length,
      totalTargetAmount,
      totalCurrentAmount,
      totalProgress
    });
  }, [savings]);

  // Filter savings based on tab, search term, and status
  const filteredSavings = savings.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (plan.description && plan.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesTab = true;
    if (activeTab === 'active') {
      matchesTab = plan.status === 'active';
    } else if (activeTab === 'completed') {
      matchesTab = plan.status === 'completed';
    }
    
    const matchesFilter = filterStatus === 'all' || plan.status === filterStatus;
    
    return matchesSearch && matchesTab && matchesFilter;
  });

  const openCreateSavingsModal = () => {
    setSelectedSavings(null);
    setShowSavingsModal(true);
  };

  const openEditSavingsModal = (plan) => {
    setSelectedSavings(plan);
    setShowSavingsModal(true);
  };

  const closeSavingsModal = () => {
    setShowSavingsModal(false);
    setSelectedSavings(null);
  };

  const openProgressModal = (plan) => {
    setSelectedSavings(plan);
    setShowProgressModal(true);
  };

  const closeProgressModal = () => {
    setShowProgressModal(false);
    setSelectedSavings(null);
  };

  // Calculate days from now to target date
  const getDaysRemaining = (targetDate) => {
    const target = new Date(targetDate);
    const today = new Date();
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Find the next priority savings plan
  const getNextPrioritySavings = () => {
    const activePlans = savings.filter(plan => plan.status === 'active');
    if (activePlans.length === 0) return null;
    
    // Sort by target date ascending and progress descending
    return activePlans.sort((a, b) => {
      const aProgress = (a.current_amount / a.target_amount) * 100;
      const bProgress = (b.current_amount / b.target_amount) * 100;
      
      // First by target date, then by lowest progress
      const dateCompare = new Date(a.target_date) - new Date(b.target_date);
      if (dateCompare !== 0) return dateCompare;
      return aProgress - bProgress;
    })[0];
  };

  const nextPrioritySavings = getNextPrioritySavings();

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 min-h-screen">
      <SidebarProvider>
        <Head title="Savings Plans" />
        <AppSidebar />
        
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbItem>
                  <BreadcrumbPage>Savings</BreadcrumbPage>
                </BreadcrumbItem>
              </Breadcrumb>
            </div>
            <div className="flex gap-4 px-4">
              <Button onClick={openCreateSavingsModal} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700">
                <PlusIcon className="h-4 w-4" />
                Add Savings Plan
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory(null);
                  setShowCategoryModal(true);
                }}
                className="flex items-center gap-1"
              >
                <CogIcon className="h-4 w-4" />
                Manage Categories
              </Button>
            </div>
          </header>
          
          <div className="flex flex-1 flex-col p-4 space-y-6">
            {/* Tabs Navigation */}
            <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full md:w-auto grid grid-cols-3">
                <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
                <TabsTrigger value="active" className="text-xs md:text-sm">Active Plans</TabsTrigger>
                <TabsTrigger value="completed" className="text-xs md:text-sm">Completed</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Dashboard Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <Card className="bg-white dark:bg-gray-800/50">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <PiggyBankIcon className="h-8 w-8 mb-3 text-blue-500 dark:text-blue-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Plans</p>
                      <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-gray-100">{summaryStats.totalPlans}</h3>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white dark:bg-gray-800/50">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <ClockIcon className="h-8 w-8 mb-3 text-blue-500 dark:text-blue-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Active Plans</p>
                      <h3 className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{summaryStats.activePlans}</h3>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white dark:bg-gray-800/50">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <CheckCircleIcon className="h-8 w-8 mb-3 text-green-500 dark:text-green-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Completed Plans</p>
                      <h3 className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{summaryStats.completedPlans}</h3>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white dark:bg-gray-800/50">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <BarChart3Icon className="h-8 w-8 mb-3 text-purple-500 dark:text-purple-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Target</p>
                      <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-gray-100">{formatCurrency(summaryStats.totalTargetAmount)}</h3>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white dark:bg-gray-800/50">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <TrendingUpIcon className="h-8 w-8 mb-3 text-amber-500 dark:text-amber-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Saved</p>
                      <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{formatCurrency(summaryStats.totalCurrentAmount)}</h3>
                    </CardContent>
                  </Card>
                </div>

                {/* Next Priority Savings Highlight */}
                {nextPrioritySavings && (
                  <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl overflow-hidden border border-blue-200 dark:border-blue-800/50 shadow-sm">
                    <div className="p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-100 dark:bg-blue-800/50 rounded-full p-3">
                            <StarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">Priority Savings Plan</h3>
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{nextPrioritySavings.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Target {formatDate(nextPrioritySavings.target_date)}
                              </span>
                              <span className="flex items-center text-sm text-amber-600 dark:text-amber-400">
                                <TimerIcon className="h-4 w-4 mr-1" />
                                {getDaysRemaining(nextPrioritySavings.target_date)} days remaining
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {formatCurrency(nextPrioritySavings.current_amount)} of {formatCurrency(nextPrioritySavings.target_amount)}
                            </span>
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                              {Math.round((nextPrioritySavings.current_amount / nextPrioritySavings.target_amount) * 100)}%
                            </span>
                          </div>
                          <div className="w-full md:w-48 h-2 bg-blue-200 dark:bg-blue-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
                              style={{ width: `${Math.min(100, Math.round((nextPrioritySavings.current_amount / nextPrioritySavings.target_amount) * 100))}%` }}
                            ></div>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 mt-2"
                            onClick={() => openProgressModal(nextPrioritySavings)}
                          >
                            Add Progress
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Active Plans */}
                <Card className="bg-white dark:bg-gray-800/50 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Recent Active Plans</CardTitle>
                    <CardDescription>Your most recently updated savings plans</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {savings.filter(plan => plan.status === 'active').slice(0, 3).length === 0 ? (
                      <div className="text-center py-8">
                        <PiggyBankIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">No active savings plans yet</p>
                        <Button onClick={openCreateSavingsModal} className="mt-4">
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Create Your First Plan
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {savings.filter(plan => plan.status === 'active').slice(0, 3).map(plan => (
                          <SavingsPlanCard 
                            key={plan.id} 
                            plan={plan} 
                            onEdit={() => openEditSavingsModal(plan)}
                            onAddProgress={() => openProgressModal(plan)}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Active Plans Tab */}
              <TabsContent value="active" className="space-y-6">
                {/* Search and Filter */}
                <Card className="bg-white dark:bg-gray-800/50">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search savings plans..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Plans Grid */}
                <Card className="bg-white dark:bg-gray-800/50 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Active Savings Plans</CardTitle>
                    <CardDescription>Track your progress towards your financial goals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredSavings.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                          <PiggyBankIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No active savings plans found</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                          {searchTerm ? "No plans match your search criteria." : "You don't have any active savings plans yet. Start building your financial future!"}
                        </p>
                        <Button onClick={openCreateSavingsModal}>
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Create a New Plan
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {filteredSavings.map(plan => (
                          <SavingsPlanCard 
                            key={plan.id} 
                            plan={plan} 
                            onEdit={() => openEditSavingsModal(plan)}
                            onAddProgress={() => openProgressModal(plan)}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Completed Plans Tab */}
              <TabsContent value="completed" className="space-y-6">
                <Card className="bg-white dark:bg-gray-800/50 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Completed Savings Plans</CardTitle>
                    <CardDescription>Celebrate your financial achievements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {savings.filter(plan => plan.status === 'completed').length === 0 ? (
                      <div className="text-center py-12">
                        <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                          <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No completed savings plans yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                          Keep working towards your active savings goals to see your achievements here!
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {savings.filter(plan => plan.status === 'completed').map(plan => (
                          <SavingsPlanCard 
                            key={plan.id} 
                            plan={plan} 
                            onEdit={() => openEditSavingsModal(plan)}
                            onAddProgress={() => openProgressModal(plan)}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Modals */}
          {showSavingsModal && (
            <SavingsModal
              isOpen={showSavingsModal}
              onClose={closeSavingsModal}
              savings={selectedSavings}
              categories={categories}
            />
          )}

          {showProgressModal && selectedSavings && (
            <ProgressModal
              isOpen={showProgressModal}
              onClose={closeProgressModal}
              savings={selectedSavings}
            />
          )}

          {showCategoryModal && (
            <SavingsCategoryModal
              isOpen={showCategoryModal}
              onClose={() => setShowCategoryModal(false)}
              category={selectedCategory}
              onSuccess={async () => {
                try {
                  await router.reload({ only: ['categories'] });
                  setShowCategoryModal(false);
                  // Force re-render of the page to ensure updated categories are available
                  router.reload();
                } catch (error) {
                  console.error('Error reloading categories:', error);
                }
              }}
            />
          )}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}