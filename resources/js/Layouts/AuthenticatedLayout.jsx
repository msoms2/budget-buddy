import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { AppSidebar } from '@/components/app-sidebar';
import {
    SidebarProvider,
    SidebarInset
} from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { NotificationBell } from '@/Components/NotificationBell.jsx';
import FloatingScrollbar from '@/components/FloatingScrollbar';

export default function AuthenticatedLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Check if we're on mobile and adjust sidebar accordingly
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <FloatingScrollbar />
            <SidebarProvider
                defaultOpen={isSidebarOpen}
                open={isSidebarOpen}
                onOpenChange={setIsSidebarOpen}
            >
                <div className="flex h-screen w-full overflow-hidden">
                    <AppSidebar />
                    <SidebarInset className="flex-1 w-0 flex flex-col overflow-auto">
                        <main>{children}</main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
            <Toaster />
        </div>
    );
}