import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  hasRole,
} from "@/services/rbacService";
import type {
  PermissionAction,
  PermissionCheck,
  PermissionResource,
} from "@/types/rbac";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Create authentication middleware
 */
export function createAuthMiddleware() {
  return async (req: NextRequest) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session?.user) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      // Fetch user with tenantId from database
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          tenantId: true,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return { user };
    } catch (error) {
      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }
  };
}

/**
 * Create permission middleware
 */
export function createPermissionMiddleware(
  action: PermissionAction,
  resource: PermissionResource
) {
  return async (req: NextRequest) => {
    const authResult = await createAuthMiddleware()(req);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    try {
      if (!user.tenantId) {
        return NextResponse.json(
          { error: "User tenant not found" },
          { status: 400 }
        );
      }

      const userHasPermission = await hasPermission(
        user.id,
        action,
        resource,
        user.tenantId
      );

      if (!userHasPermission) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }

      return { user };
    } catch (error) {
      console.error("Permission check error:", error);
      return NextResponse.json(
        { error: "Permission check failed" },
        { status: 500 }
      );
    }
  };
}

/**
 * Create multi-permission middleware
 */
export function createMultiPermissionMiddleware(
  permissionChecks: PermissionCheck[],
  requireAll = false
) {
  return async (req: NextRequest) => {
    const authResult = await createAuthMiddleware()(req);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    try {
      if (!user.tenantId) {
        return NextResponse.json(
          { error: "User tenant not found" },
          { status: 400 }
        );
      }

      let hasPermission = false;

      if (requireAll) {
        hasPermission = await hasAllPermissions(
          user.id,
          permissionChecks,
          user.tenantId
        );
      } else {
        hasPermission = await hasAnyPermission(
          user.id,
          permissionChecks,
          user.tenantId
        );
      }

      if (!hasPermission) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }

      return { user };
    } catch (error) {
      console.error("Multi-permission check error:", error);
      return NextResponse.json(
        { error: "Permission check failed" },
        { status: 500 }
      );
    }
  };
}

/**
 * Create role middleware
 */
export function createRoleMiddleware(roleName: string) {
  return async (req: NextRequest) => {
    const authResult = await createAuthMiddleware()(req);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    try {
      if (!user.tenantId) {
        return NextResponse.json(
          { error: "User tenant not found" },
          { status: 400 }
        );
      }

      const userHasRole = await hasRole(user.id, roleName, user.tenantId);

      if (!userHasRole) {
        return NextResponse.json(
          { error: "Insufficient role permissions" },
          { status: 403 }
        );
      }

      return { user };
    } catch (error) {
      console.error("Role check error:", error);
      return NextResponse.json({ error: "Role check failed" }, { status: 500 });
    }
  };
}
