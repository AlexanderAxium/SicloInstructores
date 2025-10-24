"use client";

import { useAuthContext } from "@/AuthContext";
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
          {/* Sidebar with skeleton */}
          <div className="w-64 bg-primary h-screen p-4">
            <div className="space-y-4">
              {/* Logo skeleton */}
              <div className="h-8 bg-white/20 rounded animate-pulse" />

              {/* Navigation items skeleton */}
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
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
              <p className="text-muted-foreground">Cargando...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
