# Currency Handling Guidelines

## Overview

This document outlines best practices for handling currencies within the Budget Buddy application. Proper currency handling ensures that users see consistent formatting across the application and that all amounts are correctly converted when a user changes their currency preference.

## Best Practices

### 1. Use the `useCurrency` Hook

Always use the `useCurrency` hook for currency-related operations:

```jsx
import { useCurrency } from '@/hooks/useCurrency.jsx';

function MyComponent() {
  const { formatCurrency, currency, convertAmount } = useCurrency();
  
  return (
    <div>
      <p>Amount: {formatCurrency(100.50)}</p>
    </div>
  );
}
```

### 2. Avoid Hardcoded Currency Symbols

Never hardcode currency symbols like `$` or `€` in your components. Instead, use the `formatCurrency` function from the `useCurrency` hook:

```jsx
// ❌ Bad
<p>Total: ${amount}</p>

// ✅ Good
<p>Total: {formatCurrency(amount)}</p>
```

### 3. Converting Between Currencies

When you need to convert amounts between currencies, use the `convertAmount` function from the `useCurrency` hook:

```jsx
const { convertAmount } = useCurrency();

// Convert 100 from currency ID 1 to currency ID 2
const convertedAmount = await convertAmount(100, 1, 2);
```

### 4. Accessing Current Currency

If you need information about the user's current currency:

```jsx
const { currency } = useCurrency();

console.log(currency.code);   // e.g., "USD"
console.log(currency.symbol); // e.g., "$"
```

### 5. Currency Updates

When a user changes their currency, all components using the `useCurrency` hook will automatically update to display the new currency format.

## Technical Implementation

- The `CurrencyContext` provides currency information to all components
- The `updateUserCurrency` function handles backend API calls to update a user's currency preference
- The backend automatically converts all existing financial data to the new currency
- The frontend automatically updates all displayed amounts with the new currency symbol
- The system supports any currency pair, including cryptocurrencies with large exchange rates

For more information about cryptocurrency support, please see [Cryptocurrency Support](./cryptocurrency-support.md).

## Utility Functions

Be aware that there are two currency formatting functions in the application:

1. `formatCurrency` from the `useCurrency` hook - This uses the user's current preferred currency
2. `formatCurrency` from `@/lib/utils.js` - This uses a specified currency code

Always prefer the version from the `useCurrency` hook for user-facing components.
