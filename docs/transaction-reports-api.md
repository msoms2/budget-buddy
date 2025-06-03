# Transaction Reports API Documentation

## Overview

The transaction reports functionality provides a backend API endpoint for generating transaction reports with PDF export capabilities. This includes filtering by date range, transaction type, and categories, along with comprehensive summary calculations.

## Endpoint

### GET /reports/transactions

Generate a transaction report with optional PDF export.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_date` | string (date) | Yes | Start date for the report (YYYY-MM-DD format) |
| `end_date` | string (date) | Yes | End date for the report (YYYY-MM-DD format) |
| `transaction_type` | string | No | Filter by transaction type: `income`, `expense`, or `all` (default: `all`) |
| `categories` | array | No | Array of expense category IDs to filter by |
| `income_categories` | array | No | Array of income category IDs to filter by |
| `format` | string | No | Response format: `pdf` for PDF download (default: JSON) |

#### Example Requests

##### JSON Response
```
GET /reports/transactions?start_date=2024-01-01&end_date=2024-01-31&transaction_type=all
```

##### PDF Download
```
GET /reports/transactions?start_date=2024-01-01&end_date=2024-01-31&format=pdf
```

##### Filtered by Categories
```
GET /reports/transactions?start_date=2024-01-01&end_date=2024-01-31&categories[]=1&categories[]=2&income_categories[]=3
```

#### JSON Response Format

```json
{
  "transactions": [
    {
      "id": 1,
      "date": "01.01.2024",
      "date_sort": "2024-01-01",
      "description": "Grocery Shopping",
      "category": "Food & Dining",
      "amount": 45.50,
      "type": "Expense",
      "type_key": "expense"
    },
    {
      "id": 2,
      "date": "02.01.2024",
      "date_sort": "2024-01-02",
      "description": "Salary Payment",
      "category": "Employment",
      "amount": 2500.00,
      "type": "Income",
      "type_key": "income"
    }
  ],
  "summary": {
    "total_income": 2500.00,
    "total_expenses": 45.50,
    "balance": 2454.50,
    "transaction_count": 2,
    "income_count": 1,
    "expense_count": 1
  },
  "filters": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "transaction_type": "all",
    "categories": [],
    "income_categories": []
  }
}
```

#### PDF Response

When `format=pdf` is specified, the endpoint returns a PDF file download with the filename format:
```
Transakciju_parskats_DDMMYYYY_DDMMYYYY.pdf
```

For example: `Transakciju_parskats_01012024_31012024.pdf`

## PDF Report Structure

The generated PDF includes:

1. **Document Title**: "Transakciju pārskats" (Transaction Report)
2. **Period Information**: Date range from start_date to end_date
3. **Selection Criteria**: Applied filters (if any)
4. **Transaction Table**: 
   - Date (dd.mm.yyyy format)
   - Description/Name
   - Category
   - Amount (with EUR currency)
   - Transaction Type (Income/Expense)
5. **Summary Section**:
   - Total Income
   - Total Expenses
   - Balance
   - Generation Date

## Authentication

All requests require user authentication. The API will only return transactions belonging to the authenticated user.

## Error Handling

The API validates input parameters and returns appropriate error responses:

- `422 Unprocessable Entity`: Invalid input parameters
- `401 Unauthorized`: User not authenticated
- `500 Internal Server Error`: Server-side errors

## Implementation Details

### Backend Components

1. **Route**: Added to `routes/web.php` under the reports group
2. **Controller**: `ReportController@transactions` method
3. **View**: `resources/views/reports/transactions-pdf.blade.php` for PDF generation
4. **PDF Engine**: Uses DOMPDF via `barryvdh/laravel-dompdf` package

### Data Models

The implementation uses the existing Laravel Eloquent models:
- `App\Models\Earning` - for income transactions
- `App\Models\Expense` - for expense transactions
- `App\Models\EarningCategory` - for income categories
- `App\Models\ExpenseCategory` - for expense categories

### Security Features

- User-scoped data access (only user's own transactions)
- Input validation for all parameters
- SQL injection protection via Eloquent ORM
- XSS protection in PDF generation

## Usage Examples

### Frontend Integration

```javascript
// Fetch transaction data as JSON
fetch('/reports/transactions?start_date=2024-01-01&end_date=2024-01-31', {
    headers: {
        'Accept': 'application/json',
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
    }
})
.then(response => response.json())
.then(data => {
    console.log('Transactions:', data.transactions);
    console.log('Summary:', data.summary);
});

// Download PDF report
window.location.href = '/reports/transactions?start_date=2024-01-01&end_date=2024-01-31&format=pdf';
```

### cURL Examples

```bash
# Get JSON data
curl -H "Accept: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     "https://your-domain.com/reports/transactions?start_date=2024-01-01&end_date=2024-01-31"

# Download PDF
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://your-domain.com/reports/transactions?start_date=2024-01-01&end_date=2024-01-31&format=pdf" \
     -o transaction_report.pdf
```

## Future Enhancements

Potential improvements for future development:

1. **Additional Filters**: Payment methods, tags, amount ranges
2. **Export Formats**: Excel, CSV export options
3. **Scheduled Reports**: Automatic report generation and email delivery
4. **Chart Integration**: Visual charts in PDF reports
5. **Report Templates**: Customizable PDF layouts
6. **Bulk Operations**: Multiple date ranges in single request

## Testing

The backend API is ready for integration and testing. Ensure that:

1. User authentication is properly implemented
2. Test data exists in the database
3. DOMPDF package is properly configured
4. Storage permissions are set correctly for PDF generation

## Support

For technical issues or questions about the transaction reports API, please refer to the main application documentation or contact the development team.