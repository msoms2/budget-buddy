# Admin Analytics Dashboard - System Overview

This document provides a comprehensive overview of the Admin Analytics Dashboard system, including its architecture, components, installation instructions, and system requirements.

## 1. Architecture Overview

The Admin Analytics Dashboard is a full-stack application designed to provide administrators with insights into various aspects of the platform. It follows a client-server architecture:

*   **Backend**: Implemented using Laravel (PHP), responsible for data processing, API endpoints, business logic, and database interactions.
*   **Frontend**: Implemented using React (JavaScript/JSX) with Inertia.js, providing a dynamic and responsive user interface for administrators to view and interact with analytics data.
*   **Database**: (Assumed to be a relational database like MySQL or PostgreSQL, managed by Laravel's Eloquent ORM). Stores all application data, including user information, financial records, and analytics-related data.

### Component Interaction Flow

1.  **User Interaction**: An administrator accesses the analytics dashboard through their web browser.
2.  **Frontend Request**: The React frontend, via Inertia.js, makes requests to the Laravel backend for analytics data. These requests are typically directed to specific API endpoints.
3.  **Backend Processing**:
    *   Laravel routes direct the request to the appropriate controller (e.g., [`AdminController.php`](app/Http/Controllers/AdminController.php:1)).
    *   The controller interacts with relevant models (e.g., [`Budget.php`](app/Models/Budget.php:1), [`Category.php`](app/Models/Category.php:1), [`Goal.php`](app/Models/Goal.php:1), etc.) to fetch and process data from the database.
    *   Services or helper classes might be used for complex calculations or data transformations.
4.  **API Response**: The backend sends the processed data back to the frontend, typically in JSON format.
5.  **Frontend Rendering**: The React components (e.g., [`CategoriesAnalytics.jsx`](resources/js/Pages/Admin/CategoriesAnalytics.jsx:1), [`BudgetAnalytics.jsx`](resources/js/Pages/Admin/BudgetAnalytics.jsx:1)) receive the data and render visualizations (charts, tables, metrics) using shared components like [`AnalyticsCard.jsx`](resources/js/Pages/Admin/Components/Analytics/AnalyticsCard.jsx:1) and [`ChartContainer.jsx`](resources/js/Pages/Admin/Components/Analytics/ChartContainer.jsx:1).

## 2. Key Components

### Backend (Laravel)

*   **Controllers**:
    *   [`AdminController.php`](app/Http/Controllers/AdminController.php:1): Likely handles requests for admin-specific functionalities, including analytics.
    *   Other relevant controllers for specific data entities (e.g., `BudgetController.php`, `CategoryController.php`).
*   **Models**: Eloquent models representing database tables (e.g., `User.php`, `Transaction.php`, `Budget.php`, `Goal.php`, `Investment.php`, `Earning.php`, `Expense.php`).
*   **Routes**: Defined in [`routes/web.php`](routes/web.php:1) and [`routes/api.php`](routes/api.php:1), mapping URLs to controller actions. Admin analytics routes are likely prefixed with `/admin/analytics/`.
*   **Middleware**:
    *   [`AdminMiddleware.php`](app/Http/Middleware/AdminMiddleware.php:1) or [`IsAdmin.php`](app/Http/Middleware/IsAdmin.php:1): Ensures that only authenticated administrators can access the analytics section.
*   **Services**: May contain business logic for complex analytics calculations.

### Frontend (React with Inertia.js)

*   **Pages**:
    *   [`CategoriesAnalytics.jsx`](resources/js/Pages/Admin/CategoriesAnalytics.jsx:1)
    *   [`BudgetAnalytics.jsx`](resources/js/Pages/Admin/BudgetAnalytics.jsx:1)
    *   [`GoalsAnalytics.jsx`](resources/js/Pages/Admin/GoalsAnalytics.jsx:1)
    *   [`DebtAnalytics.jsx`](resources/js/Pages/Admin/DebtAnalytics.jsx:1)
    *   [`InvestmentAnalytics.jsx`](resources/js/Pages/Admin/InvestmentAnalytics.jsx:1)
*   **Shared Analytics Components**: Located in `resources/js/Pages/Admin/Components/Analytics/`
    *   [`AnalyticsCard.jsx`](resources/js/Pages/Admin/Components/Analytics/AnalyticsCard.jsx:1): Displays individual metrics or small charts.
    *   [`ChartContainer.jsx`](resources/js/Pages/Admin/Components/Analytics/ChartContainer.jsx:1): A wrapper for displaying various types of charts.
    *   [`DateRangeFilter.jsx`](resources/js/Pages/Admin/Components/Analytics/DateRangeFilter.jsx:1): Allows users to filter data by date.
    *   [`ExportButton.jsx`](resources/js/Pages/Admin/Components/Analytics/ExportButton.jsx:1): Enables data export.
    *   [`MetricsDashboard.jsx`](resources/js/Pages/Admin/Components/Analytics/MetricsDashboard.jsx:1): A higher-level component for arranging multiple metrics.
*   **Layout Components**:
    *   [`AnalyticsLayout.jsx`](resources/js/Pages/Admin/Components/Layouts/AnalyticsLayout.jsx:1): Provides the common structure for analytics pages.
    *   [`AdminLayout.jsx`](resources/js/Pages/Admin/Components/Layout/AdminLayout.jsx:1): General layout for the admin section.
*   **Navigation**: Integrated into the admin layout, likely using components like [`app-sidebar.jsx`](resources/js/components/app-sidebar.jsx:1).

## 3. Installation and Setup

(Assuming a standard Laravel project setup)

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd budget-buddy-nosleguma-darbs
    ```

2.  **Install PHP Dependencies**:
    ```bash
    composer install
    ```

3.  **Install JavaScript Dependencies**:
    ```bash
    npm install
    ```

4.  **Environment Configuration**:
    *   Copy the `.env.example` file to `.env`:
        ```bash
        cp .env.example .env
        ```
    *   Generate an application key:
        ```bash
        php artisan key:generate
        ```
    *   Configure database credentials and other environment-specific settings in the `.env` file (e.g., `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`).

5.  **Database Migrations and Seeding**:
    *   Run database migrations:
        ```bash
        php artisan migrate
        ```
    *   (Optional) Seed the database with initial data:
        ```bash
        php artisan db:seed
        ```

6.  **Compile Frontend Assets**:
    *   For development:
        ```bash
        npm run dev
        ```
    *   For production:
        ```bash
        npm run build
        ```

7.  **Set Up Web Server**:
    *   Configure your web server (e.g., Nginx, Apache) to point to the `public` directory.
    *   Ensure URL rewriting is enabled. For Nginx, a typical configuration snippet:
        ```nginx
        location / {
            try_files $uri $uri/ /index.php?$query_string;
        }
        ```

8.  **Permissions**:
    *   Ensure the `storage` and `bootstrap/cache` directories are writable by the web server.
        ```bash
        chmod -R 775 storage bootstrap/cache
        chown -R www-data:www-data storage bootstrap/cache # Adjust user/group as per your server setup
        ```

9.  **Access the Application**:
    *   Open your web browser and navigate to the configured application URL.
    *   Access the admin analytics dashboard (typically `/admin/dashboard` or a similar route).

## 4. System Requirements and Dependencies

### Backend (Server-Side)

*   **PHP**: Version specified in [`composer.json`](composer.json:1) (e.g., ^8.1)
*   **Web Server**: Nginx or Apache
*   **Database**: MySQL, PostgreSQL, SQLite, or SQL Server (as supported by Laravel)
*   **Composer**: For PHP package management
*   **PHP Extensions**: Common extensions required by Laravel (e.g., pdo, mbstring, tokenizer, xml, ctype, json, bcmath, openssl)

### Frontend (Client-Side)

*   **Modern Web Browser**: Chrome, Firefox, Safari, Edge
*   **JavaScript Enabled**

### Development Environment

*   **Node.js & npm**: Versions specified in [`package.json`](package.json:1) (for managing JavaScript dependencies and building assets)
*   **Git**: For version control

## 5. Key Dependencies (from `composer.json` and `package.json`)

*   **Laravel Framework**: Core backend framework.
*   **Inertia.js**: For building single-page apps with server-side routing and controllers.
    *   `inertiajs/inertia-laravel`
    *   `@inertiajs/react`
*   **React**: JavaScript library for building user interfaces.
*   **Ziggy**: For using Laravel routes in JavaScript.
*   **Charting Library**: (e.g., Chart.js, Recharts - check [`package.json`](package.json:1) and frontend components like [`ChartContainer.jsx`](resources/js/Pages/Admin/Components/Analytics/ChartContainer.jsx:1) for specifics).
*   **UI Component Library**: (e.g., Shadcn/ui - based on `resources/js/components/ui/`)
*   **Tailwind CSS**: Utility-first CSS framework.

This overview provides a foundational understanding of the Admin Analytics Dashboard. For more detailed information, refer to the specific documentation sections for API, Frontend Components, User Guide, Developer Guide, and System Integration.