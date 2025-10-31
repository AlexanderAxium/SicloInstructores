import { Footer } from "@/components/Footer";
import GlobalNavbar from "@/components/GlobalNavbar";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = generateSEOMetadata({
  title: "Iniciar Sesión",
  description:
    "Accede a tu cuenta en MiApp para gestionar tus proyectos y colaborar con tu equipo.",
  keywords: ["iniciar sesión", "login", "acceso", "autenticación"],
});

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GlobalNavbar />
      {children}
      <Footer />
    </>
  );
}
