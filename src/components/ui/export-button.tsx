"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Download, FileSpreadsheet, FileText } from "lucide-react";

interface ExportButtonProps {
  formats: Array<"pdf" | "excel">;
  onExportPDF?: () => void | Promise<void>;
  onExportExcel?: () => void | Promise<void>;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export function ExportButton({
  formats,
  onExportPDF,
  onExportExcel,
  disabled = false,
  label = "Exportar",
  size = "sm",
  variant = "outline",
}: ExportButtonProps) {
  // Si solo hay un formato, mostrar botón simple
  if (formats.length === 1) {
    const format = formats[0];
    const handler = format === "pdf" ? onExportPDF : onExportExcel;
    const Icon = format === "pdf" ? FileText : FileSpreadsheet;

    return (
      <Button
        variant={variant}
        size={size}
        onClick={handler}
        disabled={disabled}
        className="flex items-center gap-2"
      >
        <Icon className="h-4 w-4" />
        {label}
      </Button>
    );
  }

  // Si hay múltiples formatos, mostrar dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {label}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.includes("pdf") && onExportPDF && (
          <DropdownMenuItem onClick={onExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Exportar a PDF
          </DropdownMenuItem>
        )}
        {formats.includes("excel") && onExportExcel && (
          <DropdownMenuItem onClick={onExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar a Excel
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
