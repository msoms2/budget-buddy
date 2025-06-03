import { Head } from '@inertiajs/react';
import ReportsLayout from '@/Layouts/ReportsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import ChartWrapper from './components/charts/ChartWrapper';
import { ReportSkeleton } from './components/shared/ReportSkeleton';
import useReport from './hooks/useReport';
import { useState, useMemo } from 'react';

export default function ForecastReport({ data: propsData, isLoading: propsLoading, error: propsError }) {
    const [forecastMonths, setForecastMonths] = useState("3");
    const [forecastType, setForecastType] = useState("both");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [trendAnalysis, setTrendAnalysis] = useState("linear");
    
    const { isLoading: localLoading, data: localData, handlePeriodChange } = useReport({
        routeName: 'reports.forecast',
        enabled: !propsData // Only fetch if no data is provided via props
    });

    // Use props if provided, otherwise use local state
    const isLoading = propsLoading ?? localLoading;
    const data = propsData ?? localData;

    // Helper function to get all parameters
    const getParams = (updates = {}) => ({
        forecast_months: updates.months ?? forecastMonths,
        forecast_type: updates.type ?? forecastType,
        trend_analysis: updates.trend ?? trendAnalysis,
        categories: updates.categories ?? selectedCategories
    });

    const handleForecastMonthsChange = (value) => {
        setForecastMonths(value);
        // Trigger data refresh with all parameters
        handlePeriodChange('monthly', getParams({ months: value }));
    };

    const handleForecastTypeChange = (value) => {
        setForecastType(value);
        // Trigger data refresh with all parameters
        handlePeriodChange('monthly', getParams({ type: value }));
    };

    const handleTrendAnalysisChange = (value) => {
        setTrendAnalysis(value);
        // Trigger data refresh with all parameters
        handlePeriodChange('monthly', getParams({ trend: value }));
    };

    const handleCategoriesChange = (value) => {
        setSelectedCategories(value);
        // Trigger data refresh with all parameters
        handlePeriodChange('monthly', getParams({ categories: value }));
    };

    if (isLoading) {
        return <ReportSkeleton />;
    }

    if (propsError) {
        return (
            <Card className="p-4">
                <div className="text-red-500">
                    Error loading forecast data: {propsError.message}
                </div>
            </Card>
        );
    }

    return (
        <ReportsLayout>
            <Head title="Financial Forecast" />

            <div className="space-y-6">
                <h1 className="text-2xl font-semibold">Financial Forecast</h1>

                {/* Forecast Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Generate Forecast</CardTitle>
                        <CardDescription>Configure your financial forecast parameters</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="forecast_months" className="text-sm font-medium">
                                    Forecast Duration (Months)
                                </label>
                                <Select
                                    value={forecastMonths}
                                    onValueChange={handleForecastMonthsChange}
                                >
                                    <SelectTrigger id="forecast_months">
                                        <SelectValue placeholder="Select duration" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 Month</SelectItem>
                                        <SelectItem value="3">3 Months</SelectItem>
                                        <SelectItem value="6">6 Months</SelectItem>
                                        <SelectItem value="12">12 Months</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    How many months into the future should we forecast?
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="forecast_type" className="text-sm font-medium">
                                    Forecast Type
                                </label>
                                <Select
                                    value={forecastType}
                                    onValueChange={handleForecastTypeChange}
                                >
                                    <SelectTrigger id="forecast_type">
                                        <SelectValue placeholder="Select forecast type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="both">Both Income & Expenses</SelectItem>
                                        <SelectItem value="income">Income Only</SelectItem>
                                        <SelectItem value="expenses">Expenses Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="trend_analysis" className="text-sm font-medium">
                                    Trend Analysis Method
                                </label>
                                <Select
                                    value={trendAnalysis}
                                    onValueChange={(value) => {
                                        setTrendAnalysis(value);
                                        handlePeriodChange('monthly', {
                                            forecast_months: forecastMonths,
                                            forecast_type: forecastType,
                                            trend_analysis: value,
                                            categories: selectedCategories
                                        });
                                    }}
                                >
                                    <SelectTrigger id="trend_analysis">
                                        <SelectValue placeholder="Select analysis method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="linear">Linear Regression</SelectItem>
                                        <SelectItem value="moving_average">Moving Average</SelectItem>
                                        <SelectItem value="exponential">Exponential Smoothing</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    Choose how we analyze and project your financial trends
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="categories" className="text-sm font-medium">
                                    Filter by Categories
                                </label>
                                <Select
                                    value={selectedCategories}
                                    onValueChange={(value) => {
                                        setSelectedCategories(value);
                                        handlePeriodChange('monthly', {
                                            forecast_months: forecastMonths,
                                            forecast_type: forecastType,
                                            trend_analysis: trendAnalysis,
                                            categories: value
                                        });
                                    }}
                                >
                                    <SelectTrigger id="categories">
                                        <SelectValue placeholder="Select categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {data?.categories?.map(category => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    Focus your forecast on specific financial categories
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* About Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>About Financial Forecasting</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <p className="text-muted-foreground mb-4">
                                Financial forecasting helps you plan for the future by predicting your income and expenses based on historical patterns.
                                Our forecasting system:
                            </p>
                            
                            <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                                <li>Uses your past 6 months of financial data to identify trends</li>
                                <li>Projects future income and expenses based on these trends</li>
                                <li>Calculates expected savings or deficits for upcoming months</li>
                                <li>Provides visualizations to help you understand future financial patterns</li>
                                <li>Helps you plan for upcoming expenses or income changes</li>
                            </ul>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                                How Our Forecast Works
                            </h3>
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                We analyze your monthly income and expense trends, calculate the average rate of change, and project these trends forward.
                                The forecast becomes less certain the further into the future it extends, so use longer forecasts as general guidance rather than exact predictions.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Section - Only shown when data is available */}
                {data?.results && (
                    <Tabs defaultValue="trends" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
                            <TabsTrigger value="monthly">Monthly Breakdown</TabsTrigger>
                            <TabsTrigger value="predictions">Predictions</TabsTrigger>
                        </TabsList>

                        <TabsContent value="trends" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Historical vs Projected Trends</CardTitle>
                                    <CardDescription>
                                        Comparing past performance with future projections
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[400px]">
                                        <ChartWrapper
                                            type="line"
                                            data={data.results.trendData}
                                            options={{
                                                responsive: true,
                                                interaction: {
                                                    mode: 'index',
                                                    intersect: false,
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        title: {
                                                            display: true,
                                                            text: 'Amount'
                                                        }
                                                    },
                                                    x: {
                                                        title: {
                                                            display: true,
                                                            text: 'Timeline'
                                                        }
                                                    }
                                                },
                                                plugins: {
                                                    tooltip: {
                                                        callbacks: {
                                                            label: (context) => {
                                                                return `${context.dataset.label}: ${context.formattedValue}`;
                                                            }
                                                        }
                                                    },
                                                    legend: {
                                                        position: 'top'
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="monthly" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Monthly Analysis</CardTitle>
                                    <CardDescription>
                                        Detailed monthly income and expense projections
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[400px]">
                                        <ChartWrapper
                                            type="bar"
                                            data={data.results.monthlyData}
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    legend: {
                                                        position: 'top',
                                                    }
                                                },
                                                scales: {
                                                    x: {
                                                        stacked: true,
                                                    },
                                                    y: {
                                                        stacked: true
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="predictions" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Forecast Predictions</CardTitle>
                                    <CardDescription>
                                        Monthly forecast with confidence intervals
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[400px]">
                                        <ChartWrapper
                                            type="line"
                                            data={data.results.predictionData}
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    tooltip: {
                                                        mode: 'index',
                                                        intersect: false,
                                                    },
                                                    legend: {
                                                        position: 'top'
                                                    }
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true
                                                    }
                                                }
                                            }}
                                        />
                                    </div>

                                    {data.results.keyMetrics && (
                                        <div className="grid grid-cols-3 gap-4 mt-6">
                                            <div className="text-center p-4 bg-muted rounded-lg">
                                                <h4 className="font-medium">Projected Growth</h4>
                                                <p className="text-2xl font-bold mt-2">
                                                    {data.results.keyMetrics.projectedGrowth}%
                                                </p>
                                            </div>
                                            <div className="text-center p-4 bg-muted rounded-lg">
                                                <h4 className="font-medium">Confidence Level</h4>
                                                <p className="text-2xl font-bold mt-2">
                                                    {data.results.keyMetrics.confidenceLevel}%
                                                </p>
                                            </div>
                                            <div className="text-center p-4 bg-muted rounded-lg">
                                                <h4 className="font-medium">Forecast Accuracy</h4>
                                                <p className="text-2xl font-bold mt-2">
                                                    {data.results.keyMetrics.accuracy}%
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                )}

                {!data?.results && !isLoading && !propsError && (
                    <Alert>
                        <AlertDescription>
                            No forecast data available. Try adjusting your parameters or ensure you have sufficient historical data.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </ReportsLayout>
    );
}