import { Calendar, DollarSign, GraduationCap, Users } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Bienvenido a la Documentación
        </h1>
        <p className="text-base text-muted-foreground">
          Guía completa para entender cómo funciona el sistema de pagos, bonos y
          tu información como instructor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-card rounded-lg p-6 border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-primary/10 p-3 rounded-lg mr-4">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground">
              Cálculo de Pagos
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Entiende cómo se calcula tu pago, qué factores lo afectan y cómo
            consultar el detalle.
          </p>
          <a
            href="/docs/pagos"
            className="text-primary hover:underline font-medium text-sm"
          >
            Leer más →
          </a>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-primary/10 p-3 rounded-lg mr-4">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground">
              Bonos y Penalizaciones
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Conoce qué bonos puedes recibir (covers, brandings, theme rides) y
            cómo funcionan las penalizaciones.
          </p>
          <a
            href="/docs/bonos"
            className="text-primary hover:underline font-medium text-sm"
          >
            Leer más →
          </a>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-primary/10 p-3 rounded-lg mr-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground">
              Mis Clases
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Información sobre tus clases, ocupación y cómo esto afecta tu pago.
          </p>
          <a
            href="/docs/clases"
            className="text-primary hover:underline font-medium text-sm"
          >
            Leer más →
          </a>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="bg-primary/10 p-3 rounded-lg mr-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground">
              Mi Información
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Entiende tu perfil, categorías por disciplina y cómo se determinan.
          </p>
          <a
            href="/docs/instructores"
            className="text-primary hover:underline font-medium text-sm"
          >
            Leer más →
          </a>
        </div>
      </div>

      <div className="border-t border-border pt-8 mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Información Importante
        </h2>
        <p className="text-muted-foreground mb-4">
          Como instructor, aquí encontrarás información útil sobre:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Cómo se calcula tu pago según tus clases y desempeño</li>
          <li>Qué bonos puedes recibir y cómo se otorgan</li>
          <li>Cómo funcionan las categorías y qué significa cada una</li>
          <li>Cómo consultar el detalle completo de tus pagos</li>
          <li>Qué factores afectan tu pago final</li>
        </ul>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          ¿Necesitas ayuda?
        </h3>
        <p className="text-muted-foreground">
          Si tienes preguntas o necesitas soporte, contacta a nuestro equipo en{" "}
          <a
            href="mailto:info@qintitec.com"
            className="text-primary hover:underline font-medium"
          >
            info@qintitec.com
          </a>
        </p>
      </div>
    </div>
  );
}
