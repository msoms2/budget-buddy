import React, { useRef, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    BarController,
    LineController,
    PieController,
    DoughnutController,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency.jsx";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    BarController,
    LineController,
    PieController,
    DoughnutController,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function ChartWrapper({
    type = 'line',
    data,
    options = {},
    title,
    className,
    height = 350,
}) {
    const { formatCurrency } = useCurrency();
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        // Destroy previous chart instance if it exists
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');

            // Create new chart instance
            chartInstance.current = new ChartJS(ctx, {
                type,
                data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                boxWidth: 6,
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            callbacks: {
                                label: function(context) {
                                    if (context.parsed.y !== null) {
                                        return formatCurrency(context.parsed.y);
                                    }
                                    return null;
                                }
                            },
                            titleColor: 'rgb(255, 255, 255)',
                            bodyColor: 'rgb(255, 255, 255)',
                            padding: 12,
                            boxPadding: 6,
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false,
                            },
                        },
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)',
                            },
                        },
                    },
                    ...options,
                },
            });
        }

        // Cleanup function
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data, options, type]);

    return (
        <Card className={cn("w-full", className)}>
            {title && (
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
            )}
            <CardContent>
                <div style={{ height: height }}>
                    <canvas ref={chartRef} />
                </div>
            </CardContent>
        </Card>
    );
}

// Example usage:
/*
    <ChartWrapper
        type="line"
        title="Monthly Expenses"
        data={{
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [
                {
                    label: 'Expenses',
                    data: [500, 600, 450, 800, 700],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }
            ]
        }}
        options={{
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => `€${context.parsed.y}`
                    }
                }
            }
        }}
    />
*/
