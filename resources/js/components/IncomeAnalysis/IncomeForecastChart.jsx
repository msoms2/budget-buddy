import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function IncomeForecastChart({ data, isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>6-Month Income Forecast</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  // Safely extract forecast data with defaults
  const forecast = data?.forecast || [];
  const totalForecast = data?.totalForecast || 0;
  const averageMonthly = data?.averageMonthly || 0;
  const forecastConfidence = data?.forecastConfidence || 0;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-lg border dark:border-gray-700">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
          {payload[0].payload.confidence && (
            <p className="text-sm text-muted-foreground mt-2">
              Confidence: {(payload[0].payload.confidence * 100).toFixed(0)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Check if we have forecast data to display
  if (!Array.isArray(forecast) || forecast.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>6-Month Income Forecast</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>No forecast data available</p>
            <p className="text-sm mt-2">Add more income history to generate a forecast</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>6-Month Income Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={forecast}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
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
                stroke="currentColor"
                tick={{ fill: 'currentColor' }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Confidence Interval Area */}
              <Area
                type="monotone"
                dataKey="upperBound"
                stroke="none"
                fill="#E5E7EB"
                fillOpacity={0.3}
                name="Confidence Range"
              />
              <Area
                type="monotone"
                dataKey="lowerBound"
                stroke="none"
                fill="#E5E7EB"
                fillOpacity={0.3}
                name=" "
              />

              {/* Recurring Income */}
              <Area
                type="monotone"
                dataKey="recurringIncome"
                stackId="1"
                stroke="#2563EB"
                fill="#2563EB"
                fillOpacity={0.6}
                name="Recurring Income"
              />

              {/* Variable Income */}
              <Area
                type="monotone"
                dataKey="variableIncome"
                stackId="1"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.6}
                name="Variable Income"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 space-y-2 bg-muted/50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Expected Total (6mo)</p>
              <p className="text-lg font-semibold">
                {formatCurrency(totalForecast)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Average Monthly</p>
              <p className="text-lg font-semibold">
                {formatCurrency(averageMonthly)}
              </p>
            </div>
          </div>
          
          <div className="pt-2">
            <p className="text-sm font-medium">Forecast Confidence</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-grow h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${Math.max(0, Math.min(100, (forecastConfidence * 100).toFixed(0)))}%`,
                  }}
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {(forecastConfidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}