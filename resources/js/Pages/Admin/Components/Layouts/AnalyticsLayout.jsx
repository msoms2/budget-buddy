import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Pages/Admin/Components/Layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Filter, 
  Search, 
  Download,
  RefreshCw,
  Settings,
  Maximize2,
  Grid3X3,
  LayoutGrid,
  Calendar,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import DateRangeFilter from '@/Pages/Admin/Components/Analytics/DateRangeFilter';
import ExportButton from '@/Pages/Admin/Components/Analytics/ExportButton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";

/**
 * AnalyticsLayout Component
 * 
 * Common layout for all analytics pages with shared functionality.
 * Features:
 * - Consistent header with page title and description
 * - Breadcrumb navigation for analytics sections
 * - Shared filtering controls (date range, export, search)
 * - Responsive grid system for organizing charts and cards
 * - Common analytics actions and settings
 * - Layout customization options
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {React.ReactNode} props.icon - Page icon
 * @param {React.ReactNode} props.children - Page content
 * @param {Array} props.breadcrumbs - Additional breadcrumb items
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFiltersChange - Filter change handler
 * @param {Function} props.onExport - Export handler
 * @param {Function} props.onRefresh - Refresh handler
 * @param {Array} props.exportFormats - Available export formats
 * @param {boolean} props.loading - Loading state
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.headerActions - Custom header actions
 * @param {React.ReactNode} props.filterControls - Custom filter controls
 * @param {boolean} props.showFilters - Show filter panel
 * @param {boolean} props.showExport - Show export functionality
 * @param {boolean} props.showRefresh - Show refresh button
 * @param {string} props.layoutMode - Layout mode: 'grid', 'list', 'cards'
 * @param {Object} props.metadata - Page metadata (last updated, data points, etc.)
 */
export default function AnalyticsLayout({
  title,
  description,
  icon: Icon = BarChart3,
  children,
  breadcrumbs = [],
  filters = {},
  onFiltersChange,
  onExport,
  onRefresh,
  exportFormats = ['csv', 'pdf'],
  loading = false,
  className = "",
  headerActions,
  filterControls,
  showFilters = true,
  showExport = true,
  showRefresh = true,
  layoutMode = 'grid',
  metadata = null
}) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Build breadcrumb navigation
  const analyticsBreadcrumbs = [
    {
      label: "Analytics",
      href: route('admin.index'),
      icon: TrendingUp
    },
    ...breadcrumbs
  ];

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        ...newFilters
      });
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    handleFilterChange({ search: value });
  };

  // Handle date range change
  const handleDateRangeChange = (dateRange) => {
    handleFilterChange({
      dateFrom: dateRange.from,
      dateTo: dateRange.to
    });
  };

  // Handle export
  const handleExport = (format, options) => {
    if (onExport) {
      onExport(format, {
        ...options,
        filters: filters,
        title: title
      });
    }
  };

  // Render metadata
  const renderMetadata = () => {
    if (!metadata) return null;

    return (
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {metadata.lastUpdated && (
          <div className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            <span>Updated {metadata.lastUpdated}</span>
          </div>
        )}
        {metadata.dataPoints && (
          <div className="flex items-center gap-1">
            <Grid3X3 className="h-3 w-3" />
            <span>{metadata.dataPoints} data points</span>
          </div>
        )}
        {metadata.timeRange && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{metadata.timeRange}</span>
          </div>
        )}
      </div>
    );
  };

  // Render filter panel
  const renderFilterPanel = () => {
    if (!showFilters) return null;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Filters & Controls</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className="md:hidden"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Customize your analytics view with date ranges and search filters
          </CardDescription>
        </CardHeader>
        
        <CardContent className={cn(
          "space-y-4",
          !isFilterPanelOpen && "hidden md:block"
        )}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <DateRangeFilter
                value={{
                  from: filters.dateFrom,
                  to: filters.dateTo
                }}
                onChange={handleDateRangeChange}
                disabled={loading}
              />
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search analytics..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Custom filter controls */}
            {filterControls}
          </div>
          
          {/* Metadata */}
          {metadata && (
            <div className="pt-2 border-t">
              {renderMetadata()}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render header actions
  const renderHeaderActions = () => {
    return (
      <div className="flex items-center gap-2">
        {/* Custom actions */}
        {headerActions}

        {/* Refresh button */}
        {showRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        )}

        {/* Export button */}
        {showExport && (
          <ExportButton
            formats={exportFormats}
            onExport={handleExport}
            disabled={loading}
            data={filters}
            filename={`${title?.toLowerCase().replace(/\s+/g, '_')}_analytics`}
          />
        )}

        {/* Layout options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Layout Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {}}>
              <Grid3X3 className="h-4 w-4 mr-2" />
              Grid View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}}>
              <LayoutGrid className="h-4 w-4 mr-2" />
              Card View
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {}}>
              <Maximize2 className="h-4 w-4 mr-2" />
              Fullscreen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <AdminLayout
      title={title}
      breadcrumbs={analyticsBreadcrumbs}
      headerActions={renderHeaderActions()}
      className={className}
    >
      <Head title={`${title} - Analytics`} />

      {/* Page Header */}
      <AdminLayout.PageHeader
        title={title}
        description={description}
        icon={Icon}
      />

      {/* Filter Panel */}
      {renderFilterPanel()}

      {/* Main Content */}
      <div className={cn(
        "space-y-6",
        layoutMode === 'grid' && "analytics-grid",
        layoutMode === 'cards' && "analytics-cards",
        layoutMode === 'list' && "analytics-list"
      )}>
        {children}
      </div>
    </AdminLayout>
  );
}

/**
 * Helper components for consistent analytics layouts
 */
AnalyticsLayout.Section = function AnalyticsSection({ 
  title, 
  description, 
  children, 
  className = "",
  actions = null
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description || actions) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

AnalyticsLayout.Grid = function AnalyticsGrid({ 
  children, 
  columns = 'auto',
  gap = '6',
  className = ""
}) {
  const columnConfigs = {
    'auto': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const gapConfigs = {
    '4': 'gap-4',
    '6': 'gap-6',
    '8': 'gap-8'
  };

  return (
    <div className={cn(
      'grid',
      columnConfigs[columns] || columnConfigs.auto,
      gapConfigs[gap] || gapConfigs['6'],
      className
    )}>
      {children}
    </div>
  );
};

/**
 * Helper function to create analytics layout configurations
 */
export const createAnalyticsLayout = ({
  title,
  description,
  icon,
  breadcrumbs = [],
  exportFormats = ['csv', 'pdf'],
  showFilters = true,
  showExport = true,
  showRefresh = true
}) => ({
  title,
  description,
  icon,
  breadcrumbs,
  exportFormats,
  showFilters,
  showExport,
  showRefresh
});