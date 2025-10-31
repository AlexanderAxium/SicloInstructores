import type { InstructorCategoryType } from "@/lib/category-calculator";
import { z } from "zod";
import { prisma } from "../../lib/db";
import { protectedProcedure, router } from "../trpc";

const instructorCategoryTypeSchema = z.enum([
  "INSTRUCTOR",
  "JUNIOR_AMBASSADOR",
  "AMBASSADOR",
  "SENIOR_AMBASSADOR",
]);

// Schema for manual category
const manualCategorySchema = z.object({
  instructorId: z.string(),
  disciplineId: z.string(),
  category: instructorCategoryTypeSchema,
});

export const instructorCategoriesRouter = router({
  // Set manual categories for multiple instructors
  setManualCategories: protectedProcedure
    .input(
      z.object({
        periodId: z.string(),
        categories: z.array(manualCategorySchema),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const results = [];

      for (const categoryData of input.categories) {
        try {
          // Verify instructor exists
          const instructor = await prisma.instructor.findUnique({
            where: { id: categoryData.instructorId },
          });
          if (!instructor) {
            throw new Error(
              `Instructor ${categoryData.instructorId} not found`
            );
          }

          // Verify discipline exists
          const discipline = await prisma.discipline.findUnique({
            where: { id: categoryData.disciplineId },
          });
          if (!discipline) {
            throw new Error(
              `Discipline ${categoryData.disciplineId} not found`
            );
          }

          // Verify period exists
          const period = await prisma.period.findUnique({
            where: { id: input.periodId },
          });
          if (!period) {
            throw new Error(`Period ${input.periodId} not found`);
          }

          // Upsert the manual category
          const category = await prisma.instructorCategory.upsert({
            where: {
              instructorId_disciplineId_periodId_tenantId: {
                instructorId: categoryData.instructorId,
                disciplineId: categoryData.disciplineId,
                periodId: input.periodId,
                tenantId: ctx.user.tenantId,
              },
            },
            create: {
              instructorId: categoryData.instructorId,
              disciplineId: categoryData.disciplineId,
              periodId: input.periodId,
              category: categoryData.category as string,
              isManual: true,
              tenantId: ctx.user.tenantId,
            },
            update: {
              category: categoryData.category as string,
              isManual: true,
            },
          });

          results.push({
            instructorId: categoryData.instructorId,
            disciplineId: categoryData.disciplineId,
            success: true,
            category,
          });
        } catch (error) {
          results.push({
            instructorId: categoryData.instructorId,
            disciplineId: categoryData.disciplineId,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return {
        success: true,
        results,
        total: input.categories.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      };
    }),

  // Delete manual category (converting back to automatic calculation)
  deleteManualCategory: protectedProcedure
    .input(
      z.object({
        instructorId: z.string(),
        disciplineId: z.string(),
        periodId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      // Check if the category exists and is manual
      const existingCategory = await prisma.instructorCategory.findUnique({
        where: {
          instructorId_disciplineId_periodId_tenantId: {
            instructorId: input.instructorId,
            disciplineId: input.disciplineId,
            periodId: input.periodId,
            tenantId: ctx.user.tenantId,
          },
        },
      });

      if (!existingCategory) {
        throw new Error("Category not found");
      }

      if (!existingCategory.isManual) {
        throw new Error("Category is not manual and cannot be deleted");
      }

      // Delete the category
      // This will cause it to be recalculated on the next payment calculation
      await prisma.instructorCategory.delete({
        where: {
          instructorId_disciplineId_periodId_tenantId: {
            instructorId: input.instructorId,
            disciplineId: input.disciplineId,
            periodId: input.periodId,
            tenantId: ctx.user.tenantId,
          },
        },
      });

      return {
        success: true,
        message:
          "Manual category deleted successfully. Will be recalculated on next payment calculation.",
      };
    }),

  // Get manual categories for a period
  getManualCategoriesForPeriod: protectedProcedure
    .input(
      z.object({
        periodId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const categories = await prisma.instructorCategory.findMany({
        where: {
          periodId: input.periodId,
          tenantId: ctx.user.tenantId,
          isManual: true,
        },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
            },
          },
          discipline: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return categories;
    }),

  // Get all categories for a period (manual + automáticas)
  getCategoriesForPeriod: protectedProcedure
    .input(
      z.object({
        periodId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const categories = await prisma.instructorCategory.findMany({
        where: {
          periodId: input.periodId,
          tenantId: ctx.user.tenantId,
        },
        include: {
          instructor: {
            select: { id: true, name: true },
          },
          discipline: {
            select: { id: true, name: true },
          },
        },
        orderBy: [
          { instructor: { name: "asc" } },
          { discipline: { name: "asc" } },
        ],
      });

      return categories;
    }),
});
