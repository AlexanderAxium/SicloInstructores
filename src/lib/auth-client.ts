import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.SITE_URL || "https://siclo.axium.com.pe"
      : "http://localhost:3000",
});
