import React from 'react';

export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-[#DEE2E6] text-[#008080] shadow-sm focus:ring-[#5C6BC0] focus:ring-opacity-30 ' +
                className
            }
        />
    );
}
