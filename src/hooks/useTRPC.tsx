"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import React, { useMemo } from "react";
import type { AppRouter } from "../server/routers/_app";

export const trpc = createTRPCReact<AppRouter>();

export const TRPCProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = React.useState(() => new QueryClient());

  const trpcClient = useMemo(() => {
    return trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          headers() {
            // Get instructor token from localStorage first (preferred for instructor routes)
            const instructorToken = localStorage.getItem("instructorToken");
            // Fall back to regular auth token if no instructor token
            const token = localStorage.getItem("auth_token");

            const tokenToUse = instructorToken || token;

            return {
              authorization: tokenToUse ? `Bearer ${tokenToUse}` : "",
            };
          },
        }),
      ],
    });
  }, []); // No dependencies needed

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};
