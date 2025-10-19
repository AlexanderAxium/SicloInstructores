import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Términos y Condiciones
          </h1>
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString("es-ES")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Aceptación de los Términos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Al acceder y utilizar MyApp, usted acepta estar sujeto a estos
              términos y condiciones de uso. Si no está de acuerdo con alguna
              parte de estos términos, no debe utilizar nuestro servicio.
            </p>
            <p className="text-muted-foreground">
              Estos términos se aplican a todos los visitantes, usuarios y otras
              personas que accedan o utilicen el servicio.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Descripción del Servicio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              MyApp es una plataforma moderna de gestión que permite a los
              usuarios gestionar contenido, usuarios y configuraciones, y
              utilizar herramientas de análisis y automatización.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Gestión de usuarios y roles</li>
              <li>Configuración de permisos y acceso</li>
              <li>Herramientas de análisis y reportes</li>
              <li>Automatización de procesos</li>
              <li>API para integraciones personalizadas</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Cuentas de Usuario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Para utilizar nuestros servicios, debe crear una cuenta
              proporcionando información precisa y actualizada. Es responsable
              de:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Mantener la confidencialidad de su contraseña</li>
              <li>Notificar inmediatamente cualquier uso no autorizado</li>
              <li>Proporcionar información de contacto actualizada</li>
              <li>Ser responsable de todas las actividades en su cuenta</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Suscripciones y Pagos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Nuestros servicios están disponibles mediante planes de
              suscripción:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Los pagos se procesan mensualmente</li>
              <li>Puede cancelar su suscripción en cualquier momento</li>
              <li>No ofrecemos reembolsos por períodos parciales</li>
              <li>Los precios pueden cambiar con notificación previa</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Uso Aceptable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Usted se compromete a no utilizar el servicio para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Actividades ilegales o fraudulentas</li>
              <li>Interferir con el funcionamiento del servicio</li>
              <li>Intentar acceder a cuentas de otros usuarios</li>
              <li>Distribuir malware o contenido malicioso</li>
              <li>Violar derechos de propiedad intelectual</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Limitación de Responsabilidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              MyApp se proporciona "tal como está" sin garantías de ningún tipo.
              No somos responsables por:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Pérdidas derivadas del uso de la plataforma</li>
              <li>Interrupciones del servicio</li>
              <li>Pérdida de datos</li>
              <li>Decisiones basadas en nuestros análisis</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Modificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Nos reservamos el derecho de modificar estos términos en cualquier
              momento. Las modificaciones entrarán en vigor inmediatamente
              después de su publicación. Su uso continuado del servicio
              constituye aceptación de los términos modificados.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Si tiene preguntas sobre estos términos y condiciones, puede
              contactarnos en:
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-muted-foreground">
                Email:{" "}
                <a
                  href="mailto:legal@myapp.com"
                  className="text-primary hover:underline"
                >
                  legal@myapp.com
                </a>
              </p>
              <p className="text-muted-foreground">
                Teléfono:{" "}
                <a
                  href="tel:+1234567890"
                  className="text-primary hover:underline"
                >
                  +1 (234) 567-890
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
