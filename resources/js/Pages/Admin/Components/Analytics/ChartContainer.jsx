import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MoreHorizontal, 
  Download, 
  Maximize2, 
  RefreshCw,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

/**
 * ChartContainer Component
 * 
 * Wrapper component for all chart types with consistent styling and functionality.
 * Features:
 * - Consistent header with title, description, and actions
 * - Loading states with skeleton UI
 * - Export functionality (CSV, PNG, PDF)
 * - Refresh and maximize actions
 * - Responsive sizing
 * - Error handling
 * - Chart type indicators
 * 
 * @param {Object} props
 * @param {string} props.title - Chart title
 * @param {string} props.description - Chart description
 * @param {React.ReactNode} props.children - Chart component(s)
 * @param {React.ReactNode} props.icon - Chart type icon
 * @param {boolean} props.loading - Loading state
 * @param {Object} props.error - Error state
 * @param {Array} props.actions - Custom action buttons
 * @param {Function} props.onExport - Export handler
 * @param {Function} props.onRefresh - Refresh handler
 * @param {Function} props.onMaximize - Maximize handler
 * @param {string} props.height - Chart height (default: 400px)
 * @param {string} props.variant - Container variant: 'default', 'compact', 'bordered'
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showActions - Show action buttons
 * @param {Object} props.metadata - Chart metadata (data points, last updated, etc.)
 * @param {string} props.chartType - Chart type for visual indicator
 * @param {boolean} props.exportable - Enable export functionality
 * @param {boolean} props.refreshable - Enable refresh functionality
 * @param {boolean} props.maximizable - Enable maximize functionality
 */
export default function ChartContainer({
  title,
  description,
  children,
  icon: Icon,
  loading = false,
  error = null,
  actions = [],
  onExport,
  onRefresh,
  onMaximize,
  height = "400px",
  variant = 'default',
  className = "",
  showActions = true,
  metadata,
  chartType,
  exportable = true,
  refreshable = true,
  maximizable = true
}) {
  // Chart type icons
  const chartTypeIcons = {
    bar: BarChart3,
    line: LineChart,
    pie: PieChart,
    area: TrendingUp
  };

  const ChartTypeIcon = chartTypeIcons[chartType] || Icon || BarChart3;

  // Handle export functionality
  const handleExport = (format) => {
    if (onExport) {
      onExport(format);
    }
  };

  // Render chart metadata
  const renderMetadata = () => {
    if (!metadata) return null;

    return (
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {metadata.dataPoints && (
          <div className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            <span>{metadata.dataPoints} data points</span>
          </div>
        )}
        {metadata.lastUpdated && (
          <div className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            <span>Updated {metadata.lastUpdated}</span>
          </div>
        )}
        {metadata.source && (
          <div className="flex items-center gap-1">
            <span>Source: {metadata.source}</span>
          </div>
        )}
      </div>
    );
  };

  // Render action buttons
  const renderActions = () => {
    if (!showActions) return null;

    const hasBuiltInActions = exportable || refreshable || maximizable;
    const hasCustomActions = actions.length > 0;

    if (!hasBuiltInActions && !hasCustomActions) return null;

    return (
      <div className="flex items-center gap-2">
        {/* Custom actions */}
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || "ghost"}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled || loading}
            className={action.className}
          >
            {action.icon && <action.icon className="h-4 w-4" />}
            {action.label && <span className="ml-1">{action.label}</span>}
          </Button>
        ))}

        {/* Built-in actions dropdown */}
        {hasBuiltInActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={loading}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {refreshable && (
                <DropdownMenuItem onClick={onRefresh} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </DropdownMenuItem>
              )}
              
              {maximizable && (
                <DropdownMenuItem onClick={onMaximize}>
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Maximize View
                </DropdownMenuItem>
              )}

              {exportable && (refreshable || maximizable) && <DropdownMenuSeparator />}

              {exportable && (
                <>
                  <DropdownMenuItem onClick={() => handleExport('png')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export as PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };

  // Render error state
  const renderError = () => {
    if (!error) return null;

    return (
      <div 
        className="flex flex-col items-center justify-center text-center p-8"
        style={{ height }}
      >
        <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-full mb-4">
          <Info className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
          Chart Error
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 max-w-sm">
          {error.message || 'Unable to load chart data. Please try again.'}
        </p>
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </div>
    );
  };

  // Render loading state
  const renderLoading = () => {
    return (
      <div 
        className="flex items-center justify-center"
        style={{ height }}
      >
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-16 w-16" />
            <Skeleton className="h-20 w-16" />
            <Skeleton className="h-12 w-16" />
          </div>
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    );
  };

  // Render chart content
  const renderContent = () => {
    if (error) return renderError();
    if (loading) return renderLoading();
    
    return (
      <div 
        className="w-full"
        style={{ height }}
      >
        {children}
      </div>
    );
  };

  // Container variants
  const variants = {
    default: "border shadow-sm",
    compact: "border-0 shadow-none bg-muted/30",
    bordered: "border-2 shadow-md"
  };

  return (
    <Card className={cn(
      variants[variant],
      "transition-all duration-200 hover:shadow-md",
      className
    )}>
      <CardHeader className={cn(
        "pb-4",
        variant === 'compact' && "pb-2"
      )}>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              {ChartTypeIcon && (
                <div className="p-1.5 bg-primary/10 rounded-md">
                  <ChartTypeIcon className="h-4 w-4 text-primary" />
                </div>
              )}
              <CardTitle className={cn(
                "font-semibold",
                variant === 'compact' ? "text-base" : "text-lg"
              )}>
                {title}
              </CardTitle>
              {chartType && (
                <Badge variant="secondary" className="text-xs">
                  {chartType}
                </Badge>
              )}
            </div>
            
            {description && (
              <CardDescription className={cn(
                variant === 'compact' ? "text-xs" : "text-sm"
              )}>
                {description}
              </CardDescription>
            )}
            
            {metadata && variant !== 'compact' && (
              <div className="pt-1">
                {renderMetadata()}
              </div>
            )}
          </div>
          
          {renderActions()}
        </div>
      </CardHeader>
      
      <CardContent className={cn(
        "pt-0",
        variant === 'compact' && "px-3 pb-3"
      )}>
        {renderContent()}
      </CardContent>
    </Card>
  );
}

/**
 * Helper function to create chart container configurations
 */
export const createChartContainer = ({
  title,
  description,
  chartType,
  height = "400px",
  exportable = true,
  refreshable = true,
  maximizable = true,
  onExport = null,
  onRefresh = null,
  onMaximize = null,
  actions = [],
  metadata = null
}) => ({
  title,
  description,
  chartType,
  height,
  exportable,
  refreshable,
  maximizable,
  onExport,
  onRefresh,
  onMaximize,
  actions,
  metadata
});