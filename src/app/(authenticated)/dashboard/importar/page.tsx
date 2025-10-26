"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ScrollableTable,
  type TableColumn,
} from "@/components/ui/scrollable-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ClassItem,
  ResultadoImportacion,
  TablaClasesResult,
} from "@/types";
import { trpc } from "@/utils/trpc";
import {
  AlertCircle,
  Check,
  Edit,
  FileSpreadsheet,
  Loader2,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ImportarPage() {
  const [file, setFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [periodoSeleccionadoId, setPeriodoSeleccionadoId] =
    useState<string>("");
  const [semanaInicial, setSemanaInicial] = useState<number>(1);
  const [tablaClases, setTablaClases] = useState<TablaClasesResult | null>(
    null
  );
  const [resultadoImportacion, setResultadoImportacion] =
    useState<ResultadoImportacion | null>(null);

  // Queries
  const { data: periods, isLoading: periodsLoading } =
    trpc.periods.getAll.useQuery();
  const { data: instructorsData } = trpc.instructor.getAll.useQuery({
    limit: 100,
  });
  const { data: disciplinesData } = trpc.disciplines.getAll.useQuery({
    limit: 100,
  });

  // Mutations
  const generarTablaMutation = trpc.import.generarTabla.useMutation({
    onSuccess: (result) => {
      setTablaClases(result.tablaClases);

      // Detect unmapped disciplines
      const unmapped = new Set<string>();
      result.tablaClases.clases.forEach((clase) => {
        if (!clase.mapeoDisciplina && clase.disciplina) {
          unmapped.add(clase.disciplina);
        }
      });

      if (unmapped.size > 0) {
        // There are unmapped disciplines, open mapping dialog
        const unmappedArray = Array.from(unmapped);
        setUnmappedDisciplines(unmappedArray);
        setDisciplineMapping({});
        setIsMappingDialogOpen(true);
        setIsGenerating(false);
        toast.warning(`Se detectaron ${unmapped.size} disciplinas sin mapear`);
      } else {
        // All disciplines are mapped, proceed to step 2
        setCurrentStep(2);
        setIsGenerating(false);
        setCurrentPage(1);
        setPageSize(50);
        toast.success("Tabla de clases generada exitosamente");
      }
    },
    onError: (error) => {
      setError(error.message);
      setIsGenerating(false);
      toast.error("Error al generar tabla de clases");
    },
  });

  const procesarMutation = trpc.import.procesar.useMutation({
    onSuccess: (result) => {
      setResultadoImportacion(result);
      setCurrentStep(3);
      setIsImporting(false);
      toast.success("Importación completada exitosamente");
    },
    onError: (error) => {
      setError(error.message);
      setIsImporting(false);
      toast.error("Error al procesar importación");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleGenerarTabla = async () => {
    if (!file || !periodoSeleccionadoId) {
      toast.error("Por favor selecciona un archivo y un período");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Convertir archivo a base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(",")[1] || ""; // Remover el prefijo data:application/...

        generarTablaMutation.mutate({
          file: base64Data,
          semanaInicial,
        });
      };
      reader.readAsDataURL(file);
    } catch (_error) {
      setError("Error al procesar el archivo");
      setIsGenerating(false);
    }
  };

  const handleProcesarImportacion = () => {
    if (!tablaClases || !periodoSeleccionadoId) {
      toast.error("No hay datos para procesar");
      return;
    }

    setIsImporting(true);
    setError(null);

    const configuracion = {
      periodoId: periodoSeleccionadoId,
      clases: tablaClases.clases
        .filter((clase) => !clase.eliminada)
        .map((clase) => ({
          ...clase,
          filaOriginal: 0, // Add missing required field
          estudio: clase.estudio || "",
          salon: clase.salon || "",
          dia: clase.dia || "",
          hora: clase.hora || "",
          semana: clase.semana || 1,
          reservasTotales: clase.reservasTotales || 0,
          listasEspera: clase.listasEspera || 0,
          cortesias: clase.cortesias || 0,
          lugares: clase.lugares || 0,
          reservasPagadas: clase.reservasPagadas || 0,
          textoEspecial: clase.textoEspecial || "",
          pais: clase.pais || "",
          ciudad: clase.ciudad || "",
          esInstructorVS: Boolean(clase.esInstructorVS),
          instructorExiste: Boolean(clase.instructorExiste),
          instructorNuevo: Boolean(clase.instructorNuevo),
          eliminada: Boolean(clase.eliminada),
        })),
    };

    procesarMutation.mutate(configuracion);
  };

  const resetState = () => {
    setFile(null);
    setCurrentStep(1);
    setIsGenerating(false);
    setIsImporting(false);
    setError(null);
    setPeriodoSeleccionadoId("");
    setSemanaInicial(1);
    setTablaClases(null);
    setResultadoImportacion(null);
    setCurrentPage(1);
    setPageSize(50);
    setIsEditDialogOpen(false);
    setEditingClase(null);
    setIsNewInstructor(false);
    setIsMappingDialogOpen(false);
    setUnmappedDisciplines([]);
    setDisciplineMapping({});
  };

  const periodsList = periods?.periods || [];
  const selectedPeriod = periodsList.find(
    (p: { id: string }) => p.id === periodoSeleccionadoId
  );

  // State for editing dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClase, setEditingClase] = useState<ClassItem | null>(null);
  const [isNewInstructor, setIsNewInstructor] = useState(false);

  // State for discipline mapping dialog
  const [isMappingDialogOpen, setIsMappingDialogOpen] = useState(false);
  const [unmappedDisciplines, setUnmappedDisciplines] = useState<string[]>([]);
  const [disciplineMapping, setDisciplineMapping] = useState<
    Record<string, string>
  >({});

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const handleEdit = (claseId: string) => {
    const clase = tablaClases?.clases.find((c) => c.id === claseId);
    if (clase) {
      setEditingClase({ ...clase });
      setIsNewInstructor(clase.instructorNuevo || false);
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveEdit = () => {
    if (editingClase && tablaClases) {
      const index = tablaClases.clases.findIndex(
        (c) => c.id === editingClase.id
      );
      if (index !== -1) {
        tablaClases.clases[index] = {
          ...tablaClases.clases[index],
          ...editingClase,
        };
        setIsEditDialogOpen(false);
        setEditingClase(null);
        toast.success("Clase actualizada");
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setEditingClase(null);
    setIsNewInstructor(false);
  };

  const handleFieldChange = (field: string, value: unknown) => {
    setEditingClase((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleDisciplineMappingChange = (
    unmappedName: string,
    mappedName: string
  ) => {
    setDisciplineMapping((prev) => ({ ...prev, [unmappedName]: mappedName }));
  };

  const handleConfirmMapping = () => {
    // Check if all disciplines are mapped
    const allMapped = unmappedDisciplines.every(
      (disc) => disciplineMapping[disc]
    );

    if (!allMapped) {
      toast.error("Debes mapear todas las disciplinas antes de continuar");
      return;
    }

    // Apply mapping to all classes
    if (tablaClases) {
      const updatedClases = tablaClases.clases.map((clase) => {
        if (!clase.mapeoDisciplina && disciplineMapping[clase.disciplina]) {
          return {
            ...clase,
            disciplina: disciplineMapping[clase.disciplina] || clase.disciplina,
            mapeoDisciplina: disciplineMapping[clase.disciplina],
          };
        }
        return clase;
      });

      setTablaClases({
        ...tablaClases,
        clases: updatedClases,
      });

      // Close dialog and proceed to step 2
      setIsMappingDialogOpen(false);
      setCurrentStep(2);
      setCurrentPage(1);
      setPageSize(50);
      toast.success("Mapeo de disciplinas completado exitosamente");
    }
  };

  const handleDeleteClase = (claseId: string) => {
    if (tablaClases) {
      const index = tablaClases.clases.findIndex((c) => c.id === claseId);
      if (index !== -1 && tablaClases.clases[index]) {
        tablaClases.clases[index].eliminada = true;

        // Recalcular totales
        const clasesValidas = tablaClases.clases.filter(
          (c) => !c.eliminada && (!c.errores || c.errores.length === 0)
        ).length;
        const clasesEliminadas = tablaClases.clases.filter(
          (c) => c.eliminada
        ).length;
        const clasesConErrores = tablaClases.clases.filter(
          (c) => !c.eliminada && c.errores && c.errores.length > 0
        ).length;

        setTablaClases({
          ...tablaClases,
          clasesValidas,
          clasesEliminadas,
          clasesConErrores,
        });
        toast.success("Clase marcada como eliminada");
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Paginated data
  const getPaginatedData = () => {
    if (!tablaClases?.clases) return [];
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return tablaClases.clases.slice(startIndex, endIndex);
  };

  /**
   * MAPEO DE COLUMNAS EXCEL -> SCHEMA PRISMA (model Class)
   * ======================================================
   *
   * Columnas del Excel que se mapean directamente:
   * - ID_clase → id (String)
   * - País → country (String) / pais
   * - Ciudad → city (String) / ciudad
   * - Disciplina → disciplineId (String) - busca/crea disciplina
   * - Estudio → studio (String) / estudio
   * - Instructor → instructorId (String) - busca/crea instructor
   * - Salón → room (String) / salon
   * - Día + Hora → date (DateTime) / dia + hora (se combinan)
   * - Reservas Totales → totalReservations (Int) / reservasTotales
   * - Listas de Espera → waitingLists (Int) / listasEspera
   * - Cortesias → complimentary (Int) / cortesias
   * - Lugares → spots (Int) / lugares
   * - Reservas Pagadas → paidReservations (Int) / reservasPagadas
   * - Texto especial → specialText (String?) / textoEspecial
   * - Semana → week (Int) / semana
   *
   * Campos del Excel NO usados actualmente (podrían almacenarse en JSON):
   * - Catorcena (quincena/periodo)
   * - Fitpass (fantasmas + bot), Fitpass Pagadas, Fitpass Bloqueadas, etc.
   * - Gympass, Gympass Late Cancel, Gympass Pagadas
   * - Classpass, Classpass Late Cancel, Classpass Pagadas
   * - Netas, Ecosinvisibles, PR Bloqueadas
   *
   * Campos especiales de Prisma:
   * - isVersus (Boolean) / esInstructorVS - detecta si el instructor tiene "VS" en el nombre
   * - versusNumber (Int?) - número de versus si aplica
   * - periodId (String) - seleccionado por el usuario antes de importar
   * - tenantId (String) - del contexto de autenticación
   * - replacementInstructorId, penaltyType, penaltyPoints - NULL por defecto
   */

  // Define columns for ScrollableTable - Columnas principales
  const clasesColumns: TableColumn<ClassItem>[] = [
    {
      key: "id",
      title: "ID",
      width: "70px",
      className: "text-xs font-mono",
      render: (value) => <span className="text-xs">{String(value)}</span>,
    },
    {
      key: "disciplina",
      title: "Disciplina",
      width: "110px",
      className: "text-sm",
      render: (value, record) => {
        const disciplinaNoExiste = !record.mapeoDisciplina;
        const badgeStyle = disciplinaNoExiste
          ? "border border-red-500 text-red-600 bg-red-500/15"
          : "";

        return (
          <span className={`text-xs px-1.5 py-0.5 rounded ${badgeStyle}`}>
            {String(value)}
          </span>
        );
      },
    },
    {
      key: "instructor",
      title: "Instructor",
      width: "150px",
      className: "text-sm",
      render: (value, record) => {
        const instructorNoExiste =
          record.instructorNuevo || !record.instructorExiste;
        const badgeStyle = instructorNoExiste
          ? "border border-yellow-600 text-yellow-700 bg-yellow-600/15"
          : "";

        return (
          <div className="flex items-center gap-1">
            <span
              className={`text-xs px-1.5 py-0.5 rounded font-medium ${badgeStyle}`}
            >
              {String(value)}
            </span>
            {record.esInstructorVS && (
              <span className="text-xs px-1.5 py-0.5 rounded border border-purple-600 text-purple-700 bg-purple-600/15 font-medium">
                VS
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "estudio",
      title: "Estudio",
      width: "95px",
      className: "text-xs",
      render: (value) => <span className="text-xs">{String(value)}</span>,
    },
    {
      key: "salon",
      title: "Salón",
      width: "75px",
      className: "text-xs",
      render: (value) => (
        <span className="text-xs">{String(value || "-")}</span>
      ),
    },
    {
      key: "dia",
      title: "Fecha",
      width: "95px",
      className: "text-xs",
      render: (value) => (
        <span className="text-xs">
          {new Date(value as string).toLocaleDateString("es-PE", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "hora",
      title: "Hora",
      width: "70px",
      className: "text-xs",
      render: (value) => <span className="text-xs">{String(value)}</span>,
    },
    {
      key: "semana",
      title: "Sem",
      width: "55px",
      className: "text-xs text-center",
      render: (value) => (
        <Badge variant="outline" className="text-xs py-0">
          {String(value)}
        </Badge>
      ),
    },
    {
      key: "reservasTotales",
      title: "Reservas",
      width: "80px",
      className: "text-xs text-center font-semibold",
      render: (value) => (
        <span className="text-xs font-semibold">{String(value)}</span>
      ),
    },
    {
      key: "lugares",
      title: "Lugares",
      width: "70px",
      className: "text-xs text-center",
      render: (value) => <span className="text-xs">{String(value)}</span>,
    },
  ];

  // Show loading state
  if (periodsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Importar Datos</h1>
          <p className="text-muted-foreground mt-1">
            Importa datos de clases desde Excel con mapeo automático de semanas
          </p>
        </div>
        {currentStep > 1 && (
          <Button variant="outline" onClick={resetState}>
            Nueva Importación
          </Button>
        )}
      </div>

      {/* Progress Steps */}
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= step
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-muted-foreground text-muted-foreground"
              }`}
            >
              {currentStep > step ? <Check className="h-4 w-4" /> : step}
            </div>
            <span
              className={`ml-2 text-sm ${
                currentStep >= step
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {step === 1
                ? "Subir Archivo"
                : step === 2
                  ? "Revisar Datos"
                  : "Resultado"}
            </span>
            {step < 3 && <div className="w-8 h-px bg-muted ml-4" />}
          </div>
        ))}
      </div>

      {/* Step 1: File Upload */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Subir Archivo Excel
            </CardTitle>
            <CardDescription>
              Selecciona el archivo Excel con los datos de clases y configura el
              período
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file-upload">Archivo Excel</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {file
                      ? file.name
                      : "Haz clic para seleccionar un archivo Excel"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatos soportados: .xlsx, .xls
                  </p>
                </label>
              </div>
            </div>

            {/* Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="period-select">Período</Label>
                <Select
                  value={periodoSeleccionadoId}
                  onValueChange={setPeriodoSeleccionadoId}
                >
                  <SelectTrigger id="period-select">
                    <SelectValue placeholder="Seleccionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodsList.map(
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

              <div className="space-y-2">
                <Label htmlFor="semana-inicial">Semana Inicial</Label>
                <Select
                  value={semanaInicial.toString()}
                  onValueChange={(value) =>
                    setSemanaInicial(Number.parseInt(value))
                  }
                >
                  <SelectTrigger id="semana-inicial">
                    <SelectValue placeholder="Seleccionar semana inicial" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 52 }, (_, i) => i + 1).map(
                      (semana) => (
                        <SelectItem key={semana} value={semana.toString()}>
                          Semana {semana}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedPeriod && (
              <div className="bg-muted/30 p-3 rounded border border-border">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {selectedPeriod.number} - {selectedPeriod.year}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Semana inicial: {semanaInicial}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleGenerarTabla}
              disabled={!file || !periodoSeleccionadoId || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando tabla...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Generar Tabla de Clases
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Data Review */}
      {currentStep === 2 && tablaClases && (
        <Card>
          <CardHeader>
            <CardTitle>Revisar Datos</CardTitle>
            <CardDescription>
              Revisa los datos importados antes de procesar la importación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/30 p-3 rounded border border-border">
                <div className="text-2xl font-bold">
                  {tablaClases.totalClases}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Clases
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {tablaClases.clasesValidas}
                </div>
                <div className="text-sm text-green-700">Válidas</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">
                  {tablaClases.clasesConErrores}
                </div>
                <div className="text-sm text-yellow-700">Con Errores</div>
              </div>
              <div className="bg-red-50 p-3 rounded border border-red-200">
                <div className="text-2xl font-bold text-red-600">
                  {tablaClases.clasesEliminadas}
                </div>
                <div className="text-sm text-red-700">Eliminadas</div>
              </div>
            </div>

            {/* Classes Preview */}

            <ScrollableTable
              data={getPaginatedData()}
              columns={clasesColumns}
              showPagination={true}
              pagination={{
                page: currentPage,
                limit: pageSize,
                total: tablaClases.clases.length,
                totalPages: Math.ceil(tablaClases.clases.length / pageSize),
                hasNext:
                  currentPage < Math.ceil(tablaClases.clases.length / pageSize),
                hasPrev: currentPage > 1,
              }}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[25, 50, 100, 200]}
              showActions={true}
              actions={[
                {
                  label: "Editar",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: (record) => handleEdit(record.id),
                  variant: "edit",
                  hidden: (record) => Boolean(record.eliminada),
                },
                {
                  label: "Eliminar",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: (record) => handleDeleteClase(record.id),
                  variant: "destructive",
                  hidden: (record) => Boolean(record.eliminada),
                  separator: true,
                },
              ]}
              actionsWidth="100px"
              actionsLabel="Acciones"
              emptyMessage="No hay clases para mostrar"
              className="mt-4"
              tableClassName="text-sm"
              rowClassName={(record) => {
                if (record.eliminada)
                  return "bg-red-50 opacity-60 line-through";
                return "";
              }}
            />

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Clase</DialogTitle>
                  <DialogDescription>
                    Modifica los datos de la clase. Todos los campos
                    corresponden al schema de la base de datos.
                  </DialogDescription>
                </DialogHeader>

                {editingClase && (
                  <div className="grid grid-cols-2 gap-4 py-4">
                    {/* País */}
                    <div className="space-y-2">
                      <Label htmlFor="pais">País</Label>
                      <Input
                        id="pais"
                        value={editingClase.pais || ""}
                        onChange={(e) =>
                          handleFieldChange("pais", e.target.value)
                        }
                        placeholder="País"
                      />
                    </div>

                    {/* Ciudad */}
                    <div className="space-y-2">
                      <Label htmlFor="ciudad">Ciudad</Label>
                      <Input
                        id="ciudad"
                        value={editingClase.ciudad || ""}
                        onChange={(e) =>
                          handleFieldChange("ciudad", e.target.value)
                        }
                        placeholder="Ciudad"
                      />
                    </div>

                    {/* Disciplina */}
                    <div className="space-y-2">
                      <Label htmlFor="disciplina">Disciplina</Label>
                      <Select
                        value={editingClase.disciplina || ""}
                        onValueChange={(value) =>
                          handleFieldChange("disciplina", value)
                        }
                      >
                        <SelectTrigger id="disciplina">
                          <SelectValue placeholder="Seleccionar disciplina" />
                        </SelectTrigger>
                        <SelectContent>
                          {disciplinesData?.disciplines.map(
                            (discipline: { id: string; name: string }) => (
                              <SelectItem
                                key={discipline.id}
                                value={discipline.name}
                              >
                                {discipline.name}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Instructor */}
                    <div className="space-y-2">
                      <Label htmlFor="instructor">Instructor</Label>
                      {isNewInstructor ? (
                        <div className="space-y-2">
                          <Input
                            id="instructor"
                            value={editingClase.instructor || ""}
                            onChange={(e) =>
                              handleFieldChange("instructor", e.target.value)
                            }
                            placeholder="Nombre del nuevo instructor"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsNewInstructor(false)}
                            className="w-full"
                          >
                            Seleccionar instructor existente
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Select
                            value={editingClase.instructor || ""}
                            onValueChange={(value) => {
                              if (value === "__new__") {
                                setIsNewInstructor(true);
                                handleFieldChange("instructor", "");
                              } else {
                                handleFieldChange("instructor", value);
                              }
                            }}
                          >
                            <SelectTrigger id="instructor">
                              <SelectValue placeholder="Seleccionar instructor" />
                            </SelectTrigger>
                            <SelectContent>
                              {instructorsData?.instructors.map(
                                (instructor: { id: string; name: string }) => (
                                  <SelectItem
                                    key={instructor.id}
                                    value={instructor.name}
                                  >
                                    {instructor.name}
                                  </SelectItem>
                                )
                              )}
                              <SelectItem
                                value="__new__"
                                className="font-semibold text-primary"
                              >
                                + Nuevo instructor...
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* Estudio */}
                    <div className="space-y-2">
                      <Label htmlFor="estudio">Estudio</Label>
                      <Input
                        id="estudio"
                        value={editingClase.estudio || ""}
                        onChange={(e) =>
                          handleFieldChange("estudio", e.target.value)
                        }
                        placeholder="Estudio"
                      />
                    </div>

                    {/* Salón */}
                    <div className="space-y-2">
                      <Label htmlFor="salon">Salón</Label>
                      <Input
                        id="salon"
                        value={editingClase.salon || ""}
                        onChange={(e) =>
                          handleFieldChange("salon", e.target.value)
                        }
                        placeholder="Salón"
                      />
                    </div>

                    {/* Fecha */}
                    <div className="space-y-2">
                      <Label htmlFor="dia">Fecha</Label>
                      <Input
                        id="dia"
                        type="date"
                        value={
                          editingClase.dia
                            ? new Date(editingClase.dia)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          handleFieldChange("dia", e.target.value)
                        }
                      />
                    </div>

                    {/* Hora */}
                    <div className="space-y-2">
                      <Label htmlFor="hora">Hora</Label>
                      <Input
                        id="hora"
                        value={editingClase.hora || ""}
                        onChange={(e) =>
                          handleFieldChange("hora", e.target.value)
                        }
                        placeholder="HH:MM"
                      />
                    </div>

                    {/* Semana */}
                    <div className="space-y-2">
                      <Label htmlFor="semana">Semana</Label>
                      <Input
                        id="semana"
                        type="number"
                        value={editingClase.semana || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            "semana",
                            Number.parseInt(e.target.value)
                          )
                        }
                        placeholder="Semana"
                      />
                    </div>

                    {/* Reservas Totales */}
                    <div className="space-y-2">
                      <Label htmlFor="reservasTotales">Reservas Totales</Label>
                      <Input
                        id="reservasTotales"
                        type="number"
                        value={editingClase.reservasTotales || 0}
                        onChange={(e) =>
                          handleFieldChange(
                            "reservasTotales",
                            Number.parseInt(e.target.value)
                          )
                        }
                      />
                    </div>

                    {/* Reservas Pagadas */}
                    <div className="space-y-2">
                      <Label htmlFor="reservasPagadas">Reservas Pagadas</Label>
                      <Input
                        id="reservasPagadas"
                        type="number"
                        value={editingClase.reservasPagadas || 0}
                        onChange={(e) =>
                          handleFieldChange(
                            "reservasPagadas",
                            Number.parseInt(e.target.value)
                          )
                        }
                      />
                    </div>

                    {/* Listas de Espera */}
                    <div className="space-y-2">
                      <Label htmlFor="listasEspera">Listas de Espera</Label>
                      <Input
                        id="listasEspera"
                        type="number"
                        value={editingClase.listasEspera || 0}
                        onChange={(e) =>
                          handleFieldChange(
                            "listasEspera",
                            Number.parseInt(e.target.value)
                          )
                        }
                      />
                    </div>

                    {/* Cortesías */}
                    <div className="space-y-2">
                      <Label htmlFor="cortesias">Cortesías</Label>
                      <Input
                        id="cortesias"
                        type="number"
                        value={editingClase.cortesias || 0}
                        onChange={(e) =>
                          handleFieldChange(
                            "cortesias",
                            Number.parseInt(e.target.value)
                          )
                        }
                      />
                    </div>

                    {/* Lugares/Spots */}
                    <div className="space-y-2">
                      <Label htmlFor="lugares">Lugares (Spots)</Label>
                      <Input
                        id="lugares"
                        type="number"
                        value={editingClase.lugares || 0}
                        onChange={(e) =>
                          handleFieldChange(
                            "lugares",
                            Number.parseInt(e.target.value)
                          )
                        }
                      />
                    </div>

                    {/* Texto Especial */}
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="textoEspecial">Texto Especial</Label>
                      <Input
                        id="textoEspecial"
                        value={editingClase.textoEspecial || ""}
                        onChange={(e) =>
                          handleFieldChange("textoEspecial", e.target.value)
                        }
                        placeholder="Texto especial (opcional)"
                      />
                    </div>

                    {/* Es Versus */}
                    <div className="space-y-2 col-span-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="esInstructorVS"
                          checked={editingClase.esInstructorVS || false}
                          onCheckedChange={(checked) =>
                            handleFieldChange("esInstructorVS", checked)
                          }
                        />
                        <Label
                          htmlFor="esInstructorVS"
                          className="cursor-pointer"
                        >
                          Clase VS (Versus)
                        </Label>
                      </div>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              onClick={handleProcesarImportacion}
              disabled={isImporting}
              className="w-full"
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando importación...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Procesar Importación
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Results */}
      {currentStep === 3 && resultadoImportacion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Importación Completada
            </CardTitle>
            <CardDescription>
              Resumen de la importación realizada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Results Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {resultadoImportacion.totalRegistros}
                </div>
                <div className="text-sm text-blue-700">Total Registros</div>
              </div>
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {resultadoImportacion.registrosImportados}
                </div>
                <div className="text-sm text-green-700">Importados</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">
                  {resultadoImportacion.registrosConError}
                </div>
                <div className="text-sm text-yellow-700">Con Errores</div>
              </div>
              <div className="bg-purple-50 p-3 rounded border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">
                  {resultadoImportacion.instructoresCreados}
                </div>
                <div className="text-sm text-purple-700">
                  Instructores Creados
                </div>
              </div>
            </div>

            {/* Errors */}
            {resultadoImportacion.errores &&
              resultadoImportacion.errores.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">
                    Errores encontrados:
                  </h4>
                  <div className="max-h-40 overflow-y-auto border border-red-200 rounded p-2 bg-red-50">
                    {resultadoImportacion.errores.map(
                      (error: { fila: number; mensaje: string }) => (
                        <div
                          key={`error-${error.fila}-${error.mensaje}`}
                          className="text-sm text-red-700"
                        >
                          Fila {error.fila}: {error.mensaje}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            <Button onClick={resetState} className="w-full">
              Nueva Importación
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Discipline Mapping Dialog */}
      <Dialog open={isMappingDialogOpen} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-2xl max-h-[80vh] overflow-y-auto border border-border rounded-lg"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Disciplinas sin mapear detectadas
            </DialogTitle>
            <DialogDescription>
              Se encontraron disciplinas en el archivo Excel que no coinciden
              con las disciplinas existentes en el sistema. Por favor, mapea
              cada disciplina desconocida con una disciplina existente para
              continuar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Debes mapear todas las disciplinas antes de poder continuar con
                la importación.
              </AlertDescription>
            </Alert>

            {unmappedDisciplines.map((unmappedDisc) => (
              <div
                key={unmappedDisc}
                className="grid grid-cols-2 gap-4 items-center p-4 border border-border rounded-lg bg-muted/30"
              >
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Disciplina en Excel
                  </Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-sm">
                      {unmappedDisc}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor={`mapping-${unmappedDisc}`}
                    className="text-xs text-muted-foreground"
                  >
                    Mapear a disciplina existente
                  </Label>
                  <Select
                    value={disciplineMapping[unmappedDisc] || ""}
                    onValueChange={(value) =>
                      handleDisciplineMappingChange(unmappedDisc, value)
                    }
                  >
                    <SelectTrigger id={`mapping-${unmappedDisc}`}>
                      <SelectValue placeholder="Seleccionar disciplina..." />
                    </SelectTrigger>
                    <SelectContent>
                      {disciplinesData?.disciplines.map(
                        (discipline: { id: string; name: string }) => (
                          <SelectItem
                            key={discipline.id}
                            value={discipline.name}
                          >
                            {discipline.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              onClick={handleConfirmMapping}
              disabled={
                !unmappedDisciplines.every((disc) => disciplineMapping[disc])
              }
              className="w-full"
            >
              <Check className="h-4 w-4 mr-2" />
              Confirmar Mapeo y Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
