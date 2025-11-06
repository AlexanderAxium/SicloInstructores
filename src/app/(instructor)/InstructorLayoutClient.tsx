"use client";

import { InstructorMobileNavbar } from "@/components/instructor/InstructorMobileNavbar";
import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function InstructorLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <InstructorSidebar />
      <SidebarInset>
        <InstructorMobileNavbar />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 min-w-0 overflow-auto">
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
