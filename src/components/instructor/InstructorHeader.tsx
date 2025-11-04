"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useInstructorAuth } from "@/contexts/InstructorAuthContext";
import { trpc } from "@/utils/trpc";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Edit,
  Lock,
  Phone,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface InstructorHeaderProps {
  showBackButton?: boolean;
  backHref?: string;
  backLabel?: string;
}

export function InstructorHeader({
  showBackButton = false,
  backHref = "/dashboard/instructores",
  backLabel = "Volver",
}: InstructorHeaderProps) {
  const {
    instructor,
    isAuthenticated,
    refetch: refetchAuth,
  } = useInstructorAuth();
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    fullName: "",
    phone: "",
    DNI: "",
    bank: "",
    bankAccount: "",
    CCI: "",
    contactPerson: "",
    password: "",
  });

  // Mutación para actualizar instructor
  const updateInstructorMutation = trpc.instructor.update.useMutation({
    onSuccess: () => {
      toast.success("Información actualizada correctamente");
      void refetchAuth();
      setIsEditing(false);
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error(`Error al actualizar: ${errorMessage}`);
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });

  // Función para iniciar la edición
  const startEditing = () => {
    if (instructor) {
      setEditData({
        name: instructor.name || "",
        fullName: instructor.fullName || "",
        phone: instructor.phone || "",
        DNI: instructor.DNI || "",
        bank: instructor.bank || "",
        bankAccount: instructor.bankAccount || "",
        CCI: instructor.CCI || "",
        contactPerson: instructor.contactPerson || "",
        password: "",
      });
      setIsInfoExpanded(true);
      setIsEditing(true);
    }
  };

  // Función para cancelar la edición
  const cancelEditing = () => {
    setIsEditing(false);
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async () => {
    if (!instructor) return;

    const updateData = {
      id: instructor.id,
      name: editData.name,
      fullName: editData.fullName || undefined,
      phone: editData.phone || undefined,
      DNI: editData.DNI || undefined,
      bank: editData.bank || undefined,
      bankAccount: editData.bankAccount || undefined,
      CCI: editData.CCI || undefined,
      contactPerson: editData.contactPerson || undefined,
      password: editData.password || undefined,
    };

    setIsSaving(true);
    try {
      await updateInstructorMutation.mutateAsync(updateData);
    } catch (error) {
      console.error("Error updating instructor:", error);
    }
  };

  if (!isAuthenticated || !instructor) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="space-y-2.5">
          {/* Header principal compacto */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {showBackButton && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={backHref}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {backLabel}
                  </Link>
                </Button>
              )}
              <div className="flex items-center space-x-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={undefined} alt={instructor.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                    {getInitials(instructor.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-base font-semibold text-foreground">
                    {instructor.name}
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={instructor.active ? "default" : "secondary"}>
                {instructor.active ? "Activo" : "Inactivo"}
              </Badge>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={startEditing}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={cancelEditing}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSubmit} disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsInfoExpanded(!isInfoExpanded)}
              >
                {isInfoExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Información expandible */}
          {isInfoExpanded && (
            <div className="space-y-3">
              <Separator />

              {/* Información Personal */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Información Personal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      Nombre
                    </div>
                    {isEditing ? (
                      <Input
                        value={editData.name}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="text-sm text-foreground py-1.5">
                        {instructor.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      Nombre Completo
                    </div>
                    {isEditing ? (
                      <Input
                        value={editData.fullName}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            fullName: e.target.value,
                          })
                        }
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="text-sm text-foreground py-1.5">
                        {instructor.fullName || "-"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      Persona de Contacto
                    </div>
                    {isEditing ? (
                      <Input
                        value={editData.contactPerson}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            contactPerson: e.target.value,
                          })
                        }
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="text-sm text-foreground py-1.5">
                        {instructor.contactPerson || "-"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      Teléfono
                    </div>
                    {isEditing ? (
                      <Input
                        value={editData.phone}
                        onChange={(e) =>
                          setEditData({ ...editData, phone: e.target.value })
                        }
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="text-sm text-foreground flex items-center gap-1.5 py-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {instructor.phone || "-"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      DNI
                    </div>
                    {isEditing ? (
                      <Input
                        value={editData.DNI}
                        onChange={(e) =>
                          setEditData({ ...editData, DNI: e.target.value })
                        }
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="text-sm text-foreground py-1.5">
                        {instructor.DNI || "-"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Información Bancaria */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  Información Bancaria
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      Banco
                    </div>
                    {isEditing ? (
                      <Input
                        value={editData.bank}
                        onChange={(e) =>
                          setEditData({ ...editData, bank: e.target.value })
                        }
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="text-sm text-foreground py-1.5">
                        {instructor.bank || "-"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      Cuenta
                    </div>
                    {isEditing ? (
                      <Input
                        value={editData.bankAccount}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            bankAccount: e.target.value,
                          })
                        }
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="text-sm text-foreground py-1.5">
                        {instructor.bankAccount || "-"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">
                      CCI
                    </div>
                    {isEditing ? (
                      <Input
                        value={editData.CCI}
                        onChange={(e) =>
                          setEditData({ ...editData, CCI: e.target.value })
                        }
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="text-sm text-foreground py-1.5">
                        {instructor.CCI || "-"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Cambio de Contraseña - Solo en edición */}
              {isEditing && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" />
                    Seguridad
                  </h3>
                  <div className="max-w-md">
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground">
                        Nueva Contraseña
                      </div>
                      <Input
                        type="password"
                        value={editData.password}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            password: e.target.value,
                          })
                        }
                        placeholder="Dejar vacío para mantener la contraseña actual"
                        className="h-8 text-sm"
                      />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Dejar vacío para mantener la contraseña actual
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
