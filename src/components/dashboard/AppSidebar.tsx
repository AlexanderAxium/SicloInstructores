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
  BarChart3,
  Bike,
  BookOpen,
  Building2,
  Calculator,
  Calendar,
  Clock,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Star,
  Upload,
  UserCog,
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
          title: "Estadísticas",
          href: "/dashboard/estadisticas",
          icon: BarChart3,
          description: "Ver estadísticas del sistema",
        },
        {
          title: "Instructores",
          href: "/dashboard/instructores",
          icon: GraduationCap,
          description: "Gestionar instructores del sistema",
        },
        {
          title: "Clases",
          href: "/dashboard/clases",
          icon: Calendar,
          description: "Gestionar clases del sistema",
        },
        {
          title: "Pagos",
          href: "/dashboard/pagos",
          icon: Calculator,
          description: "Gestionar pagos de instructores",
        },
        {
          title: "Importar",
          href: "/dashboard/importar",
          icon: Upload,
          description: "Importar datos desde Excel",
        },
      ];
    }

    // Viewer - acceso de solo lectura
    if (hasRole("viewer")) {
      return [
        ...baseItems,
        {
          title: "Estadísticas",
          href: "/dashboard/estadisticas",
          icon: BarChart3,
          description: "Ver estadísticas del sistema",
        },
        {
          title: "Instructores",
          href: "/dashboard/instructores",
          icon: GraduationCap,
          description: "Ver instructores del sistema",
        },
        {
          title: "Clases",
          href: "/dashboard/clases",
          icon: Calendar,
          description: "Ver clases del sistema",
        },
        {
          title: "Pagos",
          href: "/dashboard/pagos",
          icon: Calculator,
          description: "Ver pagos de instructores",
        },
      ];
    }

    // Usuario sin permisos específicos
    return baseItems;
  };

  // Configuración de navegación para gestión (solo para admins)
  const getManagementItems = (): NavItem[] => {
    if (!isSuperAdmin && !isAdmin) {
      return [];
    }

    return [
      {
        title: "Disciplinas",
        href: "/dashboard/disciplinas",
        icon: BookOpen,
        description: "Gestionar disciplinas del sistema",
      },
      {
        title: "Períodos",
        href: "/dashboard/periodos",
        icon: Clock,
        description: "Gestionar períodos del sistema",
      },
      {
        title: "Fórmulas",
        href: "/dashboard/formulas",
        icon: Calculator,
        description: "Gestionar fórmulas de cálculo",
      },
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
        description: "Configuraciones del sistema e información de la empresa",
      },
    ];
  };

  const navItems = getNavItems();
  const managementItems = getManagementItems();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground border-2 border-sidebar-primary-foreground">
                  <span className="text-lg font-bold">S</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Siclo</span>
                  <span className="truncate text-xs">Instructores</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto overflow-x-hidden">
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
                      <Link
                        href={item.href}
                        className="flex items-center gap-2 min-w-0"
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

        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Bonos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[
                {
                  title: "Workshops",
                  href: "/dashboard/workshops",
                  icon: GraduationCap,
                  description: "Gestionar workshops de instructores",
                },
                {
                  title: "Theme Rides",
                  href: "/dashboard/theme-rides",
                  icon: Bike,
                  description: "Gestionar theme rides de instructores",
                },
                {
                  title: "Brandeos",
                  href: "/dashboard/brandeos",
                  icon: Star,
                  description: "Gestionar brandeos de instructores",
                },
              ].map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-2 min-w-0"
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

        {managementItems.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Gestión del Sistema</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {managementItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/dashboard" &&
                        pathname.startsWith(item.href));

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link
                            href={item.href}
                            className="flex items-center gap-2 min-w-0"
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
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="flex-shrink-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut()}
              className="flex items-center gap-2 min-w-0"
            >
              <LogOut className="flex-shrink-0" />
              <span className="truncate">Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
