# API Endpoints Structure

## Authentication Requirements
All API routes are protected by web session authentication with shared session state. CSRF protection is enabled.

## Core Endpoints

### User Information
```
GET /api/user
Response: Current authenticated user details
```

### Categories
```
GET    /api/categories/{category}/subcategories
GET    /api/categories/expense/{category}/subcategories
GET    /api/categories/earning/{category}/subcategories
```

### Transactions
```
# Expenses
GET    /api/expenses
POST   /api/expenses
GET    /api/expenses/{id}
PUT    /api/expenses/{id}
DELETE /api/expenses/{id}

# Earnings
GET    /api/earnings
POST   /api/earnings
GET    /api/earnings/{id}
PUT    /api/earnings/{id}
DELETE /api/earnings/{id}
```

## Analysis & Reporting

### Income Analysis
```
GET /api/income-analysis/
GET /api/income-analysis/diversity
GET /api/income-analysis/stability
GET /api/income-analysis/frequency
GET /api/income-analysis/forecast
```

### Reports
```
GET /api/reports/budget-analysis
GET /api/reports/tag-analysis
GET /api/reports/payment-method-analysis
GET /api/reports/comparison
GET /api/reports/forecast
GET /api/reports/subcategory-analysis
```

## Financial Management

### Creditors
```
GET    /api/creditors
POST   /api/creditors
GET    /api/creditors/{creditor}
PUT    /api/creditors/{creditor}
DELETE /api/creditors/{creditor}
POST   /api/creditors/{creditor}/calculate-interest
GET    /api/creditors/compare-strategies
```

### Investments
```
# Investment Management
GET    /api/investments
POST   /api/investments
GET    /api/investments/{investment}
PUT    /api/investments/{investment}
DELETE /api/investments/{investment}
GET    /api/investments/categories

# Investment Transactions
GET    /api/investments/{investment}/transactions
POST   /api/investments/{investment}/transactions
PUT    /api/investments/{investment}/transactions/{transaction}
DELETE /api/investments/{investment}/transactions/{transaction}

# Performance Tracking
GET    /api/investments/{investment}/performance
POST   /api/investments/{investment}/performance
GET    /api/investments/{investment}/performance/history
```

### Currency Management
```
GET    /api/currencies
POST   /api/currencies
PUT    /api/currencies/{currency}
DELETE /api/currencies/{currency}
POST   /api/currencies/convert
GET    /api/currencies/available
POST   /api/currencies/update-rates
```

## Goal Management
```
GET /api/goals/{goal}/calculate-savings
GET /api/goals/{goal}/progress
```

## Payment Scheduling
```
GET    /api/payment-schedules
POST   /api/payment-schedules
GET    /api/payment-schedules/{paymentSchedule}
PUT    /api/payment-schedules/{paymentSchedule}
DELETE /api/payment-schedules/{paymentSchedule}
POST   /api/payment-schedules/{paymentSchedule}/process
POST   /api/payment-schedules/{paymentSchedule}/cancel
GET    /api/payment-schedules/category/{categoryId}/subcategories
```

## Notification System
```
GET    /api/notifications
POST   /api/notifications/{notification}/read
POST   /api/notifications/mark-all-read
GET    /api/notifications/settings
PUT    /api/notifications/settings/{type}
```

## Response Formats

### Success Response
```json
{
    "data": {
        // Requested data
    },
    "meta": {
        "pagination": {
            "total": 100,
            "per_page": 15,
            "current_page": 1,
            "last_page": 7
        }
    }
}
```

### Error Response
```json
{
    "error": {
        "message": "Error description",
        "code": "ERROR_CODE",
        "details": {
            // Additional error details
        }
    }
}
```

## API Features

### Pagination
- Supported on list endpoints
- Configurable page size
- Includes metadata for total records

### Filtering
- Category-based filtering
- Date range filtering
- Status filtering
- Search functionality

### Sorting
- Multiple field sorting
- Ascending/descending order
- Default sort options

### Data Validation
- Input validation on all POST/PUT requests
- Type checking
- Required field validation
- Custom validation rules

### Rate Limiting
- API rate limiting per user
- Throttling on sensitive endpoints
- Custom limits for specific routes

### Caching
- Response caching where appropriate
- ETags support
- Cache invalidation on updates

## Security Measures

1. **Authentication**
   - Session-based authentication
   - CSRF token validation
   - Rate limiting

2. **Authorization**
   - Role-based access control
   - Resource ownership validation
   - Permission checking

3. **Data Validation**
   - Input sanitization
   - Type validation
   - Business rule validation

4. **Error Handling**
   - Consistent error formats
   - Detailed error messages in development
   - Sanitized errors in production