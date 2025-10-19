import type { Prisma } from "@prisma/client";
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
import { protectedProcedure, router } from "../trpc";

export const userRouter = router({
  getAll: protectedProcedure
    .input(paginationInputSchema.optional())
    .query(async ({ input }) => {
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

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: searchFilter,
          select: {
            id: true,
            email: true,
            name: true,
            emailVerified: true,
            image: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy,
          skip: offset,
          take: limit,
        }),
        prisma.user.count({
          where: searchFilter,
        }),
      ]);

      return createPaginatedResponse(users, total, page, limit);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { id: input.id },
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
      if (!user) throw new Error("Usuario no encontrado");
      return user;
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
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
      const targetUserId = input.id || ctx.user.id;

      // Check permissions: users can edit themselves, admins can edit anyone
      if (input.id && input.id !== ctx.user.id) {
        const canManageUsers = await hasPermission(
          ctx.user.id,
          PermissionAction.MANAGE,
          PermissionResource.USER
        );

        if (!canManageUsers) {
          throw new Error("No tienes permisos para editar este usuario");
        }
      }

      const user = await prisma.user.findUnique({
        where: { id: targetUserId },
      });
      if (!user) throw new Error("Usuario no encontrado");

      if (input.email && !validateEmail(input.email))
        throw new Error("Email inválido");

      // Check if email is already taken by another user
      if (input.email && input.email !== user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: input.email },
        });
        if (existingUser) throw new Error("Email ya registrado");
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
      // Check permissions: users can delete themselves, admins can delete anyone
      if (input.id !== ctx.user.id) {
        const canManageUsers = await hasPermission(
          ctx.user.id,
          PermissionAction.MANAGE,
          PermissionResource.USER
        );

        if (!canManageUsers) {
          throw new Error("No tienes permisos para eliminar este usuario");
        }
      }

      const user = await prisma.user.findUnique({ where: { id: input.id } });
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
      // Check permissions: only admins can create users
      const canManageUsers = await hasPermission(
        ctx.user.id,
        PermissionAction.MANAGE,
        PermissionResource.USER
      );

      if (!canManageUsers) {
        throw new Error("No tienes permisos para crear usuarios");
      }

      // Validate email format
      if (!validateEmail(input.email)) {
        throw new Error("Email inválido");
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existingUser) {
        throw new Error("Email ya registrado");
      }

      // Hash password
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // Create user
      const newUser = await prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          phone: input.phone,
          language: input.language || "ES",
          emailVerified: false, // Admin-created users need to verify email
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

      // Create account record for Better Auth compatibility
      await prisma.account.create({
        data: {
          userId: newUser.id,
          accountId: newUser.email,
          providerId: "credential",
          password: hashedPassword,
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
      // Check permissions: only admins can assign roles
      const canManageUsers = await hasPermission(
        ctx.user.id,
        PermissionAction.MANAGE,
        PermissionResource.USER
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
      // Check permissions: only admins can remove roles
      const canManageUsers = await hasPermission(
        ctx.user.id,
        PermissionAction.MANAGE,
        PermissionResource.USER
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
      // Users can see their own roles, admins can see any user's roles
      if (input.userId !== ctx.user.id) {
        const canManageUsers = await hasPermission(
          ctx.user.id,
          PermissionAction.MANAGE,
          PermissionResource.USER
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
});
