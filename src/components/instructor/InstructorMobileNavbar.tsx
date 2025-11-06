"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useInstructorAuth } from "@/contexts/InstructorAuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

export function InstructorMobileNavbar() {
  const isMobile = useIsMobile();
  const { instructor } = useInstructorAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Solo mostrar en móvil
  if (!isMobile) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:hidden">
      <SidebarTrigger className="-ml-1" />
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {instructor ? getInitials(instructor.name) : "IN"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm truncate">
            {instructor?.name || "Instructor"}
          </h2>
        </div>
      </div>
    </header>
  );
}
