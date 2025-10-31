import {
  AlertCircle,
  Calculator,
  DollarSign,
  FileText,
  TrendingUp,
} from "lucide-react";

export default function PagosDocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <DollarSign className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Cálculo de Pagos
          </h1>
        </div>
        <p className="text-base text-muted-foreground">
          Sistema automático de cálculo de pagos con bonos, penalizaciones y
          retención.
        </p>
      </div>

      <div className="space-y-8">
        {/* Sección: Cómo Funciona el Cálculo */}
        <section
          id="como-funciona"
          className="bg-card rounded-lg border border-border p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">
              Cómo Funciona el Cálculo
            </h2>
          </div>

          <div className="space-y-6 text-sm">
            <p className="text-muted-foreground">
              El sistema calcula automáticamente el pago de cada instructor
              siguiendo una fórmula precisa que considera múltiples factores. El
              proceso es el siguiente:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  1. Cálculo del Monto Base por Clases
                </h3>
                <p className="text-muted-foreground mb-3">
                  Para cada clase impartida, el sistema:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                  <li>
                    <strong>Determina la categoría del instructor</strong> según
                    su desempeño en esa disciplina
                  </li>
                  <li>
                    <strong>Evalúa la ocupación</strong> de la clase (reservas
                    vs capacidad total)
                  </li>
                  <li>
                    <strong>Aplica la tarifa correspondiente</strong> según la
                    fórmula configurada para esa categoría
                  </li>
                  <li>
                    <strong>Verifica condiciones especiales:</strong> Full
                    House, mínimo garantizado, máximo permitido, cuota fija
                  </li>
                </ul>

                <div className="bg-slate-100 rounded-md p-4 mt-3 border border-slate-300">
                  <p className="font-semibold text-sm mb-2 text-slate-900">
                    Ejemplo de Cálculo por Clase:
                  </p>
                  <div className="text-xs text-slate-700 space-y-1 font-mono">
                    <p>
                      • Categoría:{" "}
                      <span className="text-slate-900 font-semibold">
                        AMBASSADOR
                      </span>
                    </p>
                    <p>• Clase: 45 reservas / 50 spots (90% ocupación)</p>
                    <p>• Tarifa según fórmula: S/. 2.50 por reserva</p>
                    <p>• Cálculo: 45 reservas × S/. 2.50 = S/. 112.50</p>
                    <p>• Cuota fija adicional (si aplica): + S/. 20.00</p>
                    <p>
                      •{" "}
                      <span className="text-slate-900 font-semibold">
                        Total por clase: S/. 132.50
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-md p-4 mt-3 border border-blue-300">
                  <p className="font-semibold text-xs mb-2 text-blue-900">
                    Casos Especiales:
                  </p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>
                      <strong>Full House:</strong> Si la clase alcanza 100%
                      ocupación, aplica tarifa especial "Full House"
                    </li>
                    <li>
                      <strong>Clases Versus:</strong> El pago se divide entre el
                      número de instructores (ej: 2 instructores = pago/2)
                    </li>
                    <li>
                      <strong>Mínimo Garantizado:</strong> Si el cálculo es
                      menor, se aplica el mínimo establecido
                    </li>
                    <li>
                      <strong>Máximo Permitido:</strong> Si el cálculo excede el
                      máximo, se limita al tope
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  2. Cálculo de Bonos Adicionales
                </h3>
                <p className="text-muted-foreground mb-3">
                  Los bonos se suman al monto base:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-md p-3 border border-slate-300">
                    <p className="font-semibold text-xs text-slate-900 mb-1">
                      Covers (Reemplazos)
                    </p>
                    <p className="text-xs text-slate-700">
                      S/. 30.00 por cada cover con bono activado
                    </p>
                    <p className="text-xs text-slate-700 mt-1">
                      Ejemplo: 3 covers = S/. 90.00
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-md p-3 border border-slate-300">
                    <p className="font-semibold text-xs text-slate-900 mb-1">
                      Brandings
                    </p>
                    <p className="text-xs text-slate-700">
                      S/. 50.00 por cada branding
                    </p>
                    <p className="text-xs text-slate-700 mt-1">
                      Ejemplo: 2 brandings = S/. 100.00
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-md p-3 border border-slate-300">
                    <p className="font-semibold text-xs text-slate-900 mb-1">
                      Theme Rides
                    </p>
                    <p className="text-xs text-slate-700">
                      S/. 40.00 por cada theme ride
                    </p>
                    <p className="text-xs text-slate-700 mt-1">
                      Ejemplo: 1 theme ride = S/. 40.00
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-md p-3 border border-slate-300">
                    <p className="font-semibold text-xs text-slate-900 mb-1">
                      Workshops
                    </p>
                    <p className="text-xs text-slate-700">
                      Monto variable configurado por workshop
                    </p>
                    <p className="text-xs text-slate-700 mt-1">
                      Ejemplo: 1 workshop a S/. 150.00
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-md p-3 mt-3 border border-green-300">
                  <p className="font-semibold text-xs text-green-900 mb-1">
                    Ejemplo Total de Bonos:
                  </p>
                  <div className="text-xs text-green-800 font-mono">
                    <p>Covers: S/. 90.00</p>
                    <p>Brandings: S/. 100.00</p>
                    <p>Theme Rides: S/. 40.00</p>
                    <p>Workshops: S/. 150.00</p>
                    <p className="text-foreground font-semibold mt-1">
                      Total Bonos: S/. 380.00
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  3. Cálculo de Penalizaciones
                </h3>
                <p className="text-muted-foreground mb-3">
                  Las penalizaciones se calculan según puntos acumulados:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                  <li>
                    Cada punto de penalización por encima de 10 puntos genera un
                    2% de descuento
                  </li>
                  <li>El descuento máximo por penalizaciones es del 10%</li>
                  <li>Los puntos inferiores a 10 no generan descuento</li>
                </ul>

                <div className="bg-slate-100 rounded-md p-4 mt-3 border border-slate-300">
                  <p className="font-semibold text-sm mb-2 text-slate-900">
                    Ejemplo de Cálculo de Penalizaciones:
                  </p>
                  <div className="text-xs text-slate-700 space-y-1 font-mono">
                    <p>
                      • Puntos totales acumulados:{" "}
                      <span className="text-slate-900 font-semibold">
                        15 puntos
                      </span>
                    </p>
                    <p>• Puntos permitidos: 10 puntos</p>
                    <p>• Puntos excedentes: 15 - 10 = 5 puntos</p>
                    <p>
                      • Porcentaje de descuento: 5 × 2% = 10% (máximo alcanzado)
                    </p>
                    <p>• Monto base antes de penalización: S/. 1,500.00</p>
                    <p>
                      • Descuento: S/. 1,500.00 × 10% ={" "}
                      <span className="text-red-700 font-semibold">
                        S/. 150.00
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  4. Cálculo de Retención
                </h3>
                <p className="text-muted-foreground mb-3">
                  La retención se calcula sobre el subtotal (monto base + bonos
                  - penalizaciones + ajustes):
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                  <li>
                    La retención es del <strong>8%</strong> (RETENTION_VALUE =
                    0.08)
                  </li>
                  <li>
                    Se calcula después de sumar bonos y restar penalizaciones
                  </li>
                  <li>
                    Si hay un ajuste (reajuste), también se incluye en el
                    cálculo de retención
                  </li>
                </ul>

                <div className="bg-slate-100 rounded-md p-4 mt-3 border border-slate-300">
                  <p className="font-semibold text-sm mb-2 text-slate-900">
                    Ejemplo de Cálculo de Retención:
                  </p>
                  <div className="text-xs text-slate-700 space-y-1 font-mono">
                    <p>• Monto base: S/. 1,500.00</p>
                    <p>• Bonos totales: + S/. 380.00</p>
                    <p>• Penalizaciones: - S/. 150.00</p>
                    <p>• Ajuste (reajuste): + S/. 100.00</p>
                    <p>• Subtotal antes de retención: S/. 1,830.00</p>
                    <p>
                      • Retención (8%): S/. 1,830.00 × 0.08 ={" "}
                      <span className="text-red-700 font-semibold">
                        S/. 146.40
                      </span>
                    </p>
                    <p>
                      •{" "}
                      <span className="text-slate-900 font-semibold">
                        Pago Final: S/. 1,683.60
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  5. Fórmula Final Completa
                </h3>
                <div className="bg-slate-100 rounded-md p-4 border border-slate-300">
                  <p className="text-xs font-mono text-slate-700 mb-3">
                    <span className="text-slate-900 font-semibold">
                      Pago Final
                    </span>{" "}
                    = (Monto Base por Clases) + (Bonos: Covers + Brandings +
                    Theme Rides + Workshops) - (Penalizaciones) +
                    (Ajustes/Reajustes) - (Retención del 8% sobre el subtotal)
                  </p>

                  <div className="bg-white rounded p-3 mt-3 border border-slate-300">
                    <p className="font-semibold text-sm mb-2 text-slate-900">
                      Ejemplo Completo de Cálculo:
                    </p>
                    <div className="text-xs space-y-1 font-mono">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-slate-700">
                          <p>Monto Base (12 clases):</p>
                          <p>Bonos:</p>
                          <p> - Covers:</p>
                          <p> - Brandings:</p>
                          <p> - Theme Rides:</p>
                          <p> - Workshops:</p>
                          <p>Penalizaciones:</p>
                          <p>Ajuste:</p>
                          <p className="pt-1">Subtotal:</p>
                          <p>Retención (8%):</p>
                          <p className="pt-1 border-t border-slate-300 font-semibold text-slate-900">
                            PAGO FINAL:
                          </p>
                        </div>
                        <div className="text-right text-slate-900">
                          <p>S/. 1,590.00</p>
                          <p className="text-green-700 font-semibold">
                            + S/. 380.00
                          </p>
                          <p className="text-green-700"> S/. 90.00</p>
                          <p className="text-green-700"> S/. 100.00</p>
                          <p className="text-green-700"> S/. 40.00</p>
                          <p className="text-green-700"> S/. 150.00</p>
                          <p className="text-red-700 font-semibold">
                            - S/. 150.00
                          </p>
                          <p className="text-blue-700 font-semibold">
                            + S/. 100.00
                          </p>
                          <p className="pt-1 font-semibold text-slate-900">
                            S/. 1,920.00
                          </p>
                          <p className="text-red-700 font-semibold">
                            - S/. 153.60
                          </p>
                          <p className="pt-1 border-t border-slate-300 font-bold text-lg text-slate-900">
                            S/. 1,766.40
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección: Categorías y Fórmulas */}
        <section
          id="categorias"
          className="bg-card rounded-lg border border-border p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">
              Categorías de Instructores
            </h2>
          </div>

          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              El sistema determina automáticamente la categoría del instructor
              para cada disciplina según sus métricas de desempeño:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-md p-4 border border-slate-300">
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">
                  INSTRUCTOR
                </h3>
                <p className="text-xs text-slate-700 mb-2">
                  Categoría base, sin requisitos especiales.
                </p>
                <p className="text-xs text-slate-700 font-semibold">
                  Tarifas más bajas
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
                  Requiere cumplir todos los requisitos establecidos en la
                  fórmula.
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

            <div className="bg-yellow-50 rounded-md p-4 border border-yellow-300">
              <p className="font-semibold text-xs mb-2 text-yellow-900">
                Métricas Evaluadas:
              </p>
              <ul className="text-xs text-yellow-900 space-y-1">
                <li>
                  • <strong>Ocupación promedio:</strong> % de reservas vs
                  capacidad
                </li>
                <li>
                  • <strong>Clases por semana:</strong> Total de clases / 4
                  semanas
                </li>
                <li>
                  • <strong>Locales en Lima:</strong> Número de estudios
                  diferentes
                </li>
                <li>
                  • <strong>Dobleteos:</strong> Clases consecutivas (dentro de 1
                  hora)
                </li>
                <li>
                  • <strong>Horarios No Prime:</strong> Clases en horarios no
                  privilegiados
                </li>
                <li>
                  • <strong>Participación en Eventos:</strong> Si participó en
                  eventos
                </li>
                <li>
                  • <strong>Cumplimiento de Lineamientos:</strong> Si cumple con
                  políticas
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Sección: Consultar tu Pago */}
        <section id="consultar">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">
              Consultar tu Pago
            </h2>
          </div>
          <div className="text-sm">
            <p className="text-muted-foreground mb-4">
              Puedes consultar el detalle completo de tus pagos en la sección de
              Pagos. Cada pago incluye información detallada:
            </p>
            <div className="bg-card rounded-lg border border-border p-5 space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2 text-sm">
                  Resumen General
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground ml-2">
                  <li>Monto base total por todas tus clases</li>
                  <li>
                    Desglose de bonos recibidos (covers, brandings, theme rides,
                    workshops)
                  </li>
                  <li>Penalizaciones aplicadas y puntos acumulados</li>
                  <li>Ajustes/reajustes si fueron aplicados</li>
                  <li>Retención calculada (8% sobre el subtotal)</li>
                  <li>Monto final que recibirás</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2 text-sm">
                  Detalle por Clase
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground ml-2">
                  <li>Fecha, hora y estudio de cada clase que impartiste</li>
                  <li>Ocupación alcanzada (reservas/capacidad)</li>
                  <li>Categoría aplicada y tarifa usada para esa clase</li>
                  <li>Cálculo detallado: reservas × tarifa</li>
                  <li>Monto calculado por cada clase</li>
                  <li>Indicador de Full House o Versus si aplica</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2 text-sm">
                  Tus Categorías por Disciplina
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground ml-2">
                  <li>Categoría asignada para cada disciplina</li>
                  <li>
                    Métricas calculadas (ocupación, clases, locales, etc.)
                  </li>
                  <li>Evaluación de criterios para cada nivel de categoría</li>
                  <li>Por qué se asignó esa categoría (manual o automática)</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 rounded-md p-4 mt-4 border border-blue-300">
              <p className="font-semibold text-xs mb-2 text-blue-900">
                Estados de Pago:
              </p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>
                  • <strong>PENDING:</strong> Pago calculado pero aún no
                  aprobado
                </li>
                <li>
                  • <strong>APPROVED:</strong> Pago aprobado, listo para
                  procesar
                </li>
                <li>
                  • <strong>PAID:</strong> Pago ya procesado
                </li>
                <li>
                  • <strong>CANCELLED:</strong> Pago cancelado (no aplicará)
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Factores de Cálculo - Resumen */}
        <div className="bg-green-50 border border-green-300 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-green-700" />
            <h3 className="text-base font-semibold text-green-900">
              Factores de Cálculo - Resumen
            </h3>
          </div>
          <ul className="list-disc list-inside space-y-2 text-sm text-green-900 ml-2">
            <li>
              <strong>Ocupación de cada clase:</strong> Determina la tarifa
              aplicada (Full House, alto, medio, bajo)
            </li>
            <li>
              <strong>Categoría del instructor:</strong> Por disciplina, basada
              en métricas de desempeño
            </li>
            <li>
              <strong>Fórmula de pago:</strong> Configurada por disciplina y
              período, define tarifas y condiciones
            </li>
            <li>
              <strong>Bonos adicionales:</strong> Covers (S/.30), Brandings
              (S/.50), Theme Rides (S/.40), Workshops (variable)
            </li>
            <li>
              <strong>Penalizaciones:</strong> Por puntos acumulados (2% por
              punto excedente sobre 10, máximo 10%)
            </li>
            <li>
              <strong>Retención:</strong> 8% sobre el subtotal (base + bonos -
              penalizaciones + ajustes)
            </li>
            <li>
              <strong>Ajustes/Reajustes:</strong> Modificaciones manuales fijas
              o porcentuales
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
