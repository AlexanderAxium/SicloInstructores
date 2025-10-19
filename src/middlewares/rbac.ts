import { hasAnyRole } from "@/services/rbacService";
import {
  PermissionAction,
  type PermissionCheck,
  PermissionResource,
} from "@/types/rbac";
import { type NextRequest, NextResponse } from "next/server";
import {
  createAuthMiddleware,
  createMultiPermissionMiddleware,
  createPermissionMiddleware,
  createRoleMiddleware,
} from "./authBase";

/**
 * RBAC middleware for Next.js API routes
 */
export function requirePermission(
  action: PermissionAction,
  resource: PermissionResource
) {
  return createPermissionMiddleware(action, resource);
}

/**
 * Require any of the specified permissions
 */
export function requireAnyPermission(permissionChecks: PermissionCheck[]) {
  return createMultiPermissionMiddleware(permissionChecks, false);
}

/**
 * Require all of the specified permissions
 */
export function requireAllPermissions(permissionChecks: PermissionCheck[]) {
  return createMultiPermissionMiddleware(permissionChecks, true);
}

/**
 * Require specific role
 */
export function requireRole(roleName: string) {
  return createRoleMiddleware(roleName);
}

/**
 * Require any of the specified roles
 */
export function requireAnyRole(roleNames: string[]) {
  return async (req: NextRequest) => {
    const authResult = await createAuthMiddleware()(req);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    try {
      const hasRole = await hasAnyRole(user.id, roleNames);

      if (!hasRole) {
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

/**
 * Require admin access
 */
export function requireAdmin() {
  return requireAnyRole(["super_admin", "admin"]);
}

/**
 * Require super admin access
 */
export function requireSuperAdmin() {
  return requireRole("super_admin");
}

/**
 * Require user management permissions
 */
export function requireUserManagement() {
  return requirePermission(PermissionAction.MANAGE, PermissionResource.USER);
}

/**
 * Require role management permissions
 */
export function requireRoleManagement() {
  return requirePermission(PermissionAction.MANAGE, PermissionResource.ROLE);
}

/**
 * Require dashboard access
 */
export function requireDashboardAccess() {
  return requirePermission(PermissionAction.READ, PermissionResource.DASHBOARD);
}
