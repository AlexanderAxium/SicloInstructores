"use client";

import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InstructorLoginPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const loginMutation = trpc.instructor.login.useMutation({
    onSuccess: (data: {
      token: string;
      instructor: { id: string; name: string; fullName: string | null };
    }) => {
      // Store token in localStorage
      localStorage.setItem("instructorToken", data.token);
      localStorage.setItem("instructorData", JSON.stringify(data.instructor));

      // Redirect to instructor dashboard
      router.push("/instructor/dashboard");
    },
    onError: (error: { message?: string }) => {
      setError(error.message || "Error desconocido en el login");
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");

    try {
      await loginMutation.mutateAsync({
        name,
        password,
      });
    } catch (_error) {
      // Error is handled in onError callback
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-gray-900">SilcoAdmin</h1>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Acceso Instructores
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Inicia sesión con tu nombre y contraseña
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre del Instructor
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej: María González"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tu contraseña"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No recuerdas tu contraseña?{" "}
              <span className="text-gray-500">
                Contacta con el administrador del sistema
              </span>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Credenciales de Prueba:
          </h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p>
              <strong>Ana García</strong> / anagarcía123
            </p>
            <p>
              <strong>Carlos López</strong> / carloslópez123
            </p>
            <p>
              <strong>Sofia Martín</strong> / sofiamartín123
            </p>
            <p>
              <strong>Diego Ruiz</strong> / diegoruiz123
            </p>
            <p>
              <strong>María Elena</strong> / maríaelena123
            </p>
            <p>
              <strong>Roberto Silva</strong> / robertosilva123
            </p>
            <p>
              <strong>Lucía Fernández</strong> / lucíafernández123
            </p>
            <p>
              <strong>Andrés Morales</strong> / andrésmorales123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
