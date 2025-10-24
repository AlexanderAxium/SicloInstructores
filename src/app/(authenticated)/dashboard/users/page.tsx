"use client";

import { useAuthContext } from "@/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import type {
  TableAction,
  TableColumn,
} from "@/components/ui/scrollable-table";
import { ScrollableTable } from "@/components/ui/scrollable-table";
import { usePagination } from "@/hooks/usePagination";
import { useRBAC } from "@/hooks/useRBAC";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Eye, Plus, Trash2, UserCheck, UserX, Users } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const updateUserSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  password: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "Contraseña debe tener al menos 6 caracteres",
    }),
});

const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres"),
  phone: z.string().optional(),
  language: z.enum(["ES", "EN", "PT"]).optional(),
});

type UserFormData = z.infer<typeof updateUserSchema>;
type CreateUserFormData = z.infer<typeof createUserSchema>;

interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

// Component to show user roles in table cell
function UserRolesCell({ userId }: { userId: string }) {
  const { data: userRoles, isLoading } = trpc.user.getUserRoles.useQuery(
    { userId },
    {
      staleTime: 30000, // Cache for 30 seconds
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return <span className="text-muted-foreground">Cargando...</span>;
  }

  if (!userRoles || userRoles.length === 0) {
    return <span className="text-muted-foreground">Sin roles</span>;
  }

  const activeRoles = userRoles.filter((role) => role.isActive);

  if (activeRoles.length === 0) {
    return <span className="text-muted-foreground">Sin roles activos</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {activeRoles.slice(0, 2).map((userRole) => (
        <Badge
          key={userRole.id}
          variant="secondary"
          className="bg-blue-100 text-blue-800 hover:bg-blue-200"
        >
          {userRole.roleDisplayName}
        </Badge>
      ))}
      {activeRoles.length > 2 && (
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          +{activeRoles.length - 2}
        </Badge>
      )}
    </div>
  );
}

// Unified dialog component for creating and editing users
function UserDialog({
  user,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  user: Partial<User> | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    email: string;
    name: string;
    password?: string;
    phone?: string;
    selectedRoles?: string[];
  }) => void;
  isLoading: boolean;
}) {
  const [selectedInitialRoles, setSelectedInitialRoles] = useState<string[]>(
    []
  );
  const { canManageUsers } = useRBAC();

  const isEdit = !!user?.id;

  const form = useForm<UserFormData | CreateUserFormData>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: {
      email: user?.email || "",
      name: user?.name || "",
      password: "",
      phone: "",
      language: "ES",
    },
  });

  // Reset form when user changes
  React.useEffect(() => {
    if (user?.id) {
      form.reset({
        email: user.email || "",
        name: user.name || "",
        password: "",
        phone: "",
        language: "ES",
      });
      setSelectedInitialRoles([]);
    }
  }, [user, form]); // Depend on user object and form

  const handleSubmit = (data: UserFormData | CreateUserFormData) => {
    // For new users, include selected roles
    if (!isEdit && selectedInitialRoles.length > 0) {
      onSubmit({ ...data, selectedRoles: selectedInitialRoles });
    } else {
      onSubmit(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Editar Usuario - ${user.name}` : "Crear Nuevo Usuario"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifica la información del usuario y gestiona sus roles."
              : "Completa la información para crear un nuevo usuario en el sistema."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - User Information */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-foreground border-b border-border pb-2">
                  Información Personal
                </h4>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="usuario@ejemplo.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nombre del usuario" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Contraseña{" "}
                          {isEdit
                            ? "(dejar vacío para mantener la actual)"
                            : "*"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder={
                              isEdit
                                ? "Nueva contraseña"
                                : "Mínimo 6 caracteres"
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+1234567890" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idioma</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="ES">Español</option>
                            <option value="EN">English</option>
                            <option value="PT">Português</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Right Column - Roles Management */}
              {canManageUsers && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-foreground border-b border-border pb-2">
                    {isEdit ? "Gestión de Roles" : "Roles Iniciales"}
                  </h4>
                  {isEdit ? (
                    <UserRolesManager userId={user.id || ""} />
                  ) : (
                    <InitialRolesManager
                      selectedRoles={selectedInitialRoles}
                      onRolesChange={setSelectedInitialRoles}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-6 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? isEdit
                    ? "Actualizando..."
                    : "Creando..."
                  : isEdit
                    ? "Actualizar Usuario"
                    : "Crear Usuario"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Component for selecting initial roles when creating a user
function InitialRolesManager({
  selectedRoles,
  onRolesChange,
}: {
  selectedRoles: string[];
  onRolesChange: (roles: string[]) => void;
}) {
  const {
    data: availableRoles = [],
    isLoading: rolesLoading,
    error: rolesError,
  } = trpc.rbac.getRoles.useQuery();

  const handleRoleToggle = (roleId: string) => {
    const newRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter((id) => id !== roleId)
      : [...selectedRoles, roleId];
    onRolesChange(newRoles);
  };

  if (rolesLoading) {
    return <p className="text-sm text-muted-foreground">Cargando roles...</p>;
  }

  if (rolesError) {
    return (
      <p className="text-sm text-red-500">
        Error cargando roles: {rolesError.message}
      </p>
    );
  }

  const activeRoles = availableRoles.filter((role) => role.isActive);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Selecciona los roles que tendrá el usuario al ser creado:
      </p>

      {activeRoles.length > 0 ? (
        <div className="space-y-3 max-h-[20rem] overflow-y-auto">
          {activeRoles.map((role) => (
            <button
              key={role.id}
              type="button"
              className={`w-full flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer transition-colors text-left ${
                selectedRoles.includes(role.id)
                  ? "bg-primary/10 border-primary"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => handleRoleToggle(role.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => handleRoleToggle(role.id)}
                    className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                  />
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {role.displayName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {role.description}
                    </div>
                  </div>
                </div>
                {role.isSystem && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 mt-1"
                  >
                    Sistema
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No hay roles disponibles
        </p>
      )}

      {selectedRoles.length > 0 && (
        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm font-medium text-primary mb-2">
            Roles seleccionados ({selectedRoles.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedRoles.map((roleId) => {
              const role = activeRoles.find((r) => r.id === roleId);
              return role ? (
                <Badge
                  key={roleId}
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  {role.displayName}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Component for managing user roles in edit modal
function UserRolesManager({ userId }: { userId: string }) {
  const {
    data: availableRoles = [],
    isLoading: rolesLoading,
    error: rolesError,
  } = trpc.rbac.getRoles.useQuery();
  const { data: userRoles, refetch: refetchUserRoles } =
    trpc.user.getUserRoles.useQuery({ userId }, { enabled: !!userId });

  const assignRole = trpc.user.assignRole.useMutation({
    onSuccess: () => {
      refetchUserRoles();
      // TODO: Add toast notification for success
    },
    onError: (error) => {
      console.error("Error assigning role:", error.message);
      // TODO: Add toast notification for error
    },
  });

  const removeRole = trpc.user.removeRole.useMutation({
    onSuccess: () => {
      refetchUserRoles();
      // TODO: Add toast notification for success
    },
    onError: (error) => {
      console.error("Error removing role:", error.message);
      // TODO: Add toast notification for error
    },
  });

  const handleAssignRole = (roleId: string) => {
    assignRole.mutate({
      userId,
      roleId,
    });
  };

  const handleRemoveRole = (roleId: string) => {
    removeRole.mutate({
      userId,
      roleId,
    });
  };

  if (!userId) {
    return <div className="text-muted-foreground">Usuario no seleccionado</div>;
  }

  // Debug logs (temporary)

  return (
    <div className="space-y-4 max-h-[28rem] overflow-y-auto">
      {/* Current Roles */}
      <div>
        <h5 className="text-sm font-medium mb-2">Roles Asignados</h5>
        {userRoles && userRoles.length > 0 ? (
          <div className="space-y-2">
            {userRoles.map((userRole) => (
              <div
                key={userRole.id}
                className="flex items-center justify-between p-2 bg-muted rounded border border-border"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {userRole.roleDisplayName}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {userRole.roleDescription}
                  </div>
                  {userRole.expiresAt && (
                    <div className="text-xs text-orange-600">
                      Expira:{" "}
                      {new Date(userRole.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveRole(userRole.roleId)}
                  disabled={removeRole.isPending}
                  className="ml-2 h-6 w-6 p-0"
                >
                  <UserX className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay roles asignados
          </p>
        )}
      </div>

      {/* Available Roles */}
      <div>
        <h5 className="text-sm font-medium mb-2">Roles Disponibles</h5>
        {rolesLoading ? (
          <p className="text-sm text-muted-foreground">Cargando roles...</p>
        ) : rolesError ? (
          <p className="text-sm text-red-500">
            Error cargando roles: {rolesError.message}
          </p>
        ) : availableRoles && availableRoles.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableRoles
              .filter(
                (role) =>
                  role.isActive &&
                  !userRoles?.some((ur) => ur.roleId === role.id)
              )
              .map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-2 border border-border rounded hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {role.displayName}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {role.description}
                    </div>
                    {role.isSystem && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200 mt-1"
                      >
                        Sistema
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAssignRole(role.id)}
                    disabled={assignRole.isPending}
                    className="ml-2 h-6 w-6 p-0"
                  >
                    <UserCheck className="h-3 w-3" />
                  </Button>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            <p>No hay roles disponibles</p>
            <p className="text-xs mt-1">
              Roles totales: {availableRoles?.length || 0}
            </p>
            <p className="text-xs">
              Roles del usuario: {userRoles?.length || 0}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [dialogUser, setDialogUser] = useState<Partial<User> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { canManageUsers } = useRBAC();
  const { user: currentUser } = useAuthContext();

  const pagination = usePagination({ defaultLimit: 10 });
  const queryParams = pagination.getQueryParams();

  const {
    data: response,
    refetch,
    error,
    isLoading,
  } = trpc.user.getAll.useQuery(queryParams);

  const updateUser = trpc.user.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsDialogOpen(false);
      setDialogUser(null);
      // TODO: Add toast notification for success
    },
    onError: (error) => {
      // TODO: Add toast notification for error
      console.error("Error updating user:", error.message);
    },
  });

  const createUser = trpc.user.create.useMutation({
    onSuccess: async () => {
      refetch();
      setIsDialogOpen(false);
      setDialogUser(null);
      // TODO: Add toast notification for success
    },
    onError: (error) => {
      // TODO: Add toast notification for error
      console.error("Error creating user:", error.message);
    },
  });

  const assignRoleMutation = trpc.user.assignRole.useMutation();

  const deleteUser = trpc.user.delete.useMutation({
    onSuccess: () => {
      refetch();
      // TODO: Add toast notification for success
    },
    onError: (error) => {
      // TODO: Add toast notification for error
      console.error("Error deleting user:", error.message);
    },
  });

  const users = response?.data || [];
  const paginationInfo = response?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  const handleEdit = (user: User) => {
    setDialogUser(user);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setDialogUser(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setDialogUser(null);
  };

  const handleDialogSubmit = async (data: {
    email: string;
    name: string;
    password?: string;
    phone?: string;
    selectedRoles?: string[];
  }) => {
    if (dialogUser?.id) {
      // Edit existing user
      const updateData = {
        id: dialogUser.id,
        email: data.email,
        name: data.name,
        ...(data.password && { password: data.password }),
      };
      updateUser.mutate(updateData);
    } else {
      // Create new user
      const { selectedRoles, ...userData } = data;
      const newUser = await createUser.mutateAsync(
        userData as CreateUserFormData
      );

      // Assign initial roles if any were selected
      if (selectedRoles && selectedRoles.length > 0) {
        try {
          for (const roleId of selectedRoles) {
            await assignRoleMutation.mutateAsync({
              userId: newUser.id,
              roleId: roleId,
            });
          }
        } catch (error) {
          console.error("Error assigning initial roles:", error);
        }
      }
    }
  };

  const handleDelete = (user: User) => {
    if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      deleteUser.mutate({ id: user.id });
    }
  };

  // Definir columnas de la tabla
  const columns: TableColumn<User>[] = [
    {
      key: "name",
      title: "Usuario",
      render: (_, record) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-3">
            <AvatarImage
              src={record.image || undefined}
              alt={record.name || "Usuario"}
            />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {record.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium text-foreground">
              {record.name}
            </div>
            <div className="text-sm text-muted-foreground">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "emailVerified",
      title: "Estado",
      render: (value) => (
        <Badge
          variant="secondary"
          className={`text-xs font-medium ${
            value
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          }`}
        >
          {value ? "Confirmado" : "Pendiente"}
        </Badge>
      ),
    },
    {
      key: "roles",
      title: "Roles",
      render: (_, record) => <UserRolesCell userId={record.id} />,
      className: "text-sm",
    },
    {
      key: "createdAt",
      title: "Creado",
      render: (value) => new Date(value as string).toLocaleDateString(),
      className: "text-sm text-muted-foreground",
    },
  ];

  // Función para ver detalles del usuario
  const handleViewUser = (user: User) => {
    window.location.href = `/dashboard/users/${user.id}`;
  };

  // Definir acciones de la tabla
  const actions: TableAction<User>[] = [
    {
      label: "Ver Detalles",
      icon: <Eye className="h-4 w-4" />,
      onClick: handleViewUser,
      variant: "edit",
    },
    {
      label: "Editar",
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit,
      variant: "edit-secondary",
      // Solo mostrar si es administrador o si es el usuario actual
      hidden: (user: User) => !(canManageUsers || user.id === currentUser?.id),
    },
    {
      label: "Eliminar",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      variant: "destructive",
      separator: true,
      // Solo mostrar si es administrador o si es el usuario actual
      hidden: (user: User) => !(canManageUsers || user.id === currentUser?.id),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 mr-8">
            Administra usuarios del sistema y asigna roles y permisos
          </p>
        </div>
        <Button size="sm" variant="edit-secondary" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          <span>Nuevo Usuario</span>
        </Button>
      </div>

      {/* Tabla con ScrollableTable */}
      <ScrollableTable<User>
        data={users}
        columns={columns}
        loading={isLoading}
        error={error?.message || null}
        pagination={paginationInfo}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setLimit}
        actions={actions}
        emptyMessage="No se encontraron usuarios"
        emptyIcon={<Users className="h-12 w-12 text-muted-foreground" />}
      />

      {/* Unified User Dialog */}
      <UserDialog
        user={dialogUser}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        isLoading={updateUser.isPending || createUser.isPending}
      />
    </div>
  );
}
