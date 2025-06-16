import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import { useCurrency } from "@/hooks/useCurrency";

export default function IncomeAnalysisOverview({ data, isLoading, error }) {
  const { formatCurrency } = useCurrency();

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

  // Get top income sources for the overview card
  const topSources = Array.isArray(data?.sources) ? data.sources.slice(0, 3) : [];
  const totalSources = Array.isArray(data?.sources) ? data.sources.length : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
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

      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Income Sources Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : totalSources > 0 ? (
            <div className="space-y-2">
              <div className="text-2xl font-bold mb-2">
                {totalSources} {totalSources === 1 ? 'Source' : 'Sources'}
              </div>
              <div className="space-y-1">
                {topSources.map((source, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground truncate max-w-[120px]">
                      {source.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {source.percentage?.toFixed(0) || 0}%
                    </Badge>
                  </div>
                ))}
                {totalSources > 3 && (
                  <div className="text-xs text-muted-foreground text-center pt-1">
                    +{totalSources - 3} more sources
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">0</div>
              <p className="text-xs text-muted-foreground">
                No income sources found
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
