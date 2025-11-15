"use client";

import { CalculateFormulaDialog } from "@/components/formulas/calculate-formula-dialog";
import { DuplicateFormulaDialog } from "@/components/formulas/duplicate-formula-dialog";
import { FormulaDialog } from "@/components/formulas/formula-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useExcelExport } from "@/hooks/useExcelExport";
import { useRBAC } from "@/hooks/useRBAC";
import { PermissionAction, PermissionResource } from "@/types/rbac";
import type {
  CategoryRequirements,
  CategoryRequirementsES,
  FormulaDataFromDB,
  PaymentParameters,
  PaymentParametersES,
} from "@/types/schema";
import { trpc } from "@/utils/trpc";
import {
  Calculator,
  Copy,
  Edit,
  Eye,
  FileSpreadsheet,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Type for table data that matches what we actually receive from the API
interface FormulaTableData {
  id: string;
  disciplineId: string;
  periodId: string;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  discipline: {
    id: string;
    name: string;
    color?: string | null;
  };
  period: {
    id: string;
    number: number;
    year: number;
  };
  categoryRequirements?: unknown;
  paymentParameters?: unknown;
}

// Helper function to safely serialize unknown data
const _safeStringify = (data: unknown): string => {
  try {
    return JSON.stringify(data);
  } catch {
    return "{}";
  }
};

// Helper function to convert FormulaTableData to FormulaDataFromDB
const convertToFormulaDataFromDB = (
  formula: FormulaTableData
): FormulaDataFromDB => {
  return {
    id: formula.id,
    disciplineId: formula.disciplineId,
    periodId: formula.periodId,
    categoryRequirements:
      typeof formula.categoryRequirements === "string"
        ? formula.categoryRequirements
        : typeof formula.categoryRequirements === "object" &&
            formula.categoryRequirements !== null
          ? (formula.categoryRequirements as
              | string
              | Record<string, CategoryRequirementsES>)
          : _safeStringify(formula.categoryRequirements),
    paymentParameters:
      typeof formula.paymentParameters === "string"
        ? formula.paymentParameters
        : typeof formula.paymentParameters === "object" &&
            formula.paymentParameters !== null
          ? (formula.paymentParameters as
              | string
              | Record<string, PaymentParametersES>)
          : _safeStringify(formula.paymentParameters),
    createdAt: formula.createdAt,
    updatedAt: formula.updatedAt,
    tenantId: formula.tenantId,
    discipline: formula.discipline,
    period: formula.period,
  };
};

type FormulaDialogData = {
  disciplineId: string;
  periodId: string;
  categoryRequirements: Record<
    string,
    {
      ocupacion: number;
      clases: number;
      localesEnBogota: number;
      dobleteos: number;
      horariosNoPrime: number;
      participacionEventos: boolean;
      antiguedadMinima?: number;
      evaluacionPromedio?: number;
      capacitacionesCompletadas?: number;
      lineamientos: boolean;
    }
  >;
  paymentParameters: Record<
    string,
    {
      cuotaFija: number;
      minimoGarantizado: number;
      tarifas: Array<{
        tarifa: number;
        numeroReservas: number;
      }>;
      tarifaFullHouse: number;
      maximo: number;
      bono: number;
      retencionPorcentaje?: number;
      ajustePorDobleteo?: number;
    }
  >;
};

export default function FormulasPage() {
  const { hasPermission } = useRBAC();

  // Permisos específicos para fórmulas
  const canReadFormula = hasPermission(
    PermissionAction.READ,
    PermissionResource.FORMULA
  );
  const canCreateFormula = hasPermission(
    PermissionAction.CREATE,
    PermissionResource.FORMULA
  );
  const canUpdateFormula = hasPermission(
    PermissionAction.UPDATE,
    PermissionResource.FORMULA
  );
  const _canDeleteFormula = hasPermission(
    PermissionAction.DELETE,
    PermissionResource.FORMULA
  );
  const canManagePayments = hasPermission(
    PermissionAction.UPDATE,
    PermissionResource.PAGO_INSTRUCTOR
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [isCalculateDialogOpen, setIsCalculateDialogOpen] = useState(false);
  const [selectedPeriodForCalculation, setSelectedPeriodForCalculation] =
    useState<string | null>(null);
  const [
    selectedDisciplineForCalculation,
    setSelectedDisciplineForCalculation,
  ] = useState<string | null>(null);
  const [dialogFormula, setDialogFormula] = useState<FormulaTableData | null>(
    null
  );

  // Export hooks
  const { exportToExcel } = useExcelExport();

  // Obtener períodos para el diálogo de duplicar
  const { data: periodsData } = trpc.periods.getAll.useQuery();
  const periods = periodsData?.periods || [];

  // Obtener todas las fórmulas
  const { data: formulasData, isLoading } =
    trpc.formulas.getWithFilters.useQuery({
      limit: 100,
      offset: 0,
    });

  const formulas = formulasData?.formulas || [];
  const _totalFormulas: number = formulasData?.total || 0;

  // Agrupar fórmulas por período
  type FormulaGroup = {
    period: { id: string; number: number; year: number };
    formulas: FormulaTableData[];
  };

  const formulasByPeriod: Record<string, FormulaGroup> = {};

  formulas.forEach((formula) => {
    const periodKey = `${formula.period.number}-${formula.period.year}`;
    if (!formulasByPeriod[periodKey]) {
      formulasByPeriod[periodKey] = {
        period: formula.period,
        formulas: [],
      };
    }
    formulasByPeriod[periodKey].formulas.push(formula);
  });

  // Ordenar períodos por número y año (más reciente primero)
  const sortedPeriodKeys = Object.keys(formulasByPeriod).sort((a, b) => {
    const partsA = a.split("-");
    const partsB = b.split("-");
    const numA = Number.parseInt(partsA[0] ?? "0", 10);
    const yearA = Number.parseInt(partsA[1] ?? "0", 10);
    const numB = Number.parseInt(partsB[0] ?? "0", 10);
    const yearB = Number.parseInt(partsB[1] ?? "0", 10);

    if (yearA !== yearB) return yearB - yearA;
    return numB - numA;
  });

  // Obtener utils de tRPC
  const utils = trpc.useUtils();

  // Mutaciones tRPC
  const createFormula = trpc.formulas.create.useMutation({
    onSuccess: () => {
      utils.formulas.getWithFilters.invalidate();
      handleDialogClose();
    },
  });

  const updateFormula = trpc.formulas.update.useMutation({
    onSuccess: () => {
      utils.formulas.getWithFilters.invalidate();
      handleDialogClose();
    },
  });

  const _deleteFormula = trpc.formulas.delete.useMutation({
    onSuccess: () => {
      utils.formulas.getWithFilters.invalidate();
    },
  });

  // Handlers
  const handleCreate = () => {
    setDialogFormula(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (formulaData: FormulaTableData) => {
    setDialogFormula(formulaData);
    setIsDialogOpen(true);
  };

  const handleCalculate = (periodId: string, disciplineId: string) => {
    setSelectedPeriodForCalculation(periodId);
    setSelectedDisciplineForCalculation(disciplineId);
    setIsCalculateDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setDialogFormula(null);
  };

  const handleDialogSubmit = (data: FormulaDialogData) => {
    if (dialogFormula) {
      // Editar fórmula existente
      updateFormula.mutate({
        id: dialogFormula.id,
        ...data,
      });
    } else {
      // Crear nueva fórmula
      createFormula.mutate(data);
    }
  };

  // Export handler
  const handleExportExcel = async () => {
    if (!canReadFormula) {
      toast.error("No tienes permisos para exportar fórmulas");
      return;
    }

    if (formulas.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    toast.info("Obteniendo datos para exportar...");

    // Obtener TODAS las fórmulas sin paginación
    const allFormulasData = await utils.formulas.getWithFilters.fetch({
      limit: 100,
      offset: 0,
    });

    const allFormulas = allFormulasData?.formulas || [];

    if (allFormulas.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    // Convert FormulaFromAPI to export format using direct approach
    const exportData: Array<Record<string, string>> = [];

    for (let i = 0; i < allFormulas.length; i++) {
      const formula = allFormulas[i];
      if (!formula) continue;

      exportData.push({
        Disciplina: formula.discipline?.name || "N/A",
        Período: `P${formula.period?.number || 0} - ${formula.period?.year || 0}`,
        "Parámetros de Pago": "Ver detalles en la aplicación",
        "Requisitos de Categoría": "Ver detalles en la aplicación",
        "Fecha Creación": new Date(formula.createdAt || "").toLocaleDateString(
          "es-CO"
        ),
        "Última Actualización": new Date(
          formula.updatedAt || ""
        ).toLocaleDateString("es-CO"),
      });
    }

    exportToExcel(exportData, "Formulas", "Fórmulas", {
      columnWidths: [20, 20, 50, 50, 15, 18],
    });
  };

  if (!canReadFormula) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">
            No tienes permisos para ver fórmulas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fórmulas</h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Administra las fórmulas de cálculo del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={formulas.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4 mr-1.5" />
            Exportar Excel
          </Button>
          {canCreateFormula && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsDuplicateDialogOpen(true)}
              >
                <Copy className="h-4 w-4 mr-1.5" />
                <span>Duplicar Fórmulas</span>
              </Button>
              <Button size="sm" variant="edit" onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Nueva Fórmula</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Lista de fórmulas agrupadas por período */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((periodIndex) => (
            <Card key={periodIndex} className="p-3 border border-border">
              {/* Header del período */}
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-5 w-8 bg-muted animate-pulse rounded-full" />
                </div>
              </div>

              {/* Items de fórmulas */}
              <div className="space-y-2">
                {[1, 2, 3].map((formulaIndex) => (
                  <div
                    key={formulaIndex}
                    className="flex items-center justify-between p-2 bg-muted/5 rounded-md border border-border"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-2.5 h-2.5 bg-muted animate-pulse rounded-full flex-shrink-0" />
                      <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="h-7 w-7 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : sortedPeriodKeys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            No se encontraron fórmulas
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedPeriodKeys.map((periodKey) => {
            const periodData = formulasByPeriod[periodKey];
            if (!periodData) return null;

            return (
              <Card key={periodKey} className="p-3 border border-border">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold">
                      Período {periodData.period.number} -{" "}
                      {periodData.period.year}
                    </h3>
                    <Badge variant="secondary" className="text-xs h-5">
                      {periodData.formulas.length}
                    </Badge>
                  </div>
                  {canManagePayments && periodData.formulas.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() => {
                        const firstFormula = periodData.formulas[0];
                        if (firstFormula?.disciplineId) {
                          handleCalculate(
                            periodData.period.id,
                            firstFormula.disciplineId
                          );
                        }
                      }}
                    >
                      <Calculator className="h-3.5 w-3.5 mr-1" />
                      Calcular
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {periodData.formulas.map((formula) => (
                    <div
                      key={formula.id}
                      className="flex items-center justify-between p-2 bg-muted/5 rounded-md border border-border"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor:
                              formula.discipline.color || "#6b7280",
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs">
                            {formula.discipline.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {canUpdateFormula && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(formula)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog para crear/editar fórmula */}
      <FormulaDialog
        formulaData={
          dialogFormula ? convertToFormulaDataFromDB(dialogFormula) : null
        }
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        isLoading={createFormula.isPending || updateFormula.isPending}
      />

      {/* Dialog para duplicar fórmulas */}
      <DuplicateFormulaDialog
        open={isDuplicateDialogOpen}
        onOpenChange={setIsDuplicateDialogOpen}
        periods={periods}
      />

      {/* Dialog para calcular */}
      {selectedPeriodForCalculation && selectedDisciplineForCalculation && (
        <CalculateFormulaDialog
          open={isCalculateDialogOpen}
          onOpenChange={setIsCalculateDialogOpen}
          periodId={selectedPeriodForCalculation}
          disciplineId={selectedDisciplineForCalculation}
          formulas={formulas}
        />
      )}
    </div>
  );
}
