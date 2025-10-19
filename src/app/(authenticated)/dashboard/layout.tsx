import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "Dashboard",
  description:
    "Panel de control administrativo para gestionar usuarios, roles y configuraciones del sistema.",
  keywords: [
    "dashboard",
    "admin",
    "panel de control",
    "gestión",
    "administración",
  ],
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 bg-background">
      {/* Container principal con ancho máximo de 1500px */}
      <div className="max-w-[1500px] py-8 mx-auto">
        <div className="flex h-full">
          {/* Primer div - delgado para el sidebar (oculto en móvil) */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <DashboardSidebar />
          </div>

          {/* Segundo div - contenido principal */}
          <div className="flex-1 overflow-auto bg-background">
            <div className="">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
