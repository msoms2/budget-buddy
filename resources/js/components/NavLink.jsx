import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-300 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-[#008080] text-[#343A40] focus:border-[#006666]'
                    : 'border-transparent text-[#6C757D] hover:border-[#DEE2E6] hover:text-[#5C6BC0] focus:border-[#DEE2E6] focus:text-[#5C6BC0]') +
                className
            }
        >
            {children}
        </Link>
    );
}
