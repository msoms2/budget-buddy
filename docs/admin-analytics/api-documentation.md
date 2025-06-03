# Admin Analytics API Documentation

This document provides detailed information about the backend API endpoints for the Admin Analytics Dashboard.

## Base URL

All API endpoints are prefixed with `/api`. (Assuming API routes are in `routes/api.php` and may or may not have an additional `/v1` or similar versioning prefix. This will need to be confirmed by checking the route definitions).

## Authentication

All admin analytics API endpoints require administrator authentication. Requests must include a valid session cookie or an API token (if applicable) for an authenticated admin user. Unauthorized requests will receive a `401 Unauthorized` or `403 Forbidden` response.

---

## 1. Categories Analytics

### `GET /admin/analytics/categories`

Retrieves analytics data related to categories, such as spending or earnings per category.

**Description:**
This endpoint provides aggregated data for transaction categories over a specified period. It can be used to understand distribution across different categories, identify top categories, and track trends.

**Request Parameters:**

| Parameter   | Type   | Optional | Description                                                                 | Example                 |
| :---------- | :----- | :------- | :-------------------------------------------------------------------------- | :---------------------- |
| `startDate` | string | Yes      | The start date for the analytics period (YYYY-MM-DD). Defaults to 30 days ago. | `2024-01-01`            |
| `endDate`   | string | Yes      | The end date for the analytics period (YYYY-MM-DD). Defaults to today.       | `2024-01-31`            |
| `type`      | string | Yes      | Filter by transaction type (`expense` or `income`). Defaults to all.        | `expense`               |
| `limit`     | int    | Yes      | Number of top categories to return. Defaults to all.                        | `10`                    |

**Example Request:**

```http
GET /api/admin/analytics/categories?startDate=2024-06-01&endDate=2024-06-30&type=expense
Accept: application/json
Authorization: Bearer <admin_auth_token> // Or via session cookie
```

**Successful Response (200 OK):**

```json
{
  "data": [
    {
      "category_id": 1,
      "category_name": "Food & Dining",
      "total_amount": 1250.75,
      "transaction_count": 45,
      "percentage_of_total": 35.2
    },
    {
      "category_id": 3,
      "category_name": "Transportation",
      "total_amount": 800.50,
      "transaction_count": 30,
      "percentage_of_total": 22.5
    },
    {
      "category_id": 5,
      "category_name": "Utilities",
      "total_amount": 650.00,
      "transaction_count": 15,
      "percentage_of_total": 18.3
    }
    // ... other categories
  ],
  "summary": {
    "total_categories": 15,
    "total_amount_all_categories": 3550.90,
    "period_start_date": "2024-06-01",
    "period_end_date": "2024-06-30",
    "filter_type": "expense"
  }
}
```

**Data Structure:**

*   `data`: An array of category analytics objects.
    *   `category_id`: (integer) The unique identifier for the category.
    *   `category_name`: (string) The name of the category.
    *   `total_amount`: (float) The total sum of transactions for this category within the period.
    *   `transaction_count`: (integer) The number of transactions in this category.
    *   `percentage_of_total`: (float) The percentage this category's amount represents of the total amount across all categories for the period.
*   `summary`: An object containing summary information.
    *   `total_categories`: (integer) Total number of categories with transactions in the period.
    *   `total_amount_all_categories`: (float) Total amount for all categories in the period.
    *   `period_start_date`: (string) The start date used for the query.
    *   `period_end_date`: (string) The end date used for the query.
    *   `filter_type`: (string|null) The type filter applied (`expense`, `income`, or `null` if none).

**Error Responses:**

*   **400 Bad Request:** If request parameters are invalid (e.g., invalid date format).
    ```json
    {
      "message": "Invalid date format for startDate. Please use YYYY-MM-DD.",
      "errors": {
        "startDate": ["The startDate does not match the format Y-m-d."]
      }
    }
    ```
*   **401 Unauthorized:** If the user is not authenticated.
    ```json
    {
      "message": "Unauthenticated."
    }
    ```
*   **403 Forbidden:** If the authenticated user is not an administrator.
    ```json
    {
      "message": "This action is unauthorized."
## 2. Budgets Analytics

### `GET /admin/analytics/budgets`

Retrieves analytics data related to user budgets, such as budget utilization, overspending, and underspending.

**Description:**
This endpoint provides insights into how users are managing their budgets. It can show aggregated data on budget adherence, common areas of over/under spending, and overall budget performance across all users or specific segments.

**Request Parameters:**

| Parameter     | Type   | Optional | Description                                                                    | Example                 |
| :------------ | :----- | :------- | :----------------------------------------------------------------------------- | :---------------------- |
| `startDate`   | string | Yes      | The start date for the budget period (YYYY-MM-DD). Defaults to current month.  | `2024-06-01`            |
| `endDate`     | string | Yes      | The end date for the budget period (YYYY-MM-DD). Defaults to end of current month. | `2024-06-30`            |
| `status`      | string | Yes      | Filter by budget status (e.g., `active`, `exceeded`, `underutilized`).        | `exceeded`              |
| `userId`      | int    | Yes      | Filter analytics by a specific user ID.                                        | `123`                   |
| `categoryId`  | int    | Yes      | Filter budget analytics by a specific category ID.                             | `5`                     |

**Example Request:**

```http
GET /api/admin/analytics/budgets?startDate=2024-06-01&endDate=2024-06-30&status=exceeded
Accept: application/json
Authorization: Bearer <admin_auth_token> // Or via session cookie
```

**Successful Response (200 OK):**

```json
{
  "data": [
    {
      "budget_id": 101,
      "user_id": 45,
      "user_name": "Admin User A",
      "category_id": 1,
      "category_name": "Food & Dining",
      "budgeted_amount": 500.00,
      "spent_amount": 650.50,
      "variance": -150.50,
      "utilization_percentage": 130.1,
      "status": "exceeded"
    },
    {
      "budget_id": 102,
      "user_id": 78,
      "user_name": "Admin User B",
      "category_id": 3,
      "category_name": "Transportation",
      "budgeted_amount": 200.00,
      "spent_amount": 150.00,
      "variance": 50.00,
      "utilization_percentage": 75.0,
      "status": "underutilized"
    }
    // ... other budget analytics
  ],
  "summary": {
    "total_budgets_analyzed": 50,
    "total_budgeted_amount": 25000.00,
    "total_spent_amount": 23500.00,
    "overall_variance": 1500.00,
    "average_utilization": 94.0,
    "budgets_exceeded_count": 5,
    "budgets_underutilized_count": 12,
    "period_start_date": "2024-06-01",
    "period_end_date": "2024-06-30"
  }
}
```

**Data Structure:**

*   `data`: An array of budget analytics objects.
    *   `budget_id`: (integer) The unique identifier for the budget entry.
    *   `user_id`: (integer, optional) The ID of the user this budget belongs to (if not aggregated).
    *   `user_name`: (string, optional) The name of the user.
    *   `category_id`: (integer, optional) The ID of the category this budget applies to.
    *   `category_name`: (string, optional) The name of the category.
    *   `budgeted_amount`: (float) The allocated amount for the budget.
    *   `spent_amount`: (float) The actual amount spent against this budget.
    *   `variance`: (float) The difference between budgeted and spent amounts (`budgeted_amount - spent_amount`). Positive means underspent, negative means overspent.
    *   `utilization_percentage`: (float) The percentage of the budget that has been spent (`(spent_amount / budgeted_amount) * 100`).
    *   `status`: (string) A status indicator (e.g., `on_track`, `exceeded`, `underutilized`).
*   `summary`: An object containing summary information for the queried budgets.
    *   `total_budgets_analyzed`: (integer) Total number of budget records included in the analytics.
    *   `total_budgeted_amount`: (float) Sum of all budgeted amounts.
    *   `total_spent_amount`: (float) Sum of all spent amounts.
    *   `overall_variance`: (float) Total variance across all analyzed budgets.
    *   `average_utilization`: (float) Average utilization percentage.
    *   `budgets_exceeded_count`: (integer) Number of budgets where spending exceeded the allocated amount.
    *   `budgets_underutilized_count`: (integer) Number of budgets significantly underspent.
    *   `period_start_date`: (string) The start date used for the query.
    *   `period_end_date`: (string) The end date used for the query.

**Error Responses:**

*   **400 Bad Request:** If request parameters are invalid.
*   **401 Unauthorized:** If the user is not authenticated.
*   **403 Forbidden:** If the authenticated user is not an administrator.

---
    }
    ```

---
*(Further endpoints will be documented below)*
## 3. Goals Analytics

### `GET /admin/analytics/goals`

Retrieves analytics data related to user goals, such as goal completion rates, progress, and common goal types.

**Description:**
This endpoint offers insights into user-defined financial goals. It can track progress towards goals, identify popular goal categories, average time to completion, and success rates. This data can help understand user aspirations and engagement with goal-setting features.

**Request Parameters:**

| Parameter   | Type   | Optional | Description                                                                    | Example                 |
| :---------- | :----- | :------- | :----------------------------------------------------------------------------- | :---------------------- |
| `startDate` | string | Yes      | The start date for filtering goals created or updated (YYYY-MM-DD).            | `2024-01-01`            |
| `endDate`   | string | Yes      | The end date for filtering goals (YYYY-MM-DD).                                 | `2024-06-30`            |
| `status`    | string | Yes      | Filter by goal status (e.g., `in_progress`, `completed`, `abandoned`).         | `completed`             |
| `userId`    | int    | Yes      | Filter analytics by a specific user ID.                                        | `123`                   |
| `goalType`  | string | Yes      | Filter by type of goal (e.g., `savings`, `debt_repayment`, `investment`).      | `savings`               |

**Example Request:**

```http
GET /api/admin/analytics/goals?status=completed&goalType=savings
Accept: application/json
Authorization: Bearer <admin_auth_token> // Or via session cookie
```

**Successful Response (200 OK):**

```json
{
  "data": [
    {
      "goal_id": 201,
      "user_id": 55,
      "user_name": "Admin User C",
      "goal_name": "Emergency Fund",
      "goal_type": "savings",
      "target_amount": 5000.00,
      "current_amount": 5000.00,
      "progress_percentage": 100.0,
      "status": "completed",
      "start_date": "2023-01-15",
      "target_date": "2024-01-15",
      "completion_date": "2023-12-20"
    },
    {
      "goal_id": 202,
      "user_id": 67,
      "user_name": "Admin User D",
      "goal_name": "Vacation to Bali",
      "goal_type": "savings",
      "target_amount": 3000.00,
      "current_amount": 1500.00,
      "progress_percentage": 50.0,
      "status": "in_progress",
      "start_date": "2023-06-01",
      "target_date": "2024-12-01",
      "completion_date": null
    }
    // ... other goal analytics
  ],
  "summary": {
    "total_goals_analyzed": 75,
    "goals_in_progress": 40,
    "goals_completed": 25,
    "goals_abandoned": 10,
    "average_progress_all": 65.5, // Average progress for in-progress goals
    "average_target_amount": 4500.00,
    "most_common_type": "savings",
    "completion_rate": 71.4 // (completed / (completed + abandoned)) for goals with an end status
  }
}
```

**Data Structure:**

*   `data`: An array of goal analytics objects.
    *   `goal_id`: (integer) The unique identifier for the goal.
    *   `user_id`: (integer, optional) The ID of the user this goal belongs to.
    *   `user_name`: (string, optional) The name of the user.
    *   `goal_name`: (string) The name or description of the goal.
    *   `goal_type`: (string) The category or type of the goal.
    *   `target_amount`: (float) The target financial amount for the goal.
    *   `current_amount`: (float) The currently saved or achieved amount for the goal.
    *   `progress_percentage`: (float) Percentage of the goal achieved.
    *   `status`: (string) Current status of the goal (e.g., `in_progress`, `completed`, `on_hold`, `abandoned`).
    *   `start_date`: (string) The date the goal was started (YYYY-MM-DD).
    *   `target_date`: (string) The intended completion date for the goal (YYYY-MM-DD).
    *   `completion_date`: (string|null) The actual date the goal was completed (YYYY-MM-DD), or null.
*   `summary`: An object containing summary information for the queried goals.
    *   `total_goals_analyzed`: (integer) Total number of goals included.
    *   `goals_in_progress`: (integer) Count of goals currently in progress.
    *   `goals_completed`: (integer) Count of completed goals.
    *   `goals_abandoned`: (integer) Count of goals marked as abandoned.
    *   `average_progress_all`: (float) Average progress percentage across active goals.
    *   `average_target_amount`: (float) Average target amount for goals.
    *   `most_common_type`: (string) The most frequent type of goal.
    *   `completion_rate`: (float) Percentage of goals (excluding in-progress) that were completed.

**Error Responses:**

*   **400 Bad Request:** If request parameters are invalid.
*   **401 Unauthorized:** If the user is not authenticated.
*   **403 Forbidden:** If the authenticated user is not an administrator.

---
## 4. Debts Analytics

### `GET /admin/analytics/debts`

Retrieves analytics data related to user debts, such as total outstanding debt, average interest rates, and debt types.

**Description:**
This endpoint provides an overview of user-managed debts. It can be used to analyze the overall debt landscape, identify common types of debt (e.g., credit card, loans), track average interest rates, and monitor total outstanding balances.

**Request Parameters:**

| Parameter   | Type   | Optional | Description                                                                 | Example                 |
| :---------- | :----- | :------- | :-------------------------------------------------------------------------- | :---------------------- |
| `debtType`  | string | Yes      | Filter by type of debt (e.g., `loan`, `credit_card`, `mortgage`).           | `credit_card`           |
| `minAmount` | float  | Yes      | Filter for debts with an outstanding amount greater than or equal to this.  | `1000`                  |
| `maxAmount` | float  | Yes      | Filter for debts with an outstanding amount less than or equal to this.     | `50000`                 |
| `userId`    | int    | Yes      | Filter analytics by a specific user ID.                                     | `123`                   |
| `creditorId`| int    | Yes      | Filter analytics by a specific creditor ID, using [`Creditor.php`](app/Models/Creditor.php:1). | `7`                     |


**Example Request:**

```http
GET /api/admin/analytics/debts?debtType=loan&minAmount=5000
Accept: application/json
Authorization: Bearer <admin_auth_token> // Or via session cookie
```

**Successful Response (200 OK):**

```json
{
  "data": [
    {
      "debt_id": 301,
      "user_id": 88,
      "user_name": "Admin User E",
      "debt_name": "Student Loan",
      "debt_type": "loan",
      "creditor_name": "National Education Lenders",
      "original_amount": 25000.00,
      "outstanding_amount": 18500.75,
      "interest_rate": 4.5,
      "minimum_payment": 250.00,
      "due_date": "2024-07-15"
    },
    {
      "debt_id": 302,
      "user_id": 92,
      "user_name": "Admin User F",
      "debt_name": "Visa Card",
      "debt_type": "credit_card",
      "creditor_name": "City Bank",
      "original_amount": 5000.00,
      "outstanding_amount": 4800.00,
      "interest_rate": 19.9,
      "minimum_payment": 100.00,
      "due_date": "2024-07-01"
    }
    // ... other debt analytics
  ],
  "summary": {
    "total_debts_analyzed": 45,
    "total_outstanding_debt": 350000.00,
    "average_outstanding_debt": 7777.78,
    "average_interest_rate": 8.2,
    "most_common_debt_type": "credit_card",
    "total_minimum_payments_due": 15200.00
  }
}
```

**Data Structure:**

*   `data`: An array of debt analytics objects.
    *   `debt_id`: (integer) The unique identifier for the debt record.
    *   `user_id`: (integer, optional) The ID of the user this debt belongs to.
    *   `user_name`: (string, optional) The name of the user.
    *   `debt_name`: (string) The name or description of the debt.
    *   `debt_type`: (string) The category or type of the debt.
    *   `creditor_name`: (string) The name of the creditor.
    *   `original_amount`: (float) The initial amount of the debt.
    *   `outstanding_amount`: (float) The current outstanding balance.
    *   `interest_rate`: (float) The annual interest rate for the debt.
    *   `minimum_payment`: (float) The minimum monthly payment required.
    *   `due_date`: (string) The next payment due date (YYYY-MM-DD).
*   `summary`: An object containing summary information for the queried debts.
    *   `total_debts_analyzed`: (integer) Total number of debt records included.
    *   `total_outstanding_debt`: (float) Sum of all outstanding debt amounts.
    *   `average_outstanding_debt`: (float) Average outstanding debt amount per record.
    *   `average_interest_rate`: (float) Average interest rate across all debts.
    *   `most_common_debt_type`: (string) The most frequent type of debt.
    *   `total_minimum_payments_due`: (float) Sum of all minimum payments due for the current cycle.

**Error Responses:**

*   **400 Bad Request:** If request parameters are invalid.
*   **401 Unauthorized:** If the user is not authenticated.
*   **403 Forbidden:** If the authenticated user is not an administrator.

---
## 5. Investments Analytics

### `GET /admin/analytics/investments`

Retrieves analytics data related to user investments, such as total investment value, asset allocation, and performance.

**Description:**
This endpoint provides insights into users' investment portfolios. It can show aggregated data on total value, distribution across different asset classes (e.g., stocks, bonds, crypto), overall portfolio performance, and popular investment types. This helps in understanding user investment behaviors and trends. Data is sourced from models like [`Investment.php`](app/Models/Investment.php:1) and potentially categorized using [`InvestmentCategory.php`](app/Models/InvestmentCategory.php:1).

**Request Parameters:**

| Parameter        | Type   | Optional | Description                                                                 | Example                 |
| :--------------- | :----- | :------- | :-------------------------------------------------------------------------- | :---------------------- |
| `assetType`      | string | Yes      | Filter by type of investment asset (e.g., `stocks`, `bonds`, `real_estate`, `crypto`). | `stocks`                |
| `minReturn`      | float  | Yes      | Filter for investments with a return percentage greater than or equal to this. | `5.0`                   |
| `maxRiskLevel`   | string | Yes      | Filter by a maximum risk level (e.g., `low`, `medium`, `high`).             | `medium`                |
| `userId`         | int    | Yes      | Filter analytics by a specific user ID.                                     | `123`                   |
| `dateRangePreset`| string | Yes      | Predefined date ranges (e.g., `ytd`, `last_quarter`, `last_year`).         | `ytd`                   |
| `startDate`      | string | Yes      | Custom start date for performance period (YYYY-MM-DD). Overrides preset.    | `2023-01-01`            |
| `endDate`        | string | Yes      | Custom end date for performance period (YYYY-MM-DD). Overrides preset.        | `2023-12-31`            |


**Example Request:**

```http
GET /api/admin/analytics/investments?assetType=crypto&minReturn=10
Accept: application/json
Authorization: Bearer <admin_auth_token> // Or via session cookie
```

**Successful Response (200 OK):**

```json
{
  "data": [
    {
      "investment_id": 401,
      "user_id": 101,
      "user_name": "Admin Investor G",
      "investment_name": "Tech Growth Portfolio",
      "asset_type": "stocks",
      "current_value": 75000.00,
      "initial_investment": 50000.00,
      "return_on_investment": 25000.00,
      "return_percentage": 50.0,
      "risk_level": "medium",
      "last_updated": "2024-06-28T10:00:00Z"
    },
    {
      "investment_id": 402,
      "user_id": 102,
      "user_name": "Admin Investor H",
      "investment_name": "Bitcoin Holdings",
      "asset_type": "crypto",
      "current_value": 15000.00,
      "initial_investment": 10000.00,
      "return_on_investment": 5000.00,
      "return_percentage": 50.0,
      "risk_level": "high",
      "last_updated": "2024-06-29T11:30:00Z"
    }
    // ... other investment analytics
  ],
  "summary": {
    "total_investments_analyzed": 60,
    "total_current_value": 1250000.00,
    "total_initial_investment": 900000.00,
    "overall_return_on_investment": 350000.00,
    "average_return_percentage": 25.5,
    "most_common_asset_type": "stocks",
    "asset_allocation": {
      "stocks": 45.0, // percentage
      "bonds": 25.0,
      "crypto": 15.0,
      "real_estate": 10.0,
      "other": 5.0
    },
    "performance_period": {
        "start_date": "2023-01-01",
        "end_date": "2023-12-31"
    }
  }
}
```

**Data Structure:**

*   `data`: An array of investment analytics objects.
    *   `investment_id`: (integer) The unique identifier for the investment.
    *   `user_id`: (integer, optional) The ID of the user this investment belongs to.
    *   `user_name`: (string, optional) The name of the user.
    *   `investment_name`: (string) The name or description of the investment.
    *   `asset_type`: (string) The type of asset (e.g., `stocks`, `bonds`, `crypto`).
    *   `current_value`: (float) The current market value of the investment.
    *   `initial_investment`: (float) The initial amount invested.
    *   `return_on_investment`: (float) The profit or loss from the investment (`current_value - initial_investment`).
    *   `return_percentage`: (float) The return as a percentage of the initial investment.
    *   `risk_level`: (string) Assessed risk level (e.g., `low`, `medium`, `high`).
    *   `last_updated`: (timestamp) When the investment data was last updated.
*   `summary`: An object containing summary information for the queried investments.
    *   `total_investments_analyzed`: (integer) Total number of investment records included.
    *   `total_current_value`: (float) Sum of all current investment values.
    *   `total_initial_investment`: (float) Sum of all initial investments.
    *   `overall_return_on_investment`: (float) Total profit/loss across all analyzed investments.
    *   `average_return_percentage`: (float) Average return percentage.
    *   `most_common_asset_type`: (string) The most frequent type of asset.
    *   `asset_allocation`: (object) Breakdown of total investment value by asset type percentages.
    *   `performance_period`: (object) The date range for which performance metrics are calculated.
        *   `start_date`: (string) YYYY-MM-DD
        *   `end_date`: (string) YYYY-MM-DD

**Error Responses:**

*   **400 Bad Request:** If request parameters are invalid.
*   **401 Unauthorized:** If the user is not authenticated.
*   **403 Forbidden:** If the authenticated user is not an administrator.

---