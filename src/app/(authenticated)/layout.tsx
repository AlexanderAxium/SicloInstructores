import ProtectedRoute from "@/components/ProtectedRoute";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "Platform",
  description: "Plataforma moderna de gestión administrativa.",
  keywords: ["platform", "gestión", "dashboard", "administración"],
});

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
