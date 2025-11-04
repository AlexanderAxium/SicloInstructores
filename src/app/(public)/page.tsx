"use client";

import { useAuthContext } from "@/AuthContext";
import { SimpleFeatures } from "@/components/landing/simple-features";
import { SimpleHero } from "@/components/landing/simple-hero";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { loading, isAuthenticated } = useAuthContext();
  const { primaryRole, isLoading: roleLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Esperar a que termine la carga de autenticación y roles
    if (loading || roleLoading) {
      return;
    }

    // Verificar si el usuario está autenticado como instructor
    const instructorToken =
      typeof window !== "undefined"
        ? localStorage.getItem("instructorToken")
        : null;

    // Si hay token de instructor y no está autenticado como usuario regular
    if (instructorToken && !isAuthenticated) {
      router.push("/instructor");
      return;
    }

    // Si el usuario está autenticado como usuario regular
    if (isAuthenticated) {
      // Si tiene rol "user", redirigir a dashboard
      if (primaryRole === "user") {
        router.push("/dashboard");
        return;
      }
      // Para otros roles (admin, super_admin, viewer), también redirigir a dashboard
      if (primaryRole !== "unknown") {
        router.push("/dashboard");
        return;
      }
    }
  }, [loading, roleLoading, isAuthenticated, primaryRole, router]);

  // Si está cargando, mostrar loading
  if (loading || roleLoading) {
    return null;
  }

  // Si está autenticado, no mostrar el landing (estará siendo redirigido)
  if (isAuthenticated) {
    return null;
  }

  // Verificar si hay token de instructor
  if (typeof window !== "undefined") {
    const instructorToken = localStorage.getItem("instructorToken");
    if (instructorToken) {
      return null; // Estará siendo redirigido
    }
  }

  // Landing page simplificada (solo para usuarios no autenticados)
  return (
    <div className="min-h-screen bg-background">
      <SimpleHero />
      <SimpleFeatures />
    </div>
  );
}
