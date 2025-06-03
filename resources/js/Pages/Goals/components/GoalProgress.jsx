import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCurrency } from '@/hooks/useCurrency.jsx';

export default function GoalProgress({ goal, transactions = [] }) {
  const { formatCurrency } = useCurrency();
  const progress = (goal.current_amount / goal.target_amount) * 100;
  const remainingAmount = goal.target_amount - goal.current_amount;
  
  // Calculate target date info
  const targetDate = new Date(goal.target_date);
  const today = new Date();
  const daysRemaining = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
  const totalDays = Math.ceil((targetDate - new Date(goal.created_at)) / (1000 * 60 * 60 * 24));
  const daysElapsed = totalDays - daysRemaining;
  
  // Calculate average contribution
  const totalContributions = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const avgContribution = transactions.length > 0 
    ? totalContributions / transactions.length 
    : 0;

  // Helper function to determine progress status and color
  const getProgressStatus = () => {
    const expectedProgress = (daysElapsed / totalDays) * 100;
    const actualProgress = progress;
    
    if (actualProgress >= expectedProgress) {
      return {
        status: 'On Track',
        color: 'text-green-600',
        description: 'You are ahead of schedule!'
      };
    } else if (actualProgress >= expectedProgress * 0.8) {
      return {
        status: 'Slightly Behind',
        color: 'text-yellow-600',
        description: 'A little more effort needed to stay on track.'
      };
    } else {
      return {
        status: 'Needs Attention',
        color: 'text-red-600',
        description: 'Consider increasing your contributions to reach your goal.'
      };
    }
  };

  const progressStatus = getProgressStatus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Overall Progress</span>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(goal.current_amount)}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Target Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(goal.target_amount)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Time Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold">{daysRemaining}</p>
                <p className="text-sm text-muted-foreground">Days Left</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {new Date(goal.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Target Date</p>
                  <p className="font-medium">
                    {new Date(goal.target_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className={`text-2xl font-bold ${progressStatus.color}`}>
                  {progressStatus.status}
                </p>
                <p className="text-sm text-muted-foreground">
                  {progressStatus.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Average Contribution</p>
                  <p className="font-medium">{formatCurrency(avgContribution)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="font-medium">{formatCurrency(remainingAmount)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}