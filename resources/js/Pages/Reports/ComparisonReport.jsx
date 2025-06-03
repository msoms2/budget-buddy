import { Head } from '@inertiajs/react';
import ReportsLayout from '@/Layouts/ReportsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ChartWrapper from './components/charts/ChartWrapper';
import { ReportSkeleton } from './components/shared/ReportSkeleton';
import DateRangeSelector from './components/shared/DateRangeSelector';
import AnalysisTypeSelector from './components/shared/AnalysisTypeSelector';
import useReport from './hooks/useReport';

export default function ComparisonReport() {
    const { isLoading, data, error, handleDateRangeChange, handlePeriodChange } = useReport({
        routeName: 'reports',
    });
    if (isLoading) {
        return <ReportSkeleton />;
    }

    return (
        <ReportsLayout>
            <Head title="Income vs Expenses Analysis" />

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
                            value={data?.type ?? 'daily'}
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
                        <CardTitle>About Income vs Expense Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            This report provides an in-depth comparison of your income and expenses over a specified period.
                            You'll be able to:
                        </p>
                        
                        <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                            <li>Compare income vs expenses trends over time</li>
                            <li>Identify spending patterns related to your income</li>
                            <li>Analyze your savings rate month-to-month</li>
                            <li>Break down income and expenses by category</li>
                            <li>See detailed visualizations of your financial health</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Results Section - Only shown when data is available and no errors */}
                {data?.results && !error && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Analysis Results</CardTitle>
                            {error && <CardDescription className="text-red-500">{error}</CardDescription>}
                        </CardHeader>
                        <CardContent>
                            <ChartWrapper
                                type="line"
                                data={data.results.chartData}
                                options={{
                                    responsive: true,
                                    interaction: {
                                        mode: 'index',
                                        intersect: false,
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                        }
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>
        </ReportsLayout>
    );
}