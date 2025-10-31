import type { Metadata } from "next";

export const defaultMetadata: Metadata = {
  title: {
    default: "Siclo Instructores - Gestión de Pago",
    template: "%s | Siclo Instructores",
  },
  description:
    "Plataforma integral para la gestión de instructores y pagos de Siclo. Administra tus instructores, calcula pagos y gestiona toda la información financiera de manera eficiente.",
  keywords: [
    "siclo",
    "instructores",
    "gestión de pago",
    "pagos",
    "administración",
    "plataforma",
    "calculadora de pagos",
    "gestión financiera",
  ],
  authors: [{ name: "Siclo Team" }],
  creator: "Siclo",
  publisher: "Siclo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.SITE_URL || "https://siclo.axium.com.pe"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: process.env.SITE_URL || "https://siclo.axium.com.pe",
    title: "Siclo Instructores - Gestión de Pago",
    description:
      "Plataforma integral para la gestión de instructores y pagos de Siclo. Administra tus instructores, calcula pagos y gestiona toda la información financiera de manera eficiente.",
    siteName: "Siclo Instructores",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Siclo Instructores - Gestión de Pago",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Siclo Instructores - Gestión de Pago",
    description:
      "Plataforma integral para la gestión de instructores y pagos de Siclo. Administra tus instructores, calcula pagos y gestiona toda la información financiera de manera eficiente.",
    images: ["/og-image.jpg"],
    creator: "@siclo",
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
    title: title ? `${title} | Siclo Instructores` : defaultMetadata.title,
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
