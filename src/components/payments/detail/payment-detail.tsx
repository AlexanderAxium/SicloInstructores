"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type {
  Class,
  Cover,
  Discipline,
  Instructor,
  InstructorPayment,
  Period,
} from "@/types";
import { BookOpen, Check, CreditCard, Edit, Loader2, X } from "lucide-react";

const RETENTION_VALUE = 0.08; // 8% retención

interface PaymentDetailsProps {
  payment: InstructorPayment;
  instructor: Instructor;
  period: Period;
  disciplines: Discipline[];
  isEditingAdjustment: boolean;
  setIsEditingAdjustment: (value: boolean) => void;
  newAdjustment: number;
  setNewAdjustment: (value: number) => void;
  adjustmentType: "FIJO" | "PORCENTAJE";
  setAdjustmentType: (value: "FIJO" | "PORCENTAJE") => void;
  isUpdatingAdjustment: boolean;
  updateAdjustment: () => void;
  formatCurrency: (amount: number) => string;
  calculatedFinalAmount: number;
  averageOccupancy: number;
  instructorClasses?: Class[];
  totalReservations?: number;
  totalCapacity?: number;
  instructorCovers?: Cover[];
}

export function PaymentDetails({
  payment,
  disciplines,
  isEditingAdjustment,
  setIsEditingAdjustment,
  newAdjustment,
  setNewAdjustment,
  adjustmentType,
  setAdjustmentType,
  isUpdatingAdjustment,
  updateAdjustment,
  formatCurrency,
  averageOccupancy,
  instructorClasses = [],
  instructorCovers = [],
}: PaymentDetailsProps) {
  // Group classes by discipline
  const classesByDiscipline = instructorClasses.reduce<Record<string, Class[]>>(
    (acc, clase) => {
      const disciplineId = clase.disciplineId;
      if (!acc[disciplineId]) {
        acc[disciplineId] = [];
      }
      acc[disciplineId].push(clase);
      return acc;
    },
    {}
  );

  // Calculate statistics by discipline
  const disciplineStats = Object.entries(classesByDiscipline)
    .map(([disciplineId, classes]) => {
      const discipline = disciplines.find((d) => d.id === disciplineId);
      const reservations = classes.reduce(
        (sum, c) => sum + (c.totalReservations || 0),
        0
      );
      const capacity = classes.reduce((sum, c) => sum + (c.spots || 0), 0);
      const occupancy =
        capacity > 0 ? Math.round((reservations / capacity) * 100) : 0;

      // Calculate base amount for this discipline (simplified)
      const baseAmount = classes.length * 30; // Simple estimation

      const retention = baseAmount * RETENTION_VALUE;
      const finalAmount = baseAmount - retention;

      return {
        disciplineId: disciplineId,
        name: discipline?.name || `Disciplina ${disciplineId}`,
        color: discipline?.color || "#6366F1",
        classes: classes.length,
        reservations,
        capacity,
        occupancy,
        baseAmount,
        retention,
        finalAmount,
      };
    })
    .sort((a, b) => b.baseAmount - a.baseAmount);

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy >= 80) return "bg-emerald-500";
    if (occupancy >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getOccupancyTextColor = (occupancy: number) => {
    if (occupancy >= 80) return "text-emerald-600";
    if (occupancy >= 50) return "text-amber-600";
    return "text-rose-600";
  };

  // Calculate totals for summary
  const totalBaseAmount = payment.amount;
  const _totalRetention = payment.retention;
  const _totalFinalAmount = disciplineStats.reduce(
    (sum, d) => sum + d.finalAmount,
    0
  );

  // Calculate adjustment amount
  const adjustmentAmount =
    payment.adjustmentType === "PORCENTAJE"
      ? totalBaseAmount * (payment.adjustment / 100)
      : payment.adjustment;

  // Calculate covers and bonuses
  const totalCover = payment.cover || 0;
  const _totalCovers = instructorCovers.length;
  const totalBranding = payment.branding || 0;
  const totalThemeRide = payment.themeRide || 0;
  const totalWorkshop = payment.workshop || 0;

  // Calculate penalty
  const totalPenalty = payment.penalty || 0;

  // Calculate subtotal and final amount with adjustments, penalties and bonuses
  const subtotal =
    totalBaseAmount +
    adjustmentAmount +
    (payment.bonus || 0) +
    totalCover +
    totalBranding +
    totalThemeRide +
    totalWorkshop -
    totalPenalty;

  // Total classes
  const totalClasses = instructorClasses.length;

  return (
    <div className="space-y-4 px-2 sm:px-0">
      {/* CARD 1: Desglose por Disciplina - Versión responsive */}
      <Card className="border border-border rounded-lg shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-border gap-2 px-4 sm:px-6">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg font-medium">
              Desglose por Disciplina
            </CardTitle>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            {disciplineStats.length} disciplinas • {totalClasses} clases •
            Ocupación:{" "}
            <span className={getOccupancyTextColor(averageOccupancy)}>
              {averageOccupancy}%
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[600px]">
            <table className="w-full text-sm">
              <thead className="bg-muted/10">
                <tr>
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground border-b border-border text-xs sm:text-sm">
                    Disciplina
                  </th>
                  <th className="text-center py-3 px-3 font-medium text-muted-foreground border-b border-border text-xs sm:text-sm">
                    Clases
                  </th>
                  <th className="text-center py-3 px-3 font-medium text-muted-foreground border-b border-border text-xs sm:text-sm">
                    Reservas
                  </th>
                  <th className="text-center py-3 px-3 font-medium text-muted-foreground border-b border-border text-xs sm:text-sm">
                    Lugares
                  </th>
                  <th className="text-center py-3 px-3 font-medium text-muted-foreground border-b border-border text-xs sm:text-sm">
                    Ocupación
                  </th>
                  <th className="text-right py-3 px-3 font-medium text-muted-foreground border-b border-border text-xs sm:text-sm">
                    Monto Base
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {disciplineStats.map((discipline) => (
                  <tr
                    key={discipline.disciplineId}
                    className="hover:bg-muted/5"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center min-w-[120px]">
                        <div
                          className="w-2.5 h-2.5 rounded-full mr-2"
                          style={{ backgroundColor: discipline.color }}
                        />
                        <span className="font-medium text-xs sm:text-sm truncate">
                          {discipline.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-xs sm:text-sm">
                      {discipline.classes}
                    </td>
                    <td className="py-3 px-3 text-center text-xs sm:text-sm">
                      {discipline.reservations}
                    </td>
                    <td className="py-3 px-3 text-center text-xs sm:text-sm">
                      {discipline.capacity}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center">
                        <div className="w-12 sm:w-16 h-2 bg-muted/30 rounded-full overflow-hidden mr-2">
                          <div
                            className={`h-full rounded-full ${getOccupancyColor(discipline.occupancy)}`}
                            style={{
                              width: `${Math.min(discipline.occupancy, 100)}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium ${getOccupancyTextColor(discipline.occupancy)}`}
                        >
                          {discipline.occupancy}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="font-medium text-xs sm:text-sm">
                        {formatCurrency(discipline.baseAmount)}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Subtotales por disciplinas */}
                <tr className="bg-muted/10 font-medium border-t-2 border-border">
                  <td colSpan={5} className="py-3 px-3 text-right" />
                  <td className="py-3 px-3 text-right font-medium text-sm sm:text-base">
                    {formatCurrency(totalBaseAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CARD 2: Resumen de Pago - Versión responsive */}
      <Card className="border border-border rounded-lg shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-border gap-2 px-4 sm:px-6">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg font-medium">
              Resumen de Pago
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs sm:text-sm bg-muted/10">
            {payment.status === "PAID" ? "APROBADO" : "PENDIENTE"}
          </Badge>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {/* Base Amount Total */}
            <div className="flex justify-between items-center py-3 px-4 sm:px-6 hover:bg-muted/5">
              <div className="text-xs sm:text-sm font-medium">
                Monto Base Total:
              </div>
              <div className="font-medium text-xs sm:text-sm">
                {formatCurrency(totalBaseAmount)}
              </div>
            </div>

            {/* Adjustment */}
            <div className="py-3 px-4 sm:px-6 hover:bg-muted/5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-medium">
                      Reajuste:
                    </span>
                    {!isEditingAdjustment && (
                      <Badge
                        variant="outline"
                        className="font-normal text-xs sm:text-xs"
                      >
                        {payment.adjustmentType === "PORCENTAJE"
                          ? `${payment.adjustment}%`
                          : "Fijo"}
                      </Badge>
                    )}
                    {!isEditingAdjustment ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 rounded-full ml-1"
                        onClick={() => {
                          setNewAdjustment(payment.adjustment);
                          setAdjustmentType(
                            payment.adjustmentType as "FIJO" | "PORCENTAJE"
                          );
                          setIsEditingAdjustment(true);
                        }}
                      >
                        <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 ml-1">
                        {isUpdatingAdjustment ? (
                          <Button
                            disabled
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setIsEditingAdjustment(false)}
                            >
                              <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-primary hover:text-primary hover:bg-primary/10"
                              onClick={updateAdjustment}
                            >
                              <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditingAdjustment && (
                    <div className="mt-3 space-y-3">
                      <RadioGroup
                        value={adjustmentType}
                        onValueChange={(value) =>
                          setAdjustmentType(value as "FIJO" | "PORCENTAJE")
                        }
                        className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="FIJO"
                            id="fijo"
                            className="h-4 w-4"
                          />
                          <Label
                            htmlFor="fijo"
                            className="text-xs sm:text-sm font-medium"
                          >
                            Fijo
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="PORCENTAJE"
                            id="porcentaje"
                            className="h-4 w-4"
                          />
                          <Label
                            htmlFor="porcentaje"
                            className="text-xs sm:text-sm font-medium"
                          >
                            Porcentaje
                          </Label>
                        </div>
                      </RadioGroup>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="relative w-full sm:max-w-[180px]">
                          <input
                            type="number"
                            value={newAdjustment}
                            onChange={(e) =>
                              setNewAdjustment(Number(e.target.value))
                            }
                            className="w-full h-9 sm:h-10 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs sm:text-sm"
                            step="0.01"
                          />
                          {adjustmentType === "PORCENTAJE" && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-xs sm:text-sm">
                              %
                            </span>
                          )}
                        </div>

                        {adjustmentType === "PORCENTAJE" && (
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            ≈{" "}
                            {formatCurrency(
                              totalBaseAmount * (newAdjustment / 100)
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className={`font-medium text-xs sm:text-sm ${
                    adjustmentAmount >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {adjustmentAmount >= 0 ? "+" : ""}
                  {formatCurrency(adjustmentAmount)}
                </div>
              </div>
            </div>

            {/* Bono */}
            {payment.bonus !== null &&
              payment.bonus !== undefined &&
              payment.bonus > 0 && (
                <div className="flex justify-between items-center py-3 px-4 sm:px-6 hover:bg-muted/5">
                  <div className="text-xs sm:text-sm font-medium">Bono:</div>
                  <div className="font-medium text-xs sm:text-sm text-emerald-600">
                    +{formatCurrency(payment.bonus)}
                  </div>
                </div>
              )}

            {/* Cover */}
            {totalCover > 0 && (
              <div className="flex justify-between items-center py-3 px-4 sm:px-6 hover:bg-muted/5">
                <div className="text-xs sm:text-sm font-medium">Covers:</div>
                <div className="font-medium text-xs sm:text-sm text-emerald-600">
                  +{formatCurrency(totalCover)}
                </div>
              </div>
            )}

            {/* Branding */}
            {totalBranding > 0 && (
              <div className="flex justify-between items-center py-3 px-4 sm:px-6 hover:bg-muted/5">
                <div className="text-xs sm:text-sm font-medium">Brandeo:</div>
                <div className="font-medium text-xs sm:text-sm text-emerald-600">
                  +{formatCurrency(totalBranding)}
                </div>
              </div>
            )}

            {/* Theme Ride */}
            {totalThemeRide > 0 && (
              <div className="flex justify-between items-center py-3 px-4 sm:px-6 hover:bg-muted/5">
                <div className="text-xs sm:text-sm font-medium">
                  Theme Ride:
                </div>
                <div className="font-medium text-xs sm:text-sm text-emerald-600">
                  +{formatCurrency(totalThemeRide)}
                </div>
              </div>
            )}

            {/* Workshop */}
            {totalWorkshop > 0 && (
              <div className="flex justify-between items-center py-3 px-4 sm:px-6 hover:bg-muted/5">
                <div className="text-xs sm:text-sm font-medium">Workshop:</div>
                <div className="font-medium text-xs sm:text-sm text-emerald-600">
                  +{formatCurrency(totalWorkshop)}
                </div>
              </div>
            )}

            {/* Penalty */}
            {totalPenalty > 0 && (
              <div className="flex justify-between items-center py-3 px-4 sm:px-6 hover:bg-muted/5">
                <div className="text-xs sm:text-sm font-medium">
                  Penalización:
                </div>
                <div className="font-medium text-xs sm:text-sm text-rose-600">
                  -{formatCurrency(totalPenalty)}
                </div>
              </div>
            )}

            {/* Subtotal con Reajustes, Penalizaciones y Bonos */}
            <div className="flex justify-between items-center py-3 px-4 sm:px-6 bg-muted/5 font-medium">
              <div className="text-xs sm:text-sm">
                Subtotal con Reajustes, Penalizaciones y Bonos:
              </div>
              <div className="font-medium text-xs sm:text-sm">
                {formatCurrency(subtotal)}
              </div>
            </div>

            {/* Retención Total */}
            <div className="flex justify-between items-center py-3 px-4 sm:px-6 font-medium">
              <div className="text-xs sm:text-sm">
                Retención Total ({RETENTION_VALUE * 100}%):
              </div>
              <div className="font-medium text-xs sm:text-sm text-rose-600">
                -{formatCurrency(payment.retention)}
              </div>
            </div>

            {/* Monto Final */}
            <div className="flex justify-between items-center py-4 px-4 sm:px-6 bg-primary/5 font-bold border-t-2 border-border">
              <div className="text-xs sm:text-sm font-bold">MONTO FINAL:</div>
              <div className="text-lg sm:text-xl text-primary font-bold">
                {formatCurrency(payment.finalPayment)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      {payment.comments && (
        <Card className="border border-border rounded-lg shadow-sm">
          <CardHeader className="pb-3 border-b border-border px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg font-medium">
              Comentarios
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 px-4 sm:px-6">
            <p className="text-sm text-muted-foreground">{payment.comments}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
