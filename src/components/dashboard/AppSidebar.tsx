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
import { PermissionAction, PermissionResource } from "@/types/rbac";
import {
  AlertTriangle,
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
  UserCheck,
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
  requiredPermissions?: {
    action: PermissionAction;
    resource: PermissionResource;
  };
}

export function AppSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuthContext();
  const { hasPermission, canViewDashboard } = useRBAC();

  // Configuración de navegación basada en permisos
  const getNavItems = (): NavItem[] => {
    const allNavItems: NavItem[] = [
      {
        title: "Panel Principal",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Vista general del sistema",
        // Dashboard siempre visible si tiene acceso
      },
      {
        title: "Estadísticas",
        href: "/dashboard/estadisticas",
        icon: BarChart3,
        description: "Ver estadísticas del sistema",
        requiredPermissions: {
          action: PermissionAction.READ,
          resource: PermissionResource.DASHBOARD,
        },
      },
      {
        title: "Instructores",
        href: "/dashboard/instructores",
        icon: GraduationCap,
        description: "Gestionar instructores del sistema",
        requiredPermissions: {
          action: PermissionAction.READ,
          resource: PermissionResource.INSTRUCTOR,
        },
      },
      {
        title: "Clases",
        href: "/dashboard/clases",
        icon: Calendar,
        description: "Gestionar clases del sistema",
        requiredPermissions: {
          action: PermissionAction.READ,
          resource: PermissionResource.CLASE,
        },
      },
      {
        title: "Pagos",
        href: "/dashboard/pagos",
        icon: Calculator,
        description: "Gestionar pagos de instructores",
        requiredPermissions: {
          action: PermissionAction.READ,
          resource: PermissionResource.PAGO_INSTRUCTOR,
        },
      },
      {
        title: "Importar",
        href: "/dashboard/importar",
        icon: Upload,
        description: "Importar datos desde Excel",
        // TODO: Definir permiso específico para importar o usar CLASE.CREATE
        requiredPermissions: {
          action: PermissionAction.CREATE,
          resource: PermissionResource.CLASE,
        },
      },
    ];

    // Filtrar items según permisos del usuario
    return allNavItems.filter((item) => {
      // Panel principal siempre visible si tiene acceso al dashboard
      if (item.href === "/dashboard") {
        return canViewDashboard;
      }

      // Para otros items, verificar permiso requerido
      if (item.requiredPermissions) {
        return hasPermission(
          item.requiredPermissions.action,
          item.requiredPermissions.resource
        );
      }

      return false;
    });
  };

  // Configuración de navegación para gestión basada en permisos
  const getManagementItems = (): NavItem[] => {
    const allManagementItems: NavItem[] = [
      {
        title: "Disciplinas",
        href: "/dashboard/disciplinas",
        icon: BookOpen,
        description: "Gestionar disciplinas del sistema",
        requiredPermissions: {
          action: PermissionAction.READ,
          resource: PermissionResource.DISCIPLINA,
        },
      },
      {
        title: "Períodos",
        href: "/dashboard/periodos",
        icon: Clock,
        description: "Gestionar períodos del sistema",
        requiredPermissions: {
          action: PermissionAction.READ,
          resource: PermissionResource.PERIODO,
        },
      },
      {
        title: "Fórmulas",
        href: "/dashboard/formulas",
        icon: Calculator,
        description: "Gestionar fórmulas de cálculo",
        requiredPermissions: {
          action: PermissionAction.READ,
          resource: PermissionResource.FORMULA,
        },
      },
      {
        title: "Usuarios",
        href: "/dashboard/users",
        icon: Users,
        description: "Gestionar usuarios del sistema",
        requiredPermissions: {
          action: PermissionAction.READ,
          resource: PermissionResource.USER,
        },
      },
      {
        title: "Roles y Permisos",
        href: "/dashboard/roles",
        icon: Shield,
        description: "Configurar sistema RBAC",
        requiredPermissions: {
          action: PermissionAction.READ,
          resource: PermissionResource.ROLE,
        },
      },
      {
        title: "Configuraciones",
        href: "/dashboard/settings",
        icon: Settings,
        description: "Configuraciones del sistema e información de la empresa",
        // TODO: Definir permiso específico para settings o usar ADMIN.READ
        requiredPermissions: {
          action: PermissionAction.READ,
          resource: PermissionResource.ADMIN,
        },
      },
    ];

    // Filtrar items según permisos del usuario
    return allManagementItems.filter((item) => {
      if (item.requiredPermissions) {
        return hasPermission(
          item.requiredPermissions.action,
          item.requiredPermissions.resource
        );
      }
      return false;
    });
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
                  <span className="text-lg font-normal">S</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-normal">Siclo</span>
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

        {(() => {
          const bonusItems: NavItem[] = [
            {
              title: "Covers",
              href: "/dashboard/covers",
              icon: UserCheck,
              description: "Gestionar covers del sistema",
              requiredPermissions: {
                action: PermissionAction.READ,
                resource: PermissionResource.COVER,
              },
            },
            {
              title: "Workshops",
              href: "/dashboard/workshops",
              icon: GraduationCap,
              description: "Gestionar workshops de instructores",
              requiredPermissions: {
                action: PermissionAction.READ,
                resource: PermissionResource.WORKSHOP,
              },
            },
            {
              title: "Theme Rides",
              href: "/dashboard/theme-rides",
              icon: Bike,
              description: "Gestionar theme rides de instructores",
              requiredPermissions: {
                action: PermissionAction.READ,
                resource: PermissionResource.THEME_RIDE,
              },
            },
            {
              title: "Brandeos",
              href: "/dashboard/brandeos",
              icon: Star,
              description: "Gestionar brandeos de instructores",
              requiredPermissions: {
                action: PermissionAction.READ,
                resource: PermissionResource.BRANDEO,
              },
            },
            {
              title: "Penalizaciones",
              href: "/dashboard/penalizaciones",
              icon: AlertTriangle,
              description: "Gestionar penalizaciones de instructores",
              requiredPermissions: {
                action: PermissionAction.READ,
                resource: PermissionResource.PENALIZACION,
              },
            },
          ];

          const visibleBonusItems = bonusItems.filter((item) => {
            if (item.requiredPermissions) {
              return hasPermission(
                item.requiredPermissions.action,
                item.requiredPermissions.resource
              );
            }
            return false;
          });

          if (visibleBonusItems.length === 0) return null;

          return (
            <>
              <SidebarSeparator />
              <SidebarGroup>
                <SidebarGroupLabel>Bonos</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleBonusItems.map((item) => {
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
          );
        })()}

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
