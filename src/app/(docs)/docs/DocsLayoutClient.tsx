"use client";

import { DocsSidebar } from "@/components/docs/DocsSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function DocsLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <DocsSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 px-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="-ml-1" />
            <span className="text-sm font-medium text-muted-foreground">
              Documentación
            </span>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 lg:p-8 min-w-0">
            <div className="flex-1 min-w-0 max-w-4xl mx-auto w-full">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
