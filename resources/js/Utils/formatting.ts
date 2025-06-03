/**
 * Formats a number as currency (EUR)
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('lv-LV', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount);
}

/**
 * Formats a date string into a human-readable format
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('lv-LV', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
}