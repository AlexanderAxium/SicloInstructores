import { prisma } from "@/lib/db";
import type { PermissionCheck, RBACContext } from "@/types/rbac";
import {
  DEFAULT_ROLES,
  PermissionAction,
  PermissionResource,
} from "@/types/rbac";

// Use Prisma types directly
type Role = {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isActive: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  rolePermissions?: Array<{
    permission: {
      id: string;
      action: string;
      resource: string;
      description: string | null;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
  }>;
};

type Permission = {
  id: string;
  action: string;
  resource: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type UserRole = {
  id: string;
  userId: string;
  roleId: string;
  role: Role;
  assignedAt: Date;
  assignedBy: string | null;
  expiresAt: Date | null;
};

/**
 * Get all RBAC data for a user in a single optimized query
 */
export async function getUserRBACData(
  userId: string,
  tenantId: string
): Promise<{
  roles: Role[];
  permissions: Permission[];
}> {
  const userRoles = await prisma.userRole.findMany({
    where: {
      userId,
      role: {
        tenantId,
      },
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  const roles = userRoles.map((ur) => ur.role).filter((role) => role.isActive);
  const permissions = new Map<string, Permission>();

  roles.forEach((role) => {
    role.rolePermissions?.forEach((rp) => {
      if (rp.permission.isActive) {
        permissions.set(rp.permission.id, rp.permission);
      }
    });
  });

  return {
    roles: roles,
    permissions: Array.from(permissions.values()),
  };
}

/**
 * Get all roles for a user
 */
export async function getUserRoles(
  userId: string,
  tenantId: string
): Promise<Role[]> {
  const { roles } = await getUserRBACData(userId, tenantId);
  return roles;
}

/**
 * Get all permissions for a user (from their roles)
 */
export async function getUserPermissions(
  userId: string,
  tenantId: string
): Promise<Permission[]> {
  const { permissions } = await getUserRBACData(userId, tenantId);
  return permissions;
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  userId: string,
  action: PermissionAction,
  resource: PermissionResource,
  tenantId: string
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, tenantId);

  return permissions.some(
    (permission) =>
      permission.action === action.toString() &&
      permission.resource === resource.toString() &&
      permission.isActive
  );
}

/**
 * Check if user has any of the specified permissions
 */
export async function hasAnyPermission(
  userId: string,
  permissionChecks: PermissionCheck[],
  tenantId: string
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, tenantId);

  return permissionChecks.some((check) =>
    permissions.some(
      (permission) =>
        permission.action === check.action.toString() &&
        permission.resource === check.resource.toString() &&
        permission.isActive
    )
  );
}

/**
 * Check if user has all of the specified permissions
 */
export async function hasAllPermissions(
  userId: string,
  permissionChecks: PermissionCheck[],
  tenantId: string
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, tenantId);

  return permissionChecks.every((check) =>
    permissions.some(
      (permission) =>
        permission.action === check.action.toString() &&
        permission.resource === check.resource.toString() &&
        permission.isActive
    )
  );
}

/**
 * Check if user has a specific role
 */
export async function hasRole(
  userId: string,
  roleName: string,
  tenantId: string
): Promise<boolean> {
  const userRoles = await getUserRoles(userId, tenantId);
  return userRoles.some((role) => role.name === roleName && role.isActive);
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(
  userId: string,
  roleNames: string[],
  tenantId: string
): Promise<boolean> {
  const userRoles = await getUserRoles(userId, tenantId);
  return userRoles.some(
    (role) => roleNames.includes(role.name) && role.isActive
  );
}

/**
 * Get RBAC context for a user (optimized)
 */
export async function getRBACContext(
  userId: string,
  tenantId: string
): Promise<RBACContext> {
  const { roles, permissions } = await getUserRBACData(userId, tenantId);

  // Convert string enums to proper types
  const convertedPermissions = permissions.map((permission) => ({
    ...permission,
    action: permission.action as PermissionAction,
    resource: permission.resource as PermissionResource,
  }));

  return {
    userId,
    userRoles: roles,
    permissions: convertedPermissions,
  };
}

/**
 * Assign role to user
 */
export async function assignRole(
  userId: string,
  roleId: string,
  assignedBy?: string,
  expiresAt?: Date,
  _tenantId?: string
): Promise<UserRole> {
  return await prisma.userRole.create({
    data: {
      userId,
      roleId,
      assignedBy,
      expiresAt,
    },
    include: {
      role: true,
    },
  });
}

/**
 * Remove role from user
 */
export async function removeRole(
  userId: string,
  roleId: string,
  _tenantId?: string
): Promise<void> {
  await prisma.userRole.deleteMany({
    where: {
      userId,
      roleId,
    },
  });
}

/**
 * Create a new role
 */
export async function createRole(
  data: {
    name: string;
    displayName: string;
    description?: string;
    isSystem?: boolean;
  },
  tenantId: string
): Promise<Role> {
  return await prisma.role.create({
    data: {
      ...data,
      tenantId,
    },
  });
}

export async function updateRole(
  data: {
    id: string;
    name?: string;
    displayName?: string;
    description?: string;
    isSystem?: boolean;
  },
  tenantId: string
): Promise<Role> {
  return await prisma.role.update({
    where: {
      id: data.id,
      tenantId,
    },
    data: {
      name: data.name,
      displayName: data.displayName,
      description: data.description,
      isSystem: data.isSystem,
    },
  });
}

export async function deleteRole(
  id: string,
  tenantId: string
): Promise<boolean> {
  await prisma.role.delete({
    where: {
      id,
      tenantId,
    },
  });
  return true;
}

/**
 * Create a new permission
 */
export async function createPermission(
  data: {
    action: PermissionAction;
    resource: PermissionResource;
    description?: string;
  },
  tenantId: string
): Promise<Permission> {
  return await prisma.permission.create({
    data: {
      action: data.action.toString() as PermissionAction,
      resource: data.resource.toString() as PermissionResource,
      description: data.description,
      tenantId,
    },
  });
}

/**
 * Assign permission to role
 */
export async function assignPermissionToRole(
  roleId: string,
  permissionId: string,
  _tenantId?: string
): Promise<void> {
  await prisma.rolePermission.create({
    data: {
      roleId,
      permissionId,
    },
  });
}

/**
 * Remove permission from role
 */
export async function removePermissionFromRole(
  roleId: string,
  permissionId: string,
  _tenantId?: string
): Promise<void> {
  await prisma.rolePermission.deleteMany({
    where: {
      roleId,
      permissionId,
    },
  });
}

/**
 * Get all roles
 */
export async function getAllRoles(tenantId: string): Promise<Role[]> {
  return await prisma.role.findMany({
    where: {
      isActive: true,
      tenantId,
    },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Get all permissions
 */
export async function getAllPermissions(
  tenantId: string
): Promise<Permission[]> {
  return await prisma.permission.findMany({
    where: {
      isActive: true,
      tenantId,
    },
    orderBy: [{ resource: "asc" }, { action: "asc" }],
  });
}

/**
 * Get permissions for a specific role
 */
export async function getRolePermissions(roleId: string, tenantId?: string) {
  return await prisma.rolePermission.findMany({
    where: {
      roleId,
      role: {
        tenantId,
      },
    },
    include: {
      permission: true,
    },
    orderBy: {
      permission: {
        resource: "asc",
      },
    },
  });
}

/**
 * Get role by name
 */
export async function getRoleByName(
  name: string,
  tenantId: string
): Promise<Role | null> {
  return await prisma.role.findUnique({
    where: {
      name_tenantId: {
        name,
        tenantId,
      },
    },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });
}

/**
 * Get permission by action and resource
 */
export async function getPermissionByActionAndResource(
  action: PermissionAction,
  resource: PermissionResource,
  tenantId: string
): Promise<Permission | null> {
  return await prisma.permission.findUnique({
    where: {
      action_resource_tenantId: {
        action: action.toString() as PermissionAction,
        resource: resource.toString() as PermissionResource,
        tenantId,
      },
    },
  });
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(
  userId: string,
  tenantId: string
): Promise<boolean> {
  return await hasRole(userId, DEFAULT_ROLES.SUPER_ADMIN, tenantId);
}

/**
 * Check if user is admin
 */
export async function isAdmin(
  userId: string,
  tenantId: string
): Promise<boolean> {
  return await hasAnyRole(
    userId,
    [DEFAULT_ROLES.SUPER_ADMIN, DEFAULT_ROLES.ADMIN],
    tenantId
  );
}

/**
 * Check if user can manage users
 */
export async function canManageUsers(
  userId: string,
  tenantId: string
): Promise<boolean> {
  return await hasPermission(
    userId,
    PermissionAction.MANAGE,
    PermissionResource.USER,
    tenantId
  );
}

/**
 * Check if user can manage roles
 */
export async function canManageRoles(
  userId: string,
  tenantId: string
): Promise<boolean> {
  return await hasPermission(
    userId,
    PermissionAction.MANAGE,
    PermissionResource.ROLE,
    tenantId
  );
}

/**
 * Check if user can access admin panel
 */
export async function canAccessAdmin(
  userId: string,
  tenantId: string
): Promise<boolean> {
  return await hasPermission(
    userId,
    PermissionAction.MANAGE,
    PermissionResource.ADMIN,
    tenantId
  );
}

/**
 * Check if user can view dashboard
 */
export async function canViewDashboard(
  userId: string,
  tenantId: string
): Promise<boolean> {
  return await hasPermission(
    userId,
    PermissionAction.READ,
    PermissionResource.DASHBOARD,
    tenantId
  );
}
