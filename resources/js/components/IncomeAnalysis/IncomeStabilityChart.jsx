import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
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
import { ShieldIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react";

export default function IncomeStabilityChart({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
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

  // Get score color and risk level based on stability score
  const getScoreColor = (score) => {
    if (score >= 7) return "text-green-600 bg-green-50 dark:bg-green-900/20";
    if (score >= 4) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
    return "text-red-600 bg-red-50 dark:bg-red-900/20";
  };

  const getRiskLevel = (score) => {
    if (score >= 7) return { level: "Low", variant: "default" };
    if (score >= 4) return { level: "Medium", variant: "secondary" };
    return { level: "High", variant: "destructive" };
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUpIcon className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDownIcon className="h-4 w-4 text-red-600" />;
    return <MinusIcon className="h-4 w-4 text-gray-600" />;
  };

  // Transform monthly data for the chart
  const chartData = monthlyData.map(item => ({
    month: item.month,
    income: Number(item.total_amount)
  }));

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Stability Score Header - Compact */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/20">
            <ShieldIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <div className="text-xl font-bold">
              {Number(stabilityScore || 0).toFixed(1)}/10
            </div>
            <p className="text-xs text-muted-foreground">Stability Score</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getRiskLevel(stabilityScore).variant} className="text-xs">
            {getRiskLevel(stabilityScore).level} Risk
          </Badge>
          <div className="flex items-center gap-1">
            {getTrendIcon(trend)}
            <span className="text-xs font-medium" style={{ color: calculateTrendColor(trend) }}>
              {trend > 0 ? "↗" : (trend < 0 ? "↘" : "→")}
            </span>
          </div>
        </div>
      </div>

      {/* Chart - Takes remaining space */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 15,
              left: 15,
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
              tick={{ fill: 'currentColor', fontSize: 11 }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              domain={['auto', 'auto']}
              stroke="currentColor"
              tick={{ fill: 'currentColor', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "6px",
                border: "none",
                padding: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                color: "#000",
                fontSize: "12px"
              }}
              formatter={(value) => [formatCurrency(value), "Income"]}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <ReferenceLine
              y={averageIncome}
              stroke="#666"
              strokeDasharray="2 2"
              label={{ value: "Avg", position: "right", fill: 'currentColor', fontSize: 10 }}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#10B981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#10B981" }}
              activeDot={{ r: 5, fill: "#10B981" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Compact Metrics Row */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
        <div className="text-center">
          <div className="text-sm font-semibold">
            {Number(stabilityScore || 0).toFixed(1)}/10
          </div>
          <p className="text-xs text-muted-foreground">Score</p>
        </div>
        
        <div className="text-center">
          <div className="text-sm font-semibold">
            ±{((variance || 0) * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">Variance</p>
        </div>

        <div className="text-center">
          <div className="text-sm font-semibold">
            {formatCurrency(averageIncome)}
          </div>
          <p className="text-xs text-muted-foreground">Avg Income</p>
        </div>
      </div>
    </div>
  );
}