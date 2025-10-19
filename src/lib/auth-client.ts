import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    process.env.NODE_ENV === "production"
      ? process.env.SITE_URL || "https://myapp.example.com"
      : "http://localhost:3000",
});
