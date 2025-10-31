import { PrismaClient } from "@prisma/client";

type GlobalWithPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

const globalForPrisma = global as GlobalWithPrisma;

// Parse and enhance DATABASE_URL with pool configuration
function enhanceDatabaseUrl(url: string | undefined): string {
  if (!url) return "";

  // If URL already has query params, append pool params; otherwise add them
  const separator = url.includes("?") ? "&" : "?";

  // Add connection pool parameters to increase timeout and connection limit
  const poolParams = [
    "connection_limit=20", // Maximum number of connections in the pool
    "pool_timeout=30", // Timeout in seconds to wait for a connection
    "connect_timeout=30", // Timeout in seconds to establish a connection
  ].join("&");

  return `${url}${separator}${poolParams}`;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: enhanceDatabaseUrl(process.env.DATABASE_URL),
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Graceful shutdown
if (typeof process !== "undefined") {
  process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
