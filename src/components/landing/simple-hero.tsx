import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export function SimpleHero() {
  return (
    <section className="relative w-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Siclo
            <span className="text-primary block">Fitness Management</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            La plataforma completa para registrar clases, gestionar
            instructores, calcular pagos automáticos y generar reportes
            detallados para tu centro de fitness.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signin">
              <Button size="lg" className="px-8 py-3">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="#features">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-slate-900 px-8 py-3"
              >
                Ver Funcionalidades
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
