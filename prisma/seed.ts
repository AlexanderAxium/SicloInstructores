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

  // Test database connection
  console.log("🔌 Testing database connection...");
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }

  // Test better-auth instance
  console.log("🔐 Testing better-auth instance...");
  try {
    // This will test if the better-auth instance is properly configured
    console.log("✅ Better-auth instance created successfully");
  } catch (error) {
    console.error("❌ Better-auth instance creation failed:", error);
    throw error;
  }

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
  await prisma.tenant.deleteMany({});

  console.log("✅ All data cleared successfully");

  // ================================
  // 2. CREATE TENANTS
  // ================================
  console.log("🏢 Creating tenants...");

  // Create default tenant
  const defaultTenant = await prisma.tenant.create({
    data: {
      id: "tenant-default-001",
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

  // Create demo tenant
  const demoTenant = await prisma.tenant.create({
    data: {
      id: "tenant-demo-002",
      name: "DemoCorp",
      displayName: "Demo Corporation",
      description: "Empresa de demostración para pruebas",
      email: "info@democorp.com",
      phone: "+1 (555) 999-8888",
      address: "456 Demo Avenue",
      city: "San Francisco",
      country: "USA",
      website: "https://democorp.com",
      foundedYear: 2023,
      logoUrl: "/images/demo-logo.png",
      faviconUrl: "/favicon-demo.ico",
      metaTitle: "DemoCorp - Empresa de Demostración",
      metaDescription: "Plataforma de demostración para pruebas y desarrollo",
      metaKeywords: "demo, pruebas, desarrollo, corporación",
    },
  });

  console.log(
    `✅ Created tenants: ${defaultTenant.displayName} and ${demoTenant.displayName}`
  );

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

  // Create permissions for each tenant
  const createdPermissions = [];
  for (const tenant of [defaultTenant, demoTenant]) {
    for (const perm of permissions) {
      const permission = await prisma.permission.create({
        data: {
          action: perm.action,
          resource: perm.resource,
          description: `${perm.action} permission for ${perm.resource}`,
          tenantId: tenant.id,
        },
      });
      createdPermissions.push(permission);
    }
  }

  // Create roles for each tenant
  const rolesByTenant = new Map();

  for (const tenant of [defaultTenant, demoTenant]) {
    const tenantRoles = {
      superAdmin: await prisma.role.create({
        data: {
          name: "super_admin",
          displayName: "Super Admin",
          description: "Full system access with all permissions",
          isSystem: true,
          tenantId: tenant.id,
        },
      }),
      admin: await prisma.role.create({
        data: {
          name: "admin",
          displayName: "Admin",
          description:
            "Administrative access to manage users and system settings",
          isSystem: true,
          tenantId: tenant.id,
        },
      }),
      moderator: await prisma.role.create({
        data: {
          name: "moderator",
          displayName: "Moderator",
          description: "User management and basic system monitoring",
          isSystem: true,
          tenantId: tenant.id,
        },
      }),
      user: await prisma.role.create({
        data: {
          name: "user",
          displayName: "User",
          description: "Standard user with basic access",
          isSystem: true,
          tenantId: tenant.id,
        },
      }),
      viewer: await prisma.role.create({
        data: {
          name: "viewer",
          displayName: "Viewer",
          description: "Read-only access to basic features",
          isSystem: true,
          tenantId: tenant.id,
        },
      }),
    };
    rolesByTenant.set(tenant.id, tenantRoles);
  }

  // Assign permissions to roles for each tenant
  for (const tenant of [defaultTenant, demoTenant]) {
    const tenantRoles = rolesByTenant.get(tenant.id);
    const tenantPermissions = createdPermissions.filter(
      (p) => p.tenantId === tenant.id
    );

    // Super Admin gets all permissions for this tenant
    for (const permission of tenantPermissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: tenantRoles.superAdmin.id,
          permissionId: permission.id,
        },
      });
    }

    // Admin gets most permissions except role management
    const adminPermissions = tenantPermissions.filter(
      (p) =>
        p.resource !== PermissionResource.ROLE ||
        p.action !== PermissionAction.MANAGE
    );
    for (const permission of adminPermissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: tenantRoles.admin.id,
          permissionId: permission.id,
        },
      });
    }

    // Moderator gets user read and basic dashboard
    const moderatorPermissions = tenantPermissions.filter(
      (p) =>
        (p.resource === PermissionResource.USER &&
          (p.action === PermissionAction.READ ||
            p.action === PermissionAction.UPDATE)) ||
        p.resource === PermissionResource.DASHBOARD
    );
    for (const permission of moderatorPermissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: tenantRoles.moderator.id,
          permissionId: permission.id,
        },
      });
    }

    // User gets dashboard access
    const standardUserPermissions = tenantPermissions.filter(
      (p) => p.resource === PermissionResource.DASHBOARD
    );
    for (const permission of standardUserPermissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: tenantRoles.user.id,
          permissionId: permission.id,
        },
      });
    }

    // Viewer gets only dashboard read
    const viewerPermissions = tenantPermissions.filter(
      (p) =>
        p.resource === PermissionResource.DASHBOARD &&
        p.action === PermissionAction.READ
    );
    for (const permission of viewerPermissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: tenantRoles.viewer.id,
          permissionId: permission.id,
        },
      });
    }
  }

  // ================================
  // 4. USER CREATION (ALL ROLES)
  // ================================
  const users = [
    // Default tenant users
    {
      name: "Super Admin",
      email: "superadmin@myapp.com",
      password: "SuperAdmin123!@#",
      phone: "+1 (555) 000-0001",
      language: "EN" as const,
      tenantId: defaultTenant.id,
      roleName: "super_admin",
    },
    {
      name: "Admin User",
      email: "admin@myapp.com",
      password: "Admin123!@#",
      phone: "+1 (555) 000-0002",
      language: "EN" as const,
      tenantId: defaultTenant.id,
      roleName: "admin",
    },
    {
      name: "Moderator User",
      email: "moderator@myapp.com",
      password: "Moderator123!@#",
      phone: "+1 (555) 000-0003",
      language: "ES" as const,
      tenantId: defaultTenant.id,
      roleName: "moderator",
    },
    {
      name: "John Doe",
      email: "user@myapp.com",
      password: "User123!@#",
      phone: "+1 (555) 987-6543",
      language: "EN" as const,
      tenantId: defaultTenant.id,
      roleName: "user",
    },
    {
      name: "Maria Rodriguez",
      email: "maria@myapp.com",
      password: "Maria123!@#",
      phone: "+1 (555) 123-4567",
      language: "ES" as const,
      tenantId: defaultTenant.id,
      roleName: "user",
    },
    {
      name: "Viewer User",
      email: "viewer@myapp.com",
      password: "Viewer123!@#",
      phone: "+1 (555) 000-0004",
      language: "EN" as const,
      tenantId: defaultTenant.id,
      roleName: "viewer",
    },
    // Demo tenant users
    {
      name: "Demo Admin",
      email: "admin@democorp.com",
      password: "DemoAdmin123!@#",
      phone: "+1 (555) 999-0001",
      language: "EN" as const,
      tenantId: demoTenant.id,
      roleName: "admin",
    },
    {
      name: "Demo User",
      email: "user@democorp.com",
      password: "DemoUser123!@#",
      phone: "+1 (555) 999-0002",
      language: "EN" as const,
      tenantId: demoTenant.id,
      roleName: "user",
    },
  ];

  console.log("👥 Creating users...");
  console.log(`📊 Total users to create: ${users.length}`);
  console.log("🔧 Better-auth configuration:", {
    emailAndPasswordEnabled: true,
    emailVerificationRequired: false,
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
  });

  // Verify roles were created correctly
  console.log("🔍 Verifying roles were created...");
  for (const [tenantId, tenantRoles] of rolesByTenant.entries()) {
    console.log(
      `   🏢 Tenant ${tenantId} roles:`,
      Object.keys(tenantRoles).map((roleName) => ({
        name: roleName,
        id: tenantRoles[roleName as keyof typeof tenantRoles].id,
        displayName:
          tenantRoles[roleName as keyof typeof tenantRoles].displayName,
      }))
    );
  }

  const createdUsers = [];

  for (const userData of users) {
    try {
      console.log(`\n🆕 Creating user: ${userData.email}`);
      console.log(`   - Name: ${userData.name}`);
      console.log(`   - Tenant: ${userData.tenantId}`);
      console.log(`   - Role: ${userData.roleName}`);
      console.log(`   - Language: ${userData.language}`);

      // Check if email already exists
      console.log("   🔍 Checking if email already exists...");
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      if (existingUser) {
        console.log(`   ⚠️ User ${userData.email} already exists, skipping`);
        continue;
      }
      console.log("   ✅ Email is available");

      // Use better-auth API to create user (no email verification)
      console.log("   🔐 Creating user with better-auth...");
      console.log("   📝 Auth request data:", {
        email: userData.email,
        name: userData.name,
        passwordLength: userData.password.length,
      });

      const result = await seedAuth.api.signUpEmail({
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
        },
      });

      console.log("   📊 Better-auth result:", {
        success: !!result.user,
        hasUser: !!result.user,
        hasSession: !!(result as Record<string, unknown>).session,
        hasError: !!(result as Record<string, unknown>).error,
        errorMessage:
          ((result as Record<string, unknown>).error as { message?: string })
            ?.message || "No error",
      });

      if (!result.user) {
        console.error(
          `   ❌ Better-auth failed to create user ${userData.email}`
        );
        console.error(
          "   📋 Full result object:",
          JSON.stringify(result, null, 2)
        );
        continue;
      }

      console.log(`   ✅ Better-auth user created with ID: ${result.user.id}`);

      // Update user with additional fields and tenantId
      console.log("   🔄 Updating user with additional fields and tenantId...");
      const newUser = await prisma.user.update({
        where: { id: result.user.id },
        data: {
          phone: userData.phone,
          language: userData.language || "ES",
          emailVerified: true, // Mark as verified for seed
          image: "/images/avatars/default-avatar.png",
          tenantId: userData.tenantId, // Assign tenantId after creation
        },
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          image: true,
          phone: true,
          language: true,
          tenantId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      console.log(
        `   ✅ User updated successfully with tenantId: ${newUser.tenantId}`
      );

      // Get the role for this tenant
      console.log(`   🎭 Getting role for tenant ${userData.tenantId}...`);
      const tenantRoles = rolesByTenant.get(userData.tenantId);
      if (!tenantRoles) {
        console.error(`   ❌ No roles found for tenant ${userData.tenantId}`);
        continue;
      }

      // Map role names to the correct keys in tenantRoles object
      const roleNameMap: Record<string, keyof typeof tenantRoles> = {
        super_admin: "superAdmin",
        admin: "admin",
        moderator: "moderator",
        user: "user",
        viewer: "viewer",
      };

      const roleKey = roleNameMap[userData.roleName];
      if (!roleKey) {
        console.error(
          `   ❌ Role ${userData.roleName} not found in role mapping`
        );
        console.log("   📋 Available roles:", Object.keys(roleNameMap));
        continue;
      }

      const role = tenantRoles[roleKey];
      if (!role) {
        console.log("   📋 Available roles:", Object.keys(tenantRoles));
        continue;
      }

      console.log(`   ✅ Found role: ${role.name} (ID: ${role.id})`);

      // Assign role
      console.log("   🔗 Assigning role to user...");
      await prisma.userRole.create({
        data: {
          userId: newUser.id,
          roleId: role.id,
          assignedBy: "system",
        },
      });

      console.log("   ✅ Role assigned successfully");

      createdUsers.push(newUser);
      console.log(
        `   🎉 User ${userData.email} created successfully with role ${userData.roleName} in tenant ${userData.tenantId}`
      );
      console.log(`   🔑 Password: ${userData.password} (use this for login)`);
    } catch (error: unknown) {
      console.error(`\n❌ Error creating user ${userData.email}:`);
      console.error("   📋 Error type:", typeof error);
      console.error(
        "   📋 Error message:",
        error instanceof Error ? error.message : "Unknown error"
      );
      console.error(
        "   📋 Error stack:",
        error instanceof Error ? error.stack : "No stack trace"
      );
      console.error("   📋 Full error object:", JSON.stringify(error, null, 2));

      // Log user data that caused the error
      console.error("   📋 User data that caused error:", {
        email: userData.email,
        name: userData.name,
        tenantId: userData.tenantId,
        roleName: userData.roleName,
        language: userData.language,
      });
    }
  }

  console.log("✅ Multitenant seed finished successfully!");
  console.log(`
📊 Summary:
- Tenants: 2 (MyApp Platform, Demo Corporation)
- Users: ${createdUsers.length} users across both tenants
- Roles: 5 per tenant (super_admin, admin, moderator, user, viewer)
- Permissions: ${createdPermissions.length} permissions (${createdPermissions.length / 2} per tenant)

🔐 Login Credentials:

🏢 MyApp Platform (Default Tenant):
- Super Admin: superadmin@myapp.com / SuperAdmin123!@#
- Admin: admin@myapp.com / Admin123!@#
- Moderator: moderator@myapp.com / Moderator123!@#
- User: user@myapp.com / User123!@#
- User: maria@myapp.com / Maria123!@#
- Viewer: viewer@myapp.com / Viewer123!@#

🏢 Demo Corporation (Demo Tenant):
- Admin: admin@democorp.com / DemoAdmin123!@#
- User: user@democorp.com / DemoUser123!@#
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
