# Admin Analytics Dashboard - User Guide

Welcome to the Admin Analytics Dashboard! This guide will help you understand how to access, navigate, and utilize the various features of the analytics system to gain insights into your platform's data.

## 1. Accessing and Navigating the Dashboards

### Accessing the Dashboard

1.  **Login**: Ensure you are logged in to the main application with your administrator credentials.
2.  **Navigation**:
    *   Locate the main navigation menu, typically a sidebar ([`app-sidebar.jsx`](resources/js/components/app-sidebar.jsx:1)).
    *   Find the "Admin" or "Administration" section.
    *   Within the admin section, look for an "Analytics" or "Dashboard" link. This might be a top-level link or a sub-menu.
    *   The main admin dashboard might be at a URL like `/admin/dashboard`. Analytics sections will be sub-pages like `/admin/analytics/categories`.

### Navigating Between Analytics Sections

Once in the analytics area, you'll typically find a secondary navigation system, possibly within the [`AnalyticsLayout.jsx`](resources/js/Pages/Admin/Components/Layouts/AnalyticsLayout.jsx:1), allowing you to switch between different analytics views:

*   **Categories Analytics**: ([`CategoriesAnalytics.jsx`](resources/js/Pages/Admin/CategoriesAnalytics.jsx:1)) Insights into transaction categories.
*   **Budget Analytics**: ([`BudgetAnalytics.jsx`](resources/js/Pages/Admin/BudgetAnalytics.jsx:1)) Performance against budgets.
*   **Goals Analytics**: ([`GoalsAnalytics.jsx`](resources/js/Pages/Admin/GoalsAnalytics.jsx:1)) Progress on user financial goals.
*   **Debt Analytics**: ([`DebtAnalytics.jsx`](resources/js/Pages/Admin/DebtAnalytics.jsx:1)) Overview of user debts.
*   **Investment Analytics**: ([`InvestmentAnalytics.jsx`](resources/js/Pages/Admin/InvestmentAnalytics.jsx:1)) Performance of user investments.

Click on the respective links or tabs to load the desired dashboard.

## 2. Using Filters and Export Features

### Filtering Data

Most analytics dashboards provide options to filter the displayed data, allowing you to focus on specific time periods or segments.

*   **Date Range Filter** ([`DateRangeFilter.jsx`](resources/js/Pages/Admin/Components/Analytics/DateRangeFilter.jsx:1)):
    *   Look for a date picker component, often at the top of the dashboard.
    *   You can select a start date and an end date to define a custom period.
    *   Some dashboards may offer predefined presets like "Last 7 Days," "Last 30 Days," "This Month," or "Year to Date."
    *   After selecting a date range, the charts and metrics on the dashboard will update automatically or upon clicking an "Apply" button.

*   **Other Filters**:
    *   Depending on the dashboard, you might find other filter options, such as:
        *   **Transaction Type**: (e.g., "Income," "Expense" on Categories Analytics)
        *   **Status**: (e.g., "Active," "Exceeded" on Budget Analytics; "In Progress," "Completed" on Goals Analytics)
        *   **User ID or Name**: To view analytics for a specific user.
        *   **Category/Type**: (e.g., "Asset Type" on Investment Analytics; "Debt Type" on Debt Analytics)
    *   These filters are usually dropdowns, radio buttons, or text input fields.

### Exporting Data

The ability to export data allows for offline analysis or reporting.

*   **Export Button** ([`ExportButton.jsx`](resources/js/Pages/Admin/Components/Analytics/ExportButton.jsx:1)):
    *   Look for an "Export" button or icon, often near the top of the dashboard or specific charts/tables.
    *   Clicking this button may:
        *   Immediately download a default file format (e.g., CSV).
        *   Open a dropdown menu allowing you to choose an export format (e.g., CSV, JSON, PDF).
    *   The exported data will typically reflect the currently applied filters.
    *   The default filename might be something like `categories-analytics.csv` or `investment_summary.json`.

### Drill-Down Features

Some charts or tables might support drill-down functionality, allowing you to explore data in more detail.

*   **Interactive Charts**:
    *   Hovering over chart segments (e.g., a bar in a bar chart, a slice in a pie chart) may display a tooltip with specific values.
    *   Clicking on a chart segment might:
        *   Filter the current dashboard to show data related only to that segment.
        *   Navigate to a more detailed view or a related table of underlying data.
        *   Open a modal with more information.
*   **Interactive Tables**:
    *   Table rows might be clickable, leading to a detailed view of that specific item.
    *   Sorting: Click on table headers to sort data by that column.

## 3. Understanding Metrics and Visualizations

Each dashboard presents data through various metrics and visualizations:

### Common Metrics (via [`AnalyticsCard.jsx`](resources/js/Pages/Admin/Components/Analytics/AnalyticsCard.jsx:1))

*   **Total Counts**: E.g., Total Users, Total Transactions, Total Goals.
*   **Total Amounts**: E.g., Total Spending, Total Revenue, Total Investment Value.
*   **Averages**: E.g., Average Transaction Value, Average Goal Progress.
*   **Percentages**: E.g., Budget Utilization %, Goal Completion Rate %.
*   **Trends**: Often indicated with an arrow (up/down) and a percentage change compared to a previous period.

### Common Visualizations (via [`ChartContainer.jsx`](resources/js/Pages/Admin/Components/Analytics/ChartContainer.jsx:1))

*   **Bar Charts**: Used for comparing values across different categories or time periods (e.g., spending per category, monthly revenue).
*   **Line Charts**: Used for showing trends over time (e.g., user growth over months, investment performance).
*   **Pie Charts/Doughnut Charts**: Used for showing proportions of a whole (e.g., category distribution of expenses, asset allocation in investments).
*   **Tables**: Used for displaying detailed row-based data. Often sortable and may include pagination.
*   **Progress Bars**: Used for visualizing progress towards a target (e.g., goal completion).

**Interpreting Data:**

*   **Context is Key**: Always consider the applied filters (especially date ranges) when interpreting data.
*   **Look for Trends**: Identify patterns, increases, or decreases over time.
*   **Compare Segments**: Compare performance across different categories, user groups, etc.
*   **Identify Outliers**: Look for data points that are significantly different from the norm.

## 4. Troubleshooting Common Issues

*   **Data Not Loading / Empty Dashboard**:
    *   **Check Filters**: Ensure your date range and other filters are not too restrictive or set to a period with no data. Try broadening the date range.
    *   **Internet Connection**: Verify your internet connection.
    *   **System Status**: There might be a temporary issue with the backend or database. Check for any system status notifications or contact support if the issue persists.
    *   **Permissions**: Ensure your admin account has the necessary permissions to view analytics data.

*   **Incorrect Data Displayed**:
    *   **Confirm Filters**: Double-check that the filters applied are what you intended.
    *   **Data Sync Lag**: In some systems, there might be a slight delay between when data is generated and when it appears in analytics. Wait a few minutes and refresh.
    *   **Report Discrepancy**: If you believe data is genuinely incorrect, note down the filters applied, the data shown, and what you expected. Contact the development or support team with these details.

*   **Export Fails or File is Corrupted**:
    *   **Try a Different Format**: If one format fails (e.g., PDF), try exporting as CSV or JSON.
    *   **Data Size**: Very large datasets might sometimes cause issues with exports. Try filtering for a smaller data subset.
    *   **Browser Issues**: Try a different web browser or clear your browser cache.
    *   **Contact Support**: If the problem persists, report it.

*   **Slow Performance**:
    *   **Complex Filters/Large Date Ranges**: Dashboards might load slower with very broad date ranges or complex filter combinations. Try narrowing your criteria.
    *   **Network Speed**: A slow internet connection can impact loading times.
    *   **System Load**: The server might be under heavy load.

### FAQ

*   **Q: How often is the analytics data updated?**
    *   A: This depends on the system configuration. Data might be updated in real-time, near real-time, or on a scheduled basis (e.g., daily). Check with your system administrator or refer to specific system documentation if available.

*   **Q: Can I save my filter settings?**
    *   A: This feature depends on the specific implementation. Some dashboards might remember your last used filters, while others may reset on each visit.

*   **Q: Who can I contact if I have more questions or find an issue?**
    *   A: Contact your internal IT support, the application development team, or the designated administrator for the Budget Buddy platform.

This guide should provide a good starting point for using the Admin Analytics Dashboard. Explore the different sections and features to become familiar with the available insights.