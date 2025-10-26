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
import type {
  ClassFromAPI,
  VersusClassData,
  VersusDialogProps,
} from "@/types/classes";

type VersusFormData = z.infer<typeof versusFormSchema>;
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const versusFormSchema = z.object({
  // Campos compartidos
  id: z.string().optional(), // ID opcional para edición
  country: z.string().min(1, "País es requerido"),
  city: z.string().min(1, "Ciudad es requerida"),
  studio: z.string().min(1, "Estudio es requerido"),
  room: z.string().min(1, "Sala es requerida"),
  spots: z.number().min(1, "Debe tener al menos 1 cupo"),
  totalReservations: z.number().min(0, "No puede ser negativo"),
  waitingLists: z.number().min(0, "No puede ser negativo"),
  complimentary: z.number().min(0, "No puede ser negativo"),
  paidReservations: z.number().min(0, "No puede ser negativo"),
  specialText: z.string().optional(),
  date: z.string().min(1, "Fecha es requerida"),
  disciplineId: z.string().min(1, "Disciplina es requerida"),
  periodId: z.string().min(1, "Período es requerido"),
  week: z.number().min(1, "Semana debe ser mayor a 0"),
  versusNumber: z.number().min(1, "Número de versus es requerido"),
  // Instructores para las clases versus
  instructors: z
    .array(z.string().min(1, "Instructor es requerido"))
    .min(2, "Debe haber al menos 2 instructores"),
});

export function VersusDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  classData,
  versusClasses = [],
}: VersusDialogProps) {
  const isEdit = !!classData;
  const [instructors, setInstructors] = useState<string[]>(
    isEdit && classData ? [classData.instructorId] : ["", ""]
  );

  // Obtener datos para los selectores
  const { data: disciplinesData } = trpc.disciplines.getAll.useQuery();
  const { data: instructorsData } = trpc.instructor.getAll.useQuery();
  const { data: periodsData } = trpc.periods.getAll.useQuery();

  const disciplines = disciplinesData?.disciplines || [];
  const instructorsList = instructorsData?.instructors || [];
  const periods = periodsData?.periods || [];

  const form = useForm<VersusFormData>({
    resolver: zodResolver(versusFormSchema),
    defaultValues:
      isEdit && classData
        ? {
            id: classData.id,
            country: classData.country,
            city: classData.city,
            studio: classData.studio,
            room: classData.room,
            spots: classData.spots,
            totalReservations: classData.totalReservations,
            waitingLists: classData.waitingLists,
            complimentary: classData.complimentary,
            paidReservations: classData.paidReservations,
            specialText: classData.specialText || "",
            date: new Date(classData.date).toISOString().split("T")[0],
            disciplineId: classData.disciplineId,
            periodId: classData.periodId,
            week: classData.week,
            versusNumber: classData.versusNumber || 1,
            instructors: [classData.instructorId], // Para edición, solo el instructor actual
          }
        : {
            id: "",
            country: "Perú",
            city: "Lima",
            studio: "",
            room: "",
            spots: 0,
            totalReservations: 0,
            waitingLists: 0,
            complimentary: 0,
            paidReservations: 0,
            specialText: "",
            date: "",
            disciplineId: "",
            periodId: "",
            week: 1,
            versusNumber: 1,
            instructors: ["", ""],
          },
  });

  // Resetear el formulario cuando cambie la clase
  useEffect(() => {
    if (classData) {
      // Si hay múltiples clases versus, usar la primera como referencia para los datos compartidos
      const referenceClass =
        versusClasses.length > 0 ? versusClasses[0] : classData;

      if (referenceClass) {
        form.reset({
          id: referenceClass.id,
          country: referenceClass.country,
          city: referenceClass.city,
          studio: referenceClass.studio,
          room: referenceClass.room,
          spots: referenceClass.spots,
          totalReservations: referenceClass.totalReservations,
          waitingLists: referenceClass.waitingLists,
          complimentary: referenceClass.complimentary,
          paidReservations: referenceClass.paidReservations,
          specialText: referenceClass.specialText || "",
          date: new Date(referenceClass.date).toISOString().split("T")[0],
          disciplineId: referenceClass.disciplineId,
          periodId: referenceClass.periodId,
          week: referenceClass.week,
          versusNumber: referenceClass.versusNumber || 1,
          instructors:
            versusClasses.length > 0
              ? versusClasses.map((c) => c.instructorId)
              : [classData.instructorId],
        });

        // Si hay múltiples clases versus, cargar todos los instructores
        if (versusClasses.length > 0) {
          setInstructors(versusClasses.map((c) => c.instructorId));
        } else {
          setInstructors([classData.instructorId]);
        }
      }
    } else {
      form.reset({
        id: "",
        country: "Perú",
        city: "Lima",
        studio: "",
        room: "",
        spots: 0,
        totalReservations: 0,
        waitingLists: 0,
        complimentary: 0,
        paidReservations: 0,
        specialText: "",
        date: "",
        disciplineId: "",
        periodId: "",
        week: 1,
        versusNumber: 1,
        instructors: ["", ""],
      });
      setInstructors(["", ""]);
    }
  }, [classData, versusClasses, form]);

  const addInstructor = () => {
    setInstructors([...instructors, ""]);
  };

  const removeInstructor = (index: number) => {
    if (instructors.length > 2 || (isEdit && instructors.length > 1)) {
      const newInstructors = instructors.filter((_, i) => i !== index);
      setInstructors(newInstructors);
      form.setValue("instructors", newInstructors);

      // Actualizar número de versus automáticamente
      const validCount = newInstructors.filter((id) => id !== "").length;
      form.setValue("versusNumber", validCount);
    }
  };

  const updateInstructor = (index: number, value: string) => {
    const newInstructors = [...instructors];
    newInstructors[index] = value;
    setInstructors(newInstructors);
    form.setValue("instructors", newInstructors);

    // Actualizar número de versus automáticamente
    const validCount = newInstructors.filter((id) => id !== "").length;
    form.setValue("versusNumber", validCount);
  };

  const handleSubmit = (data: VersusFormData) => {
    console.log("=== Versus Dialog Submit ===");

    // Validar instructores
    const validInstructors = instructors.filter((id) => id !== "");
    if (validInstructors.length < 2) {
      console.error("Debe haber al menos 2 instructores");
      return;
    }

    if (isEdit && versusClasses.length > 0) {
      // ===== MODO EDICIÓN: Sincronizar todo el grupo versus =====
      console.log("EDITANDO: Sincronizando grupo versus");

      const currentInstructorIds = versusClasses.map((c) => c.instructorId);
      const newInstructorIds = validInstructors;

      // Identificar cambios
      const toKeep = newInstructorIds.filter((id) =>
        currentInstructorIds.includes(id)
      );
      const toAdd = newInstructorIds.filter(
        (id) => !currentInstructorIds.includes(id)
      );
      const toRemove = currentInstructorIds.filter(
        (id) => !newInstructorIds.includes(id)
      );

      console.log(
        `Mantener: ${toKeep.length}, Agregar: ${toAdd.length}, Eliminar: ${toRemove.length}`
      );

      // Preparar cambios
      const classesToUpdate: VersusClassData[] = [];
      const classesToCreate: VersusClassData[] = [];
      const classesToDelete: string[] = [];

      // 1. Actualizar clases existentes que se mantienen
      versusClasses.forEach((existingClass) => {
        if (toKeep.includes(existingClass.instructorId)) {
          classesToUpdate.push({
            id: existingClass.id,
            country: data.country,
            city: data.city,
            studio: data.studio,
            room: data.room,
            spots: data.spots,
            totalReservations: data.totalReservations,
            waitingLists: data.waitingLists,
            complimentary: data.complimentary,
            paidReservations: data.paidReservations,
            specialText: data.specialText,
            date: data.date,
            disciplineId: data.disciplineId,
            instructorId: existingClass.instructorId, // Mantener instructor original
            periodId: data.periodId,
            week: data.week,
            isVersus: true,
            versusNumber: data.versusNumber,
          });
        }
      });

      // 2. Crear clases para nuevos instructores
      toAdd.forEach((instructorId) => {
        classesToCreate.push({
          country: data.country,
          city: data.city,
          studio: data.studio,
          room: data.room,
          spots: data.spots,
          totalReservations: data.totalReservations,
          waitingLists: data.waitingLists,
          complimentary: data.complimentary,
          paidReservations: data.paidReservations,
          specialText: data.specialText,
          date: data.date,
          disciplineId: data.disciplineId,
          instructorId: instructorId,
          periodId: data.periodId,
          week: data.week,
          isVersus: true,
          versusNumber: data.versusNumber,
        });
      });

      // 3. Identificar clases a eliminar
      toRemove.forEach((instructorId) => {
        const classToDelete = versusClasses.find(
          (c) => c.instructorId === instructorId
        );
        if (classToDelete) {
          classesToDelete.push(classToDelete.id);
        }
      });

      // Enviar todos los cambios en una sola operación
      const allChanges = [...classesToUpdate, ...classesToCreate];
      onSubmit(allChanges, classesToDelete);
    } else {
      // ===== MODO CREACIÓN: Crear todas las clases versus =====
      console.log("CREANDO: Nuevo grupo versus");

      const versusClasses: VersusClassData[] = validInstructors.map(
        (instructorId) => ({
          country: data.country,
          city: data.city,
          studio: data.studio,
          room: data.room,
          spots: data.spots,
          totalReservations: data.totalReservations,
          waitingLists: data.waitingLists,
          complimentary: data.complimentary,
          paidReservations: data.paidReservations,
          specialText: data.specialText,
          date: data.date,
          disciplineId: data.disciplineId,
          instructorId: instructorId,
          periodId: data.periodId,
          week: data.week,
          isVersus: true,
          versusNumber: data.versusNumber,
        })
      );

      onSubmit(versusClasses);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? versusClasses.length > 1
                ? `Editar ${versusClasses.length} Clases Versus`
                : "Editar Clase Versus"
              : "Nueva Clase Versus"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? versusClasses.length > 1
                ? `Modifica los datos de ${versusClasses.length} clases versus relacionadas. Los cambios se aplicarán a todas las clases del grupo.`
                : "Modifica los datos de la clase versus."
              : "Crea múltiples clases versus con diferentes instructores para el mismo horario y ubicación."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* ID Field */}
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID</FormLabel>
                  <FormControl>
                    <Input placeholder="ID de la clase (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Información compartida */}
            <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground">
                Información Compartida
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Perú" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Lima" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="studio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estudio *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Studio 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="room"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sala *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Sala A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="disciplineId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Disciplina *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar disciplina" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {disciplines?.map((discipline) => (
                            <SelectItem
                              key={discipline.id}
                              value={discipline.id}
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
                      <FormLabel>Período *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
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
                              <SelectItem key={period.id} value={period.id}>
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

                <FormField
                  control={form.control}
                  name="week"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semana *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(Number.parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                  name="versusNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Versus *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          value={field.value || ""}
                          disabled
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="spots"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cupos *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number.parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texto Especial</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Texto especial opcional"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="totalReservations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reservas Totales</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number.parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paidReservations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reservas Pagadas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number.parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="waitingLists"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lista de Espera</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number.parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="complimentary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cortesías</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number.parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Instructores para las clases versus */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Instructores Versus
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addInstructor}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Instructor
                </Button>
              </div>

              {instructors.map((instructorId, index) => (
                <div
                  key={instructorId || `instructor-${index}`}
                  className="flex items-center gap-2"
                >
                  <div className="flex-1">
                    <Select
                      value={instructorId}
                      onValueChange={(value) => updateInstructor(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Instructor ${index + 1}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {instructorsList?.map((instructor) => (
                          <SelectItem key={instructor.id} value={instructor.id}>
                            {instructor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {(instructors.length > 2 ||
                    (isEdit && instructors.length > 1)) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeInstructor(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? isEdit
                    ? "Actualizando..."
                    : "Creando..."
                  : isEdit
                    ? "Actualizar Clase Versus"
                    : "Crear Clases Versus"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
