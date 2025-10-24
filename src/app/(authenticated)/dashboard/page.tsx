"use client";

import { useAuthContext } from "@/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import ViewerDashboard from "@/components/dashboard/ViewerDashboard";
import { useUser } from "@/hooks/useUser";
import type { AuthUser } from "@/types/user";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const {
    user,
    isSuperAdmin,
    isAdmin,
    hasRole,
    canViewDashboard,
    isLoading,
    userRoles,
    userPermissions,
  } = useUser();

  // Mostrar loading mientras se cargan los permisos y perfil
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          {/* Sidebar with skeleton */}
          <div className="w-64 bg-primary h-screen p-4">
            <div className="space-y-4">
              {/* Logo skeleton */}
              <div className="h-8 bg-white/20 rounded animate-pulse" />

              {/* Navigation items skeleton */}
              <div className="space-y-2">
                {Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={`nav-skeleton-${i}-${Date.now()}`}
                    className="flex items-center space-x-3"
                  >
                    <div className="h-4 w-4 bg-white/20 rounded animate-pulse" />
                    <div className="h-4 bg-white/20 rounded animate-pulse flex-1" />
                  </div>
                ))}
              </div>

              {/* User section skeleton */}
              <div className="mt-8 pt-4 border-t border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-white/20 rounded-full animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-3 bg-white/20 rounded animate-pulse w-20" />
                    <div className="h-3 bg-white/20 rounded animate-pulse w-16" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content with spinner */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verificar si el usuario tiene permisos para ver el dashboard
  if (!canViewDashboard && !isAdmin && !isSuperAdmin) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center max-w-2xl w-full">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Acceso Denegado
            </h1>
            <p className="text-muted-foreground mb-6">
              No tienes permisos para acceder al dashboard.
            </p>

            {/* Información del usuario */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6 text-left">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Información de tu cuenta
              </h3>

              <div className="space-y-4">
                {/* Tipo de usuario */}
                <div>
                  <span className="text-sm font-medium text-foreground">
                    Tipo de usuario:
                  </span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    Usuario estándar
                  </span>
                </div>

                {/* Estado de confirmación */}
                <div>
                  <span className="text-sm font-medium text-foreground">
                    Estado de cuenta:
                  </span>
                  <span
                    className={`ml-2 text-sm ${user?.emailVerified ? "text-green-600" : "text-red-600"}`}
                  >
                    {user?.emailVerified ? "Verificada" : "Sin verificar"}
                  </span>
                </div>

                {/* Roles asignados */}
                <div>
                  <span className="text-sm font-medium text-foreground">
                    Roles asignados:
                  </span>
                  <div className="mt-1">
                    {userRoles.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {userRoles.map((role) => (
                          <span
                            key={role.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {role.displayName || role.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        Sin roles asignados
                      </span>
                    )}
                  </div>
                </div>

                {/* Permisos disponibles */}
                <div>
                  <span className="text-sm font-medium text-foreground">
                    Permisos disponibles:
                  </span>
                  <div className="mt-1">
                    {userPermissions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {userPermissions.slice(0, 5).map((permission) => (
                          <span
                            key={permission.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            {permission.action} {permission.resource}
                          </span>
                        ))}
                        {userPermissions.length > 5 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            +{userPermissions.length - 5} más
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        Sin permisos asignados
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>¿Necesitas acceso?</strong> Contacta al administrador
                  del sistema para que te asigne los roles y permisos
                  necesarios.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Adapter function to convert user data to expected dashboard user format
  const adaptUserForDashboard = (userData: unknown) => {
    if (!userData || typeof userData !== "object") return null;

    const user = userData as Record<string, unknown>;
    return {
      id: user.id as string,
      name: user.name as string,
      email: user.email as string,
      emailVerified: user.emailVerified as boolean,
      tenantId: user.tenantId as string | undefined,
    };
  };

  // Renderizar el dashboard apropiado según el rol del usuario
  if (isSuperAdmin || isAdmin) {
    return (
      <ProtectedRoute>
        <AdminDashboard user={adaptUserForDashboard(user)} />
      </ProtectedRoute>
    );
  }

  if (hasRole("viewer")) {
    return (
      <ProtectedRoute>
        <ViewerDashboard user={adaptUserForDashboard(user)} />
      </ProtectedRoute>
    );
  }

  // Dashboard por defecto para usuarios sin rol específico
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              ¡Bienvenido, {user?.name || "Usuario"}!
            </h1>
            <p className="text-muted-foreground mb-8">
              Tu cuenta está siendo configurada. Contacta al administrador para
              asignar roles y permisos.
            </p>
            <div className="bg-card rounded-lg shadow-sm p-6 border border-border max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Estado de la Cuenta
              </h3>
              <p className="text-sm text-muted-foreground">
                {user?.emailVerified
                  ? "Tu cuenta está verificada y activa"
                  : "Tu cuenta necesita ser verificada. Revisa tu email."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
