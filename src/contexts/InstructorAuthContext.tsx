"use client";

import { trpc } from "@/utils/trpc";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface Instructor {
  id: string;
  name: string;
  fullName?: string | null;
  phone?: string | null;
  DNI?: string | null;
  bank?: string | null;
  bankAccount?: string | null;
  CCI?: string | null;
  contactPerson?: string | null;
  active: boolean;
}

interface InstructorAuthContextType {
  instructor: Instructor | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    name: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refetch: () => Promise<void>;
}

const InstructorAuthContext = createContext<
  InstructorAuthContextType | undefined
>(undefined);

export function InstructorAuthProvider({ children }: { children: ReactNode }) {
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get tRPC utils for imperative calls
  const utils = trpc.useUtils();

  // Login mutation
  const loginMutation = trpc.instructor.login.useMutation({
    onSuccess: (result) => {
      if (result.token && result.instructor) {
        setToken(result.token);
        setInstructor(result.instructor);

        // Store in localStorage
        localStorage.setItem("instructorToken", result.token);
        localStorage.setItem(
          "instructorData",
          JSON.stringify(result.instructor)
        );
      }
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("instructorToken");
    const storedInstructor = localStorage.getItem("instructorData");

    if (storedToken && storedInstructor) {
      try {
        setToken(storedToken);
        setInstructor(JSON.parse(storedInstructor));
      } catch (error) {
        console.error("Error parsing stored instructor data:", error);
        localStorage.removeItem("instructorToken");
        localStorage.removeItem("instructorData");
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (name: string, password: string) => {
    try {
      setIsLoading(true);

      // Use the instructor login mutation
      const result = await loginMutation.mutateAsync({
        name,
        password,
      });

      if (result.token && result.instructor) {
        return { success: true };
      }
      return { success: false, error: "Login failed" };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Error de autenticación",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setInstructor(null);
    setToken(null);
    localStorage.removeItem("instructorToken");
    localStorage.removeItem("instructorData");
  };

  const refetch = async () => {
    if (!instructor?.id) return;

    try {
      // Obtener los datos actualizados del instructor usando utils
      const updatedInstructor = await utils.instructor.getById.fetch({
        id: instructor.id,
      });

      if (updatedInstructor) {
        setInstructor(updatedInstructor);
        // Actualizar también en localStorage
        localStorage.setItem(
          "instructorData",
          JSON.stringify(updatedInstructor)
        );
      }
    } catch (error) {
      console.error("Error refetching instructor data:", error);
    }
  };

  const value: InstructorAuthContextType = {
    instructor,
    token,
    isAuthenticated: !!instructor && !!token,
    isLoading,
    login,
    logout,
    refetch,
  };

  return (
    <InstructorAuthContext.Provider value={value}>
      {children}
    </InstructorAuthContext.Provider>
  );
}

export function useInstructorAuth() {
  const context = useContext(InstructorAuthContext);
  if (context === undefined) {
    throw new Error(
      "useInstructorAuth must be used within an InstructorAuthProvider"
    );
  }
  return context;
}
