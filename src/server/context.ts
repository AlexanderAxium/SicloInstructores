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
