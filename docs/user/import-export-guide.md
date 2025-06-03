# Import/Export Data Format Guide

## Overview

Budget Buddy supports importing and exporting financial data in CSV and Excel (XLSX) formats. The system has been designed to ensure that exported data can be easily re-imported without format issues.

## Standard Column Format

All imports and exports use the following standardized column format:

| Column | Description |
|--------|-------------|
| `type` | Type of transaction: "expense" or "earning" |
| `name` | Name/title of the transaction |
| `amount` | Numeric amount of the transaction |
| `date` | Date in YYYY-MM-DD format |
| `category` | Category name |
| `description` | Optional description/notes |
| `payment_method` | Payment method name |
| `currency` | Currency code (e.g., USD, EUR) |

## Import Features

- **Auto-detection**: The system can automatically detect whether a file contains expenses, earnings, or mixed transactions
- **Format flexibility**: Headers are case-insensitive
- **Smart mapping**: The importer will try to map similar column names (e.g., "Payment Method" will map to "payment_method")
- **Error handling**: Failed imports are logged with detailed error messages

## Export Options

When exporting data, you can choose:

1. **Expenses only**: Export only expense transactions
2. **Earnings only**: Export only earning transactions
3. **All transactions**: Export both expenses and earnings with transaction type

## Best Practices

- Always include the `type` column when creating custom import files
- Use consistent date formats (YYYY-MM-DD recommended)
- When importing custom files, ensure column headers match the standard format
- For bulk imports, consider breaking large files into smaller batches

## Technical Details

The system uses the Maatwebsite/Laravel-Excel package to handle imports/exports with custom mapping for data consistency. All imports are processed as background jobs to prevent timeout issues with large datasets.
