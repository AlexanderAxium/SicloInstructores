"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { Building2, Calendar, Globe, Mail, MapPin, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TenantInfo() {
  const router = useRouter();

  // Fetch tenant information
  const { data: tenant, isLoading } = trpc.companyInfo.get.useQuery();

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-muted rounded-lg">
              <div className="h-5 w-5 bg-muted rounded" />
            </div>
            <div className="flex-1">
              <div className="h-5 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-5/6" />
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-3 bg-muted rounded w-4/5" />
              <div className="h-3 bg-muted rounded w-3/5" />
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
        <div className="text-center">
          <div className="p-3 bg-muted rounded-lg w-fit mx-auto mb-4">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Información de la Empresa
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            No se encontró información de la empresa
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard/settings")}
            className="text-sm text-primary hover:text-primary/80 font-medium bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-md transition-colors"
          >
            Configurar información
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {tenant.displayName || tenant.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Información de la empresa
            </p>
          </div>
        </div>
        <Button
          variant="edit"
          size="sm"
          onClick={() => router.push("/dashboard/settings")}
        >
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Description */}
        {tenant.description && (
          <div className="lg:col-span-2 xl:col-span-1">
            <h4 className="text-sm font-medium text-foreground mb-3">
              Descripción
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {tenant.description}
            </p>
          </div>
        )}

        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">
            Información de Contacto
          </h4>
          <div className="space-y-3">
            {tenant.email && (
              <div className="flex items-start space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="text-sm font-medium text-foreground">
                    {tenant.email}
                  </p>
                </div>
              </div>
            )}

            {tenant.phone && (
              <div className="flex items-start space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Teléfono</p>
                  <p className="text-sm font-medium text-foreground">
                    {tenant.phone}
                  </p>
                </div>
              </div>
            )}

            {tenant.website && (
              <div className="flex items-start space-x-3">
                <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">
                    Sitio Web
                  </p>
                  <a
                    href={tenant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:text-primary/80"
                  >
                    {tenant.website}
                  </a>
                </div>
              </div>
            )}

            {tenant.foundedYear && (
              <div className="flex items-start space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">
                    Año de Fundación
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {tenant.foundedYear}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Address & Social Media */}
        <div className="space-y-4">
          {/* Address */}
          {(tenant.address || tenant.city || tenant.country) && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">
                Dirección
              </h4>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    {[tenant.address, tenant.city, tenant.country]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Social Media Links */}
          {(tenant.facebookUrl ||
            tenant.twitterUrl ||
            tenant.instagramUrl ||
            tenant.linkedinUrl ||
            tenant.youtubeUrl) && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">
                Redes Sociales
              </h4>
              <div className="flex flex-wrap gap-2">
                {tenant.facebookUrl && (
                  <a
                    href={tenant.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    Facebook
                  </a>
                )}
                {tenant.twitterUrl && (
                  <a
                    href={tenant.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
                  >
                    Twitter
                  </a>
                )}
                {tenant.instagramUrl && (
                  <a
                    href={tenant.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors"
                  >
                    Instagram
                  </a>
                )}
                {tenant.linkedinUrl && (
                  <a
                    href={tenant.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    LinkedIn
                  </a>
                )}
                {tenant.youtubeUrl && (
                  <a
                    href={tenant.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    YouTube
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
