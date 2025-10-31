"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useInstructorAuth } from "@/contexts/InstructorAuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface InstructorRouteGuardProps {
  children: React.ReactNode;
}

export function InstructorRouteGuard({ children }: InstructorRouteGuardProps) {
  const { isAuthenticated, isLoading } = useInstructorAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to signin
  }

  return <>{children}</>;
}
