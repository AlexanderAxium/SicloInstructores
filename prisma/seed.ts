import {
  PermissionAction,
  PermissionResource,
  PrismaClient,
} from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const prisma = new PrismaClient();

// Create a better-auth instance for seed that doesn't send emails
const seedAuth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disable email verification for seed
  },
  emailVerification: {
    sendOnSignUp: false, // Don't send emails during seed
    autoSignInAfterVerification: true,
  },
  session: {
    strategy: "jwt",
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  logger: {
    level: "error", // Reduce logging during seed
  },
});

async function main() {
  console.log("🌱 Starting reduced seed process...");

  // ================================
  // 1. CLEAR ALL DATA
  // ================================
  console.log("🗑️ Clearing all existing data...");

  await prisma.userRole.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.verification.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.companyInfo.deleteMany({});

  console.log("✅ All data cleared successfully");

  // ================================
  // 2. COMPANY INFORMATION
  // ================================
  console.log("📋 Creating company information...");
  await prisma.companyInfo.create({
    data: {
      id: "company-default-001",
      name: "MyApp",
      displayName: "My Application Platform",
      description:
        "Una plataforma moderna y escalable para gestión de usuarios y contenido",
      email: "info@myapp.com",
      phone: "+1 (555) 123-4567",
      address: "123 Business Street",
      city: "New York",
      country: "USA",
      website: "https://myapp.com",
      facebookUrl: "https://facebook.com/myapp",
      twitterUrl: "https://twitter.com/myapp",
      instagramUrl: "https://instagram.com/myapp",
      linkedinUrl: "https://linkedin.com/company/myapp",
      youtubeUrl: "https://youtube.com/myapp",
      foundedYear: 2024,
      logoUrl: "/images/logo.png",
      faviconUrl: "/favicon.ico",
      metaTitle: "MyApp - Plataforma de Gestión Moderna",
      metaDescription:
        "Gestiona usuarios, contenido y configura tu plataforma de manera eficiente",
      metaKeywords: "gestión, usuarios, plataforma, moderno, escalable",
      termsUrl: "/terms",
      privacyUrl: "/privacy",
      cookiesUrl: "/cookies",
      complaintsUrl: "/complaints",
    },
  });

  // ================================
  // 3. ROLES AND PERMISSIONS
  // ================================
  console.log("👥 Creating roles and permissions...");

  // Create all permissions
  const permissions = [
    // Dashboard permissions
    { action: PermissionAction.READ, resource: PermissionResource.DASHBOARD },

    // User management permissions
    { action: PermissionAction.CREATE, resource: PermissionResource.USER },
    { action: PermissionAction.READ, resource: PermissionResource.USER },
    { action: PermissionAction.UPDATE, resource: PermissionResource.USER },
    { action: PermissionAction.DELETE, resource: PermissionResource.USER },
    { action: PermissionAction.MANAGE, resource: PermissionResource.USER },

    // Role management permissions
    { action: PermissionAction.CREATE, resource: PermissionResource.ROLE },
    { action: PermissionAction.READ, resource: PermissionResource.ROLE },
    { action: PermissionAction.UPDATE, resource: PermissionResource.ROLE },
    { action: PermissionAction.DELETE, resource: PermissionResource.ROLE },
    { action: PermissionAction.MANAGE, resource: PermissionResource.ROLE },

    // Permission management
    {
      action: PermissionAction.CREATE,
      resource: PermissionResource.PERMISSION,
    },
    { action: PermissionAction.READ, resource: PermissionResource.PERMISSION },
    {
      action: PermissionAction.UPDATE,
      resource: PermissionResource.PERMISSION,
    },
    {
      action: PermissionAction.DELETE,
      resource: PermissionResource.PERMISSION,
    },
    {
      action: PermissionAction.MANAGE,
      resource: PermissionResource.PERMISSION,
    },

    // Admin permissions
    { action: PermissionAction.READ, resource: PermissionResource.ADMIN },
    { action: PermissionAction.MANAGE, resource: PermissionResource.ADMIN },
  ];

  const createdPermissions = [];
  for (const perm of permissions) {
    const permission = await prisma.permission.create({
      data: {
        action: perm.action,
        resource: perm.resource,
        description: `${perm.action} permission for ${perm.resource}`,
      },
    });
    createdPermissions.push(permission);
  }

  // Create roles
  const superAdminRole = await prisma.role.create({
    data: {
      name: "super_admin",
      displayName: "Super Admin",
      description: "Full system access with all permissions",
      isSystem: true,
    },
  });

  const adminRole = await prisma.role.create({
    data: {
      name: "admin",
      displayName: "Admin",
      description: "Administrative access to manage users and system settings",
      isSystem: true,
    },
  });

  const moderatorRole = await prisma.role.create({
    data: {
      name: "moderator",
      displayName: "Moderator",
      description: "User management and basic system monitoring",
      isSystem: true,
    },
  });

  const userRole = await prisma.role.create({
    data: {
      name: "user",
      displayName: "User",
      description: "Standard user with basic access",
      isSystem: true,
    },
  });

  const viewerRole = await prisma.role.create({
    data: {
      name: "viewer",
      displayName: "Viewer",
      description: "Read-only access to basic features",
      isSystem: true,
    },
  });

  // Assign permissions to roles

  // Super Admin gets all permissions
  for (const permission of createdPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Admin gets most permissions except role management
  const adminPermissions = createdPermissions.filter(
    (p) =>
      p.resource !== PermissionResource.ROLE ||
      p.action !== PermissionAction.MANAGE
  );
  for (const permission of adminPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Moderator gets user read and basic dashboard
  const moderatorPermissions = createdPermissions.filter(
    (p) =>
      (p.resource === PermissionResource.USER &&
        (p.action === PermissionAction.READ ||
          p.action === PermissionAction.UPDATE)) ||
      p.resource === PermissionResource.DASHBOARD
  );
  for (const permission of moderatorPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: moderatorRole.id,
        permissionId: permission.id,
      },
    });
  }

  // User gets dashboard access
  const standardUserPermissions = createdPermissions.filter(
    (p) => p.resource === PermissionResource.DASHBOARD
  );
  for (const permission of standardUserPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: userRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Viewer gets only dashboard read
  const viewerPermissions = createdPermissions.filter(
    (p) =>
      p.resource === PermissionResource.DASHBOARD &&
      p.action === PermissionAction.READ
  );
  for (const permission of viewerPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: viewerRole.id,
        permissionId: permission.id,
      },
    });
  }

  // ================================
  // 4. USER CREATION (ALL ROLES)
  // ================================
  console.log("👥 Creating users...");

  const users = [
    {
      name: "Super Admin",
      email: "superadmin@myapp.com",
      password: "SuperAdmin123!@#",
      phone: "+1 (555) 000-0001",
      language: "EN" as const,
      role: superAdminRole,
    },
    {
      name: "Admin User",
      email: "admin@myapp.com",
      password: "Admin123!@#",
      phone: "+1 (555) 000-0002",
      language: "EN" as const,
      role: adminRole,
    },
    {
      name: "Moderator User",
      email: "moderator@myapp.com",
      password: "Moderator123!@#",
      phone: "+1 (555) 000-0003",
      language: "ES" as const,
      role: moderatorRole,
    },
    {
      name: "John Doe",
      email: "user@myapp.com",
      password: "User123!@#",
      phone: "+1 (555) 987-6543",
      language: "EN" as const,
      role: userRole,
    },
    {
      name: "Maria Rodriguez",
      email: "maria@myapp.com",
      password: "Maria123!@#",
      phone: "+1 (555) 123-4567",
      language: "ES" as const,
      role: userRole,
    },
    {
      name: "Viewer User",
      email: "viewer@myapp.com",
      password: "Viewer123!@#",
      phone: "+1 (555) 000-0004",
      language: "EN" as const,
      role: viewerRole,
    },
  ];

  const createdUsers = [];

  for (const userData of users) {
    try {
      console.log(`🆕 Creating user: ${userData.email}`);

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      if (existingUser) {
        console.log(`⚠️ User ${userData.email} already exists, skipping`);
        continue;
      }

      // Use seed better-auth API to create user (no email verification)
      const result = await seedAuth.api.signUpEmail({
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
        },
      });

      if (!result.user) {
        console.error(`❌ Failed to create user ${userData.email}`);
        continue;
      }

      // Update additional fields and mark as verified
      const newUser = await prisma.user.update({
        where: { id: result.user.id },
        data: {
          phone: userData.phone,
          language: userData.language || "ES",
          emailVerified: true, // Mark as verified for seed
          image: "/images/avatars/default-avatar.png",
        },
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          image: true,
          phone: true,
          language: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Assign role
      await prisma.userRole.create({
        data: {
          userId: newUser.id,
          roleId: userData.role.id,
          assignedBy: "system",
        },
      });

      createdUsers.push(newUser);
      console.log(
        `✅ User ${userData.email} created with role ${userData.role.name}`
      );
      console.log(`   Password: ${userData.password} (use this for login)`);
    } catch (error: unknown) {
      console.error(
        `❌ Error creating user ${userData.email}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  console.log("✅ Reduced seed finished successfully!");
  console.log(`
📊 Summary:
- Company: MyApp Platform
- Users: ${createdUsers.length} users
- Roles: 5 (super_admin, admin, moderator, user, viewer)
- Permissions: ${createdPermissions.length} permissions

🔐 Login Credentials:
- Super Admin: superadmin@myapp.com / SuperAdmin123!@#
- Admin: admin@myapp.com / Admin123!@#
- Moderator: moderator@myapp.com / Moderator123!@#
- User: user@myapp.com / User123!@#
- User: maria@myapp.com / Maria123!@#
- Viewer: viewer@myapp.com / Viewer123!@#
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
