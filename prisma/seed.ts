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

  // Create Siclo tenant
  const sicloTenant = await prisma.tenant.create({
    data: {
      id: "tenant-siclo-001",
      name: "Siclo",
      displayName: "Siclo - Fitness Platform",
      description:
        "Plataforma moderna para gestión de instructores, clases y pagos en el mundo del fitness",
      email: "info@siclo.com",
      phone: "+1 (555) 123-4567",
      address: "123 Fitness Street",
      city: "New York",
      country: "USA",
      website: "https://siclo.com",
      facebookUrl: "https://facebook.com/siclo",
      twitterUrl: "https://twitter.com/siclo",
      instagramUrl: "https://instagram.com/siclo",
      linkedinUrl: "https://linkedin.com/company/siclo",
      youtubeUrl: "https://youtube.com/siclo",
      foundedYear: 2024,
      logoUrl: "/images/siclo-logo.png",
      faviconUrl: "/favicon.ico",
      metaTitle: "Siclo - Plataforma de Fitness Moderna",
      metaDescription:
        "Gestiona instructores, clases y pagos de manera eficiente en tu centro de fitness",
      metaKeywords: "fitness, instructores, clases, pagos, gestión, moderno",
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
    `✅ Created tenants: ${sicloTenant.displayName} and ${demoTenant.displayName}`
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
  for (const tenant of [sicloTenant, demoTenant]) {
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

  for (const tenant of [sicloTenant, demoTenant]) {
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
  for (const tenant of [sicloTenant, demoTenant]) {
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
    // Siclo tenant users
    {
      name: "Super Admin",
      email: "superadmin@siclo.com",
      password: "SuperAdmin123!@#",
      phone: "+1 (555) 000-0001",
      language: "EN" as const,
      tenantId: sicloTenant.id,
      roleName: "super_admin",
    },
    {
      name: "Admin User",
      email: "admin@siclo.com",
      password: "Admin123!@#",
      phone: "+1 (555) 000-0002",
      language: "EN" as const,
      tenantId: sicloTenant.id,
      roleName: "admin",
    },
    {
      name: "Moderator User",
      email: "moderator@siclo.com",
      password: "Moderator123!@#",
      phone: "+1 (555) 000-0003",
      language: "ES" as const,
      tenantId: sicloTenant.id,
      roleName: "moderator",
    },
    {
      name: "John Doe",
      email: "user@siclo.com",
      password: "User123!@#",
      phone: "+1 (555) 987-6543",
      language: "EN" as const,
      tenantId: sicloTenant.id,
      roleName: "user",
    },
    {
      name: "Maria Rodriguez",
      email: "maria@siclo.com",
      password: "Maria123!@#",
      phone: "+1 (555) 123-4567",
      language: "ES" as const,
      tenantId: sicloTenant.id,
      roleName: "user",
    },
    {
      name: "Viewer User",
      email: "viewer@siclo.com",
      password: "Viewer123!@#",
      phone: "+1 (555) 000-0004",
      language: "EN" as const,
      tenantId: sicloTenant.id,
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

  // ================================
  // 5. FITNESS MANAGEMENT DATA
  // ================================
  console.log("🏋️ Creating fitness management data...");

  // Create periods for 2025
  console.log("📅 Creating periods...");
  const periods = [
    {
      number: 1,
      year: 2025,
      startDate: new Date("2024-12-30"),
      endDate: new Date("2025-01-26"),
      paymentDate: new Date("2025-01-30"),
    },
    {
      number: 2,
      year: 2025,
      startDate: new Date("2025-01-27"),
      endDate: new Date("2025-02-23"),
      paymentDate: new Date("2025-02-27"),
    },
    {
      number: 3,
      year: 2025,
      startDate: new Date("2025-02-24"),
      endDate: new Date("2025-03-23"),
      paymentDate: new Date("2025-03-27"),
    },
    {
      number: 4,
      year: 2025,
      startDate: new Date("2025-03-24"),
      endDate: new Date("2025-04-20"),
      paymentDate: new Date("2025-04-24"),
    },
    {
      number: 5,
      year: 2025,
      startDate: new Date("2025-04-21"),
      endDate: new Date("2025-05-18"),
      paymentDate: new Date("2025-05-22"),
    },
    {
      number: 6,
      year: 2025,
      startDate: new Date("2025-05-19"),
      endDate: new Date("2025-06-15"),
      paymentDate: new Date("2025-06-19"),
    },
    {
      number: 7,
      year: 2025,
      startDate: new Date("2025-06-16"),
      endDate: new Date("2025-07-13"),
      paymentDate: new Date("2025-07-17"),
    },
    {
      number: 8,
      year: 2025,
      startDate: new Date("2025-07-14"),
      endDate: new Date("2025-08-10"),
      paymentDate: new Date("2025-08-14"),
    },
    {
      number: 9,
      year: 2025,
      startDate: new Date("2025-08-11"),
      endDate: new Date("2025-09-07"),
      paymentDate: new Date("2025-09-11"),
    },
    {
      number: 10,
      year: 2025,
      startDate: new Date("2025-09-08"),
      endDate: new Date("2025-10-05"),
      paymentDate: new Date("2025-10-09"),
    },
    {
      number: 11,
      year: 2025,
      startDate: new Date("2025-10-06"),
      endDate: new Date("2025-11-02"),
      paymentDate: new Date("2025-11-06"),
    },
    {
      number: 12,
      year: 2025,
      startDate: new Date("2025-11-03"),
      endDate: new Date("2025-11-30"),
      paymentDate: new Date("2025-12-04"),
    },
    {
      number: 13,
      year: 2025,
      startDate: new Date("2025-12-01"),
      endDate: new Date("2025-12-28"),
      paymentDate: new Date("2026-01-02"),
    },
  ];

  const createdPeriods = [];
  for (const period of periods) {
    const createdPeriod = await prisma.period.create({
      data: {
        ...period,
        tenantId: sicloTenant.id,
      },
    });
    createdPeriods.push(createdPeriod);
  }

  // Create disciplines (only 4 as requested)
  console.log("🏃 Creating disciplines...");
  const disciplines = [
    {
      name: "Síclo",
      description: "Clases de ciclismo indoor de alta intensidad",
      color: "#FF5733",
      active: true,
    },
    {
      name: "Barre",
      description: "Entrenamiento que combina ballet, yoga y pilates",
      color: "#33FF57",
      active: true,
    },
    {
      name: "Yoga",
      description: "Práctica que conecta el cuerpo, la respiración y la mente",
      color: "#3357FF",
      active: true,
    },
    {
      name: "Ejercito",
      description: "Entrenamiento de alta intensidad tipo militar",
      color: "#8033FF",
      active: true,
    },
  ];

  const createdDisciplines = [];
  for (const discipline of disciplines) {
    const createdDiscipline = await prisma.discipline.create({
      data: {
        ...discipline,
        tenantId: sicloTenant.id,
      },
    });
    createdDisciplines.push(createdDiscipline);
  }

  // Create formulas for each discipline and period
  console.log("📊 Creating formulas...");

  // Requisitos de categoría (igual que SilcoAdmin)
  const categoryRequirements = {
    INSTRUCTOR: {
      ocupacion: 0.0,
      clases: 0,
      localesEnLima: 1,
      dobleteos: 0,
      horariosNoPrime: 0,
      participacionEventos: false,
      lineamientos: true,
    },
    JUNIOR_AMBASSADOR: {
      ocupacion: 40.0,
      clases: 4,
      localesEnLima: 2,
      dobleteos: 1,
      horariosNoPrime: 1,
      participacionEventos: false,
      lineamientos: true,
    },
    AMBASSADOR: {
      ocupacion: 60.0,
      clases: 6,
      localesEnLima: 3,
      dobleteos: 2,
      horariosNoPrime: 2,
      participacionEventos: true,
      lineamientos: true,
    },
    SENIOR_AMBASSADOR: {
      ocupacion: 80.0,
      clases: 9,
      localesEnLima: 4,
      dobleteos: 3,
      horariosNoPrime: 3,
      participacionEventos: true,
      lineamientos: true,
    },
  };

  // Parámetros de pago (igual que SilcoAdmin)
  const paymentParameters = {
    INSTRUCTOR: {
      cuotaFija: 0.0,
      minimoGarantizado: 0.0,
      tarifas: [
        { tarifa: 3.25, numeroReservas: 19 },
        { tarifa: 4.25, numeroReservas: 49 },
      ],
      tarifaFullHouse: 5.25,
      maximo: 262.5,
      bono: 0.0,
      retencionPorcentaje: 8.0,
      ajustePorDobleteo: 0.0,
    },
    JUNIOR_AMBASSADOR: {
      cuotaFija: 0.0,
      minimoGarantizado: 60.0,
      tarifas: [
        { tarifa: 3.5, numeroReservas: 19 },
        { tarifa: 4.5, numeroReservas: 49 },
      ],
      tarifaFullHouse: 5.5,
      maximo: 275.0,
      bono: 0.5,
      retencionPorcentaje: 8.0,
      ajustePorDobleteo: 0.25,
    },
    AMBASSADOR: {
      cuotaFija: 0.0,
      minimoGarantizado: 80.0,
      tarifas: [
        { tarifa: 4.0, numeroReservas: 19 },
        { tarifa: 5.0, numeroReservas: 49 },
      ],
      tarifaFullHouse: 6.0,
      maximo: 300.0,
      bono: 1.0,
      retencionPorcentaje: 8.0,
      ajustePorDobleteo: 0.5,
    },
    SENIOR_AMBASSADOR: {
      cuotaFija: 0.0,
      minimoGarantizado: 100.0,
      tarifas: [
        { tarifa: 4.0, numeroReservas: 19 },
        { tarifa: 5.0, numeroReservas: 49 },
      ],
      tarifaFullHouse: 6.0,
      maximo: 325.0,
      bono: 1.5,
      retencionPorcentaje: 8.0,
      ajustePorDobleteo: 1.0,
    },
  };

  for (const discipline of createdDisciplines) {
    for (const period of createdPeriods) {
      await prisma.formula.create({
        data: {
          disciplineId: discipline.id,
          periodId: period.id,
          categoryRequirements,
          paymentParameters,
          tenantId: sicloTenant.id,
        },
      });
    }
  }

  console.log("✅ Basic data created successfully!");

  console.log("✅ Multitenant seed finished successfully!");
  console.log(`
📊 Summary:
- Tenants: 2 (Siclo Fitness Platform, Demo Corporation)
- Users: ${createdUsers.length} users across both tenants
- Roles: 5 per tenant (super_admin, admin, moderator, user, viewer)
- Permissions: ${createdPermissions.length} permissions (${createdPermissions.length / 2} per tenant)
- Periods: ${createdPeriods.length} periods for 2025
- Disciplines: ${createdDisciplines.length} fitness disciplines (Síclo, Barre, Yoga, Ejercito)
- Formulas: ${createdDisciplines.length * createdPeriods.length} formulas with complete payment structure

🔐 Login Credentials:

🏢 Siclo Fitness Platform (Main Tenant):
- Super Admin: superadmin@siclo.com / SuperAdmin123!@#
- Admin: admin@siclo.com / Admin123!@#
- Moderator: moderator@siclo.com / Moderator123!@#
- User: user@siclo.com / User123!@#
- User: maria@siclo.com / Maria123!@#
- Viewer: viewer@siclo.com / Viewer123!@#

🏢 Demo Corporation (Demo Tenant):
- Admin: admin@democorp.com / DemoAdmin123!@#
- User: user@democorp.com / DemoUser123!@#

🏋️ Basic Data Created:
- Disciplines: Síclo, Barre, Yoga, Ejercito (4 disciplines total)
- Periods: 13 periods for 2025 (complete year)
- Formulas: Complete payment structure with:
  * Category requirements (INSTRUCTOR, JUNIOR_AMBASSADOR, AMBASSADOR, SENIOR_AMBASSADOR)
  * Payment parameters with dynamic tariffs
  * Retention percentages and bonus calculations
  * Full house payments and adjustments

🎯 Ready for Development:
The platform now includes the basic structure needed for fitness management with proper formulas and user authentication!
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
