import React from 'react';

// This component is for displaying currency code and name in a prominent badge style

const CurrencyInfoBadge = ({ code, name, className = '' }) => {
    if (!code) {
        // Basic fallback if code is missing, can be adjusted
        return <span className={`text-sm text-red-500 ${className}`}>Invalid currency</span>;
    }

    return (
        <div className={`flex items-center gap-3 py-1 ${className}`} style={{ minWidth: 0 }}>
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center border-2 border-blue-300 dark:border-blue-700 shadow-sm">
                <span className="text-base font-bold text-blue-700 dark:text-blue-200 tracking-wide">
                    {code.toUpperCase()}
                </span>
            </div>
            <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-base leading-tight truncate">{code.toUpperCase()}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug truncate">{name || `${code.toUpperCase()} Name Unavailable`}</p>
            </div>
        </div>
    );
};

export default CurrencyInfoBadge;