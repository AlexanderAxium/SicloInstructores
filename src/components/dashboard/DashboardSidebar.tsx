"use client";

import { useAuthContext } from "@/AuthContext";
import { useRBAC } from "@/hooks/useRBAC";
import {
  Briefcase,
  Building2,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  TrendingUp,
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

export function DashboardSidebar() {
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
          description: "Configuraciones del sistema",
        },
        {
          title: "Información de la Empresa",
          href: "/dashboard/company-info",
          icon: Building2,
          description: "Gestionar información de la empresa",
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
          description: "Ver configuraciones del sistema",
        },
      ];
    }

    // Usuario sin permisos específicos
    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <div className="w-64 bg-card shadow-md">
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center px-5 py-4 rounded-xl text-sm font-medium transition-all duration-200 text-card-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none border
                ${isActive ? "bg-background border-border" : "border-transparent"}
              `}
            >
              <item.icon className="mr-3 h-5 w-5 transition-colors duration-200 text-muted-foreground group-hover:text-accent-foreground" />
              <div className="flex-1">
                <div className="font-medium text-card-foreground">
                  {item.title}
                </div>
                <div className="text-xs text-muted-foreground font-normal">
                  {item.description}
                </div>
              </div>
              {item.badge && (
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4">
        <button
          type="button"
          onClick={() => signOut()}
          className="w-full flex items-center px-4 py-2 text-sm text-destructive hover:text-destructive-foreground hover:bg-destructive/10 rounded-lg transition-colors duration-200 focus:outline-none"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
