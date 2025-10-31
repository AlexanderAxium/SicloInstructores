import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentación - Siclo Instructores",
  description:
    "Documentación completa del sistema de gestión para instructores, clases y pagos.",
};

export default function DocsGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
