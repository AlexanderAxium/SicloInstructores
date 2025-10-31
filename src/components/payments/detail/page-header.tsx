"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { InstructorFromAPI, PeriodFromAPI } from "@/types/instructor";
import type { InstructorPaymentFromAPI } from "@/types/payments";
import {
  ArrowLeft,
  Calculator,
  ChevronDown,
  Download,
  FileText,
  Loader2,
  Printer,
} from "lucide-react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface PageHeaderProps {
  instructor: InstructorFromAPI;
  period: PeriodFromAPI;
  payment: InstructorPaymentFromAPI;
  handleExportPDF: () => void;
  handlePrint: () => void;
  handleStatusChange: (status: string) => void;
  handleRecalculate?: () => void;
  isChangingStatus?: boolean;
  isRecalculating?: boolean;
  router: AppRouterInstance;
}

export function PageHeader({
  instructor,
  period,
  payment,
  handleExportPDF,
  handlePrint,
  handleStatusChange,
  handleRecalculate,
  isChangingStatus = false,
  isRecalculating = false,
  router,
}: PageHeaderProps) {
  // Status mapping with Spanish translations and colors
  const statusMap = {
    PENDING: {
      label: "Pendiente",
      color: "bg-yellow-500/15 text-yellow-500 border-yellow-500",
    },
    APPROVED: {
      label: "Aprobado",
      color: "bg-blue-500/15 text-blue-500 border-blue-500",
    },
    PAID: {
      label: "Pagado",
      color: "bg-green-500/15 text-green-500 border-green-500",
    },
    CANCELLED: {
      label: "Cancelado",
      color: "bg-red-500/15 text-red-500 border-red-500",
    },
  };

  const currentStatus =
    statusMap[payment.status as keyof typeof statusMap] || statusMap.PENDING;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card rounded-lg p-3 sm:p-4 shadow-sm border border-border">
      {/* Left section - Back button and info */}
      <div className="flex items-start gap-2 sm:gap-3 w-full sm:w-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/dashboard/pagos")}
          className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 bg-card border border-border hover:bg-muted/10 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
            Detalle de Pago
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
            <div className="flex items-center gap-1">
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {instructor.name} -{" "}
                {period ? `P${period.number} ${period.year}` : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right section - Actions */}
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end sm:justify-normal mt-2 sm:mt-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isChangingStatus}>
            <Button
              size="sm"
              className={`h-7 sm:h-8 px-2 sm:px-3 text-xs border ${currentStatus.color}`}
            >
              {isChangingStatus ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                  <span className="text-xs">Actualizando...</span>
                </>
              ) : (
                <>
                  <span className="text-xs">{currentStatus.label}</span>
                  <ChevronDown className="ml-1.5 h-3 w-3" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="bg-card border border-border w-40"
          >
            {Object.entries(statusMap).map(([status, config]) => (
              <DropdownMenuItem
                key={status}
                className="cursor-pointer text-xs sm:text-sm hover:bg-muted/10"
                onClick={() => handleStatusChange(status)}
              >
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${config.color.split(" ")[0]}`}
                />
                {config.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Recalculate Button */}
        {handleRecalculate && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="h-7 sm:h-8 px-2 sm:px-3 text-xs bg-card border border-border hover:bg-muted/10"
          >
            {isRecalculating ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                <span className="text-xs">Recalculando...</span>
              </>
            ) : (
              <>
                <Calculator className="mr-1.5 h-3 w-3" />
                <span className="text-xs">Recalcular</span>
              </>
            )}
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 sm:h-8 px-2 sm:px-3 text-xs bg-card border border-border hover:bg-muted/10"
            >
              <Download className="mr-1.5 h-3 w-3" />
              <span className="text-xs">Exportar</span>
              <ChevronDown className="ml-1.5 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="bg-card border border-border w-48"
          >
            <DropdownMenuItem
              className="cursor-pointer text-xs sm:text-sm hover:bg-muted/10"
              onClick={handleExportPDF}
            >
              <FileText className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Exportar a PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-xs sm:text-sm hover:bg-muted/10"
              onClick={handlePrint}
            >
              <Printer className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Imprimir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
