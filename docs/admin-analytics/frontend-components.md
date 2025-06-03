# Frontend Components Documentation

This document details the React components used in the Admin Analytics Dashboard frontend. It covers dashboard pages, shared analytics components, and layout/navigation components.

## 1. Dashboard Pages

These are the main pages for each analytics section, typically found in `resources/js/Pages/Admin/`. They compose various shared components to display data.

### 1.1. [`CategoriesAnalytics.jsx`](resources/js/Pages/Admin/CategoriesAnalytics.jsx:1)

*   **Purpose**: Displays analytics related to transaction categories.
*   **Key Features**: Shows spending/earning per category, trends, and comparisons.
*   **Shared Components Used**: Likely uses [`ChartContainer.jsx`](resources/js/Pages/Admin/Components/Analytics/ChartContainer.jsx:1) for visualizations (e.g., pie chart of category distribution), [`AnalyticsCard.jsx`](resources/js/Pages/Admin/Components/Analytics/AnalyticsCard.jsx:1) for key metrics, [`DateRangeFilter.jsx`](resources/js/Pages/Admin/Components/Analytics/DateRangeFilter.jsx:1), and [`ExportButton.jsx`](resources/js/Pages/Admin/Components/Analytics/ExportButton.jsx:1).
*   **Data Source**: Fetches data from the `/admin/analytics/categories` API endpoint.

### 1.2. [`BudgetAnalytics.jsx`](resources/js/Pages/Admin/BudgetAnalytics.jsx:1)

*   **Purpose**: Displays analytics related to user budgets.
*   **Key Features**: Shows budget utilization, over/under spending, and budget adherence.
*   **Shared Components Used**: [`ChartContainer.jsx`](resources/js/Pages/Admin/Components/Analytics/ChartContainer.jsx:1) (e.g., bar chart for budget vs. actual), [`AnalyticsCard.jsx`](resources/js/Pages/Admin/Components/Analytics/AnalyticsCard.jsx:1), [`DateRangeFilter.jsx`](resources/js/Pages/Admin/Components/Analytics/DateRangeFilter.jsx:1).
*   **Data Source**: Fetches data from the `/admin/analytics/budgets` API endpoint.

### 1.3. [`GoalsAnalytics.jsx`](resources/js/Pages/Admin/GoalsAnalytics.jsx:1)

*   **Purpose**: Displays analytics related to user financial goals.
*   **Key Features**: Shows goal progress, completion rates, and common goal types.
*   **Shared Components Used**: [`ChartContainer.jsx`](resources/js/Pages/Admin/Components/Analytics/ChartContainer.jsx:1) (e.g., progress bars, completion rate charts), [`AnalyticsCard.jsx`](resources/js/Pages/Admin/Components/Analytics/AnalyticsCard.jsx:1).
*   **Data Source**: Fetches data from the `/admin/analytics/goals` API endpoint.

### 1.4. [`DebtAnalytics.jsx`](resources/js/Pages/Admin/DebtAnalytics.jsx:1)

*   **Purpose**: Displays analytics related to user debts.
*   **Key Features**: Shows total outstanding debt, average interest rates, and debt type distribution.
*   **Shared Components Used**: [`ChartContainer.jsx`](resources/js/Pages/Admin/Components/Analytics/ChartContainer.jsx:1), [`AnalyticsCard.jsx`](resources/js/Pages/Admin/Components/Analytics/AnalyticsCard.jsx:1).
*   **Data Source**: Fetches data from the `/admin/analytics/debts` API endpoint.

### 1.5. [`InvestmentAnalytics.jsx`](resources/js/Pages/Admin/InvestmentAnalytics.jsx:1)

*   **Purpose**: Displays analytics related to user investments.
*   **Key Features**: Shows total investment value, asset allocation, and performance returns.
*   **Shared Components Used**: [`ChartContainer.jsx`](resources/js/Pages/Admin/Components/Analytics/ChartContainer.jsx:1) (e.g., portfolio allocation pie chart, performance line chart), [`AnalyticsCard.jsx`](resources/js/Pages/Admin/Components/Analytics/AnalyticsCard.jsx:1).
*   **Data Source**: Fetches data from the `/admin/analytics/investments` API endpoint.

---

## 2. Shared Analytics Components

These components are reusable UI elements found in `resources/js/Pages/Admin/Components/Analytics/` used across different analytics pages.

### 2.1. [`AnalyticsCard.jsx`](resources/js/Pages/Admin/Components/Analytics/AnalyticsCard.jsx:1)

*   **Purpose**: A versatile card component to display a single metric, a small piece of data, or a compact visualization.
*   **Props**:
    *   `title`: (string, required) The title displayed at the top of the card.
    *   `value`: (string | number, required) The main data value to display.
    *   `unit`: (string, optional) Unit for the value (e.g., "$", "%").
    *   `icon`: (ReactNode, optional) An icon to display alongside the title or value.
    *   `trend`: (object, optional) Information about a trend.
        *   `direction`: ('up' | 'down' | 'neutral')
        *   `percentage`: (number)
    *   `isLoading`: (boolean, optional) If true, displays a loading state (e.g., using [`LoadingSkeleton.jsx`](resources/js/Pages/Admin/Components/Analytics/LoadingSkeleton.jsx:1)).
    *   `children`: (ReactNode, optional) For embedding more complex content like small charts or lists.
*   **Usage Example**:
    ```jsx
    import AnalyticsCard from '@admin/Components/Analytics/AnalyticsCard';
    import { UsersIcon } from 'lucide-react';

    <AnalyticsCard
      title="Total Users"
      value={1250}
      icon={<UsersIcon />}
      trend={{ direction: 'up', percentage: 5.2 }}
    />
    ```

### 2.2. [`ChartContainer.jsx`](resources/js/Pages/Admin/Components/Analytics/ChartContainer.jsx:1)

*   **Purpose**: A wrapper component for displaying various types of charts (e.g., bar, line, pie). It handles common chart functionalities like titles, loading states, and potentially error states.
*   **Props**:
    *   `title`: (string, required) The title of the chart.
    *   `chartType`: (string, required) Specifies the type of chart to render (e.g., 'bar', 'line', 'pie'). This might determine which underlying charting library component is used.
    *   `data`: (object | array, required) The data to be visualized by the chart. Structure depends on the `chartType` and the charting library used.
    *   `options`: (object, optional) Configuration options for the specific chart type (passed to the charting library).
    *   `isLoading`: (boolean, optional) If true, displays a loading state.
    *   `height`: (string | number, optional) Sets the height of the chart container. Default: `300px`.
    *   `emptyStateMessage`: (string, optional) Message to display if data is empty. Default: "No data available".
*   **Usage Example**:
    ```jsx
    import ChartContainer from '@admin/Components/Analytics/ChartContainer';

    const barChartData = { /* ... data for bar chart ... */ };
    const barChartOptions = { /* ... options for bar chart ... */ };

    <ChartContainer
      title="Spending by Category"
      chartType="bar"
      data={barChartData}
      options={barChartOptions}
      isLoading={isLoadingCategories}
    />
    ```

### 2.3. [`DateRangeFilter.jsx`](resources/js/Pages/Admin/Components/Analytics/DateRangeFilter.jsx:1)

*   **Purpose**: Allows users to select a date range (start date and end date) to filter the analytics data.
*   **Props**:
    *   `initialStartDate`: (Date | string, optional) The initially selected start date.
    *   `initialEndDate`: (Date | string, optional) The initially selected end date.
    *   `onDateChange`: (function, required) Callback function triggered when the date range changes. Receives an object `{ startDate, endDate }`.
    *   `presets`: (array, optional) Array of predefined date range options (e.g., "Last 7 days", "Last 30 days", "This Month").
        *   `label`: (string)
        *   `value`: (object) `{ startDate, endDate }`
*   **Usage Example**:
    ```jsx
    import DateRangeFilter from '@admin/Components/Analytics/DateRangeFilter';

    const handleDateFilterChange = (dates) => {
      console.log("Selected dates:", dates);
      // Fetch new data based on dates.startDate and dates.endDate
    };

    <DateRangeFilter onDateChange={handleDateFilterChange} />
    ```

### 2.4. [`ExportButton.jsx`](resources/js/Pages/Admin/Components/Analytics/ExportButton.jsx:1)

*   **Purpose**: Provides a button or dropdown to export the current analytics data or view.
*   **Props**:
    *   `data`: (array | object, required for direct export) The data to be exported.
    *   `fileName`: (string, optional) Default filename for the exported file (e.g., "categories-analytics.csv").
    *   `formats`: (array, optional) Supported export formats (e.g., `['csv', 'json', 'pdf']`). Default: `['csv']`.
    *   `onExport`: (function, optional) Custom export handler function. If provided, this function is called with the selected format and potentially the data.
*   **Usage Example**:
    ```jsx
    import ExportButton from '@admin/Components/Analytics/ExportButton';

    const analyticsData = [ { /* ... */ } ];

    <ExportButton data={analyticsData} fileName="budget_report.csv" formats={['csv', 'json']} />
    ```

### 2.5. [`MetricsDashboard.jsx`](resources/js/Pages/Admin/Components/Analytics/MetricsDashboard.jsx:1)

*   **Purpose**: A layout component to arrange multiple [`AnalyticsCard.jsx`](resources/js/Pages/Admin/Components/Analytics/AnalyticsCard.jsx:1) components or other metric displays in a consistent grid or row.
*   **Props**:
    *   `children`: (ReactNode, required) Typically a series of `AnalyticsCard` components.
    *   `columns`: (number, optional) Number of columns for the grid layout. Default: 3 or auto-adjusting.
*   **Usage Example**:
    ```jsx
    import MetricsDashboard from '@admin/Components/Analytics/MetricsDashboard';
    import AnalyticsCard from '@admin/Components/Analytics/AnalyticsCard';

    <MetricsDashboard columns={4}>
      <AnalyticsCard title="Total Revenue" value="$50,000" />
      <AnalyticsCard title="New Signups" value="300" />
      <AnalyticsCard title="Active Budgets" value="150" />
      <AnalyticsCard title="Pending Goals" value="45" />
    </MetricsDashboard>
    ```

### 2.6. [`LoadingSkeleton.jsx`](resources/js/Pages/Admin/Components/Analytics/LoadingSkeleton.jsx:1)

*   **Purpose**: Displays placeholder UI elements (skeletons) to indicate that data is being loaded. Used within other components like `AnalyticsCard` or `ChartContainer`.
*   **Props**:
    *   `type`: ('card' | 'chart' | 'table-row' | 'text', optional) Specifies the type of skeleton to render. Default: 'text'.
    *   `lines`: (number, optional, for 'text' type) Number of text lines to show in skeleton.
    *   `height`: (string | number, optional) Height of the skeleton element.
    *   `width`: (string | number, optional) Width of the skeleton element.
*   **Usage Example**:
    ```jsx
    import LoadingSkeleton from '@admin/Components/Analytics/LoadingSkeleton';

    // Used internally by other components, but can be used directly:
    if (isLoading) {
      return <LoadingSkeleton type="chart" height="300px" />;
    }
    ```

---

## 3. Layout Components and Navigation

### 3.1. [`AnalyticsLayout.jsx`](resources/js/Pages/Admin/Components/Layouts/AnalyticsLayout.jsx:1)

*   **Purpose**: Provides the specific layout structure for all admin analytics pages. This might include a secondary navigation bar for analytics sub-sections, common filters, or a consistent header.
*   **Props**:
    *   `title`: (string, required) The title for the current analytics page, often displayed in the header.
    *   `children`: (ReactNode, required) The main content of the specific analytics page.
*   **Integration**: This layout likely wraps the content of pages like [`CategoriesAnalytics.jsx`](resources/js/Pages/Admin/CategoriesAnalytics.jsx:1). It itself might be nested within the main [`AdminLayout.jsx`](resources/js/Pages/Admin/Components/Layout/AdminLayout.jsx:1).

### 3.2. [`AdminLayout.jsx`](resources/js/Pages/Admin/Components/Layout/AdminLayout.jsx:1)

*   **Purpose**: The main layout for the entire admin section of the application. It includes the primary navigation (sidebar), header, and footer.
*   **Key Features**:
    *   Integrates the main application sidebar ([`app-sidebar.jsx`](resources/js/components/app-sidebar.jsx:1)).
    *   Provides a consistent header, possibly with user profile links or global actions.
    *   Renders the main content area where specific admin pages (including analytics pages wrapped in `AnalyticsLayout`) are displayed.
*   **Props**:
    *   `auth`: (object) Authentication information for the current user.
    *   `header`: (ReactNode, optional) Content to be rendered in the header section of the layout.
    *   `children`: (ReactNode, required) The content of the current admin page.

### 3.3. Navigation Integration ([`app-sidebar.jsx`](resources/js/components/app-sidebar.jsx:1))

*   **Purpose**: The main sidebar navigation component for the application.
*   **Integration with Analytics**: The sidebar should contain links to the various admin analytics dashboard pages (Categories, Budget, Goals, Debt, Investment). These links would navigate to the respective React page components.
*   **Structure**: Likely uses a list of navigation items, each with a label, icon, and route/href.
    ```jsx
    // Conceptual structure within app-sidebar.jsx
    const navItems = [
      // ... other admin links
      {
        label: 'Analytics',
        icon: <BarChartIcon />,
        children: [
          { label: 'Categories', href: route('admin.analytics.categories') },
          { label: 'Budgets', href: route('admin.analytics.budgets') },
          // ... other analytics links
        ]
      },
      // ...
    ];
    ```

---

This documentation provides an overview of the key frontend components. For detailed prop types and implementation specifics, refer to the source code of each component.