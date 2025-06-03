# Admin Analytics Dashboard - Developer Guide

This guide provides technical documentation for developers working on or extending the Admin Analytics Dashboard system.

## 1. Extending the Analytics System

Extending the system typically involves adding new analytics pages, new metrics to existing pages, or new data visualizations.

### 1.1. Adding a New Analytics Page

1.  **Define Backend Logic & API Endpoint**:
    *   Create a new controller method in [`AdminController.php`](app/Http/Controllers/AdminController.php:1) or a dedicated new controller (e.g., `NewFeatureAnalyticsController.php`).
    *   This method should fetch and process the necessary data from relevant models (e.g., [`Earning.php`](app/Models/Earning.php:1), [`Expense.php`](app/Models/Expense.php:1)).
    *   Define a new API route in [`routes/api.php`](routes/api.php:1) (or [`routes/web.php`](routes/web.php:1) if using Inertia for page loads directly) pointing to your new controller method. Ensure it's protected by admin authentication middleware.
        ```php
        // In routes/api.php or routes/web.php (within admin group)
        Route::get('/admin/analytics/new-feature', [AdminController::class, 'getNewFeatureAnalytics']);
        // Or if using a new controller:
        // Route::get('/admin/analytics/new-feature', [NewFeatureAnalyticsController::class, 'index']);
        ```
    *   Refer to `docs/admin-analytics/api-documentation.md` for existing API patterns.

2.  **Create Frontend Page Component**:
    *   Create a new React component in `resources/js/Pages/Admin/` (e.g., `NewFeatureAnalytics.jsx`).
    *   This component will fetch data from your new API endpoint using `useEffect` and `axios` (or Inertia's `usePage().props` if data is passed directly).
    *   Use shared components like [`AnalyticsLayout.jsx`](resources/js/Pages/Admin/Components/Layouts/AnalyticsLayout.jsx:1) to wrap your page content.
    *   Utilize [`ChartContainer.jsx`](resources/js/Pages/Admin/Components/Analytics/ChartContainer.jsx:1), [`AnalyticsCard.jsx`](resources/js/Pages/Admin/Components/Analytics/AnalyticsCard.jsx:1), etc., to display the data.
        ```jsx
        // resources/js/Pages/Admin/NewFeatureAnalytics.jsx
        import React, { useEffect, useState } from 'react';
        import AdminLayout from '@/Pages/Admin/Components/Layout/AdminLayout'; // Main admin layout
        import AnalyticsLayout from '@/Pages/Admin/Components/Layouts/AnalyticsLayout'; // Analytics specific layout
        import ChartContainer from '@/Pages/Admin/Components/Analytics/ChartContainer';
        import AnalyticsCard from '@/Pages/Admin/Components/Analytics/AnalyticsCard';
        // import { router } from '@inertiajs/react'; // If using Inertia page visits
        import axios from 'axios'; // If fetching API data client-side

        export default function NewFeatureAnalytics({ auth }) { // `auth` prop from Inertia
          const [data, setData] = useState(null);
          const [loading, setLoading] = useState(true);

          useEffect(() => {
            // Example: Fetching data client-side
            // For Inertia, data might be passed as props directly if route returns an Inertia response
            axios.get(route('api.admin.analytics.new-feature')) // Assuming route is named in api.php
              .then(response => {
                setData(response.data);
                setLoading(false);
              })
              .catch(error => {
                console.error("Error fetching new feature analytics:", error);
                setLoading(false);
              });
          }, []);

          return (
            <AdminLayout auth={auth} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">New Feature Analytics</h2>}>
              <AnalyticsLayout title="New Feature Analytics">
                {loading && <p>Loading data...</p>}
                {!loading && data && (
                  <>
                    <AnalyticsCard title="Key Metric 1" value={data.summary.metric1} />
                    <ChartContainer title="New Feature Chart" data={data.chartData} chartType="line" />
                    {/* ... more components ... */}
                  </>
                )}
              </AnalyticsLayout>
            </AdminLayout>
          );
        }
        ```

3.  **Add Navigation**:
    *   Update the navigation component (likely [`app-sidebar.jsx`](resources/js/components/app-sidebar.jsx:1)) to include a link to your new analytics page.
    *   Ensure the route name used in the navigation matches the one defined for your frontend page if using Inertia page loads, or the direct URL.

### 1.2. Adding New Metrics/Charts to Existing Pages

1.  **Backend**:
    *   Modify the existing API endpoint in the relevant controller (e.g., [`AdminController.php`](app/Http/Controllers/AdminController.php:1)) to include the new data/metric in its response.
    *   Update any data processing logic or model queries as needed.
2.  **Frontend**:
    *   Edit the existing React page component (e.g., [`CategoriesAnalytics.jsx`](resources/js/Pages/Admin/CategoriesAnalytics.jsx:1)).
    *   Add a new [`AnalyticsCard.jsx`](resources/js/Pages/Admin/Components/Analytics/AnalyticsCard.jsx:1) for the new metric or a new [`ChartContainer.jsx`](resources/js/Pages/Admin/Components/Analytics/ChartContainer.jsx:1) for the new visualization.
    *   Ensure the component consumes the new data from the API response.

## 2. Customizing Charts and Metrics

### Chart Customization

*   The [`ChartContainer.jsx`](resources/js/Pages/Admin/Components/Analytics/ChartContainer.jsx:1) component likely uses an underlying charting library (e.g., Chart.js, Recharts, Nivo). Check its implementation and the project's [`package.json`](package.json:1) to identify the library.
*   **Options Prop**: Pass charting library-specific options through the `options` prop of `ChartContainer`.
    ```jsx
    <ChartContainer
      title="Customized Chart"
      chartType="bar"
      data={chartData}
      options={{
        responsive: true,
        scales: { y: { beginAtZero: true } },
        // ...other Chart.js or Recharts options
      }}
    />
    ```
*   **New Chart Types**: If the current `ChartContainer` doesn't support a needed chart type, you might need to:
    1.  Extend `ChartContainer` to handle the new type.
    2.  Install a new charting library or an extension for the existing one.
    3.  Create a new specific chart component and use it directly.

### Metric Display

*   Metrics are typically displayed using [`AnalyticsCard.jsx`](resources/js/Pages/Admin/Components/Analytics/AnalyticsCard.jsx:1).
*   Customize its appearance using its props: `title`, `value`, `unit`, `icon`, `trend`.
*   For more complex metric displays, you can pass children to `AnalyticsCard` or create a new dedicated component.

## 3. Best Practices and Coding Standards

*   **Follow Existing Patterns**: Observe the structure and style of existing analytics components and API endpoints.
*   **Modularity**: Keep components small and focused on a single responsibility.
*   **Reusable Components**: Leverage shared components from `resources/js/Pages/Admin/Components/Analytics/` and `resources/js/components/ui/` whenever possible.
*   **State Management**: For complex pages, consider using React's `useReducer` or a state management library if local component state becomes unwieldy. Inertia.js also provides ways to manage state through props.
*   **API Design**:
    *   Keep API responses consistent.
    *   Use appropriate HTTP status codes.
    *   Provide clear error messages.
*   **Performance**:
    *   Optimize database queries in the backend.
    *   Use `React.memo` or `useMemo` for frontend components where appropriate to prevent unnecessary re-renders.
    *   Implement loading states ([`LoadingSkeleton.jsx`](resources/js/Pages/Admin/Components/Analytics/LoadingSkeleton.jsx:1)) to improve perceived performance.
    *   Consider pagination or virtualization for very large datasets.
*   **Code Style**: Adhere to the project's existing code style (e.g., ESLint, Prettier configurations). Check [`package.json`](package.json:1) for linting scripts.
*   **Accessibility (a11y)**: Ensure new UI elements are accessible (e.g., proper ARIA attributes, keyboard navigation).
*   **Naming Conventions**: Use clear and consistent naming for variables, functions, components, and API endpoints.

## 4. Testing Strategies

Effective testing is crucial for maintaining a stable and reliable analytics system.

### Backend (Laravel/PHP)

*   **Unit Tests**:
    *   Test individual controller methods, service classes, and complex logic within models.
    *   Use PHPUnit, which is integrated with Laravel.
    *   Mock dependencies (e.g., database interactions, external services) to isolate the unit under test.
    *   Example: Test that an analytics calculation in a service class returns the correct result for given inputs.
    *   Place tests in the `tests/Unit` directory.
*   **Feature/Integration Tests**:
    *   Test API endpoints to ensure they return the correct data structure, status codes, and handle authentication/authorization correctly.
    *   Use Laravel's HTTP testing utilities.
    *   These tests can interact with a test database.
    *   Example: Test the `/admin/analytics/categories` endpoint with various query parameters and verify the JSON response.
    *   Place tests in the `tests/Feature` directory.

### Frontend (React/JavaScript)

*   **Unit Tests**:
    *   Test individual React components in isolation.
    *   Use a testing library like Jest and React Testing Library (check [`package.json`](package.json:1) for setup, often in `setupTests.js`).
    *   Verify that components render correctly based on props, user interactions trigger expected callbacks, and conditional rendering logic works.
    *   Mock API calls using libraries like `msw` (Mock Service Worker) or `jest.mock`.
    *   Example: Test that `AnalyticsCard` displays the correct title and value passed via props. Test that `DateRangeFilter` calls `onDateChange` when a date is selected.
    *   Component tests are often co-located with the component or in a `__tests__` subdirectory.
*   **Integration Tests**:
    *   Test how multiple components work together on a page.
    *   Example: Test that selecting a date in `DateRangeFilter` updates the data displayed in `ChartContainer` on the `CategoriesAnalytics` page.
*   **End-to-End (E2E) Tests**:
    *   Use tools like Cypress or Playwright to simulate user interactions in a real browser environment.
    *   Test complete user flows, e.g., logging in as an admin, navigating to an analytics page, applying filters, and verifying the displayed data.
    *   These are typically slower and more complex to maintain but provide high confidence.

### General Testing Tips

*   **Test Edge Cases**: Consider empty states, error states, invalid inputs, and large datasets.
*   **Data Fixtures**: Use consistent test data (factories in Laravel, mock data in frontend tests) to ensure tests are repeatable.
*   **CI/CD Integration**: Run tests automatically as part of your continuous integration pipeline.
*   **Code Coverage**: Aim for reasonable code coverage, but focus on testing critical paths and complex logic rather than just chasing a percentage.

## 5. Configuration Options

*   **Backend Configuration**:
    *   Database connections, caching, queue drivers, etc., are configured in Laravel's `.env` file and `config/` directory files.
    *   Specific analytics-related configurations (e.g., default date ranges, thresholds) might be defined as constants or in dedicated config files (e.g., `config/analytics.php`).
*   **Frontend Configuration**:
    *   API base URLs or other settings might be configurable, potentially through JavaScript environment variables (e.g., `VITE_API_BASE_URL` if using Vite, managed via `.env` files and exposed in `resources/js/bootstrap.js` or similar).
    *   Default settings for components (e.g., default chart colors, number of items per page in tables) might be hardcoded or configurable via props.

Refer to the main project [`readme.md`](readme.md:1) and specific configuration files for more details on environment setup and application-level configurations.