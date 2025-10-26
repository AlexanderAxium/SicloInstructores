import { pdf } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { toast } from "sonner";

export function usePDFExport() {
  const exportToPDF = async (
    component: ReactElement<DocumentProps>,
    filename: string
  ): Promise<boolean> => {
    try {
      toast.info("Generando PDF...");

      const blob = await pdf(component).toBlob();

      const timestamp = new Date().toISOString().split("T")[0];
      const fullFilename = `${filename}_${timestamp}.pdf`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fullFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF generado exitosamente");
      return true;
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast.error("Error al generar el PDF");
      return false;
    }
  };

  return { exportToPDF };
}
