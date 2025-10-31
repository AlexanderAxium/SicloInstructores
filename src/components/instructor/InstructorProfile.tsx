"use client";

import { useInstructorAuth } from "@/contexts/InstructorAuthContext";
import { InstructorHeader } from "./InstructorHeader";
import { InstructorStats } from "./InstructorStats";
import { InstructorTabs } from "./InstructorTabs";

export function InstructorProfile() {
  const { instructor, isAuthenticated } = useInstructorAuth();

  if (!isAuthenticated || !instructor) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-muted-foreground">
          <p>No se encontró información del instructor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con información del instructor */}
      <InstructorHeader />

      {/* Estadísticas */}
      <InstructorStats />

      {/* Tabs con clases y pagos */}
      <InstructorTabs />
    </div>
  );
}
