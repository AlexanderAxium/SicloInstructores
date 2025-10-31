import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { initTRPC } from "@trpc/server";

export interface Context {
  user?: {
    id: string;
    email: string;
    name: string;
    tenantId: string | null;
  };
  instructor?: {
    id: string;
    name: string;
    fullName: string | null;
    tenantId: string;
  };
  tenant?: {
    id: string;
    name: string;
    displayName: string;
  };
  rbac?: unknown;
}

export const createContext = async (opts: {
  req: Request;
}): Promise<Context> => {
  try {
    // First, check for instructor token in headers or cookies
    const authHeader = opts.req.headers.get("authorization");
    const instructorToken = authHeader?.replace("Bearer ", "");

    if (instructorToken) {
      // Decode the instructor token (simple base64 format: instructorId:timestamp)
      try {
        const decoded = Buffer.from(instructorToken, "base64").toString(
          "utf-8"
        );
        const [instructorId] = decoded.split(":");

        // Find the instructor
        const instructor = await prisma.instructor.findUnique({
          where: { id: instructorId },
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        });

        if (instructor) {
          return {
            instructor: {
              id: instructor.id,
              name: instructor.name,
              fullName: instructor.fullName,
              tenantId: instructor.tenantId,
            },
            tenant: instructor.tenant
              ? {
                  id: instructor.tenant.id,
                  name: instructor.tenant.name,
                  displayName: instructor.tenant.displayName,
                }
              : undefined,
          };
        }
      } catch (error) {
        // If token decoding fails, continue to check for session
        console.error("Error decoding instructor token:", error);
      }
    }

    // Get session from Better Auth using cookies
    const session = await auth.api.getSession({
      headers: opts.req.headers,
    });

    if (!session?.user) {
      return {};
    }

    // Get user with tenant information
    const userWithTenant = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            displayName: true,
          },
        },
      },
    });

    if (!userWithTenant) {
      return {};
    }

    return {
      user: {
        id: userWithTenant.id,
        email: userWithTenant.email,
        name: userWithTenant.name,
        tenantId: userWithTenant.tenantId,
      },
      tenant: userWithTenant.tenant
        ? {
            id: userWithTenant.tenant.id,
            name: userWithTenant.tenant.name,
            displayName: userWithTenant.tenant.displayName,
          }
        : undefined,
    };
  } catch (_error) {
    return {};
  }
};

export const t = initTRPC.context<Context>().create();
