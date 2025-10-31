import { Info, Settings } from "lucide-react";

export default function ConfiguracionDocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Settings className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Configuración del Sistema
          </h1>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-300 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Info className="h-6 w-6 text-blue-700 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Información para Administradores
            </h3>
            <p className="text-sm text-blue-900 mb-3">
              Esta sección contiene información sobre la configuración del
              sistema (períodos, disciplinas, fórmulas de pago) que es
              gestionada únicamente por los administradores.
            </p>
            <p className="text-sm text-blue-900">
              Como instructor, no necesitas gestionar esta información. Si
              tienes preguntas sobre períodos, disciplinas o fórmulas de pago,
              contacta con la administración.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
