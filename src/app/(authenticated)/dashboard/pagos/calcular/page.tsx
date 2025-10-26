"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/utils/trpc";
import {
  AlertTriangle,
  Award,
  BookOpen,
  Building,
  Calculator,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  DollarSign,
  FileText,
  GraduationCap,
  Info,
  Loader2,
  RefreshCw,
  Trash2,
  User,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CalcularPagosPage() {
  const router = useRouter();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [calculationLogs, setCalculationLogs] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [expandedInstructors, setExpandedInstructors] = useState<Set<string>>(
    new Set()
  );
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(
    new Set()
  );

  // Queries
  const { data: periods, isLoading: periodsLoading } =
    trpc.periods.getAll.useQuery();

  // Mutations
  const calculateAllMutation =
    trpc.payments.calculateAllPeriodPayments.useMutation({
      onSuccess: (result: {
        success: boolean;
        message: string;
        logs: string[];
      }) => {
        if (result.success) {
          toast.success(result.message);
          setCalculationLogs(result.logs);
        } else {
          toast.error(result.message);
          setCalculationLogs(result.logs);
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
    setCalculationLogs([]);
    calculateAllMutation.mutate({ periodId: selectedPeriodId });
  };

  const periodsList = periods?.periods || [];

  // Función para procesar y agrupar logs por instructor y clase
  const processLogsByInstructor = (logs: string[]) => {
    const globalLogs: string[] = [];
    const instructorLogs: {
      [key: string]: {
        name: string;
        classes: {
          [classId: string]: {
            classId: string;
            className: string;
            logs: string[];
          };
        };
        otherLogs: string[];
      };
    } = {};

    // Identificar logs que contienen nombres de instructores
    const instructorMarkers: { index: number; name: string }[] = [];

    logs.forEach((log, index) => {
      // Buscar patrones que indican el nombre del instructor
      const patterns = [
        /Pago calculado para (.+)/,
        /Error al calcular pago para (.+):/,
        /Instructor (.+) no tiene clases/,
        /Instructor (.+) ya tiene pago aprobado/,
      ];

      for (const pattern of patterns) {
        const match = log.match(pattern);
        if (match?.[1]) {
          instructorMarkers.push({ index, name: match[1].trim() });
          break;
        }
      }
    });

    // Procesar logs y asignarlos a instructores o logs globales
    let currentInstructorName = "";
    let currentClassId = "";

    logs.forEach((log, index) => {
      // Verificar si este log es un marcador de instructor
      const instructorMarker = instructorMarkers.find(
        (marker) => marker.index === index
      );
      if (instructorMarker) {
        currentInstructorName = instructorMarker.name;
        if (!instructorLogs[currentInstructorName]) {
          instructorLogs[currentInstructorName] = {
            name: currentInstructorName,
            classes: {},
            otherLogs: [],
          };
        }
        instructorLogs[currentInstructorName]?.otherLogs.push(log);
        return;
      }

      // Detectar logs de clase específica
      const classMatch = log.match(/Calculando pago para clase (.+?)\.\.\./);
      if (classMatch?.[1]) {
        currentClassId = classMatch[1];
        if (currentInstructorName && instructorLogs[currentInstructorName]) {
          if (!instructorLogs[currentInstructorName]?.classes[currentClassId]) {
            const instructorLog = instructorLogs[currentInstructorName];
            if (instructorLog) {
              instructorLog.classes[currentClassId] = {
                classId: currentClassId,
                className: `Clase ${currentClassId}`,
                logs: [],
              };
            }
          }
          instructorLogs[currentInstructorName]?.classes[
            currentClassId
          ]?.logs.push(log);
        }
        return;
      }

      // Determinar si el log pertenece a un instructor o es global
      const isGlobalLog =
        log.includes("Iniciando cálculo de pagos") ||
        log.includes("Instructores activos encontrados") ||
        log.includes("Eliminados") ||
        log.includes("Resumen:") ||
        log.includes("Error en cálculo masivo");

      // Detectar logs que son específicos de clase (solo cálculos de clase individual)
      const isClassSpecificLog =
        log.includes("PAGO POR CLASE") ||
        (log.includes("Monto:") && log.includes("Categoría:")) ||
        log.includes("Reservas:") ||
        log.includes("Detalle:") ||
        log.includes("Monto acumulado:") ||
        log.includes("Monto total por clases:") ||
        log.includes("FULL HOUSE") ||
        log.includes("VERSUS") ||
        log.includes("Tarifa:") ||
        log.includes("Ocupación:");

      // Detectar logs que son generales del instructor (no específicos de clase)
      const isInstructorGeneralLog =
        log.includes("Covers como reemplazo:") ||
        log.includes("Brandeos del instructor:") ||
        log.includes("Theme Rides del instructor:") ||
        log.includes("Workshops del instructor:") ||
        log.includes("Covers con bono:") ||
        log.includes("Brandeos:") ||
        log.includes("Theme Rides:") ||
        log.includes("Workshops:") ||
        log.includes("Retención (8%):") ||
        log.includes("Pago final:") ||
        log.includes("Penalizaciones del instructor:") ||
        log.includes("Categoría para") ||
        log.includes("Clases del instructor:");

      if (isGlobalLog) {
        globalLogs.push(log);
      } else if (
        currentInstructorName &&
        instructorLogs[currentInstructorName]
      ) {
        // Si es un log específico de clase y hay una clase actual, agregar a esa clase
        if (
          isClassSpecificLog &&
          currentClassId &&
          instructorLogs[currentInstructorName]?.classes[currentClassId]
        ) {
          instructorLogs[currentInstructorName]?.classes[
            currentClassId
          ]?.logs.push(log);
        } else if (isInstructorGeneralLog) {
          // Agregar a otros logs del instructor (logs generales)
          instructorLogs[currentInstructorName]?.otherLogs.push(log);
        } else {
          // Para otros logs, usar la lógica anterior
          if (
            currentClassId &&
            instructorLogs[currentInstructorName]?.classes[currentClassId]
          ) {
            instructorLogs[currentInstructorName]?.classes[
              currentClassId
            ]?.logs.push(log);
          } else {
            instructorLogs[currentInstructorName]?.otherLogs.push(log);
          }
        }
      } else {
        // Si no hay instructor actual y no es global, agregar a globales
        globalLogs.push(log);
      }
    });

    return { globalLogs, instructorLogs };
  };

  // Función para obtener el icono apropiado para cada tipo de log
  const getLogIcon = (log: string) => {
    if (log.includes("✅"))
      return <CheckCircle className="h-3 w-3 text-green-600" />;
    if (log.includes("❌")) return <XCircle className="h-3 w-3 text-red-600" />;
    if (log.includes("⚠️"))
      return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
    if (log.includes("🚀"))
      return <Calculator className="h-3 w-3 text-blue-600" />;
    if (log.includes("💰"))
      return <DollarSign className="h-3 w-3 text-green-600" />;
    if (log.includes("📋"))
      return <FileText className="h-3 w-3 text-blue-600" />;
    if (log.includes("👥"))
      return <Users className="h-3 w-3 text-purple-600" />;
    if (log.includes("📊"))
      return <Calendar className="h-3 w-3 text-orange-600" />;
    if (log.includes("📄"))
      return <BookOpen className="h-3 w-3 text-blue-600" />;
    if (log.includes("🏆"))
      return <Award className="h-3 w-3 text-yellow-600" />;
    if (log.includes("⚡")) return <Zap className="h-3 w-3 text-purple-600" />;
    if (log.includes("🎓"))
      return <GraduationCap className="h-3 w-3 text-indigo-600" />;
    if (log.includes("🔄"))
      return <RefreshCw className="h-3 w-3 text-cyan-600" />;
    if (log.includes("🗑️")) return <Trash2 className="h-3 w-3 text-red-600" />;
    if (log.includes("🏛️"))
      return <Building className="h-3 w-3 text-gray-600" />;
    return null;
  };

  // Función para limpiar el texto del log (remover emojis)
  const cleanLogText = (log: string) => {
    return log
      .replace(/(✅|❌|⚠️|🚀|💰|📋|👥|📊|📄|🏆|⚡|🎓|🔄|🗑️|🏛️)/g, "")
      .trim();
  };

  const toggleInstructor = (instructorName: string) => {
    const newExpanded = new Set(expandedInstructors);
    if (newExpanded.has(instructorName)) {
      newExpanded.delete(instructorName);
    } else {
      newExpanded.add(instructorName);
    }
    setExpandedInstructors(newExpanded);
  };

  const toggleClass = (classKey: string) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(classKey)) {
      newExpanded.delete(classKey);
    } else {
      newExpanded.add(classKey);
    }
    setExpandedClasses(newExpanded);
  };

  // Show loading state while data is being fetched
  if (periodsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Calcular Pagos
            </h1>
            <p className="text-muted-foreground mt-1">Cargando datos...</p>
          </div>
        </div>
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
          <h1 className="text-3xl font-bold text-foreground">Calcular Pagos</h1>
          <p className="text-muted-foreground mt-1">
            Calcula los pagos de instructores para períodos específicos
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Volver a Pagos
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Configuration Panel - Ultra Compact */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="period-select" className="text-sm font-medium">
                  Período
                </Label>
                <Select
                  value={selectedPeriodId}
                  onValueChange={setSelectedPeriodId}
                >
                  <SelectTrigger id="period-select" className="h-9 mt-1">
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

              <div className="flex items-end">
                <Button
                  onClick={handleCalculateAll}
                  disabled={isCalculating || !selectedPeriodId}
                  className="h-9 px-6"
                  size="sm"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Calculando...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-3 w-3 mr-2" />
                      Calcular Todos los Pagos
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Logs del Cálculo
            </CardTitle>
            <CardDescription>
              Seguimiento detallado del proceso de cálculo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calculationLogs.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {(() => {
                  const { globalLogs, instructorLogs } =
                    processLogsByInstructor(calculationLogs);
                  return (
                    <>
                      {/* Logs Globales */}
                      {globalLogs.length > 0 && (
                        <div className="bg-muted/30 rounded-lg p-3 border border-border">
                          <div className="flex items-center gap-2 mb-3">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <h4 className="font-medium text-sm">
                              Proceso General
                            </h4>
                          </div>
                          <div className="space-y-1">
                            {globalLogs.map((log, index) => (
                              <div
                                key={`global-log-${index}-${log.slice(0, 20)}`}
                                className="text-xs flex items-start gap-2 p-1.5 bg-background rounded border border-border"
                              >
                                {getLogIcon(log)}
                                <span className="flex-1">
                                  {cleanLogText(log)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Logs por Instructor */}
                      {Object.entries(instructorLogs).map(
                        ([instructorName, instructorData]) => (
                          <div
                            key={instructorName}
                            className="border border-border rounded-lg overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() => toggleInstructor(instructorName)}
                              className="w-full flex items-center justify-between p-3 bg-muted/20 hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-sm">
                                  {instructorData.name}
                                </span>
                                <Badge variant="secondary" className="text-xs">
                                  {Object.keys(instructorData.classes).length +
                                    instructorData.otherLogs.length}{" "}
                                  logs
                                </Badge>
                              </div>
                              {expandedInstructors.has(instructorName) ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>

                            {expandedInstructors.has(instructorName) && (
                              <div className="p-3 bg-muted/10 border-t border-border">
                                <div className="space-y-3">
                                  {/* Logs de Clases */}
                                  {Object.entries(instructorData.classes).map(
                                    ([classId, classData]) => (
                                      <div
                                        key={classId}
                                        className="border border-border rounded overflow-hidden"
                                      >
                                        <button
                                          type="button"
                                          onClick={() =>
                                            toggleClass(
                                              `${instructorName}-${classId}`
                                            )
                                          }
                                          className="w-full flex items-center justify-between p-2 bg-muted/10 hover:bg-muted/20 transition-colors"
                                        >
                                          <div className="flex items-center gap-2">
                                            <BookOpen className="h-3 w-3 text-green-600" />
                                            <span className="text-xs font-medium">
                                              {classData.className}
                                            </span>
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {classData.logs.length} logs
                                            </Badge>
                                          </div>
                                          {expandedClasses.has(
                                            `${instructorName}-${classId}`
                                          ) ? (
                                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                          ) : (
                                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                          )}
                                        </button>

                                        {expandedClasses.has(
                                          `${instructorName}-${classId}`
                                        ) && (
                                          <div className="p-2 bg-background border-t border-border">
                                            <div className="space-y-1">
                                              {classData.logs.map((log) => (
                                                <div
                                                  key={log}
                                                  className="text-xs flex items-start gap-2 p-1.5 bg-muted/20 rounded"
                                                >
                                                  {getLogIcon(log)}
                                                  <span className="flex-1">
                                                    {cleanLogText(log)}
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  )}

                                  {/* Otros Logs del Instructor */}
                                  {instructorData.otherLogs.length > 0 && (
                                    <div className="border border-border rounded overflow-hidden">
                                      <div className="p-2 bg-muted/5 border-b border-border">
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-3 w-3 text-blue-600" />
                                          <span className="text-xs font-medium">
                                            Otros Logs
                                          </span>
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {instructorData.otherLogs.length}{" "}
                                            logs
                                          </Badge>
                                        </div>
                                      </div>
                                      <div className="p-2 bg-background">
                                        <div className="space-y-1">
                                          {instructorData.otherLogs.map(
                                            (log) => (
                                              <div
                                                key={log}
                                                className="text-xs flex items-start gap-2 p-1.5 bg-muted/20 rounded"
                                              >
                                                {getLogIcon(log)}
                                                <span className="flex-1">
                                                  {cleanLogText(log)}
                                                </span>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Los logs del cálculo aparecerán aquí</p>
                <p className="text-sm">
                  Selecciona un período y ejecuta un cálculo
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
