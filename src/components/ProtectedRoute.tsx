"use client";

import { useAuthContext } from "@/AuthContext";
import { SidebarSkeleton } from "@/components/dashboard/SidebarSkeleton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { loading, isAuthenticated } = useAuthContext();
  const router = useRouter();
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

  if (loading || checkingInstructor) {
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

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
