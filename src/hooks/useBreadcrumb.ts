"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function useBreadcrumb() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const items: BreadcrumbItem[] = [];

    // Mapeo de rutas a títulos legibles
    const routeLabels: Record<string, string> = {
      dashboard: "Dashboard",
      users: "Usuarios",
      roles: "Roles",
      settings: "Configuración",
      profile: "Perfil",
    };

    // Siempre empezar con Dashboard
    items.push({
      label: "Dashboard",
      href: "/dashboard",
    });

    // Procesar cada segmento de la ruta
    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Saltar el primer segmento si es "dashboard" ya que ya lo incluimos
      if (segment === "dashboard" && index === 0) {
        return;
      }

      // Si es un ID (número o UUID), usar el contexto del segmento anterior
      if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          segment
        ) ||
        /^\d+$/.test(segment)
      ) {
        const previousSegment = segments[index - 1];
        if (previousSegment === "users") {
          items.push({
            label: "Detalle de Usuario",
            href: currentPath,
          });
        }
        return;
      }

      // Usar el mapeo o capitalizar el segmento
      const label =
        routeLabels[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1);
      items.push({
        label,
        href: currentPath,
      });
    });

    return items;
  }, [pathname]);

  return breadcrumbs;
}
