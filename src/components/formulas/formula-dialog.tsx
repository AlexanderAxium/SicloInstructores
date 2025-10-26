"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Schema for category requirements (matching old system)
const categoryRequirementsSchema = z.object({
  ocupacion: z.number(),
  clases: z.number(),
  localesEnLima: z.number(),
  dobleteos: z.number(),
  horariosNoPrime: z.number(),
  participacionEventos: z.boolean(),
  antiguedadMinima: z.number().optional(),
  evaluacionPromedio: z.number().optional(),
  capacitacionesCompletadas: z.number().optional(),
  lineamientos: z.boolean(),
});

// Schema for payment parameters (matching old system)
const paymentParametersSchema = z.object({
  cuotaFija: z.number(),
  minimoGarantizado: z.number(),
  tarifas: z.array(
    z.object({
      tarifa: z.number(),
      numeroReservas: z.number(),
    })
  ),
  tarifaFullHouse: z.number(),
  maximo: z.number(),
  bono: z.number(),
  retencionPorcentaje: z.number().optional(),
  ajustePorDobleteo: z.number().optional(),
});

// Define validation schemas locally
const createFormulaSchema = z.object({
  disciplineId: z.string().min(1, "Disciplina es requerida"),
  periodId: z.string().min(1, "Período es requerido"),
  categoryRequirements: z.record(categoryRequirementsSchema),
  paymentParameters: z.record(paymentParametersSchema),
});

interface FormulaDialogProps {
  formulaData: any | null; // Changed from Formula to any to match database structure
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: z.infer<typeof createFormulaSchema>) => void;
  isLoading: boolean;
}

export function FormulaDialog({
  formulaData,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: FormulaDialogProps) {
  const isEdit = !!formulaData;
  const [activeTab, setActiveTab] = useState("tariffs");
  const [simpleTariff, setSimpleTariff] = useState(false);

  // Instructor categories (matching the old system)
  const instructorCategories = [
    "INSTRUCTOR",
    "EMBAJADOR_JUNIOR",
    "EMBAJADOR",
    "EMBAJADOR_SENIOR",
  ];

  // State for requirements and payment parameters
  const [categoryRequirements, setCategoryRequirements] = useState<
    Record<string, any>
  >({});
  const [paymentParameters, setPaymentParameters] = useState<
    Record<string, any>
  >({});

  // Obtener datos para los selectores
  const { data: disciplinesData } = trpc.disciplines.getAll.useQuery();
  const { data: periodsData } = trpc.periods.getAll.useQuery();

  const disciplines = disciplinesData?.disciplines || [];
  const periods = periodsData?.periods || [];

  const form = useForm<z.infer<typeof createFormulaSchema>>({
    resolver: zodResolver(createFormulaSchema),
    defaultValues: {
      disciplineId: "",
      periodId: "",
      categoryRequirements: {},
      paymentParameters: {},
    },
  });

  // Initialize state when dialog opens
  useEffect(() => {
    if (isOpen && formulaData) {
      // Editing existing formula - parse JSON fields
      try {
        const categoryReqs =
          typeof formulaData.categoryRequirements === "string"
            ? JSON.parse(formulaData.categoryRequirements)
            : formulaData.categoryRequirements;
        const paymentParams =
          typeof formulaData.paymentParameters === "string"
            ? JSON.parse(formulaData.paymentParameters)
            : formulaData.paymentParameters;

        setCategoryRequirements(categoryReqs || {});
        setPaymentParameters(paymentParams || {});
      } catch (error) {
        console.error("Error parsing formula data:", error);
        // Fallback to empty values
        setCategoryRequirements({});
        setPaymentParameters({});
      }
    } else if (isOpen && !formulaData) {
      // Creating new formula - initialize empty values
      const emptyRequirements: Record<string, any> = {};
      const emptyParameters: Record<string, any> = {};

      instructorCategories.forEach((category) => {
        emptyRequirements[category] = {
          ocupacion: 0,
          clases: 0,
          localesEnLima: 0,
          dobleteos: 0,
          horariosNoPrime: 0,
          participacionEventos: false,
          lineamientos: false,
        };

        emptyParameters[category] = {
          cuotaFija: 0,
          minimoGarantizado: 0,
          tarifas: [{ tarifa: 0, numeroReservas: 20 }],
          tarifaFullHouse: 0,
          maximo: 0,
          bono: 0,
        };
      });

      setCategoryRequirements(emptyRequirements);
      setPaymentParameters(emptyParameters);
    }
  }, [isOpen, formulaData]);

  // Resetear el formulario cuando cambie la fórmula
  useEffect(() => {
    if (formulaData) {
      try {
        const categoryReqs =
          typeof formulaData.categoryRequirements === "string"
            ? JSON.parse(formulaData.categoryRequirements)
            : formulaData.categoryRequirements;
        const paymentParams =
          typeof formulaData.paymentParameters === "string"
            ? JSON.parse(formulaData.paymentParameters)
            : formulaData.paymentParameters;

        form.reset({
          disciplineId: formulaData.disciplineId,
          periodId: formulaData.periodId,
          categoryRequirements: categoryReqs || {},
          paymentParameters: paymentParams || {},
        });
      } catch (error) {
        console.error("Error parsing formula data for form reset:", error);
        form.reset({
          disciplineId: formulaData.disciplineId,
          periodId: formulaData.periodId,
          categoryRequirements: {},
          paymentParameters: {},
        });
      }
    } else {
      form.reset({
        disciplineId: "",
        periodId: "",
        categoryRequirements: {},
        paymentParameters: {},
      });
    }
  }, [formulaData, form]);

  // Handle requirement changes
  const handleRequirementChange = (
    category: string,
    field: string,
    value: string | boolean
  ) => {
    setCategoryRequirements((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]:
          field === "eventParticipation" || field === "guidelines"
            ? Boolean(value)
            : typeof value === "string"
              ? Number(value)
              : value,
      },
    }));
  };

  // Handle payment parameter changes
  const handlePaymentParameterChange = (
    category: string,
    field: string,
    value: string
  ) => {
    if (simpleTariff) {
      // If simple tariff is active, apply the change to all categories
      const newValue = Number(value);
      const newParameters = { ...paymentParameters };

      instructorCategories.forEach((cat) => {
        newParameters[cat] = {
          ...newParameters[cat],
          [field]: newValue,
        };
      });

      setPaymentParameters(newParameters);
    } else {
      // Normal behavior, only update the selected category
      setPaymentParameters((prev) => ({
        ...prev,
        [category]: {
          ...(prev[category] || {}),
          [field]: Number(value),
        },
      }));
    }
  };

  // Handle tariff changes
  const handleTariffChange = (
    category: string,
    index: number,
    field: string,
    value: string
  ) => {
    if (simpleTariff) {
      // If simple tariff is active, apply the change to all categories
      const newValue = Number(value);
      const newParameters = { ...paymentParameters };

      instructorCategories.forEach((cat) => {
        const newTarifas = [...newParameters[cat].tarifas];
        newTarifas[index] = {
          ...newTarifas[index],
          [field]: newValue,
        };

        newParameters[cat] = {
          ...newParameters[cat],
          tarifas: newTarifas,
        };
      });

      setPaymentParameters(newParameters);
    } else {
      // Normal behavior
      setPaymentParameters((prev) => {
        const newTarifas = [...prev[category].tarifas];
        newTarifas[index] = {
          ...newTarifas[index],
          [field]: Number(value),
        };

        return {
          ...prev,
          [category]: {
            ...prev[category],
            tarifas: newTarifas,
          },
        };
      });
    }
  };

  // Add a new tariff
  const addTariff = (category: string) => {
    if (simpleTariff) {
      // If simple tariff is active, add the tariff to all categories
      const newParameters = { ...paymentParameters };

      instructorCategories.forEach((cat) => {
        const tarifas = newParameters[cat].tarifas || [];
        const maxReservations =
          tarifas.length > 0
            ? Math.max(...tarifas.map((t: any) => t.numeroReservas))
            : 0;

        newParameters[cat] = {
          ...newParameters[cat],
          tarifas: [
            ...tarifas,
            { tarifa: 0, numeroReservas: maxReservations + 10 },
          ],
        };
      });

      setPaymentParameters(newParameters);
    } else {
      // Normal behavior
      setPaymentParameters((prev) => {
        const tarifas = prev[category].tarifas || [];
        const maxReservations =
          tarifas.length > 0
            ? Math.max(...tarifas.map((t: any) => t.numeroReservas))
            : 0;

        const newTariff = { tarifa: 0, numeroReservas: maxReservations + 10 };

        return {
          ...prev,
          [category]: {
            ...prev[category],
            tarifas: [...tarifas, newTariff],
          },
        };
      });
    }
  };

  // Remove a tariff
  const removeTariff = (category: string, index: number) => {
    if (simpleTariff) {
      // If simple tariff is active, remove the tariff from all categories
      const newParameters = { ...paymentParameters };

      instructorCategories.forEach((cat) => {
        const newTarifas = [...newParameters[cat].tarifas];
        newTarifas.splice(index, 1);

        newParameters[cat] = {
          ...newParameters[cat],
          tarifas: newTarifas,
        };
      });

      setPaymentParameters(newParameters);
    } else {
      // Normal behavior
      setPaymentParameters((prev) => {
        const newTarifas = [...prev[category].tarifas];
        newTarifas.splice(index, 1);
        return {
          ...prev,
          [category]: {
            ...prev[category],
            tarifas: newTarifas,
          },
        };
      });
    }
  };

  // Handle simple tariff checkbox change
  const handleSimpleTariffChange = (checked: boolean) => {
    setSimpleTariff(checked);

    if (checked) {
      // If activated, copy values from the first category to all others
      const firstCategory = instructorCategories[0];
      if (firstCategory) {
        const newParameters = { ...paymentParameters };

        instructorCategories.forEach((category) => {
          if (category !== firstCategory) {
            newParameters[category] = JSON.parse(
              JSON.stringify(newParameters[firstCategory])
            );
          }
        });

        setPaymentParameters(newParameters);
      }
    }
  };

  const handleSubmit = (data: z.infer<typeof createFormulaSchema>) => {
    // Update the form data with the current state
    const formData = {
      ...data,
      categoryRequirements,
      paymentParameters,
    };
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] max-h-[96vh] w-full overflow-y-auto p-4">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <DialogTitle className="text-xl font-semibold">
              {isEdit ? "Editar Fórmula" : "Nueva Fórmula"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configura las tarifas y parámetros de pago para esta fórmula.
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2 bg-muted/50 px-3 py-1.5 rounded-md border border-border">
              <input
                type="checkbox"
                id="simple-tariff"
                checked={simpleTariff}
                onChange={(e) => handleSimpleTariffChange(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-gray-300"
              />
              <label
                htmlFor="simple-tariff"
                className="text-xs font-medium cursor-pointer"
              >
                Tarifa Simple
              </label>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Discipline and Period Selectors */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="disciplineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">
                      Disciplina *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Seleccionar disciplina" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {disciplines?.map((discipline: any) => (
                          <SelectItem
                            key={discipline.id}
                            value={discipline.id}
                            className="text-xs"
                          >
                            {discipline.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="periodId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">
                      Período *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Seleccionar período" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {periods?.map(
                          (period: {
                            id: string;
                            number: number;
                            year: number;
                          }) => (
                            <SelectItem
                              key={period.id}
                              value={period.id}
                              className="text-xs"
                            >
                              {period.number} - {period.year}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tabs Section */}
            <div className="mt-4">
              <Tabs
                defaultValue="tariffs"
                onValueChange={setActiveTab}
                value={activeTab}
              >
                <TabsList className="grid grid-cols-2 mb-4 p-0.5 bg-gradient-to-r from-primary/10 to-secondary/10 border border-border rounded-md h-8">
                  <TabsTrigger
                    value="tariffs"
                    className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-medium rounded-sm transition-all h-7 text-xs"
                  >
                    Tarifas por Reservas
                  </TabsTrigger>
                  <TabsTrigger
                    value="requirements"
                    className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:font-medium rounded-sm transition-all h-7 text-xs"
                  >
                    Requisitos de Categorías
                  </TabsTrigger>
                </TabsList>

                {/* Tariffs Tab */}
                <TabsContent value="tariffs">
                  <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        Configuración de Tarifas
                      </h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const _maxReservations =
                            paymentParameters.INSTRUCTOR?.tarifas?.length > 0
                              ? Math.max(
                                  ...paymentParameters.INSTRUCTOR.tarifas.map(
                                    (t: any) => t.numeroReservas
                                  )
                                )
                              : 0;
                          instructorCategories.forEach((category) =>
                            addTariff(category)
                          );
                        }}
                        className="h-7 px-3 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Agregar Nivel
                      </Button>
                    </div>

                    {simpleTariff && (
                      <div className="mb-4 bg-amber-50 text-amber-800 px-3 py-2 rounded-md text-xs flex items-center border border-border">
                        <Info className="h-3 w-3 mr-1" />
                        Modo tarifa simple activado: los cambios se aplican a
                        todos los tipos de instructor.
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full border border-border rounded-md text-xs">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="w-[180px] text-left p-2 font-medium text-xs">
                              Parámetro
                            </th>
                            {instructorCategories.map((category, index) => (
                              <th
                                key={category}
                                className={`text-center font-medium p-2 text-xs ${
                                  simpleTariff && index > 0
                                    ? "text-muted-foreground"
                                    : "text-foreground"
                                }`}
                              >
                                {category.replace("_", " ")}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="font-medium p-2 text-xs">
                              Mínimo Garantizado
                            </td>
                            {instructorCategories.map((category, index) => (
                              <td key={category} className="text-center p-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={
                                    paymentParameters[category]
                                      ?.minimoGarantizado || 0
                                  }
                                  onChange={(e) =>
                                    handlePaymentParameterChange(
                                      category,
                                      "minimoGarantizado",
                                      e.target.value
                                    )
                                  }
                                  className="w-20 mx-auto h-6 text-xs"
                                  disabled={simpleTariff && index > 0}
                                />
                              </td>
                            ))}
                          </tr>

                          {/* Tariffs by reservation level */}
                          {paymentParameters.INSTRUCTOR?.tarifas
                            ?.sort(
                              (a: any, b: any) =>
                                a.numeroReservas - b.numeroReservas
                            )
                            .map((tariff: any, index: number) => (
                              <tr
                                key={`tariff-level-${index}`}
                                className={index % 2 === 0 ? "bg-muted/20" : ""}
                              >
                                <td className="font-medium p-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <span className="mr-1 text-xs">
                                        Hasta
                                      </span>
                                      <Input
                                        type="number"
                                        value={tariff.numeroReservas}
                                        onChange={(e) => {
                                          const newValue = e.target.value;
                                          instructorCategories.forEach(
                                            (category) => {
                                              if (
                                                paymentParameters[category]
                                                  ?.tarifas?.[index]
                                              ) {
                                                handleTariffChange(
                                                  category,
                                                  index,
                                                  "numeroReservas",
                                                  newValue
                                                );
                                              }
                                            }
                                          );
                                        }}
                                        className="w-12 h-6 text-xs"
                                      />
                                      <span className="ml-1 text-xs">
                                        reservas
                                      </span>
                                    </div>
                                    {index > 0 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          instructorCategories.forEach(
                                            (category) => {
                                              if (
                                                paymentParameters[category]
                                                  ?.tarifas?.length > index
                                              ) {
                                                removeTariff(category, index);
                                              }
                                            }
                                          );
                                        }}
                                        className="h-6 w-6 p-0 text-destructive hover:text-destructive/90"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                                {instructorCategories.map(
                                  (category, categoryIndex) => (
                                    <td
                                      key={`${category}-tariff-${index}`}
                                      className="text-center p-2"
                                    >
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={
                                          paymentParameters[category]
                                            ?.tarifas?.[index]?.tarifa || 0
                                        }
                                        onChange={(e) =>
                                          handleTariffChange(
                                            category,
                                            index,
                                            "tarifa",
                                            e.target.value
                                          )
                                        }
                                        className="w-20 mx-auto h-6 text-xs"
                                        disabled={
                                          simpleTariff && categoryIndex > 0
                                        }
                                      />
                                    </td>
                                  )
                                )}
                              </tr>
                            ))}

                          <tr className="bg-muted/20">
                            <td className="font-medium p-2 text-xs">
                              Full House
                            </td>
                            {instructorCategories.map((category, index) => (
                              <td key={category} className="text-center p-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={
                                    paymentParameters[category]
                                      ?.tarifaFullHouse || 0
                                  }
                                  onChange={(e) =>
                                    handlePaymentParameterChange(
                                      category,
                                      "tarifaFullHouse",
                                      e.target.value
                                    )
                                  }
                                  className="w-20 mx-auto h-6 text-xs"
                                  disabled={simpleTariff && index > 0}
                                />
                              </td>
                            ))}
                          </tr>

                          <tr>
                            <td className="font-medium p-2 text-xs">Máximo</td>
                            {instructorCategories.map((category, index) => (
                              <td key={category} className="text-center p-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={
                                    paymentParameters[category]?.maximo || 0
                                  }
                                  onChange={(e) =>
                                    handlePaymentParameterChange(
                                      category,
                                      "maximo",
                                      e.target.value
                                    )
                                  }
                                  className="w-20 mx-auto h-6 text-xs"
                                  disabled={simpleTariff && index > 0}
                                />
                              </td>
                            ))}
                          </tr>

                          <tr className="bg-muted/20">
                            <td className="font-medium p-2 text-xs">Bono</td>
                            {instructorCategories.map((category, index) => (
                              <td key={category} className="text-center p-2">
                                <div className="flex items-center justify-center gap-1">
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id={`${category}-has-bonus`}
                                      checked={
                                        !!paymentParameters[category]?.bonus
                                      }
                                      onChange={(e) => {
                                        const newValue = e.target.checked
                                          ? 0.5
                                          : 0;
                                        handlePaymentParameterChange(
                                          category,
                                          "bonus",
                                          newValue.toString()
                                        );
                                      }}
                                      className="h-3 w-3 rounded border-gray-300 mr-1"
                                      disabled={simpleTariff && index > 0}
                                    />
                                    {paymentParameters[category]?.bonus ? (
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={
                                          paymentParameters[category]?.bonus ||
                                          0
                                        }
                                        onChange={(e) =>
                                          handlePaymentParameterChange(
                                            category,
                                            "bonus",
                                            e.target.value
                                          )
                                        }
                                        className="w-16 h-6 text-xs"
                                        disabled={simpleTariff && index > 0}
                                      />
                                    ) : (
                                      <span className="text-xs text-muted-foreground">
                                        No
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                            ))}
                          </tr>

                          <tr>
                            <td className="font-medium p-2 text-xs">
                              Cuota Fija
                            </td>
                            {instructorCategories.map((category, index) => (
                              <td key={category} className="text-center p-2">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={
                                    paymentParameters[category]?.cuotaFija || 0
                                  }
                                  onChange={(e) =>
                                    handlePaymentParameterChange(
                                      category,
                                      "cuotaFija",
                                      e.target.value
                                    )
                                  }
                                  className="w-20 mx-auto h-6 text-xs"
                                  disabled={simpleTariff && index > 0}
                                />
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>

                {/* Requirements Tab */}
                <TabsContent value="requirements">
                  <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full border border-border rounded-md text-xs">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="w-[180px] text-left p-2 font-medium text-xs">
                              Requisito
                            </th>
                            {instructorCategories.map((category) => (
                              <th
                                key={category}
                                className="text-center p-2 font-medium text-xs"
                              >
                                {category.replace("_", " ")}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-muted/20">
                            <td className="font-medium p-2 text-xs">
                              Ocupación (%)
                            </td>
                            {instructorCategories.map((category) => (
                              <td
                                key={`${category}-occupation`}
                                className="text-center p-2"
                              >
                                <Input
                                  type="number"
                                  value={
                                    categoryRequirements[category]?.ocupacion ||
                                    0
                                  }
                                  onChange={(e) =>
                                    handleRequirementChange(
                                      category,
                                      "ocupacion",
                                      e.target.value
                                    )
                                  }
                                  className="w-20 mx-auto h-6 text-xs"
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="font-medium p-2 text-xs">Clases</td>
                            {instructorCategories.map((category) => (
                              <td
                                key={`${category}-classes`}
                                className="text-center p-2"
                              >
                                <Input
                                  type="number"
                                  value={
                                    categoryRequirements[category]?.clases || 0
                                  }
                                  onChange={(e) =>
                                    handleRequirementChange(
                                      category,
                                      "clases",
                                      e.target.value
                                    )
                                  }
                                  className="w-20 mx-auto h-6 text-xs"
                                />
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-muted/20">
                            <td className="font-medium p-2 text-xs">
                              Locales en Lima
                            </td>
                            {instructorCategories.map((category) => (
                              <td
                                key={`${category}-lima-locations`}
                                className="text-center p-2"
                              >
                                <Input
                                  type="number"
                                  value={
                                    categoryRequirements[category]
                                      ?.localesEnLima || 0
                                  }
                                  onChange={(e) =>
                                    handleRequirementChange(
                                      category,
                                      "localesEnLima",
                                      e.target.value
                                    )
                                  }
                                  className="w-20 mx-auto h-6 text-xs"
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="font-medium p-2 text-xs">
                              Dobleteos
                            </td>
                            {instructorCategories.map((category) => (
                              <td
                                key={`${category}-double-shifts`}
                                className="text-center p-2"
                              >
                                <Input
                                  type="number"
                                  value={
                                    categoryRequirements[category]?.dobleteos ||
                                    0
                                  }
                                  onChange={(e) =>
                                    handleRequirementChange(
                                      category,
                                      "dobleteos",
                                      e.target.value
                                    )
                                  }
                                  className="w-20 mx-auto h-6 text-xs"
                                />
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-muted/20">
                            <td className="font-medium p-2 text-xs">
                              Horarios No-Prime
                            </td>
                            {instructorCategories.map((category) => (
                              <td
                                key={`${category}-non-prime-hours`}
                                className="text-center p-2"
                              >
                                <Input
                                  type="number"
                                  value={
                                    categoryRequirements[category]
                                      ?.horariosNoPrime || 0
                                  }
                                  onChange={(e) =>
                                    handleRequirementChange(
                                      category,
                                      "horariosNoPrime",
                                      e.target.value
                                    )
                                  }
                                  className="w-20 mx-auto h-6 text-xs"
                                />
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="font-medium p-2 text-xs">
                              Participación en Eventos
                            </td>
                            {instructorCategories.map((category) => (
                              <td
                                key={`${category}-event-participation`}
                                className="text-center p-2"
                              >
                                <div className="flex justify-center">
                                  <input
                                    type="checkbox"
                                    id={`${category}-event-participation`}
                                    checked={
                                      !!categoryRequirements[category]
                                        ?.participacionEventos
                                    }
                                    onChange={(e) =>
                                      handleRequirementChange(
                                        category,
                                        "participacionEventos",
                                        e.target.checked
                                      )
                                    }
                                    className="h-3 w-3 rounded border-gray-300"
                                  />
                                </div>
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-muted/20">
                            <td className="font-medium p-2 text-xs">
                              Cumple Lineamientos
                            </td>
                            {instructorCategories.map((category) => (
                              <td
                                key={`${category}-meets-guidelines`}
                                className="text-center p-2"
                              >
                                <div className="flex justify-center">
                                  <input
                                    type="checkbox"
                                    id={`${category}-meets-guidelines`}
                                    checked={
                                      !!categoryRequirements[category]
                                        ?.lineamientos
                                    }
                                    onChange={(e) =>
                                      handleRequirementChange(
                                        category,
                                        "lineamientos",
                                        e.target.checked
                                      )
                                    }
                                    className="h-3 w-3 rounded border-gray-300"
                                  />
                                </div>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-8 px-4 text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-8 px-4 text-xs"
              >
                {isLoading ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
