import { prisma } from "@/lib/db";
import type { Class, Cover, Discipline } from "@/types";
import type { Branding, ThemeRide, Workshop } from "@/types";
import type { Penalty } from "@/types";
import { getOrCalculateCategory } from "./category-calculator";

export interface ClassCalculationResult {
  classId: string;
  calculatedAmount: number;
  disciplineId: string;
  disciplineName: string;
  classDate: Date;
  calculationDetail: string;
  category: string;
  isVersus: boolean;
  versusNumber?: number | null;
  isFullHouse: boolean;
  studio: string;
  hour: string;
  spots: number;
  totalReservations: number;
  occupancy: number;
}

export interface BonusCalculation {
  cover: number;
  branding: number;
  themeRide: number;
  workshop: number;
  versus: number;
  total: number;
}

export interface PaymentCalculationData {
  baseAmount: number;
  bonuses: BonusCalculation;
  penalties: number;
  retention: number;
  finalPayment: number;
  classCalculations: ClassCalculationResult[];
}

type PaymentParameters = {
  tarifaFullHouse?: number;
  tarifas?: Array<{ numeroReservas: number; tarifa: number }>;
  cuotaFija?: number;
  minimoGarantizado?: number;
  maximo?: number;
};

type FormulaShape = {
  paymentParameters: Record<string, PaymentParameters>;
};

/**
 * Calculate payment for a single class
 */
export async function calculateClassPayment(
  clase: Class,
  instructorCategory: string,
  formula: FormulaShape,
  discipline: Pick<Discipline, "name">,
  logs: string[]
): Promise<ClassCalculationResult> {
  try {
    logs.push(`🧮 Calculando pago para clase ${clase.id}...`);

    let classForCalculation = { ...clase };
    let isFullHouseByCover = false;

    // Check for Full House by cover
    if (clase.specialText?.toLowerCase().includes("full house")) {
      isFullHouseByCover = true;
      classForCalculation = {
        ...classForCalculation,
        totalReservations: classForCalculation.spots, // Force 100% occupancy
      };
      logs.push(`🏠 FULL HOUSE por cover detectado para clase ${clase.id}`);
    }

    // Check for Versus
    if (clase.isVersus && clase.versusNumber && clase.versusNumber > 1) {
      logs.push(
        `⚖️ Clase VERSUS detectada (${clase.versusNumber} instructores)`
      );
    }

    // Get payment parameters from formula
    const paymentParams = formula.paymentParameters[instructorCategory];
    if (!paymentParams) {
      throw new Error(
        `No se encontraron parámetros de pago para la categoría: ${instructorCategory}`
      );
    }

    // Determine tariff based on reservations
    const reservations = classForCalculation.totalReservations || 0;
    const capacity = classForCalculation.spots || 0;

    let tariff = 0;
    let tariffType = "";

    // Check if it's full house
    if (reservations >= capacity && capacity > 0) {
      tariff = paymentParams.tarifaFullHouse || 0;
      tariffType = "Full House";
    } else {
      // Find appropriate tariff based on reservations
      const tarifas = paymentParams.tarifas || [];
      const sortedTarifas = [...tarifas].sort(
        (a, b) => a.numeroReservas - b.numeroReservas
      );

      for (const tariffOption of sortedTarifas) {
        if (reservations <= tariffOption.numeroReservas) {
          tariff = tariffOption.tarifa;
          tariffType = `Hasta ${tariffOption.numeroReservas} reservas`;
          break;
        }
      }

      if (tariff === 0 && sortedTarifas.length > 0) {
        tariff = sortedTarifas[sortedTarifas.length - 1].tarifa;
        tariffType = "Tarifa máxima";
      }
    }

    // Calculate base amount
    let calculatedAmount = tariff * reservations;

    // Apply fixed quota if exists
    if (paymentParams.cuotaFija && paymentParams.cuotaFija > 0) {
      calculatedAmount += paymentParams.cuotaFija;
    }

    // Apply minimum guaranteed
    if (
      paymentParams.minimoGarantizado &&
      paymentParams.minimoGarantizado > calculatedAmount
    ) {
      calculatedAmount = paymentParams.minimoGarantizado;
    }

    // Apply maximum limit
    if (paymentParams.maximo && paymentParams.maximo < calculatedAmount) {
      calculatedAmount = paymentParams.maximo;
    }

    // Apply versus division
    if (clase.isVersus && clase.versusNumber && clase.versusNumber > 1) {
      calculatedAmount = calculatedAmount / clase.versusNumber;
    }

    const calculationDetail = `${reservations} reservas × S/.${tariff.toFixed(2)} = S/.${calculatedAmount.toFixed(2)} (${tariffType})`;

    logs.push(
      `💰 PAGO POR CLASE [${clase.id}]: ${discipline.name} - ${new Date(clase.date).toLocaleDateString()}`
    );
    logs.push(
      `   Monto: ${calculatedAmount.toFixed(2)} | Categoría: ${instructorCategory}`
    );
    logs.push(
      `   Reservas: ${reservations}/${capacity} (${Math.round((reservations / capacity) * 100)}% ocupación)`
    );
    logs.push(`   Detalle: ${calculationDetail}`);

    // Calculate occupancy
    const occupancy =
      capacity > 0 ? Math.round((reservations / capacity) * 100) : 0;

    return {
      classId: clase.id,
      calculatedAmount,
      disciplineId: clase.disciplineId,
      disciplineName: discipline.name,
      classDate: clase.date,
      calculationDetail,
      category: instructorCategory,
      isVersus: clase.isVersus,
      versusNumber: clase.versusNumber,
      isFullHouse: isFullHouseByCover,
      studio: clase.studio,
      hour: clase.date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      spots: capacity,
      totalReservations: reservations,
      occupancy,
    };
  } catch (error) {
    logs.push(
      `❌ Error al calcular pago para clase ${clase.id}: ${error instanceof Error ? error.message : "Error desconocido"}`
    );
    throw error;
  }
}

/**
 * Calculate additional bonuses
 */
export function calculateAdditionalBonuses(
  instructor: {
    coversAsReplacement: Cover[];
    brandings: Branding[];
    themeRides: ThemeRide[];
    workshops: Workshop[];
  },
  _periodId: string,
  logs: string[]
): BonusCalculation {
  const covers = instructor.coversAsReplacement || [];
  const brandings = instructor.brandings || [];
  const themeRides = instructor.themeRides || [];
  const workshops = instructor.workshops || [];

  logs.push(`🔄 Covers como reemplazo: ${covers.length}`);
  logs.push(`🏆 Brandeos del instructor: ${brandings.length}`);
  logs.push(`⚡ Theme Rides del instructor: ${themeRides.length}`);
  logs.push(`🎓 Workshops del instructor: ${workshops.length}`);

  // Calculate cover bonus (S/.30 per cover with bonus)
  const coversWithBonus = covers.filter((cover) => cover.bonusPayment);
  const coverBonus = coversWithBonus.length * 30;
  logs.push(
    `🔄 Covers con bono: ${coversWithBonus.length} x S/.30 = S/.${coverBonus}`
  );

  // Calculate branding bonus (S/.50 per branding)
  const brandingBonus = brandings.length * 50;
  logs.push(`🏆 Brandeos: ${brandings.length} x S/.50 = S/.${brandingBonus}`);

  // Calculate theme ride bonus (S/.40 per theme ride)
  const themeRideBonus = themeRides.length * 40;
  logs.push(
    `⚡ Theme Rides: ${themeRides.length} x S/.40 = S/.${themeRideBonus}`
  );

  // Calculate workshop bonus (variable amount)
  const workshopBonus = workshops.reduce(
    (total: number, workshop) => total + workshop.payment,
    0
  );
  logs.push(`🎓 Workshops: S/.${workshopBonus.toFixed(2)}`);

  // Versus bonus is calculated per class, not per instructor
  const versusBonus = 0;

  const total =
    coverBonus + brandingBonus + themeRideBonus + workshopBonus + versusBonus;

  return {
    cover: coverBonus,
    branding: brandingBonus,
    themeRide: themeRideBonus,
    workshop: workshopBonus,
    versus: versusBonus,
    total,
  };
}

/**
 * Calculate penalties
 */
export function calculatePenalties(
  penalties: Pick<Penalty, "points">[],
  baseAmount: number,
  logs: string[]
): number {
  if (penalties.length === 0) {
    return 0;
  }

  const totalPoints = penalties.reduce(
    (sum, penalty) => sum + penalty.points,
    0
  );
  const maxAllowedPoints = 10; // This should come from configuration
  const excessPoints = Math.max(0, totalPoints - maxAllowedPoints);

  // Calculate penalty percentage (max 10%)
  const penaltyPercentage = Math.min(excessPoints * 2, 10); // 2% per excess point, max 10%
  const penaltyAmount = (baseAmount * penaltyPercentage) / 100;

  logs.push(
    `⚠️ Penalizaciones: ${totalPoints} puntos totales, ${excessPoints} excedentes`
  );
  logs.push(
    `💰 Descuento por penalizaciones: ${penaltyPercentage}% = S/.${penaltyAmount.toFixed(2)}`
  );

  return penaltyAmount;
}

/**
 * Calculate complete payment for an instructor
 */
export async function calculateInstructorPaymentData(
  instructorId: string,
  periodId: string,
  tenantId: string,
  logs: string[]
): Promise<PaymentCalculationData> {
  // Load instructor with all related data
  const instructor = await prisma.instructor.findUnique({
    where: {
      id: instructorId,
      tenantId: tenantId,
    },
    include: {
      classes: {
        where: { periodId },
        include: { discipline: true },
      },
      penalties: { where: { periodId } },
      categories: {
        where: { periodId },
        include: { discipline: true },
      },
      coversAsReplacement: { where: { periodId } },
      brandings: { where: { periodId } },
      themeRides: { where: { periodId } },
      workshops: { where: { periodId } },
    },
  });

  if (!instructor) {
    throw new Error("Instructor no encontrado");
  }

  const classes = instructor.classes;
  const penalties = instructor.penalties;
  const categories = instructor.categories;

  logs.push(`📝 Clases del instructor: ${classes.length}`);
  logs.push(`⚠️ Penalizaciones del instructor: ${penalties.length}`);

  if (classes.length === 0) {
    throw new Error("No hay clases para este instructor en este período");
  }

  // Calculate payment by class
  let totalAmount = 0;
  const classCalculations: ClassCalculationResult[] = [];

  // Group classes by discipline
  const classesByDiscipline = new Map<string, typeof classes>();
  classes.forEach((clase) => {
    if (!classesByDiscipline.has(clase.disciplineId)) {
      classesByDiscipline.set(clase.disciplineId, []);
    }
    classesByDiscipline.get(clase.disciplineId)?.push(clase);
  });

  // Calculate for each discipline
  for (const [disciplineId, disciplineClasses] of classesByDiscipline) {
    const discipline = disciplineClasses[0]?.discipline;
    if (!discipline) continue;

    // Get formula for this discipline and period
    const formula = await prisma.formula.findUnique({
      where: {
        disciplineId_periodId_tenantId: {
          disciplineId: disciplineId,
          periodId: periodId,
          tenantId: tenantId,
        },
      },
    });

    if (!formula) {
      logs.push(
        `⚠️ No se encontró fórmula para disciplina ${discipline.name}, saltando...`
      );
      continue;
    }

    // Get or calculate instructor category for this discipline
    let instructorCategory: string;

    // First check if there's an existing category
    const categoryInfo = categories.find(
      (c) => c.disciplineId === disciplineId
    );

    if (categoryInfo) {
      instructorCategory = categoryInfo.category;
      logs.push(
        `📋 Usando categoría existente para ${discipline.name}: ${instructorCategory}`
      );
    } else {
      // Calculate category based on formula requirements
      instructorCategory = await getOrCalculateCategory(
        instructorId,
        disciplineId,
        periodId,
        tenantId,
        logs
      );
      logs.push(
        `📋 Categoría calculada para ${discipline.name}: ${instructorCategory}`
      );
    }

    // Calculate payment for each class
    for (const clase of disciplineClasses) {
      try {
        const classResult = await calculateClassPayment(
          clase,
          instructorCategory,
          formula as unknown as FormulaShape,
          discipline,
          logs
        );

        totalAmount += classResult.calculatedAmount;
        classCalculations.push(classResult);
        logs.push(`📈 Monto acumulado: ${totalAmount.toFixed(2)}`);
      } catch (error) {
        logs.push(
          `❌ Error al calcular pago para clase ${clase.id}: ${error instanceof Error ? error.message : "Error desconocido"}`
        );
      }
    }
  }

  logs.push(`💰 Monto total por clases: ${totalAmount.toFixed(2)}`);

  // Calculate additional bonuses
  const bonuses = calculateAdditionalBonuses(
    instructor as unknown as {
      coversAsReplacement: Cover[];
      brandings: Branding[];
      themeRides: ThemeRide[];
      workshops: Workshop[];
    },
    periodId,
    logs
  );

  // Calculate penalties
  const penaltyAmount = calculatePenalties(penalties, totalAmount, logs);

  // Calculate retention (8% of base amount)
  const retentionAmount = totalAmount * 0.08;
  logs.push(`💰 Retención (8%): S/.${retentionAmount.toFixed(2)}`);

  // Calculate final payment
  const finalPayment =
    totalAmount + bonuses.total - penaltyAmount - retentionAmount;

  logs.push(`💰 Pago final: S/.${finalPayment.toFixed(2)}`);

  return {
    baseAmount: totalAmount,
    bonuses,
    penalties: penaltyAmount,
    retention: retentionAmount,
    finalPayment,
    classCalculations,
  };
}
