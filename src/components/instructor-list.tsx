"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/utils/trpc";
import { Banknote, Calendar, Phone, TrendingUp, User } from "lucide-react";

interface Discipline {
  id: string;
  name: string;
  color: string | null;
}

interface Class {
  id: string;
  discipline: {
    name: string;
    color: string | null;
  };
  totalReservations: number;
  spots: number;
  paidReservations: number;
  date: string;
}

interface Instructor {
  id: string;
  name: string;
  fullName: string | null;
  active: boolean;
  phone: string | null;
  DNI: string | null;
  contactPerson: string | null;
  bankAccount: string | null;
  CCI: string | null;
  bank: string | null;
  disciplines?: Discipline[];
  classes?: Class[];
  payments?: { id: string; amount: number; status: string }[];
}

export function InstructorList() {
  const {
    data: instructors,
    isLoading,
    error,
  } = trpc.instructor.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={`skeleton-${i}`}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Error loading instructors: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!instructors || instructors.instructors.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <User className="mx-auto h-12 w-12 mb-4" />
            <p>No instructors found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Our Instructors</h2>
          <p className="text-muted-foreground">
            Meet our talented team of fitness professionals
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {instructors.instructors.length} Instructors
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {instructors.instructors.map((instructor: Instructor) => (
          <Card
            key={instructor.id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={`/images/avatars/${instructor.name.toLowerCase().replace(/\s+/g, "-")}.jpg`}
                  />
                  <AvatarFallback>
                    {instructor.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">
                    {instructor.name}
                  </CardTitle>
                  <CardDescription className="truncate">
                    {instructor.fullName || instructor.name}
                  </CardDescription>
                </div>
                <Badge variant={instructor.active ? "default" : "secondary"}>
                  {instructor.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Information */}
              <div className="space-y-2">
                {instructor.phone && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{instructor.phone}</span>
                  </div>
                )}
                {instructor.DNI && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>DNI: {instructor.DNI}</span>
                  </div>
                )}
                {instructor.contactPerson && (
                  <div className="text-sm text-muted-foreground">
                    Contact: {instructor.contactPerson}
                  </div>
                )}
              </div>

              {/* Disciplines */}
              {instructor.disciplines && instructor.disciplines.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Specialties</h4>
                  <div className="flex flex-wrap gap-1">
                    {instructor.disciplines.map((discipline: Discipline) => (
                      <Badge
                        key={discipline.id}
                        variant="outline"
                        className="text-xs"
                        style={{ borderColor: discipline.color || undefined }}
                      >
                        {discipline.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Recent Activity</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>{instructor.classes?.length || 0} Classes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Banknote className="h-4 w-4 text-green-500" />
                    <span>{instructor.payments?.length || 0} Payments</span>
                  </div>
                </div>
              </div>

              {/* Recent Classes */}
              {instructor.classes && instructor.classes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Recent Classes</h4>
                  <div className="space-y-1">
                    {instructor.classes.slice(0, 3).map((cls: Class) => (
                      <div
                        key={cls.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                cls.discipline.color || undefined,
                            }}
                          />
                          <span>{cls.discipline.name}</span>
                        </div>
                        <div className="text-muted-foreground">
                          {cls.paidReservations}/{cls.spots}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Indicator */}
              {instructor.classes && instructor.classes.length > 0 && (
                <div className="flex items-center space-x-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>
                    Avg. Occupation:{" "}
                    {Math.round(
                      (instructor.classes.reduce(
                        (sum: number, cls: Class) =>
                          sum + cls.paidReservations / cls.spots,
                        0
                      ) /
                        instructor.classes.length) *
                        100
                    )}
                    %
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
