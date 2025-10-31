"use client";

import { DetailedInstructorLogs } from "@/components/payments/detailed-instructor-logs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import type { TableColumn } from "@/components/ui/scrollable-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePagination } from "@/hooks/usePagination";
import { shouldShowVisualCategory } from "@/lib/config";
import type { PeriodFromAPI } from "@/types";
import type { InstructorCategoryType } from "@/types/instructor";
import { trpc } from "@/utils/trpc";
import {
  Calculator,
  Calendar,
  Loader2,
  RefreshCw,
  Save,
  Search,
  Settings,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

// Import InstructorCategoryType from types instead of redefining
// Using the imported type from @/types/instructor

// Helper function to convert string category to InstructorCategoryType
const toInstructorCategoryType = (category: string): InstructorCategoryType => {
  const validCategories: InstructorCategoryType[] = [
    "INSTRUCTOR",
    "JUNIOR_AMBASSADOR",
    "AMBASSADOR",
    "SENIOR_AMBASSADOR",
  ];
  if (validCategories.includes(category as InstructorCategoryType)) {
    return category as InstructorCategoryType;
  }
  // Default fallback
  return "INSTRUCTOR";
};

// Type for logs coming from the API (with string categories)
type ApiInstructorLog = {
  instructorId: string;
  instructorName: string;
  status: "success" | "error" | "skipped";
  message: string;
  details: {
    categories: Array<{
      disciplineId: string;
      disciplineName: string;
      category: string;
      metrics: Record<string, unknown>;
      reason: string;
      allCategoriesEvaluation: Array<{
        category: string;
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
      category: string;
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
};

// Type for logs expected by DetailedInstructorLogs (with InstructorCategoryType)
type ConvertedInstructorLog = {
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
};

// Function to convert API logs to the format expected by DetailedInstructorLogs
const convertInstructorLogs = (
  logs: ApiInstructorLog[]
): ConvertedInstructorLog[] => {
  return logs.map((log) => ({
    ...log,
    details: {
      ...log.details,
      categories: log.details.categories.map((cat) => ({
        ...cat,
        category: toInstructorCategoryType(cat.category),
        allCategoriesEvaluation: cat.allCategoriesEvaluation.map(
          (evalItem) => ({
            ...evalItem,
            category: toInstructorCategoryType(evalItem.category),
          })
        ),
      })),
      classes: log.details.classes.map((cls) => ({
        ...cls,
        category: toInstructorCategoryType(cls.category),
      })),
    },
  }));
};

interface ManualCategory {
  instructorId: string;
  instructorName: string;
  disciplineId: string;
  disciplineName: string;
  category: InstructorCategoryType;
}

// Minimal shape of the categories returned by TRPC with relations used in this UI
type ExistingManualCategory = {
  instructorId: string;
  disciplineId: string;
  category: InstructorCategoryType | string;
  isManual?: boolean;
  instructor?: { name?: string | null };
  discipline?: { name?: string | null };
  instructorName?: string;
  disciplineName?: string;
};

// Types for instructor logs - using ApiInstructorLog defined above

type Summary = {
  total: number;
  success: number;
  errors: number;
  skipped: number;
  deletedPayments: number;
};

export default function CalcularPagosPage() {
  const router = useRouter();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [instructorLogs, setInstructorLogs] = useState<ApiInstructorLog[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("calculator");

  // Manual categories state
  const [selectedInstructorIds, setSelectedInstructorIds] = useState<
    Set<string>
  >(new Set());
  const [manualCategories, setManualCategories] = useState<ManualCategory[]>(
    []
  );

  // Queries
  const { data: periods } = trpc.periods.getAll.useQuery();
  const { data: instructorsData } = trpc.instructor.getAll.useQuery();
  const { data: disciplinesData } = trpc.disciplines.getAll.useQuery();

  // Query for existing categories (manual + auto)
  const {
    data: existingManualCategories,
    refetch: refetchManualCategories,
    isFetching: isFetchingCategories,
  } = trpc.instructorCategories.getCategoriesForPeriod.useQuery(
    { periodId: selectedPeriodId },
    {
      enabled: !!selectedPeriodId,
      refetchOnMount: true,
    }
  );

  // Mutations for manual categories
  const setManualCategoriesMutation =
    trpc.instructorCategories.setManualCategories.useMutation();

  const deleteManualCategoryMutation =
    trpc.instructorCategories.deleteManualCategory.useMutation();

  // Load existing manual categories when period or existingManualCategories changes
  React.useEffect(() => {
    if (existingManualCategories) {
      if (existingManualCategories.length > 0) {
        const existingCats = (
          existingManualCategories as ExistingManualCategory[]
        ).map((cat) => ({
          instructorId: cat.instructorId,
          instructorName: cat.instructor?.name || "",
          disciplineId: cat.disciplineId,
          disciplineName: cat.discipline?.name || "",
          category: (cat.category as InstructorCategoryType) ?? "INSTRUCTOR",
        }));

        setManualCategories(existingCats);
      } else {
        // Clear if explicitly have an empty result
        setManualCategories([]);
      }
    }
  }, [existingManualCategories]);

  // Filter active instructors - use type from trpc response
  const instructors = (instructorsData?.instructors || []).filter(
    (i) => i.active
  );
  // Filter disciplines - only those with visual categorization
  const disciplines = (disciplinesData?.disciplines || []).filter((d) =>
    shouldShowVisualCategory(d.name)
  );

  // Mutations
  const calculateAllMutation =
    trpc.payments.calculateAllPeriodPayments.useMutation({
      onSuccess: (result) => {
        if (result.success) {
          toast.success(result.message);
          setInstructorLogs(result.instructorLogs || []);
          // Summary may not exist on error response
          if ("summary" in result && result.summary) {
            setSummary(result.summary);
          } else {
            setSummary(null);
          }
          // Invalidate/refetch categories for the selected period so the Categories tab is up to date
          void refetchManualCategories();
        } else {
          toast.error(result.message);
          setInstructorLogs([]);
          setSummary(null);
        }
        setIsCalculating(false);
      },
      onError: (_error) => {
        toast.error("Error inesperado al calcular los pagos");
        setIsCalculating(false);
      },
    });

  const handleCalculateAll = async () => {
    if (!selectedPeriodId) {
      toast.error("Por favor selecciona un período");
      return;
    }

    setIsCalculating(true);
    setInstructorLogs([]);
    setSummary(null);
    calculateAllMutation.mutate({ periodId: selectedPeriodId });
  };

  // Manual categories functions
  // Only adds categories for disciplines that should show visual categorization
  // (excluding disciplines like Barre, Yoga, Ejercito as per config)
  const _addManualCategories = () => {
    if (!selectedPeriodId) {
      toast.error("Selecciona un período primero");
      return;
    }

    const selectedDisciplines = new Map<string, string>(); // disciplineId -> disciplineName

    const newCategories: ManualCategory[] = [];
    selectedInstructorIds.forEach((instructorId) => {
      const instructor = instructors.find((i) => i.id === instructorId);
      if (!instructor) return;

      // Only add disciplines that have visual categorization enabled
      // (disciplines are already filtered by shouldShowVisualCategory)
      disciplines.forEach((discipline) => {
        // Double check that this discipline should show visual category
        if (!shouldShowVisualCategory(discipline.name)) {
          return;
        }

        selectedDisciplines.set(discipline.id, discipline.name);
        newCategories.push({
          instructorId: instructorId,
          instructorName: instructor.name || "",
          disciplineId: discipline.id,
          disciplineName: discipline.name || "",
          category: "INSTRUCTOR", // Default category
        });
      });
    });

    setManualCategories((prev) => [...prev, ...newCategories]);
    setSelectedInstructorIds(new Set());
  };

  const updateCategory = (index: number, category: InstructorCategoryType) => {
    setManualCategories((prev) => {
      const updated = [...prev];
      const item = updated[index];
      if (item) {
        updated[index] = { ...item, category };
      }
      return updated;
    });
  };

  const removeCategory = async (index: number) => {
    const categoryToRemove = manualCategories[index];

    if (!categoryToRemove) return;

    if (!selectedPeriodId) {
      toast.error("Por favor selecciona un período");
      return;
    }

    try {
      await deleteManualCategoryMutation.mutateAsync({
        instructorId: categoryToRemove.instructorId,
        disciplineId: categoryToRemove.disciplineId,
        periodId: selectedPeriodId,
      });

      await refetchManualCategories();
      toast.success(
        "Categoría manual eliminada. Se recalculará en el próximo cálculo."
      );
    } catch (error) {
      toast.error(
        `Error al eliminar categoría: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    }
  };

  const _saveManualCategories = async () => {
    if (!selectedPeriodId) {
      toast.error("Por favor selecciona un período");
      return;
    }

    if (manualCategories.length === 0) {
      toast.error("No hay categorías para guardar");
      return;
    }

    const categoriesToSave = manualCategories.map((cat) => ({
      instructorId: cat.instructorId,
      disciplineId: cat.disciplineId,
      category: cat.category as
        | "INSTRUCTOR"
        | "JUNIOR_AMBASSADOR"
        | "AMBASSADOR"
        | "SENIOR_AMBASSADOR",
    }));

    try {
      const result = await setManualCategoriesMutation.mutateAsync({
        periodId: selectedPeriodId,
        categories: categoriesToSave,
      });

      if (result.success) {
        toast.success(
          `Categorías manuales guardadas: ${result.successful} exitosos, ${result.failed} fallidos`
        );
        // Refetch to show the saved categories
        await refetchManualCategories();
      }
    } catch (error) {
      toast.error(
        `Error al guardar categorías: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    }
  };

  const deleteExistingManualCategory = async (
    instructorId: string,
    disciplineId: string
  ) => {
    if (!selectedPeriodId) {
      toast.error("Por favor selecciona un período");
      return;
    }

    try {
      await deleteManualCategoryMutation.mutateAsync({
        instructorId,
        disciplineId,
        periodId: selectedPeriodId,
      });
      await refetchManualCategories();
      toast.success("Categoría manual eliminada para este período.");
    } catch (error) {
      toast.error(
        `Error al eliminar categoría: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    }
  };

  const periodsList = periods?.periods || [];

  // Table columns for instructors
  const _instructorColumns: TableColumn<(typeof instructors)[0]>[] = [
    {
      key: "select",
      title: "",
      width: "40px",
      render: (_: unknown, record) => (
        <Checkbox
          checked={selectedInstructorIds.has(record.id)}
          onCheckedChange={(checked) => {
            const newSet = new Set(selectedInstructorIds);
            if (checked) {
              newSet.add(record.id);
            } else {
              newSet.delete(record.id);
            }
            setSelectedInstructorIds(newSet);
          }}
        />
      ),
    },
    {
      key: "name",
      title: "Instructor",
      width: "220px",
      render: (_: unknown, record) => (
        <div className="font-medium text-xs">{record.name}</div>
      ),
    },
    {
      key: "periodCategory",
      title: "Categoría período",
      width: "160px",
      render: (_value, record) => {
        const categories =
          (
            existingManualCategories as ExistingManualCategory[] | undefined
          )?.filter(
            (c) =>
              c.instructorId === record.id &&
              shouldShowVisualCategory(
                c.discipline?.name || c.disciplineName || ""
              )
          ) || [];

        if (categories.length === 0) {
          return <span className="text-[11px] text-muted-foreground">-</span>;
        }

        const labelMap: Record<string, string> = {
          INSTRUCTOR: "Instructor",
          JUNIOR_AMBASSADOR: "Embajador Junior",
          AMBASSADOR: "Embajador",
          SENIOR_AMBASSADOR: "Embajador Senior",
        };
        const firstLabel =
          labelMap[String(categories[0]?.category)] ||
          String(categories[0]?.category || "-");
        const extra =
          categories.length > 1 ? ` (+${categories.length - 1})` : "";
        const hasManual = categories.some((c) => c.isManual);
        return (
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-foreground">
              {firstLabel}
              {extra}
            </span>
            {hasManual && (
              <Badge variant="secondary" className="h-5 text-[10px] px-1.5">
                Manual
              </Badge>
            )}
          </div>
        );
      },
    },
  ];

  // Pagination states
  const instructorsPagination = usePagination({
    defaultLimit: 10,
    defaultPage: 1,
  });
  const manualCatsPagination = usePagination({
    defaultLimit: 10,
    defaultPage: 1,
  });
  const existingCatsPagination = usePagination({
    defaultLimit: 10,
    defaultPage: 1,
  });

  // Client-side paginated slices
  const [instructorSearch, _setInstructorSearch] = useState("");

  const filteredInstructors = React.useMemo(() => {
    const query = instructorSearch.trim().toLowerCase();
    if (!query) return instructors;
    return instructors.filter((i) =>
      (i.name || "").toLowerCase().includes(query)
    );
  }, [instructors, instructorSearch]);

  const _paginatedInstructors = React.useMemo(() => {
    const start =
      (instructorsPagination.page - 1) * instructorsPagination.limit;
    return filteredInstructors.slice(
      start,
      start + instructorsPagination.limit
    );
  }, [
    filteredInstructors,
    instructorsPagination.page,
    instructorsPagination.limit,
  ]);

  const _paginatedManualCategories = React.useMemo(() => {
    const start = (manualCatsPagination.page - 1) * manualCatsPagination.limit;
    return manualCategories.slice(start, start + manualCatsPagination.limit);
  }, [manualCategories, manualCatsPagination.page, manualCatsPagination.limit]);

  const [existingSearch, setExistingSearch] = useState("");

  const filteredExistingManualCategories = React.useMemo(() => {
    const list = (
      (existingManualCategories as ExistingManualCategory[]) || []
    ).filter((r) =>
      shouldShowVisualCategory(r.discipline?.name || r.disciplineName || "")
    );
    const q = existingSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) =>
      (r.instructor?.name || r.instructorName || "").toLowerCase().includes(q)
    );
  }, [existingManualCategories, existingSearch]);

  const paginatedExistingManualCategories = React.useMemo(() => {
    const start =
      (existingCatsPagination.page - 1) * existingCatsPagination.limit;
    return filteredExistingManualCategories.slice(
      start,
      start + existingCatsPagination.limit
    );
  }, [
    filteredExistingManualCategories,
    existingCatsPagination.page,
    existingCatsPagination.limit,
  ]);

  // Pagination info builders
  const buildPaginationInfo = (total: number, page: number, limit: number) => {
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  };

  // Table columns for manual categories
  const _manualCategoryColumns: TableColumn<ManualCategory>[] = [
    {
      key: "instructorName",
      title: "Instructor",
      width: "200px",
      render: (_, record) => (
        <div className="font-medium text-sm">{record.instructorName}</div>
      ),
    },
    {
      key: "disciplineName",
      title: "Disciplina",
      width: "150px",
      render: (_, record) => (
        <Badge variant="secondary" className="text-xs">
          {record.disciplineName}
        </Badge>
      ),
    },
    {
      key: "category",
      title: "Categoría",
      width: "200px",
      render: (_, record, index: number) => (
        <Select
          value={record.category}
          onValueChange={(value: InstructorCategoryType) =>
            updateCategory(index, value)
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
            <SelectItem value="JUNIOR_AMBASSADOR">Embajador Junior</SelectItem>
            <SelectItem value="AMBASSADOR">Embajador</SelectItem>
            <SelectItem value="SENIOR_AMBASSADOR">Embajador Senior</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "actions",
      title: "Acciones",
      width: "80px",
      render: (_, _record, index: number) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeCategory(index)}
          disabled={deleteManualCategoryMutation.isPending}
          className="h-7 w-7 p-0"
        >
          {deleteManualCategoryMutation.isPending ? (
            <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 text-red-500" />
          )}
        </Button>
      ),
    },
  ];

  type PeriodListItem = { id: string; number: number; year: number };
  const periodsSimple = periodsList as PeriodListItem[];

  const existingManualCategoryColumns: TableColumn<ExistingManualCategory>[] = [
    {
      key: "instructor",
      title: "Instructor",
      width: "220px",
      render: (_: unknown, record: ExistingManualCategory) => (
        <div className="font-medium text-sm">
          {record.instructor?.name || record.instructorName}
        </div>
      ),
    },
    {
      key: "discipline",
      title: "Disciplina",
      width: "160px",
      render: (_: unknown, record: ExistingManualCategory) => (
        <Badge variant="secondary" className="text-xs">
          {record.discipline?.name || record.disciplineName}
        </Badge>
      ),
    },
    {
      key: "category",
      title: "Categoría",
      width: "260px",
      render: (_: unknown, record: ExistingManualCategory) => (
        <div className="flex items-center gap-2">
          <Select
            value={record.category as InstructorCategoryType}
            onValueChange={async (value: InstructorCategoryType) => {
              try {
                await setManualCategoriesMutation.mutateAsync({
                  periodId: selectedPeriodId,
                  categories: [
                    {
                      instructorId: record.instructorId,
                      disciplineId: record.disciplineId,
                      category: value,
                    },
                  ],
                });
                toast.success("Categoría actualizada");
                await refetchManualCategories();
              } catch (error) {
                toast.error(
                  `Error al actualizar: ${error instanceof Error ? error.message : "Error desconocido"}`
                );
              }
            }}
          >
            <SelectTrigger className="h-8 text-xs w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
              <SelectItem value="JUNIOR_AMBASSADOR">
                Embajador Junior
              </SelectItem>
              <SelectItem value="AMBASSADOR">Embajador</SelectItem>
              <SelectItem value="SENIOR_AMBASSADOR">
                Embajador Senior
              </SelectItem>
            </SelectContent>
          </Select>
          {record.isManual && (
            <Badge variant="secondary" className="h-5 text-[10px] px-1.5">
              Manual
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Acciones",
      width: "90px",
      render: (_: unknown, record: ExistingManualCategory) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            deleteExistingManualCategory(
              record.instructorId,
              record.disciplineId
            )
          }
          disabled={deleteManualCategoryMutation.isPending}
          className="h-7 w-7 p-0"
        >
          {deleteManualCategoryMutation.isPending ? (
            <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 text-red-500" />
          )}
        </Button>
      ),
    },
  ];

  const CategoriesBody: React.FC = () => {
    if (!selectedPeriodId) {
      return (
        <p className="text-xs text-muted-foreground">
          Selecciona un período para ver resultados.
        </p>
      );
    }

    if (existingManualCategories && existingManualCategories.length > 0) {
      return (
        <ScrollableTable
          columns={existingManualCategoryColumns}
          data={paginatedExistingManualCategories as ExistingManualCategory[]}
          className="[&>div.bg-card]:border-0 [&>div.bg-card]:bg-transparent [&>div.bg-card]:rounded-none"
          rowKey={(record) => `${record.instructorId}-${record.disciplineId}`}
          pagination={buildPaginationInfo(
            filteredExistingManualCategories?.length || 0,
            existingCatsPagination.page,
            existingCatsPagination.limit
          )}
          onPageChange={existingCatsPagination.setPage}
          onPageSizeChange={existingCatsPagination.setLimit}
          headerActions={
            <div className="flex items-center gap-2 w-full sm:w-72">
              <div className="relative w-full">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={existingSearch}
                  onChange={(e) => {
                    setExistingSearch(e.target.value);
                    existingCatsPagination.setPage(1);
                  }}
                  placeholder="Buscar instructor..."
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </div>
          }
        />
      );
    }

    return (
      <p className="text-xs text-muted-foreground">
        No hay categorías para este período.
      </p>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/pagos")}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Calcular Pagos
            </h1>
            <p className="text-xs text-muted-foreground">
              Calcula pagos y gestiona categorías por período
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedPeriodId}
            onValueChange={setSelectedPeriodId}
            disabled={isCalculating}
          >
            <SelectTrigger className="w-[220px] h-9 pr-8 relative">
              <SelectValue placeholder="Selecciona un período" />
              {isFetchingCategories && (
                <Loader2 className="absolute right-2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </SelectTrigger>
            <SelectContent>
              {periodsSimple.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  Período {period.number} - {period.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleCalculateAll}
            disabled={!selectedPeriodId || isCalculating}
            className="w-auto"
          >
            {isCalculating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4 mr-2" />
            )}
            {isCalculating ? "Calculando..." : "Calcular Pagos"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 h-9 bg-muted/30 rounded-md p-0.5">
          <TabsTrigger
            value="calculator"
            className="flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-sm transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Calculator className="h-3.5 w-3.5" />
            Calculadora
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-sm transition-all duration-200 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Settings className="h-3.5 w-3.5" />
            Categorías
          </TabsTrigger>
        </TabsList>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {instructors.length} instructores activos
            </div>
          </div>

          {/* Results */}
          {instructorLogs.length > 0 && summary && (
            <DetailedInstructorLogs
              instructorLogs={convertInstructorLogs(instructorLogs)}
              summary={summary}
            />
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Categorías</CardTitle>
              <CardDescription className="text-xs">
                Listado de categorías aplicadas en el período seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoriesBody />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
