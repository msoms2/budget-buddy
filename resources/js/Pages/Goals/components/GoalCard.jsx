import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { CalendarIcon, PencilIcon } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency.jsx';

export default function GoalCard({ goal, onEdit }) {
  const { formatCurrency } = useCurrency();
  const progress = (goal.current_amount / goal.target_amount) * 100;
  const remainingAmount = goal.target_amount - goal.current_amount;
  const targetDate = new Date(goal.target_date);
  const today = new Date();
  const daysRemaining = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{goal.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {goal.category?.name || 'No Category'}
            </p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
            {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2 text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Current</p>
              <p className="font-medium">{formatCurrency(goal.current_amount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Target</p>
              <p className="font-medium">{formatCurrency(goal.target_amount)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="w-4 h-4" />
            <span>{daysRemaining} days remaining</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href={route('goals.show', goal.id)}>View Details</Link>
        </Button>
        <Button onClick={() => onEdit(goal)}>
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}