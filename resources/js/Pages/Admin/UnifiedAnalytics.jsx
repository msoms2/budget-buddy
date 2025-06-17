/**
 * Unified Analytics Dashboard - Main Component
 * Integrates all analytics modules into a single, cohesive interface
 */

import React, { useState, useEffect, Suspense } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from './Components/Layout/AdminLayout';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RefreshCw, 
  Settings, 
  Download, 
  Share2,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Import hooks and utilities
import useTabState from './Components/Analytics/Hooks/useTabState';
import useAnalyticsData from './Components/Analytics/Hooks/useAnalyticsData';
import useUnifiedFilters from './Components/Analytics/Hooks/useUnifiedFilters';
import { getTabConfig, ANALYTICS_TABS } from './Components/Analytics/Utils/tabConfiguration';
import { getCacheStats } from './Components/Analytics/Utils/DataCacheManager';

// Import shared components
import AnalyticsTabContainer from './Components/Analytics/Shared/AnalyticsTabContainer';
import AnalyticsFilterPanel from './Components/Analytics/Shared/AnalyticsFilterPanel';
import OverviewDashboard from './Components/Analytics/Tabs/OverviewDashboard';

// Lazy load analytics components for better performance
const BudgetAnalytics = React.lazy(() => import('./BudgetAnalytics'));
const CategoriesAnalytics = React.lazy(() => import('./CategoriesAnalytics'));
const GoalsAnalytics = React.lazy(() => import('./GoalsAnalytics'));
const DebtAnalytics = React.lazy(() => import('./DebtAnalytics'));
const InvestmentAnalytics = React.lazy(() => import('./InvestmentAnalytics'));

const UnifiedAnalytics = ({
  overview = {}, // Provide default empty object
  activeTab: initialActiveTab = 'overview',
  filters: initialFilters = {},
  availableUsers = []
}) => {
  // Tab state management
  const {
    activeTab,
    changeTab,
    isTransitioning,
    getActiveTabConfig
  } = useTabState(initialActiveTab);

  // Filter state management
  const {
    filters,
    updateFilter,
    updateMultipleFilters,
    applyFilters,
    resetFilters,
    setPredefinedRange,
    isApplying,
    hasUnsavedChanges,
    getFilterSummary,
    isValidDateRange
  } = useUnifiedFilters({
    defaultFilters: initialFilters,
    onFiltersChange: (newFilters) => {
      // Optional: trigger analytics refresh when filters change
      if (activeTab !== ANALYTICS_TABS.OVERVIEW) {
        refreshData({ useCache: false });
      }
    }
  });

  // Analytics data management
  const {
    data: analyticsData,
    isLoading,
    error,
    refreshData,
    hasData,
    isStale,
    retry,
    canRetry
  } = useAnalyticsData(activeTab, {
    onError: (error) => {
      console.error('Analytics data error:', error);
    },
    onSuccess: (data) => {
      console.log('Analytics data loaded:', data);
    }
  });

  // Local state
  const [showSettings, setShowSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [cacheStats, setCacheStats] = useState(null);

  // Update cache stats periodically
  useEffect(() => {
    const updateCacheStats = () => {
      setCacheStats(getCacheStats());
    };

    updateCacheStats();
    const interval = setInterval(updateCacheStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle tab changes
  const handleTabChange = (newTabId) => {
    changeTab(newTabId, {
      preserveFilters: true,
      withTransition: true
    });
  };

  // Handle data refresh
  const handleRefresh = async () => {
    try {
      if (activeTab === ANALYTICS_TABS.OVERVIEW) {
        // For overview, we might want to reload the entire page to get fresh overview data
        window.location.reload();
      } else {
        await refreshData({ forceRefresh: true });
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  // Handle export functionality
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Build export URL with current filters and tab
      const exportParams = new URLSearchParams({
        module: activeTab,
        format: 'csv',
        ...filters
      });
      
      // Trigger download
      const link = document.createElement('a');
      link.href = `/admin/analytics/export?${exportParams.toString()}`;
      link.download = `analytics-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle share functionality
  const handleShare = async () => {
    try {
      const shareUrl = window.location.href;
      
      if (navigator.share) {
        await navigator.share({
          title: `Analytics Dashboard - ${getActiveTabConfig().title}`,
          url: shareUrl
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        // You could show a toast notification here
        console.log('URL copied to clipboard');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Get current analytics component
  const getCurrentAnalyticsComponent = () => {
    const currentTabConfig = getActiveTabConfig();
    
    switch (activeTab) {
      case ANALYTICS_TABS.OVERVIEW:
        return (
          <OverviewDashboard
            overview={overview || {}} // Ensure overview is always an object
            isLoading={isLoading}
          />
        );
      
      case ANALYTICS_TABS.BUDGET:
        return (
          <Suspense fallback={<AnalyticsLoadingSkeleton />}>
            <BudgetAnalytics 
              data={analyticsData}
              isLoading={isLoading}
              embedded={true}
            />
          </Suspense>
        );
      
      case ANALYTICS_TABS.CATEGORIES:
        return (
          <Suspense fallback={<AnalyticsLoadingSkeleton />}>
            <CategoriesAnalytics 
              data={analyticsData}
              isLoading={isLoading}
              embedded={true}
            />
          </Suspense>
        );
      
      case ANALYTICS_TABS.GOALS:
        return (
          <Suspense fallback={<AnalyticsLoadingSkeleton />}>
            <GoalsAnalytics 
              data={analyticsData}
              isLoading={isLoading}
              embedded={true}
            />
          </Suspense>
        );
      
      case ANALYTICS_TABS.DEBT:
        return (
          <Suspense fallback={<AnalyticsLoadingSkeleton />}>
            <DebtAnalytics 
              data={analyticsData}
              isLoading={isLoading}
              embedded={true}
            />
          </Suspense>
        );
      
      case ANALYTICS_TABS.INVESTMENT:
        return (
          <Suspense fallback={<AnalyticsLoadingSkeleton />}>
            <InvestmentAnalytics 
              data={analyticsData}
              isLoading={isLoading}
              embedded={true}
            />
          </Suspense>
        );
      
      default:
        return (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Invalid Tab</h3>
              <p className="text-gray-500">The requested analytics tab could not be found.</p>
              <Button 
                onClick={() => changeTab(ANALYTICS_TABS.OVERVIEW)}
                className="mt-4"
              >
                Go to Overview
              </Button>
            </div>
          </div>
        );
    }
  };

  // Loading skeleton for analytics components
  const AnalyticsLoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-3 w-full" />
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <Skeleton className="h-64 w-full" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <Head title="Analytics Dashboard" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Comprehensive system analytics and insights
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting || activeTab === ANALYTICS_TABS.OVERVIEW}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Currency Error Display */}
        {error && error.message && error.message.includes('currency') && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Currency configuration error. Please ensure a default currency is set and active.
            </AlertDescription>
          </Alert>
        )}

        {/* General Error Display */}
        {error && !error.message?.includes('currency') && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load analytics data: {error.message}</span>
              {canRetry && (
                <Button variant="outline" size="sm" onClick={retry}>
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Date Range Validation */}
        {!isValidDateRange && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Invalid date range: Start date must be before end date.
            </AlertDescription>
          </Alert>
        )}

        {/* Filter Panel */}
        <AnalyticsFilterPanel
          filters={filters}
          onFiltersChange={updateMultipleFilters}
          isApplying={isApplying}
          hasUnsavedChanges={hasUnsavedChanges}
          onApply={applyFilters}
          onReset={resetFilters}
          onExport={activeTab !== ANALYTICS_TABS.OVERVIEW ? handleExport : null}
          onShare={handleShare}
          variant="compact"
          availableUsers={availableUsers}
          filterSummary={getFilterSummary()}
        />

        {/* Main Analytics Content */}
        <AnalyticsTabContainer
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isLoading={isTransitioning || isLoading}
          className="min-h-[600px]"
        >
          <div className={cn(
            'transition-opacity duration-200',
            (isTransitioning || isLoading) && 'opacity-50'
          )}>
            {getCurrentAnalyticsComponent()}
          </div>
        </AnalyticsTabContainer>

        {/* Cache and Performance Info */}
        {showSettings && cacheStats && (
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Performance Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Cache Entries</div>
                <div className="font-medium">{cacheStats.totalEntries}</div>
              </div>
              <div>
                <div className="text-gray-600">Hit Rate</div>
                <div className="font-medium">{(cacheStats.hitRate * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-gray-600">Memory Usage</div>
                <div className="font-medium">{(cacheStats.memoryUsage / 1024).toFixed(1)} KB</div>
              </div>
              <div>
                <div className="text-gray-600">Active Tab</div>
                <div className="font-medium">{getActiveTabConfig().title}</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default UnifiedAnalytics;