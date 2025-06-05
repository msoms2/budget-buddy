import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function IncomeAnalysisOverview({ data, isLoading, error }) {
  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-500">{error.message}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Diversity Score</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-9 w-[100px]" />
          ) : (
            <div className="text-2xl font-bold">
              {Number(data?.diversityScore || 0).toFixed(1)}/10
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Based on income source distribution
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recurring Income</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-9 w-[100px]" />
          ) : (
            <div className="text-2xl font-bold">
              {(Number(data?.recurringPercentage || 0) * 100).toFixed(0)}%
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Of total monthly income
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
