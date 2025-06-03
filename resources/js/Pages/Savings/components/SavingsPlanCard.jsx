import React from 'react';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  DollarSignIcon,
  TargetIcon,
  TimerIcon,
  PencilIcon,
  PlusCircleIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertTriangleIcon
} from "lucide-react";
import { Link } from '@inertiajs/react';
import { useCurrency } from '@/hooks/useCurrency.jsx';

export default function SavingsPlanCard({ plan, onEdit, onAddProgress }) {
  const { formatCurrency } = useCurrency();
  
  const progress = (plan.current_amount / plan.target_amount) * 100;
  const remainingAmount = plan.target_amount - plan.current_amount;
  
  // Calculate days remaining
  const getDaysRemaining = (targetDate) => {
    const target = new Date(targetDate);
    const today = new Date();
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  };
  
  const daysRemaining = getDaysRemaining(plan.target_date);
  
  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get status colors and info
  const getStatusInfo = (status, progress, daysRemaining) => {
    if (status === 'completed') {
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        icon: <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" />,
        badgeClass: 'bg-green-100 hover:bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
      };
    }

    // For active plans, determine status based on progress and time
    if (progress >= 80) {
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        icon: <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400" />,
        badgeClass: 'bg-green-100 hover:bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        statusText: 'On Track'
      };
    } else if (daysRemaining < 30 && progress < 70) {
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        icon: <AlertTriangleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />,
        badgeClass: 'bg-red-100 hover:bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        statusText: 'Behind'
      };
    } else if (daysRemaining < 60 && progress < 50) {
      return {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        icon: <TimerIcon className="h-5 w-5 text-amber-500 dark:text-amber-400" />,
        badgeClass: 'bg-amber-100 hover:bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
        statusText: 'At Risk'
      };
    } else {
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        icon: <ClockIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
        badgeClass: 'bg-blue-100 hover:bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        statusText: 'Active'
      };
    }
  };

  const statusInfo = getStatusInfo(plan.status, progress, daysRemaining);
  
  // Calculate required savings per month/week/day
  const calculateRequiredSavings = () => {
    if (plan.status === 'completed' || remainingAmount <= 0 || daysRemaining <= 0) {
      return null;
    }
    
    const dailyRequired = remainingAmount / Math.max(daysRemaining, 1);
    const weeklyRequired = dailyRequired * 7;
    const monthlyRequired = dailyRequired * 30;
    
    return {
      daily: dailyRequired,
      weekly: weeklyRequired,
      monthly: monthlyRequired
    };
  };

  const requiredSavings = calculateRequiredSavings();

  return (
    <Card className={`overflow-hidden transition-all duration-200 hover:shadow-md border-l-4 ${statusInfo.border}`}>
      <CardHeader className={`${statusInfo.bg} pb-2`}>
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className={`rounded-full p-2 ${statusInfo.bg} ${statusInfo.border}`}>
              {statusInfo.icon}
            </div>
            <div>
              <CardTitle className={`text-xl ${statusInfo.text}`}>{plan.name}</CardTitle>
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                <span className="mr-2">Target: {formatDate(plan.target_date)}</span>
                {plan.category && (
                  <Badge variant="outline" className="text-xs">
                    {plan.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Badge className={`capitalize ${statusInfo.badgeClass}`}>
            {plan.status === 'completed' ? 'Completed' : statusInfo.statusText || plan.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1.5 text-sm">
              <span className="font-medium">Progress</span>
              <span className={`font-bold ${
                progress >= 100 ? 'text-green-600' : 
                progress >= 80 ? 'text-green-600' : 
                progress >= 50 ? 'text-amber-600' : 
                'text-blue-600'
              }`}>
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  progress >= 100 ? 'bg-green-500 dark:bg-green-600' :
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
                {formatCurrency(plan.current_amount)}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Target</span>
                <TargetIcon className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <div className="text-base font-bold text-gray-800 dark:text-gray-200">
                {formatCurrency(plan.target_amount)}
              </div>
            </div>
          </div>

          {plan.status !== 'completed' && (
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-1.5 text-sm ${
                daysRemaining < 14 ? 'text-red-600 dark:text-red-400' : 
                daysRemaining < 30 ? 'text-amber-600 dark:text-amber-400' : 
                'text-blue-600 dark:text-blue-400'
              }`}>
                <TimerIcon className="w-4 h-4" />
                <span className="font-semibold">{Math.max(0, daysRemaining)} days</span> remaining
              </div>
              <div className="text-sm text-gray-500">
                Need: {formatCurrency(Math.max(0, remainingAmount))}
              </div>
            </div>
          )}

          {requiredSavings && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">Required Savings:</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-bold text-gray-800 dark:text-gray-200">{formatCurrency(requiredSavings.daily)}</div>
                  <div className="text-gray-500">Daily</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-800 dark:text-gray-200">{formatCurrency(requiredSavings.weekly)}</div>
                  <div className="text-gray-500">Weekly</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-800 dark:text-gray-200">{formatCurrency(requiredSavings.monthly)}</div>
                  <div className="text-gray-500">Monthly</div>
                </div>
              </div>
            </div>
          )}

          {plan.description && (
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 p-2 rounded">
              {plan.description}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-2 bg-gray-50 dark:bg-gray-800/30 pt-3 pb-3">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="h-8">
            <Link href={route('savings.show', plan.id)}>
              <EyeIcon className="h-3.5 w-3.5 mr-1" />
              Details
            </Link>
          </Button>
          <Button size="sm" className="h-8" onClick={() => onEdit(plan)}>
            <PencilIcon className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
        </div>
        {plan.status !== 'completed' && (
          <Button 
            size="sm" 
            className="h-8 bg-green-600 hover:bg-green-700" 
            onClick={() => onAddProgress(plan)}
          >
            <PlusCircleIcon className="h-3.5 w-3.5 mr-1" />
            Add Progress
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}