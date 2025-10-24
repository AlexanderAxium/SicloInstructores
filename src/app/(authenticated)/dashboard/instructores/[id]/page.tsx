"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRBAC } from "@/hooks/useRBAC";
import {
  ArrowLeft,
  Edit,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Instructor = {
  id: string;
  name: string;
  email: string;
  speciality: string;
  experience: number;
  isActive: boolean;
  phone?: string;
  address?: string;
  rating?: number;
  bio?: string;
  createdAt: string;
  updatedAt: string;
};

export default function InstructorDetailPage() {
  const params = useParams();
  const { canManageUsers } = useRBAC();
  const instructorId = params.id as string;

  // Datos de ejemplo (en un proyecto real, esto vendría de una API)
  const instructor: Instructor = {
    id: instructorId,
    name: "Juan Pérez",
    email: "juan.perez@ejemplo.com",
    speciality: "Pilates",
    experience: 5,
    isActive: true,
    phone: "+1 234 567 8900",
    address: "Calle Principal 123, Ciudad",
    rating: 4.8,
    bio: "Instructor certificado con más de 5 años de experiencia en Pilates. Especializado en rehabilitación y fitness funcional.",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  };

  const handleEdit = () => {
    // Implementar lógica de edición
    console.log("Editar instructor:", instructor.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/instructores">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {instructor.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Detalle del instructor
            </p>
          </div>
        </div>
        {canManageUsers && (
          <Button variant="edit" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>Información Personal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={undefined} alt={instructor.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                    {instructor.name?.charAt(0)?.toUpperCase() || "I"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{instructor.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {instructor.speciality}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge
                      variant="secondary"
                      className={
                        instructor.isActive
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }
                    >
                      {instructor.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                    {instructor.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">
                          {instructor.rating}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{instructor.email}</span>
                  </div>
                  {instructor.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{instructor.phone}</span>
                    </div>
                  )}
                  {instructor.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{instructor.address}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Experiencia:</span>
                    <span className="text-sm ml-2">
                      {instructor.experience} años
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Especialidad:</span>
                    <span className="text-sm ml-2">
                      {instructor.speciality}
                    </span>
                  </div>
                </div>
              </div>

              {instructor.bio && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2">Biografía</h4>
                    <p className="text-sm text-muted-foreground">
                      {instructor.bio}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Clases del Instructor */}
          <Card>
            <CardHeader>
              <CardTitle>Clases Asignadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No hay clases asignadas
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Clases Totales
                </span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Estudiantes
                </span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Horas Dictadas
                </span>
                <span className="font-semibold">0</span>
              </div>
            </CardContent>
          </Card>

          {/* Información del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium">ID:</span>
                <span className="text-sm ml-2 font-mono">{instructor.id}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Creado:</span>
                <span className="text-sm ml-2">
                  {new Date(instructor.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium">
                  Última actualización:
                </span>
                <span className="text-sm ml-2">
                  {new Date(instructor.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
