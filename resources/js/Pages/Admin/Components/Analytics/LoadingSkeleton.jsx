import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * LoadingSkeleton Component
 * 
 * Loading skeleton specifically designed for analytics cards and charts.
 * Features:
 * - Multiple skeleton types for different components
 * - Animated loading states
 * - Responsive sizing
 * - Customizable patterns
 * - Consistent with analytics design system
 * 
 * @param {Object} props
 * @param {string} props.type - Skeleton type: 'card', 'chart', 'table', 'dashboard'
 * @param {number} props.count - Number of skeleton items
 * @param {string} props.height - Custom height
 * @param {string} props.width - Custom width
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.animated - Enable animation
 * @param {string} props.variant - Skeleton variant: 'default', 'compact', 'detailed'
 */
export default function LoadingSkeleton({
  type = 'card',
  count = 1,
  height,
  width,
  className = "",
  animated = true,
  variant = 'default'
}) {
  // Animation classes
  const animationClass = animated ? "animate-pulse" : "";

  // Render analytics card skeleton
  const renderCardSkeleton = () => (
    <Card className={cn("border shadow-sm", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className={cn("h-4 w-32", animationClass)} />
            {variant === 'detailed' && (
              <Skeleton className={cn("h-3 w-48", animationClass)} />
            )}
          </div>
          <Skeleton className={cn("h-12 w-12 rounded-xl", animationClass)} />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <Skeleton className={cn("h-8 w-24", animationClass)} />
          
          {variant !== 'compact' && (
            <div className="flex items-center gap-2">
              <Skeleton className={cn("h-6 w-16 rounded-full", animationClass)} />
              <Skeleton className={cn("h-4 w-20", animationClass)} />
            </div>
          )}
          
          {variant === 'detailed' && (
            <div className="pt-3 border-t space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className={cn("h-3 w-full", animationClass)} />
                <Skeleton className={cn("h-3 w-full", animationClass)} />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Render chart skeleton
  const renderChartSkeleton = () => (
    <Card className={cn("border shadow-sm", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton className={cn("h-6 w-6 rounded-md", animationClass)} />
              <Skeleton className={cn("h-5 w-40", animationClass)} />
            </div>
            <Skeleton className={cn("h-4 w-64", animationClass)} />
          </div>
          <Skeleton className={cn("h-8 w-8 rounded", animationClass)} />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div 
          className="space-y-4"
          style={{ height: height || '300px' }}
        >
          {/* Chart area skeleton */}
          <div className="flex items-end justify-center h-full gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn(
                  "w-8 rounded-t",
                  animationClass
                )}
                style={{
                  height: `${Math.random() * 60 + 20}%`
                }}
              />
            ))}
          </div>
          
          {/* Legend skeleton */}
          <div className="flex items-center justify-center gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className={cn("h-3 w-3 rounded-full", animationClass)} />
                <Skeleton className={cn("h-3 w-16", animationClass)} />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render table skeleton
  const renderTableSkeleton = () => (
    <Card className={cn("border shadow-sm", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Skeleton className={cn("h-6 w-48", animationClass)} />
          <div className="flex gap-2">
            <Skeleton className={cn("h-8 w-20", animationClass)} />
            <Skeleton className={cn("h-8 w-8", animationClass)} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Table header */}
          <div className="grid grid-cols-4 gap-4 pb-3 border-b">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className={cn("h-4 w-full", animationClass)} />
            ))}
          </div>
          
          {/* Table rows */}
          {Array.from({ length: count || 5 }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-4 gap-4 py-2">
              {Array.from({ length: 4 }).map((_, colIndex) => (
                <Skeleton
                  key={colIndex}
                  className={cn(
                    "h-4",
                    colIndex === 0 ? "w-3/4" : "w-full",
                    animationClass
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Render dashboard skeleton (multiple cards)
  const renderDashboardSkeleton = () => {
    const cardCount = count || 8;
    
    return (
      <div className={cn("space-y-6", className)}>
        {/* Header skeleton */}
        <div className="space-y-2">
          <Skeleton className={cn("h-8 w-64", animationClass)} />
          <Skeleton className={cn("h-4 w-96", animationClass)} />
        </div>
        
        {/* Metrics grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: Math.min(cardCount, 4) }).map((_, i) => (
            <div key={i}>
              {renderCardSkeleton()}
            </div>
          ))}
        </div>
        
        {/* Charts section skeleton */}
        {cardCount > 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: Math.min(cardCount - 4, 4) }).map((_, i) => (
              <div key={i + 4}>
                {renderChartSkeleton()}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render list skeleton
  const renderListSkeleton = () => (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count || 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className={cn("h-10 w-10 rounded-full", animationClass)} />
          <div className="flex-1 space-y-2">
            <Skeleton className={cn("h-4 w-3/4", animationClass)} />
            <Skeleton className={cn("h-3 w-1/2", animationClass)} />
          </div>
          <div className="space-y-1">
            <Skeleton className={cn("h-4 w-16", animationClass)} />
            <Skeleton className={cn("h-3 w-12", animationClass)} />
          </div>
        </div>
      ))}
    </div>
  );

  // Render filter skeleton
  const renderFilterSkeleton = () => (
    <Card className={cn("border shadow-sm", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Skeleton className={cn("h-5 w-5", animationClass)} />
          <Skeleton className={cn("h-5 w-32", animationClass)} />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className={cn("h-4 w-20", animationClass)} />
              <Skeleton className={cn("h-10 w-full", animationClass)} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Render based on type
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return count > 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i}>{renderCardSkeleton()}</div>
            ))}
          </div>
        ) : renderCardSkeleton();
        
      case 'chart':
        return renderChartSkeleton();
        
      case 'table':
        return renderTableSkeleton();
        
      case 'dashboard':
        return renderDashboardSkeleton();
        
      case 'list':
        return renderListSkeleton();
        
      case 'filter':
        return renderFilterSkeleton();
        
      default:
        return renderCardSkeleton();
    }
  };

  return renderSkeleton();
}

/**
 * Pre-configured skeleton components for common use cases
 */
export const AnalyticsSkeletons = {
  // Standard metrics dashboard
  MetricsDashboard: (props) => (
    <LoadingSkeleton type="dashboard" count={8} {...props} />
  ),
  
  // KPI cards grid
  KPICards: (props) => (
    <LoadingSkeleton type="card" count={4} variant="compact" {...props} />
  ),
  
  // Chart placeholder
  Chart: (props) => (
    <LoadingSkeleton type="chart" height="400px" {...props} />
  ),
  
  // Data table
  DataTable: (props) => (
    <LoadingSkeleton type="table" count={10} {...props} />
  ),
  
  // Analytics filters
  Filters: (props) => (
    <LoadingSkeleton type="filter" {...props} />
  ),
  
  // Performance list
  PerformanceList: (props) => (
    <LoadingSkeleton type="list" count={5} {...props} />
  )
};

/**
 * Helper function to create loading states for different analytics sections
 */
export const createAnalyticsLoading = (sections = []) => {
  return sections.map(section => ({
    type: section.type || 'card',
    count: section.count || 1,
    variant: section.variant || 'default',
    height: section.height,
    className: section.className
  }));
};