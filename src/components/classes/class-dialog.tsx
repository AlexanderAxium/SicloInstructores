"use client";

import { Badge } from "@/components/ui/badge";
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
import type { ClassDialogProps, ClassFromAPI } from "@/types/classes";

import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const classSchema = z.object({
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
  instructorId: z.string().min(1, "Instructor es requerido"),
  periodId: z.string().min(1, "Período es requerido"),
  week: z.number().min(1, "Semana debe ser mayor a 0"),
  isVersus: z.boolean(),
  versusNumber: z.number(),
});

type ClassFormData = z.infer<typeof classSchema>;

export function ClassDialog({
  classData,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: ClassDialogProps) {
  const isEdit = !!classData;

  // Obtener datos para los selectores
  const { data: disciplinesData } = trpc.disciplines.getAll.useQuery();
  const { data: instructorsData } = trpc.instructor.getAll.useQuery();
  const { data: periodsData } = trpc.periods.getAll.useQuery();

  const disciplines = disciplinesData?.disciplines || [];
  const instructors = instructorsData?.instructors || [];
  const periods = periodsData?.periods || [];

  const form = useForm({
    resolver: zodResolver(classSchema),
    defaultValues: isEdit
      ? {
          id: classData?.id || "",
          country: classData?.country || "",
          city: classData?.city || "",
          studio: classData?.studio || "",
          room: classData?.room || "",
          spots: classData?.spots || 0,
          totalReservations: classData?.totalReservations || 0,
          waitingLists: classData?.waitingLists || 0,
          complimentary: classData?.complimentary || 0,
          paidReservations: classData?.paidReservations || 0,
          specialText: classData?.specialText || "",
          date: classData?.date
            ? new Date(classData.date).toISOString().split("T")[0]
            : "",
          disciplineId: classData?.disciplineId || "",
          instructorId: classData?.instructorId || "",
          periodId: classData?.periodId || "",
          week: classData?.week || 1,
          isVersus: classData?.isVersus || false,
          versusNumber: classData?.versusNumber || 0,
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
          instructorId: "",
          periodId: "",
          week: 1,
          isVersus: false,
          versusNumber: 0,
        },
  });

  // Resetear el formulario cuando cambie la clase
  useEffect(() => {
    if (classData) {
      form.reset({
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
        instructorId: classData.instructorId,
        periodId: classData.periodId,
        week: classData.week,
        isVersus: classData.isVersus,
        versusNumber: classData.versusNumber || 0,
      });
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
        instructorId: "",
        periodId: "",
        week: 1,
        isVersus: false,
        versusNumber: 0,
      });
    }
  }, [classData, form]);

  const handleSubmit = (data: ClassFormData) => {
    console.log("=== DEBUG ClassDialog handleSubmit ===");
    console.log("isEdit:", isEdit);
    console.log("data:", data);

    if (isEdit && classData) {
      // Para editar, solo actualizar la clase actual
      const updateData = {
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
        isVersus: data.isVersus,
        versusNumber: data.versusNumber,
      };
      onSubmit(updateData);
    } else {
      // Clase simple
      console.log("=== CREANDO CLASE SIMPLE ===");
      const createData = {
        ...data,
        disciplineId: data.disciplineId || "",
        instructorId: data.instructorId || "",
        periodId: data.periodId || "",
        week: data.week || 1,
      };
      onSubmit(createData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Clase" : "Nueva Clase Simple"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos de la clase."
              : "Agrega una nueva clase simple al sistema."}
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

            {/* Instructor selection */}
            {!isEdit && (
              <div className="space-y-2">
                <FormLabel>Instructor *</FormLabel>
                <FormField
                  control={form.control}
                  name="instructorId"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar instructor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {instructors?.map((instructor) => (
                            <SelectItem
                              key={instructor.id}
                              value={instructor.id}
                            >
                              {instructor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

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

            {!isEdit && (
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
            )}

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

            <FormField
              control={form.control}
              name="specialText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto Especial</FormLabel>
                  <FormControl>
                    <Input placeholder="Texto especial opcional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
