import type { Metadata } from "next";

export const defaultMetadata: Metadata = {
  title: {
    default: "MiApp - Plataforma de Productividad",
    template: "%s | MiApp",
  },
  description:
    "Una plataforma moderna para gestionar proyectos, colaborar en equipo y alcanzar tus objetivos con herramientas diseñadas para el éxito.",
  keywords: [
    "productividad",
    "gestión de proyectos",
    "colaboración",
    "equipo",
    "objetivos",
    "herramientas",
    "plataforma",
  ],
  authors: [{ name: "MiApp Team" }],
  creator: "MiApp",
  publisher: "MiApp",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.SITE_URL || "https://myapp.example.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: process.env.SITE_URL || "https://myapp.example.com",
    title: "MiApp - Plataforma de Productividad",
    description:
      "Una plataforma moderna para gestionar proyectos, colaborar en equipo y alcanzar tus objetivos.",
    siteName: "MiApp",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MiApp - Plataforma de Productividad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MiApp - Plataforma de Productividad",
    description:
      "Una plataforma moderna para gestionar proyectos, colaborar en equipo y alcanzar tus objetivos.",
    images: ["/og-image.jpg"],
    creator: "@miapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },
};

export function generateMetadata({
  title,
  description,
  keywords,
  image,
}: {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
}): Metadata {
  return {
    title: title ? `${title} | MiApp` : defaultMetadata.title,
    description: description || defaultMetadata.description,
    keywords: keywords || defaultMetadata.keywords,
    openGraph: {
      ...defaultMetadata.openGraph,
      title: title || defaultMetadata.openGraph?.title,
      description: description || defaultMetadata.openGraph?.description,
      images: image ? [{ url: image }] : defaultMetadata.openGraph?.images,
    },
    twitter: {
      ...defaultMetadata.twitter,
      title: title || defaultMetadata.twitter?.title,
      description: description || defaultMetadata.twitter?.description,
      images: image ? [image] : defaultMetadata.twitter?.images,
    },
  };
}
