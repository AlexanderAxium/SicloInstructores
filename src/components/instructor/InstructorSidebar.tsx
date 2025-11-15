"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstructorAuth } from "@/contexts/InstructorAuthContext";
import type { PaymentsListResponse } from "@/types/payments";
import { trpc } from "@/utils/trpc";
import {
  Award,
  Calculator,
  Calendar,
  CreditCard,
  LogOut,
  Receipt,
  User,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

export function InstructorSidebar() {
  const pathname = usePathname();
  const { instructor, logout } = useInstructorAuth();

  // Get payments for the instructor
  const paymentsQuery = trpc.payments.getWithFilters.useQuery(
    {
      instructorId: instructor?.id,
      limit: 50, // Get more payments for the sidebar
      offset: 0,
    },
    { enabled: !!instructor?.id }
  );

  const paymentsData = paymentsQuery.data as PaymentsListResponse | undefined;
  const isLoadingPayments = paymentsQuery.isLoading;

  const skeletonKeys = useMemo(
    () =>
      Array.from(
        { length: 3 },
        (_, i) => `payment-skeleton-${i}-${Date.now()}`
      ),
    []
  );

  const navItems: NavItem[] = [
    {
      title: "Mi Perfil",
      href: "/instructor",
      icon: User,
      description: "Información personal y estadísticas",
    },
    {
      title: "Covers",
      href: "/instructor/covers",
      icon: UserCheck,
      description: "Crea y gestiona tus covers",
    },
  ];

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const _formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "short",
    }).format(new Date(date));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {instructor ? getInitials(instructor.name) : "IN"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">
              {instructor?.name || "Instructor"}
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              {instructor?.fullName || "Panel de Instructor"}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/instructor" &&
                    pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-2 min-w-0"
                        title={item.description}
                      >
                        <item.icon className="flex-shrink-0 h-4 w-4" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Payments Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Mis Pagos</SidebarGroupLabel>
          <SidebarGroupContent>
            {isLoadingPayments ? (
              <div className="px-2 py-1 space-y-2">
                {skeletonKeys.map((key) => (
                  <Skeleton key={key} className="h-8 w-full" />
                ))}
              </div>
            ) : paymentsData?.payments && paymentsData.payments.length > 0 ? (
              <SidebarMenu>
                {paymentsData.payments.slice(0, 10).map((payment) => {
                  const isActive = pathname === `/pago/${payment.id}`;

                  return (
                    <SidebarMenuItem key={payment.id}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link
                          href={`/pago/${payment.id}`}
                          className="flex items-center gap-2 min-w-0"
                          title={`Pago ${payment.period?.number || ""} - ${payment.period?.year || ""}`}
                        >
                          <Receipt className="flex-shrink-0 h-4 w-4" />
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-sm">
                              Período {payment.period?.number || ""} -{" "}
                              {payment.period?.year || ""}
                            </div>
                            <div className="text-xs text-muted-foreground/70 truncate">
                              {formatCurrency(payment.finalPayment)}
                            </div>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
                {paymentsData.payments.length > 10 && (
                  <div className="px-2 py-1 text-xs text-muted-foreground">
                    +{paymentsData.payments.length - 10} pagos más
                  </div>
                )}
              </SidebarMenu>
            ) : (
              <div className="px-2 py-1 text-xs text-muted-foreground">
                No hay pagos disponibles
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="w-full justify-start gap-2"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
