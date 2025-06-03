# Currency Settings Popup - Full Implementation Guide

## Overview

The Currency Settings Popup is a comprehensive system that allows users to manage which currencies are displayed throughout the Budget Buddy application. This implementation provides a streamlined interface for adding and removing currencies with real-time persistence.

## Features Implemented

### ✅ Core Features
- **Display Selected Currencies**: Shows all currently selected currencies with details and symbols
- **Add New Currencies**: Browse and add from all available currencies with search functionality
- **Smart Filtering**: Already selected currencies don't appear in the add list
- **Remove Currencies**: Remove currencies with validation (must keep at least one)
- **Real-time Updates**: Changes are immediately saved and reflected across the application
- **Search Functionality**: Quickly find currencies when adding new ones
- **Responsive Design**: Works perfectly on all screen sizes

### ✅ Technical Features
- **API Integration**: Full backend integration with Laravel endpoints
- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Smooth loading indicators during API calls
- **Validation**: Prevents removing all currencies (minimum 1 required)
- **Toast Notifications**: User-friendly success and error messages

## File Structure

```
resources/js/
├── components/
│   ├── CurrencySettingsPopup.jsx       # Main popup component
│   └── DisplayedCurrencySettings.jsx   # Advanced settings component
├── hooks/
│   └── useCurrencySettingsPopup.jsx    # State management hook
└── Pages/Settings/
    ├── Currency.jsx                    # Main currency settings page
    └── Index.jsx                       # Settings navigation
```

## API Endpoints

The system uses the following Laravel API endpoints:

```php
// Get all currencies and user settings
GET /api/currencies

// Get available currencies from external source
GET /api/currencies/available

// Update user's displayed currencies
POST /api/currencies/display-settings
```

## Usage Examples

### Basic Integration

```jsx
import { useCurrencySettingsPopup } from '@/hooks/useCurrencySettingsPopup';

function MyComponent() {
    const { openPopup, popup } = useCurrencySettingsPopup();
    
    return (
        <>
            <button onClick={openPopup}>
                Manage Currencies
            </button>
            {popup}
        </>
    );
}
```

### Advanced Integration with Callback

```jsx
import { useCurrencySettingsPopup } from '@/hooks/useCurrencySettingsPopup';

function MyComponent() {
    const [currencies, setCurrencies] = useState([]);
    
    const refreshCurrencies = async () => {
        // Fetch updated currency data
        const response = await fetch('/api/currencies');
        const data = await response.json();
        setCurrencies(data.user.displayed_currencies);
    };
    
    const { openPopup, popup } = useCurrencySettingsPopup({
        onUpdate: refreshCurrencies
    });
    
    return (
        <>
            <button onClick={openPopup}>
                Manage Currencies ({currencies.length})
            </button>
            {popup}
        </>
    );
}
```

## Component API

### useCurrencySettingsPopup Hook

```typescript
interface UseCurrencySettingsPopupOptions {
    onUpdate?: () => void; // Called when currencies are updated
}

interface UseCurrencySettingsPopupReturn {
    isOpen: boolean;           // Current popup state
    openPopup: () => void;     // Function to open popup
    closePopup: () => void;    // Function to close popup
    popup: JSX.Element;        // Popup component to render
}

function useCurrencySettingsPopup(
    options?: UseCurrencySettingsPopupOptions
): UseCurrencySettingsPopupReturn
```

### CurrencySettingsPopup Component

```typescript
interface CurrencySettingsPopupProps {
    isOpen: boolean;                    // Controls popup visibility
    onClose: () => void;               // Called when popup closes
}
```

## Backend Integration

### Database Schema

The system uses the `displayed_currencies` column in the users table:

```php
// Migration
$table->json('displayed_currencies')->nullable();

// Model (User.php)
protected $casts = [
    'displayed_currencies' => 'array',
];
```

### Controller Method

```php
// CurrencyController.php
public function updateDisplaySettings(Request $request)
{
    $validated = $request->validate([
        'displayed_currencies' => 'required|array|min:1',
        'displayed_currencies.*' => 'required|string|max:10'
    ]);

    $user = auth()->user();
    $user->displayed_currencies = $validated['displayed_currencies'];
    $user->save();

    return response()->json([
        'message' => 'Currency display settings updated successfully',
        'user' => $user->load('currency')
    ]);
}
```

## User Experience

### Main View
- Displays all selected currencies with symbols and names
- Shows total count of selected currencies
- "Add New Currency" button prominently displayed
- Individual remove buttons for each currency (disabled if only one remaining)

### Add Currency View
- Search bar for filtering available currencies
- List of all available currencies not currently selected
- Click any currency to add it immediately
- Automatic return to main view after adding

### Feedback System
- Loading spinners during API calls
- Success toasts when currencies are updated
- Error toasts if operations fail
- Validation messages for user guidance

## Integration Points

### Settings Page
The currency settings are integrated into the main Settings page under the "Currency" tab:

```
Settings → Currency → Manage Currencies (button)
```

### Advanced Settings
The popup works alongside the existing `DisplayedCurrencySettings` component for users who prefer a table-based interface.

### Cross-Application Usage
The hook can be used anywhere in the application where currency management is needed:

- Transaction forms
- Report configuration
- Dashboard settings
- User preferences

## Performance Considerations

### Optimization Features
- **Lazy Loading**: Popup content only loads when opened
- **Debounced Search**: Search input is optimized to prevent excessive API calls
- **Cached Data**: Currency data is cached for the session
- **Minimal Re-renders**: State updates are optimized to prevent unnecessary renders

### Best Practices
- Use the provided hook instead of managing state manually
- Implement the `onUpdate` callback for components that need to refresh
- Keep the popup component at a high level to avoid prop drilling
- Use the toast notifications for user feedback

## Testing

To test the implementation:

1. Navigate to Settings → Currency in the application
2. Click "Manage Currencies" button
3. Verify all selected currencies are displayed
4. Click "Add New Currency" 
5. Search for a currency and add it
6. Verify the currency appears in the main view
7. Try removing currencies (should prevent removing the last one)
8. Verify changes persist after refreshing the page

## Error Handling

The system handles various error scenarios:

- **Network Errors**: Graceful fallback with error messages
- **Validation Errors**: User-friendly validation feedback
- **API Errors**: Proper error logging and user notification
- **Edge Cases**: Minimum currency requirement enforced

## Conclusion

This implementation provides a complete, production-ready currency management system that can be easily integrated throughout the Budget Buddy application. The modular design allows for easy customization and extension while maintaining a consistent user experience.
