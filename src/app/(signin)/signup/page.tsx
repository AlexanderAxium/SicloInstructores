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
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

const passwordRules = [
  { label: "Mínimo 8 caracteres", test: (v: string) => v.length >= 8 },
  { label: "Una mayúscula", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Un número", test: (v: string) => /[0-9]/.test(v) },
  {
    label: "Un carácter especial",
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
];

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  repeatPassword: string;
};

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      repeatPassword: "",
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setError: setFormError,
    clearErrors,
    formState: { errors: _errors },
  } = form;

  const password = watch("password");
  const repeatPassword = watch("repeatPassword");

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    clearErrors();

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      setFormError("email", {
        type: "manual",
        message: "Ingresa un correo válido",
      });
      toast.error("Ingresa un correo válido");
      setLoading(false);
      return;
    }

    // Validación de contraseñas
    if (data.password !== data.repeatPassword) {
      setFormError("repeatPassword", {
        type: "manual",
        message: "Las contraseñas no coinciden",
      });
      setLoading(false);
      return;
    }

    // Validación de reglas de contraseña
    const failedRule = passwordRules.find((rule) => !rule.test(data.password));
    if (failedRule) {
      setFormError("password", {
        type: "manual",
        message: `La contraseña debe cumplir: ${failedRule.label}`,
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: "/", // Let RoleBasedRedirect handle the redirection
      });

      if (error) {
        toast.error("Error al crear cuenta", {
          description: error.message,
        });
      } else {
        toast.success("¡Cuenta creada exitosamente!", {
          description: "Revisa tu email para confirmar tu cuenta.",
        });
        // Let RoleBasedRedirect handle the redirection based on user role
        router.push("/");
      }
    } catch (_error) {
      toast.error("Error de red o servidor");
    }
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        errorCallbackURL: "/signup",
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
            Únete a MyApp
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Controller
                name="name"
                control={control}
                rules={{ required: "Nombre requerido" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Tu nombre completo"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          className="pr-10"
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

              {/* Password Rules */}
              <ul className="text-sm space-y-1">
                {passwordRules.map((rule) => {
                  const valid = rule.test(password);
                  return (
                    <li
                      key={rule.label}
                      className={
                        valid
                          ? "text-green-600 flex items-center gap-1"
                          : "text-gray-500 flex items-center gap-1"
                      }
                    >
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: valid ? "#22c55e" : "#d1d5db" }}
                      />
                      {rule.label}
                    </li>
                  );
                })}
              </ul>

              <Controller
                name="repeatPassword"
                control={control}
                rules={{ required: "Repite la contraseña" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repite la contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showRepeatPassword ? "text" : "password"}
                          placeholder="Repite tu contraseña"
                          {...field}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() =>
                            setShowRepeatPassword(!showRepeatPassword)
                          }
                        >
                          {showRepeatPassword ? (
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

              {repeatPassword.length > 0 && (
                <div
                  className={
                    password === repeatPassword
                      ? "text-green-600 text-sm"
                      : "text-red-600 text-sm"
                  }
                >
                  {password === repeatPassword
                    ? "Las contraseñas coinciden"
                    : "Las contraseñas no coinciden"}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </button>
            </form>
          </Form>

          {/* Divider */}
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
                onClick={handleGoogleSignUp}
                disabled={loading}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <GoogleIcon className="w-5 h-5 mr-2" />
                {loading ? "Redirigiendo..." : "Google"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
