import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PaymentMethodAnalysis from "@/components/PaymentMethodAnalysis";

export default function PaymentMethodAnalysisPage({ auth, paymentMethodStats, dateRange = 'month' }) {
    // Handle period change
    const handlePeriodChange = (newRange) => {
        router.visit(route('statistics.payment-methods'), {
            data: { 
                dateRange: newRange,
                periodType: 'last'
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <SidebarProvider>
            <Head title="Payment Method Analysis" />
            <AppSidebar />
            
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={route('statistics.index')}>Statistics</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Payment Method Analysis</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="ml-auto mr-4 flex items-center gap-2 flex-shrink-0">
                        <Select value={dateRange} onValueChange={handlePeriodChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="week">Last Week</SelectItem>
                                <SelectItem value="month">Last Month</SelectItem>
                                <SelectItem value="year">Last Year</SelectItem>
                                <SelectItem value="all">All Time</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <PaymentMethodAnalysis 
                        paymentMethodStats={paymentMethodStats}
                        dateRange={dateRange}
                    />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
