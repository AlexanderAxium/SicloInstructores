"use client";

import { useAuthContext } from "@/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useRBAC } from "@/hooks/useRBAC";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
  requiredRoles?: string[];
  requiredPermissions?: Array<{ action: string; resource: string }>;
}

export function AppSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuthContext();
  const { isSuperAdmin, isAdmin, hasRole } = useRBAC();

  // Configuración de navegación por rol
  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      {
        title: "Panel Principal",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Vista general del sistema",
      },
    ];

    // Super Admin y Admin - acceso completo
    if (isSuperAdmin || isAdmin) {
      return [
        ...baseItems,
        {
          title: "Usuarios",
          href: "/dashboard/users",
          icon: Users,
          description: "Gestionar usuarios del sistema",
        },
        {
          title: "Roles y Permisos",
          href: "/dashboard/roles",
          icon: Shield,
          description: "Configurar sistema RBAC",
        },
        {
          title: "Configuraciones",
          href: "/dashboard/settings",
          icon: Settings,
          description:
            "Configuraciones del sistema e información de la empresa",
        },
      ];
    }

    // Viewer - acceso de solo lectura
    if (hasRole("viewer")) {
      return [
        ...baseItems,
        {
          title: "Usuarios",
          href: "/dashboard/users",
          icon: Users,
          description: "Ver usuarios del sistema",
        },
        {
          title: "Configuraciones",
          href: "/dashboard/settings",
          icon: Settings,
          description:
            "Ver configuraciones del sistema e información de la empresa",
        },
      ];
    }

    // Usuario sin permisos específicos
    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Dashboard</span>
                  <span className="truncate text-xs">Panel de Control</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()}>
              <LogOut />
              <span>Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
