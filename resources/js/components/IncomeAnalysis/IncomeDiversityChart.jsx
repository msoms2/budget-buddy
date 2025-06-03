import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Alert, AlertDescription } from "../ui/alert";

export default function IncomeDiversityChart({ data, isLoading, error }) {
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Income Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Income Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse h-48 w-48 rounded-full bg-gray-200 dark:bg-gray-700" />
        </CardContent>
      </Card>
    );
  }

  const COLORS = [
    "#0088FE",
    "#00C49F", 
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  // Always visible text colors based on background
  const getTextColor = (background) => {
    // Logic to determine high contrast text color
    const isDark = background => {
      // Convert hex to RGB
      const hex = background.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // Calculate luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.5;
    };
    
    return isDark(background) ? "white" : "black";
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
    const fill = getTextColor(COLORS[index % COLORS.length]);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill={fill}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {name} ({(percent * 100).toFixed(0)}%)
      </text>
    ) : null;
  };

  // Safely check if data.sources is a valid array with items
  const hasValidSources = Array.isArray(data?.sources) && data.sources.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-[300px]">
            {hasValidSources ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.sources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {data.sources.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderRadius: "6px",
                      border: "none",
                      padding: "8px",
                      boxShadow: "var(--shadow-md)",
                      color: "var(--foreground)",
                    }}
                    formatter={(value, name) => [
                      `$${value.toLocaleString()}`,
                      `Source: ${name}`,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <p>No income data available</p>
                <p className="text-sm mt-2">Add some income sources to see the distribution</p>
              </div>
            )}
          </div>
          {(data?.primarySource?.percentage || data?.secondarySource?.percentage) && (
            <div className="space-y-2 bg-muted/50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm font-medium">Key Insights</p>
              {data?.primarySource?.percentage && (
                <p className="text-sm text-muted-foreground">
                  Primary Source: {data.primarySource.name} (
                  {Math.round(data.primarySource.percentage)}%)
                </p>
              )}
              {data?.secondarySource?.percentage && (
                <p className="text-sm text-muted-foreground">
                  Secondary Source: {data.secondarySource.name} (
                  {Math.round(data.secondarySource.percentage)}%)
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
