import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import TransactionsPdfDialog from '@/components/Reports/TransactionsPdfDialog';
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  PieChartIcon,
  ArrowUpRightIcon,
  BarChart3Icon,
  TagIcon,
  CreditCardIcon,
  TrendingUpIcon,
  FileTextIcon,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Reports({ auth }) {
  const [showPdfDialog, setShowPdfDialog] = useState(false);

  const reportCategories = [
    {
      title: "Reports Dashboard",
      description: "Overview of your financial performance",
      icon: PieChartIcon,
      href: route('reports.dashboard'),
      color: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Transaction Reports",
      description: "Generate detailed transaction reports with PDF export",
      icon: FileTextIcon,
      onClick: () => setShowPdfDialog(true),
      color: "bg-slate-50 dark:bg-slate-900/20"
    },
    {
      title: "Income vs Expenses",
      description: "Compare income and expense trends over time",
      icon: BarChart3Icon,
      href: route('reports.comparison'),
      color: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "Budget Analysis",
      description: "Track budget performance and variances",
      icon: BarChart3Icon,
      href: route('reports.budget-analysis'),
      color: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: "Tag Analysis",
      description: "Analyze spending patterns by tags",
      icon: TagIcon,
      href: route('reports.tag-analysis'),
      color: "bg-orange-50 dark:bg-orange-900/20"
    },
    {
      title: "Payment Methods",
      description: "Review spending by payment method",
      icon: CreditCardIcon,
      href: route('reports.payment-method-analysis'),
      color: "bg-red-50 dark:bg-red-900/20"
    },
    {
      title: "Financial Forecast",
      description: "View future financial projections",
      icon: TrendingUpIcon,
      href: route('reports.forecast'),
      color: "bg-indigo-50 dark:bg-indigo-900/20"
    }
  ];

  return (
    <SidebarProvider>
      <Head title="Reports" />
      <AppSidebar />
      
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbItem>
                <BreadcrumbPage>Reports & Analysis</BreadcrumbPage>
              </BreadcrumbItem>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Financial Reports</h2>
            <p className="text-muted-foreground">
              Comprehensive analysis and insights into your financial data
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reportCategories.map((category, index) => (
              <Card key={index} className={cn(
                "relative overflow-hidden transition-all hover:shadow-lg cursor-pointer",
                category.color
              )}>
                {category.href ? (
                  <Link href={category.href}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <category.icon className="h-8 w-8" />
                        <div className="space-y-1">
                          <CardTitle>{category.title}</CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ArrowRight className="absolute bottom-4 right-4 h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </CardContent>
                  </Link>
                ) : (
                  <div onClick={category.onClick}>
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <category.icon className="h-8 w-8" />
                        <div className="space-y-1">
                          <CardTitle>{category.title}</CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ArrowRight className="absolute bottom-4 right-4 h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </CardContent>
                  </div>
                )}
              </Card>
            ))}
          </div>

          <div className="flex justify-end mt-2">
            <Link href="/dashboard" className="text-blue-600 hover:underline flex items-center text-sm">
              Back to Dashboard
              <ArrowUpRightIcon className="ml-1 size-3" />
            </Link>
          </div>
        </div>
      </SidebarInset>
      
      <TransactionsPdfDialog
        open={showPdfDialog}
        onClose={() => setShowPdfDialog(false)}
      />
    </SidebarProvider>
  );
}
