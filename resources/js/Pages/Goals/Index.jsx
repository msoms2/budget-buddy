import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
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
import { Progress } from '@/components/ui/progress';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbList, 
  BreadcrumbPage 
} from "@/components/ui/breadcrumb";
import { 
  PlusIcon, 
  ChevronRightIcon, 
  CalendarIcon, 
  TrendingUpIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  TargetIcon,
  DollarSignIcon,
  BarChart3Icon,
  EyeIcon,
  PencilIcon,
  FlagIcon,
  TimerIcon,
  StarIcon
} from "lucide-react";
import { Link } from '@inertiajs/react';
import { useCurrency } from '@/hooks/useCurrency.jsx';
 
import GoalModal from './Partials/GoalModal';

export default function Index({ auth, goals, categories, mainCategories, subcategories }) {
  const { formatCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('active');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [summaryStats, setSummaryStats] = useState({
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    totalTargetAmount: 0,
    totalCurrentAmount: 0
  });
  
  // Organize categories data for the modal
  const [organizedCategories, setOrganizedCategories] = useState({
    mainCategories: mainCategories || [],
    subcategories: subcategories || {}
  });
  
  const filteredGoals = goals.filter(goal => 
    activeTab === 'all' ? true : goal.status === activeTab
  );

  // Calculate summary statistics
  useEffect(() => {
    const activeGoals = goals.filter(goal => goal.status === 'active');
    const completedGoals = goals.filter(goal => goal.status === 'completed');
    
    const totalTargetAmount = goals.reduce((sum, goal) => sum + parseFloat(goal.target_amount), 0);
    const totalCurrentAmount = goals.reduce((sum, goal) => sum + parseFloat(goal.current_amount), 0);
    
    setSummaryStats({
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      totalTargetAmount,
      totalCurrentAmount
    });
  }, [goals]);

  const openCreateGoalModal = () => {
    setSelectedGoal(null);
    setShowGoalModal(true);
  };

  const openEditGoalModal = (goal) => {
    setSelectedGoal(goal);
    setShowGoalModal(true);
  };

  const closeGoalModal = () => {
    setShowGoalModal(false);
    setSelectedGoal(null);
  };

  // Get the appropriate color scheme for goal status
  const getStatusColors = (status) => {
    switch (status) {
      case 'active':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          text: 'text-blue-700 dark:text-blue-400',
          border: 'border-blue-200 dark:border-blue-800',
          icon: <ClockIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        };
      case 'completed':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          text: 'text-green-700 dark:text-green-400',
          border: 'border-green-200 dark:border-green-800',
          icon: <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" />
        };
      case 'cancelled':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          text: 'text-red-700 dark:text-red-400',
          border: 'border-red-200 dark:border-red-800',
          icon: <XCircleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          text: 'text-gray-700 dark:text-gray-400',
          border: 'border-gray-200 dark:border-gray-800',
          icon: <FlagIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        };
    }
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

  // Find the closest upcoming goal
  const getNextUpcomingGoal = () => {
    const activeGoals = goals.filter(goal => goal.status === 'active');
    if (activeGoals.length === 0) return null;
    
    // Sort by target date ascending
    return activeGoals.sort((a, b) => 
      new Date(a.target_date) - new Date(b.target_date)
    )[0];
  };

  const nextUpcomingGoal = getNextUpcomingGoal();

  // Goal Card Component (redesigned)
  const GoalCardRedesigned = ({ goal, onEdit }) => {
    const progress = (goal.current_amount / goal.target_amount) * 100;
    const remainingAmount = goal.target_amount - goal.current_amount;
    const daysRemaining = getDaysRemaining(goal.target_date);
    
    const statusColors = getStatusColors(goal.status);
    
    return (
      <Card className={`overflow-hidden transition-all duration-200 hover:shadow-md border-l-4 ${statusColors.border}`}>
        <CardHeader className={`${statusColors.bg} pb-2`}>
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <div className={`rounded-full p-2 ${statusColors.bg} ${statusColors.border}`}>
                {statusColors.icon}
              </div>
              <div>
                <CardTitle className={`text-xl ${statusColors.text}`}>{goal.title}</CardTitle>
                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                  <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                  <span className="mr-2">Target: {formatDate(goal.target_date)}</span>
                  {goal.category && (
                    <Badge variant="outline" className="text-xs">
                      {goal.category.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Badge className={`capitalize ${
              goal.status === 'active' ? 'bg-blue-100 hover:bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
              goal.status === 'completed' ? 'bg-green-100 hover:bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
              'bg-red-100 hover:bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
            }`}>
              {goal.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1.5 text-sm">
                <span className="font-medium">Progress</span>
                <span className={`font-bold ${progress >= 80 ? 'text-green-600' : progress >= 50 ? 'text-amber-600' : 'text-blue-600'}`}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    progress >= 80 ? 'bg-green-500 dark:bg-green-600' : 
                    progress >= 50 ? 'bg-amber-500 dark:bg-amber-600' : 
                    'bg-blue-500 dark:bg-blue-600'
                  }`}
                  style={{ width: `${Math.min(100, Math.round(progress))}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Current</span>
                  <DollarSignIcon className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <div className="text-base font-bold text-gray-800 dark:text-gray-200">
                  {formatCurrency(goal.current_amount)}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Target</span>
                  <TargetIcon className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <div className="text-base font-bold text-gray-800 dark:text-gray-200">
                  {formatCurrency(goal.target_amount)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-1.5 text-sm ${
                daysRemaining < 14 ? 'text-red-600 dark:text-red-400' : 
                daysRemaining < 30 ? 'text-amber-600 dark:text-amber-400' : 
                'text-blue-600 dark:text-blue-400'
              }`}>
                <TimerIcon className="w-4 h-4" />
                <span className="font-semibold">{daysRemaining} days</span> remaining
              </div>
              <div className="text-sm text-gray-500">
                Need: {formatCurrency(remainingAmount)}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2 bg-gray-50 dark:bg-gray-800/30 pt-3 pb-3">
          <Button variant="outline" size="sm" asChild className="h-8">
            <Link href={route('goals.show', goal.id)}>
              <EyeIcon className="h-3.5 w-3.5 mr-1" />
              Details
            </Link>
          </Button>
          <Button size="sm" className="h-8" onClick={() => onEdit(goal)}>
            <PencilIcon className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 min-h-screen">
      <SidebarProvider>
        <Head title="Financial Goals" />
        <AppSidebar />
        
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbItem>
                  <BreadcrumbPage>Goals</BreadcrumbPage>
                </BreadcrumbItem>
              </Breadcrumb>
            </div>
            <div className="flex gap-4 px-4">
              <Button onClick={openCreateGoalModal} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700">
                <PlusIcon className="h-4 w-4" />
                Create New Goal
              </Button>
            </div>
          </header>
          
          <div className="flex flex-1 flex-col p-4 space-y-6">
            {/* Dashboard Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Card className="bg-white dark:bg-gray-800/50">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <TargetIcon className="h-8 w-8 mb-3 text-blue-500 dark:text-blue-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Goals</p>
                  <h3 className="text-2xl font-bold mt-1 text-gray-800 dark:text-gray-100">{summaryStats.totalGoals}</h3>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800/50">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <ClockIcon className="h-8 w-8 mb-3 text-blue-500 dark:text-blue-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Goals</p>
                  <h3 className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{summaryStats.activeGoals}</h3>
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800/50">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <CheckCircleIcon className="h-8 w-8 mb-3 text-green-500 dark:text-green-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completed Goals</p>
                  <h3 className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{summaryStats.completedGoals}</h3>
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Progress</p>
                  <h3 className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{formatCurrency(summaryStats.totalCurrentAmount)}</h3>
                </CardContent>
              </Card>
            </div>
            
            {/* Next Goal Highlight */}
            {nextUpcomingGoal && (
              <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl overflow-hidden border border-blue-200 dark:border-blue-800/50 shadow-sm">
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 dark:bg-blue-800/50 rounded-full p-3">
                        <StarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">Next Upcoming Goal</h3>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{nextUpcomingGoal.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            Due {formatDate(nextUpcomingGoal.target_date)}
                          </span>
                          <span className="flex items-center text-sm text-amber-600 dark:text-amber-400">
                            <TimerIcon className="h-4 w-4 mr-1" />
                            {getDaysRemaining(nextUpcomingGoal.target_date)} days remaining
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {formatCurrency(nextUpcomingGoal.current_amount)} of {formatCurrency(nextUpcomingGoal.target_amount)}
                        </span>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {Math.round((nextUpcomingGoal.current_amount / nextUpcomingGoal.target_amount) * 100)}%
                        </span>
                      </div>
                      <div className="w-full md:w-48 h-2 bg-blue-200 dark:bg-blue-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
                          style={{ width: `${Math.min(100, Math.round((nextUpcomingGoal.current_amount / nextUpcomingGoal.target_amount) * 100))}%` }}
                        ></div>
                      </div>
                      <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 mt-2">
                        <Link href={route('goals.show', nextUpcomingGoal.id)}>
                          View Details
                          <ChevronRightIcon className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Goals List Tabs */}
            <Card className="bg-white dark:bg-gray-800/50 shadow-sm">
              <CardHeader className="pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <div>
                    <CardTitle className="text-xl font-bold">Your Financial Goals</CardTitle>
                    <CardDescription>Track and manage your journey to financial success</CardDescription>
                  </div>
                  
                  <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full md:w-auto">
                    <TabsList className="w-full md:w-auto grid grid-cols-4">
                      <TabsTrigger value="active" className="text-xs md:text-sm">Active</TabsTrigger>
                      <TabsTrigger value="completed" className="text-xs md:text-sm">Completed</TabsTrigger>
                      <TabsTrigger value="cancelled" className="text-xs md:text-sm">Cancelled</TabsTrigger>
                      <TabsTrigger value="all" className="text-xs md:text-sm">All Goals</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                {filteredGoals.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                      <TargetIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No {activeTab} goals found</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                      {activeTab === 'active' ? "You don't have any active goals yet. Start by creating your first financial goal!" :
                       activeTab === 'completed' ? "You haven't completed any goals yet. Keep working towards your financial targets!" :
                       activeTab === 'cancelled' ? "You don't have any cancelled goals. That's great!" :
                       "You don't have any goals yet. Start by creating your first financial goal!"}
                    </p>
                    <Button onClick={openCreateGoalModal}>
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Create a New Goal
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredGoals.map(goal => (
                      <GoalCardRedesigned 
                        key={goal.id} 
                        goal={goal} 
                        onEdit={() => openEditGoalModal(goal)} 
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {showGoalModal && (
            <GoalModal 
              isOpen={showGoalModal} 
              onClose={closeGoalModal} 
              goal={selectedGoal} 
              categories={mainCategories && subcategories ? 
                { mainCategories, subcategories } : 
                categories}
            />
          )}
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}