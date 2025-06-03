import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-[#008080] bg-[#F8F9FA] text-[#008080] focus:border-[#006666] focus:bg-[#F0F2F4] focus:text-[#006666]'
                    : 'border-transparent text-[#6C757D] hover:border-[#DEE2E6] hover:bg-[#F8F9FA] hover:text-[#5C6BC0] focus:border-[#DEE2E6] focus:bg-[#F8F9FA] focus:text-[#5C6BC0]'
            } text-base font-medium transition duration-300 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
