"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import type {
  TableAction,
  TableColumn,
} from "@/components/ui/scrollable-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/utils/trpc";
import { Calculator, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CalculateFormulaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodId: string;
  disciplineId: string;
  formulas: Array<{
    id: string;
    disciplineId: string;
    periodId: string;
    categoryRequirements: unknown;
    paymentParameters: unknown;
  }>;
}

interface ClassData {
  id: string;
  date: string;
  week: number;
  studio: string;
  room: string;
  totalReservations: number;
  spots: number;
  paidReservations: number;
  waitingLists: number;
  complimentary: number;
  discipline: {
    id: string;
    name: string;
    color: string | null;
  };
  instructor: {
    id: string;
    name: string;
    fullName: string | null;
  };
  period: {
    id: string;
    number: number;
    year: number;
  };
}

export function CalculateFormulaDialog({
  open,
  onOpenChange,
  periodId,
  disciplineId,
  formulas,
}: CalculateFormulaDialogProps) {
  const [searchText, setSearchText] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Get classes filtered by period and discipline
  const { data: classesData, isLoading: isLoadingClasses } =
    trpc.classes.getWithFilters.useQuery(
      {
        periodId,
        disciplineId,
        search: searchText || undefined,
        limit,
        offset: (page - 1) * limit,
      },
      {
        enabled: open && !!periodId && !!disciplineId,
      }
    );

  const classes = (classesData?.classes || []) as ClassData[];
  const totalClasses = classesData?.total || 0;

  // Debug
  useEffect(() => {
    if (open) {
      console.log("CalculateFormulaDialog opened");
      console.log("periodId:", periodId);
      console.log("disciplineId:", disciplineId);
      console.log("classes:", classes);
      console.log("totalClasses:", totalClasses);
      console.log("isLoadingClasses:", isLoadingClasses);
    }
  }, [open, periodId, disciplineId, classes, totalClasses, isLoadingClasses]);

  // Calculate payment
  const [calculatedPayment, setCalculatedPayment] = useState<number | null>(
    null
  );
  const [calculationDetails, setCalculationDetails] = useState<string>("");

  useEffect(() => {
    if (open) {
      setSearchText("");
      setSelectedClassId("");
      setSelectedCategory("");
      setPage(1);
      setCalculatedPayment(null);
      setCalculationDetails("");
    }
  }, [open]);

  const handleCalculate = () => {
    if (!selectedClassId || !selectedCategory) {
      toast.error("Selecciona una clase y una categoría para calcular");
      return;
    }

    // Get the selected class
    const selectedClass = classes.find((c) => c.id === selectedClassId);
    if (!selectedClass) {
      toast.error("Clase no encontrada");
      return;
    }

    // Get the formula for the discipline
    const formula = formulas.find(
      (f) => f.disciplineId === disciplineId && f.periodId === periodId
    );
    if (!formula || !formula.paymentParameters) {
      toast.error("No se encontró fórmula para esta disciplina y período");
      return;
    }

    try {
      // Get payment parameters for the selected category
      // Payment parameters use Spanish field names (matching seed format)
      interface PaymentParam {
        cuotaFija: number;
        minimoGarantizado: number;
        tarifas: Array<{ tarifa: number; numeroReservas: number }>;
        tarifaFullHouse: number;
        maximo: number;
        bono: number;
        retencionPorcentaje?: number;
        ajustePorDobleteo?: number;
      }
      const paymentParams = formula.paymentParameters as Record<
        string,
        PaymentParam
      >;
      const parametros = paymentParams[selectedCategory];

      if (!parametros) {
        toast.error(
          `No se encontraron parámetros para la categoría: ${selectedCategory}`
        );
        return;
      }

      // Get reservation count and capacity
      const reservaciones = selectedClass.totalReservations || 0;
      const capacidad = selectedClass.spots || 0;

      // Determine applicable tariff based on occupancy
      let tarifaAplicada = 0;
      let _tipoTarifa = "";
      const detalles: string[] = [];

      // Check if it's full house
      const esFullHouse = reservaciones >= capacidad;

      if (esFullHouse) {
        tarifaAplicada = parametros.tarifaFullHouse || 0;
        _tipoTarifa = "Full House";
        detalles.push(
          `Full House: ${reservaciones} reservas >= ${capacidad} lugares`
        );
      } else {
        // Get tariffs
        const tarifas = parametros.tarifas || [];
        if (tarifas.length === 0) {
          tarifaAplicada = parametros.tarifaFullHouse || 0;
          _tipoTarifa = "Tarifa Full House (por defecto)";
        } else {
          // Sort tariffs by reservation number (ascending)
          const tarifasOrdenadas = [...tarifas].sort(
            (a, b) => a.numeroReservas - b.numeroReservas
          );

          // Find applicable tariff
          let tarifaEncontrada = false;
          for (const tarifa of tarifasOrdenadas) {
            if (reservaciones <= tarifa.numeroReservas) {
              tarifaAplicada = tarifa.tarifa;
              _tipoTarifa = `Hasta ${tarifa.numeroReservas} reservas`;
              tarifaEncontrada = true;
              detalles.push(
                `Tarifa aplicada: ${tarifa.numeroReservas} reservas × COP ${tarifa.tarifa}`
              );
              break;
            }
          }

          // If no applicable tariff found, use full house tariff
          if (!tarifaEncontrada) {
            tarifaAplicada = parametros.tarifaFullHouse || 0;
            _tipoTarifa = "Full House (por defecto)";
            detalles.push(
              `Tarifa Full House aplicada por defecto: COP ${tarifaAplicada}`
            );
          }
        }
      }

      // Calculate payment: tariff × reservations
      let montoPago = tarifaAplicada * reservaciones;
      detalles.push(
        `${reservaciones} reservas × COP ${tarifaAplicada.toFixed(2)} = COP ${(reservaciones * tarifaAplicada).toFixed(2)}`
      );

      // Apply fixed quota if it exists
      if (parametros.cuotaFija && parametros.cuotaFija > 0) {
        montoPago += parametros.cuotaFija;
        detalles.push(`Cuota fija: +COP ${parametros.cuotaFija.toFixed(2)}`);
      }

      // Check if minimum guaranteed applies
      let _minimoAplicado = false;
      if (
        montoPago < parametros.minimoGarantizado &&
        parametros.minimoGarantizado > 0
      ) {
        _minimoAplicado = true;
        detalles.push(
          `\nAplicando mínimo garantizado: COP ${montoPago.toFixed(2)} < COP ${parametros.minimoGarantizado.toFixed(2)}`
        );
        montoPago = parametros.minimoGarantizado;
        detalles.push(`Monto con mínimo: COP ${montoPago.toFixed(2)}`);
      }

      // Check if maximum applies
      if (montoPago > parametros.maximo && parametros.maximo > 0) {
        detalles.push(
          `\nAplicando máximo: COP ${montoPago.toFixed(2)} > COP ${parametros.maximo.toFixed(2)}`
        );
        montoPago = parametros.maximo;
        detalles.push(`Monto final: COP ${montoPago.toFixed(2)}`);
      }

      setCalculatedPayment(montoPago);
      setCalculationDetails(detalles.join("\n"));
      toast.success("Cálculo completado");
    } catch (error) {
      toast.error("Error al calcular el pago");
      console.error("Error calculating payment:", error);
    }
  };

  const handleClose = () => {
    setSelectedClassId("");
    setSelectedCategory("");
    setCalculatedPayment(null);
    setCalculationDetails("");
    onOpenChange(false);
  };

  // Table columns
  const columns: TableColumn<ClassData>[] = [
    {
      key: "id",
      title: "ID",
      width: "60px",
      render: (_, record) => (
        <span className="text-xs font-mono text-muted-foreground">
          {record.id.slice(0, 6)}
        </span>
      ),
    },
    {
      key: "date",
      title: "Fecha",
      width: "100px",
      render: (_, record) => (
        <span className="text-xs">
          {new Date(record.date).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "week",
      title: "Semana",
      width: "70px",
      render: (_, record) => <span className="text-xs">{record.week}</span>,
    },
    {
      key: "studio",
      title: "Estudio",
      width: "120px",
      render: (_, record) => (
        <span className="text-xs truncate">{record.studio}</span>
      ),
    },
    {
      key: "instructor",
      title: "Instructor",
      width: "150px",
      render: (_, record) => (
        <span className="text-xs truncate">{record.instructor.name}</span>
      ),
    },
    {
      key: "reservations",
      title: "Reservas",
      width: "80px",
      render: (_, record) => (
        <span className="text-xs font-medium">{record.totalReservations}</span>
      ),
    },
    {
      key: "capacity",
      title: "Capacidad",
      width: "80px",
      render: (_, record) => <span className="text-xs">{record.spots}</span>,
    },
    {
      key: "occupancy",
      title: "Ocupación",
      width: "80px",
      render: (_, record) => {
        const percentage =
          record.spots > 0
            ? Math.round((record.totalReservations / record.spots) * 100)
            : 0;
        return <span className="text-xs font-medium">{percentage}%</span>;
      },
    },
  ];

  // Get categories from the first formula's payment parameters
  const getCategories = () => {
    const formula = formulas.find(
      (f) => f.disciplineId === disciplineId && f.periodId === periodId
    );
    if (!formula || !formula.paymentParameters) return [];

    try {
      const paymentParams = formula.paymentParameters as Record<
        string,
        unknown
      >;
      return Object.keys(paymentParams);
    } catch {
      return [];
    }
  };

  const categories = getCategories();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calcular Pago
          </DialogTitle>
          <DialogDescription>
            Selecciona una clase y categoría para calcular el pago
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar clase..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Classes Table */}
          <ScrollableTable
            data={classes}
            columns={columns}
            loading={isLoadingClasses}
            error={null}
            pagination={{
              total: totalClasses,
              page,
              limit,
              totalPages: Math.ceil(totalClasses / limit),
              hasNext: page * limit < totalClasses,
              hasPrev: page > 1,
            }}
            onPageChange={setPage}
            onPageSizeChange={() => {}}
            actions={[
              {
                label: "Seleccionar",
                icon: null,
                onClick: (row) => setSelectedClassId(row.id),
              },
            ]}
            emptyMessage="No se encontraron clases"
            emptyIcon={
              <Calculator className="h-12 w-12 text-muted-foreground" />
            }
          />

          {/* Category Selection */}
          <div className="space-y-2">
            <label htmlFor="category-select" className="text-sm font-medium">
              Categoría del Instructor
            </label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger id="category-select">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Class Info */}
          {selectedClassId && (
            <div className="bg-muted/30 p-3 rounded-md border border-border">
              <p className="text-xs text-muted-foreground mb-1">
                Clase seleccionada:
              </p>
              <p className="text-sm font-medium">
                {classes.find((c) => c.id === selectedClassId)?.date
                  ? new Date(
                      classes.find((c) => c.id === selectedClassId)?.date || ""
                    ).toLocaleDateString()
                  : "N/A"}
                {" - "}
                {classes.find((c) => c.id === selectedClassId)?.instructor
                  .name || "N/A"}
              </p>
            </div>
          )}

          {/* Calculation Result */}
          {calculatedPayment !== null && (
            <div className="bg-muted/30 p-4 rounded-md border border-border">
              <p className="text-sm font-semibold mb-2">
                Resultado del Cálculo:
              </p>
              <p className="text-2xl font-bold text-foreground mb-3">
                COP {calculatedPayment.toFixed(2)}
              </p>
              {calculationDetails && (
                <div className="text-sm text-muted-foreground whitespace-pre-line bg-muted/50 p-3 rounded border border-border">
                  {calculationDetails}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cerrar
          </Button>
          <Button
            onClick={handleCalculate}
            disabled={!selectedClassId || !selectedCategory}
          >
            Calcular Pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
