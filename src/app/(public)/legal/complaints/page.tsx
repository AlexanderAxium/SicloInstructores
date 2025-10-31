"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

export default function ComplaintsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    documentType: "",
    documentNumber: "",
    complaintType: "",
    subject: "",
    description: "",
    expectedResolution: "",
    attachments: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.success(
      "Reclamo enviado exitosamente. Recibirá una respuesta en 24-48 horas."
    );
    setIsSubmitting(false);

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      documentType: "",
      documentNumber: "",
      complaintType: "",
      subject: "",
      description: "",
      expectedResolution: "",
      attachments: "",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Libro de Reclamaciones
          </h1>
          <p className="text-muted-foreground">
            Su opinión es importante para nosotros. Utilice este formulario para
            presentar reclamos, quejas o sugerencias.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Libro de Reclamaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              De acuerdo con la normativa peruana, Siclo Instructores mantiene
              un Libro de Reclamaciones para registrar y resolver las quejas de
              nuestros usuarios.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                Tiempo de Respuesta:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Reclamos simples: 24 horas</li>
                <li>• Reclamos complejos: 48 horas</li>
                <li>• Reclamos técnicos: 72 horas</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formulario de Reclamo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">
                  Información Personal
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentType">Tipo de Documento</Label>
                    <Select
                      value={formData.documentType}
                      onValueChange={(value) =>
                        handleInputChange("documentType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dni">DNI</SelectItem>
                        <SelectItem value="passport">Pasaporte</SelectItem>
                        <SelectItem value="ce">Carné de Extranjería</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentNumber">Número de Documento</Label>
                  <Input
                    id="documentNumber"
                    value={formData.documentNumber}
                    onChange={(e) =>
                      handleInputChange("documentNumber", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Complaint Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">
                  Información del Reclamo
                </h4>

                <div className="space-y-2">
                  <Label htmlFor="complaintType">Tipo de Reclamo *</Label>
                  <Select
                    value={formData.complaintType}
                    onValueChange={(value) =>
                      handleInputChange("complaintType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo de reclamo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">
                        Problema con el Servicio
                      </SelectItem>
                      <SelectItem value="billing">
                        Problema de Facturación
                      </SelectItem>
                      <SelectItem value="technical">
                        Problema Técnico
                      </SelectItem>
                      <SelectItem value="support">
                        Atención al Cliente
                      </SelectItem>
                      <SelectItem value="feature">
                        Solicitud de Funcionalidad
                      </SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Asunto *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      handleInputChange("subject", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción Detallada *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={6}
                    required
                    placeholder="Describa detalladamente su reclamo, incluyendo fechas, horas y cualquier información relevante..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedResolution">
                    Resolución Esperada
                  </Label>
                  <Textarea
                    id="expectedResolution"
                    value={formData.expectedResolution}
                    onChange={(e) =>
                      handleInputChange("expectedResolution", e.target.value)
                    }
                    rows={3}
                    placeholder="¿Qué resolución espera para su reclamo?"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">
                  Información Importante:
                </h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Todos los campos marcados con * son obligatorios</li>
                  <li>
                    • Proporcione información detallada para una mejor
                    resolución
                  </li>
                  <li>
                    • Recibirá un número de seguimiento por correo electrónico
                  </li>
                  <li>• Mantenemos confidencialidad de su información</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Enviando Reclamo..." : "Enviar Reclamo"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              También puede contactarnos directamente para presentar su reclamo:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Correo Electrónico
                </h4>
                <p className="text-muted-foreground">
                  <a
                    href="mailto:reclamos@myapp.com"
                    className="text-primary hover:underline"
                  >
                    reclamos@myapp.com
                  </a>
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Teléfono</h4>
                <p className="text-muted-foreground">
                  <a
                    href="tel:+1234567890"
                    className="text-primary hover:underline"
                  >
                    +1 (234) 567-890
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
