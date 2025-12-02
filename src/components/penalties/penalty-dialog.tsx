"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const PENALTY_TYPE_LABELS: Record<string, string> = {
  CANCELLATION_FIXED: "Cancelación Fija",
  CANCELLATION_OUT_OF_TIME: "Cancelación Fuera de Tiempo",
  CANCEL_LESS_24HRS: "Cancelación Menos de 24h",
  COVER_OF_COVER: "Cover de Cover",
  LATE_EXIT: "Salida Tardía",
  LATE_ARRIVAL: "Llegada Tardía",
  CUSTOM: "Personalizada",
};

const penaltyFormSchema = z.object({
  instructorId: z.string().min(1, "Instructor es requerido"),
  disciplineId: z.string().optional().nullable(),
  periodId: z.string().min(1, "Período es requerido"),
  type: z.enum([
    "CANCELLATION_FIXED",
    "CANCELLATION_OUT_OF_TIME",
    "CANCEL_LESS_24HRS",
    "COVER_OF_COVER",
    "LATE_EXIT",
    "LATE_ARRIVAL",
    "CUSTOM",
  ]),
  points: z.number().min(0, "Los puntos deben ser mayor o igual a 0"),
  description: z.string().optional().nullable(),
  active: z.boolean(),
  appliedAt: z.string().min(1, "Fecha de aplicación es requerida"),
  comments: z.string().optional().nullable(),
});

export type PenaltyFormData = z.infer<typeof penaltyFormSchema>;

type PenaltyType = PenaltyFormData["type"];

interface PenaltyDialogProps {
  penaltyData?: {
    id: string;
    instructorId: string;
    disciplineId?: string | null;
    periodId: string;
    type: string;
    points: number;
    description?: string | null;
    active: boolean;
    appliedAt: string;
    comments?: string | null;
    instructor?: {
      id: string;
      name: string;
      fullName?: string | null;
    };
    discipline?: {
      id: string;
      name: string;
      color?: string | null;
    } | null;
    period?: {
      id: string;
      number: number;
      year: number;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PenaltyFormData) => void;
  isLoading: boolean;
}

export function PenaltyDialog({
  penaltyData,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: PenaltyDialogProps) {
  const isEdit = !!penaltyData;

  // Get data for selectors
  const { data: disciplinesData } = trpc.disciplines.getAll.useQuery();
  const { data: instructorsData } = trpc.instructor.getAll.useQuery();
  const { data: periodsData } = trpc.periods.getAll.useQuery();

  const disciplines = disciplinesData?.disciplines || [];
  const instructors = instructorsData?.instructors || [];
  const periods = periodsData?.periods || [];

  // State for instructor search
  const [openInstructorSearch, setOpenInstructorSearch] = useState(false);
  const [instructorSearchTerm, setInstructorSearchTerm] = useState("");

  // State for discipline search
  const [openDisciplineSearch, setOpenDisciplineSearch] = useState(false);
  const [disciplineSearchTerm, setDisciplineSearchTerm] = useState("");

  // State for date picker
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const form = useForm<PenaltyFormData>({
    resolver: zodResolver(penaltyFormSchema),
    defaultValues: {
      instructorId: penaltyData?.instructorId || "",
      disciplineId: penaltyData?.disciplineId || null,
      periodId: penaltyData?.periodId || "",
      type: (penaltyData?.type as PenaltyType) || "CUSTOM",
      points: penaltyData?.points || 0,
      description: penaltyData?.description || null,
      active: penaltyData?.active ?? true,
      appliedAt: penaltyData?.appliedAt
        ? format(new Date(penaltyData.appliedAt), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      comments: penaltyData?.comments || null,
    },
  });

  // Reset form when dialog opens/closes or data changes
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        instructorId: penaltyData?.instructorId || "",
        disciplineId: penaltyData?.disciplineId || null,
        periodId: penaltyData?.periodId || "",
        type: (penaltyData?.type as PenaltyType) || "CUSTOM",
        points: penaltyData?.points || 0,
        description: penaltyData?.description || null,
        active: penaltyData?.active ?? true,
        appliedAt: penaltyData?.appliedAt
          ? format(new Date(penaltyData.appliedAt), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd"),
        comments: penaltyData?.comments || null,
      });
    }
  }, [isOpen, penaltyData, form]);

  const handleSubmit = (data: PenaltyFormData) => {
    onSubmit(data);
  };

  // Filter instructors based on search
  const filteredInstructors = instructors.filter((instructor) => {
    const searchLower = instructorSearchTerm.toLowerCase();
    return (
      instructor.name.toLowerCase().includes(searchLower) ||
      instructor.fullName?.toLowerCase().includes(searchLower)
    );
  });

  // Filter disciplines based on search
  const filteredDisciplines = disciplines.filter((discipline) => {
    const searchLower = disciplineSearchTerm.toLowerCase();
    return discipline.name.toLowerCase().includes(searchLower);
  });

  const instructorId = useWatch({
    control: form.control,
    name: "instructorId",
  }) as string;
  const disciplineId = useWatch({
    control: form.control,
    name: "disciplineId",
  }) as string | null | undefined;

  const selectedInstructor = instructors.find((i) => i.id === instructorId);
  const selectedDiscipline = disciplines.find((d) => d.id === disciplineId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Penalización" : "Nueva Penalización"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica los datos de la penalización"
              : "Completa los datos para crear una nueva penalización"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Instructor */}
            <FormField
              control={form.control}
              name="instructorId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Instructor *</FormLabel>
                  <Popover
                    open={openInstructorSearch}
                    onOpenChange={setOpenInstructorSearch}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {selectedInstructor
                            ? `${selectedInstructor.name}${
                                selectedInstructor.fullName
                                  ? ` - ${selectedInstructor.fullName}`
                                  : ""
                              }`
                            : "Seleccionar instructor..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Buscar instructor..."
                          value={instructorSearchTerm}
                          onValueChange={setInstructorSearchTerm}
                        />
                        <CommandList>
                          <CommandEmpty>
                            No se encontraron instructores
                          </CommandEmpty>
                          <CommandGroup>
                            {filteredInstructors.map((instructor) => (
                              <CommandItem
                                key={instructor.id}
                                value={instructor.id}
                                onSelect={() => {
                                  form.setValue("instructorId", instructor.id);
                                  setOpenInstructorSearch(false);
                                  setInstructorSearchTerm("");
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    field.value === instructor.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                                {instructor.name}
                                {instructor.fullName && (
                                  <span className="text-muted-foreground ml-2">
                                    - {instructor.fullName}
                                  </span>
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Period */}
            <FormField
              control={form.control}
              name="periodId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Período *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar período" />
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

            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Penalización *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(PENALTY_TYPE_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Points */}
            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Puntos *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Discipline (optional) */}
            <FormField
              control={form.control}
              name="disciplineId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Disciplina (Opcional)</FormLabel>
                  <Popover
                    open={openDisciplineSearch}
                    onOpenChange={setOpenDisciplineSearch}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {selectedDiscipline
                            ? selectedDiscipline.name
                            : "Seleccionar disciplina (opcional)..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Buscar disciplina..."
                          value={disciplineSearchTerm}
                          onValueChange={setDisciplineSearchTerm}
                        />
                        <CommandList>
                          <CommandEmpty>
                            No se encontraron disciplinas
                          </CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="none"
                              onSelect={() => {
                                form.setValue("disciplineId", null);
                                setOpenDisciplineSearch(false);
                                setDisciplineSearchTerm("");
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  !field.value ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              Ninguna
                            </CommandItem>
                            {filteredDisciplines.map((discipline) => (
                              <CommandItem
                                key={discipline.id}
                                value={discipline.id}
                                onSelect={() => {
                                  form.setValue("disciplineId", discipline.id);
                                  setOpenDisciplineSearch(false);
                                  setDisciplineSearchTerm("");
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    field.value === discipline.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                                {discipline.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Applied At */}
            <FormField
              control={form.control}
              name="appliedAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Aplicación *</FormLabel>
                  <Popover
                    open={datePickerOpen}
                    onOpenChange={setDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(new Date(field.value), "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date: Date | undefined) => {
                          if (date) {
                            field.onChange(format(date, "yyyy-MM-dd"));
                            setDatePickerOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active */}
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Penalización activa</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción de la penalización..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Comments */}
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentarios (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comentarios adicionales..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? isEdit
                    ? "Guardando..."
                    : "Creando..."
                  : isEdit
                    ? "Guardar Cambios"
                    : "Crear Penalización"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
