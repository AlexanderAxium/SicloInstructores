import { z } from "zod";
import { prisma } from "../../lib/db";
import { protectedProcedure, publicProcedure, router } from "../trpc";

// Helper function to generate a slug from a name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD") // Normalize to decomposed form (é becomes e + ´)
    .replace(
      /[\u0300\u0301\u0302\u0303\u0304\u0305\u0306\u0307\u0308\u0309\u030A\u030B\u030C\u030D\u030E\u030F\u0310\u0311\u0312\u0313\u0314\u0315\u0316\u0317\u0318\u0319\u031A\u031B\u031C\u031D\u031E\u031F\u0320\u0321\u0322\u0323\u0324\u0325\u0326\u0327\u0328\u0329\u032A\u032B\u032C\u032D\u032E\u032F\u0330\u0331\u0332\u0333\u0334\u0335\u0336\u0337\u0338\u0339\u033A\u033B\u033C\u033D\u033E\u033F\u0340\u0341\u0342\u0343\u0344\u0345\u0346\u0347\u0348\u0349\u034A\u034B\u034C\u034D\u034E\u034F\u0350\u0351\u0352\u0353\u0354\u0355\u0356\u0357\u0358\u0359\u035A\u035B\u035C\u035D\u035E\u035F\u0360\u0361\u0362\u0363\u0364\u0365\u0366\u0367\u0368\u0369\u036A\u036B\u036C\u036D\u036E\u036F]/g,
      ""
    ) // Remove diacritics
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with -
    .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
    .trim();
}

// Helper function to generate unique slug (in case of duplicates)
async function generateUniqueInstructorId(
  name: string,
  _tenantId: string
): Promise<string> {
  const baseSlug = generateSlug(name);

  // Check if ID already exists
  const existingById = await prisma.instructor.findUnique({
    where: { id: baseSlug },
  });

  if (!existingById) {
    return baseSlug;
  }

  // If ID exists, add a number suffix
  let counter = 1;

  while (true) {
    const slug = `${baseSlug}-${counter}`;
    const exists = await prisma.instructor.findUnique({
      where: { id: slug },
    });

    if (!exists) {
      return slug;
    }

    counter++;
  }
}

export const instructorRouter = router({
  // Get all instructors (public)
  getAll: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(1000).default(1000),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ input }) => {
      if (!prisma) {
        throw new Error("Prisma client is not initialized");
      }

      if (!prisma.instructor) {
        throw new Error("Instructor model is not available in Prisma client");
      }

      const limit = input?.limit ?? 1000;
      const offset = input?.offset ?? 0;

      const [instructors, total] = await Promise.all([
        prisma.instructor.findMany({
          where: {
            active: true,
          },
          select: {
            id: true,
            name: true,
            fullName: true,
            active: true,
            phone: true,
            DNI: true,
            bank: true,
            bankAccount: true,
            CCI: true,
            contactPerson: true,
            createdAt: true,
            updatedAt: true,
            // Include related data
            classes: {
              select: {
                id: true,
                date: true,
                totalReservations: true,
                paidReservations: true,
                spots: true,
                discipline: {
                  select: {
                    name: true,
                    color: true,
                  },
                },
              },
              orderBy: {
                date: "desc",
              },
              take: 5, // Last 5 classes
            },
            payments: {
              select: {
                id: true,
                amount: true,
                finalPayment: true,
                status: true,
                period: {
                  select: {
                    number: true,
                    year: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 3, // Last 3 payments
            },
            disciplines: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
          take: limit,
          skip: offset,
        }),
        prisma.instructor.count({
          where: {
            active: true,
          },
        }),
      ]);

      return {
        instructors,
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Get instructor by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const instructor = await prisma.instructor.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          name: true,
          fullName: true,
          active: true,
          phone: true,
          DNI: true,
          bank: true,
          bankAccount: true,
          CCI: true,
          contactPerson: true,
          extraInfo: true,
          lastBonus: true,
          createdAt: true,
          updatedAt: true,
          classes: {
            select: {
              id: true,
              date: true,
              totalReservations: true,
              paidReservations: true,
              spots: true,
              specialText: true,
              isVersus: true,
              versusNumber: true,
              discipline: {
                select: {
                  name: true,
                  color: true,
                },
              },
              period: {
                select: {
                  number: true,
                  year: true,
                },
              },
            },
            orderBy: {
              date: "desc",
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              finalPayment: true,
              status: true,
              retention: true,
              adjustment: true,
              penalty: true,
              cover: true,
              branding: true,
              themeRide: true,
              workshop: true,
              versusBonus: true,
              bonus: true,
              comments: true,
              period: {
                select: {
                  number: true,
                  year: true,
                  startDate: true,
                  endDate: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          disciplines: {
            select: {
              id: true,
              name: true,
              color: true,
              description: true,
            },
          },
          categories: {
            select: {
              id: true,
              category: true,
              isManual: true,
              metrics: true,
              discipline: {
                select: {
                  name: true,
                  color: true,
                },
              },
              period: {
                select: {
                  number: true,
                  year: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      return instructor;
    }),

  // Get instructors with filters (protected)
  getWithFilters: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        discipline: z.string().optional(),
        active: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const where: {
        tenantId?: string;
        OR?: Array<{
          name?: { contains: string; mode: "insensitive" };
          fullName?: { contains: string; mode: "insensitive" };
          phone?: { contains: string; mode: "insensitive" };
          DNI?: { contains: string; mode: "insensitive" };
        }>;
        active?: boolean;
        disciplines?: {
          some: {
            id: string;
          };
        };
      } = {
        tenantId: ctx.user?.tenantId || undefined,
      };

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { fullName: { contains: input.search, mode: "insensitive" } },
          { phone: { contains: input.search, mode: "insensitive" } },
          { DNI: { contains: input.search, mode: "insensitive" } },
        ];
      }

      if (input.discipline) {
        where.disciplines = {
          some: {
            id: input.discipline,
          },
        };
      }

      if (input.active !== undefined) {
        where.active = input.active;
      }

      const [instructors, total] = await Promise.all([
        prisma.instructor.findMany({
          where,
          select: {
            id: true,
            name: true,
            fullName: true,
            active: true,
            phone: true,
            DNI: true,
            createdAt: true,
            disciplines: {
              select: {
                name: true,
                color: true,
              },
            },
            _count: {
              select: {
                classes: true,
                payments: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
          take: input.limit,
          skip: input.offset,
        }),
        prisma.instructor.count({ where }),
      ]);

      return {
        instructors,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Create instructor (protected)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        fullName: z.string().optional(),
        phone: z.string().optional(),
        DNI: z.string().optional(),
        bank: z.string().optional(),
        bankAccount: z.string().optional(),
        CCI: z.string().optional(),
        contactPerson: z.string().optional(),
        extraInfo: z.record(z.any()).optional(),
        disciplineIds: z.array(z.string()).optional(),
        password: z.string().optional(), // Add password field
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      // Hash password if provided
      let hashedPassword: string | undefined;
      if (input.password) {
        const bcrypt = await import("bcryptjs");
        hashedPassword = await bcrypt.hash(input.password, 10);
      }

      // Generate unique slug-based ID
      const instructorId = await generateUniqueInstructorId(
        input.name,
        ctx.user.tenantId
      );

      const instructor = await prisma.instructor.create({
        data: {
          id: instructorId, // Use slug as ID
          name: input.name,
          fullName: input.fullName,
          phone: input.phone,
          DNI: input.DNI,
          bank: input.bank,
          bankAccount: input.bankAccount,
          CCI: input.CCI,
          contactPerson: input.contactPerson,
          extraInfo: input.extraInfo,
          password: hashedPassword, // Store hashed password
          tenantId: ctx.user.tenantId,
          disciplines: input.disciplineIds
            ? {
                connect: input.disciplineIds.map((id) => ({ id })),
              }
            : undefined,
        },
        include: {
          disciplines: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });

      return instructor;
    }),

  // Update instructor (protected)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        fullName: z.string().optional(),
        phone: z.string().optional(),
        DNI: z.string().optional(),
        bank: z.string().optional(),
        bankAccount: z.string().optional(),
        CCI: z.string().optional(),
        contactPerson: z.string().optional(),
        extraInfo: z.record(z.any()).optional(),
        active: z.boolean().optional(),
        disciplineIds: z.array(z.string()).optional(),
        password: z.string().optional(), // Add password field
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get tenantId from either user or instructor
      // ctx.instructor?.tenantId is always string, ctx.user?.tenantId can be string | null
      const tenantId = ctx.instructor?.tenantId || ctx.user?.tenantId;
      if (!tenantId) {
        throw new Error("User tenant not found");
      }

      const { id, disciplineIds, password, ...updateData } = input;

      // If instructor is updating, only allow them to update their own info
      if (ctx.instructor && ctx.instructor.id !== id) {
        throw new Error("No tienes permisos para actualizar este instructor");
      }

      // If instructor is updating, restrict certain fields (only admins can change these)
      if (ctx.instructor && !ctx.user) {
        // Remove admin-only fields from updateData
        updateData.active = undefined;
        // Instructors cannot change disciplineIds
        if (disciplineIds) {
          throw new Error("No tienes permisos para cambiar las disciplinas");
        }
      }

      // Hash password if provided
      let hashedPassword: string | undefined;
      if (password) {
        const bcrypt = await import("bcryptjs");
        hashedPassword = await bcrypt.hash(password, 10);
      }

      const instructor = await prisma.instructor.update({
        where: {
          id,
          tenantId: tenantId,
        },
        data: {
          ...updateData,
          ...(hashedPassword && { password: hashedPassword }), // Only update password if provided
          disciplines: disciplineIds
            ? {
                set: disciplineIds.map((disciplineId) => ({
                  id: disciplineId,
                })),
              }
            : undefined,
        },
        include: {
          disciplines: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });

      return instructor;
    }),

  // Delete instructor (protected)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      await prisma.instructor.delete({
        where: {
          id: input.id,
          tenantId: ctx.user.tenantId,
        },
      });

      return { success: true };
    }),

  // Get instructor statistics (protected)
  getStats: protectedProcedure
    .input(z.object({ instructorId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Get tenantId from either user or instructor
      const tenantId = ctx.user?.tenantId || ctx.instructor?.tenantId;

      if (!tenantId) {
        throw new Error("User tenant not found");
      }

      const instructor = await prisma.instructor.findUnique({
        where: {
          id: input.instructorId,
          tenantId: tenantId,
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              classes: true,
              payments: true,
              coversAsOriginal: true,
              coversAsReplacement: true,
              penalties: true,
              brandings: true,
              themeRides: true,
              workshops: true,
            },
          },
        },
      });

      if (!instructor) {
        throw new Error("Instructor not found");
      }

      // Get recent performance metrics
      const recentClasses = await prisma.class.findMany({
        where: {
          instructorId: input.instructorId,
          tenantId: tenantId,
        },
        select: {
          totalReservations: true,
          paidReservations: true,
          spots: true,
          date: true,
        },
        orderBy: {
          date: "desc",
        },
        take: 10,
      });

      const avgOccupation =
        recentClasses.length > 0
          ? recentClasses.reduce(
              (sum, cls) => sum + cls.paidReservations / cls.spots,
              0
            ) / recentClasses.length
          : 0;

      return {
        instructor,
        stats: {
          totalClasses: instructor._count.classes,
          totalPayments: instructor._count.payments,
          coversAsOriginal: instructor._count.coversAsOriginal,
          coversAsReplacement: instructor._count.coversAsReplacement,
          penalties: instructor._count.penalties,
          brandings: instructor._count.brandings,
          themeRides: instructor._count.themeRides,
          workshops: instructor._count.workshops,
          avgOccupation: Math.round(avgOccupation * 100) / 100,
        },
      };
    }),

  // Login instructor (public)
  login: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      // Find instructor by name
      const instructor = await prisma.instructor.findFirst({
        where: {
          name: {
            contains: input.name,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
          fullName: true,
          phone: true,
          DNI: true,
          active: true,
          password: true, // Include password for verification
        },
      });

      if (!instructor) {
        throw new Error("Instructor not found");
      }

      if (!instructor.active) {
        throw new Error("Instructor account is inactive");
      }

      // Check if instructor has a password set
      if (!instructor.password) {
        // For instructors without a password, use the default pattern
        const nameWithoutSpaces = instructor.name
          .toLowerCase()
          .replace(/\s+/g, "");
        const letterCount = nameWithoutSpaces.length;
        const symbol = letterCount % 2 === 0 ? "#" : "%";
        const expectedPassword = `${nameWithoutSpaces}${letterCount}${symbol}`;

        if (input.password !== expectedPassword) {
          throw new Error("Invalid password");
        }
      } else {
        // Use bcrypt to compare hashed password
        const bcrypt = await import("bcryptjs");
        const passwordMatch = await bcrypt.compare(
          input.password,
          instructor.password
        );

        if (!passwordMatch) {
          throw new Error("Invalid password");
        }
      }

      // Generate a simple token (in production, use JWT)
      const token = Buffer.from(`${instructor.id}:${Date.now()}`).toString(
        "base64"
      );

      // Remove password from response
      const { password, ...instructorData } = instructor;

      return {
        token,
        instructor: instructorData,
      };
    }),

  // Reset passwords for multiple instructors (protected)
  resetPasswords: protectedProcedure
    .input(
      z.object({
        instructorIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      const tenantId = ctx.user.tenantId as string;

      // Get all instructors that need password reset
      const instructors = await prisma.instructor.findMany({
        where: {
          id: { in: input.instructorIds },
          tenantId: tenantId,
        },
        select: {
          id: true,
          name: true,
        },
      });

      if (instructors.length === 0) {
        throw new Error("No se encontraron instructores para resetear");
      }

      // Generate default passwords and hash them
      const bcrypt = await import("bcryptjs");
      const updatePromises = instructors.map(async (instructor) => {
        // Default password pattern: nombreInstructor.toLowerCase().replace(/\s+/g, "") + numberOfLetters + (# if even, % if odd)
        const nameWithoutSpaces = instructor.name
          .toLowerCase()
          .replace(/\s+/g, "");
        const letterCount = nameWithoutSpaces.length;
        const symbol = letterCount % 2 === 0 ? "#" : "%";
        const defaultPassword = `${nameWithoutSpaces}${letterCount}${symbol}`;
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        return prisma.instructor.update({
          where: {
            id: instructor.id,
            tenantId: tenantId,
          },
          data: {
            password: hashedPassword,
          },
        });
      });

      await Promise.all(updatePromises);

      return {
        success: true,
        count: instructors.length,
      };
    }),
});
