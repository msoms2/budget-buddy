import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  BarChart3Icon,
  PieChartIcon,
  LineChartIcon,
  TargetIcon,
  ActivityIcon,
  DollarSignIcon,
  ShieldIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  ArrowUpRightIcon
} from "lucide-react";
import IncomeAnalysisOverview from "@/components/IncomeAnalysis/IncomeAnalysisOverview";
import IncomeDiversityChart from "@/components/IncomeAnalysis/IncomeDiversityChart";
import IncomeStabilityChart from "@/components/IncomeAnalysis/IncomeStabilityChart";
import IncomeForecastChart from "@/components/IncomeAnalysis/IncomeForecastChart";

function LoadingSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            {/* Header skeleton */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-6 w-96" />
                </div>
                <Skeleton className="h-10 w-80" />
            </div>
            
            {/* Metrics cards skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="h-32 w-full" />
                    </div>
                ))}
            </div>
            
            {/* Content skeleton */}
            <div className="space-y-6">
                <Skeleton className="h-[400px] w-full" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-[350px]" />
                    <Skeleton className="h-[350px]" />
                </div>
            </div>
        </div>
    );
}

export default function IncomeAnalysis({ incomeAnalysis, isLoading, error }) {
    const [activeTab, setActiveTab] = useState('overview');
    
    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    // Get risk level and styling for scores
    const getRiskLevel = (score) => {
        if (score >= 7) return { level: "Low", variant: "default", color: "text-green-600" };
        if (score >= 4) return { level: "Medium", variant: "secondary", color: "text-yellow-600" };
        return { level: "High", variant: "destructive", color: "text-red-600" };
    };

    return (
        <SidebarProvider>
            <Head title="Income Analysis - Statistics" />
            <AppSidebar />
            
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={route('statistics.index')}>Statistics</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Income Analysis</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
                    {error ? (
                        <Alert variant="destructive" className="border-destructive/50">
                            <AlertCircleIcon className="h-4 w-4" />
                            <AlertTitle>Error Loading Data</AlertTitle>
                            <AlertDescription className="flex items-center justify-between">
                                <span>Failed to load income analysis data. Please try refreshing the page.</span>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.location.reload()}
                                    className="ml-4"
                                >
                                    <RefreshCwIcon className="h-4 w-4 mr-2" />
                                    Refresh
                                </Button>
                            </AlertDescription>
                        </Alert>
                    ) : isLoading ? (
                        <LoadingSkeleton />
                    ) : (
                        <>
                            {/* Enhanced Header Section */}
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                            <BarChart3Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        Income Analysis
                                    </h1>
                                    <p className="text-muted-foreground text-lg">
                                        Comprehensive analysis of your income streams, stability, and forecasts
                                    </p>
                                </div>
                                
                                {/* Enhanced Tab Navigation */}
                                <div className="flex bg-muted/50 rounded-xl p-1 border">
                                    <Button
                                        variant={activeTab === 'overview' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setActiveTab('overview')}
                                        className={`rounded-lg transition-all duration-200 ${
                                            activeTab === 'overview' 
                                                ? 'bg-background shadow-sm border' 
                                                : 'hover:bg-muted/80'
                                        }`}
                                    >
                                        <ActivityIcon className="h-4 w-4 mr-2" />
                                        Overview
                                    </Button>
                                    <Button
                                        variant={activeTab === 'diversity' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setActiveTab('diversity')}
                                        className={`rounded-lg transition-all duration-200 ${
                                            activeTab === 'diversity' 
                                                ? 'bg-background shadow-sm border' 
                                                : 'hover:bg-muted/80'
                                        }`}
                                    >
                                        <PieChartIcon className="h-4 w-4 mr-2" />
                                        Diversity
                                    </Button>
                                    <Button
                                        variant={activeTab === 'stability' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setActiveTab('stability')}
                                        className={`rounded-lg transition-all duration-200 ${
                                            activeTab === 'stability' 
                                                ? 'bg-background shadow-sm border' 
                                                : 'hover:bg-muted/80'
                                        }`}
                                    >
                                        <LineChartIcon className="h-4 w-4 mr-2" />
                                        Stability
                                    </Button>
                                    <Button
                                        variant={activeTab === 'forecast' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setActiveTab('forecast')}
                                        className={`rounded-lg transition-all duration-200 ${
                                            activeTab === 'forecast' 
                                                ? 'bg-background shadow-sm border' 
                                                : 'hover:bg-muted/80'
                                        }`}
                                    >
                                        <TargetIcon className="h-4 w-4 mr-2" />
                                        Forecast
                                    </Button>
                                </div>
                            </div>

                            {/* Enhanced Key Metrics Cards */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Card className="relative overflow-hidden border-0 shadow-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Diversity Score</CardTitle>
                                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                                            <PieChartIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {Number(incomeAnalysis?.diversityScore || 0).toFixed(1)}/10
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-xs text-muted-foreground">
                                                Income source distribution
                                            </p>
                                            <Badge variant={getRiskLevel(incomeAnalysis?.diversityScore || 0).variant} className="text-xs">
                                                {getRiskLevel(incomeAnalysis?.diversityScore || 0).level} Risk
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card className="relative overflow-hidden border-0 shadow-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Stability Score</CardTitle>
                                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                                            <ShieldIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {Number(incomeAnalysis?.stabilityScore || 0).toFixed(1)}/10
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-xs text-muted-foreground">
                                                Income consistency
                                            </p>
                                            <Badge variant={getRiskLevel(incomeAnalysis?.stabilityScore || 0).variant} className="text-xs">
                                                {getRiskLevel(incomeAnalysis?.stabilityScore || 0).level} Risk
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card className="relative overflow-hidden border-0 shadow-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Recurring Income</CardTitle>
                                        <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                                            <TrendingUpIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {(Number(incomeAnalysis?.recurringPercentage || 0) * 100).toFixed(0)}%
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-xs text-muted-foreground">
                                                Of total monthly income
                                            </p>
                                            <Badge variant={incomeAnalysis?.recurringPercentage > 0.7 ? "default" : "secondary"} className="text-xs">
                                                {incomeAnalysis?.recurringPercentage > 0.7 ? "Stable" : "Variable"}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card className="relative overflow-hidden border-0 shadow-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">6-Month Forecast</CardTitle>
                                        <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/20">
                                            <TargetIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {formatCurrency(incomeAnalysis?.totalForecast || 0)}
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-xs text-muted-foreground">
                                                {(incomeAnalysis?.forecastConfidence * 100 || 0).toFixed(0)}% confidence
                                            </p>
                                            <Badge variant="outline" className="text-xs">
                                                <TrendingUpIcon className="h-3 w-3 mr-1" />
                                                Projected
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Enhanced Tab Content */}
                            {activeTab === 'overview' && (
                                <div className="grid gap-6">
                                    <IncomeAnalysisOverview
                                        data={incomeAnalysis}
                                        isLoading={isLoading}
                                        error={error}
                                    />
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <h3 className="flex items-center gap-2 text-lg font-semibold">
                                                    <PieChartIcon className="h-5 w-5 text-blue-600" />
                                                    Income Sources Overview
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Distribution and breakdown of your income sources
                                                </p>
                                            </div>
                                            <div className="h-[350px]">
                                                <IncomeDiversityChart
                                                    data={incomeAnalysis}
                                                    isLoading={isLoading}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <h3 className="flex items-center gap-2 text-lg font-semibold">
                                                    <LineChartIcon className="h-5 w-5 text-green-600" />
                                                    Stability Trends
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Monthly income stability and variance analysis
                                                </p>
                                            </div>
                                            <div className="h-[350px]">
                                                <IncomeStabilityChart
                                                    data={incomeAnalysis}
                                                    isLoading={isLoading}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'diversity' && (
                                <Card className="border-0 shadow-md">
                                    <CardHeader className="border-b bg-muted/30">
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <PieChartIcon className="h-6 w-6 text-blue-600" />
                                            Income Source Diversity Analysis
                                        </CardTitle>
                                        <CardDescription className="text-base">
                                            Detailed breakdown of your income sources and diversification metrics
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <IncomeDiversityChart
                                            data={incomeAnalysis}
                                            isLoading={isLoading}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === 'stability' && (
                                <Card className="border-0 shadow-md">
                                    <CardHeader className="border-b bg-muted/30">
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <LineChartIcon className="h-6 w-6 text-green-600" />
                                            Income Stability Analysis
                                        </CardTitle>
                                        <CardDescription className="text-base">
                                            Track income consistency and identify trends in your earnings patterns
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <IncomeStabilityChart
                                            data={incomeAnalysis}
                                            isLoading={isLoading}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {activeTab === 'forecast' && (
                                <Card className="border-0 shadow-md">
                                    <CardHeader className="border-b bg-muted/30">
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <TargetIcon className="h-6 w-6 text-orange-600" />
                                            Income Forecast & Projections
                                        </CardTitle>
                                        <CardDescription className="text-base">
                                            6-month income projections based on historical data and trends
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <IncomeForecastChart
                                            data={incomeAnalysis}
                                            isLoading={isLoading}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {/* Back to Statistics Link */}
                            <div className="flex justify-end mt-2 mb-6">
                                <Link 
                                    href={route('statistics.index')} 
                                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                                >
                                    Back to Statistics
                                    <ArrowUpRightIcon className="ml-1 size-3" />
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}