"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { InfiniteScrollList } from "@/components/ui/infinite-scroll-list";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  CoverFromAPI,
  CreateCoverData,
  UpdateCoverData,
} from "@/types/covers";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Unified schema that works for both create and update
const coverFormSchema = z.object({
  id: z.string().optional(),
  originalInstructorId: z.string().min(1, "Instructor original es requerido"),
  replacementInstructorId: z
    .string()
    .min(1, "Instructor reemplazo es requerido"),
  disciplineId: z.string().min(1, "Disciplina es requerida"),
  periodId: z.string().min(1, "Período es requerido"),
  date: z.string().min(1, "Fecha es requerida"),
  time: z.string().min(1, "Hora es requerida"),
  classId: z.string().nullable().optional(),
  justification: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  bonusPayment: z.boolean().optional(),
  fullHousePayment: z.boolean().optional(),
  comments: z.string().nullable().optional(),
  nameChange: z.string().nullable().optional(),
});

type CoverFormData = z.infer<typeof coverFormSchema>;

interface CoverDialogProps {
  coverData?: CoverFromAPI | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCoverData | UpdateCoverData) => void;
  isLoading: boolean;
  isInstructor?: boolean;
  instructorId?: string;
  isAdmin?: boolean;
}

export function CoverDialog({
  coverData,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  isInstructor = false,
  instructorId,
  isAdmin = false,
}: CoverDialogProps) {
  const isEdit = !!coverData;

  // Get data for selectors
  const { data: disciplinesData } = trpc.disciplines.getAll.useQuery();
  const { data: instructorsData } = trpc.instructor.getAll.useQuery();
  const { data: periodsData } = trpc.periods.getAll.useQuery();

  const disciplines = disciplinesData?.disciplines || [];
  const instructors = instructorsData?.instructors || [];
  const periods = periodsData?.periods || [];

  // State for class search
  const [selectedPeriodForClass, setSelectedPeriodForClass] =
    useState<string>("");
  const [openClassSearch, setOpenClassSearch] = useState(false);
  const [classSearchTerm, setClassSearchTerm] = useState<string>("");
  const [classesPage, setClassesPage] = useState(1);
  const classesLimit = 20;
  const [allLoadedClasses, setAllLoadedClasses] = useState<any[]>([]);

  // State for instructor correction dialog
  const [showInstructorCorrectionDialog, setShowInstructorCorrectionDialog] =
    useState(false);
  const [instructorCorrectionInfo, setInstructorCorrectionInfo] = useState<{
    oldInstructor: string;
    newInstructor: string;
    classId: string;
  } | null>(null);

  // Get classes for selected period with pagination
  const { data: classesData, isLoading: isLoadingClasses } =
    trpc.classes.getWithFilters.useQuery(
      {
        periodId: selectedPeriodForClass,
        search: classSearchTerm || undefined,
        limit: classesLimit,
        offset: (classesPage - 1) * classesLimit,
      },
      {
        enabled: !!selectedPeriodForClass && selectedPeriodForClass !== "",
        placeholderData: (previousData) => previousData,
      }
    );

  // Update loaded classes when data changes - append new classes
  useEffect(() => {
    if (classesData?.classes) {
      if (classesPage === 1) {
        // First page - replace all
        setAllLoadedClasses(classesData.classes);
      } else {
        // Subsequent pages - append only new classes
        setAllLoadedClasses((prev) => {
          // Avoid duplicates
          const existingIds = new Set(prev.map((c) => c.id));
          const newClasses = classesData.classes.filter(
            (c) => !existingIds.has(c.id)
          );
          return newClasses.length > 0 ? [...prev, ...newClasses] : prev;
        });
      }
    }
  }, [classesData?.classes, classesPage]);

  // Reset classes when period or search changes
  useEffect(() => {
    setAllLoadedClasses([]);
    setClassesPage(1);
  }, [selectedPeriodForClass, classSearchTerm]);

  // Load more classes
  const handleLoadMoreClasses = () => {
    if (classesData?.hasMore && !isLoadingClasses) {
      setClassesPage((prev) => prev + 1);
    }
  };

  const classes = allLoadedClasses;
  const hasMoreClasses = classesData?.hasMore || false;

  // Create form with unified schema
  const form = useForm<CoverFormData>({
    resolver: zodResolver(coverFormSchema),
    defaultValues: {
      id: isEdit ? coverData?.id : undefined,
      originalInstructorId: isEdit ? coverData?.originalInstructorId || "" : "",
      replacementInstructorId:
        isEdit && coverData?.replacementInstructorId
          ? coverData.replacementInstructorId
          : isInstructor && instructorId
            ? instructorId
            : "",
      disciplineId: isEdit ? coverData?.disciplineId || "" : "",
      periodId: isEdit ? coverData?.periodId || "" : "",
      date:
        isEdit && coverData?.date
          ? new Date(coverData.date).toISOString().split("T")[0]
          : "",
      time: isEdit ? coverData?.time || "" : "",
      classId: isEdit ? coverData?.classId || null : null,
      justification: isEdit ? coverData?.justification || "PENDING" : undefined,
      bonusPayment: isEdit ? coverData?.bonusPayment || false : undefined,
      fullHousePayment: isEdit
        ? coverData?.fullHousePayment || false
        : undefined,
      comments: isEdit ? coverData?.comments || null : null,
      nameChange: isEdit ? coverData?.nameChange || null : null,
    },
  });

  // Watch periodId to update class search
  const watchedPeriodId = form.watch("periodId");
  const linkedClassId = form.watch("classId");

  // Get linked class by ID if it exists (when editing a cover with a linked class)
  const { data: linkedClassData } = trpc.classes.getById.useQuery(
    { id: linkedClassId! },
    { enabled: !!linkedClassId && isEdit }
  );

  useEffect(() => {
    if (watchedPeriodId) {
      setSelectedPeriodForClass(watchedPeriodId);
    }
  }, [watchedPeriodId]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setSelectedPeriodForClass("");
      setOpenClassSearch(false);
    } else if (isEdit && coverData) {
      form.reset({
        id: coverData.id,
        originalInstructorId: coverData.originalInstructorId,
        replacementInstructorId: coverData.replacementInstructorId,
        disciplineId: coverData.disciplineId,
        periodId: coverData.periodId,
        date: new Date(coverData.date).toISOString().split("T")[0],
        time: coverData.time,
        classId: coverData.classId || null,
        justification: coverData.justification,
        bonusPayment: coverData.bonusPayment,
        fullHousePayment: coverData.fullHousePayment,
        comments: coverData.comments || null,
        nameChange: coverData.nameChange || null,
      });
      setSelectedPeriodForClass(coverData.periodId);
    } else if (!isEdit) {
      // Reset to create defaults
      form.reset({
        id: undefined,
        originalInstructorId: "",
        replacementInstructorId:
          isInstructor && instructorId ? instructorId : "",
        disciplineId: "",
        periodId: "",
        date: "",
        time: "",
        classId: null,
        justification: undefined,
        bonusPayment: undefined,
        fullHousePayment: undefined,
        comments: null,
        nameChange: null,
      });
      setSelectedPeriodForClass("");
    }
  }, [isOpen, isEdit, coverData, form, isInstructor, instructorId]);

  // Store pending submit data when instructor needs to be corrected
  const [pendingSubmitData, setPendingSubmitData] =
    useState<CoverFormData | null>(null);

  const handleSubmit = async (data: CoverFormData) => {
    let finalReplacementInstructorId = data.replacementInstructorId;
    let instructorWasChanged = false;
    let oldInstructorName = "";
    let newInstructorName = "";
    let classIdForInfo = "";

    // Solo hacer corrección automática si el cover está aprobado
    const isCoverApproved =
      data.justification === "APPROVED" ||
      (isEdit && coverData?.justification === "APPROVED");

    // Si hay una clase enlazada Y el cover está aprobado, verificar que el instructor reemplazo sea el instructor de esa clase
    if (data.classId && isCoverApproved) {
      // Buscar la clase en las clases cargadas primero
      let classItem = classes.find((c) => c.id === data.classId);

      // Si no está en las clases cargadas, usar linkedClassData
      if (!classItem && linkedClassData) {
        classItem = linkedClassData as any;
      }

      // Si tampoco está ahí, usar coverData.class si está editando
      if (!classItem && coverData?.class) {
        classItem = coverData.class as any;
      }

      if (classItem) {
        const classInstructorId =
          classItem.instructorId || classItem.instructor?.id;

        if (
          classInstructorId &&
          classInstructorId !== data.replacementInstructorId
        ) {
          // El instructor reemplazo no coincide con el instructor de la clase
          finalReplacementInstructorId = classInstructorId;
          instructorWasChanged = true;

          // Obtener nombres de instructores para el diálogo
          const oldInstructor = instructors.find(
            (i) => i.id === data.replacementInstructorId
          );
          const newInstructor =
            instructors.find((i) => i.id === classInstructorId) ||
            classItem.instructor;

          oldInstructorName =
            oldInstructor?.name || data.replacementInstructorId;
          newInstructorName = newInstructor?.name || classInstructorId;
          classIdForInfo = data.classId;
        }
      }
    }

    // Si se cambió el instructor, mostrar el diálogo informativo primero
    if (instructorWasChanged) {
      setInstructorCorrectionInfo({
        oldInstructor: oldInstructorName,
        newInstructor: newInstructorName,
        classId: classIdForInfo,
      });
      // Actualizar el formulario con el instructor correcto
      form.setValue("replacementInstructorId", finalReplacementInstructorId);
      // Guardar los datos para enviar después de que el usuario vea el diálogo
      setPendingSubmitData({
        ...data,
        replacementInstructorId: finalReplacementInstructorId,
      });
      setShowInstructorCorrectionDialog(true);
      return; // No continuar con el submit todavía
    }

    // Si no hubo cambio, proceder normalmente
    proceedWithSubmit(data, finalReplacementInstructorId);
  };

  const proceedWithSubmit = (
    data: CoverFormData,
    replacementInstructorId: string
  ) => {
    // Transform to the expected format
    if (isEdit) {
      const updateData: UpdateCoverData = {
        id: data.id!,
        originalInstructorId: data.originalInstructorId,
        replacementInstructorId: replacementInstructorId,
        disciplineId: data.disciplineId,
        periodId: data.periodId,
        date: data.date,
        time: data.time,
        classId: data.classId ?? null,
        justification: data.justification,
        bonusPayment: data.bonusPayment,
        fullHousePayment: data.fullHousePayment,
        comments: data.comments ?? null,
        nameChange: data.nameChange ?? null,
      };
      onSubmit(updateData);
    } else {
      const createData: CreateCoverData = {
        originalInstructorId: data.originalInstructorId,
        replacementInstructorId: replacementInstructorId,
        disciplineId: data.disciplineId,
        periodId: data.periodId,
        date: data.date,
        time: data.time,
        classId: data.classId ?? null,
        comments: data.comments ?? null,
        nameChange: data.nameChange ?? null,
      };
      onSubmit(createData);
    }
  };

  const handleInstructorCorrectionDialogClose = () => {
    setShowInstructorCorrectionDialog(false);
    // Proceder con el submit después de que el usuario vea el diálogo
    if (pendingSubmitData) {
      proceedWithSubmit(
        pendingSubmitData,
        pendingSubmitData.replacementInstructorId
      );
      setPendingSubmitData(null);
    }
  };

  // Get class display text
  const getClassDisplayText = (classId: string | null | undefined) => {
    if (!classId) return "Seleccionar clase...";
    const classItem = classes.find((c) => c.id === classId);
    if (!classItem) return "Clase no encontrada";
    const instructor = instructors.find((i) => i.id === classItem.instructorId);
    const discipline = disciplines.find((d) => d.id === classItem.disciplineId);
    return `ID: ${classItem.id} - ${instructor?.name || "Sin instructor"} - ${
      discipline?.name || "Sin disciplina"
    }`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Cover" : "Crear Nuevo Cover"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? isAdmin
                ? "Modifica todos los campos del cover"
                : "Modifica la información básica de tu cover"
              : "Registra un cover que has realizado"}
          </DialogDescription>
        </DialogHeader>

        {isInstructor && isEdit && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Nota:</strong> Estás editando tu propio cover como
              instructor de reemplazo. Algunos campos están restringidos por
              seguridad.
            </p>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Instructor fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="originalInstructorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructor Original *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={false}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona instructor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {instructors.map((instructor) => (
                          <SelectItem key={instructor.id} value={instructor.id}>
                            {instructor.name}
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
                name="replacementInstructorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructor Reemplazo *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isInstructor}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona instructor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {instructors.map((instructor) => (
                          <SelectItem key={instructor.id} value={instructor.id}>
                            {instructor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isInstructor && !isEdit && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Se ha seleccionado automáticamente tu usuario como
                        instructor de reemplazo
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Discipline and Period */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="disciplineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disciplina *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona disciplina" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {disciplines.map((discipline) => (
                          <SelectItem key={discipline.id} value={discipline.id}>
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
                    <FormLabel>Período *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona período" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {periods.map(
                          (period: {
                            id: string;
                            number: number;
                            year: number;
                          }) => (
                            <SelectItem key={period.id} value={period.id}>
                              P{period.number}-{period.year}
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

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora *</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Class Link */}
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clase a Enlazar (opcional)</FormLabel>
                  <p className="text-sm text-muted-foreground mb-2">
                    Selecciona una clase existente para enlazar este cover.
                  </p>
                  {form.watch("periodId") ? (
                    <Popover
                      open={openClassSearch}
                      onOpenChange={setOpenClassSearch}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          {/* biome-ignore lint/a11y/useSemanticElements: Radix UI Popover requires Button with combobox role for accessibility */}
                          <Button
                            variant="outline"
                            // biome-ignore lint/a11y/useSemanticElements: Required by Radix UI Popover pattern
                            role="combobox"
                            className="w-full justify-between"
                            disabled={isLoadingClasses}
                          >
                            {getClassDisplayText(field.value)}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[500px] p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Buscar por ID de clase..."
                            value={classSearchTerm}
                            onValueChange={(value) => {
                              setClassSearchTerm(value);
                            }}
                          />
                          <CommandList
                            className="max-h-[300px] overflow-y-auto"
                            onWheel={(e) => {
                              e.preventDefault();
                              const target = e.currentTarget;
                              target.scrollTop += e.deltaY;
                            }}
                          >
                            <CommandEmpty>
                              {isLoadingClasses
                                ? "Cargando clases..."
                                : "No se encontraron clases"}
                            </CommandEmpty>
                            <CommandGroup>
                              {classes.map((classItem) => {
                                const instructor = instructors.find(
                                  (i) => i.id === classItem.instructorId
                                );
                                const discipline = disciplines.find(
                                  (d) => d.id === classItem.disciplineId
                                );
                                return (
                                  <CommandItem
                                    key={classItem.id}
                                    value={`${classItem.id}`}
                                    onSelect={() => {
                                      field.onChange(classItem.id);
                                      setOpenClassSearch(false);
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        field.value === classItem.id
                                          ? "opacity-100"
                                          : "opacity-0"
                                      }`}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        ID: {classItem.id}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {instructor?.name || "Sin instructor"} •{" "}
                                        {discipline?.name || "Sin disciplina"}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {format(
                                          new Date(classItem.date),
                                          "dd/MM/yyyy HH:mm",
                                          { locale: es }
                                        )}
                                      </span>
                                    </div>
                                  </CommandItem>
                                );
                              })}
                              {hasMoreClasses && (
                                <InfiniteScrollList
                                  onLoadMore={handleLoadMoreClasses}
                                  hasMore={hasMoreClasses}
                                  isLoading={isLoadingClasses}
                                  className=""
                                >
                                  <div />
                                </InfiniteScrollList>
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <div className="text-sm text-muted-foreground p-3 border border-border rounded-md bg-muted/50">
                      Selecciona un período para buscar clases disponibles
                    </div>
                  )}
                  {field.value &&
                    (() => {
                      // Try to find class in loaded classes first
                      let classItem = classes.find((c) => c.id === field.value);

                      // If not found and we have linked class data from API, use it
                      if (!classItem && linkedClassData) {
                        classItem = linkedClassData as any;
                      }

                      // Also check if coverData has class information (when editing)
                      if (!classItem && coverData?.class) {
                        classItem = coverData.class as any;
                      }

                      // Get instructor and discipline information
                      const instructor = classItem
                        ? classItem.instructor?.name ||
                          instructors.find(
                            (i) => i.id === classItem.instructorId
                          )?.name ||
                          null
                        : null;
                      const discipline = classItem
                        ? classItem.discipline?.name ||
                          disciplines.find(
                            (d) => d.id === classItem.disciplineId
                          )?.name ||
                          null
                        : null;
                      const classExists = !!classItem;

                      return (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center justify-between p-3 border border-border rounded-md bg-muted/30">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  Clase enlazada:
                                </span>
                                <Badge
                                  variant={
                                    classExists ? "default" : "secondary"
                                  }
                                >
                                  ID: {field.value}
                                </Badge>
                              </div>
                              {classExists ? (
                                <div className="text-sm text-muted-foreground space-y-0.5 mt-1">
                                  {instructor && (
                                    <div>
                                      <span className="font-medium">
                                        Instructor:
                                      </span>{" "}
                                      {instructor}
                                    </div>
                                  )}
                                  {discipline && (
                                    <div>
                                      <span className="font-medium">
                                        Disciplina:
                                      </span>{" "}
                                      {discipline}
                                    </div>
                                  )}
                                  {classItem.date && (
                                    <div>
                                      <span className="font-medium">
                                        Fecha:
                                      </span>{" "}
                                      {format(
                                        new Date(classItem.date),
                                        "dd/MM/yyyy HH:mm",
                                        { locale: es }
                                      )}
                                    </div>
                                  )}
                                  {classItem.studio && (
                                    <div>
                                      <span className="font-medium">
                                        Estudio:
                                      </span>{" "}
                                      {classItem.studio}
                                    </div>
                                  )}
                                  {classItem.room && (
                                    <div>
                                      <span className="font-medium">Sala:</span>{" "}
                                      {classItem.room}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground italic mt-1">
                                  (La clase no está disponible en el período
                                  seleccionado)
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange(null)}
                            className="w-full"
                          >
                            Desenlazar clase
                          </Button>
                        </div>
                      );
                    })()}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Admin-only fields */}
            {isAdmin && isEdit && (
              <>
                <FormField
                  control={form.control}
                  name="justification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || "PENDING"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PENDING">Pendiente</SelectItem>
                          <SelectItem value="APPROVED">Aprobado</SelectItem>
                          <SelectItem value="REJECTED">Rechazado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bonusPayment"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Pago S/80</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fullHousePayment"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                            disabled={!form.watch("classId")}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Pago Full House
                            {!form.watch("classId") && (
                              <span className="text-xs text-muted-foreground ml-1">
                                (requiere clase enlazada)
                              </span>
                            )}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* Comments and Name Change */}
            <FormField
              control={form.control}
              name="nameChange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cambio de Nombre</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Cambio de nombre..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentarios</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        isAdmin
                          ? "Comentarios administrativos..."
                          : "Comentarios adicionales..."
                      }
                      {...field}
                      value={field.value || ""}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? isEdit
                    ? "Actualizando..."
                    : "Creando..."
                  : isEdit
                    ? "Actualizar"
                    : "Crear"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

      {/* Diálogo informativo sobre corrección de instructor */}
      <AlertDialog
        open={showInstructorCorrectionDialog}
        onOpenChange={(open) => {
          if (!open) {
            handleInstructorCorrectionDialogClose();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Instructor Reemplazo Actualizado
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se ha actualizado automáticamente el instructor de reemplazo para
              que coincida con el instructor de la clase enlazada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {instructorCorrectionInfo && (
            <div className="py-4 space-y-2">
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Clase enlazada:</span>{" "}
                  <Badge variant="secondary">
                    ID: {instructorCorrectionInfo.classId}
                  </Badge>
                </p>
                <p>
                  <span className="font-medium">Instructor anterior:</span>{" "}
                  <span className="text-muted-foreground">
                    {instructorCorrectionInfo.oldInstructor}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Instructor actualizado:</span>{" "}
                  <span className="text-primary font-medium">
                    {instructorCorrectionInfo.newInstructor}
                  </span>
                </p>
              </div>
              <div className="mt-4 p-3 bg-muted/50 border border-border rounded-md text-sm text-muted-foreground">
                <p className="font-medium mb-1">
                  ¿Por qué se hizo este cambio?
                </p>
                <p>
                  Cuando un cover está enlazado a una clase, el instructor de
                  reemplazo debe ser el mismo que el instructor asignado a esa
                  clase. Esto asegura la consistencia de los datos.
                </p>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleInstructorCorrectionDialogClose}>
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
