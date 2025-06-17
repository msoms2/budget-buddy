import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrency } from '@/hooks/useCurrency.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CalculatorIcon, CalendarIcon, PercentIcon, ArrowRightIcon, TrendingUpIcon, CheckCircle2Icon } from 'lucide-react';

export default function SavingsCalculator({ goalId, isCompleted, progressCounter = 0 }) {
  const { formatCurrency } = useCurrency();
  const [period, setPeriod] = useState('monthly');
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateSavings = async () => {
    if (isCompleted) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/goals/${goalId}/calculate-savings`, {
        params: { period }
      });
      setCalculation(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate savings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateSavings();
  }, [period, isCompleted, progressCounter]);

  const getProbabilityColor = (probability) => {
    if (probability >= 80) return 'text-green-600 dark:text-green-500';
    if (probability >= 50) return 'text-amber-600 dark:text-amber-500';
    return 'text-red-600 dark:text-red-500';
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'daily':
        return 'Day';
      case 'weekly':
        return 'Week';
      case 'monthly':
        return 'Month';
      default:
        return period;
    }
  };
  
  const getTimeRemainingValue = (days, periodType) => {
    switch (periodType) {
      case 'daily':
        return Math.ceil(days);
      case 'weekly':
        return Math.ceil(days / 7);
      case 'monthly':
        return Math.ceil(days / 30);
      default:
        return Math.ceil(days);
    }
  };
  
  const getTimeRemainingLabel = (periodType) => {
    switch (periodType) {
      case 'daily':
        return 'Days Remaining';
      case 'weekly':
        return 'Weeks Remaining';
      case 'monthly':
        return 'Months Remaining';
      default:
        return 'Time Remaining';
    }
  };

  // If goal is completed, show a celebration message instead
  if (isCompleted) {
    return (
      <Card className="border shadow-sm bg-green-50 dark:bg-green-900/20 h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CheckCircle2Icon className="h-5 w-5 text-green-500" />
            <CardTitle>Goal Achieved!</CardTitle>
          </div>
          <CardDescription>
            Congratulations! You've successfully reached your savings goal.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          <div className="p-3 rounded-lg bg-white dark:bg-gray-800/50 border border-green-200 dark:border-green-800 mb-3">
            <div className="flex justify-center mb-2">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                <CheckCircle2Icon className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
              </div>
            </div>
            <h3 className="text-base md:text-lg font-semibold text-center text-green-700 dark:text-green-400 mb-1">
              Success!
            </h3>
            <p className="text-green-700 dark:text-green-400 text-xs md:text-sm text-center">
              Your goal has been successfully completed. Great job on your financial discipline!
            </p>
          </div>
          <div className="mt-auto text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              You can now set a new goal or continue to track your finances.
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t py-3 flex justify-center">
          <Button 
            variant="outline" 
            size="sm"
            className="gap-1 text-green-600 border-green-200"
          >
            View Your Achievements
            <ArrowRightIcon className="h-3.5 w-3.5 ml-1" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5 text-blue-500" />
            <div>
              <CardTitle>Savings Calculator</CardTitle>
              <CardDescription>
                Calculate how much you need to save to reach your goal
              </CardDescription>
            </div>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px] md:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 py-2">
        <div className="space-y-2 md:space-y-3 h-full flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center my-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <Alert variant="destructive" className="my-2 flex-1 flex items-center">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : calculation && (
            <div className="space-y-2 md:space-y-3 flex-1 flex flex-col">
              <div className="grid gap-2 md:gap-3 grid-cols-2">
                <div className="p-2 md:p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                    <CalculatorIcon className="h-3.5 w-3.5" />
                    <p className="text-xs md:text-sm font-medium">
                      Required per {getPeriodLabel(period)}
                    </p>
                  </div>
                  <p className="text-base md:text-lg font-bold text-blue-700 dark:text-blue-400 mt-1">
                    {formatCurrency(calculation.required_amount)}
                  </p>
                </div>
                
                <div className="p-2 md:p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <p className="text-xs md:text-sm font-medium">{getTimeRemainingLabel(period)}</p>
                  </div>
                  <p className="text-base md:text-lg font-bold text-gray-700 dark:text-gray-300 mt-1">
                    {getTimeRemainingValue(calculation.remaining_days, period)}
                  </p>
                </div>
              </div>

              <div className="p-2 md:p-3 rounded-lg bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/30 dark:to-transparent border border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-1.5 mb-1">
                  <PercentIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs md:text-sm font-medium text-blue-700 dark:text-blue-400">
                    Probability of Success
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-full h-2 md:h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full rounded-full ${
                        calculation.probability_of_success >= 80 
                          ? 'bg-green-500' 
                          : calculation.probability_of_success >= 50 
                            ? 'bg-amber-500' 
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.round(calculation.probability_of_success))}%` }}
                    ></div>
                  </div>
                  <p className={`text-sm md:text-base font-bold ${getProbabilityColor(calculation.probability_of_success)}`}>
                    {Math.round(calculation.probability_of_success)}%
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 dark:bg-gray-800/30 p-2 md:p-3 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  To reach your goal, you need to save{' '}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {formatCurrency(calculation.required_amount)}
                  </span>{' '}
                  per {period.slice(0, -2)}. This calculation is based on your target amount,
                  current progress, and remaining time.
                </p>
              </div>
              
              {/* Extra info section - reduced spacing between this and the previous element */}
              <div className="p-2 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20 mt-auto">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your savings plan is automatically adjusted as you make progress toward your goal.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="py-3 flex justify-end mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={calculateSavings}
          disabled={loading}
          className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              Recalculate
              <ArrowRightIcon className="ml-1.5 h-3 w-3" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}