"use client";

import { Building2, ExternalLink, Shield, Users } from "lucide-react";
import Link from "next/link";
import TenantInfo from "./TenantInfo";

interface AdminDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    tenantId?: string;
  } | null;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const adminSections = [
    {
      title: "Usuarios",
      description: "Gestionar usuarios del sistema",
      icon: <Users className="h-5 w-5" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/dashboard/users",
    },
    {
      title: "Roles y Permisos",
      description: "Configurar sistema RBAC",
      icon: <Shield className="h-5 w-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/dashboard/roles",
    },
    {
      title: "Información de la Empresa",
      description: "Gestionar datos de la empresa",
      icon: <Building2 className="h-5 w-5" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "/dashboard/company-info",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Panel de Administración
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Bienvenido, {user?.name || "Administrador"} - Gestiona el sistema
            completo
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium text-foreground">
            Super Admin
          </span>
        </div>
      </div>

      {/* Main Content - Vertical Layout */}
      <div className="space-y-6">
        {/* Tenant Information - Full Width */}
        {user?.tenantId && (
          <div className="w-full">
            <TenantInfo tenantId={user.tenantId} />
          </div>
        )}

        {/* Admin Sections - Grid below */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-border/80 hover:-translate-y-1"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start space-x-4 mb-4">
                  <div
                    className={`flex-shrink-0 rounded-xl p-3 ${section.bgColor}`}
                  >
                    <div className={section.color}>{section.icon}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-foreground/80 mb-1">
                      {section.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {section.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>Gestionar</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-border to-transparent group-hover:via-primary transition-all duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
