"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function ConfirmEmailPage() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const confirmEmail = useCallback(
    async (token: string) => {
      try {
        // Try Better Auth endpoint first
        const authResponse = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (authResponse.ok) {
          setSuccess(true);
          toast.success("¡Email confirmado exitosamente!");
          setTimeout(() => {
            router.push("/");
          }, 3000);
          setLoading(false);
          return;
        }

        // Fallback to tRPC endpoint
        const response = await fetch("/api/trpc/user.confirmEmail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            0: {
              json: { token },
            },
          }),
        });

        const result = await response.json();

        if (
          response.ok &&
          (result.result?.data?.json === true || result.result?.data === true)
        ) {
          setSuccess(true);
          toast.success("¡Email confirmado exitosamente!");

          // Redirigir al inicio después de 3 segundos
          setTimeout(() => {
            router.push("/");
          }, 3000);
        } else {
          setError("Token inválido o expirado");
          toast.error("Error al confirmar el email");
        }
      } catch (err: unknown) {
        setError("Error de conexión");
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error de conexión al confirmar el email";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (!token) {
      setError("Token de confirmación no encontrado");
      setLoading(false);
      return;
    }

    confirmEmail(token);
  }, [token, confirmEmail]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Confirmando tu email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        {success ? (
          <div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label="Checkmark icon"
              >
                <title>Checkmark icon</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Email Confirmado!
            </h1>
            <p className="text-gray-600 mb-6">
              Tu cuenta ha sido confirmada exitosamente. Serás redirigido al
              inicio en unos segundos.
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir al inicio
            </button>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label="Error icon"
              >
                <title>Error icon</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Error de Confirmación
            </h1>
            <p className="text-gray-600 mb-6">
              {error ||
                "No se pudo confirmar tu email. El enlace puede ser inválido o haber expirado."}
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ir al inicio
              </button>
              <button
                type="button"
                onClick={() => router.push("/?show=register")}
                className="w-full bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Registrarse nuevamente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
