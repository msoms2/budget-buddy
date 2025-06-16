import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { AppSidebar } from "@/components/app-sidebar";
import {
    SidebarProvider,
    SidebarInset,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import FloatingScrollbar from '@/components/FloatingScrollbar';

export default function ReportsLayout({ children }) {
    const { url } = usePage();
    
    return (
        <SidebarProvider>
            <FloatingScrollbar />
            <AppSidebar />
            
            <SidebarInset className="bg-background">
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
                    <div className="flex items-center gap-2 px-4">
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={route('reports.dashboard')}>Reports</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>
                                        {url === route('reports.dashboard') && 'Dashboard'}
                                        {url === route('reports.transactions') && 'Transaction Reports'}
                                        {url === route('reports.comparison') && 'Income vs Expenses'}
                                        {url === route('reports.budget-analysis') && 'Budget Analysis'}
                                        {url === route('reports.tag-analysis') && 'Tag Analysis'}
                                        {url === route('reports.payment-method-analysis') && 'Payment Methods'}
                                        {url === route('reports.forecast') && 'Financial Forecast'}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
