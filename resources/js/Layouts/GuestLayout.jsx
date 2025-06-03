import React from 'react';
import ApplicationLogo from '@/components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#F8F9FA] to-[#e6f0f0] dark:from-gray-900 dark:to-gray-900 pt-6 sm:justify-center sm:pt-0">
            <div className="flex justify-center">
                <Link href="/">
                    <ApplicationLogo className="h-24 w-24 fill-current text-[#008080]" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white dark:bg-gray-800/50 px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg border-t-4 border-[#008080] dark:border-primary">
                {children}
            </div>
        </div>
    );
}
