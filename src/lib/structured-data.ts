export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MiApp",
    description:
      "Una plataforma moderna para gestionar proyectos, colaborar en equipo y alcanzar tus objetivos.",
    url: process.env.SITE_URL || "https://myapp.example.com",
    logo: `${process.env.SITE_URL || "https://myapp.example.com"}/logo.png`,
    sameAs: [
      // Agregar URLs de redes sociales cuando estén disponibles
      // "https://twitter.com/miapp",
      // "https://linkedin.com/company/miapp",
      // "https://facebook.com/miapp"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@miapp.com",
    },
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MiApp",
    description:
      "Una plataforma moderna para gestionar proyectos, colaborar en equipo y alcanzar tus objetivos.",
    url: process.env.SITE_URL!,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${process.env.SITE_URL!}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "MiApp",
    description:
      "Una plataforma moderna para gestionar proyectos, colaborar en equipo y alcanzar tus objetivos.",
    url: process.env.SITE_URL!,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
    },
  };
}
