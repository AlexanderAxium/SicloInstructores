import { FileSpreadsheet, Info } from "lucide-react";

export default function ImportacionDocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <FileSpreadsheet className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Importación Masiva
          </h1>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-300 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Info className="h-6 w-6 text-blue-700 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Función Administrativa
            </h3>
            <p className="text-sm text-blue-900 mb-3">
              La importación masiva de clases desde Excel es una función que
              solo los administradores pueden utilizar para cargar múltiples
              clases al sistema.
            </p>
            <p className="text-sm text-blue-900">
              Como instructor, tus clases se registran automáticamente en el
              sistema. No necesitas importar datos. Si notas alguna
              inconsistencia en tus clases registradas, contacta con la
              administración.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
