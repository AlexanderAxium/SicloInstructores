"use client";

import GoogleIcon from "@/components/icons/GoogleIcon";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { ArrowLeft, Eye, EyeOff, GraduationCap, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

type LoginFormValues = {
  email: string;
  password: string;
  name?: string; // For instructor login
};

type LoginMode = "user" | "instructor";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>("user");
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  // Instructor login mutation
  const instructorLoginMutation = trpc.instructor.login.useMutation({
    onSuccess: (data) => {
      // Store instructor data in localStorage
      localStorage.setItem("instructorToken", data.token);
      localStorage.setItem("instructorData", JSON.stringify(data.instructor));

      toast.success("Bienvenido instructor", {
        description: "Sesión iniciada correctamente",
      });

      // Redirect to instructor dashboard
      router.push("/instructor/dashboard");
    },
    onError: (error) => {
      toast.error("Error al iniciar sesión", {
        description: error.message,
      });
      setLoading(false);
    },
  });

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors: _errors },
  } = form;

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    clearErrors();

    if (loginMode === "instructor") {
      // Instructor login logic
      if (!data.name || !data.password) {
        toast.error("Completa todos los campos");
        setLoading(false);
        return;
      }

      try {
        await instructorLoginMutation.mutateAsync({
          name: data.name,
          password: data.password,
        });
      } catch (_error) {
        // Error is handled in the mutation onError callback
      }
      return;
    }

    // User login logic
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      setError("email", {
        type: "manual",
        message: "Ingresa un correo válido",
      });
      toast.error("Ingresa un correo válido");
      setLoading(false);
      return;
    }

    if (!data.password) {
      setError("password", {
        type: "manual",
        message: "Ingresa tu contraseña",
      });
      toast.error("Ingresa tu contraseña");
      setLoading(false);
      return;
    }

    try {
      const { error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: "/",
        rememberMe: true,
      });

      if (error) {
        toast.error("Error al iniciar sesión", {
          description: error.message,
        });
      } else {
        toast.success("Bienvenido", {
          description: "Sesión iniciada correctamente",
        });
        // Let RoleBasedRedirect handle the redirection
        router.push("/");
      }
    } catch (_error) {
      toast.error("Error de red o servidor");
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        errorCallbackURL: "/signin",
        newUserCallbackURL: "/dashboard",
      });
    } catch (_error) {
      toast.error("No se pudo redirigir a Google");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>

          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Bienvenido a MyApp
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            ¿No tienes cuenta?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>

        {/* Login Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setLoginMode("user")}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginMode === "user"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <User className="h-4 w-4 mr-2" />
            Usuario
          </button>
          <button
            type="button"
            onClick={() => setLoginMode("instructor")}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              loginMode === "instructor"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            Instructor
          </button>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {loginMode === "user" ? (
                <Controller
                  name="email"
                  control={control}
                  rules={{ required: "Correo requerido" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="tu@email.com"
                          {...field}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Nombre requerido" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Instructor</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Ej: María González"
                          {...field}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Controller
                name="password"
                control={control}
                rules={{ required: "Contraseña requerida" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Tu contraseña"
                          {...field}
                          className="w-full pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </button>
            </form>
          </Form>

          {/* Google Sign-in - Only for users */}
          {loginMode === "user" && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    O continúa con
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <GoogleIcon className="w-5 h-5 mr-2" />
                  {loading ? "Redirigiendo..." : "Google"}
                </button>
              </div>
            </div>
          )}

          {/* Instructor Help Text */}
          {loginMode === "instructor" && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
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
          )}
        </div>
      </div>
    </div>
  );
}
