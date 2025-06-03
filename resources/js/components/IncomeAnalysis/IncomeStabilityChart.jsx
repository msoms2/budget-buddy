import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function IncomeStabilityChart({ data, isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Income Stability</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  // Handle the case where data structure might be different
  // Extract values from the data object safely
  const stabilityScore = data?.stabilityScore || 0;
  const monthlyData = data?.monthlyData || [];
  const variance = data?.monthlyVariance || 0;
  const trend = data?.trend === 'increasing' ? 1 : (data?.trend === 'decreasing' ? -1 : 0);
  
  // Calculate average income
  const averageIncome = monthlyData.length > 0 
    ? monthlyData.reduce((sum, item) => sum + Number(item.total_amount), 0) / monthlyData.length 
    : 0;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const calculateTrendColor = (trend) => {
    if (trend > 0) return "#10B981"; // Green for increasing
    if (trend < 0) return "#EF4444"; // Red for decreasing
    return "#6B7280"; // Gray for neutral
  };

  // Transform monthly data for the chart
  const chartData = monthlyData.map(item => ({
    month: item.month,
    income: Number(item.total_amount)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Stability</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(120, 120, 120, 0.2)" 
              />
              <XAxis 
                dataKey="month" 
                stroke="currentColor" 
                tick={{ fill: 'currentColor' }}
              />
              <YAxis
                tickFormatter={formatCurrency}
                domain={['auto', 'auto']}
                stroke="currentColor"
                tick={{ fill: 'currentColor' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "6px",
                  border: "none",
                  padding: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  color: "#000",
                }}
                formatter={(value) => [formatCurrency(value), "Income"]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <ReferenceLine
                y={averageIncome}
                stroke="#666"
                strokeDasharray="3 3"
                label={{ value: "Average", position: "right", fill: 'currentColor' }}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-2 bg-muted/50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Stability Score</span>
            <span 
              className="text-sm font-semibold"
              style={{ color: calculateTrendColor(trend) }}
            >
              {(stabilityScore / 10).toFixed(1)}/10
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Monthly Variance</span>
            <span className="text-sm text-muted-foreground">
              ±{((variance || 0) * 100).toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Trend</span>
            <span 
              className="text-sm font-semibold"
              style={{ color: calculateTrendColor(trend) }}
            >
              {trend > 0 ? "Increasing" : (trend < 0 ? "Decreasing" : "Stable")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}