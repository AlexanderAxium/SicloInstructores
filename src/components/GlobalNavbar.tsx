"use client";

import { useAuthContext } from "@/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUser } from "@/hooks/useUser";
import { LayoutDashboard, LogOut, Menu, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function GlobalNavbar() {
  const _pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuthContext();
  const { primaryRole } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  const handleSignIn = () => {
    router.push("/signin");
    setIsMenuOpen(false);
  };

  const getDashboardUrl = () => {
    switch (primaryRole) {
      case "admin":
      case "super_admin":
      case "user":
      case "viewer":
        return "/dashboard";
      default:
        return "/dashboard"; // Default to dashboard for all roles
    }
  };

  return (
    <>
      <nav className="px-4 sm:px-6 lg:px-8 border-b bg-[#131B2F] border-gray-700 shadow-lg z-50">
        <div className="max-w-[1500px] mx-auto ">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <div className="h-8 w-8 bg-gradient-to-r from-[#F5BA35] to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="ml-2 text-xl font-medium text-white">
                  MyApp
                </span>
              </Link>
            </div>

            {/* Desktop Auth Section */}
            <div className="hidden lg:block">
              <div className="ml-4 flex items-center md:ml-6">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    {/* User Name */}
                    <span className="text-white font-medium text-sm">
                      {user?.name || "Usuario"}
                    </span>

                    {/* User Avatar Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                        >
                          <Avatar className="h-8 w-8">
                            {user?.image ? (
                              <AvatarImage
                                src={user.image}
                                alt={user?.name || "Usuario"}
                              />
                            ) : (
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {user?.name
                                  ? user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()
                                      .slice(0, 2)
                                  : "U"}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {user?.name || "Usuario"}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user?.email || ""}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => router.push(getDashboardUrl())}
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push("/dashboard/profile")}
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>Perfil</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push("/dashboard/settings")}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Configuración</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Cerrar Sesión</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={handleSignIn}
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Iniciar Sesión
                    </button>
                    <Link
                      href="/signup"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  >
                    <span className="sr-only">Open main menu</span>
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-96 bg-[#20252F] border-gray-700"
                >
                  <SheetHeader className="px-2">
                    <SheetTitle className="text-white text-lg">Menú</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 px-2">
                    {isAuthenticated ? (
                      <div className="space-y-4">
                        {/* User Info */}
                        <div className="flex items-center space-x-3 px-3 py-2">
                          <Avatar>
                            {user?.image ? (
                              <AvatarImage
                                src={user.image}
                                alt={user?.name || "Usuario"}
                              />
                            ) : (
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {user?.name
                                  ? user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()
                                      .slice(0, 2)
                                  : "U"}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">
                              {user?.name || "Usuario"}
                            </span>
                            <span className="text-xs text-gray-300">
                              {user?.email || ""}
                            </span>
                          </div>
                        </div>

                        {/* Dashboard Link */}
                        <button
                          type="button"
                          onClick={() => {
                            router.push(getDashboardUrl());
                            setIsMenuOpen(false);
                          }}
                          className="group flex items-center px-5 py-4 rounded-xl text-sm font-medium transition-all duration-200 text-gray-300 hover:text-white hover:bg-accent w-full"
                        >
                          <LayoutDashboard className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" />
                          <div className="flex-1 text-left">
                            <div className="font-medium text-white">
                              Dashboard
                            </div>
                            <div className="text-xs text-gray-400">
                              Panel principal
                            </div>
                          </div>
                        </button>

                        {/* Settings Link */}
                        <button
                          type="button"
                          onClick={() => {
                            router.push("/dashboard/settings");
                            setIsMenuOpen(false);
                          }}
                          className="group flex items-center px-5 py-4 rounded-xl text-sm font-medium transition-all duration-200 text-gray-300 hover:text-white hover:bg-accent w-full"
                        >
                          <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" />
                          <div className="flex-1 text-left">
                            <div className="font-medium text-white">
                              Configuración
                            </div>
                            <div className="text-xs text-gray-400">
                              Ajustes de cuenta
                            </div>
                          </div>
                        </button>

                        {/* Profile Link */}
                        <button
                          type="button"
                          onClick={() => {
                            router.push("/dashboard/profile");
                            setIsMenuOpen(false);
                          }}
                          className="group flex items-center px-5 py-4 rounded-xl text-sm font-medium transition-all duration-200 text-gray-300 hover:text-white hover:bg-accent w-full"
                        >
                          <User className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" />
                          <div className="flex-1 text-left">
                            <div className="font-medium text-white">Perfil</div>
                            <div className="text-xs text-gray-400">
                              Información personal
                            </div>
                          </div>
                        </button>

                        {/* Logout Button */}
                        <div className="pt-4 border-t border-gray-700">
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="group flex items-center px-5 py-4 rounded-xl text-sm font-medium transition-all duration-200 text-red-400 hover:text-red-300 hover:bg-red-900/20 w-full"
                          >
                            <LogOut className="mr-3 h-5 w-5" />
                            <div className="flex-1 text-left">
                              <div className="font-medium">Cerrar Sesión</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <button
                          type="button"
                          onClick={handleSignIn}
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Iniciar Sesión
                        </button>
                        <Link
                          href="/signup"
                          onClick={() => setIsMenuOpen(false)}
                          className="w-full bg-transparent border border-gray-600 text-white hover:bg-gray-700 px-4 py-2 rounded-lg font-medium transition-colors block text-center"
                        >
                          Registrarse
                        </Link>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
