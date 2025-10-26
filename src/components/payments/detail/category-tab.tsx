"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Class } from "@/types/classes";
import type {
  DisciplineFromAPI,
  InstructorFromAPI,
  PeriodFromAPI,
} from "@/types/instructor";
import type { InstructorPaymentFromAPI } from "@/types/payments";
import type { FormulaFromAPI } from "@/types/schema";
import { Award, CheckCircle2, Edit, Users, XCircle } from "lucide-react";

interface CategoryTabProps {
  instructor: InstructorFromAPI;
  payment: InstructorPaymentFromAPI;
  period: PeriodFromAPI;
  disciplines: DisciplineFromAPI[];
  instructorClasses: Class[];
  formulas: FormulaFromAPI[];
}

export function CategoryTab({
  instructor: _instructor,
  payment,
  instructorClasses,
}: CategoryTabProps) {
  // Placeholder implementation - can be enhanced with full category logic

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-lg font-medium flex items-center text-foreground">
          <Award className="h-5 w-5 mr-2 text-primary" />
          Factores de Cálculo
        </h3>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 bg-card border border-border hover:bg-muted/10 text-muted-foreground hover:text-foreground w-full sm:w-auto"
          >
            <Edit className="h-4 w-4 mr-1" />
            <span className="sm:inline">Editar Factores</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700 hover:text-blue-800 w-full sm:w-auto"
          >
            <Award className="h-4 w-4 mr-1" />
            <span className="sm:inline">Recalcular Categorías</span>
          </Button>
        </div>
      </div>
      <Separator className="my-2 bg-border" />

      {/* Categorías por disciplina */}
      <div className="space-y-4">
        <Card className="border border-border overflow-hidden bg-card shadow-sm">
          <CardHeader className="border-b border-border bg-card p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-primary" />
                <CardTitle className="text-base sm:text-lg text-foreground font-bold">
                  Categoría del Instructor
                </CardTitle>
              </div>
              <Badge variant="outline" className="bg-muted/10">
                INSTRUCTOR
              </Badge>
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
                    <div className="flex items-center gap-2">
                      <div className="relative w-16 sm:w-24 h-3 bg-border rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full rounded-full bg-emerald-500"
                          style={{ width: "75%" }}
                        >
                          <span className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[9px] font-medium text-white">
                            75%
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs bg-emerald-50 text-emerald-600 border-emerald-200"
                      >
                        75%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Clases por Semana:
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs bg-primary/10 text-primary border-primary/20"
                    >
                      {instructorClasses.length}
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
                      1
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

        {/* Criterios section */}
        <div className="bg-card p-3 sm:p-4 rounded-lg border border-border shadow-sm">
          <h4 className="text-sm font-medium mb-3 text-foreground">
            Criterios de Cálculo por Disciplina
          </h4>

          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Información de criterios de categorización</p>
            <p className="text-xs mt-1">
              Los criterios se basan en ocupación, clases por semana, locales, y
              factores adicionales
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
