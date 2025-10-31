export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Siclo Instructores",
    description:
      "Plataforma integral para la gestión de instructores y pagos de Siclo. Administra tus instructores, calcula pagos y gestiona toda la información financiera de manera eficiente.",
    url: process.env.SITE_URL || "https://siclo.axium.com.pe",
    logo: `${process.env.SITE_URL || "https://siclo.axium.com.pe"}/logo.png`,
    sameAs: [
      // Agregar URLs de redes sociales cuando estén disponibles
      // "https://twitter.com/siclo",
      // "https://linkedin.com/company/siclo",
      // "https://facebook.com/siclo"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@siclo.axium.com.pe",
    },
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Siclo Instructores",
    description:
      "Plataforma integral para la gestión de instructores y pagos de Siclo. Administra tus instructores, calcula pagos y gestiona toda la información financiera de manera eficiente.",
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
    name: "Siclo Instructores",
    description:
      "Plataforma integral para la gestión de instructores y pagos de Siclo. Administra tus instructores, calcula pagos y gestiona toda la información financiera de manera eficiente.",
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
