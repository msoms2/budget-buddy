import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from '@/hooks/useCurrency.jsx';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip
} from 'recharts';

export default function SubcategoryAnalysis({ subcategories, categoryTotals, period }) {
    const [selectedPeriod, setSelectedPeriod] = useState(period || 'month');
    
    // Calculate percentages and prepare data for the pie chart
    const total = subcategories.reduce((sum, sub) => sum + parseFloat(sub.total), 0);
    const chartData = subcategories.map(sub => ({
        name: sub.name,
        value: parseFloat(sub.total),
        percentage: ((parseFloat(sub.total) / total) * 100).toFixed(1)
    }));

    // Custom colors for the pie chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    // Use the centralized currency hook
    const { formatCurrency } = useCurrency();

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Subcategory Breakdown</CardTitle>
                        <CardDescription>Detailed spending analysis by subcategory</CardDescription>
                    </div>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="quarter">This Quarter</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Pie Chart */}
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Detailed Breakdown</h4>
                        <div className="space-y-2">
                            {chartData.map((item, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className="text-sm">{item.name}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-medium">{formatCurrency(item.value)}</span>
                                        <span className="text-muted-foreground ml-2">({item.percentage}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}