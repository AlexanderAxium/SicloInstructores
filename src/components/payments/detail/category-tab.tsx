"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CATEGORIES_CONFIG, mostrarCategoriaVisual } from "@/lib/config";
import type { Class } from "@/types/classes";
import type {
  DisciplineFromAPI,
  InstructorFromAPI,
  PeriodFromAPI,
} from "@/types/instructor";
import type { InstructorPaymentFromAPI } from "@/types/payments";
import type { CategoryRequirementsES, FormulaFromAPI } from "@/types/schema";
import { Award, CheckCircle2, Users, XCircle } from "lucide-react";

interface CategoryTabProps {
  instructor: InstructorFromAPI & {
    categories?: Array<{
      id: string;
      category: string;
      isManual: boolean;
      metrics?: Record<string, unknown> | null;
      discipline: { name: string; color?: string | null };
      period: { number: number; year: number };
    }>;
  };
  payment: InstructorPaymentFromAPI;
  period: PeriodFromAPI;
  disciplines: DisciplineFromAPI[];
  instructorClasses: Class[];
  formulas: FormulaFromAPI[];
}

export function CategoryTab({
  instructor,
  payment,
  period,
  disciplines,
  instructorClasses,
  formulas,
}: CategoryTabProps) {
  // Get categories for current period
  const categoriesForPeriod = (instructor.categories || []).filter(
    (cat) =>
      cat.period.number === period.number && cat.period.year === period.year
  );

  // Get categories by discipline
  const categoriesByDiscipline = categoriesForPeriod
    .map((cat) => {
      // Safety check: ensure disciplines is an array
      if (!Array.isArray(disciplines)) {
        return {
          disciplinaId: "",
          disciplina: cat.discipline.name || "",
          categoria: cat.category,
          metrics: cat.metrics || {},
        };
      }
      const discipline = disciplines.find(
        (d) => d.name === cat.discipline.name
      );
      return {
        disciplinaId: discipline?.id || "",
        disciplina: cat.discipline.name || discipline?.name || "",
        categoria: cat.category,
        metrics: cat.metrics || {},
      };
    })
    // Filter out disciplines that should not show visual category
    .filter((cat) => mostrarCategoriaVisual(cat.disciplina));

  const displayCategoryBadge = (category: string, disciplineName: string) => {
    const categoryName =
      CATEGORIES_CONFIG.DISPLAY_NAMES[
        category as keyof typeof CATEGORIES_CONFIG.DISPLAY_NAMES
      ] || category;
    const categoryColor =
      CATEGORIES_CONFIG.BADGE_COLORS[
        category as keyof typeof CATEGORIES_CONFIG.BADGE_COLORS
      ] || "bg-gray-100 text-gray-800 border-gray-200";

    if (!mostrarCategoriaVisual(disciplineName)) {
      return null;
    }

    return (
      <Badge variant="outline" className={categoryColor}>
        {categoryName}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-lg font-medium flex items-center text-foreground">
          <Award className="h-5 w-5 mr-2 text-primary" />
          Factores de Cálculo
        </h3>
      </div>
      <Separator className="my-2 bg-border" />

      {/* Categorías por disciplina */}
      {categoriesByDiscipline.length === 0 ? (
        <div className="text-center py-8 bg-card rounded-lg border shadow-sm">
          <Award className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            Sin categorías asignadas
          </h3>
          <p className="mt-2 text-sm text-muted-foreground px-4">
            Este instructor no tiene categorías asignadas para el periodo
            actual.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {categoriesByDiscipline.map((categoria, index) => {
            const disciplina = Array.isArray(disciplines)
              ? disciplines.find((d) => d.name === categoria.disciplina)
              : undefined;
            const metricasReales =
              (categoria.metrics as Record<string, number>) || {};

            return (
              <Card
                key={`${categoria.disciplinaId}-${categoria.categoria}-${index}`}
                className="border border-border overflow-hidden bg-card shadow-sm"
              >
                <CardHeader className="border-b border-border bg-card p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor: disciplina?.color || "#6366F1",
                        }}
                      />
                      <CardTitle className="text-base sm:text-lg text-foreground font-bold">
                        {categoria.disciplina}
                      </CardTitle>
                    </div>
                    {displayCategoryBadge(
                      categoria.categoria,
                      categoria.disciplina
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                    <div className="p-3 sm:p-4 border-b border-border sm:border-r sm:border-b-0">
                      <h4 className="text-sm font-medium mb-2 flex items-center text-foreground">
                        <Users className="h-4 w-4 mr-2 text-primary" />
                        Métricas de Rendimiento
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            Ocupación:
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              (metricasReales.averageOccupancy || 0) >= 80
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : (metricasReales.averageOccupancy || 0) >= 50
                                  ? "bg-amber-50 text-amber-600 border-amber-200"
                                  : "bg-rose-50 text-rose-600 border-rose-200"
                            }`}
                          >
                            {metricasReales.averageOccupancy || 0}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            Total de Clases:
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs bg-primary/10 text-primary border-primary/20"
                          >
                            {metricasReales.totalClasses || 0}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            Locales en Lima:
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs bg-primary/10 text-primary border-primary/20"
                          >
                            {metricasReales.totalLocations || 0}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4">
                      <h4 className="text-sm font-medium mb-2 flex items-center text-foreground">
                        <Award className="h-4 w-4 mr-2 text-primary" />
                        Factores de Cálculo
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            Dobleteos:
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            {payment.doubleShifts || 0}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            Horarios No Prime:
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs bg-amber-50 text-amber-700 border-amber-200"
                          >
                            {payment.nonPrimeHours || 0}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            Participación Eventos:
                          </span>
                          <div className="flex items-center">
                            {payment.eventParticipation ? (
                              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-rose-600 mr-1" />
                            )}
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                payment.eventParticipation
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {payment.eventParticipation ? "Sí" : "No"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            Cumple Lineamientos:
                          </span>
                          <div className="flex items-center">
                            {payment.meetsGuidelines ? (
                              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-rose-600 mr-1" />
                            )}
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                payment.meetsGuidelines
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {payment.meetsGuidelines ? "Sí" : "No"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border-t border-border bg-muted/10">
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        Última actualización: {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Criterios section */}
      <div className="bg-card p-3 sm:p-4 rounded-lg border border-border shadow-sm">
        <h4 className="text-sm font-medium mb-3 text-foreground">
          Criterios de Cálculo por Disciplina
        </h4>

        {Array.isArray(disciplines) &&
        disciplines.length > 0 &&
        formulas.length > 0 ? (
          <div className="space-y-4">
            {disciplines
              .filter(
                (d) =>
                  instructorClasses.some((c) => c.disciplineId === d.id) &&
                  mostrarCategoriaVisual(d.name)
              )
              .map((disciplina) => {
                // Find formula for this discipline (formulas already filtered by period from API)
                const formula = formulas.find(
                  (f) => f.disciplineId === disciplina.id
                );

                if (!formula) return null;

                const requisitos = formula.categoryRequirements as Record<
                  string,
                  CategoryRequirementsES
                >;

                const instructorCategory =
                  categoriesForPeriod.find(
                    (cat) =>
                      cat.period.number === period.number &&
                      cat.discipline.name === disciplina.name
                  )?.category || "INSTRUCTOR";

                // Mapear las categorías del instructor a las claves del backend
                const categoryMapping: Record<string, string> = {
                  INSTRUCTOR: "INSTRUCTOR",
                  JUNIOR_AMBASSADOR: "EMBAJADOR_JUNIOR",
                  AMBASSADOR: "EMBAJADOR",
                  SENIOR_AMBASSADOR: "EMBAJADOR_SENIOR",
                };

                const currentCategory =
                  categoryMapping[instructorCategory] || "INSTRUCTOR";

                return (
                  <div key={disciplina.id} className="mb-4">
                    <div className="flex items-center mb-2">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor: disciplina.color || "#6366F1",
                        }}
                      />
                      <h5 className="font-medium text-sm sm:text-base text-foreground">
                        {disciplina.name}
                      </h5>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr>
                            <th className="border border-border p-2 text-left bg-muted/50 font-medium">
                              Criterio
                            </th>
                            <th className="border border-border p-2 text-center bg-muted/50 font-medium">
                              Instructor
                            </th>
                            <th className="border border-border p-2 text-center bg-muted/50 font-medium">
                              Embajador Junior
                            </th>
                            <th className="border border-border p-2 text-center bg-muted/50 font-medium">
                              Embajador
                            </th>
                            <th className="border border-border p-2 text-center bg-muted/50 font-medium">
                              Embajador Senior
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { key: "ocupacion", label: "Ocupación (%)" },
                            { key: "clases", label: "Clases por Semana" },
                            { key: "localesEnLima", label: "Locales en Lima" },
                            { key: "dobleteos", label: "Dobleteos" },
                            {
                              key: "horariosNoPrime",
                              label: "Horarios No Prime",
                            },
                            {
                              key: "participacionEventos",
                              label: "Participación Eventos",
                            },
                            {
                              key: "lineamientos",
                              label: "Cumple Lineamientos",
                            },
                          ].map(({ key, label }) => {
                            // Función para obtener la clase CSS según la categoría asignada
                            const getCellClass = (categoryKey: string) => {
                              const isAssigned =
                                categoryKey === currentCategory;
                              const hasValue =
                                requisitos?.[categoryKey]?.[key] !==
                                  undefined &&
                                requisitos[categoryKey][key] !== null;

                              if (isAssigned && hasValue) {
                                // Categoría asignada con valor - verde sutil
                                return "bg-green-50 border-green-200 text-green-800 font-semibold";
                              }
                              if (hasValue) {
                                // Tiene valor pero no es la categoría asignada - fondo neutro
                                return "bg-muted/30 text-foreground";
                              }
                              if (isAssigned) {
                                // Categoría asignada sin valor - amarillo sutil
                                return "bg-yellow-50 border-yellow-200 text-yellow-800 font-semibold";
                              }
                              // Sin valor - fondo neutro
                              return "bg-muted/20 text-muted-foreground";
                            };

                            return (
                              <tr key={key}>
                                <td className="border border-border p-2 font-semibold text-gray-900 bg-gray-100">
                                  {label}
                                </td>
                                <td
                                  className={`border border-border p-2 text-center ${getCellClass("INSTRUCTOR")}`}
                                >
                                  {typeof requisitos?.INSTRUCTOR?.[key] ===
                                  "boolean"
                                    ? requisitos.INSTRUCTOR[key]
                                      ? "Sí"
                                      : "No"
                                    : (requisitos?.INSTRUCTOR?.[key] ?? "-")}
                                </td>
                                <td
                                  className={`border border-border p-2 text-center ${getCellClass("EMBAJADOR_JUNIOR")}`}
                                >
                                  {typeof requisitos?.EMBAJADOR_JUNIOR?.[
                                    key
                                  ] === "boolean"
                                    ? requisitos.EMBAJADOR_JUNIOR[key]
                                      ? "Sí"
                                      : "No"
                                    : (requisitos?.EMBAJADOR_JUNIOR?.[key] ??
                                      "-")}
                                </td>
                                <td
                                  className={`border border-border p-2 text-center ${getCellClass("EMBAJADOR")}`}
                                >
                                  {typeof requisitos?.EMBAJADOR?.[key] ===
                                  "boolean"
                                    ? requisitos.EMBAJADOR[key]
                                      ? "Sí"
                                      : "No"
                                    : (requisitos?.EMBAJADOR?.[key] ?? "-")}
                                </td>
                                <td
                                  className={`border border-border p-2 text-center ${getCellClass("EMBAJADOR_SENIOR")}`}
                                >
                                  {typeof requisitos?.EMBAJADOR_SENIOR?.[
                                    key
                                  ] === "boolean"
                                    ? requisitos.EMBAJADOR_SENIOR[key]
                                      ? "Sí"
                                      : "No"
                                    : (requisitos?.EMBAJADOR_SENIOR?.[key] ??
                                      "-")}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No hay criterios de categoría disponibles
          </div>
        )}
      </div>
    </div>
  );
}
