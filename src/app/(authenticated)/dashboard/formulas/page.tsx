"use client";

import { useAuthContext } from "@/AuthContext";
import { FormulaDialog } from "@/components/formulas/formula-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  TableAction,
  TableColumn,
} from "@/components/ui/scrollable-table";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExcelExport } from "@/hooks/useExcelExport";
import { usePagination } from "@/hooks/usePagination";
import { useRBAC } from "@/hooks/useRBAC";
import type {
  CategoryRequirements,
  Formula,
  FormulaFromAPI,
  PaymentParameters,
} from "@/types/schema";
import { trpc } from "@/utils/trpc";
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  FileSpreadsheet,
  Filter,
  Info,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
const safeStringify = (data: unknown): string => {
  try {
    return JSON.stringify(data);
  } catch {
    return "{}";
  }
};

// Helper function to safely convert FormulaFromAPI for export
const _convertFormulaForExport = (formula: FormulaFromAPI) => {
  return {
    Disciplina: formula.discipline?.name || "N/A",
    Período: `P${formula.period?.number || 0} - ${formula.period?.year || 0}`,
    "Parámetros de Pago": safeStringify(formula.paymentParameters),
    "Requisitos de Categoría": safeStringify(formula.categoryRequirements),
    "Fecha Creación": new Date(formula.createdAt || "").toLocaleDateString(
      "es-PE"
    ),
    "Última Actualización": new Date(
      formula.updatedAt || ""
    ).toLocaleDateString("es-PE"),
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
      localesEnLima: number;
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
  const { canManageUsers } = useRBAC();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogFormula, setDialogFormula] = useState<FormulaTableData | null>(
    null
  );

  // Estados para filtros
  const [searchText, setSearchText] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Paginación
  const pagination = usePagination({
    defaultLimit: 10,
    defaultPage: 1,
  });

  // Export hooks
  const { exportToExcel } = useExcelExport();

  // Obtener datos para filtros
  const { data: disciplinesData } = trpc.disciplines.getAll.useQuery();
  const { data: periodsData } = trpc.periods.getAll.useQuery();

  const disciplines = disciplinesData?.disciplines || [];
  const periods = periodsData?.periods || [];

  // Obtener fórmulas con filtros usando tRPC
  const { data: formulasData, isLoading } =
    trpc.formulas.getWithFilters.useQuery({
      limit: pagination.limit,
      offset: (pagination.page - 1) * pagination.limit,
      search: searchText,
      disciplineId:
        selectedDiscipline !== "all" ? selectedDiscipline : undefined,
      periodId: selectedPeriod !== "all" ? selectedPeriod : undefined,
    });

  const formulas = formulasData?.formulas || [];
  const totalFormulas: number = formulasData?.total || 0;

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

  const deleteFormula = trpc.formulas.delete.useMutation({
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

  const handleView = (formulaData: FormulaTableData) => {
    // Abrir diálogo de vista
    setDialogFormula(formulaData);
    setIsDialogOpen(true);
  };

  const handleDelete = (formulaData: FormulaTableData) => {
    if (
      confirm(
        `¿Estás seguro de eliminar la fórmula para ${formulaData.discipline.name} - Período ${formulaData.period.number}?`
      )
    ) {
      deleteFormula.mutate({ id: formulaData.id });
    }
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

  // Limpiar filtros
  const clearFilters = () => {
    setSearchText("");
    setSelectedDiscipline("all");
    setSelectedPeriod("all");
  };

  // Toggle para expandir/contraer filtros
  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  // Configuración de columnas para la tabla
  const columns: TableColumn<FormulaTableData>[] = [
    {
      key: "discipline",
      title: "Disciplina",
      width: "150px",
      render: (_, record) => (
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: record.discipline.color || "#6b7280" }}
          />
          <span className="font-medium text-sm truncate">
            {record.discipline.name}
          </span>
        </div>
      ),
    },
    {
      key: "period",
      title: "Período",
      width: "120px",
      render: (_, record) => (
        <span className="text-sm">
          {record.period.number} - {record.period.year}
        </span>
      ),
    },
    {
      key: "categoryRequirements",
      title: "Requisitos",
      width: "200px",
      render: (_, record) => (
        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
          {JSON.stringify(record.categoryRequirements).length > 30
            ? `${JSON.stringify(record.categoryRequirements).substring(0, 30)}...`
            : JSON.stringify(record.categoryRequirements)}
        </code>
      ),
    },
    {
      key: "paymentParameters",
      title: "Parámetros",
      width: "200px",
      render: (_, record) => (
        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
          {JSON.stringify(record.paymentParameters).length > 30
            ? `${JSON.stringify(record.paymentParameters).substring(0, 30)}...`
            : JSON.stringify(record.paymentParameters)}
        </code>
      ),
    },
    {
      key: "createdAt",
      title: "Creado",
      width: "120px",
      render: (_, record) => (
        <span className="text-sm text-muted-foreground">
          {new Date(record.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Acciones de la tabla
  const actions: TableAction<FormulaTableData>[] = [
    {
      label: "Ver",
      icon: <Eye className="h-4 w-4" />,
      onClick: handleView,
    },
  ];

  if (canManageUsers) {
    actions.push(
      {
        label: "Editar",
        icon: <Edit className="h-4 w-4" />,
        onClick: handleEdit,
      },
      {
        label: "Eliminar",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: handleDelete,
        variant: "destructive",
      }
    );
  }

  // Información de paginación
  const paginationInfo = {
    total: totalFormulas,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(totalFormulas / pagination.limit),
    hasNext: pagination.page * pagination.limit < totalFormulas,
    hasPrev: pagination.page > 1,
  };

  // Export handler
  const handleExportExcel = async () => {
    if (formulas.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    toast.info("Obteniendo datos para exportar...");

    // Obtener TODAS las fórmulas sin paginación
    const allFormulasData = await utils.formulas.getWithFilters.fetch({
      limit: 1000,
      offset: 0,
      search: searchText,
      disciplineId:
        selectedDiscipline !== "all" ? selectedDiscipline : undefined,
      periodId: selectedPeriod !== "all" ? selectedPeriod : undefined,
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
          "es-PE"
        ),
        "Última Actualización": new Date(
          formula.updatedAt || ""
        ).toLocaleDateString("es-PE"),
      });
    }

    exportToExcel(exportData, "Formulas", "Fórmulas", {
      columnWidths: [20, 20, 50, 50, 15, 18],
    });
  };

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
          {canManageUsers && (
            <Button size="sm" variant="edit" onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Nueva Fórmula</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filtros Compactos */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-3">
          {/* Búsqueda principal */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, fórmula, disciplina..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Botón para expandir filtros */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFilters}
            className="flex items-center gap-2 border-border"
          >
            <Filter className="h-4 w-4" />
            {filtersExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>Ocultar filtros</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>Filtros</span>
              </>
            )}
          </Button>
        </div>

        {/* Filtros expandibles */}
        {filtersExpanded && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Filtro por disciplina */}
              <div className="space-y-1">
                <label
                  htmlFor="discipline-filter"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Disciplina
                </label>
                <Select
                  value={selectedDiscipline}
                  onValueChange={setSelectedDiscipline}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Todas las disciplinas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las disciplinas</SelectItem>
                    {disciplines?.map((discipline) => (
                      <SelectItem key={discipline.id} value={discipline.id}>
                        {discipline.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por período */}
              <div className="space-y-1">
                <label
                  htmlFor="period-filter"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Período
                </label>
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Todos los períodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los períodos</SelectItem>
                    {periods?.map(
                      (period: {
                        id: string;
                        number: number;
                        year: number;
                      }) => (
                        <SelectItem key={period.id} value={period.id}>
                          {period.number} - {period.year}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Botón para limpiar filtros */}
            <div className="flex justify-end mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground border-border h-7 px-3 text-xs"
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla con ScrollableTable */}
      <ScrollableTable
        data={formulas}
        columns={columns}
        loading={isLoading}
        error={null}
        pagination={paginationInfo}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setLimit}
        actions={actions}
        emptyMessage="No se encontraron fórmulas"
        emptyIcon={<Calculator className="h-12 w-12 text-muted-foreground" />}
        tableClassName="compact-table"
      />

      {/* Dialog para crear/editar fórmula */}
      <FormulaDialog
        formulaData={dialogFormula}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        isLoading={createFormula.isPending || updateFormula.isPending}
      />
    </div>
  );
}
