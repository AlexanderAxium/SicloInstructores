import Image from "next/image";

interface BentoCardProps {
  title: string;
  description: string;
  image: string;
}

const BentoCard = ({ title, description, image }: BentoCardProps) => (
  <div className="group overflow-hidden rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-all duration-300 flex flex-col justify-between h-full">
    <div className="p-4 sm:p-5 md:p-6 flex flex-col gap-3">
      <h3 className="text-foreground text-base sm:text-lg font-semibold leading-snug">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
        {description}
      </p>
    </div>
    <div className="relative h-48 sm:h-52 md:h-56 overflow-hidden">
      <Image
        src={image}
        alt={title}
        width={400}
        height={224}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>
  </div>
);

export function BentoSection() {
  const cards = [
    {
      title: "Análisis inteligente con IA",
      description:
        "Obtén sugerencias inteligentes en tiempo real para optimizar tu plataforma.",
      image: "/images/ai-code-reviews.png",
    },
    {
      title: "Vistas previas en tiempo real",
      description: "Chatea, colabora y previsualiza cambios al instante.",
      image: "/images/realtime-coding-previews.png",
    },
    {
      title: "Integraciones con un click",
      description:
        "Conecta fácilmente con tus herramientas favoritas y servicios externos.",
      image: "/images/one-click-integrations.png",
    },
    {
      title: "Conectividad flexible",
      description:
        "Gestiona y configura el acceso a servicios externos sin esfuerzo.",
      image: "/images/mcp-connectivity.png",
    },
    {
      title: "Automatización avanzada",
      description:
        "Resuelve problemas complejos más rápido con múltiples agentes IA.",
      image: "/images/parallel-coding-agents.png",
    },
    {
      title: "Despliegue simplificado",
      description: "Pasa de desarrollo a producción al instante.",
      image: "/images/deployment-easy.png",
    },
  ];

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-16 bg-gray-50/50 dark:bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          {/* Subtle accent line */}
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-6 md:mb-8" />

          <h2 className="text-foreground text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-4 md:mb-6 tracking-tight">
            Potencia tu
            <br />
            <span className="font-medium text-primary">Plataforma</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light">
            Plataforma profesional con sincronización en tiempo real,
            integraciones perfectas y análisis potentes para optimizar tu
            gestión.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {cards.map((card) => (
            <BentoCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
