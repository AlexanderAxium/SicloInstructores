"use client";

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
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

type LoginFormValues = {
  emailOrName: string;
  password: string;
};

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    defaultValues: {
      emailOrName: "",
      password: "",
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
      router.push("/instructor");
      setLoading(false);
    },
    onError: () => {
      // Error will be handled in onSubmit
    },
  });

  const { control, handleSubmit, setError, clearErrors } = form;

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    clearErrors();

    if (!data.emailOrName || !data.password) {
      toast.error("Completa todos los campos");
      setLoading(false);
      return;
    }

    // Check if input looks like an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(data.emailOrName);

    // First, try user login if it looks like an email
    if (isEmail) {
      try {
        const { error } = await authClient.signIn.email({
          email: data.emailOrName,
          password: data.password,
          callbackURL: "/dashboard",
          rememberMe: true,
        });

        if (!error) {
          toast.success("Bienvenido", {
            description: "Sesión iniciada correctamente",
          });
          router.push("/dashboard");
          setLoading(false);
          return;
        }
        // If user login fails, continue to try instructor login
      } catch (_error) {
        // If there's an error, try instructor login as fallback
        console.log("User login failed, trying instructor login");
      }
    }

    // Try instructor login (works with email or name)
    try {
      await instructorLoginMutation.mutateAsync({
        name: data.emailOrName,
        password: data.password,
      });
      // Success is handled in onSuccess callback
    } catch (_error) {
      // Both login attempts failed
      toast.error("Error al iniciar sesión", {
        description: isEmail
          ? "No se encontró una cuenta de usuario o instructor con estas credenciales"
          : "No se encontró un instructor con estas credenciales",
      });

      setError("emailOrName", {
        type: "manual",
        message: "Credenciales incorrectas",
      });
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Inicia Sesión
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu correo electrónico o nombre de instructor
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Controller
                name="emailOrName"
                control={control}
                rules={{ required: "Este campo es requerido" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Correo electrónico o Nombre de Instructor
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="tu@email.com o Nombre del Instructor"
                        {...field}
                        className="w-full"
                        autoComplete="username"
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
                          className="w-full pr-10"
                          autoComplete="current-password"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
