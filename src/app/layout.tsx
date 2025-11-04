import type { Metadata } from "next";

import "./globals.css";
import { AuthProvider } from "@/AuthContext";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { RoleBasedRedirect } from "@/components/RoleBasedRedirect";
import { StructuredData } from "@/components/StructuredData";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { TRPCProvider } from "@/hooks/useTRPC";
import { GA_TRACKING_ID } from "@/lib/analytics";
import { defaultMetadata } from "@/lib/seo";

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
          rel="stylesheet"
        />
        {GA_TRACKING_ID && <GoogleAnalytics gaTrackingId={GA_TRACKING_ID} />}
        <StructuredData />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          enableColorScheme={false}
          forcedTheme="light"
        >
          <AuthProvider>
            <TRPCProvider>
              <RoleBasedRedirect>{children}</RoleBasedRedirect>
              <Toaster />
            </TRPCProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
