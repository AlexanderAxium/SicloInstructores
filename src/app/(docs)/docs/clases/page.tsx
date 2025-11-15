import { Calendar } from "lucide-react";

export default function ClasesDocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Mis Clases</h1>
        </div>
        <p className="text-base text-muted-foreground">
          Información sobre cómo se registran tus clases y cómo esto afecta tu
          pago.
        </p>
      </div>

      <div className="space-y-8">
        <section id="informacion-clases">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Información de tus Clases
          </h2>
          <div className="text-sm">
            <p className="text-muted-foreground mb-4">
              Cada clase que impartes se registra con información importante
              para el cálculo de tu pago:
            </p>
            <div className="bg-card rounded-lg border border-border p-5 space-y-3">
              <div>
                <h4 className="font-semibold text-foreground mb-2 text-sm">
                  Información Básica
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground ml-2">
                  <li>
                    <strong>Fecha y hora:</strong> Cuándo se impartió la clase
                  </li>
                  <li>
                    <strong>Disciplina:</strong> Tipo de clase (Rueda, Barre,
                    Yoga, etc.)
                  </li>
                  <li>
                    <strong>Estudio y sala:</strong> Ubicación donde impartiste
                  </li>
                  <li>
                    <strong>Semana del período:</strong> En qué semana del
                    período se realizó
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2 text-sm">
                  Ocupación
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground ml-2">
                  <li>
                    <strong>Capacidad total:</strong> Número de lugares
                    disponibles en la sala
                  </li>
                  <li>
                    <strong>Reservas totales:</strong> Total de personas que
                    asistieron
                  </li>
                  <li>
                    <strong>Reservas pagadas:</strong> Clientes con pago
                    confirmado
                  </li>
                  <li>
                    <strong>Cortesías:</strong> Asistentes sin pago
                  </li>
                  <li>
                    <strong>Listas de espera:</strong> Personas que quedaron en
                    espera
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="ocupacion-pago">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Cómo la Ocupación Afecta tu Pago
          </h2>
          <div className="text-sm">
            <p className="text-muted-foreground mb-4">
              La ocupación de cada clase es fundamental para determinar tu pago:
            </p>
            <div className="space-y-3">
              <div className="bg-green-50 rounded-md p-4 border border-green-300">
                <h4 className="font-semibold text-green-900 mb-2 text-sm">
                  Full House (100% Ocupación)
                </h4>
                <p className="text-xs text-green-900">
                  Si la clase alcanza 100% de ocupación (reservas = capacidad),
                  se aplica una tarifa especial "Full House" que suele ser la
                  más alta.
                </p>
              </div>

              <div className="bg-blue-50 rounded-md p-4 border border-blue-300">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                  Ocupación Alta
                </h4>
                <p className="text-xs text-blue-900">
                  Con alta ocupación (ej: 80-99%), se aplica una tarifa
                  correspondiente a ese rango según la fórmula configurada.
                </p>
              </div>

              <div className="bg-yellow-50 rounded-md p-4 border border-yellow-300">
                <h4 className="font-semibold text-yellow-900 mb-2 text-sm">
                  Ocupación Media/Baja
                </h4>
                <p className="text-xs text-yellow-900">
                  Con ocupación media o baja, se aplican las tarifas
                  correspondientes. Algunas fórmulas tienen mínimo garantizado
                  que protege tu pago incluso con baja ocupación.
                </p>
              </div>
            </div>

            <div className="bg-slate-100 rounded-md p-4 mt-4 border border-slate-300">
              <p className="font-semibold text-sm mb-2 text-slate-900">
                Ejemplo de Cálculo:
              </p>
              <div className="text-xs text-slate-700 space-y-1 font-mono">
                <p>
                  • Clase con 45 reservas de 50 lugares disponibles (90%
                  ocupación)
                </p>
                <p>• Categoría: AMBASSADOR</p>
                <p>• Base fija: COP 75,000 (cubre hasta 10 reservas)</p>
                <p>• Reservas adicionales: 12 → tramo de COP 4,000</p>
                <p>• Variable: 12 × COP 4,000 = COP 48,000</p>
                <p>
                  •{" "}
                  <span className="text-slate-900 font-semibold">
                    Total por esta clase: COP 123,000
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="clases-versus">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Clases Versus
          </h2>
          <div className="text-sm">
            <p className="text-muted-foreground mb-4">
              Las clases versus son clases impartidas por múltiples instructores
              al mismo tiempo:
            </p>
            <div className="bg-purple-50 rounded-md p-4 border border-purple-300">
              <ul className="list-disc list-inside space-y-2 text-sm text-purple-900">
                <li>
                  El pago de la clase se divide entre todos los instructores
                  participantes
                </li>
                <li>
                  Ejemplo: Si participas en una clase versus con 2 instructores,
                  recibirás la mitad del pago calculado
                </li>
                <li>
                  Cada instructor participante recibe crédito por la clase
                </li>
                <li>
                  Se calcula primero el pago completo y luego se divide entre
                  los instructores
                </li>
              </ul>
            </div>

            <div className="bg-slate-100 rounded-md p-4 mt-4 border border-slate-300">
              <p className="font-semibold text-sm mb-2 text-slate-900">
                Ejemplo:
              </p>
              <div className="text-xs text-slate-700 space-y-1 font-mono">
                <p>• Clase versus con 2 instructores</p>
                <p>• Pago calculado para la clase: COP 200,000</p>
                <p>• Pago por instructor: COP 200,000 ÷ 2 = COP 100,000</p>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-blue-50 border border-blue-300 rounded-lg p-5">
          <h3 className="text-base font-semibold text-blue-900 mb-3">
            💡 Información Importante
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-blue-900">
            <li>Todas tus clases se registran automáticamente en el sistema</li>
            <li>
              Puedes consultar el detalle de cada clase en la sección de Pagos
            </li>
            <li>La ocupación se registra después de cada clase</li>
            <li>
              Tu categoría y la ocupación determinan la tarifa que recibes por
              cada clase
            </li>
            <li>
              Mantener alta ocupación en tus clases puede mejorar tu categoría y
              aumentarte las tarifas
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
