import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Política de Privacidad
          </h1>
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString("es-ES")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Información que Recopilamos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Recopilamos información que nos proporciona directamente y la que
              recopilamos automáticamente cuando utiliza nuestros servicios.
            </p>

            <div className="space-y-4">
              <h4 className="font-semibold">Información Personal:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Nombre y dirección de correo electrónico</li>
                <li>Información de contacto (teléfono, dirección)</li>
                <li>Información de facturación y pago</li>
                <li>Preferencias de idioma y configuración</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Información de la Plataforma:</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Datos de cuentas conectadas</li>
                <li>Información de configuraciones</li>
                <li>Preferencias de usuario</li>
                <li>Historial de actividad en la plataforma</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Cómo Utilizamos su Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Proporcionar y mantener nuestros servicios</li>
              <li>Procesar pagos y gestionar suscripciones</li>
              <li>Gestionar usuarios y permisos</li>
              <li>Generar análisis y reportes personalizados</li>
              <li>Mejorar la funcionalidad de la plataforma</li>
              <li>Enviar notificaciones importantes del servicio</li>
              <li>Proporcionar soporte al cliente</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Compartir Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              No vendemos, alquilamos ni compartimos su información personal con
              terceros, excepto en las siguientes circunstancias:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Con su consentimiento explícito</li>
              <li>Para cumplir con obligaciones legales</li>
              <li>Con proveedores de servicios que nos ayudan a operar</li>
              <li>En caso de fusión, adquisición o venta de activos</li>
              <li>Para proteger nuestros derechos y seguridad</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Seguridad de los Datos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Implementamos medidas de seguridad técnicas y organizativas para
              proteger su información:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Encriptación de datos en tránsito y en reposo</li>
              <li>Acceso restringido a información personal</li>
              <li>Monitoreo regular de seguridad</li>
              <li>Copias de seguridad regulares</li>
              <li>Capacitación del personal en privacidad</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Sus Derechos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Tiene los siguientes derechos respecto a su información personal:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Acceder a su información personal</li>
              <li>Corregir información inexacta</li>
              <li>Solicitar la eliminación de sus datos</li>
              <li>Restringir el procesamiento de sus datos</li>
              <li>Portabilidad de datos</li>
              <li>Oponerse al procesamiento</li>
            </ul>
            <p className="text-muted-foreground">
              Para ejercer estos derechos, contacte a:
              <a
                href="mailto:privacy@myapp.com"
                className="text-primary hover:underline ml-1"
              >
                privacy@myapp.com
              </a>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Cookies y Tecnologías Similares</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Utilizamos cookies y tecnologías similares para mejorar su
              experiencia. Para más información, consulte nuestra
              <a
                href="/legal/cookies"
                className="text-primary hover:underline ml-1"
              >
                Política de Cookies
              </a>
              .
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Retención de Datos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Conservamos su información personal durante el tiempo necesario
              para cumplir con los propósitos descritos en esta política, a
              menos que la ley requiera un período de retención más largo.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Cambios a esta Política</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Podemos actualizar esta política de privacidad ocasionalmente. Le
              notificaremos sobre cambios significativos por correo electrónico
              o mediante un aviso en nuestro sitio web.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Si tiene preguntas sobre esta política de privacidad, contacte a:
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
