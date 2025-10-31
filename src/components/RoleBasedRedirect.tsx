"use client";

import { useAuthContext } from "@/AuthContext";
import { SidebarSkeleton } from "@/components/dashboard/SidebarSkeleton";
import { useUser } from "@/hooks/useUser";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export function RoleBasedRedirect({ children }: RoleBasedRedirectProps) {
  const _pathname = usePathname();
  const { isAuthenticated: _isAuthenticated, loading: authLoading } =
    useAuthContext();
  const { primaryRole: _primaryRole, isLoading: roleLoading } = useUser();

  useEffect(() => {
    // Temporarily disabled all redirections - allow free access to all routes
    // No redirections - allow access to all routes
    return;
  }, []);

  // Show loading state while determining role
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          <SidebarSkeleton />
          {/* Main content with spinner */}
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

  return <>{children}</>;
}
