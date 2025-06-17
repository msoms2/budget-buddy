/**
 * Analytics Components Index
 *
 * Centralized exports for analytics components and utilities
 */

// Import components
import AnalyticsCard from './AnalyticsCard';
import ChartContainer from './ChartContainer';
import ExportButton from './ExportButton';
import DateRangeFilter from './DateRangeFilter';
import MetricsDashboard from './MetricsDashboard';
import LoadingSkeleton from './LoadingSkeleton';

// Import component utilities
import { createAnalyticsCard } from './AnalyticsCard';
import { createChartContainer } from './ChartContainer';
import { createExportConfig, exportHandlers } from './ExportButton';
import { createDateRangeConfig, dateRangePresets } from './DateRangeFilter';
import { createMetricsDashboard, dashboardLayouts, metricTemplates } from './MetricsDashboard';
import { AnalyticsSkeletons, createAnalyticsLoading } from './LoadingSkeleton';

// Pre-configured components
const AnalyticsComponents = {
  Card: AnalyticsCard,
  Chart: ChartContainer,
  Export: ExportButton,
  DateRange: DateRangeFilter,
  Dashboard: MetricsDashboard,
  Skeleton: LoadingSkeleton
};

// Analytics configuration
export const analyticsConfig = {
  themes: {
    financial: ['emerald', 'rose', 'blue', 'violet'],
    performance: ['blue', 'emerald', 'amber', 'violet'],
    user: ['blue', 'emerald', 'violet', 'rose'],
    system: ['gray', 'blue', 'emerald', 'amber']
  },
  formats: {
    currency: 'currency',
    percentage: 'percentage',
    number: 'number'
  },
  chartTypes: {
    bar: 'bar',
    line: 'line',
    pie: 'pie',
    area: 'area'
  },
  exportFormats: ['csv', 'excel', 'pdf', 'png', 'json'],
  layouts: {
    grid: 'grid',
    masonry: 'masonry',
    flex: 'flex'
  }
};

// Utility functions
export const analyticsUtils = {
  formatNumber: (value, format = 'number') => {
    if (value === null || value === undefined) return 'N/A';
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(value);
      case 'percentage':
        return `${value}%`;
      case 'number':
      default:
        return typeof value === 'number' ? value.toLocaleString() : value;
    }
  },

  calculateTrend: (current, previous) => {
    if (!previous || previous === 0) return { direction: 'neutral', value: 0 };
    
    const change = ((current - previous) / previous) * 100;
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      value: Math.abs(change).toFixed(1)
    };
  },

  generateColors: (count, theme = 'blue') => {
    const colorMaps = {
      blue: ['#3B82F6', '#1D4ED8', '#2563EB', '#1E40AF', '#1E3A8A'],
      emerald: ['#10B981', '#059669', '#047857', '#065F46', '#064E3B'],
      rose: ['#F43F5E', '#E11D48', '#BE123C', '#9F1239', '#881337'],
      violet: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95'],
      amber: ['#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F']
    };
    
    const colors = colorMaps[theme] || colorMaps.blue;
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  }
};

// Export everything
export {
  // Components
  AnalyticsCard,
  ChartContainer,
  ExportButton,
  DateRangeFilter,
  MetricsDashboard,
  LoadingSkeleton,
  
  // Pre-configured components
  AnalyticsComponents,
  
  // Component utilities
  createAnalyticsCard,
  createChartContainer,
  createExportConfig,
  exportHandlers,
  createDateRangeConfig,
  dateRangePresets,
  createMetricsDashboard,
  dashboardLayouts,
  metricTemplates,
  AnalyticsSkeletons,
  createAnalyticsLoading
};