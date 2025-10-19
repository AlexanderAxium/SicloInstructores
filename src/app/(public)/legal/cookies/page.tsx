import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Política de Cookies
          </h1>
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString("es-ES")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>¿Qué son las Cookies?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Las cookies son pequeños archivos de texto que se almacenan en su
              dispositivo cuando visita nuestro sitio web. Nos ayudan a mejorar
              su experiencia de navegación y a proporcionar funcionalidades
              personalizadas.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipos de Cookies que Utilizamos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">
                Cookies Esenciales
              </h4>
              <p className="text-muted-foreground mb-2">
                Estas cookies son necesarias para el funcionamiento básico del
                sitio web:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Mantener su sesión de usuario activa</li>
                <li>Recordar sus preferencias de idioma</li>
                <li>Gestionar la autenticación</li>
                <li>Proporcionar seguridad básica</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">
                Cookies de Funcionalidad
              </h4>
              <p className="text-muted-foreground mb-2">
                Estas cookies mejoran la funcionalidad del sitio web:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Recordar configuraciones de la plataforma</li>
                <li>Personalizar la interfaz de usuario</li>
                <li>Guardar preferencias de visualización</li>
                <li>Mantener configuraciones de la plataforma</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">
                Cookies de Análisis
              </h4>
              <p className="text-muted-foreground mb-2">
                Estas cookies nos ayudan a entender cómo utiliza nuestro sitio:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Analizar el tráfico del sitio web</li>
                <li>Identificar páginas más visitadas</li>
                <li>Mejorar la experiencia del usuario</li>
                <li>Optimizar el rendimiento</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">
                Cookies de Marketing
              </h4>
              <p className="text-muted-foreground mb-2">
                Estas cookies se utilizan para mostrar contenido relevante:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Personalizar anuncios</li>
                <li>Medir la efectividad de campañas</li>
                <li>Proporcionar contenido relacionado</li>
                <li>Retargeting de usuarios</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cookies de Terceros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Utilizamos servicios de terceros que pueden establecer sus propias
              cookies:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong>Google Analytics:</strong> Para análisis de tráfico web
              </li>
              <li>
                <strong>Stripe:</strong> Para procesamiento de pagos
              </li>
              <li>
                <strong>PayPal:</strong> Para procesamiento de pagos
              </li>
              <li>
                <strong>MercadoPago:</strong> Para procesamiento de pagos
              </li>
              <li>
                <strong>Intercom:</strong> Para soporte al cliente
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestión de Cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Puede controlar y gestionar las cookies de varias maneras:
            </p>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">
                Configuración del Navegador
              </h4>
              <p className="text-muted-foreground">
                La mayoría de los navegadores web le permiten controlar las
                cookies a través de su configuración. Puede:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Ver qué cookies están almacenadas</li>
                <li>Eliminar cookies individuales o todas</li>
                <li>Bloquear cookies de sitios específicos</li>
                <li>Configurar notificaciones antes de aceptar cookies</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">
                Configuración de la Plataforma
              </h4>
              <p className="text-muted-foreground">
                En su panel de usuario puede:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Gestionar preferencias de cookies</li>
                <li>Optar por no recibir cookies de marketing</li>
                <li>Configurar notificaciones</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consecuencias de Deshabilitar Cookies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Si deshabilita las cookies, algunas funcionalidades de nuestro
              sitio web pueden no funcionar correctamente:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
              <li>No podrá mantener su sesión iniciada</li>
              <li>Sus preferencias no se guardarán</li>
              <li>
                Algunas funciones de la plataforma pueden no estar disponibles
              </li>
              <li>La experiencia de usuario puede verse afectada</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actualizaciones de esta Política</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Podemos actualizar esta política de cookies ocasionalmente para
              reflejar cambios en nuestras prácticas o por otras razones
              operativas, legales o regulatorias. Le recomendamos revisar esta
              página periódicamente.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Si tiene preguntas sobre nuestra política de cookies, puede
              contactarnos:
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-muted-foreground">
                Email:{" "}
                <a
                  href="mailto:privacy@myapp.com"
                  className="text-primary hover:underline"
                >
                  privacy@myapp.com
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
