"use client";

import { useAuthContext } from "@/AuthContext";
import { SimpleFeatures } from "@/components/landing/simple-features";
import { SimpleHero } from "@/components/landing/simple-hero";

export default function HomePage() {
  const { loading } = useAuthContext();

  // Si está cargando, mostrar loading
  if (loading) {
    return null;
  }

  // Landing page simplificada
  return (
    <div className="min-h-screen bg-background">
      <SimpleHero />
      <SimpleFeatures />
    </div>
  );
}
