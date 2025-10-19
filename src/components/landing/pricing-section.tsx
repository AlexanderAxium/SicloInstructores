"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const pricingPlans = [
    {
      name: "Básico",
      monthlyPrice: "$29",
      annualPrice: "$19",
      description: "Perfecto para usuarios individuales",
      features: [
        "Hasta 100 usuarios",
        "2 integraciones básicas",
        "Dashboard estándar",
        "Soporte por email",
        "Almacenamiento 1GB",
        "API básica",
      ],
      buttonText: "Comenzar",
      buttonClass:
        "bg-zinc-300 shadow-[0px_1px_1px_-0.5px_rgba(16,24,40,0.20)] outline outline-0.5 outline-[#1e29391f] outline-offset-[-0.5px] text-gray-800 text-shadow-[0px_1px_1px_rgba(16,24,40,0.08)] hover:bg-zinc-400",
    },
    {
      name: "Profesional",
      monthlyPrice: "$99",
      annualPrice: "$79",
      description: "Ideal para equipos pequeños",
      features: [
        "Hasta 1,000 usuarios",
        "10 integraciones",
        "Dashboard avanzado",
        "Soporte prioritario",
        "Almacenamiento 10GB",
        "Sistema RBAC básico",
        "Analytics avanzado",
        "API completa",
      ],
      buttonText: "Únete Ahora",
      buttonClass:
        "bg-primary-foreground shadow-[0px_1px_1px_-0.5px_rgba(16,24,40,0.20)] text-primary text-shadow-[0px_1px_1px_rgba(16,24,40,0.08)] hover:bg-primary-foreground/90",
      popular: true,
    },
    {
      name: "Empresarial",
      monthlyPrice: "$299",
      annualPrice: "$239",
      description: "Para organizaciones grandes",
      features: [
        "Usuarios ilimitados",
        "Integraciones ilimitadas",
        "Dashboard personalizado",
        "Soporte 24/7",
        "Almacenamiento ilimitado",
        "RBAC completo",
        "API personalizada",
        "White-label disponible",
        "SLA garantizado",
      ],
      buttonText: "Contactar Ventas",
      buttonClass:
        "bg-secondary shadow-[0px_1px_1px_-0.5px_rgba(16,24,40,0.20)] text-secondary-foreground text-shadow-[0px_1px_1px_rgba(16,24,40,0.08)] hover:bg-secondary/90",
    },
  ];

  return (
    <section className="w-full overflow-hidden flex flex-col justify-start items-center py-16 md:py-20 lg:py-24 bg-gradient-to-br from-[#131B2F] via-[#0F172A] to-[#1E293B] relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('/images/large-card-background.svg')] opacity-5 bg-cover bg-center" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          {/* Subtle accent line */}
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto mb-6 md:mb-8" />

          <h2 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-4 md:mb-6 tracking-tight">
            Planes para Cada
            <br />
            <span className="font-medium text-white">Tipo de Usuario</span>
          </h2>
          <p className="text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto font-light">
            Elige el plan que se adapte a tus necesidades, desde usuarios
            individuales hasta organizaciones profesionales y equipos grandes.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-12">
          <div className="p-1 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isAnnual
                  ? "bg-white text-gray-900 shadow-lg"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Anual
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                -20%
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isAnnual
                  ? "bg-white text-gray-900 shadow-lg"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Mensual
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-6 sm:p-8 rounded-2xl flex flex-col transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? "bg-gradient-to-br from-primary to-primary/80 shadow-2xl shadow-primary/25 border-2 border-primary/50"
                  : "bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    ⭐ Más Popular
                  </div>
                </div>
              )}

              {/* Plan name */}
              <div className="text-center mb-6">
                <h3
                  className={`text-2xl font-bold ${plan.popular ? "text-primary-foreground" : "text-white"}`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`mt-2 text-sm ${plan.popular ? "text-primary-foreground/80" : "text-gray-300"}`}
                >
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2">
                  <div
                    className={`relative text-5xl font-bold ${plan.popular ? "text-primary-foreground" : "text-white"}`}
                  >
                    <span className="invisible">
                      {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span
                      className="absolute inset-0 flex items-center justify-center transition-all duration-500"
                      style={{
                        opacity: isAnnual ? 1 : 0,
                        transform: `scale(${isAnnual ? 1 : 0.8})`,
                        filter: `blur(${isAnnual ? 0 : 4}px)`,
                      }}
                      aria-hidden={!isAnnual}
                    >
                      {plan.annualPrice}
                    </span>
                    <span
                      className="absolute inset-0 flex items-center justify-center transition-all duration-500"
                      style={{
                        opacity: !isAnnual ? 1 : 0,
                        transform: `scale(${!isAnnual ? 1 : 0.8})`,
                        filter: `blur(${!isAnnual ? 0 : 4}px)`,
                      }}
                      aria-hidden={isAnnual}
                    >
                      {plan.monthlyPrice}
                    </span>
                  </div>
                  <span
                    className={`text-lg ${plan.popular ? "text-primary-foreground/70" : "text-gray-300"}`}
                  >
                    /mes
                  </span>
                </div>
                {isAnnual && (
                  <p
                    className={`text-sm mt-2 ${plan.popular ? "text-primary-foreground/60" : "text-gray-400"}`}
                  >
                    Facturado anualmente
                  </p>
                )}
              </div>

              {/* CTA Button */}
              <div className="mb-8">
                <Link href="/signup" className="block">
                  <Button
                    className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 ${
                      plan.popular
                        ? "bg-white text-primary hover:bg-gray-100 shadow-lg"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              </div>

              {/* Features */}
              <div className="flex-1">
                <h4
                  className={`text-sm font-semibold mb-4 ${plan.popular ? "text-primary-foreground/80" : "text-gray-300"}`}
                >
                  {plan.name === "Inicial" ? "Incluye:" : "Todo lo anterior +"}
                </h4>
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          plan.popular
                            ? "bg-primary-foreground/20"
                            : "bg-primary/20"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${plan.popular ? "text-primary-foreground" : "text-primary"}`}
                          strokeWidth={2.5}
                        />
                      </div>
                      <span
                        className={`text-sm ${plan.popular ? "text-primary-foreground" : "text-gray-200"}`}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
