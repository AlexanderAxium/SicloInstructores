import { InstructorLayoutClient } from "@/app/(instructor)/InstructorLayoutClient";
import { InstructorRouteGuard } from "@/components/instructor/InstructorRouteGuard";
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
        <InstructorLayoutClient>{children}</InstructorLayoutClient>
      </InstructorRouteGuard>
    </InstructorAuthProvider>
  );
}
