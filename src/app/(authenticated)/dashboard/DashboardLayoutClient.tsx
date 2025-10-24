"use client";

import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 px-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger className="-ml-1 hidden sm:flex" />
          <DashboardNavbar />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 min-w-0">
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
