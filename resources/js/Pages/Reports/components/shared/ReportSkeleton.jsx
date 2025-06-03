import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ReportsLayout from "@/Layouts/ReportsLayout";

export function ChartSkeleton() {
    return (
        <Card>
            <CardHeader className="space-y-2">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[350px] w-full" />
            </CardContent>
        </Card>
    );
}

export function StatCardSkeleton() {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-1/3" />
                </div>
            </CardContent>
        </Card>
    );
}

export function TableSkeleton({ rows = 5 }) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/4 mb-4" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Header */}
                    <div className="flex gap-4">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/3" />
                    </div>
                    {/* Rows */}
                    {Array.from({ length: rows }).map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-1/3" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function ReportSkeleton() {
    return (
        <ReportsLayout>
            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </div>

                {/* Charts */}
                <div className="grid gap-6 md:grid-cols-2">
                    <ChartSkeleton />
                    <ChartSkeleton />
                </div>

                {/* Table */}
                <TableSkeleton />
            </div>
        </ReportsLayout>
    );
}

// Also export as default for backward compatibility
export default ReportSkeleton;

// Example usage:
/*
    // For full page loading
    <ReportSkeleton />

    // For individual components
    <ChartSkeleton />
    <StatCardSkeleton />
    <TableSkeleton rows={8} />
*/
