import { Head } from '@inertiajs/react';
import ReportsLayout from '@/Layouts/ReportsLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ChartWrapper from './components/charts/ChartWrapper';
import { ReportSkeleton } from './components/shared/ReportSkeleton';
import DateRangeSelector from './components/shared/DateRangeSelector';
import AnalysisTypeSelector from './components/shared/AnalysisTypeSelector';
import useReport from './hooks/useReport';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function TagAnalysis({ tags, tagBreakdown, tagCombinations, dateRange }) {
    const { isLoading, data, error, handleDateRangeChange, handlePeriodChange } = useReport({
        routeName: 'tag-analysis',
        initialData: {
            tags,
            tagBreakdown,
            tagCombinations,
            type: 'monthly',
            startDate: dateRange?.start || null,
            endDate: dateRange?.end || null
        }
    });

    if (isLoading) {
        return <ReportSkeleton />;
    }

    // Use either the props passed directly or from the data object
    const tagsData = tags || data?.tags || [];
    const breakdownData = tagBreakdown || data?.tagBreakdown || [];
    const combinationsData = tagCombinations || data?.tagCombinations || [];

    return (
        <ReportsLayout>
            <Head title="Tag Analysis" />

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
                        <CardTitle>About Tag Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            This report provides an in-depth analysis of your spending by tags.
                            You'll be able to:
                        </p>
                        
                        <ul className="list-disc pl-6 mb-4 text-muted-foreground space-y-2">
                            <li>See which tags are associated with the most spending</li>
                            <li>Analyze trends in tagged expenses over time</li>
                            <li>Identify common tag combinations</li>
                            <li>Track specific spending categories across different expense types</li>
                            <li>Gain insights into your spending patterns based on custom tags</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* Tag Breakdown Chart */}
                {breakdownData.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Tag Spending Breakdown</CardTitle>
                            <CardDescription>Distribution of expenses by tag</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartWrapper
                                type="doughnut"
                                data={{
                                    labels: breakdownData.map(tag => tag.name),
                                    datasets: [
                                        {
                                            data: breakdownData.map(tag => tag.total),
                                            backgroundColor: breakdownData.map(tag => tag.color || `#${Math.floor(Math.random()*16777215).toString(16)}`),
                                            borderWidth: 1
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
                        </CardContent>
                    </Card>
                )}

                {/* Tag Breakdown Table */}
                {breakdownData.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Tag Details</CardTitle>
                            <CardDescription>Detailed breakdown of spending by tag</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tag</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Transactions</TableHead>
                                        <TableHead className="text-right">Average</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {breakdownData.map((tag, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge 
                                                        style={{ backgroundColor: tag.color || '#888888' }}
                                                        className="text-white"
                                                    >
                                                        {tag.name}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>{tag.total}</TableCell>
                                            <TableCell>{tag.count}</TableCell>
                                            <TableCell className="text-right">
                                                {tag.count > 0 ? (tag.total / tag.count).toFixed(2) : '0.00'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Tag Combinations */}
                {combinationsData.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Common Tag Combinations</CardTitle>
                            <CardDescription>Tags that frequently appear together</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {combinationsData.map((combo, index) => (
                                    <div key={index} className="border rounded-md p-4">
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {combo.tags.map((tag, tagIndex) => (
                                                <Badge 
                                                    key={tagIndex}
                                                    style={{ backgroundColor: tag.color || '#888888' }}
                                                    className="text-white"
                                                >
                                                    {tag.name}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>Appears in {combo.count} transactions</span>
                                            <span>Total: {combo.total}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* No Data Message */}
                {breakdownData.length === 0 && (
                    <Card>
                        <CardContent className="py-8">
                            <div className="text-center text-muted-foreground">
                                <p className="mb-2">No tag data available for the selected period.</p>
                                <p>Try adjusting your date range or add tags to your expenses.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </ReportsLayout>
    );
}