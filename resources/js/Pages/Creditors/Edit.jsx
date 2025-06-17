import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
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
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Edit } from 'lucide-react';
import CreditorForm from './components/CreditorForm';

export default function EditCreditor({ auth, creditor }) {
  return (
    <SidebarProvider>
      <Head title={`Edit Debt - ${creditor.name}`} />
      <AppSidebar />
      
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb className="whitespace-nowrap overflow-hidden flex-shrink min-w-0">
              <BreadcrumbList className="flex-nowrap overflow-hidden">
                <BreadcrumbItem className="overflow-hidden text-ellipsis">
                  <BreadcrumbLink href={route('creditors.index')} className="text-muted-foreground hover:text-foreground">
                    Debt Management
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="overflow-hidden text-ellipsis">
                  <BreadcrumbLink href={route('creditors.show', creditor.id)} className="text-muted-foreground hover:text-foreground max-w-[150px] truncate">
                    {creditor.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="overflow-hidden text-ellipsis">
                  <BreadcrumbPage className="font-semibold flex items-center gap-1">
                    <Edit className="h-4 w-4" />
                    Edit
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="mx-auto max-w-4xl w-full">
            <CreditorForm 
              creditor={creditor}
              mode="edit"
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}