export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-lg border border-transparent bg-[#008080] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-300 ease-in-out hover:bg-[#006666] focus:outline-none focus:ring-2 focus:ring-[#5C6BC0] focus:ring-offset-2 active:bg-[#005353] ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
