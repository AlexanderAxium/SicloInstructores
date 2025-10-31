"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  DollarSign,
  GraduationCap,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function DocsSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems: NavItem[] = [
    {
      title: "Introducción",
      href: "/docs",
      icon: BookOpen,
    },
    {
      title: "Cálculo de Pagos",
      href: "/docs/pagos",
      icon: DollarSign,
    },
    {
      title: "Bonos y Penalizaciones",
      href: "/docs/bonos",
      icon: GraduationCap,
    },
    {
      title: "Mis Clases",
      href: "/docs/clases",
      icon: Calendar,
    },
    {
      title: "Mi Información",
      href: "/docs/instructores",
      icon: Users,
    },
  ];

  // Scroll al inicio cuando cambia la ruta
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    // Si ya estamos en la misma página, solo hacer scroll
    if (pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // Para navegaciones, el useEffect se encargará del scroll
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Verificar si hay una página anterior usando document.referrer
    const referrer = document.referrer;
    const currentOrigin = window.location.origin;

    // Si hay un referrer y es de nuestro dominio, retroceder
    // Si no hay referrer o viene de otro dominio, ir a inicio
    if (referrer?.startsWith(currentOrigin)) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" onClick={handleBackClick}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground border-2 border-sidebar-primary-foreground">
                <ArrowLeft className="h-5 w-5" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Siclo</span>
                <span className="truncate text-xs">Documentación</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Contenido</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/docs" && pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-2 min-w-0"
                        onClick={(e) => handleLinkClick(e, item.href)}
                      >
                        <item.icon className="flex-shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
