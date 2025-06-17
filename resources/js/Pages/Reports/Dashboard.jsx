import React from 'react';
import { Head } from '@inertiajs/react';
import ReportsLayout from '@/Layouts/ReportsLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChartWrapper from './components/charts/ChartWrapper';
import { ReportSkeleton } from './components/shared/ReportSkeleton';
import useReport from './hooks/useReport';
import { useCurrency } from '@/hooks/useCurrency.jsx';

function StatCard({ title, value, trend = null }) {
    const { formatCurrency } = useCurrency();
    const valueFormatted = typeof value === 'number' ? 
        formatCurrency(value) : 
        value;

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold">{valueFormatted}</p>
                    {trend !== null && (
                        <p className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend >= 0 ? '+' : ''}{trend}%
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function BudgetStatusCard({ budget }) {
    const { formatCurrency } = useCurrency();
    const percentUsed = Math.round(budget.percent_used);
    const isOverBudget = percentUsed > 100;
    const progressColor = isOverBudget ? 'bg-red-500' : 'bg-blue-500';

    return (
        <div className="flex items-center justify-between space-x-4">
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-muted-foreground">{budget.name}</p>
                <div className="mt-1 w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                        className={`h-full ${progressColor}`}
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                    />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.budget_amount)}
                </p>
            </div>
        </div>
    );
}

export default function Dashboard({ 
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    savingsRate,
    budgets,
    recentExpenseReports,
    recentEarningReports,
    topExpenseCategories,
    topTags,
    paymentMethods,
}) {
    const { isLoading } = useReport({
        routeName: 'reports',
        preserveState: true,
    });
    
    const { formatCurrency } = useCurrency();

    if (isLoading) {
        return <ReportSkeleton />;
    }

    const monthlyStats = [
        { id: 'income', title: 'Monthly Income', value: monthlyIncome },
        { id: 'expenses', title: 'Monthly Expenses', value: monthlyExpenses },
        { id: 'savings', title: 'Net Savings', value: monthlySavings, trend: savingsRate },
    ];

    return (
        <ReportsLayout>
            <Head title="Reports Dashboard" />

            <div className="space-y-6">
                {/* Monthly Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    {monthlyStats.map((stat) => (
                        <StatCard key={stat.id} {...stat} />
                    ))}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Active Budgets */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Budget Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {budgets.length > 0 ? (
                                budgets.map((budget, index) => (
                                    <BudgetStatusCard 
                                        key={budget.id ? `budget-${budget.id}` : `budget-index-${index}`} 
                                        budget={budget} 
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No active budgets.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Categories */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Top Expense Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartWrapper
                                type="bar"
                                data={{
                                    labels: topExpenseCategories.map(cat => cat.name),
                                    datasets: [{
                                        label: 'Amount',
                                        data: topExpenseCategories.map(cat => cat.total),
                                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                                    }]
                                }}
                                height={300}
                                options={{
                                    plugins: {
                                        legend: {
                                            display: false,
                                        }
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Payment Methods */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {paymentMethods.map((method) => (
                                <div key={`payment-${method.id}`} className="text-center p-4 bg-muted rounded-lg">
                                    <p className="font-medium">{method.name}</p>
                                    <p className="text-lg font-bold mt-1">
                                        {formatCurrency(method.total)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ReportsLayout>
    );
}
