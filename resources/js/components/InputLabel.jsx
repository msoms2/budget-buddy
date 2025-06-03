import React from 'react';

export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-medium text-[#343A40] ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
