# Analytics Components

This directory contains reusable components specifically designed for analytics dashboards in the admin panel. These components provide a consistent design system and functionality across all analytics pages.

## Components Overview

### Core Components

#### AnalyticsCard
A flexible metric display card with support for:
- Multiple value formats (currency, percentage, number)
- Trend indicators with visual feedback
- Custom themes and variants
- Action buttons and links
- Loading states

```jsx
import { AnalyticsCard } from '@/Pages/Admin/Components/Analytics';

<AnalyticsCard
  title="Total Revenue"
  value={125000}
  format="currency"
  trend={{ direction: 'up', value: '12.5', label: 'vs last month' }}
  theme="emerald"
  icon={DollarSign}
/>
```

#### ChartContainer
A wrapper component for charts with consistent styling:
- Header with title, description, and actions
- Export functionality (PNG, CSV, PDF)
- Loading and error states
- Responsive sizing
- Chart type indicators

```jsx
import { ChartContainer } from '@/Pages/Admin/Components/Analytics';

<ChartContainer
  title="Revenue Trends"
  description="Monthly revenue over the past year"
  chartType="line"
  onExport={handleExport}
  onRefresh={handleRefresh}
>
  <YourChartComponent />
</ChartContainer>
```

#### DateRangeFilter
A comprehensive date range picker with:
- Custom date selection
- Quick preset options
- Validation and error handling
- Responsive design
- Clear/reset functionality

```jsx
import { DateRangeFilter } from '@/Pages/Admin/Components/Analytics';

<DateRangeFilter
  value={{ from: startDate, to: endDate }}
  onChange={handleDateRangeChange}
  presets={dateRangePresets.analytics}
  showPresets={true}
/>
```

#### ExportButton
A reusable export component supporting multiple formats:
- CSV, Excel, PDF, PNG, JSON formats
- Progress indication
- Success/error feedback
- File size estimation
- Batch export functionality

```jsx
import { ExportButton } from '@/Pages/Admin/Components/Analytics';

<ExportButton
  formats={['csv', 'pdf', 'excel']}
  onExport={handleExport}
  data={analyticsData}
  filename="analytics_report"
/>
```

#### MetricsDashboard
A layout component for organizing metrics cards:
- Responsive grid system
- Multiple layout options (grid, masonry, flex)
- Loading states
- Empty states
- Automatic card sizing

```jsx
import { MetricsDashboard } from '@/Pages/Admin/Components/Analytics';

<MetricsDashboard
  title="Key Performance Indicators"
  metrics={metricsArray}
  layout="grid"
  columns="4"
  loading={isLoading}
/>
```

#### LoadingSkeleton
Loading skeletons specifically for analytics:
- Multiple skeleton types (card, chart, table, dashboard)
- Animated loading states
- Responsive sizing
- Customizable patterns

```jsx
import { LoadingSkeleton } from '@/Pages/Admin/Components/Analytics';

<LoadingSkeleton type="dashboard" count={8} />
<LoadingSkeleton type="chart" height="400px" />
<LoadingSkeleton type="card" count={4} variant="compact" />
```

### Layout Components

#### AnalyticsLayout
A common layout for all analytics pages:
- Consistent header with breadcrumbs
- Shared filtering controls
- Export and refresh functionality
- Responsive grid system
- Common analytics actions

```jsx
import AnalyticsLayout from '@/Pages/Admin/Components/Layouts/AnalyticsLayout';

<AnalyticsLayout
  title="Categories Analytics"
  description="Analyze category usage patterns and performance"
  icon={PieChart}
  breadcrumbs={[{ label: "Categories", icon: PieChart }]}
  filters={filters}
  onFiltersChange={handleFiltersChange}
  onExport={handleExport}
  onRefresh={handleRefresh}
>
  {/* Your analytics content */}
</AnalyticsLayout>
```

## Navigation Integration

The analytics pages are integrated into the admin navigation under:
```
Admin Panel > Analytics > [Specific Analytics Page]
```

Available analytics pages:
- Categories Analytics
- Budget Analytics
- Goals Analytics
- Debt Analytics
- Investment Analytics

## Usage Patterns

### Basic Analytics Page Structure

```jsx
import React from 'react';
import AnalyticsLayout from '@/Pages/Admin/Components/Layouts/AnalyticsLayout';
import { MetricsDashboard, ChartContainer, AnalyticsCard } from '@/Pages/Admin/Components/Analytics';

export default function YourAnalytics({ data, filters }) {
  return (
    <AnalyticsLayout
      title="Your Analytics"
      description="Description of your analytics"
      icon={YourIcon}
      breadcrumbs={[{ label: "Your Section", icon: YourIcon }]}
      filters={filters}
      onFiltersChange={handleFiltersChange}
    >
      {/* KPI Cards */}
      <MetricsDashboard
        metrics={kpiMetrics}
        layout="grid"
        columns="4"
      />

      {/* Charts Section */}
      <AnalyticsLayout.Grid columns="2">
        <ChartContainer
          title="Chart 1"
          chartType="bar"
        >
          <YourChart1 />
        </ChartContainer>
        
        <ChartContainer
          title="Chart 2"
          chartType="pie"
        >
          <YourChart2 />
        </ChartContainer>
      </AnalyticsLayout.Grid>
    </AnalyticsLayout>
  );
}
```

### Common Configurations

```jsx
// Import common configurations
import { 
  dashboardLayouts,
  metricTemplates,
  dateRangePresets,
  analyticsConfig 
} from '@/Pages/Admin/Components/Analytics';

// Use pre-configured layouts
const kpiLayout = dashboardLayouts.kpi;
const financialMetrics = metricTemplates.financial;
const analyticsDatePresets = dateRangePresets.analytics;
```

## Theming

The components support multiple color themes:
- `blue` (default)
- `emerald` (for positive metrics)
- `rose` (for negative metrics/alerts)
- `violet` (for neutral/info metrics)
- `amber` (for warnings)

## Accessibility

All components include:
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast compliance

## Performance

- Components use React.memo for optimization
- Skeleton loading states prevent layout shifts
- Lazy loading for heavy chart components
- Efficient re-rendering with proper dependencies

## File Structure

```
Analytics/
├── AnalyticsCard.jsx          # Metric display cards
├── ChartContainer.jsx         # Chart wrapper component
├── DateRangeFilter.jsx        # Date range picker
├── ExportButton.jsx           # Export functionality
├── LoadingSkeleton.jsx        # Loading states
├── MetricsDashboard.jsx       # Metrics layout component
├── index.js                   # Centralized exports
└── README.md                  # This documentation

Layouts/
└── AnalyticsLayout.jsx        # Common analytics layout
```

## Best Practices

1. **Consistent Theming**: Use the predefined themes for consistency
2. **Loading States**: Always provide loading states for better UX
3. **Error Handling**: Include error states and fallbacks
4. **Responsive Design**: Test components on different screen sizes
5. **Accessibility**: Follow WCAG guidelines for all interactions
6. **Performance**: Use proper memoization and lazy loading
7. **Type Safety**: Include proper prop validation

## Contributing

When adding new analytics components:
1. Follow the existing naming conventions
2. Include proper documentation and examples
3. Add loading and error states
4. Ensure responsive design
5. Include accessibility features
6. Update the index.js exports
7. Add to this README if it's a major component