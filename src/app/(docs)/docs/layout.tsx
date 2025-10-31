import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { DocsLayoutClient } from "./DocsLayoutClient";

export const metadata: Metadata = generateSEOMetadata({
  title: "Documentación - Siclo Instructores",
  description:
    "Documentación completa del sistema de gestión para instructores, clases y pagos.",
  keywords: ["documentación", "manual de usuario", "guía", "ayuda", "tutorial"],
});

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocsLayoutClient>{children}</DocsLayoutClient>;
}
