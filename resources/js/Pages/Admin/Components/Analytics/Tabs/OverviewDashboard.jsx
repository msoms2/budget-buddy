/**
 * Overview dashboard component for unified analytics
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  PiggyBank,
  Target,
  CreditCard,
  BarChart3,
  Activity,
  Calendar
} from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

const OverviewDashboard = ({ 
  overview, 
  isLoading = false,
  className 
}) => {
  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-8 bg-gray-200 rounded w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Data Available</h3>
          <p className="text-gray-500">Unable to load overview data.</p>
        </div>
      </div>
    );
  }

  const { system_overview, recent_activity, financial_summary } = overview;

  // Calculate derived metrics
  const totalUsers = system_overview?.total_users || 0;
  const newUsersGrowth = recent_activity?.new_users || 0;
  const userGrowthPercentage = totalUsers > 0 ? (newUsersGrowth / totalUsers) * 100 : 0;

  const totalTransactions = system_overview?.total_transactions || 0;
  const newTransactions = recent_activity?.new_transactions || 0;
  const transactionGrowthPercentage = totalTransactions > 0 ? (newTransactions / totalTransactions) * 100 : 0;

  const netWorth = financial_summary?.net_worth || 0;
  const totalInvestments = financial_summary?.total_investment_value || 0;
  const totalDebts = financial_summary?.total_debt_amount || 0;

  // System overview cards
  const systemCards = [
    {
      title: 'Total Users',
      value: formatNumber(totalUsers),
      description: `+${newUsersGrowth} this month`,
      icon: Users,
      trend: userGrowthPercentage > 0 ? 'up' : 'neutral',
      color: 'blue'
    },
    {
      title: 'Total Transactions',
      value: formatNumber(totalTransactions),
      description: `+${newTransactions} this month`,
      icon: Activity,
      trend: transactionGrowthPercentage > 0 ? 'up' : 'neutral',
      color: 'green'
    },
    {
      title: 'Active Budgets',
      value: formatNumber(system_overview?.total_budgets || 0),
      description: `+${recent_activity?.new_budgets || 0} this month`,
      icon: PiggyBank,
      trend: 'neutral',
      color: 'purple'
    },
    {
      title: 'Active Goals',
      value: formatNumber(system_overview?.total_goals || 0),
      description: `+${recent_activity?.new_goals || 0} this month`,
      icon: Target,
      trend: 'neutral',
      color: 'orange'
    }
  ];

  // Financial overview cards
  const financialCards = [
    {
      title: 'Total Net Worth',
      value: formatCurrency(netWorth),
      description: 'All users combined',
      icon: DollarSign,
      trend: netWorth >= 0 ? 'up' : 'down',
      color: netWorth >= 0 ? 'green' : 'red'
    },
    {
      title: 'Total Investments',
      value: formatCurrency(totalInvestments),
      description: 'Portfolio value',
      icon: TrendingUp,
      trend: 'up',
      color: 'emerald'
    },
    {
      title: 'Total Debts',
      value: formatCurrency(totalDebts),
      description: 'Outstanding amount',
      icon: CreditCard,
      trend: 'down',
      color: 'red'
    },
    {
      title: 'Investment Count',
      value: formatNumber(system_overview?.total_investments || 0),
      description: 'Active investments',
      icon: BarChart3,
      trend: 'neutral',
      color: 'blue'
    }
  ];

  // Get icon component
  const getIcon = (IconComponent, color) => {
    const colorClasses = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      orange: 'text-orange-600 bg-orange-100',
      red: 'text-red-600 bg-red-100',
      emerald: 'text-emerald-600 bg-emerald-100'
    };

    return (
      <div className={cn('p-2 rounded-lg', colorClasses[color] || colorClasses.blue)}>
        <IconComponent className="h-5 w-5" />
      </div>
    );
  };

  // Get trend indicator
  const getTrendIndicator = (trend) => {
    if (trend === 'up') {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (trend === 'down') {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  // Render metric card
  const renderMetricCard = (metric) => (
    <Card key={metric.title} className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {metric.title}
        </CardTitle>
        {getIcon(metric.icon, metric.color)}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {metric.value}
        </div>
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          {getTrendIndicator(metric.trend)}
          <span>{metric.description}</span>
        </div>
      </CardContent>
    </Card>
  );

  // Activity summary component
  const ActivitySummary = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Activity (Last 30 Days)
        </CardTitle>
        <CardDescription>
          System activity overview for the past month
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Users</span>
              <Badge variant="secondary">{recent_activity?.new_users || 0}</Badge>
            </div>
            <Progress 
              value={userGrowthPercentage} 
              className="h-2"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Transactions</span>
              <Badge variant="secondary">{recent_activity?.new_transactions || 0}</Badge>
            </div>
            <Progress 
              value={Math.min(transactionGrowthPercentage, 100)} 
              className="h-2"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Budgets</span>
              <Badge variant="secondary">{recent_activity?.new_budgets || 0}</Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Goals</span>
              <Badge variant="secondary">{recent_activity?.new_goals || 0}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Financial health component
  const FinancialHealth = () => {
    const debtToAssetRatio = totalInvestments > 0 ? (totalDebts / totalInvestments) * 100 : 0;
    const healthStatus = debtToAssetRatio < 30 ? 'Excellent' : 
                        debtToAssetRatio < 50 ? 'Good' : 
                        debtToAssetRatio < 70 ? 'Fair' : 'Poor';
    
    const healthColor = debtToAssetRatio < 30 ? 'green' : 
                       debtToAssetRatio < 50 ? 'blue' : 
                       debtToAssetRatio < 70 ? 'yellow' : 'red';

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Health Overview
          </CardTitle>
          <CardDescription>
            System-wide financial health indicators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Overall Health Status</span>
              <Badge 
                variant={healthColor === 'green' ? 'default' : 'secondary'}
                className={cn(
                  healthColor === 'green' && 'bg-green-100 text-green-800',
                  healthColor === 'blue' && 'bg-blue-100 text-blue-800',
                  healthColor === 'yellow' && 'bg-yellow-100 text-yellow-800',
                  healthColor === 'red' && 'bg-red-100 text-red-800'
                )}
              >
                {healthStatus}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Debt to Asset Ratio</span>
                <span>{debtToAssetRatio.toFixed(1)}%</span>
              </div>
              <Progress 
                value={Math.min(debtToAssetRatio, 100)} 
                className="h-2"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(financial_summary?.total_earnings || 0)}
              </div>
              <div className="text-xs text-gray-500">Total Earnings</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">
                {formatCurrency(financial_summary?.total_expenses || 0)}
              </div>
              <div className="text-xs text-gray-500">Total Expenses</div>
            </div>
            
            <div className="text-center">
              <div className={cn(
                'text-lg font-semibold',
                netWorth >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {formatCurrency(netWorth)}
              </div>
              <div className="text-xs text-gray-500">Net Worth</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* System Overview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemCards.map(renderMetricCard)}
        </div>
      </div>

      {/* Financial Overview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {financialCards.map(renderMetricCard)}
        </div>
      </div>

      {/* Activity and Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivitySummary />
        <FinancialHealth />
      </div>
    </div>
  );
};

export default OverviewDashboard;