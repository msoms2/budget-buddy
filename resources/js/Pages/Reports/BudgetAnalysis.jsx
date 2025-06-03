import { Head } from '@inertiajs/react';
import ReportsLayout from '@/Layouts/ReportsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ChartWrapper from './components/charts/ChartWrapper';
import { ReportSkeleton } from './components/shared/ReportSkeleton';
import DateRangeSelector from './components/shared/DateRangeSelector';
import AnalysisTypeSelector from './components/shared/AnalysisTypeSelector';
import useReport from './hooks/useReport';
import { Progress } from "@/components/ui/progress";
import { Badge } from '@/components/ui/badge';

export default function BudgetAnalysis({ budgets, spendingPace, categoryBreakdown }) {
    const { isLoading, data, error, handleDateRangeChange, handlePeriodChange } = useReport({
        routeName: 'budget-analysis',
        initialData: {
            budgets,
            spendingPace,
            categoryBreakdown,
            type: 'monthly',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
        },
        defaultPeriod: 'monthly',
        defaultDateRange: {
            from: new Date(),
            to: new Date()
        }
    });

    if (isLoading) {
        return <ReportSkeleton />;
    }

    return (
        <ReportsLayout>
            <Head title="Budget Analysis" />

            <div className="space-y-6">
                {/* Report Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Analysis Parameters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <DateRangeSelector
                            startDate={data?.startDate ?? null}
                            endDate={data?.endDate ?? null}
                            onDateChange={handleDateRangeChange}
                        />
                        <AnalysisTypeSelector
                            value={data?.type ?? 'monthly'}
                            onChange={handlePeriodChange}
                        />
                        {error && (
                            <div className="text-sm text-red-500 mt-2">
                                {error}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* About Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>About Budget Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            This report provides an in-depth analysis of your budget performance.
                            You'll be able to:
                        </p>
                        
                        <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                            <li>Track your spending against budget allocations</li>
                            <li>See if you're spending too quickly or have room to spare</li>
                            <li>Analyze budget utilization by category</li>
                            <li>Identify potential budget adjustments</li>
                            <li>View detailed breakdowns of your financial discipline</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Active Budgets Section */}
                {((data?.budgets || budgets)) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Budgets</CardTitle>
                            <CardDescription>Your current budget utilization</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {(data?.budgets || budgets || []).map((budget, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{budget.name}</span>
                                            <span>{budget.spent} / {budget.budget_amount} ({Math.round(budget.percent_used)}%)</span>
                                        </div>
                                        <Progress value={budget.percent_used} className="h-2" />
                                    </div>
                                ))}
                                
                                {(data?.budgets || budgets || []).length === 0 && (
                                    <p className="text-muted-foreground">No active budgets found.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Spending Pace Section */}
                {(data?.spendingPace || spendingPace) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Spending Pace</CardTitle>
                            <CardDescription>How quickly you're spending compared to your budget period</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y">
                                {(data?.spendingPace || spendingPace || []).map((item, index) => (
                                    <div key={index} className="py-4 flex justify-between items-center">
                                        <div>
                                            <h4 className="font-medium">{item.name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {item.percent_time_passed}% of time passed, {item.percent_spent}% of budget used
                                            </p>
                                        </div>
                                        <Badge variant={
                                            item.status === 'over' ? 'destructive' : 
                                            item.status === 'under' ? 'secondary' : 
                                            'outline'
                                        }>
                                            {item.status === 'over' ? 'Spending too fast' : 
                                             item.status === 'under' ? 'Spending under pace' : 
                                             'On track'}
                                        </Badge>
                                    </div>
                                ))}
                                
                                {(data?.spendingPace || spendingPace || []).length === 0 && (
                                    <p className="text-muted-foreground py-4">No spending pace data available.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Category Breakdown Section */}
                {(data?.categoryBreakdown || categoryBreakdown) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Breakdown</CardTitle>
                            <CardDescription>Your spending by category compared to budgeted amounts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {(data?.categoryBreakdown || categoryBreakdown || []).length > 0 ? (
                                <div className="space-y-4">
                                    {(data?.categoryBreakdown || categoryBreakdown).map((category, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">{category.name}</span>
                                                <span>{category.spent} / {category.budget} ({category.percent}%)</span>
                                            </div>
                                            <Progress 
                                                value={category.percent} 
                                                className="h-2" 
                                                style={{ backgroundColor: `${category.color}20` }} // Light version of the color for background
                                            >
                                                <div 
                                                    className="h-full" 
                                                    style={{ backgroundColor: category.color }} 
                                                />
                                            </Progress>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <ChartWrapper
                                    type="doughnut"
                                    data={{
                                        labels: (data?.categoryBreakdown || categoryBreakdown || []).map(c => c.name),
                                        datasets: [
                                            {
                                                data: (data?.categoryBreakdown || categoryBreakdown || []).map(c => c.spent),
                                                backgroundColor: (data?.categoryBreakdown || categoryBreakdown || []).map(c => c.color),
                                            }
                                        ]
                                    }}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                            }
                                        }
                                    }}
                                />
                            )}
                            
                            {(data?.categoryBreakdown || categoryBreakdown || []).length === 0 && (
                                <p className="text-muted-foreground">No category breakdown data available.</p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </ReportsLayout>
    );
}