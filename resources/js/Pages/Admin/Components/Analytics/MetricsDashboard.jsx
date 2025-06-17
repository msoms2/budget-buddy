import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import AnalyticsCard from './AnalyticsCard';

/**
 * MetricsDashboard Component
 * 
 * Layout component for organizing metrics cards in analytics dashboards.
 * Features:
 * - Responsive grid system
 * - Automatic card sizing based on content
 * - Loading states
 * - Empty states
 * - Drag and drop support (future)
 * - Custom layouts and arrangements
 * 
 * @param {Object} props
 * @param {Array} props.metrics - Array of metric configurations
 * @param {boolean} props.loading - Loading state
 * @param {string} props.title - Dashboard title
 * @param {string} props.description - Dashboard description
 * @param {string} props.layout - Layout type: 'grid', 'masonry', 'flex'
 * @param {string} props.columns - Number of columns: 'auto', '1', '2', '3', '4', '6'
 * @param {string} props.gap - Gap between cards
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.header - Custom header content
 * @param {React.ReactNode} props.footer - Custom footer content
 * @param {React.ReactNode} props.emptyState - Custom empty state
 * @param {boolean} props.showMetaInfo - Show metrics metadata
 */
export default function MetricsDashboard({
  metrics = [],
  loading = false,
  title,
  description,
  layout = 'grid',
  columns = 'auto',
  gap = '6',
  className = "",
  header,
  footer,
  emptyState,
  showMetaInfo = false
}) {
  // Grid column configurations
  const columnConfigs = {
    'auto': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    '6': 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6'
  };

  // Gap configurations
  const gapConfigs = {
    '2': 'gap-2',
    '4': 'gap-4',
    '6': 'gap-6',
    '8': 'gap-8'
  };

  // Layout configurations
  const layoutConfigs = {
    grid: `grid ${columnConfigs[columns] || columnConfigs.auto} ${gapConfigs[gap] || gapConfigs['6']}`,
    masonry: `columns-1 md:columns-2 lg:columns-3 xl:columns-4 ${gapConfigs[gap] || gapConfigs['6']}`,
    flex: `flex flex-wrap ${gapConfigs[gap] || gapConfigs['6']}`
  };

  // Calculate metrics summary
  const getMetricsSummary = () => {
    if (!metrics.length) return null;

    const totalMetrics = metrics.length;
    const loadingMetrics = metrics.filter(m => m.loading).length;
    const errorMetrics = metrics.filter(m => m.error).length;
    const successfulMetrics = totalMetrics - loadingMetrics - errorMetrics;

    return {
      total: totalMetrics,
      loading: loadingMetrics,
      errors: errorMetrics,
      successful: successfulMetrics
    };
  };

  // Render loading skeleton
  const renderLoadingSkeleton = () => {
    const skeletonCount = metrics.length || 8;
    
    return (
      <div className={layoutConfigs[layout]}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Card key={index} className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-24" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    if (emptyState) return emptyState;

    return (
      <Card className="p-12 text-center">
        <CardContent className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            📊
          </div>
          <div>
            <h3 className="text-lg font-semibold text-muted-foreground">
              No Metrics Available
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              There are no metrics to display at the moment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render metrics header
  const renderHeader = () => {
    const summary = getMetricsSummary();

    return (
      <div className="space-y-4">
        {/* Custom header or default title/description */}
        {header || (title || description) ? (
          <div className="space-y-2">
            {title && (
              <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            )}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
            {header}
          </div>
        ) : null}

        {/* Metrics metadata */}
        {showMetaInfo && summary && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total Metrics:</span>
              <Badge variant="outline">{summary.total}</Badge>
            </div>
            
            {summary.loading > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Loading:</span>
                <Badge variant="secondary">{summary.loading}</Badge>
              </div>
            )}
            
            {summary.errors > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Errors:</span>
                <Badge variant="destructive">{summary.errors}</Badge>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Successful:</span>
              <Badge variant="default">{summary.successful}</Badge>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render metrics grid
  const renderMetrics = () => {
    if (loading) return renderLoadingSkeleton();
    if (!metrics.length) return renderEmptyState();

    return (
      <div className={cn(layoutConfigs[layout], className)}>
        {metrics.map((metric, index) => (
          <div 
            key={metric.id || index}
            className={cn(
              layout === 'masonry' && "break-inside-avoid mb-6",
              layout === 'flex' && "flex-1 min-w-[280px]"
            )}
          >
            <AnalyticsCard
              title={metric.title}
              value={metric.value}
              description={metric.description}
              icon={metric.icon}
              trend={metric.trend}
              format={metric.format}
              prefix={metric.prefix}
              suffix={metric.suffix}
              actions={metric.actions}
              loading={metric.loading}
              variant={metric.variant}
              theme={metric.theme}
              onClick={metric.onClick}
              href={metric.href}
              metadata={metric.metadata}
              className={metric.className}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderHeader()}
      {renderMetrics()}
      {footer}
    </div>
  );
}

/**
 * Helper function to create metrics dashboard configurations
 */
export const createMetricsDashboard = ({
  title,
  description,
  metrics = [],
  layout = 'grid',
  columns = 'auto',
  gap = '6',
  showMetaInfo = false
}) => ({
  title,
  description,
  metrics,
  layout,
  columns,
  gap,
  showMetaInfo
});

/**
 * Pre-configured dashboard layouts
 */
export const dashboardLayouts = {
  // Standard 4-column grid for KPIs
  kpi: {
    layout: 'grid',
    columns: '4',
    gap: '6'
  },
  
  // 3-column layout for balanced metrics
  balanced: {
    layout: 'grid', 
    columns: '3',
    gap: '6'
  },
  
  // Masonry layout for varied content
  masonry: {
    layout: 'masonry',
    columns: 'auto',
    gap: '6'
  },
  
  // Single column for detailed metrics
  detailed: {
    layout: 'grid',
    columns: '1',
    gap: '4'
  },
  
  // Compact 6-column layout
  compact: {
    layout: 'grid',
    columns: '6', 
    gap: '4'
  }
};

/**
 * Common metric configurations for different analytics types
 */
export const metricTemplates = {
  financial: [
    { title: 'Total Revenue', format: 'currency', theme: 'emerald' },
    { title: 'Total Expenses', format: 'currency', theme: 'rose' },
    { title: 'Net Profit', format: 'currency', theme: 'blue' },
    { title: 'Growth Rate', format: 'percentage', theme: 'violet' }
  ],
  
  users: [
    { title: 'Total Users', format: 'number', theme: 'blue' },
    { title: 'Active Users', format: 'number', theme: 'emerald' },
    { title: 'New Signups', format: 'number', theme: 'violet' },
    { title: 'Churn Rate', format: 'percentage', theme: 'rose' }
  ],
  
  performance: [
    { title: 'Page Views', format: 'number', theme: 'blue' },
    { title: 'Load Time', suffix: 'ms', theme: 'amber' },
    { title: 'Conversion Rate', format: 'percentage', theme: 'emerald' },
    { title: 'Bounce Rate', format: 'percentage', theme: 'rose' }
  ]
};