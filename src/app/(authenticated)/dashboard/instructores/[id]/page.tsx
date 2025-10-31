"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { TableColumn } from "@/components/ui/scrollable-table";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePagination } from "@/hooks/usePagination";
import type { InstructorFromAPI } from "@/types/instructor";
import { trpc } from "@/utils/trpc";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Edit,
  Eye,
  GraduationCap,
  Lock,
  Phone,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

// Tipo para las clases del instructor
interface InstructorClass {
  id: string;
  date: string;
  totalReservations: number;
  paidReservations: number;
  spots: number;
  specialText?: string | null;
  isVersus: boolean;
  versusNumber?: number | null;
  discipline: {
    name: string;
    color?: string | null;
  };
  period: {
    number: number;
    year: number;
  };
}

// Tipo para los pagos del instructor (desde la API con period expandido)
interface InstructorPaymentWithPeriod {
  id: string;
  status: string;
  period: {
    id: string;
    number: number;
    year: number;
  };
  cover: number;
  comments: string | null;
  penalty: number;
  amount: number;
  retention: number;
  branding: number;
  themeRide: number;
  workshop: number;
  versusBonus: number;
  bonus: number | null;
  finalPayment: number;
}

export default function InstructorDetailPage() {
  const params = useParams();
  const instructorId = params.id as string;
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isInfoExpanded, setIsInfoExpanded] = useState(true);
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
    active: false,
  });

  // Paginación para clases y pagos
  const classesPagination = usePagination({
    defaultLimit: 10,
    defaultPage: 1,
  });

  const paymentsPagination = usePagination({
    defaultLimit: 10,
    defaultPage: 1,
  });

  // Obtener datos del instructor desde tRPC
  const {
    data: instructor,
    isLoading,
    error,
    refetch,
  } = trpc.instructor.getById.useQuery({
    id: instructorId,
  });

  // Obtener clases del instructor con paginación usando filtros
  const { data: classesData, isLoading: isLoadingClasses } =
    trpc.classes.getWithFilters.useQuery({
      instructorId,
      limit: classesPagination.limit,
      offset: (classesPagination.page - 1) * classesPagination.limit,
    });

  // Obtener pagos del instructor con paginación usando filtros
  const { data: paymentsData, isLoading: isLoadingPayments } =
    trpc.payments.getWithFilters.useQuery({
      instructorId,
      limit: paymentsPagination.limit,
      offset: (paymentsPagination.page - 1) * paymentsPagination.limit,
    });

  // Mutación para actualizar instructor
  const updateInstructorMutation = trpc.instructor.update.useMutation();

  // Función para manejar el envío del formulario
  const handleSubmit = async () => {
    if (!instructor) return;

    const updateData = {
      id: instructorId,
      name: editData.name,
      fullName: editData.fullName || undefined,
      phone: editData.phone || undefined,
      DNI: editData.DNI || undefined,
      bank: editData.bank || undefined,
      bankAccount: editData.bankAccount || undefined,
      CCI: editData.CCI || undefined,
      contactPerson: editData.contactPerson || undefined,
      password: editData.password || undefined,
      active: editData.active,
    };

    setIsSaving(true);
    try {
      await updateInstructorMutation.mutateAsync(updateData);
      refetch();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating instructor:", error);
    } finally {
      setIsSaving(false);
    }
  };

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
        active: instructor.active || false,
      });
      setIsInfoExpanded(true);
      setIsEditing(true);
    }
  };

  // Función para cancelar la edición
  const cancelEditing = () => {
    setIsEditing(false);
  };

  // Definir columnas para la tabla de clases
  const classColumns: TableColumn<InstructorClass>[] = [
    {
      key: "date",
      title: "Fecha",
      width: "120px",
      render: (_, record) => (
        <span className="text-sm">
          {new Date(record.date).toLocaleDateString("es-PE")}
        </span>
      ),
    },
    {
      key: "discipline",
      title: "Disciplina",
      width: "150px",
      render: (_, record) => (
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: record.discipline.color || "#6b7280" }}
          />
          <span className="font-medium text-sm truncate">
            {record.discipline.name}
          </span>
        </div>
      ),
    },
    {
      key: "reservations",
      title: "Reservas",
      width: "120px",
      headerClassName: "text-center",
      render: (_, record) => (
        <div className="text-sm text-center">
          <div className="font-medium flex items-center justify-center gap-1">
            {record.totalReservations}/{record.spots}
            {record.isVersus && (
              <Badge variant="default" className="text-xs">
                VS
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "period",
      title: "Período",
      width: "100px",
      headerClassName: "text-center",
      render: (_, record) => (
        <span className="text-sm text-center block">
          {record.period.number}/{record.period.year}
        </span>
      ),
    },
  ];

  // Función para navegar a la página de detalle del pago
  const handleViewPayment = (payment: InstructorPaymentWithPeriod) => {
    window.location.href = `/dashboard/pagos/${payment.id}`;
  };

  // Definir columnas para la tabla de pagos
  const paymentColumns: TableColumn<InstructorPaymentWithPeriod>[] = [
    {
      key: "period",
      title: "Período",
      width: "100px",
      headerClassName: "text-center",
      render: (_, record) => (
        <span className="text-sm text-center block">
          {record.period.number}/{record.period.year}
        </span>
      ),
    },
    {
      key: "amount",
      title: "Monto Base",
      width: "120px",
      render: (_, record) => (
        <span className="text-sm font-medium">
          S/ {record.amount.toFixed(2)}
        </span>
      ),
    },
    {
      key: "finalPayment",
      title: "Pago Final",
      width: "120px",
      render: (_, record) => (
        <span className="text-sm font-semibold text-green-600">
          S/ {record.finalPayment.toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      title: "Estado",
      width: "100px",
      render: (_, record) => (
        <Badge
          variant="secondary"
          className={`text-xs font-medium ${
            record.status === "PAID"
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : record.status === "PENDING"
                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}
        >
          {record.status === "PAID"
            ? "Pagado"
            : record.status === "PENDING"
              ? "Pendiente"
              : "Cancelado"}
        </Badge>
      ),
    },
    {
      key: "bonus",
      title: "Bonificaciones",
      width: "120px",
      render: (_, record) => (
        <div className="text-sm">
          <div className="font-medium">S/ {(record.bonus || 0).toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">
            VS: S/ {record.versusBonus.toFixed(2)}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Acciones",
      width: "80px",
      headerClassName: "text-center",
      render: (_, record) => (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewPayment(record)}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Acciones de la tabla de clases

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/instructores">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cargando...</h1>
            <p className="text-sm text-muted-foreground">
              Obteniendo información del instructor
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !instructor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/instructores">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Error</h1>
            <p className="text-sm text-muted-foreground">
              No se pudo cargar la información del instructor
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-muted-foreground">
                {error?.message || "Instructor no encontrado"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="space-y-3">
            {/* Header principal compacto */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/instructores">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                  </Link>
                </Button>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={undefined} alt={instructor.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                      {instructor.name?.charAt(0)?.toUpperCase() || "I"}
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="text-lg font-bold text-foreground">
                    {instructor.name}
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-2">
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
                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      disabled={isSaving}
                    >
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
              <div className="space-y-4">
                <Separator />

                {/* Información Personal */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Información Personal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <div className="text-xs font-medium text-muted-foreground">
                          Nombre
                        </div>
                        {isEditing ? (
                          <Input
                            value={editData.name}
                            onChange={(e) =>
                              setEditData({ ...editData, name: e.target.value })
                            }
                            className="h-9"
                          />
                        ) : (
                          <p className="text-sm text-foreground">
                            {instructor.name}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-xs font-medium text-muted-foreground">
                          Teléfono
                        </div>
                        {isEditing ? (
                          <Input
                            value={editData.phone}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                phone: e.target.value,
                              })
                            }
                            className="h-9"
                          />
                        ) : (
                          <p className="text-sm text-foreground flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            {instructor.phone || "-"}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-xs font-medium text-muted-foreground">
                          DNI
                        </div>
                        {isEditing ? (
                          <Input
                            value={editData.DNI}
                            onChange={(e) =>
                              setEditData({ ...editData, DNI: e.target.value })
                            }
                            className="h-9"
                          />
                        ) : (
                          <p className="text-sm text-foreground">
                            {instructor.DNI || "-"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
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
                            className="h-9"
                          />
                        ) : (
                          <p className="text-sm text-foreground">
                            {instructor.contactPerson || "-"}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-xs font-medium text-muted-foreground">
                          Estado
                        </div>
                        {isEditing ? (
                          <div className="flex items-center space-x-2 h-9">
                            <Checkbox
                              checked={editData.active}
                              onCheckedChange={(checked) =>
                                setEditData({
                                  ...editData,
                                  active: checked === true,
                                })
                              }
                            />
                            <span className="text-sm text-foreground">
                              {editData.active ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-foreground">
                            {instructor.active ? "Activo" : "Inactivo"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información Bancaria */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Información Bancaria
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <div className="text-xs font-medium text-muted-foreground">
                        Banco
                      </div>
                      {isEditing ? (
                        <Input
                          value={editData.bank}
                          onChange={(e) =>
                            setEditData({ ...editData, bank: e.target.value })
                          }
                          className="h-9"
                        />
                      ) : (
                        <p className="text-sm text-foreground">
                          {instructor.bank || "-"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
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
                          className="h-9"
                        />
                      ) : (
                        <p className="text-sm text-foreground">
                          {instructor.bankAccount || "-"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-xs font-medium text-muted-foreground">
                        CCI
                      </div>
                      {isEditing ? (
                        <Input
                          value={editData.CCI}
                          onChange={(e) =>
                            setEditData({ ...editData, CCI: e.target.value })
                          }
                          className="h-9"
                        />
                      ) : (
                        <p className="text-sm text-foreground">
                          {instructor.CCI || "-"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cambio de Contraseña - Solo en edición */}
                {isEditing && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Seguridad
                    </h3>
                    <div className="max-w-md">
                      <div className="space-y-1.5">
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
                          className="h-9"
                        />
                        <p className="text-xs text-muted-foreground">
                          Dejar vacío si no deseas cambiar la contraseña
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

      {/* Clases y Pagos del Instructor */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="clases" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-8 bg-muted/30 rounded-none border-b border-border">
              <TabsTrigger
                value="clases"
                className="flex items-center gap-1.5 text-sm py-1 h-6 data-[state=active]:shadow-none data-[state=active]:bg-white "
              >
                <GraduationCap className="h-3.5 w-3.5" />
                Clases
              </TabsTrigger>
              <TabsTrigger
                value="pagos"
                className="flex items-center gap-1.5 text-sm py-1 h-6 data-[state=active]:shadow-none data-[state=active]:bg-white"
              >
                <DollarSign className="h-3.5 w-3.5" />
                Pagos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clases" className="mt-0 p-4">
              <ScrollableTable<InstructorClass>
                data={classesData?.classes || []}
                columns={classColumns}
                loading={isLoadingClasses}
                error={undefined}
                pagination={{
                  page: classesPagination.page,
                  limit: classesPagination.limit,
                  total: classesData?.total || 0,
                  totalPages: Math.ceil(
                    (classesData?.total || 0) / classesPagination.limit
                  ),
                  hasNext:
                    classesPagination.page <
                    Math.ceil(
                      (classesData?.total || 0) / classesPagination.limit
                    ),
                  hasPrev: classesPagination.page > 1,
                }}
                onPageChange={classesPagination.setPage}
                onPageSizeChange={classesPagination.setLimit}
                emptyMessage="No hay clases asignadas"
                emptyIcon={
                  <GraduationCap className="h-12 w-12 text-muted-foreground" />
                }
              />
            </TabsContent>

            <TabsContent value="pagos" className="mt-0 p-4">
              <ScrollableTable<InstructorPaymentWithPeriod>
                data={paymentsData?.payments || []}
                columns={paymentColumns}
                loading={isLoadingPayments}
                error={undefined}
                pagination={{
                  page: paymentsPagination.page,
                  limit: paymentsPagination.limit,
                  total: paymentsData?.total || 0,
                  totalPages: Math.ceil(
                    (paymentsData?.total || 0) / paymentsPagination.limit
                  ),
                  hasNext:
                    paymentsPagination.page <
                    Math.ceil(
                      (paymentsData?.total || 0) / paymentsPagination.limit
                    ),
                  hasPrev: paymentsPagination.page > 1,
                }}
                onPageChange={paymentsPagination.setPage}
                onPageSizeChange={paymentsPagination.setLimit}
                emptyMessage="No hay pagos registrados"
                emptyIcon={
                  <DollarSign className="h-12 w-12 text-muted-foreground" />
                }
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
