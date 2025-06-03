import * as React from 'react';
import { useState, useEffect } from 'react';
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from '@/components/ui/select';
import { Loader2, AlertCircle } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency.jsx';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/utils/api.js';

export default function CurrencySelector({ onChange, className }) {
const [currencies, setCurrencies] = useState([]);
const [loading, setLoading] = useState(true);
const [fetchError, setFetchError] = useState(null);
const { converting, updateUserCurrency, currency: currentCurrency } = useCurrency();

const fetchCurrencies = async () => {
try {
const response = await apiFetch('/api/currencies');
  if (!response.ok) {
    throw new Error('Failed to fetch currencies');
  }
  
  const data = await response.json();
  setCurrencies(data.currencies);
  setFetchError(null);
} catch (error) {
  console.error('Error fetching currencies:', error);
  setFetchError('Failed to load currencies. Please try again later.');
} finally {
  setLoading(false);
}
};

useEffect(() => {
fetchCurrencies();
}, []);

const handleCurrencyChange = async (newValue) => {
try {
  // Convert string ID to number
  const currencyId = parseInt(newValue, 10);
  if (isNaN(currencyId)) {
    throw new Error('Invalid currency selected');
  }
  
  // First call the provided onChange handler if it exists
  if (typeof onChange === 'function') {
    onChange(currencyId);
  }

  // Then update user's currency preference which triggers automatic conversion
  await updateUserCurrency(currencyId);
} catch (error) {
  console.error('Error updating currency:', error);
  // The useCurrency hook will handle the error toast
}
};

return (
<Select
value={currentCurrency?.id?.toString() || ""}
onValueChange={handleCurrencyChange}
disabled={loading || converting}
className={className}
>
<SelectTrigger className={cn(
"transition-all focus:ring-2",
fetchError ? "focus:ring-red-500/20 border-red-500/50" :
"focus:ring-green-500/20",
(loading || converting) && "opacity-70 cursor-not-allowed"
)}>
<SelectValue 
placeholder={
  loading ? "Loading currencies..." :
  converting ? "Converting..." :
  fetchError ? "Currency loading failed" :
  "Select currency"
}
renderValue={(value) => {
  if (!value) return "Select currency";
  if (loading) return "Loading currencies...";
  if (converting) return "Converting...";
  if (fetchError) return "Currency loading failed";
  
  const selected = currencies.find(c => c.id.toString() === value);
  if (!selected) return "Select currency";
  
  return (
    <div className="flex items-center">
      <span className="mr-2 text-lg font-medium">{selected.symbol}</span> 
      <span>{selected.name}</span>
      <span className="ml-2 text-xs text-gray-500">({selected.code})</span>
    </div>
  );
}}
/>
{(loading || converting) ? (
<Loader2 className="h-4 w-4 animate-spin" />
) : fetchError ? (
<AlertCircle className="h-4 w-4 text-red-500" />
) : null}
</SelectTrigger>

<SelectContent>
{fetchError ? (
<div className="p-4 text-center text-red-600">
Error loading currencies
<button
onClick={(e) => {
e.stopPropagation();
setFetchError(null);
setLoading(true);
fetchCurrencies();
}}
className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
>
Retry
</button>
</div>
) : currencies.map(currency => (
<SelectItem key={currency.id} value={currency.id.toString()}>
<span className="mr-2 text-lg font-medium">{currency.symbol}</span> {currency.name} <span className="text-xs text-gray-500">({currency.code})</span>
</SelectItem>
))}
</SelectContent>
</Select>
);
}