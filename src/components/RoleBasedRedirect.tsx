"use client";

import { useAuthContext } from "@/AuthContext";
import { useUser } from "@/hooks/useUser";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export function RoleBasedRedirect({ children }: RoleBasedRedirectProps) {
  const pathname = usePathname();
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const { primaryRole, isLoading: roleLoading } = useUser();

  useEffect(() => {
    // Temporarily disabled all redirections - allow free access to all routes
    console.log("RoleBasedRedirect: All redirections disabled for debugging", {
      primaryRole,
      pathname,
      isAuthenticated,
      authLoading,
      roleLoading,
    });

    // No redirections - allow access to all routes
    return;
  }, [primaryRole, pathname, isAuthenticated, authLoading, roleLoading]);

  // Show loading state while determining role
  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
