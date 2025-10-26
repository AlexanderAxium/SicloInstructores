import { prisma } from "@/lib/db";
import * as XLSX from "xlsx";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

// Tipos para la importación

// Tipos para datos de Excel
interface ExcelRow {
  ID_clase?: string;
  País?: string;
  Ciudad?: string;
  Instructor?: string;
  Disciplina?: string;
  Estudio?: string;
  Salon?: string;
  Día?: string | Date;
  Hora?: string;
  Semana?: number;
  "Reservas Totales"?: number;
  "Listas de Espera"?: number;
  Cortesias?: number;
  Lugares?: number;
  "Reservas Pagadas"?: number;
  "Texto espcial"?: string;
  HoraOriginal?: string;
}

interface SystemInstructor {
  id: string;
  name: string;
  fullName: string | null;
  active?: boolean;
  disciplines?: Array<{ id: string; name: string }>;
}

interface SystemDiscipline {
  id: string;
  name: string;
  color: string | null;
  active?: boolean;
}

interface ClassItem {
  id: string;
  filaOriginal: number;
  pais: string;
  ciudad: string;
  instructor: string;
  disciplina: string;
  estudio: string;
  salon: string;
  dia: string;
  hora: string;
  semana: number;
  reservasTotales: number;
  listasEspera: number;
  cortesias: number;
  lugares: number;
  reservasPagadas: number;
  textoEspecial: string;
  esInstructorVS: boolean;
  instructoresVS?: string[];
  mapeoDisciplina?: string;
  mapeoSemana?: number;
  instructorExiste: boolean;
  instructorNuevo: boolean;
  eliminada: boolean;
  errores?: string[];
}

const ClaseEditableSchema = z.object({
  id: z.string(),
  filaOriginal: z.number(),
  pais: z.string().optional(),
  ciudad: z.string().optional(),
  instructor: z.string(),
  disciplina: z.string(),
  estudio: z.string(),
  salon: z.string(),
  dia: z.string(),
  hora: z.string(),
  semana: z.number(),
  reservasTotales: z.number(),
  listasEspera: z.number(),
  cortesias: z.number(),
  lugares: z.number(),
  reservasPagadas: z.number(),
  textoEspecial: z.string().optional(),
  esInstructorVS: z.boolean(),
  instructoresVS: z.array(z.string()).optional(),
  mapeoDisciplina: z.string().optional(),
  mapeoSemana: z.number().optional(),
  instructorExiste: z.boolean(),
  instructorNuevo: z.boolean(),
  eliminada: z.boolean(),
  errores: z.array(z.string()).optional(),
});

const _TablaClasesEditableSchema = z.object({
  clases: z.array(ClaseEditableSchema),
  totalClases: z.number(),
  clasesValidas: z.number(),
  clasesConErrores: z.number(),
  clasesEliminadas: z.number(),
});

const ConfiguracionFinalImportacionSchema = z.object({
  periodoId: z.string(),
  clases: z.array(ClaseEditableSchema),
});

export const importRouter = router({
  // Generate class table from Excel
  generarTabla: protectedProcedure
    .input(
      z.object({
        file: z.string(), // Base64 file
        semanaInicial: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      try {
        // Convert base64 to buffer
        const buffer = Buffer.from(input.file, "base64");
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          throw new Error("El archivo Excel no contiene hojas de trabajo");
        }
        const worksheet = workbook.Sheets[firstSheetName];

        // Options to process dates correctly
        const options = {
          raw: false,
          dateNF: "yyyy-mm-dd",
          cellDates: true,
          defval: "",
          cellText: false,
          cellNF: false,
          cellStyles: false,
        };

        // Convert to JSON
        if (!worksheet) {
          throw new Error("No se pudo acceder a la hoja de trabajo");
        }
        const rawData = XLSX.utils.sheet_to_json(worksheet, options);

        // Verify required columns
        if (rawData.length === 0) {
          throw new Error("El archivo Excel está vacío");
        }

        const firstRow = rawData[0] as ExcelRow;
        const columns = Object.keys(firstRow);

        if (!columns.includes("Día") || !columns.includes("Hora")) {
          throw new Error(
            "El archivo Excel debe contener las columnas 'Día' y 'Hora'"
          );
        }

        // Process data
        const processedData = preprocessExcelData(rawData as ExcelRow[]);

        // Get system data
        const [instructors, disciplines] = await Promise.all([
          prisma.instructor.findMany({
            where: { tenantId: ctx.user.tenantId },
            include: { disciplines: true },
          }),
          prisma.discipline.findMany({
            where: {
              active: true,
              tenantId: ctx.user.tenantId,
            },
          }),
        ]);

        // Filter active instructors
        const activeInstructors = instructors.filter(
          (instructor: SystemInstructor) => instructor.active !== false
        );

        // Generate class table
        const result = generateClassTable(
          processedData,
          activeInstructors,
          disciplines,
          input.semanaInicial
        );

        return result;
      } catch (error) {
        console.error("Error generating class table:", error);
        throw new Error(
          error instanceof Error
            ? error.message
            : "Error al procesar el archivo Excel"
        );
      }
    }),

  // Process final import
  procesar: protectedProcedure
    .input(ConfiguracionFinalImportacionSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.tenantId) {
        throw new Error("User tenant not found");
      }

      try {
        const errors: Array<{ fila: number; mensaje: string }> = [];
        let classesCreated = 0;
        let instructorsCreated = 0;

        // Verify period exists
        const period = await prisma.period.findUnique({
          where: {
            id: input.periodoId,
            tenantId: ctx.user.tenantId,
          },
        });

        if (!period) {
          throw new Error("Período no encontrado");
        }

        // 1. Create missing instructors
        const instructorsCache: Record<string, string> = {};

        // Get existing instructors
        const existingInstructors = await prisma.instructor.findMany({
          where: { tenantId: ctx.user.tenantId },
        });

        // Fill cache
        existingInstructors.forEach((instructor: SystemInstructor) => {
          instructorsCache[instructor.name.toLowerCase()] = instructor.id;
        });

        // Create missing instructors
        for (const clase of input.clases) {
          if (!clase.eliminada) {
            const instructorName = clase.instructor;
            if (!instructorsCache[instructorName.toLowerCase()]) {
              try {
                const instructor = await prisma.instructor.create({
                  data: {
                    name: instructorName,
                    fullName: instructorName,
                    active: true,
                    tenantId: ctx.user.tenantId,
                  },
                });
                instructorsCache[instructorName.toLowerCase()] = instructor.id;
                instructorsCreated++;
              } catch (error) {
                errors.push({
                  fila: clase.filaOriginal,
                  mensaje: `Error al crear instructor "${instructorName}": ${error instanceof Error ? error.message : "Error desconocido"}`,
                });
              }
            }
          }
        }

        // 2. Get disciplines
        const disciplines = await prisma.discipline.findMany({
          where: {
            active: true,
            tenantId: ctx.user.tenantId,
          },
        });

        const disciplinesCache: Record<string, string> = {};
        disciplines.forEach((discipline: SystemDiscipline) => {
          disciplinesCache[discipline.name.toLowerCase()] = discipline.id;
        });

        // 3. Delete existing classes from period
        const existingClasses = await prisma.class.findMany({
          where: {
            periodId: input.periodoId,
            tenantId: ctx.user.tenantId,
          },
        });

        if (existingClasses.length > 0) {
          await prisma.class.deleteMany({
            where: {
              periodId: input.periodoId,
              tenantId: ctx.user.tenantId,
            },
          });
        }

        // 4. Create classes and link disciplines to instructors
        // Keep track of which disciplines we've already linked to each instructor
        const linkedDisciplines = new Set<string>();

        for (const clase of input.clases) {
          if (clase.eliminada) continue;

          try {
            const instructorId =
              instructorsCache[clase.instructor.toLowerCase()];
            if (!instructorId) {
              throw new Error(`Instructor no encontrado: ${clase.instructor}`);
            }

            const disciplineId =
              disciplinesCache[clase.disciplina.toLowerCase()];
            if (!disciplineId) {
              throw new Error(`Disciplina no encontrada: ${clase.disciplina}`);
            }

            // Link discipline to instructor if not already linked
            const linkKey = `${instructorId}-${disciplineId}`;
            if (!linkedDisciplines.has(linkKey)) {
              // Check if relationship already exists
              const instructor = await prisma.instructor.findUnique({
                where: { id: instructorId },
                include: { disciplines: { where: { id: disciplineId } } },
              });

              // If instructor doesn't have the discipline, add it
              if (instructor && instructor.disciplines.length === 0) {
                await prisma.instructor.update({
                  where: { id: instructorId },
                  data: {
                    disciplines: {
                      connect: { id: disciplineId },
                    },
                  },
                });
              }

              linkedDisciplines.add(linkKey);
            }

            // Process date and time
            const date = processDateTime(clase.dia, clase.hora);
            if (!date) {
              throw new Error(
                `Fecha/hora inválida: ${clase.dia} ${clase.hora}`
              );
            }

            // Create class
            await prisma.class.create({
              data: {
                instructorId: instructorId!,
                disciplineId: disciplineId!,
                periodId: input.periodoId,
                week: clase.semana,
                date: date,
                room: clase.salon || "",
                studio: clase.estudio || "",
                totalReservations: clase.reservasTotales || 0,
                waitingLists: clase.listasEspera || 0,
                complimentary: clase.cortesias || 0,
                spots: clase.lugares || 0,
                paidReservations: clase.reservasPagadas || 0,
                specialText: clase.textoEspecial || null,
                isVersus: clase.esInstructorVS,
                versusNumber:
                  clase.esInstructorVS && clase.instructoresVS
                    ? clase.instructoresVS.length
                    : null,
                country: clase.pais || "Perú",
                city: clase.ciudad || "Lima",
                tenantId: ctx.user.tenantId,
              },
            });

            classesCreated++;
          } catch (error) {
            errors.push({
              fila: clase.filaOriginal,
              mensaje: `Error al crear clase: ${error instanceof Error ? error.message : "Error desconocido"}`,
            });
          }
        }

        return {
          totalRegistros: input.clases.length,
          registrosImportados: classesCreated,
          registrosConError: errors.length,
          errores: errors,
          clasesCreadas: classesCreated,
          instructoresCreados: instructorsCreated,
        };
      } catch (error) {
        console.error("Error processing import:", error);
        throw new Error(
          error instanceof Error
            ? error.message
            : "Error al procesar la importación"
        );
      }
    }),
});

// Function to preprocess Excel data
function preprocessExcelData(data: ExcelRow[]): ExcelRow[] {
  return data
    .filter((row: ExcelRow) => {
      const hasCriticalData = row.Instructor && row.Disciplina && row.Día;
      return hasCriticalData;
    })
    .map((row, _index) => {
      const processedRow = { ...row };

      // Normalize names
      if (processedRow.Instructor) {
        processedRow.Instructor = processedRow.Instructor.split(" ")
          .map(
            (word: string) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ")
          .trim();
      }

      if (processedRow.Disciplina) {
        processedRow.Disciplina = processedRow.Disciplina.trim();
      }

      if (processedRow.Estudio) {
        processedRow.Estudio = processedRow.Estudio.trim();
      }

      if (processedRow.Salon) {
        processedRow.Salon = processedRow.Salon.trim();
      }

      // Process date
      if (processedRow.Día) {
        if (typeof processedRow.Día === "string") {
          const cleanDate = processedRow.Día.toString().trim();
          const parsedDate = new Date(cleanDate);

          if (!Number.isNaN(parsedDate.getTime())) {
            processedRow.Día = parsedDate;
          } else {
            processedRow.Día = cleanDate;
          }
        }
      }

      // Process time
      if (processedRow.Hora) {
        let timeStr = processedRow.Hora.toString().trim();

        if (
          timeStr === "1900-01-01" ||
          timeStr === "1900-01-01T00:00:00.000Z"
        ) {
          processedRow.Hora = "12:00";
          timeStr = "12:00";
        }

        if (timeStr.includes(":")) {
          if (
            timeStr.includes("a. m.") ||
            timeStr.includes("p. m.") ||
            timeStr.includes("(hora peruana)")
          ) {
            const cleanTime = timeStr
              .replace(/\s*\(hora peruana\)/g, "")
              .replace(/\s*a\.\s*m\./g, " AM")
              .replace(/\s*p\.\s*m\./g, " PM")
              .replace(/\s+/g, " ")
              .trim();

            const match = cleanTime.match(
              /^(\d{1,2}):(\d{1,2}):(\d{1,2})\s*(AM|PM)$/i
            );
            if (match) {
              const [_, hours, minutes, _seconds, period] = match;
              let hoursNum = Number.parseInt(hours || "0");
              const minutesNum = Number.parseInt(minutes || "0");

              if (period && period.toUpperCase() === "PM" && hoursNum !== 12) {
                hoursNum += 12;
              } else if (
                period &&
                period.toUpperCase() === "AM" &&
                hoursNum === 12
              ) {
                hoursNum = 0;
              }

              processedRow.Hora = `${hoursNum.toString().padStart(2, "0")}:${minutesNum.toString().padStart(2, "0")}`;
            }
          } else {
            const [hours, minutes] = timeStr.split(":");
            const hoursNum = Number.parseInt(hours || "0");
            const minutesNum = Number.parseInt(minutes || "0");

            if (!Number.isNaN(hoursNum) && !Number.isNaN(minutesNum)) {
              processedRow.Hora = `${hoursNum.toString().padStart(2, "0")}:${minutesNum.toString().padStart(2, "0")}`;
            }
          }
        }
      }

      // Combine date and time
      if (processedRow.Día && processedRow.Hora) {
        try {
          let baseDate: Date;

          if (typeof processedRow.Día === "string") {
            if (processedRow.Día.includes("/")) {
              const [month, day, year] = processedRow.Día.split("/");
              const fullYear =
                Number.parseInt(year || "0") < 50
                  ? 2000 + Number.parseInt(year || "0")
                  : 1900 + Number.parseInt(year || "0");
              baseDate = new Date(
                fullYear,
                Number.parseInt(month || "1") - 1,
                Number.parseInt(day || "1")
              );
            } else {
              baseDate = new Date(processedRow.Día);
            }
          } else if (processedRow.Día instanceof Date) {
            baseDate = new Date(processedRow.Día);
          } else {
            throw new Error("Invalid date format");
          }

          if (Number.isNaN(baseDate.getTime())) {
            throw new Error("Invalid date");
          }

          if (processedRow.Hora.includes(":")) {
            const [hours, minutes] = processedRow.Hora.split(":").map(Number);

            if (
              hours !== undefined &&
              minutes !== undefined &&
              !Number.isNaN(hours) &&
              !Number.isNaN(minutes) &&
              hours >= 0 &&
              hours <= 23 &&
              minutes >= 0 &&
              minutes <= 59
            ) {
              const completeDate = new Date(baseDate);
              completeDate.setHours(hours || 0, minutes || 0, 0, 0);

              if (!Number.isNaN(completeDate.getTime())) {
                processedRow.Día = completeDate.toISOString();
                // Keep original time
                processedRow.HoraOriginal = processedRow.Hora;
              }
            }
          }
        } catch (_error) {
          // Keep fields separate if error
        }
      }

      // Process week
      if (processedRow.Semana) {
        processedRow.Semana = Number.parseInt(String(processedRow.Semana)) || 1;
      } else {
        processedRow.Semana = 1;
      }

      return processedRow;
    });
}

// Function to generate class table
function generateClassTable(
  data: ExcelRow[],
  systemInstructors: SystemInstructor[],
  systemDisciplines: SystemDiscipline[],
  initialWeek: number
): {
  tablaClases: {
    clases: ClassItem[];
    totalClases: number;
    clasesValidas: number;
    clasesConErrores: number;
    clasesEliminadas: number;
  };
  mapeoDisciplinas: Record<string, string>;
} {
  const classes: ClassItem[] = [];
  const disciplineMapping: Record<string, string> = {};
  const excelDisciplines = new Set<string>();
  const excelInstructors = new Set<string>();

  data.forEach((row, index) => {
    const excelWeek = row.Semana || 1;

    if (excelWeek < initialWeek || excelWeek > initialWeek + 3) {
      return;
    }

    const mappedWeek = excelWeek - initialWeek + 1;

    // Detect VS instructors
    const instructorName = row.Instructor || "";
    const isVSInstructor =
      instructorName.toLowerCase().includes(" vs ") ||
      instructorName.toLowerCase().includes(" vs. ") ||
      instructorName.toLowerCase().includes(" vs.");

    if (isVSInstructor) {
      const vsInstructors = instructorName
        .split(/ vs\.? /i)
        .map((instr: string) => instr.trim());

      vsInstructors.forEach((instructor: string, vsIndex: number) => {
        const vsId = row.ID_clase
          ? `${row.ID_clase}${String.fromCharCode(97 + vsIndex)}`
          : `clase-vs-${vsIndex}-${Date.now()}`;

        const vsClass: ClassItem = {
          id: vsId,
          filaOriginal: index + 1,
          pais: row.País || "Perú",
          ciudad: row.Ciudad || "Lima",
          instructor: instructor,
          disciplina: row.Disciplina || "",
          estudio: row.Estudio || "",
          salon: row.Salon || "",
          dia:
            typeof row.Día === "string" && row.Día.includes("T")
              ? row.Día
              : row.Día instanceof Date
                ? row.Día.toISOString()
                : String(row.Día),
          hora: row.HoraOriginal || row.Hora || "",
          semana: mappedWeek,
          reservasTotales: Number(row["Reservas Totales"] || 0),
          listasEspera: Number(row["Listas de Espera"] || 0),
          cortesias: Number(row.Cortesias || 0),
          lugares: Number(row.Lugares || 0),
          reservasPagadas: Number(row["Reservas Pagadas"] || 0),
          textoEspecial: row["Texto espcial"] || "",
          esInstructorVS: true,
          instructoresVS: vsInstructors,
          mapeoDisciplina: systemDisciplines.some(
            (discipline) =>
              discipline.name.toLowerCase() ===
              (row.Disciplina || "").toLowerCase()
          )
            ? row.Disciplina
            : undefined,
          mapeoSemana: mappedWeek,
          instructorExiste: systemInstructors.some(
            (instr) => instr.name.toLowerCase() === instructor.toLowerCase()
          ),
          instructorNuevo: !systemInstructors.some(
            (instr) => instr.name.toLowerCase() === instructor.toLowerCase()
          ),
          eliminada: false,
          errores: [],
        };

        classes.push(vsClass);
      });

      return;
    }

    excelDisciplines.add(row.Disciplina || "");
    excelInstructors.add(row.Instructor || "");

    const instructorExists = systemInstructors.some(
      (instructor: SystemInstructor) =>
        instructor.name.toLowerCase() === (row.Instructor || "").toLowerCase()
    );

    const disciplineExists = systemDisciplines.some(
      (discipline: SystemDiscipline) =>
        discipline.name.toLowerCase() === (row.Disciplina || "").toLowerCase()
    );

    const classItem: ClassItem = {
      id: row.ID_clase || `clase-${index}`,
      filaOriginal: index + 1,
      pais: row.País || "Perú",
      ciudad: row.Ciudad || "Lima",
      instructor: row.Instructor || "",
      disciplina: row.Disciplina || "",
      estudio: row.Estudio || "",
      salon: row.Salon || "",
      dia:
        typeof row.Día === "string" && row.Día.includes("T")
          ? row.Día
          : row.Día instanceof Date
            ? row.Día.toISOString()
            : String(row.Día),
      hora: row.HoraOriginal || row.Hora || "",
      semana: mappedWeek,
      reservasTotales: Number(row["Reservas Totales"] || 0),
      listasEspera: Number(row["Listas de Espera"] || 0),
      cortesias: Number(row.Cortesias || 0),
      lugares: Number(row.Lugares || 0),
      reservasPagadas: Number(row["Reservas Pagadas"] || 0),
      textoEspecial: row["Texto espcial"] || "",
      esInstructorVS: false,
      instructoresVS: undefined,
      mapeoDisciplina: disciplineExists ? row.Disciplina : undefined,
      mapeoSemana: mappedWeek,
      instructorExiste: instructorExists,
      instructorNuevo: !instructorExists,
      eliminada: false,
      errores: [],
    };

    classes.push(classItem);
  });

  // Generate discipline mapping
  excelDisciplines.forEach((excelDiscipline) => {
    const disciplineExists = systemDisciplines.some(
      (discipline: SystemDiscipline) =>
        discipline.name.toLowerCase() === excelDiscipline.toLowerCase()
    );

    if (!disciplineExists) {
      const similarDiscipline = systemDisciplines.find(
        (discipline: SystemDiscipline) =>
          discipline.name
            .toLowerCase()
            .includes(excelDiscipline.toLowerCase()) ||
          excelDiscipline.toLowerCase().includes(discipline.name.toLowerCase())
      );

      if (similarDiscipline) {
        disciplineMapping[excelDiscipline] = similarDiscipline.name;
      }
    }
  });

  const totalClasses = classes.length;
  const validClasses = classes.filter((c) => !c.eliminada).length;
  const classesWithErrors = classes.filter(
    (c) => c.errores && c.errores.length > 0
  ).length;
  const deletedClasses = classes.filter((c) => c.eliminada).length;

  const classTable = {
    clases: classes,
    totalClases: totalClasses,
    clasesValidas: validClasses,
    clasesConErrores: classesWithErrors,
    clasesEliminadas: deletedClasses,
  };

  return { tablaClases: classTable, mapeoDisciplinas: disciplineMapping };
}

// Function to process date and time
function processDateTime(day: string | Date, time: string): Date | null {
  let date: Date | null = null;

  if (day instanceof Date && !Number.isNaN(day.getTime())) {
    date = new Date(day);
  } else if (typeof day === "string") {
    try {
      date = new Date(day);
      if (Number.isNaN(date.getTime())) {
        const parts = day.split("/");
        if (parts.length === 3) {
          date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
          date = new Date(day);
        }
      }
    } catch (_error) {
      return null;
    }
  }

  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  if (time) {
    const timeStr = String(time).trim();

    if (timeStr.includes(":")) {
      if (
        timeStr.includes("a. m.") ||
        timeStr.includes("p. m.") ||
        timeStr.includes("(hora peruana)")
      ) {
        const cleanTime = timeStr
          .replace(/\s*\(hora peruana\)/g, "")
          .replace(/\s*a\.\s*m\./g, " AM")
          .replace(/\s*p\.\s*m\./g, " PM")
          .replace(/\s+/g, " ")
          .trim();

        const match = cleanTime.match(
          /^(\d{1,2}):(\d{1,2}):(\d{1,2})\s*(AM|PM)$/i
        );
        if (match) {
          const [_, hours, minutes, _seconds, period] = match;
          let hoursNum = Number.parseInt(hours || "0");
          const minutesNum = Number.parseInt(minutes || "0");

          if (period && period.toUpperCase() === "PM" && hoursNum !== 12) {
            hoursNum += 12;
          } else if (
            period &&
            period.toUpperCase() === "AM" &&
            hoursNum === 12
          ) {
            hoursNum = 0;
          }

          date.setHours(hoursNum, minutesNum, 0, 0);
        }
      } else {
        const [hoursStr, minutesStr] = timeStr.split(":");
        const hours = Number.parseInt(hoursStr || "0", 10);
        const minutes = Number.parseInt(minutesStr || "0", 10);

        if (
          !Number.isNaN(hours) &&
          !Number.isNaN(minutes) &&
          hours >= 0 &&
          hours <= 23 &&
          minutes >= 0 &&
          minutes <= 59
        ) {
          date.setHours(hours, minutes, 0, 0);
        }
      }
    } else if (timeStr.match(/^\d{1,2}$/)) {
      const hours = Number.parseInt(timeStr, 10);
      if (hours >= 0 && hours <= 23) {
        date.setHours(hours, 0, 0, 0);
      }
    } else if (timeStr.match(/^\d{1,2}:\d{2}\s*(AM|PM)$/i)) {
      const match = timeStr.match(/^(\d{1,2}):(\d{1,2})\s*(AM|PM)$/i);
      if (match) {
        const [_, hours, minutes, period] = match;
        let hoursNum = Number.parseInt(hours || "0");
        const minutesNum = Number.parseInt(minutes || "0");

        if (period && period.toUpperCase() === "PM" && hoursNum !== 12) {
          hoursNum += 12;
        } else if (period && period.toUpperCase() === "AM" && hoursNum === 12) {
          hoursNum = 0;
        }

        date.setHours(hoursNum, minutesNum, 0, 0);
      }
    }
  } else {
    date.setHours(12, 0, 0, 0);
  }

  return date;
}
