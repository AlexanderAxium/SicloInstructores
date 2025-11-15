"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/utils/trpc";
import {
  Building2,
  Globe,
  GraduationCap,
  Mail,
  RotateCcw,
  Save,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Helper function to get user-friendly field names
function getFieldDisplayName(fieldName: string): string {
  const fieldNames: Record<string, string> = {
    name: "Nombre de la empresa",
    displayName: "Nombre para mostrar",
    description: "Descripción",
    email: "Correo electrónico",
    phone: "Teléfono",
    address: "Dirección",
    city: "Ciudad",
    country: "País",
    website: "Sitio web",
    facebookUrl: "Facebook",
    twitterUrl: "Twitter",
    instagramUrl: "Instagram",
    linkedinUrl: "LinkedIn",
    youtubeUrl: "YouTube",
    foundedYear: "Año de fundación",
    logoUrl: "URL del logo",
    faviconUrl: "URL del favicon",
    metaTitle: "Título SEO",
    metaDescription: "Descripción SEO",
    metaKeywords: "Palabras clave SEO",
    termsUrl: "URL de términos",
    privacyUrl: "URL de privacidad",
    cookiesUrl: "URL de cookies",
    complaintsUrl: "URL de reclamaciones",
  };
  return fieldNames[fieldName] || fieldName;
}

// Helper function to get user-friendly error messages
function getFieldErrorMessage(errorCode: string, fieldName: string): string {
  switch (errorCode) {
    case "invalid_format":
      if (fieldName.includes("Url") || fieldName === "website") {
        return "Debe ser una URL válida (ejemplo: https://ejemplo.com)";
      }
      if (fieldName === "email") {
        return "Debe ser un correo electrónico válido (ejemplo: usuario@ejemplo.com)";
      }
      return "Formato inválido";
    case "too_small":
      return "El campo es muy corto";
    case "too_big":
      return "El campo es muy largo";
    case "invalid_type":
      return "Tipo de dato inválido";
    default:
      return "Valor inválido";
  }
}

function InstructorsPasswordResetTab() {
  const [selectedInstructorIds, setSelectedInstructorIds] = useState<
    Set<string>
  >(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Get all instructors
  const { data: instructorsData, isLoading } = trpc.instructor.getAll.useQuery({
    limit: 1000,
    offset: 0,
  });

  const instructors = instructorsData?.instructors || [];

  // Reset passwords mutation
  const resetPasswordsMutation = trpc.instructor.resetPasswords.useMutation({
    onSuccess: (data) => {
      toast.success(`Se resetearon ${data.count} contraseña(s) exitosamente`);
      setSelectedInstructorIds(new Set());
      setSelectAll(false);
    },
    onError: (error) => {
      toast.error(error.message || "Error al resetear las contraseñas");
    },
  });

  // Handle individual checkbox
  const handleToggleInstructor = (instructorId: string) => {
    const newSelected = new Set(selectedInstructorIds);
    if (newSelected.has(instructorId)) {
      newSelected.delete(instructorId);
    } else {
      newSelected.add(instructorId);
    }
    setSelectedInstructorIds(newSelected);
    setSelectAll(
      newSelected.size === instructors.length && instructors.length > 0
    );
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(instructors.map((i) => i.id));
      setSelectedInstructorIds(allIds);
      setSelectAll(true);
    } else {
      setSelectedInstructorIds(new Set());
      setSelectAll(false);
    }
  };

  // Handle reset passwords
  const handleResetPasswords = () => {
    if (selectedInstructorIds.size === 0) {
      toast.error("Por favor selecciona al menos un instructor");
      return;
    }

    if (
      !confirm(
        `¿Estás seguro de que quieres resetear las contraseñas de ${selectedInstructorIds.size} instructor(es)? Las contraseñas se establecerán a su valor por defecto.`
      )
    ) {
      return;
    }

    resetPasswordsMutation.mutate({
      instructorIds: Array.from(selectedInstructorIds),
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Cargando instructores...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <GraduationCap className="h-4 w-4" />
          Reseteo de Contraseñas
        </CardTitle>
        <CardDescription className="text-sm">
          Gestiona el reseteo de contraseñas de instructores. Las contraseñas se
          establecerán a su valor por defecto (nombre en minúsculas sin espacios
          + número de letras + "#" si es par, o "%" si es impar). Ejemplo: "Dani
          Mua" → "danimua7%"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {instructors.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No hay instructores disponibles
            </p>
          </div>
        ) : (
          <>
            {/* Select All and Reset Button */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <Label
                  htmlFor="select-all"
                  className="text-sm font-medium cursor-pointer"
                >
                  Seleccionar todos ({selectedInstructorIds.size} de{" "}
                  {instructors.length})
                </Label>
              </div>
              <Button
                onClick={handleResetPasswords}
                disabled={
                  selectedInstructorIds.size === 0 ||
                  resetPasswordsMutation.isPending
                }
                size="sm"
              >
                {resetPasswordsMutation.isPending ? (
                  <>
                    <RotateCcw className="h-4 w-4 animate-spin" />
                    Reseteando...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    Resetear Contraseñas ({selectedInstructorIds.size})
                  </>
                )}
              </Button>
            </div>

            {/* Instructors List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {instructors.map((instructor) => {
                const isSelected = selectedInstructorIds.has(instructor.id);
                const nameWithoutSpaces = instructor.name
                  .toLowerCase()
                  .replace(/\s+/g, "");
                const letterCount = nameWithoutSpaces.length;
                const symbol = letterCount % 2 === 0 ? "#" : "%";
                const defaultPassword = `${nameWithoutSpaces}${letterCount}${symbol}`;

                return (
                  <div
                    key={instructor.id}
                    className={`flex items-center justify-between p-3 rounded-md border border-border transition-colors ${
                      isSelected ? "bg-muted/50" : "bg-background"
                    }`}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <Checkbox
                        id={`instructor-${instructor.id}`}
                        checked={isSelected}
                        onCheckedChange={() =>
                          handleToggleInstructor(instructor.id)
                        }
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`instructor-${instructor.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {instructor.name}
                        </Label>
                        {instructor.fullName && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {instructor.fullName}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Contraseña por defecto:{" "}
                          <span className="font-mono font-medium">
                            {defaultPassword}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    website: "",
    facebookUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    youtubeUrl: "",
    foundedYear: "",
    logoUrl: "",
    faviconUrl: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    termsUrl: "",
    privacyUrl: "",
    cookiesUrl: "",
    complaintsUrl: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Get company info
  const { data: companyInfo, refetch } = trpc.companyInfo.get.useQuery();

  // Load data into form when companyInfo is available
  useEffect(() => {
    if (companyInfo) {
      setFormData({
        name: companyInfo.name || "",
        displayName: companyInfo.displayName || "",
        description: companyInfo.description || "",
        email: companyInfo.email || "",
        phone: companyInfo.phone || "",
        address: companyInfo.address || "",
        city: companyInfo.city || "",
        country: companyInfo.country || "",
        website: companyInfo.website || "",
        facebookUrl: companyInfo.facebookUrl || "",
        twitterUrl: companyInfo.twitterUrl || "",
        instagramUrl: companyInfo.instagramUrl || "",
        linkedinUrl: companyInfo.linkedinUrl || "",
        youtubeUrl: companyInfo.youtubeUrl || "",
        foundedYear: companyInfo.foundedYear?.toString() || "",
        logoUrl: companyInfo.logoUrl || "",
        faviconUrl: companyInfo.faviconUrl || "",
        metaTitle: companyInfo.metaTitle || "",
        metaDescription: companyInfo.metaDescription || "",
        metaKeywords: companyInfo.metaKeywords || "",
        termsUrl: companyInfo.termsUrl || "",
        privacyUrl: companyInfo.privacyUrl || "",
        cookiesUrl: companyInfo.cookiesUrl || "",
        complaintsUrl: companyInfo.complaintsUrl || "",
      });
    }
  }, [companyInfo]);

  // Update company info mutation
  const updateCompanyInfo = trpc.companyInfo.update.useMutation({
    onSuccess: () => {
      toast.success("Información de la empresa actualizada exitosamente");
      refetch();
    },
    onError: (error) => {
      // Parse and format error messages to be more user-friendly
      let errorMessage = "Error al actualizar la información";

      try {
        // Check if it's a validation error with multiple issues
        if (error.message.includes("[") && error.message.includes("]")) {
          const errorData = JSON.parse(error.message);
          if (Array.isArray(errorData)) {
            const fieldErrors = errorData.map(
              (err: { path: string[]; code: string }) => {
                const fieldName = getFieldDisplayName(err.path[0] ?? "");
                return `• ${fieldName}: ${getFieldErrorMessage(err.code, err.path[0] ?? "")}`;
              }
            );
            errorMessage = `Por favor corrige los siguientes errores:\n${fieldErrors.join("\n")}`;
          }
        } else {
          errorMessage = error.message;
        }
      } catch {
        // If parsing fails, use a generic message
        errorMessage =
          "Error al actualizar la información. Por favor, verifica que todos los campos estén correctamente completados.";
      }

      // Show user-friendly error message
      toast.error(errorMessage);

      // Prevent the error from propagating to Next.js error boundary
      return false;
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateCompanyInfo.mutateAsync({
        ...formData,
        foundedYear: formData.foundedYear
          ? Number.parseInt(formData.foundedYear)
          : undefined,
        facebookUrl: formData.facebookUrl || null,
        twitterUrl: formData.twitterUrl || null,
        instagramUrl: formData.instagramUrl || null,
        linkedinUrl: formData.linkedinUrl || null,
        youtubeUrl: formData.youtubeUrl || null,
        logoUrl: formData.logoUrl || null,
        faviconUrl: formData.faviconUrl || null,
      });
    } catch (_error) {
      // Error is already handled by the mutation's onError callback
      // Don't re-throw to prevent Next.js error boundary from showing
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Configuraciones
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestiona la configuración del sistema y la información de la empresa
          </p>
        </div>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="company"
            className="flex items-center gap-2 text-sm"
          >
            <Building2 className="h-4 w-4" />
            Información de la Empresa
          </TabsTrigger>
          <TabsTrigger
            value="instructors"
            className="flex items-center gap-2 text-sm"
          >
            <GraduationCap className="h-4 w-4" />
            Instructores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-4 w-4" />
                  Información Básica
                </CardTitle>
                <CardDescription className="text-sm">
                  Configura la información principal de la empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm">
                      Nombre de la Empresa
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Siclo Instructores"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="displayName" className="text-sm">
                      Nombre para Mostrar
                    </Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) =>
                        handleInputChange("displayName", e.target.value)
                      }
                      placeholder="Siclo Fitness Management"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-sm">
                    Descripción
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Descripción de la empresa..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="foundedYear" className="text-sm">
                      Año de Fundación
                    </Label>
                    <Input
                      id="foundedYear"
                      type="number"
                      value={formData.foundedYear}
                      onChange={(e) =>
                        handleInputChange("foundedYear", e.target.value)
                      }
                      placeholder="2024"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="website" className="text-sm">
                      Sitio Web
                    </Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      placeholder="https://myapp.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mail className="h-4 w-4" />
                  Información de Contacto
                </CardTitle>
                <CardDescription className="text-sm">
                  Datos de contacto y ubicación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="info@myapp.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm">
                      Teléfono
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="+1 (234) 567-890"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-sm">
                    Dirección
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Dirección completa"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-sm">
                      Ciudad
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      placeholder="Bogotá"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="country" className="text-sm">
                      País
                    </Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) =>
                        handleInputChange("country", e.target.value)
                      }
                      placeholder="Colombia"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-4 w-4" />
                  Redes Sociales
                </CardTitle>
                <CardDescription className="text-sm">
                  Enlaces a las redes sociales de la empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="facebookUrl" className="text-sm">
                      Facebook
                    </Label>
                    <Input
                      id="facebookUrl"
                      value={formData.facebookUrl}
                      onChange={(e) =>
                        handleInputChange("facebookUrl", e.target.value)
                      }
                      placeholder="https://facebook.com/myapp"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="twitterUrl" className="text-sm">
                      Twitter
                    </Label>
                    <Input
                      id="twitterUrl"
                      value={formData.twitterUrl}
                      onChange={(e) =>
                        handleInputChange("twitterUrl", e.target.value)
                      }
                      placeholder="https://twitter.com/myapp"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="instagramUrl" className="text-sm">
                      Instagram
                    </Label>
                    <Input
                      id="instagramUrl"
                      value={formData.instagramUrl}
                      onChange={(e) =>
                        handleInputChange("instagramUrl", e.target.value)
                      }
                      placeholder="https://instagram.com/myapp"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="linkedinUrl" className="text-sm">
                      LinkedIn
                    </Label>
                    <Input
                      id="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={(e) =>
                        handleInputChange("linkedinUrl", e.target.value)
                      }
                      placeholder="https://linkedin.com/company/myapp"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="youtubeUrl" className="text-sm">
                      YouTube
                    </Label>
                    <Input
                      id="youtubeUrl"
                      value={formData.youtubeUrl}
                      onChange={(e) =>
                        handleInputChange("youtubeUrl", e.target.value)
                      }
                      placeholder="https://youtube.com/@myapp"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-4 w-4" />
                  SEO y Metadatos
                </CardTitle>
                <CardDescription className="text-sm">
                  Información para motores de búsqueda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="metaTitle" className="text-sm">
                    Título SEO
                  </Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) =>
                      handleInputChange("metaTitle", e.target.value)
                    }
                    placeholder="Siclo Instructores - Gestión de Fitness"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="metaDescription" className="text-sm">
                    Descripción SEO
                  </Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) =>
                      handleInputChange("metaDescription", e.target.value)
                    }
                    placeholder="Descripción para motores de búsqueda..."
                    rows={3}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="metaKeywords" className="text-sm">
                    Palabras Clave
                  </Label>
                  <Input
                    id="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={(e) =>
                      handleInputChange("metaKeywords", e.target.value)
                    }
                    placeholder="gestión, usuarios, plataforma, moderno, escalable"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading} size="sm">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="instructors" className="space-y-4">
          <InstructorsPasswordResetTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
