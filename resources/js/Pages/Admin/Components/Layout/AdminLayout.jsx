import React from 'react';
import { Head } from '@inertiajs/react';
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { Link } from "@inertiajs/react";

/**
 * AdminLayout Component
 * 
 * Provides a consistent layout for all admin pages with:
 * - Sidebar navigation
 * - Header with breadcrumbs
 * - Responsive design
 * - Accessibility features
 * 
 * @param {Object} props
 * @param {string} props.title - Page title for head and breadcrumb
 * @param {Array} props.breadcrumbs - Array of breadcrumb items
 * @param {React.ReactNode} props.children - Page content
 * @param {React.ReactNode} props.headerActions - Optional header action buttons
 * @param {string} props.className - Additional CSS classes for content area
 */
export default function AdminLayout({ 
  title, 
  breadcrumbs = [], 
  children, 
  headerActions,
  className = "" 
}) {
  // Build breadcrumb navigation
  const buildBreadcrumbs = () => {
    const baseBreadcrumbs = [
      {
        label: "Admin",
        href: route('admin.dashboard'),
        icon: Home
      }
    ];

    const allBreadcrumbs = [...baseBreadcrumbs, ...breadcrumbs];
    
    return (
      <Breadcrumb>
        <BreadcrumbList>
          {allBreadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {index === allBreadcrumbs.length - 1 ? (
                  <BreadcrumbPage className="flex items-center gap-2">
                    {breadcrumb.icon && <breadcrumb.icon className="h-4 w-4" />}
                    {breadcrumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink 
                    href={breadcrumb.href}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    {breadcrumb.icon && <breadcrumb.icon className="h-4 w-4" />}
                    {breadcrumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < allBreadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  return (
    <SidebarProvider>
      <Head title={title} />
      <AppSidebar />
      
      <SidebarInset>
        {/* Header with breadcrumbs and actions */}
        <header 
          className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
          role="banner"
        >
          <div className="flex items-center gap-2 px-4 flex-1">
            <SidebarTrigger 
              className="-ml-1" 
              aria-label="Toggle sidebar"
            />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {buildBreadcrumbs()}
          </div>
          
          {/* Header actions */}
          {headerActions && (
            <div className="flex items-center gap-2 px-4">
              {headerActions}
            </div>
          )}
        </header>
        
        {/* Main content area */}
        <main 
          className={`flex flex-1 flex-col gap-4 p-4 pt-0 ${className}`}
          role="main"
          aria-label={`${title} content`}
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

/**
 * Quick action button for going back to admin dashboard
 */
AdminLayout.BackButton = function BackButton({ className = "" }) {
  return (
    <Button variant="outline" size="sm" asChild className={className}>
      <Link 
        href={route('admin.dashboard')} 
        className="flex items-center gap-2"
        aria-label="Back to admin dashboard"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </Button>
  );
};

/**
 * Page header component for consistent styling
 */
AdminLayout.PageHeader = function PageHeader({ 
  title, 
  description, 
  icon: Icon,
  actions,
  className = ""
}) {
  return (
    <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${className}`}>
      <div className="space-y-1">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          {Icon && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          )}
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-lg">
            {description}
          </p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};