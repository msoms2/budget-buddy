import React from 'react';

export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p
            {...props}
            className={'text-sm text-[#DC3545] ' + className}
        >
            {message}
        </p>
    ) : null;
}
