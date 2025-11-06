"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { CATEGORIES_CONFIG, shouldShowVisualCategory } from "@/lib/config";
import { formatDateInLima } from "@/lib/date-utils";
import {
  formatMetricValue,
  getCategoryTranslation,
  getMetricTranslation,
} from "@/lib/translations";
import type { InstructorCategoryType } from "@/types/instructor";
import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  MapPin,
  Minus,
  Plus,
  TrendingUp,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";

interface InstructorLog {
  instructorId: string;
  instructorName: string;
  status: "success" | "error" | "skipped";
  message: string;
  details: {
    categories: Array<{
      disciplineId: string;
      disciplineName: string;
      category: InstructorCategoryType;
      metrics: Record<string, unknown>;
      reason: string;
      allCategoriesEvaluation: Array<{
        category: InstructorCategoryType;
        categoryLabel: string;
        criteria: Array<{
          key: string;
          label: string;
          current: string;
          required: string;
          meets: boolean;
        }>;
        allMeets: boolean;
      }>;
    }>;
    classes: Array<{
      classId: string;
      disciplineName: string;
      date: string;
      studio: string;
      hour: string;
      spots: number;
      reservations: number;
      occupancy: number;
      category: InstructorCategoryType;
      baseAmount: number;
      finalAmount: number;
      calculation: string;
    }>;
    bonuses: {
      cover: number;
      branding: number;
      themeRide: number;
      workshop: number;
      versus: number;
      total: number;
    };
    penalties: number;
    retention: number;
    totalAmount: number;
    finalPayment: number;
  };
  error?: string;
}

interface DetailedInstructorLogsProps {
  instructorLogs: InstructorLog[];
  summary: {
    total: number;
    success: number;
    errors: number;
    skipped: number;
    deletedPayments: number;
  };
}

export function DetailedInstructorLogs({
  instructorLogs,
  summary,
}: DetailedInstructorLogsProps) {
  const [expandedInstructors, setExpandedInstructors] = useState<Set<string>>(
    new Set()
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  const toggleInstructor = (instructorId: string) => {
    const newExpanded = new Set(expandedInstructors);
    if (newExpanded.has(instructorId)) {
      newExpanded.delete(instructorId);
    } else {
      newExpanded.add(instructorId);
    }
    setExpandedInstructors(newExpanded);
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "skipped":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/15 text-green-600 border-green-600";
      case "error":
        return "bg-red-500/15 text-red-600 border-red-600";
      case "skipped":
        return "bg-yellow-500/15 text-yellow-600 border-yellow-600";
      default:
        return "bg-gray-500/15 text-gray-600 border-gray-600";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="border border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Resumen del Cálculo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {summary.total}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Instructores
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {summary.success}
              </div>
              <div className="text-sm text-muted-foreground">Exitosos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {summary.errors}
              </div>
              <div className="text-sm text-muted-foreground">Errores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {summary.skipped}
              </div>
              <div className="text-sm text-muted-foreground">Omitidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {summary.deletedPayments}
              </div>
              <div className="text-sm text-muted-foreground">
                Pagos Eliminados
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructor Cards */}
      <div className="space-y-3">
        {instructorLogs.map((instructor) => {
          const isExpanded = expandedInstructors.has(instructor.instructorId);
          const hasDetails =
            instructor.details.classes.length > 0 ||
            instructor.details.categories.length > 0;

          return (
            <Card
              key={instructor.instructorId}
              className="border border-border bg-card"
            >
              <Collapsible
                open={isExpanded}
                onOpenChange={() => toggleInstructor(instructor.instructorId)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <User className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-base">
                            {instructor.instructorName}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {instructor.message}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(instructor.status)}
                        <Badge
                          variant="outline"
                          className={getStatusColor(instructor.status)}
                        >
                          {instructor.status === "success"
                            ? "Exitoso"
                            : instructor.status === "error"
                              ? "Error"
                              : "Omitido"}
                        </Badge>
                        {instructor.details.finalPayment > 0 && (
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary border-primary/20"
                          >
                            {formatCurrency(instructor.details.finalPayment)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {instructor.error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          <strong>Error:</strong> {instructor.error}
                        </p>
                      </div>
                    )}

                    {hasDetails && (
                      <div className="space-y-4">
                        {/* Categories Section */}
                        {instructor.details.categories.filter((c) =>
                          shouldShowVisualCategory(c.disciplineName)
                        ).length > 0 && (
                          <div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                toggleSection(
                                  `categories-${instructor.instructorId}`
                                )
                              }
                              className="flex items-center gap-2 p-0 h-auto font-medium text-left"
                            >
                              {expandedSections.has(
                                `categories-${instructor.instructorId}`
                              ) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <Award className="h-4 w-4 text-primary" />
                              Categorías (
                              {
                                instructor.details.categories.filter((c) =>
                                  shouldShowVisualCategory(c.disciplineName)
                                ).length
                              }
                              )
                            </Button>

                            {expandedSections.has(
                              `categories-${instructor.instructorId}`
                            ) && (
                              <div className="mt-2 space-y-2">
                                {instructor.details.categories
                                  .filter((category) =>
                                    shouldShowVisualCategory(
                                      category.disciplineName
                                    )
                                  )
                                  .map((category) => (
                                    <div
                                      key={`${category.disciplineId}-${category.category}`}
                                      className="p-3 bg-muted/30 rounded-lg"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="w-3 h-3 rounded-full"
                                            style={{
                                              backgroundColor: "#6366F1",
                                            }}
                                          />
                                          <span className="font-medium">
                                            {category.disciplineName}
                                          </span>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className={
                                            category.reason ===
                                            "Asignación manual"
                                              ? "bg-orange-100 text-orange-700 border-orange-300"
                                              : "bg-primary/10 text-primary border-primary/20"
                                          }
                                        >
                                          {getCategoryTranslation(
                                            category.category
                                          )}
                                          {category.reason ===
                                            "Asignación manual" && " - Manual"}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground mb-3">
                                        {category.reason}
                                      </p>

                                      {/* Tabla comparativa de categorías */}
                                      {category.allCategoriesEvaluation.length >
                                        0 && (
                                        <div className="overflow-x-auto">
                                          <table className="w-full text-xs border-collapse">
                                            <thead>
                                              <tr>
                                                <th className="border border-border p-2 text-left bg-muted/50">
                                                  Criterio
                                                </th>
                                                <th className="border border-border p-2 text-center bg-muted/50">
                                                  Instructor
                                                </th>
                                                <th className="border border-border p-2 text-center bg-muted/50">
                                                  Embajador Junior
                                                </th>
                                                <th className="border border-border p-2 text-center bg-muted/50">
                                                  Embajador
                                                </th>
                                                <th className="border border-border p-2 text-center bg-muted/50">
                                                  Embajador Senior
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {category.allCategoriesEvaluation[0]?.criteria.map(
                                                (criterion, idx) => {
                                                  const instructorCol =
                                                    category.allCategoriesEvaluation.find(
                                                      (c) =>
                                                        c.category ===
                                                        "INSTRUCTOR"
                                                    );
                                                  const juniorCol =
                                                    category.allCategoriesEvaluation.find(
                                                      (c) =>
                                                        c.category ===
                                                        "JUNIOR_AMBASSADOR"
                                                    );
                                                  const ambassadorCol =
                                                    category.allCategoriesEvaluation.find(
                                                      (c) =>
                                                        c.category ===
                                                        "AMBASSADOR"
                                                    );
                                                  const seniorCol =
                                                    category.allCategoriesEvaluation.find(
                                                      (c) =>
                                                        c.category ===
                                                        "SENIOR_AMBASSADOR"
                                                    );

                                                  const getCellClass = (
                                                    cat:
                                                      | (typeof category.allCategoriesEvaluation)[0]
                                                      | undefined,
                                                    _index: number
                                                  ) => {
                                                    if (!cat) return "";
                                                    const crit =
                                                      cat.criteria[idx];
                                                    if (!crit) return "";

                                                    // Determinar si esta es la categoría asignada
                                                    const isAssigned =
                                                      cat.category ===
                                                      category.category;

                                                    if (
                                                      crit.meets &&
                                                      isAssigned
                                                    ) {
                                                      // Categoría asignada con criterio cumplido - verde oscuro
                                                      return "bg-green-500 text-white font-bold";
                                                    }
                                                    if (crit.meets) {
                                                      // Criterio cumplido pero no es la categoría asignada - verde muy claro con texto oscuro
                                                      return "bg-green-100 text-green-900 font-medium";
                                                    }
                                                    if (isAssigned) {
                                                      // Categoría asignada con criterio NO cumplido - rojo oscuro
                                                      return "bg-red-500 text-white font-bold";
                                                    }
                                                    // Criterio no cumplido - rojo muy claro con texto oscuro
                                                    return "bg-red-100 text-red-900 font-medium";
                                                  };

                                                  return (
                                                    <tr key={criterion.key}>
                                                      <td className="border border-border p-2 font-semibold text-gray-900 bg-gray-100">
                                                        {criterion.label}
                                                      </td>
                                                      <td
                                                        className={`border border-border p-2 text-center ${getCellClass(instructorCol, idx)}`}
                                                      >
                                                        {instructorCol
                                                          ?.criteria[idx] ? (
                                                          <>
                                                            <span className="font-semibold">
                                                              {formatMetricValue(
                                                                criterion.key,
                                                                criterion.current
                                                              )}
                                                            </span>
                                                            <span className="mx-1 text-gray-600">
                                                              /
                                                            </span>
                                                            <span>
                                                              {formatMetricValue(
                                                                criterion.key,
                                                                instructorCol
                                                                  .criteria[idx]
                                                                  .required
                                                              )}
                                                            </span>
                                                          </>
                                                        ) : (
                                                          "-"
                                                        )}
                                                      </td>
                                                      <td
                                                        className={`border border-border p-2 text-center ${getCellClass(juniorCol, idx)}`}
                                                      >
                                                        {juniorCol?.criteria[
                                                          idx
                                                        ] ? (
                                                          <>
                                                            <span className="font-semibold">
                                                              {formatMetricValue(
                                                                criterion.key,
                                                                criterion.current
                                                              )}
                                                            </span>
                                                            <span className="mx-1 text-gray-600">
                                                              /
                                                            </span>
                                                            <span>
                                                              {formatMetricValue(
                                                                criterion.key,
                                                                juniorCol
                                                                  .criteria[idx]
                                                                  .required
                                                              )}
                                                            </span>
                                                          </>
                                                        ) : (
                                                          "-"
                                                        )}
                                                      </td>
                                                      <td
                                                        className={`border border-border p-2 text-center ${getCellClass(ambassadorCol, idx)}`}
                                                      >
                                                        {ambassadorCol
                                                          ?.criteria[idx] ? (
                                                          <>
                                                            <span className="font-semibold">
                                                              {formatMetricValue(
                                                                criterion.key,
                                                                criterion.current
                                                              )}
                                                            </span>
                                                            <span className="mx-1 text-gray-600">
                                                              /
                                                            </span>
                                                            <span>
                                                              {formatMetricValue(
                                                                criterion.key,
                                                                ambassadorCol
                                                                  .criteria[idx]
                                                                  .required
                                                              )}
                                                            </span>
                                                          </>
                                                        ) : (
                                                          "-"
                                                        )}
                                                      </td>
                                                      <td
                                                        className={`border border-border p-2 text-center ${getCellClass(seniorCol, idx)}`}
                                                      >
                                                        {seniorCol?.criteria[
                                                          idx
                                                        ] ? (
                                                          <>
                                                            <span className="font-semibold">
                                                              {formatMetricValue(
                                                                criterion.key,
                                                                criterion.current
                                                              )}
                                                            </span>
                                                            <span className="mx-1 text-gray-600">
                                                              /
                                                            </span>
                                                            <span>
                                                              {formatMetricValue(
                                                                criterion.key,
                                                                seniorCol
                                                                  .criteria[idx]
                                                                  .required
                                                              )}
                                                            </span>
                                                          </>
                                                        ) : (
                                                          "-"
                                                        )}
                                                      </td>
                                                    </tr>
                                                  );
                                                }
                                              )}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Classes Section */}
                        {instructor.details.classes.length > 0 && (
                          <div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                toggleSection(
                                  `classes-${instructor.instructorId}`
                                )
                              }
                              className="flex items-center gap-2 p-0 h-auto font-medium text-left"
                            >
                              {expandedSections.has(
                                `classes-${instructor.instructorId}`
                              ) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <Calendar className="h-4 w-4 text-primary" />
                              Clases ({instructor.details.classes.length})
                            </Button>

                            {expandedSections.has(
                              `classes-${instructor.instructorId}`
                            ) && (
                              <div className="mt-2 space-y-2">
                                {instructor.details.classes.map((classItem) => (
                                  <div
                                    key={classItem.classId}
                                    className="p-3 bg-muted/30 rounded-lg"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">
                                          {formatDateInLima(classItem.date)}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                          {classItem.hour}
                                        </span>
                                        <span className="text-xs font-mono text-muted-foreground">
                                          ID: {classItem.classId}
                                        </span>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className="bg-primary/10 text-primary border-primary/20"
                                      >
                                        {formatCurrency(classItem.finalAmount)}
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-2">
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                        <span>{classItem.studio}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3 text-muted-foreground" />
                                        <span>
                                          {classItem.reservations}/
                                          {classItem.spots}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                        <span>{classItem.occupancy}%</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Award className="h-3 w-3 text-muted-foreground" />
                                        <span>
                                          {getCategoryTranslation(
                                            classItem.category
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {classItem.calculation}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Financial Summary */}
                        {instructor.details.totalAmount > 0 && (
                          <div className="p-4 bg-muted/30 rounded-lg">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-primary" />
                              Resumen Financiero
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">
                                  Monto Base
                                </div>
                                <div className="font-medium">
                                  {formatCurrency(
                                    instructor.details.totalAmount
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Bonificaciones
                                </div>
                                <div className="font-medium text-green-600">
                                  +
                                  {formatCurrency(
                                    instructor.details.bonuses.total
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Penalizaciones
                                </div>
                                <div className="font-medium text-red-600">
                                  -
                                  {formatCurrency(instructor.details.penalties)}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Retención
                                </div>
                                <div className="font-medium text-red-600">
                                  -
                                  {formatCurrency(instructor.details.retention)}
                                </div>
                              </div>
                            </div>
                            <Separator className="my-3" />
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Pago Final:</span>
                              <span className="text-lg font-bold text-primary">
                                {formatCurrency(
                                  instructor.details.finalPayment
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
