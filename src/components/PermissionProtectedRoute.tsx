"use client";

import { useAuthContext } from "@/AuthContext";
import { SidebarSkeleton } from "@/components/dashboard/SidebarSkeleton";
import { useRBAC } from "@/hooks/useRBAC";
import type { PermissionAction, PermissionResource } from "@/types/rbac";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PermissionProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: {
    action: PermissionAction;
    resource: PermissionResource;
  };
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function PermissionProtectedRoute({
  children,
  requiredPermission,
  fallback,
  redirectTo = "/dashboard",
}: PermissionProtectedRouteProps) {
  const { loading, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const { hasPermission, isLoading: rbacLoading } = useRBAC();
  const [checkingInstructor, setCheckingInstructor] = useState(true);

  // Check if user is an instructor (only if NOT authenticated as regular user)
  useEffect(() => {
    // Wait for loading to finish before checking
    if (loading) {
      return;
    }

    const instructorToken = localStorage.getItem("instructorToken");

    // If user is authenticated as regular user, clear instructor token if exists
    if (isAuthenticated && instructorToken) {
      localStorage.removeItem("instructorToken");
      localStorage.removeItem("instructorData");
      setCheckingInstructor(false);
      return;
    }

    // Only redirect to instructor if:
    // 1. User is NOT authenticated as regular user (better-auth)
    // 2. AND has instructorToken in localStorage
    if (instructorToken && !isAuthenticated) {
      // User is an instructor (not a regular user), redirect to instructor page
      router.push("/instructor");
      return;
    }

    setCheckingInstructor(false);
  }, [router, isAuthenticated, loading]);

  useEffect(() => {
    if (!checkingInstructor && !loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router, checkingInstructor]);

  // Loading states
  if (loading || checkingInstructor || rbacLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          <SidebarSkeleton />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Check permission if required
  if (requiredPermission) {
    const hasRequiredPermission = hasPermission(
      requiredPermission.action,
      requiredPermission.resource
    );

    if (!hasRequiredPermission) {
      if (fallback) {
        return <>{fallback}</>;
      }

      // Redirect to dashboard if no permission
      useEffect(() => {
        router.push(redirectTo);
      }, [router, redirectTo]);

      return (
        <div className="min-h-screen bg-background">
          <div className="flex">
            <SidebarSkeleton />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">Acceso Denegado</h2>
                <p className="text-muted-foreground">
                  No tienes permisos para acceder a esta página.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
