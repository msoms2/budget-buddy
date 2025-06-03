import { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  BarChart3Icon, 
  PieChartIcon, 
  LineChartIcon,
  DollarSignIcon,
  TargetIcon,
  ActivityIcon,
  ShieldIcon,
  TrendingUp,
  AlertCircleIcon,
  RefreshCwIcon
} from "lucide-react";
import IncomeAnalysisOverview from "@/components/IncomeAnalysis/IncomeAnalysisOverview";
import IncomeDiversityChart from "@/components/IncomeAnalysis/IncomeDiversityChart";
import IncomeStabilityChart from "@/components/IncomeAnalysis/IncomeStabilityChart";
import IncomeForecastChart from "@/components/IncomeAnalysis/IncomeForecastChart";
import axios from "axios";

export default function Index({ auth }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({
    diversityScore: 0,
    stabilityScore: 0,
    recurringPercentage: 0,
    sources: [],
    primarySource: null,
    secondarySource: null,
    monthlyTrends: [],
    variance: 0,
    trend: 0,
    averageIncome: 0,
    forecast: [],
    totalForecast: 0,
    averageMonthly: 0,
    forecastConfidence: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get('/income-analysis', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        const jsonData = response.data;
        setData({
          ...jsonData,
          diversityScore: Number(jsonData.diversityScore || 0),
          stabilityScore: Number(jsonData.stabilityScore || 0),
          recurringPercentage: Number(jsonData.recurringPercentage || 0),
        });
      } catch (err) {
        setError(err);
        console.error("Error fetching income analysis:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Use global currency formatter
  const { formatCurrency } = useCurrency();

  // Get score color based on value
  const getScoreColor = (score) => {
    if (score >= 7) return "text-green-600 bg-green-50 dark:bg-green-900/20";
    if (score >= 4) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
    return "text-red-600 bg-red-50 dark:bg-red-900/20";
  };

  // Get risk level
  const getRiskLevel = (score) => {
    if (score >= 7) return { level: "Low", variant: "default" };
    if (score >= 4) return { level: "Medium", variant: "secondary" };
    return { level: "High", variant: "destructive" };
  };

  return (
    <SidebarProvider>
      <Head title="Income Analysis" />
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbItem>
                <BreadcrumbPage>Income Analysis</BreadcrumbPage>
              </BreadcrumbItem>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
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
            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Diversity Score</CardTitle>
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <PieChartIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {Number(data?.diversityScore || 0).toFixed(1)}/10
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        Income source distribution
                      </p>
                      <Badge variant={getRiskLevel(data?.diversityScore || 0).variant} className="text-xs">
                        {getRiskLevel(data?.diversityScore || 0).level} Risk
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stability Score</CardTitle>
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                  <ShieldIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {Number(data?.stabilityScore || 0).toFixed(1)}/10
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        Income consistency
                      </p>
                      <Badge variant={getRiskLevel(data?.stabilityScore || 0).variant} className="text-xs">
                        {getRiskLevel(data?.stabilityScore || 0).level} Risk
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recurring Income</CardTitle>
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                  <TrendingUpIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {(Number(data?.recurringPercentage || 0) * 100).toFixed(0)}%
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        Of total monthly income
                      </p>
                      <Badge variant={data?.recurringPercentage > 0.7 ? "default" : "secondary"} className="text-xs">
                        {data?.recurringPercentage > 0.7 ? "Stable" : "Variable"}
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">6-Month Forecast</CardTitle>
                <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/20">
                  <TargetIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {formatCurrency(data?.totalForecast || 0)}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {(data?.forecastConfidence * 100 || 0).toFixed(0)}% confidence
                      </p>
                      <Badge variant="outline" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Projected
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Error State */}
          {error && (
            <Alert variant="destructive" className="border-destructive/50">
              <AlertCircleIcon className="h-4 w-4" />
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
          )}

          {/* Enhanced Tab Content */}
          {!error && (
            <>
              {activeTab === 'overview' && (
                <div className="grid gap-6">
                  <IncomeAnalysisOverview
                    data={data}
                    isLoading={isLoading}
                    error={error}
                  />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-md">
                      <CardHeader className="border-b bg-muted/30">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <PieChartIcon className="h-5 w-5 text-blue-600" />
                          Income Sources Overview
                        </CardTitle>
                        <CardDescription>
                          Distribution and breakdown of your income sources
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="h-[350px] flex items-center justify-center">
                          {isLoading ? (
                            <div className="space-y-4 w-full">
                              <Skeleton className="h-8 w-32 mx-auto" />
                              <Skeleton className="h-32 w-32 rounded-full mx-auto" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                              </div>
                            </div>
                          ) : (
                            <IncomeDiversityChart
                              data={data}
                              isLoading={isLoading}
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md">
                      <CardHeader className="border-b bg-muted/30">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <LineChartIcon className="h-5 w-5 text-green-600" />
                          Stability Trends
                        </CardTitle>
                        <CardDescription>
                          Monthly income stability and variance analysis
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="h-[350px] flex items-center justify-center">
                          {isLoading ? (
                            <div className="space-y-4 w-full">
                              <Skeleton className="h-8 w-32 mx-auto" />
                              <Skeleton className="h-48 w-full" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                              </div>
                            </div>
                          ) : (
                            <IncomeStabilityChart
                              data={data}
                              isLoading={isLoading}
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
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
                    {isLoading ? (
                      <div className="space-y-6">
                        <Skeleton className="h-64 w-full" />
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-3">
                            <Skeleton className="h-6 w-32" />
                            {[1, 2, 3].map(i => (
                              <Skeleton key={i} className="h-12 w-full" />
                            ))}
                          </div>
                          <div className="space-y-3">
                            <Skeleton className="h-6 w-32" />
                            {[1, 2, 3].map(i => (
                              <Skeleton key={i} className="h-8 w-full" />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <IncomeDiversityChart
                          data={data}
                          isLoading={isLoading}
                        />
                        
                        {/* Enhanced Diversity Insights */}
                        {data?.sources && data.sources.length > 0 && (
                          <div className="mt-8 grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                              <h4 className="font-semibold text-lg flex items-center gap-2">
                                <DollarSignIcon className="h-5 w-5 text-green-600" />
                                Primary Income Sources
                              </h4>
                              <div className="space-y-3">
                                {data.sources.slice(0, 5).map((source, index) => (
                                  <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                      <div className="w-2 h-8 rounded-full bg-gradient-to-b from-blue-500 to-purple-600"></div>
                                      <span className="font-medium">{source.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="font-semibold">{formatCurrency(source.value)}</span>
                                      <Badge variant="secondary" className="text-xs">
                                        {source.percentage.toFixed(1)}%
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h4 className="font-semibold text-lg flex items-center gap-2">
                                <ShieldIcon className="h-5 w-5 text-purple-600" />
                                Diversification Status
                              </h4>
                              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Total Sources:</span>
                                  <span className="font-semibold text-lg">{data.sources.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Diversity Score:</span>
                                  <Badge variant={getRiskLevel(data.diversityScore).variant} className="text-sm font-semibold">
                                    {data.diversityScore.toFixed(1)}/10
                                  </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Risk Level:</span>
                                  <Badge variant={getRiskLevel(data.diversityScore).variant} className="text-sm font-semibold">
                                    {getRiskLevel(data.diversityScore).level}
                                  </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Recommendation:</span>
                                  <span className="text-sm font-medium text-right max-w-32">
                                    {data.diversityScore >= 7 ? "Well diversified" : 
                                     data.diversityScore >= 4 ? "Consider diversifying" : 
                                     "Needs diversification"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
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
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-80 w-full" />
                        <div className="grid gap-4 md:grid-cols-3">
                          {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-20 w-full" />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <IncomeStabilityChart
                        data={data}
                        isLoading={isLoading}
                      />
                    )}
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
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-80 w-full" />
                        <div className="grid gap-4 md:grid-cols-2">
                          {[1, 2].map(i => (
                            <Skeleton key={i} className="h-32 w-full" />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <IncomeForecastChart
                        data={data}
                        isLoading={isLoading}
                      />
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
