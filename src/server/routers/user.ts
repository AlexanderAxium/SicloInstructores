import type { Prisma } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { z } from "zod";
import { prisma } from "../../lib/db";
import {
  calculateOffset,
  createPaginatedResponse,
  createSearchFilter,
  createSortOrder,
  paginationInputSchema,
} from "../../lib/pagination";
import { hasPermission } from "../../services/rbacService";
import { PermissionAction, PermissionResource } from "../../types/rbac";
import { validateEmail } from "../../utils/validate";
import { protectedProcedure, publicProcedure, router } from "../trpc";

// Create a better-auth instance for admin user creation that doesn't send emails
const adminAuth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disable email verification for admin-created users
  },
  emailVerification: {
    sendOnSignUp: false, // Don't send emails when creating users from admin
    autoSignInAfterVerification: true,
  },
  session: {
    strategy: "jwt",
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  logger: {
    level: "error", // Reduce logging
  },
});

export const userRouter = router({
  getAll: protectedProcedure
    .input(paginationInputSchema.optional())
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const {
        page = 1,
        limit = 100,
        search,
        sortBy,
        sortOrder = "desc",
      } = input || {};
      const offset = calculateOffset(page, limit);

      const searchFilter = createSearchFilter(search, ["email", "name"]);
      const orderBy = createSortOrder(sortBy, sortOrder);

      // Add tenant filter
      const whereClause = {
        ...searchFilter,
        tenantId: ctx.user.tenantId,
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            email: true,
            name: true,
            emailVerified: true,
            image: true,
            tenantId: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy,
          skip: offset,
          take: limit,
        }),
        prisma.user.count({
          where: whereClause,
        }),
      ]);

      return createPaginatedResponse(users, total, page, limit);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const user = await prisma.user.findUnique({
        where: {
          id: input.id,
          tenantId: ctx.user.tenantId,
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
      if (!user) throw new Error("Usuario no encontrado");
      return user;
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Usuario no autenticado");
    }
    const user = await prisma.user.findUnique({
      where: { id: ctx.user.id },
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
    if (!user) throw new Error("Usuario no encontrado");
    return user;
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(), // If not provided, updates current user
        name: z.string().optional(),
        email: z.string().optional(),
        password: z.string().min(6).optional(),
        phone: z.string().optional(),
        language: z.enum(["ES", "EN", "PT"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const targetUserId = input.id || ctx.user.id;

      // Check permissions: users can edit themselves, admins can edit anyone
      if (input.id && input.id !== ctx.user.id) {
        const canManageUsers = await hasPermission(
          ctx.user.id,
          PermissionAction.MANAGE,
          PermissionResource.USER,
          ctx.user.tenantId
        );

        if (!canManageUsers) {
          throw new Error("No tienes permisos para editar este usuario");
        }
      }

      const user = await prisma.user.findUnique({
        where: {
          id: targetUserId,
          tenantId: ctx.user.tenantId,
        },
      });
      if (!user) throw new Error("Usuario no encontrado");

      if (input.email && !validateEmail(input.email))
        throw new Error("Email inválido");

      // Check if email is already taken by another user in the same tenant
      if (input.email && input.email !== user.email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: input.email,
            tenantId: ctx.user.tenantId,
            id: { not: targetUserId },
          },
        });
        if (existingUser) throw new Error("Email ya registrado en este tenant");
      }

      // Prepare update data (exclude password - it's handled separately in Account table)
      const updateData: Prisma.UserUpdateInput = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.email !== undefined) updateData.email = input.email;
      if (input.phone !== undefined) updateData.phone = input.phone;
      if (input.language !== undefined) updateData.language = input.language;

      // Handle password update if provided - passwords are stored in Account table
      if (input.password && input.password.trim() !== "") {
        const bcrypt = await import("bcryptjs");
        const hashedPassword = await bcrypt.hash(input.password, 10);

        // Update password in Account table (Better Auth stores passwords there)
        await prisma.account.updateMany({
          where: {
            userId: targetUserId,
            providerId: "credential",
          },
          data: {
            password: hashedPassword,
          },
        });
      }

      const updated = await prisma.user.update({
        where: { id: targetUserId },
        data: updateData,
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
      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      // Check permissions: users can delete themselves, admins can delete anyone
      if (input.id !== ctx.user.id) {
        const canManageUsers = await hasPermission(
          ctx.user.id,
          PermissionAction.MANAGE,
          PermissionResource.USER,
          ctx.user.tenantId
        );

        if (!canManageUsers) {
          throw new Error("No tienes permisos para eliminar este usuario");
        }
      }

      const user = await prisma.user.findUnique({
        where: {
          id: input.id,
          tenantId: ctx.user.tenantId,
        },
      });
      if (!user) throw new Error("Usuario no encontrado");

      await prisma.user.delete({ where: { id: input.id } });
      return true;
    }),

  create: protectedProcedure
    .input(
      z.object({
        email: z.string().email("Email inválido"),
        name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
        password: z
          .string()
          .min(6, "Contraseña debe tener al menos 6 caracteres"),
        phone: z.string().optional(),
        language: z.enum(["ES", "EN", "PT"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      // Check permissions: only admins can create users
      const canManageUsers = await hasPermission(
        ctx.user.id,
        PermissionAction.MANAGE,
        PermissionResource.USER,
        ctx.user.tenantId
      );

      if (!canManageUsers) {
        throw new Error("No tienes permisos para crear usuarios");
      }

      // Validate email format
      if (!validateEmail(input.email)) {
        throw new Error("Email inválido");
      }

      // Check if email already exists in this tenant
      const existingUser = await prisma.user.findFirst({
        where: {
          email: input.email,
          tenantId: ctx.user.tenantId,
        },
      });
      if (existingUser) {
        throw new Error("Email ya registrado en este tenant");
      }

      // Use better-auth API to create user (without sending verification email)
      // Using adminAuth instance that doesn't send emails, similar to seed
      const result = await adminAuth.api.signUpEmail({
        body: {
          email: input.email,
          password: input.password,
          name: input.name,
        },
      });

      if (!result.user) {
        throw new Error(
          `Error al crear usuario: ${
            (result as { error?: { message?: string } }).error?.message ||
            "Error desconocido"
          }`
        );
      }

      // Update user with additional fields and tenantId (same pattern as seed)
      const newUser = await prisma.user.update({
        where: { id: result.user.id },
        data: {
          phone: input.phone,
          language: input.language || "ES",
          emailVerified: false, // Admin-created users need to verify email
          tenantId: ctx.user.tenantId, // Assign tenantId after creation
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

      return newUser;
    }),

  // Assign role to user
  assignRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        roleId: z.string(),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      // Check permissions: only admins can assign roles
      const canManageUsers = await hasPermission(
        ctx.user.id,
        PermissionAction.MANAGE,
        PermissionResource.USER,
        ctx.user.tenantId
      );

      if (!canManageUsers) {
        throw new Error("No tienes permisos para asignar roles");
      }

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
      });
      if (!user) throw new Error("Usuario no encontrado");

      // Verify role exists
      const role = await prisma.role.findUnique({
        where: { id: input.roleId },
      });
      if (!role) throw new Error("Rol no encontrado");

      // Check if user already has this role
      const existingUserRole = await prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId: input.userId,
            roleId: input.roleId,
          },
        },
      });

      if (existingUserRole) {
        throw new Error("El usuario ya tiene este rol asignado");
      }

      // Assign role
      const userRole = await prisma.userRole.create({
        data: {
          userId: input.userId,
          roleId: input.roleId,
          assignedBy: ctx.user.id,
          expiresAt: input.expiresAt,
        },
        include: {
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return userRole;
    }),

  // Remove role from user
  removeRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        roleId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      // Check permissions: only admins can remove roles
      const canManageUsers = await hasPermission(
        ctx.user.id,
        PermissionAction.MANAGE,
        PermissionResource.USER,
        ctx.user.tenantId
      );

      if (!canManageUsers) {
        throw new Error("No tienes permisos para remover roles");
      }

      // Verify the user role assignment exists
      const userRole = await prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId: input.userId,
            roleId: input.roleId,
          },
        },
        include: {
          role: true,
        },
      });

      if (!userRole) {
        throw new Error("El usuario no tiene este rol asignado");
      }

      // Prevent removing system roles if they're critical
      if (userRole.role.isSystem) {
        // TODO: Add additional checks for critical system roles
        // For now, allow removal but could add restrictions
      }

      // Remove role assignment
      await prisma.userRole.delete({
        where: {
          userId_roleId: {
            userId: input.userId,
            roleId: input.roleId,
          },
        },
      });

      return true;
    }),

  // Get user roles
  getUserRoles: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      // Users can see their own roles, admins can see any user's roles
      if (input.userId !== ctx.user.id) {
        const canManageUsers = await hasPermission(
          ctx.user.id,
          PermissionAction.MANAGE,
          PermissionResource.USER,
          ctx.user.tenantId
        );

        if (!canManageUsers) {
          throw new Error(
            "No tienes permisos para ver los roles de este usuario"
          );
        }
      }

      const userRoles = await prisma.userRole.findMany({
        where: {
          userId: input.userId,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        include: {
          role: true,
        },
        orderBy: {
          assignedAt: "desc",
        },
      });

      return userRoles.map((ur) => ({
        id: ur.id,
        roleId: ur.role.id,
        roleName: ur.role.name,
        roleDisplayName: ur.role.displayName,
        roleDescription: ur.role.description,
        isActive: ur.role.isActive,
        isSystem: ur.role.isSystem,
        assignedAt: ur.assignedAt,
        assignedBy: ur.assignedBy,
        expiresAt: ur.expiresAt,
      }));
    }),

  // Get verification link for a user
  getVerificationLink: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      // Check permissions: only admins can get verification links
      const canManageUsers = await hasPermission(
        ctx.user.id,
        PermissionAction.MANAGE,
        PermissionResource.USER,
        ctx.user.tenantId
      );

      if (!canManageUsers) {
        throw new Error(
          "No tienes permisos para obtener enlaces de verificación"
        );
      }

      // Verify user exists and belongs to the same tenant
      const user = await prisma.user.findUnique({
        where: {
          id: input.userId,
          tenantId: ctx.user.tenantId,
        },
      });

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      if (user.emailVerified) {
        throw new Error("El usuario ya tiene el email verificado");
      }

      // Generate verification token using Better Auth's internal method
      // Better Auth stores verification tokens in the Verification table
      const crypto = await import("node:crypto");
      const token = crypto.randomBytes(32).toString("hex");

      // Set expiration to 24 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Delete any existing verification tokens for this user
      await prisma.verification.deleteMany({
        where: {
          identifier: user.email,
        },
      });

      // Create new verification token
      await prisma.verification.create({
        data: {
          identifier: user.email,
          value: token,
          expiresAt,
        },
      });

      // Build the verification URL
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.SITE_URL ||
        "http://localhost:3000";
      const verificationUrl = `${baseUrl}/confirm-email?token=${token}`;

      return {
        url: verificationUrl,
        token,
        expiresAt,
      };
    }),

  // Confirm email using token (Better Auth compatible)
  // This should be public as unverified users may not have a session
  confirmEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      // Find verification token
      const verification = await prisma.verification.findFirst({
        where: {
          value: input.token,
          expiresAt: {
            gt: new Date(), // Token not expired
          },
        },
      });

      if (!verification) {
        throw new Error("Token inválido o expirado");
      }

      // Find user by email (identifier)
      const user = await prisma.user.findUnique({
        where: {
          email: verification.identifier,
        },
      });

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      if (user.emailVerified) {
        // Token already used, but user is verified
        await prisma.verification.delete({
          where: {
            id: verification.id,
          },
        });
        return true;
      }

      // Verify email
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });

      // Delete used verification token
      await prisma.verification.delete({
        where: {
          id: verification.id,
        },
      });

      return true;
    }),

  // Activate user without email verification
  activateUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      // Check permissions: only admins can activate users
      const canManageUsers = await hasPermission(
        ctx.user.id,
        PermissionAction.MANAGE,
        PermissionResource.USER,
        ctx.user.tenantId
      );

      if (!canManageUsers) {
        throw new Error("No tienes permisos para activar usuarios");
      }

      // Verify user exists and belongs to the same tenant
      const user = await prisma.user.findUnique({
        where: {
          id: input.userId,
          tenantId: ctx.user.tenantId,
        },
      });

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      if (user.emailVerified) {
        throw new Error("El usuario ya está activado");
      }

      // Activate user by setting emailVerified to true
      const updatedUser = await prisma.user.update({
        where: { id: input.userId },
        data: { emailVerified: true },
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

      // Delete any existing verification tokens for this user
      await prisma.verification.deleteMany({
        where: {
          identifier: user.email,
        },
      });

      return updatedUser;
    }),
});
