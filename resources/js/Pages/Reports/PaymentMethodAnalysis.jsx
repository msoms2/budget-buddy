import React from 'react';
import { Head } from '@inertiajs/react';
import ReportsLayout from '@/Layouts/ReportsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ChartWrapper from './components/charts/ChartWrapper';
import { ReportSkeleton } from './components/shared/ReportSkeleton';
import DateRangeSelector from './components/shared/DateRangeSelector';
import AnalysisTypeSelector from './components/shared/AnalysisTypeSelector';
import useReport from './hooks/useReport';
import { useCurrency } from '@/hooks/useCurrency.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PaymentMethodAnalysis({ paymentMethods, paymentMethodTrends, categoryByPaymentMethod, dateRange }) {
    const { formatCurrency } = useCurrency();
    const { isLoading, data, error, handleDateRangeChange, handlePeriodChange } = useReport({
        routeName: 'payment-method-analysis',
        initialData: {
            paymentMethods,
            paymentMethodTrends,
            categoryByPaymentMethod,
            type: 'monthly',
            startDate: dateRange?.start || null,
            endDate: dateRange?.end || null
        }
    });

    if (isLoading) {
        return <ReportSkeleton />;
    }

    // Use either the props passed directly or from the data object
    const methodsData = paymentMethods || data?.paymentMethods || [];
    const trendsData = paymentMethodTrends || data?.paymentMethodTrends || {};
    const categoryData = categoryByPaymentMethod || data?.categoryByPaymentMethod || {};
    
    // Prepare data for the doughnut chart
    const doughnutData = {
        labels: methodsData.map(method => method.name),
        datasets: [
            {
                data: methodsData.map(method => method.total),
                backgroundColor: [
                    '#4CAF50', // Green
                    '#2196F3', // Blue
                    '#F44336', // Red
                    '#FF9800', // Orange
                    '#9C27B0', // Purple
                    '#607D8B', // Blue Gray
                    '#E91E63', // Pink
                    '#795548', // Brown
                    '#FFEB3B', // Yellow
                    '#00BCD4', // Cyan
                ],
                borderWidth: 1
            }
        ]
    };

    // Prepare data for the trends line chart
    const lineChartData = {
        labels: [],
        datasets: []
    };

    // Process trends data for the line chart
    if (Object.keys(trendsData).length > 0) {
        // Get all unique months from all payment methods
        const allMonths = new Set();
        Object.values(trendsData).forEach(methodData => {
            methodData.forEach(item => allMonths.add(item.month));
        });
        
        // Sort months chronologically
        lineChartData.labels = [...allMonths].sort();
        
        // Create a dataset for each payment method
        const colors = [
            '#4CAF50', '#2196F3', '#F44336', '#FF9800', '#9C27B0', 
            '#607D8B', '#E91E63', '#795548', '#FFEB3B', '#00BCD4'
        ];
        
        Object.entries(trendsData).forEach(([methodName, methodData], index) => {
            // Create a map of month to total for this method
            const monthMap = {};
            methodData.forEach(item => {
                monthMap[item.month] = item.total;
            });
            
            // Create dataset with data for all months
            const dataset = {
                label: methodName,
                data: lineChartData.labels.map(month => monthMap[month] || 0),
                borderColor: colors[index % colors.length],
                backgroundColor: `${colors[index % colors.length]}20`,
                tension: 0.3
            };
            
            lineChartData.datasets.push(dataset);
        });
    }

    return (
        <ReportsLayout>
            <Head title="Payment Method Analysis" />

            <div className="space-y-6">
                {/* Report Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Analysis Parameters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <DateRangeSelector
                            startDate={data?.startDate ?? (dateRange?.start ? new Date(dateRange.start) : null)}
                            endDate={data?.endDate ?? (dateRange?.end ? new Date(dateRange.end) : null)}
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
                        <CardTitle>About Payment Method Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            This report provides an in-depth analysis of your spending by payment method.
                            You'll be able to:
                        </p>
                        
                        <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                            <li>Track which payment methods you use most frequently</li>
                            <li>See spending trends by payment method over time</li>
                            <li>Analyze which categories are most associated with each payment method</li>
                            <li>Identify potential areas for optimizing payment method usage</li>
                            <li>Monitor your financial behavior across different payment options</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Payment Method Distribution */}
                {methodsData.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Method Distribution</CardTitle>
                            <CardDescription>How your spending is distributed across payment methods</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <ChartWrapper
                                        type="doughnut"
                                        data={doughnutData}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                
                                <div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Payment Method</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {methodsData.map((method, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{method.name}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(method.total)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Payment Method Trends */}
                {Object.keys(trendsData).length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Method Trends</CardTitle>
                            <CardDescription>How your payment method usage has changed over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartWrapper
                                type="line"
                                data={lineChartData}
                                options={{
                                    responsive: true,
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    },
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                        }
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Categories by Payment Method */}
                {Object.keys(categoryData).length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Categories by Payment Method</CardTitle>
                            <CardDescription>How different payment methods are used across expense categories</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue={Object.keys(categoryData)[0] || ""}>
                                <TabsList className="mb-4">
                                    {Object.keys(categoryData).map((method, index) => (
                                        <TabsTrigger key={index} value={method}>{method}</TabsTrigger>
                                    ))}
                                </TabsList>
                                
                                {Object.entries(categoryData).map(([method, categories], index) => (
                                    <TabsContent key={index} value={method}>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Category</TableHead>
                                                    <TableHead className="text-right">Amount</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {categories.map((category, catIndex) => (
                                                    <TableRow key={catIndex}>
                                                        <TableCell>{category.category}</TableCell>
                                                        <TableCell className="text-right">{formatCurrency(category.total)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>
                )}

                {/* No Data Message */}
                {methodsData.length === 0 && (
                    <Card>
                        <CardContent className="py-8">
                            <div className="text-center text-muted-foreground">
                                <p className="mb-2">No payment method data available for the selected period.</p>
                                <p>Try adjusting your date range or add payment methods to your expenses.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ReportsLayout>
    );
}
