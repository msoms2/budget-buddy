import React from 'react';

export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-lg border border-transparent bg-[#DC3545] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-300 ease-in-out hover:bg-[#C82333] focus:outline-none focus:ring-2 focus:ring-[#DC3545] focus:ring-offset-2 active:bg-[#BD2130] ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
