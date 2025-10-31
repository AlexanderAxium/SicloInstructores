import { InstructorRouteGuard } from "@/components/instructor/InstructorRouteGuard";
import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { InstructorAuthProvider } from "@/contexts/InstructorAuthContext";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "Panel de Instructor",
  description: "Panel personalizado para instructores del sistema.",
  keywords: ["instructor", "panel", "pagos", "clases", "categorías"],
});

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InstructorAuthProvider>
      <InstructorRouteGuard>
        <SidebarProvider>
          <div className="flex h-screen w-full bg-background">
            <InstructorSidebar />
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto py-6 px-4">{children}</div>
            </main>
          </div>
        </SidebarProvider>
      </InstructorRouteGuard>
    </InstructorAuthProvider>
  );
}
