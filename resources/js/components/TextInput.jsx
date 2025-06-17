import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-lg border-[#DEE2E6] shadow-sm focus:border-[#5C6BC0] focus:ring focus:ring-[#5C6BC0] focus:ring-opacity-30 ' +
                className
            }
            ref={localRef}
        />
    );
});
