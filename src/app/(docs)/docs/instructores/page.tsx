import { Users } from "lucide-react";

export default function InstructoresDocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Users className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Mi Información</h1>
        </div>
        <p className="text-base text-muted-foreground">
          Información sobre tu perfil, categorías por disciplina y cómo se
          determinan.
        </p>
      </div>

      <div className="space-y-8">
        <section id="mi-perfil">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Mi Perfil
          </h2>
          <div className="text-sm">
            <p className="text-muted-foreground mb-4">
              Tu perfil como instructor incluye:
            </p>
            <div className="bg-card rounded-lg border border-border p-5 space-y-3">
              <ul className="list-disc list-inside space-y-2 text-xs text-muted-foreground ml-2">
                <li>
                  <strong>Nombre:</strong> Tu nombre en el sistema
                </li>
                <li>
                  <strong>Disciplinas:</strong> Las disciplinas que puedes
                  impartir
                </li>
                <li>
                  <strong>Estado:</strong> Si estás activo o inactivo
                </li>
                <li>
                  <strong>Información de contacto:</strong> Datos de contacto si
                  están registrados
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="categorias">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Categorías por Disciplina
          </h2>
          <div className="text-sm">
            <p className="text-muted-foreground mb-4">
              Tu categoría se determina automáticamente para cada disciplina
              según tu desempeño. Las categorías determinan las tarifas que
              recibes:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 rounded-md p-4 border border-slate-300">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">
                  INSTRUCTOR
                </h3>
                <p className="text-xs text-slate-700 mb-2">
                  Categoría base, sin requisitos especiales.
                </p>
                <p className="text-xs text-slate-700 font-semibold">
                  Tarifas base
                </p>
              </div>

              <div className="bg-teal-50 rounded-md p-4 border border-teal-300">
                <h3 className="font-semibold text-teal-900 mb-2 text-sm">
                  EMBAJADOR JUNIOR
                </h3>
                <p className="text-xs text-teal-800 mb-2">
                  Requiere cumplir ~60% de los requisitos de Embajador.
                </p>
                <p className="text-xs text-teal-800 font-semibold">
                  Tarifas intermedias
                </p>
              </div>

              <div className="bg-blue-50 rounded-md p-4 border border-blue-300">
                <h3 className="font-semibold text-blue-900 mb-2 text-sm">
                  EMBAJADOR
                </h3>
                <p className="text-xs text-blue-800 mb-2">
                  Requiere cumplir todos los requisitos establecidos.
                </p>
                <p className="text-xs text-blue-800 font-semibold">
                  Tarifas altas
                </p>
              </div>

              <div className="bg-purple-50 rounded-md p-4 border border-purple-300">
                <h3 className="font-semibold text-purple-900 mb-2 text-sm">
                  EMBAJADOR SENIOR
                </h3>
                <p className="text-xs text-purple-800 mb-2">
                  Máxima categoría, requiere excelencia en todas las métricas.
                </p>
                <p className="text-xs text-purple-800 font-semibold">
                  Tarifas más altas
                </p>
              </div>
            </div>

            <p className="text-muted-foreground mb-4">
              <strong>Importante:</strong> Puedes tener diferentes categorías
              para diferentes disciplinas. Por ejemplo, puedes ser EMBAJADOR en
              Rueda pero INSTRUCTOR en Barre.
            </p>
          </div>
        </section>

        <section id="como-se-determina">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Cómo se Determina tu Categoría
          </h2>
          <div className="text-sm">
            <p className="text-muted-foreground mb-4">
              El sistema evalúa automáticamente varias métricas para determinar
              tu categoría en cada disciplina:
            </p>

            <div className="bg-yellow-50 rounded-md p-4 border border-yellow-300 mb-4">
              <p className="font-semibold text-xs mb-2 text-yellow-900">
                Métricas Evaluadas:
              </p>
              <ul className="text-xs text-yellow-900 space-y-1">
                <li>
                  • <strong>Ocupación promedio:</strong> % promedio de reservas
                  vs capacidad en tus clases
                </li>
                <li>
                  • <strong>Clases por semana:</strong> Número promedio de
                  clases que impartes por semana
                </li>
                <li>
                  • <strong>Locales en Bogotá:</strong> Número de estudios
                  diferentes donde impartes
                </li>
                <li>
                  • <strong>Dobleteos:</strong> Clases consecutivas que impartes
                  (dentro de 1 hora)
                </li>
                <li>
                  • <strong>Horarios No Prime:</strong> Clases que impartes en
                  horarios no privilegiados
                </li>
                <li>
                  • <strong>Participación en Eventos:</strong> Si participaste
                  en eventos especiales
                </li>
                <li>
                  • <strong>Cumplimiento de Lineamientos:</strong> Si cumples
                  con las políticas establecidas
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-md p-4 border border-blue-300">
              <p className="font-semibold text-xs mb-2 text-blue-900">
                Categoría Automática vs Manual:
              </p>
              <ul className="text-xs text-blue-900 space-y-1">
                <li>
                  • <strong>Automática:</strong> El sistema calcula tu categoría
                  según tus métricas al final de cada período
                </li>
                <li>
                  • <strong>Manual:</strong> En algunos casos, la administración
                  puede asignar una categoría manualmente
                </li>
                <li>
                  • Puedes ver en tu detalle de pago si tu categoría fue
                  asignada automáticamente o manualmente
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="mejorar-categoria">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Cómo Mejorar tu Categoría
          </h2>
          <div className="text-sm">
            <p className="text-muted-foreground mb-4">
              Para mejorar tu categoría y recibir mejores tarifas, puedes:
            </p>
            <div className="bg-green-50 rounded-md p-4 border border-green-300">
              <ul className="list-disc list-inside space-y-2 text-sm text-green-900">
                <li>
                  <strong>Mantener alta ocupación:</strong> Procura que tus
                  clases tengan buena asistencia
                </li>
                <li>
                  <strong>Impartir más clases:</strong> Aumenta el número de
                  clases que das por semana
                </li>
                <li>
                  <strong>Diversificar estudios:</strong> Imparte clases en
                  diferentes ubicaciones
                </li>
                <li>
                  <strong>Hacer dobleteos:</strong> Clases consecutivas pueden
                  mejorar tu métrica
                </li>
                <li>
                  <strong>Horarios no prime:</strong> Aceptar horarios menos
                  populares ayuda
                </li>
                <li>
                  <strong>Participar en eventos:</strong> La participación en
                  eventos especiales es valorada
                </li>
                <li>
                  <strong>Cumplir lineamientos:</strong> Seguir todas las
                  políticas y guías establecidas
                </li>
              </ul>
            </div>

            <p className="text-muted-foreground mt-4">
              <strong>Tip:</strong> La categoría se recalcula al final de cada
              período, así que tu desempeño en un período afectará tu categoría
              y pagos del siguiente período.
            </p>
          </div>
        </section>

        <div className="bg-blue-50 border border-blue-300 rounded-lg p-5">
          <h3 className="text-base font-semibold text-blue-900 mb-3">
            💡 Información Importante
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-blue-900">
            <li>Puedes consultar tu categoría actual en la sección de Pagos</li>
            <li>
              El sistema muestra qué métricas cumpliste y cuáles no para cada
              categoría
            </li>
            <li>
              Tu categoría por disciplina puede cambiar de un período a otro
              según tu desempeño
            </li>
            <li>Las categorías más altas otorgan mejores tarifas por clase</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
