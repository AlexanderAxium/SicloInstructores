import { Badge } from "@/components/ui/badge";
// components/penalizacion-cover-tab.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  BrandingWithRelations,
  ClassWithRelations,
  InstructorPaymentFromAPI,
  PenaltyFromAPI,
  ThemeRideWithRelations,
  WorkshopWithRelations,
} from "@/types";
import {
  AlertTriangle,
  Award,
  CalendarCheck,
  GraduationCap,
  Users,
  Zap,
} from "lucide-react";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(amount);
};

// Using existing types from @types/ directory
type PenaltyDetail = PenaltyFromAPI & {
  disciplina: string;
};

type BrandingDetail = BrandingWithRelations;

type ThemeRideDetail = ThemeRideWithRelations;

type WorkshopDetail = WorkshopWithRelations;

type VersusClassDetail = ClassWithRelations & {
  vsNum: number;
};

interface PaymentDetails {
  penalizaciones?: {
    montoDescuento?: number;
    descuento?: number;
    puntos?: number;
    maxPermitidos?: number;
    excedentes?: number;
    detalle?: PenaltyDetail[];
  };
  covers?: {
    bonoTotal?: number;
    coversConBono?: number;
    coversConFullHouse?: number;
  };
  brandeos?: {
    bonoTotal?: number;
    totalBrandeos?: number;
    brandeos?: BrandingDetail[];
  };
  themeRides?: {
    bonoTotal?: number;
    totalThemeRides?: number;
    themeRides?: ThemeRideDetail[];
  };
  workshops?: {
    bonoTotal?: number;
    totalWorkshops?: number;
    workshops?: WorkshopDetail[];
  };
  versus?: {
    bonoTotal?: number;
    totalClasesVersus?: number;
    clasesVersus?: VersusClassDetail[];
  };
  [key: string]: unknown;
}

interface PenalizacionesCoversTabProps {
  details: PaymentDetails;
  payment: InstructorPaymentFromAPI;
}

export function PenalizacionesCoversTab({
  details,
  payment,
}: PenalizacionesCoversTabProps) {
  // Penalty data
  const totalPenalty =
    payment?.penalty || details?.penalizaciones?.montoDescuento || 0;
  const penaltyPercentage = details?.penalizaciones?.descuento || 0;
  const penaltyPoints = details?.penalizaciones?.puntos || 0;
  const maxAllowedPoints = details?.penalizaciones?.maxPermitidos || 0;
  const excessPoints = details?.penalizaciones?.excedentes || 0;
  const penaltyDetails = details?.penalizaciones?.detalle || [];

  // Cover data
  const totalCover = payment?.cover || details?.covers?.bonoTotal || 0;
  const totalCovers = details?.covers?.coversConBono || 0;

  // Branding data
  const totalBranding = payment?.branding || details?.brandeos?.bonoTotal || 0;
  const totalBrandings = details?.brandeos?.totalBrandeos || 0;
  const instructorBrandings = details?.brandeos?.brandeos || [];

  // Theme rides data
  const totalThemeRide =
    payment?.themeRide || details?.themeRides?.bonoTotal || 0;
  const totalThemeRides = details?.themeRides?.totalThemeRides || 0;
  const instructorThemeRides = details?.themeRides?.themeRides || [];

  // Workshops data
  const totalWorkshop = payment?.workshop || details?.workshops?.bonoTotal || 0;
  const totalWorkshops = details?.workshops?.totalWorkshops || 0;
  const instructorWorkshops = details?.workshops?.workshops || [];

  // Versus data
  const totalVersus = payment?.versusBonus || details?.versus?.bonoTotal || 0;
  const totalVersusClasses = details?.versus?.totalClasesVersus || 0;
  const instructorVersusClasses = details?.versus?.clasesVersus || [];

  return (
    <div className="space-y-4 px-2 sm:px-0">
      {/* Tarjeta de Penalizaciones */}
      <Card className="border border-border rounded-lg shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border px-4 sm:px-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
            <CardTitle className="text-sm sm:text-base font-medium">
              Penalizaciones aplicadas
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 text-xs sm:text-xs"
          >
            {penaltyPoints} puntos
          </Badge>
        </CardHeader>
        <CardContent className="pt-3 px-4 sm:px-6">
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Puntos acumulados:</span>
              <span className="font-medium">{penaltyPoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Límite permitido:</span>
              <span className="font-medium">{maxAllowedPoints}</span>
            </div>
            {excessPoints > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Puntos excedentes:
                </span>
                <span className="font-medium text-rose-600">
                  {excessPoints}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Descuento aplicado:</span>
              <span className="font-medium text-rose-600">
                {penaltyPercentage}%
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="font-medium">Total descuento:</span>
              <span className="font-bold text-rose-600">
                -{formatCurrency(totalPenalty)}
              </span>
            </div>

            {/* Penalty Details */}
            {penaltyDetails.length > 0 && (
              <div className="mt-3">
                <h4 className="text-xs sm:text-xs font-medium mb-1 text-muted-foreground">
                  Detalles:
                </h4>
                <div className="space-y-2">
                  {penaltyDetails.map((pen: PenaltyDetail, index: number) => (
                    <div
                      key={`penalty-${pen.type}-${pen.appliedAt}-${index}`}
                      className="text-2xs sm:text-xs border border-border rounded p-2"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {pen.type.replace(/_/g, " ")}
                        </span>
                        <span className="text-rose-600">-{pen.points} pts</span>
                      </div>
                      {pen.description &&
                        pen.description !== "Sin descripción" && (
                          <div className="text-muted-foreground mt-1">
                            Motivo: {pen.description}
                          </div>
                        )}
                      <div className="text-muted-foreground mt-1">
                        {new Date(pen.appliedAt).toLocaleDateString()} •{" "}
                        {pen.disciplina}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tarjeta de Covers */}
      <Card className="border border-border rounded-lg shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border px-4 sm:px-6">
          <div className="flex items-center space-x-2">
            <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
            <CardTitle className="text-sm sm:text-base font-medium">
              Covers realizados
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 text-xs sm:text-xs"
          >
            {totalCovers} covers
          </Badge>
        </CardHeader>
        <CardContent className="pt-3 px-4 sm:px-6">
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total de covers:</span>
              <span className="font-medium">{totalCovers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pago por cover:</span>
              <span className="font-medium">{formatCurrency(80)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="font-medium">Total a recibir:</span>
              <span className="font-bold text-emerald-600">
                +{formatCurrency(totalCover)}
              </span>
            </div>

            {/* Cover Details */}
            {totalCovers > 0 && (
              <div className="mt-3">
                <h4 className="text-2xs sm:text-xs font-medium mb-1 text-muted-foreground">
                  Resumen:
                </h4>
                <div className="text-2xs sm:text-xs border border-border rounded p-2">
                  <div className="flex justify-between font-medium">
                    <span>Covers con bono:</span>
                    <span className="text-emerald-600">
                      {totalCovers} covers
                    </span>
                  </div>
                  <div className="mt-1">
                    <div>Total a recibir: {formatCurrency(totalCover)}</div>
                    {details?.covers?.coversConFullHouse &&
                      details.covers.coversConFullHouse > 0 && (
                        <div>
                          Covers con full house:{" "}
                          {details.covers.coversConFullHouse}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Branding Card */}
      {totalBranding > 0 && (
        <Card className="border border-border rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border px-4 sm:px-6">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
              <CardTitle className="text-sm sm:text-base font-medium">
                Brandeos realizados
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 text-xs sm:text-xs"
            >
              {totalBrandings} brandeos
            </Badge>
          </CardHeader>
          <CardContent className="pt-3 px-4 sm:px-6">
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Total de brandeos:
                </span>
                <span className="font-medium">{totalBrandings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pago por brandeo:</span>
                <span className="font-medium">{formatCurrency(15)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-medium">Total a recibir:</span>
                <span className="font-bold text-emerald-600">
                  +{formatCurrency(totalBranding)}
                </span>
              </div>

              {/* Branding Details */}
              {instructorBrandings.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-2xs sm:text-xs font-medium mb-1 text-muted-foreground">
                    Detalles:
                  </h4>
                  <div className="space-y-2">
                    {instructorBrandings.map(
                      (brandeo: BrandingDetail, index: number) => (
                        <div
                          key={`branding-${brandeo.id}-${brandeo.createdAt}-${index}`}
                          className="text-2xs sm:text-xs border border-border rounded p-2"
                        >
                          <div className="flex justify-between font-medium">
                            <span>Brandeo #{brandeo.number}</span>
                            <span className="text-emerald-600">
                              +{formatCurrency(15)}
                            </span>
                          </div>
                          <div className="mt-1 space-y-1">
                            <div>
                              Fecha:{" "}
                              {new Date(brandeo.createdAt).toLocaleDateString()}
                            </div>
                            {brandeo.comments && (
                              <div className="text-muted-foreground mt-1">
                                <span className="font-medium">
                                  Comentarios:
                                </span>{" "}
                                {brandeo.comments}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Theme Rides Card */}
      {totalThemeRide > 0 && (
        <Card className="border border-border rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border px-4 sm:px-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <CardTitle className="text-sm sm:text-base font-medium">
                Theme Rides realizados
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 text-xs sm:text-xs"
            >
              {totalThemeRides} theme rides
            </Badge>
          </CardHeader>
          <CardContent className="pt-3 px-4 sm:px-6">
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Total de theme rides:
                </span>
                <span className="font-medium">{totalThemeRides}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Pago por theme ride:
                </span>
                <span className="font-medium">{formatCurrency(30)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-medium">Total a recibir:</span>
                <span className="font-bold text-emerald-600">
                  +{formatCurrency(totalThemeRide)}
                </span>
              </div>

              {/* Theme Rides Details */}
              {instructorThemeRides.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-2xs sm:text-xs font-medium mb-1 text-muted-foreground">
                    Detalles:
                  </h4>
                  <div className="space-y-2">
                    {instructorThemeRides.map(
                      (themeRide: ThemeRideDetail, index: number) => (
                        <div
                          key={`theme-ride-${themeRide.id}-${themeRide.createdAt}-${index}`}
                          className="text-2xs sm:text-xs border border-border rounded p-2"
                        >
                          <div className="flex justify-between font-medium">
                            <span>Theme Ride #{themeRide.number}</span>
                            <span className="text-emerald-600">
                              +{formatCurrency(30)}
                            </span>
                          </div>
                          <div className="mt-1 space-y-1">
                            <div>
                              Fecha:{" "}
                              {new Date(
                                themeRide.createdAt
                              ).toLocaleDateString()}
                            </div>
                            {themeRide.comments && (
                              <div className="text-muted-foreground mt-1">
                                <span className="font-medium">
                                  Comentarios:
                                </span>{" "}
                                {themeRide.comments}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workshops Card */}
      {totalWorkshop > 0 && (
        <Card className="border border-border rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border px-4 sm:px-6">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              <CardTitle className="text-sm sm:text-base font-medium">
                Workshops realizados
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-700 text-xs sm:text-xs"
            >
              {totalWorkshops} workshops
            </Badge>
          </CardHeader>
          <CardContent className="pt-3 px-4 sm:px-6">
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Total de workshops:
                </span>
                <span className="font-medium">{totalWorkshops}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-medium">Total a recibir:</span>
                <span className="font-bold text-emerald-600">
                  +{formatCurrency(totalWorkshop)}
                </span>
              </div>

              {/* Workshops Details */}
              {instructorWorkshops.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-2xs sm:text-xs font-medium mb-1 text-muted-foreground">
                    Detalles:
                  </h4>
                  <div className="space-y-2">
                    {instructorWorkshops.map(
                      (workshop: WorkshopDetail, index: number) => (
                        <div
                          key={`workshop-${workshop.id}-${workshop.date}-${index}`}
                          className="text-2xs sm:text-xs border border-border rounded p-2"
                        >
                          <div className="flex justify-between font-medium">
                            <span>{workshop.name}</span>
                            <span className="text-emerald-600">
                              +{formatCurrency(workshop.payment)}
                            </span>
                          </div>
                          <div className="mt-1 space-y-1">
                            <div>
                              Fecha:{" "}
                              {new Date(workshop.date).toLocaleDateString()}
                            </div>
                            {workshop.comments && (
                              <div className="text-muted-foreground mt-1">
                                <span className="font-medium">
                                  Comentarios:
                                </span>{" "}
                                {workshop.comments}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Versus Card */}
      {totalVersus > 0 && (
        <Card className="border border-border rounded-lg shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border px-4 sm:px-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
              <CardTitle className="text-sm sm:text-base font-medium">
                Clases Versus realizadas
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className="bg-indigo-50 text-indigo-700 text-xs sm:text-xs"
            >
              {totalVersusClasses} clases
            </Badge>
          </CardHeader>
          <CardContent className="pt-3 px-4 sm:px-6">
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Total de clases versus:
                </span>
                <span className="font-medium">{totalVersusClasses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Pago por clase versus:
                </span>
                <span className="font-medium">{formatCurrency(30)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-medium">Total a recibir:</span>
                <span className="font-bold text-emerald-600">
                  +{formatCurrency(totalVersus)}
                </span>
              </div>

              {/* Versus Classes Details */}
              {instructorVersusClasses.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-2xs sm:text-xs font-medium mb-1 text-muted-foreground">
                    Detalles:
                  </h4>
                  <div className="space-y-2">
                    {instructorVersusClasses.map(
                      (clase: VersusClassDetail, index: number) => (
                        <div
                          key={`versus-${clase.id}-${clase.date}-${index}`}
                          className="text-2xs sm:text-xs border border-border rounded p-2"
                        >
                          <div className="flex justify-between font-medium">
                            <span>Clase #{clase.id}</span>
                            <span className="text-emerald-600">
                              +{formatCurrency(30)}
                            </span>
                          </div>
                          <div className="mt-1 space-y-1">
                            <div>
                              Fecha: {new Date(clase.date).toLocaleDateString()}
                            </div>
                            <div>Disciplina: {clase.discipline?.name}</div>
                            <div>Instructores: {clase.vsNum}</div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
