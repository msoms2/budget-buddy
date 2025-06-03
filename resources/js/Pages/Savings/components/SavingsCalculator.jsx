import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CalculatorIcon,
  CalendarIcon,
  DollarSignIcon,
  TrendingUpIcon,
  ClockIcon
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency.jsx';

export default function SavingsCalculator({ initialTargetAmount = '', initialTargetDate = '' }) {
  const { formatCurrency, currency } = useCurrency();
  
  const [targetAmount, setTargetAmount] = useState(initialTargetAmount);
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState(initialTargetDate);
  const [savingsPeriod, setSavingsPeriod] = useState('monthly');
  const [calculations, setCalculations] = useState(null);

  // Calculate savings requirements
  useEffect(() => {
    if (!targetAmount || !targetDate) {
      setCalculations(null);
      return;
    }

    const target = parseFloat(targetAmount) || 0;
    const current = parseFloat(currentAmount) || 0;
    const remaining = Math.max(0, target - current);
    
    const targetDateObj = new Date(targetDate);
    const today = new Date();
    const timeDiff = targetDateObj - today;
    const daysRemaining = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    const weeksRemaining = Math.max(1, Math.ceil(daysRemaining / 7));
    const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));
    const yearsRemaining = Math.max(1, Math.ceil(daysRemaining / 365));

    const dailyRequired = remaining / daysRemaining;
    const weeklyRequired = remaining / weeksRemaining;
    const monthlyRequired = remaining / monthsRemaining;
    const yearlyRequired = remaining / yearsRemaining;

    // Calculate different scenarios
    const scenarios = {
      conservative: {
        daily: dailyRequired * 1.2,
        weekly: weeklyRequired * 1.2,
        monthly: monthlyRequired * 1.2,
        yearly: yearlyRequired * 1.2,
        label: 'Conservative (20% buffer)'
      },
      target: {
        daily: dailyRequired,
        weekly: weeklyRequired,
        monthly: monthlyRequired,
        yearly: yearlyRequired,
        label: 'Target Goal'
      },
      aggressive: {
        daily: dailyRequired * 0.8,
        weekly: weeklyRequired * 0.8,
        monthly: monthlyRequired * 0.8,
        yearly: yearlyRequired * 0.8,
        label: 'Aggressive (Early completion)'
      }
    };

    // Calculate progress percentage
    const progressPercentage = target > 0 ? (current / target) * 100 : 0;

    setCalculations({
      remaining,
      daysRemaining,
      weeksRemaining,
      monthsRemaining,
      yearsRemaining,
      scenarios,
      progressPercentage,
      targetAmount: target,
      currentAmount: current
    });
  }, [targetAmount, currentAmount, targetDate]);

  // Quick target amount presets
  const quickTargets = [
    { label: '$1,000', value: 1000 },
    { label: '$5,000', value: 5000 },
    { label: '$10,000', value: 10000 },
    { label: '$25,000', value: 25000 },
    { label: '$50,000', value: 50000 },
    { label: '$100,000', value: 100000 }
  ];

  // Quick date presets
  const getQuickDates = () => {
    const today = new Date();
    return [
      { 
        label: '3 months', 
        value: new Date(today.getFullYear(), today.getMonth() + 3, today.getDate()).toISOString().split('T')[0] 
      },
      { 
        label: '6 months', 
        value: new Date(today.getFullYear(), today.getMonth() + 6, today.getDate()).toISOString().split('T')[0] 
      },
      { 
        label: '1 year', 
        value: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()).toISOString().split('T')[0] 
      },
      { 
        label: '2 years', 
        value: new Date(today.getFullYear() + 2, today.getMonth(), today.getDate()).toISOString().split('T')[0] 
      },
      { 
        label: '5 years', 
        value: new Date(today.getFullYear() + 5, today.getMonth(), today.getDate()).toISOString().split('T')[0] 
      }
    ];
  };

  const formatPeriod = (period) => {
    switch (period) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return 'Monthly';
    }
  };

  const getPeriodAmount = (scenario) => {
    switch (savingsPeriod) {
      case 'daily': return scenario.daily;
      case 'weekly': return scenario.weekly;
      case 'monthly': return scenario.monthly;
      case 'yearly': return scenario.yearly;
      default: return scenario.monthly;
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalculatorIcon className="h-5 w-5 text-blue-600" />
          <CardTitle>Savings Calculator</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="target-amount">
              Target Amount {currency && <span className="text-gray-500">({currency.code})</span>}
            </Label>
            <div className="relative">
              {currency && (
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currency.symbol}
                </span>
              )}
              <Input
                id="target-amount"
                type="number"
                step="0.01"
                min="0"
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value)}
                placeholder="10000.00"
                className={currency ? "pl-8" : ""}
              />
            </div>
            
            {/* Quick Target Buttons */}
            <div className="grid grid-cols-3 gap-1">
              {quickTargets.map((quick, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setTargetAmount(quick.value.toString())}
                >
                  {quick.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current-amount">
              Current Amount {currency && <span className="text-gray-500">({currency.code})</span>}
            </Label>
            <div className="relative">
              {currency && (
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currency.symbol}
                </span>
              )}
              <Input
                id="current-amount"
                type="number"
                step="0.01"
                min="0"
                value={currentAmount}
                onChange={e => setCurrentAmount(e.target.value)}
                placeholder="0.00"
                className={currency ? "pl-8" : ""}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="target-date">Target Date</Label>
            <Input
              id="target-date"
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            
            {/* Quick Date Buttons */}
            <div className="grid grid-cols-3 gap-1">
              {getQuickDates().map((quick, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setTargetDate(quick.value)}
                >
                  {quick.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="savings-period">Savings Period</Label>
            <Select value={savingsPeriod} onValueChange={setSavingsPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Section */}
        {calculations && (
          <div className="space-y-4">
            {/* Progress Overview */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUpIcon className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-300">Progress Overview</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-gray-800 dark:text-gray-200">
                    {formatCurrency(calculations.remaining)}
                  </div>
                  <div className="text-gray-500">Remaining</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-800 dark:text-gray-200">
                    {calculations.daysRemaining}
                  </div>
                  <div className="text-gray-500">Days Left</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-800 dark:text-gray-200">
                    {Math.round(calculations.progressPercentage)}%
                  </div>
                  <div className="text-gray-500">Complete</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-800 dark:text-gray-200">
                    {calculations.monthsRemaining}
                  </div>
                  <div className="text-gray-500">Months Left</div>
                </div>
              </div>
            </div>

            {/* Savings Scenarios */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {formatPeriod(savingsPeriod)} Savings Required
              </h4>
              
              {Object.entries(calculations.scenarios).map(([key, scenario]) => (
                <div 
                  key={key} 
                  className={`p-3 rounded-lg border-2 ${
                    key === 'target' 
                      ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' 
                      : key === 'conservative'
                      ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                      : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {scenario.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Save {formatPeriod(savingsPeriod).toLowerCase()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        key === 'target' ? 'text-blue-600' :
                        key === 'conservative' ? 'text-amber-600' :
                        'text-green-600'
                      }`}>
                        {formatCurrency(getPeriodAmount(scenario))}
                      </div>
                      {key === 'target' && (
                        <div className="text-xs text-gray-500">Minimum required</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">💡 Savings Tips</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Set up automatic transfers to make saving effortless</li>
                <li>• Start with the conservative amount and increase when possible</li>
                <li>• Consider high-yield savings accounts to earn more interest</li>
                <li>• Review and adjust your goal monthly to stay on track</li>
              </ul>
            </div>
          </div>
        )}

        {!calculations && (
          <div className="text-center py-8 text-gray-500">
            <CalculatorIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Enter your target amount and date to see savings calculations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}