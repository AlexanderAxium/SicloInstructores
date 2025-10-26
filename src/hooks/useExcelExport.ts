import { toast } from "sonner";
import * as XLSX from "xlsx";

export function useExcelExport() {
  const exportToExcel = <T extends Record<string, unknown>>(
    data: T[],
    filename: string,
    sheetName = "Sheet1",
    options?: {
      columnWidths?: number[];
      headers?: string[];
    }
  ) => {
    try {
      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();

      // Apply column widths if provided
      if (options?.columnWidths) {
        worksheet["!cols"] = options.columnWidths.map((width) => ({
          wch: width,
        }));
      }

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const fullFilename = `${filename}_${timestamp}.xlsx`;

      // Export file
      XLSX.writeFile(workbook, fullFilename);

      toast.success("Archivo Excel exportado exitosamente");
      return true;
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Error al exportar a Excel");
      return false;
    }
  };

  const exportMultipleSheets = <T extends Record<string, unknown>>(
    sheets: Array<{
      data: T[];
      sheetName: string;
      columnWidths?: number[];
    }>,
    filename: string
  ) => {
    try {
      const workbook = XLSX.utils.book_new();

      sheets.forEach(({ data, sheetName, columnWidths }) => {
        const worksheet = XLSX.utils.json_to_sheet(data);

        if (columnWidths) {
          worksheet["!cols"] = columnWidths.map((width) => ({
            wch: width,
          }));
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });

      const timestamp = new Date().toISOString().split("T")[0];
      const fullFilename = `${filename}_${timestamp}.xlsx`;

      XLSX.writeFile(workbook, fullFilename);

      toast.success("Archivo Excel exportado exitosamente");
      return true;
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Error al exportar a Excel");
      return false;
    }
  };

  return { exportToExcel, exportMultipleSheets };
}
