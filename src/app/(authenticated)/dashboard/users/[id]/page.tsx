"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/utils/trpc";
import { ArrowLeft, Calendar, Mail, Phone, Shield, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  const { data: user, isLoading } = trpc.user.getById.useQuery({ id: userId });
  const { data: userRoles } = trpc.user.getUserRoles.useQuery({ userId });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando usuario...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Usuario no encontrado
          </h1>
          <p className="text-muted-foreground mb-6">
            El usuario que buscas no existe o no tienes permisos para verlo.
          </p>
          <Link href="/dashboard/users">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a usuarios
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/users">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Detalles del Usuario
              </h1>
              <p className="text-muted-foreground">
                Información completa del usuario
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Perfil</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback className="text-2xl">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-foreground">
                      {user.name}
                    </h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="mt-2">
                      <Badge
                        variant={user.emailVerified ? "default" : "secondary"}
                      >
                        {user.emailVerified ? "Verificado" : "No verificado"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {user.phone}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Registrado:{" "}
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Roles and Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Roles y Permisos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">
                      Roles asignados:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {userRoles?.map((userRole) => (
                        <Badge key={userRole.id} variant="outline">
                          {userRole.roleDisplayName}
                        </Badge>
                      )) || (
                        <span className="text-sm text-muted-foreground">
                          No hay roles asignados
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Información de la Cuenta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      ID de Usuario
                    </div>
                    <p className="text-sm text-foreground font-mono">
                      {user.id}
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Idioma
                    </div>
                    <p className="text-sm text-foreground">{user.language}</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Fecha de Creación
                    </div>
                    <p className="text-sm text-foreground">
                      {new Date(user.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Última Actualización
                    </div>
                    <p className="text-sm text-foreground">
                      {new Date(user.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
