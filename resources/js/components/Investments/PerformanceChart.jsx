import * as React from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useCurrency } from '@/hooks/useCurrency.jsx';
import { TrendingUpIcon } from "lucide-react";

export default function PerformanceChart({ data, title = "Performance Over Time" }) {
  const { formatCurrency } = useCurrency();
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-center text-muted-foreground">
        <div>
          <TrendingUpIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No performance data available</p>
          <p className="text-sm mt-1">Performance tracking will begin after you add performance logs</p>
        </div>
      </div>
    );
  }

  // Format currency values for Y-axis to be more compact
  const formatYAxisCurrency = (value) => {
    if (value >= 1000000) {
      return formatCurrency(value / 1000000) + 'M';
    } else if (value >= 1000) {
      return formatCurrency(value / 1000) + 'K';
    } else {
      return formatCurrency(value);
    }
  };

  return (
    <div className="w-full aspect-[2/1]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 60,
            bottom: 5,
          }}
        >
          <XAxis
            dataKey="date"
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
            stroke="#888888"
            fontSize={12}
          />
          <YAxis
            tickFormatter={formatYAxisCurrency}
            stroke="#888888"
            fontSize={12}
            width={50}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Date
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {new Date(payload[0].payload.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Value
                        </span>
                        <span className="font-bold">
                          {formatCurrency(payload[0].value)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              style: { fill: "hsl(var(--primary))" },
            }}
            style={{
              stroke: "hsl(var(--primary))",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
