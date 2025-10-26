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
  ChevronDown,
  Download,
  FileText,
  Printer,
} from "lucide-react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface PageHeaderProps {
  instructor: InstructorFromAPI;
  period: PeriodFromAPI;
  payment: InstructorPaymentFromAPI;
  getStatusColor: (status: string) => string;
  togglePaymentStatus: () => void;
  handleExportPDF: () => void;
  handlePrint: () => void;
  router: AppRouterInstance;
}

export function PageHeader({
  instructor,
  period,
  payment,
  getStatusColor,
  togglePaymentStatus,
  handleExportPDF,
  handlePrint,
  router,
}: PageHeaderProps) {
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
            <Badge
              variant="outline"
              className={`text-xs sm:text-sm font-medium ${getStatusColor(payment.status)} w-max`}
            >
              {payment.status === "PAID" ? "APROBADO" : "PENDIENTE"}
            </Badge>

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
        <Button
          variant="outline"
          size="sm"
          onClick={togglePaymentStatus}
          className="h-8 sm:h-9 text-xs sm:text-sm bg-card border border-border hover:bg-muted/10"
        >
          {payment.status === "PENDING" ? "Aprobar" : "Marcar Pendiente"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 sm:h-9 text-xs sm:text-sm bg-card border border-border hover:bg-muted/10"
            >
              <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="sm:inline">Exportar</span>
              <ChevronDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
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
