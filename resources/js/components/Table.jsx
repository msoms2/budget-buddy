import React from 'react';
import CurrencyDisplay from '@/components/CurrencyDisplay';

/**
 * @typedef {Object} TableProps
 * @property {React.ReactNode} children - The table content
 * @property {string} [className] - Optional CSS class name
 */

/**
 * @param {TableProps} props
 */
export function Table({ children, className = '' }) {
    return (
        <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
            {children}
        </table>
    );
}

/**
 * @param {{ children: React.ReactNode }} props
 */
export function Head({ children }) {
    return (
        <thead className="bg-gray-50">
            <tr>
                {children}
            </tr>
        </thead>
    );
}

/**
 * @param {{ children: React.ReactNode }} props
 */
export function Body({ children }) {
    return (
        <tbody className="bg-white divide-y divide-gray-200">
            {children}
        </tbody>
    );
}

/**
 * @param {{ children: React.ReactNode }} props
 */
export function Row({ children }) {
    return (
        <tr>
            {children}
        </tr>
    );
}

/**
 * @param {{ children: React.ReactNode }} props
 */
export function Cell({ children }) {
    return (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {children}
        </td>
    );
}

/**
 * @param {{
 *   amount: number,
 *   currencyId: string | number,
 *   targetCurrencyId?: string | number,
 *   className?: string
 * }} props
 */
export function MoneyCell({ amount, currencyId, targetCurrencyId, className = '' }) {
    return (
        <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${className}`}>
            <CurrencyDisplay
                amount={amount}
                fromCurrencyId={currencyId}
                toCurrencyId={targetCurrencyId}
            />
        </td>
    );
}

export default Table;