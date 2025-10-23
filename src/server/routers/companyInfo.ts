import { z } from "zod";
import { prisma } from "../../lib/db";
import { hasPermission } from "../../services/rbacService";
import { PermissionAction, PermissionResource } from "../../types/rbac";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const companyInfoRouter = router({
  // Get company information (public)
  get: publicProcedure.query(async () => {
    // Get the first active tenant for public access
    const tenant = await prisma.tenant.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "asc", // Get the oldest tenant (likely the default one)
      },
    });

    return tenant;
  }),

  // Update company information (admin only)
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        displayName: z.string().optional(),
        description: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        website: z.string().url().optional(),
        facebookUrl: z.string().url().optional().nullable(),
        twitterUrl: z.string().url().optional().nullable(),
        instagramUrl: z.string().url().optional().nullable(),
        linkedinUrl: z.string().url().optional().nullable(),
        youtubeUrl: z.string().url().optional().nullable(),
        foundedYear: z
          .number()
          .int()
          .min(1800)
          .max(new Date().getFullYear())
          .optional(),
        logoUrl: z.string().url().optional().nullable(),
        faviconUrl: z.string().url().optional().nullable(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        termsUrl: z.string().optional(),
        privacyUrl: z.string().optional(),
        cookiesUrl: z.string().optional(),
        complaintsUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      // Check if user has permission to manage company info
      const canManage = await hasPermission(
        ctx.user.id,
        PermissionAction.UPDATE,
        PermissionResource.ADMIN,
        ctx.user.tenantId
      );

      if (!canManage) {
        throw new Error(
          "No tienes permisos para actualizar la información de la empresa"
        );
      }

      // Update tenant information
      const updatedTenant = await prisma.tenant.update({
        where: { id: ctx.user.tenantId },
        data: {
          ...input,
          updatedAt: new Date(),
        },
      });
      return updatedTenant;
    }),

  // Get company info for admin dashboard
  getForAdmin: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.tenantId) {
      throw new Error("User tenant not found");
    }

    // Check if user has permission to view admin data
    const canView = await hasPermission(
      ctx.user.id,
      PermissionAction.READ,
      PermissionResource.ADMIN,
      ctx.user.tenantId
    );

    if (!canView) {
      throw new Error(
        "No tienes permisos para ver la información de administración"
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: {
        id: ctx.user.tenantId,
        isActive: true,
      },
    });

    return tenant;
  }),
});
