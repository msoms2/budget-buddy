import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} locale - The locale to use (defaults to en-US)
 * @param {string} currency - The currency code (defaults to USD)
 * @returns {string} Formatted currency string
 * 
 * Note: For components that need to use the user's preferred currency,
 * it's recommended to use the formatCurrency function from the useCurrency hook instead.
 */
export function formatCurrency(amount, locale = 'en-US', currency = 'USD') {
  // Handle undefined or null amounts
  if (amount === undefined || amount === null) {
    return '$0.00';
  }
  
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

/**
 * Format a number with proper locale formatting
 * @param {number|string} value - The number to format
 * @param {string} locale - The locale to use (defaults to en-US)
 * @returns {string} Formatted number string
 */
export function formatNumber(value, locale = 'en-US') {
  // Handle undefined, null, or empty values
  if (value === undefined || value === null || value === '') {
    return '0';
  }
  
  // Convert to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Handle invalid numbers
  if (isNaN(numValue)) {
    return '0';
  }
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
}
