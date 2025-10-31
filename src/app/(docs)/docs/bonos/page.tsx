import { GraduationCap } from "lucide-react";

export default function BonosDocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <GraduationCap className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Bonos y Penalizaciones
          </h1>
        </div>
        <p className="text-base text-muted-foreground">
          Información sobre los bonos que puedes recibir y cómo funcionan las
          penalizaciones en tu pago.
        </p>
      </div>

      <div className="space-y-8">
        <section id="covers">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Covers (Reemplazos)
          </h2>
          <div className="text-sm">
            <p className="text-muted-foreground mb-4">
              Si cubres una clase de otro instructor, puedes recibir un bono
              adicional:
            </p>
            <div className="bg-green-50 rounded-md p-4 border border-green-300">
              <ul className="list-disc list-inside space-y-2 text-sm text-green-900">
                <li>
                  <strong>Bono por Cover:</strong> S/. 30.00 por cada cover con
                  bonificación activada
                </li>
                <li>
                  Solo aplica cuando el cover tiene la opción de "bonificación"
                  habilitada
                </li>
                <li>Este bono se suma automáticamente a tu pago del período</li>
                <li>Puedes consultar tus covers en la sección de Pagos</li>
              </ul>
            </div>
            <p className="text-muted-foreground mt-4">
              Ejemplo: Si cubriste 3 clases con bonificación, recibirás S/.
              90.00 adicionales en tu pago.
            </p>
          </div>
        </section>

        <section id="brandings">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Brandings
          </h2>
          <div className="text-sm">
            <p className="text-muted-foreground mb-4">
              Los brandings son eventos especiales de marketing que otorgan un
              bono fijo:
            </p>
            <div className="bg-blue-50 rounded-md p-4 border border-blue-300">
              <ul className="list-disc list-inside space-y-2 text-sm text-blue-900">
                <li>
                  <strong>Bono por Branding:</strong> S/. 50.00 por cada
                  branding registrado
                </li>
                <li>
                  Se registran por período y se suman automáticamente a tu pago
                </li>
                <li>Cada branding cuenta independientemente</li>
                <li>
                  Puedes ver cuántos brandings tienes en el detalle de tu pago
                </li>
              </ul>
            </div>
            <p className="text-muted-foreground mt-4">
              Ejemplo: Si participaste en 2 brandings, recibirás S/. 100.00
              adicionales.
            </p>
          </div>
        </section>

        <section id="theme-rides">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Theme Rides
          </h2>
          <div className="text-sm">
            <p className="text-muted-foreground mb-4">
              Las clases temáticas especiales también otorgan un bono:
            </p>
            <div className="bg-purple-50 rounded-md p-4 border border-purple-300">
              <ul className="list-disc list-inside space-y-2 text-sm text-purple-900">
                <li>
                  <strong>Bono por Theme Ride:</strong> S/. 40.00 por cada theme
                  ride
                </li>
                <li>
                  Se registra automáticamente cuando impartes una clase temática
                </li>
                <li>Se suma a tu cálculo de pago del período</li>
              </ul>
            </div>
            <p className="text-muted-foreground mt-4">
              Ejemplo: Si impartiste 1 theme ride, recibirás S/. 40.00
              adicionales.
            </p>
          </div>
        </section>

        <section id="workshops">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Workshops
          </h2>
          <div className="text-sm">
            <p className="text-muted-foreground mb-4">
              Los workshops son sesiones de capacitación especiales con pago
              variable:
            </p>
            <div className="bg-orange-50 rounded-md p-4 border border-orange-300">
              <ul className="list-disc list-inside space-y-2 text-sm text-orange-900">
                <li>
                  <strong>Pago Variable:</strong> El monto depende de cada
                  workshop específico
                </li>
                <li>Se configura individualmente según el tipo de workshop</li>
                <li>Se suma directamente a tu cálculo de pagos</li>
                <li>Puedes ver el monto exacto en el detalle de tu pago</li>
              </ul>
            </div>
            <p className="text-muted-foreground mt-4">
              Ejemplo: Si impartiste un workshop con pago de S/. 150.00, ese
              monto se agregará a tu pago.
            </p>
          </div>
        </section>

        <section id="penalizaciones">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Penalizaciones
          </h2>
          <div className="text-sm">
            <p className="text-muted-foreground mb-4">
              El sistema de penalizaciones funciona por puntos acumulados y
              afecta tu pago:
            </p>
            <div className="bg-red-50 rounded-md p-4 border border-red-300">
              <ul className="list-disc list-inside space-y-2 text-sm text-red-900">
                <li>
                  <strong>Sistema de Puntos:</strong> Cada penalización otorga
                  puntos según la gravedad
                </li>
                <li>
                  <strong>Puntos Permitidos:</strong> Tienes hasta 10 puntos sin
                  descuento
                </li>
                <li>
                  <strong>Descuento por Puntos Excedentes:</strong> Cada punto
                  sobre 10 genera un 2% de descuento
                </li>
                <li>
                  <strong>Descuento Máximo:</strong> El descuento máximo por
                  penalizaciones es del 10%
                </li>
              </ul>
            </div>

            <div className="bg-slate-100 rounded-md p-4 mt-4 border border-slate-300">
              <p className="font-semibold text-sm mb-2 text-slate-900">
                Ejemplo:
              </p>
              <div className="text-xs text-slate-700 space-y-1 font-mono">
                <p>• Tienes 15 puntos acumulados en el período</p>
                <p>• Puntos permitidos: 10</p>
                <p>• Puntos excedentes: 15 - 10 = 5 puntos</p>
                <p>• Descuento: 5 × 2% = 10% (máximo alcanzado)</p>
                <p>• Si tu monto base es S/. 1,500.00</p>
                <p>• Descuento aplicado: S/. 150.00</p>
              </div>
            </div>

            <p className="text-muted-foreground mt-4">
              <strong>Tip:</strong> Mantén tus puntos por debajo de 10 para
              evitar descuentos en tu pago.
            </p>
          </div>
        </section>

        <div className="bg-green-50 border border-green-300 rounded-lg p-5">
          <h3 className="text-base font-semibold text-green-900 mb-3">
            💰 Resumen de Bonos
          </h3>
          <p className="text-sm text-green-900 mb-3">
            Todos los bonos se suman automáticamente en el cálculo de tu pago:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-green-900">
            <li>
              <strong>Covers:</strong> S/. 30.00 por cada cover con bonificación
            </li>
            <li>
              <strong>Brandings:</strong> S/. 50.00 por cada branding
            </li>
            <li>
              <strong>Theme Rides:</strong> S/. 40.00 por cada theme ride
            </li>
            <li>
              <strong>Workshops:</strong> Monto variable según el workshop
            </li>
          </ul>
          <p className="text-sm text-green-900 mt-4">
            Las penalizaciones se descuentan del monto total antes de aplicar la
            retención del 8%.
          </p>
        </div>
      </div>
    </div>
  );
}
