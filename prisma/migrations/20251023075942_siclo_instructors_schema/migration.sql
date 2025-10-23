-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."PermissionResource" ADD VALUE 'INSTRUCTOR';
ALTER TYPE "public"."PermissionResource" ADD VALUE 'DISCIPLINA';
ALTER TYPE "public"."PermissionResource" ADD VALUE 'PERIODO';
ALTER TYPE "public"."PermissionResource" ADD VALUE 'FORMULA';
ALTER TYPE "public"."PermissionResource" ADD VALUE 'CATEGORIA_INSTRUCTOR';
ALTER TYPE "public"."PermissionResource" ADD VALUE 'CLASE';
ALTER TYPE "public"."PermissionResource" ADD VALUE 'COVER';
ALTER TYPE "public"."PermissionResource" ADD VALUE 'PENALIZACION';
ALTER TYPE "public"."PermissionResource" ADD VALUE 'PAGO_INSTRUCTOR';
ALTER TYPE "public"."PermissionResource" ADD VALUE 'ARCHIVO';
ALTER TYPE "public"."PermissionResource" ADD VALUE 'BRANDEO';
ALTER TYPE "public"."PermissionResource" ADD VALUE 'THEME_RIDE';
ALTER TYPE "public"."PermissionResource" ADD VALUE 'WORKSHOP';

-- CreateTable
CREATE TABLE "public"."instructors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "password" TEXT,
    "extraInfo" JSONB,
    "lastBonus" JSONB,
    "contactPerson" TEXT,
    "bankAccount" TEXT,
    "CCI" TEXT,
    "bank" TEXT,
    "phone" TEXT,
    "DNI" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "instructors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."disciplines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "disciplines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."periods" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "bonusCalculated" BOOLEAN DEFAULT false,
    "discountRules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."formulas" (
    "id" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "categoryRequirements" JSONB NOT NULL,
    "paymentParameters" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "formulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."instructor_categories" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isManual" BOOLEAN DEFAULT false,
    "metrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "instructor_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."classes" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "studio" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "totalReservations" INTEGER NOT NULL DEFAULT 0,
    "waitingLists" INTEGER NOT NULL DEFAULT 0,
    "complimentary" INTEGER NOT NULL DEFAULT 0,
    "spots" INTEGER NOT NULL,
    "paidReservations" INTEGER NOT NULL DEFAULT 0,
    "specialText" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "replacementInstructorId" TEXT,
    "penaltyType" TEXT,
    "penaltyPoints" INTEGER,
    "isVersus" BOOLEAN NOT NULL DEFAULT false,
    "versusNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."covers" (
    "id" TEXT NOT NULL,
    "originalInstructorId" TEXT NOT NULL,
    "replacementInstructorId" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "classId" TEXT,
    "justification" TEXT NOT NULL DEFAULT 'PENDING',
    "bonusPayment" BOOLEAN NOT NULL DEFAULT false,
    "fullHousePayment" BOOLEAN NOT NULL DEFAULT false,
    "comments" TEXT,
    "nameChange" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "covers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."penalties" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "disciplineId" TEXT,
    "periodId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "penalties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."instructor_payments" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "instructorId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "details" JSONB,
    "meetsGuidelines" BOOLEAN,
    "doubleShifts" INTEGER,
    "nonPrimeHours" DOUBLE PRECISION,
    "eventParticipation" BOOLEAN,
    "retention" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "adjustment" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "penalty" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "cover" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "branding" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "themeRide" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "workshop" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "versusBonus" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "adjustmentType" TEXT NOT NULL DEFAULT 'FIXED',
    "bonus" DOUBLE PRECISION,
    "finalPayment" DOUBLE PRECISION NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "instructor_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."files" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."brandings" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "instructorId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "brandings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."theme_rides" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "instructorId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "theme_rides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workshops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "comments" TEXT,
    "payment" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "workshops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_DisciplineToInstructor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DisciplineToInstructor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "instructors_tenantId_idx" ON "public"."instructors"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "instructors_name_tenantId_key" ON "public"."instructors"("name", "tenantId");

-- CreateIndex
CREATE INDEX "disciplines_tenantId_idx" ON "public"."disciplines"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "disciplines_name_tenantId_key" ON "public"."disciplines"("name", "tenantId");

-- CreateIndex
CREATE INDEX "periods_tenantId_idx" ON "public"."periods"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "periods_number_year_tenantId_key" ON "public"."periods"("number", "year", "tenantId");

-- CreateIndex
CREATE INDEX "formulas_tenantId_idx" ON "public"."formulas"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "formulas_disciplineId_periodId_tenantId_key" ON "public"."formulas"("disciplineId", "periodId", "tenantId");

-- CreateIndex
CREATE INDEX "instructor_categories_tenantId_idx" ON "public"."instructor_categories"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "instructor_categories_instructorId_disciplineId_periodId_te_key" ON "public"."instructor_categories"("instructorId", "disciplineId", "periodId", "tenantId");

-- CreateIndex
CREATE INDEX "classes_tenantId_idx" ON "public"."classes"("tenantId");

-- CreateIndex
CREATE INDEX "classes_date_idx" ON "public"."classes"("date");

-- CreateIndex
CREATE INDEX "covers_tenantId_idx" ON "public"."covers"("tenantId");

-- CreateIndex
CREATE INDEX "covers_date_idx" ON "public"."covers"("date");

-- CreateIndex
CREATE INDEX "penalties_tenantId_idx" ON "public"."penalties"("tenantId");

-- CreateIndex
CREATE INDEX "penalties_instructorId_idx" ON "public"."penalties"("instructorId");

-- CreateIndex
CREATE INDEX "instructor_payments_tenantId_idx" ON "public"."instructor_payments"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "instructor_payments_instructorId_periodId_tenantId_key" ON "public"."instructor_payments"("instructorId", "periodId", "tenantId");

-- CreateIndex
CREATE INDEX "files_tenantId_idx" ON "public"."files"("tenantId");

-- CreateIndex
CREATE INDEX "brandings_tenantId_idx" ON "public"."brandings"("tenantId");

-- CreateIndex
CREATE INDEX "theme_rides_tenantId_idx" ON "public"."theme_rides"("tenantId");

-- CreateIndex
CREATE INDEX "workshops_tenantId_idx" ON "public"."workshops"("tenantId");

-- CreateIndex
CREATE INDEX "workshops_date_idx" ON "public"."workshops"("date");

-- CreateIndex
CREATE INDEX "_DisciplineToInstructor_B_index" ON "public"."_DisciplineToInstructor"("B");

-- AddForeignKey
ALTER TABLE "public"."instructors" ADD CONSTRAINT "instructors_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."disciplines" ADD CONSTRAINT "disciplines_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."periods" ADD CONSTRAINT "periods_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."formulas" ADD CONSTRAINT "formulas_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "public"."disciplines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."formulas" ADD CONSTRAINT "formulas_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "public"."periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."formulas" ADD CONSTRAINT "formulas_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."instructor_categories" ADD CONSTRAINT "instructor_categories_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "public"."instructors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."instructor_categories" ADD CONSTRAINT "instructor_categories_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "public"."disciplines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."instructor_categories" ADD CONSTRAINT "instructor_categories_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "public"."periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."instructor_categories" ADD CONSTRAINT "instructor_categories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "public"."instructors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "public"."disciplines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "public"."periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."classes" ADD CONSTRAINT "classes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."covers" ADD CONSTRAINT "covers_originalInstructorId_fkey" FOREIGN KEY ("originalInstructorId") REFERENCES "public"."instructors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."covers" ADD CONSTRAINT "covers_replacementInstructorId_fkey" FOREIGN KEY ("replacementInstructorId") REFERENCES "public"."instructors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."covers" ADD CONSTRAINT "covers_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "public"."disciplines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."covers" ADD CONSTRAINT "covers_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "public"."periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."covers" ADD CONSTRAINT "covers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."covers" ADD CONSTRAINT "covers_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."penalties" ADD CONSTRAINT "penalties_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "public"."instructors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."penalties" ADD CONSTRAINT "penalties_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "public"."disciplines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."penalties" ADD CONSTRAINT "penalties_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "public"."periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."penalties" ADD CONSTRAINT "penalties_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."instructor_payments" ADD CONSTRAINT "instructor_payments_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "public"."instructors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."instructor_payments" ADD CONSTRAINT "instructor_payments_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "public"."periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."instructor_payments" ADD CONSTRAINT "instructor_payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."files" ADD CONSTRAINT "files_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."brandings" ADD CONSTRAINT "brandings_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "public"."instructors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."brandings" ADD CONSTRAINT "brandings_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "public"."periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."brandings" ADD CONSTRAINT "brandings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."theme_rides" ADD CONSTRAINT "theme_rides_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "public"."instructors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."theme_rides" ADD CONSTRAINT "theme_rides_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "public"."periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."theme_rides" ADD CONSTRAINT "theme_rides_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workshops" ADD CONSTRAINT "workshops_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "public"."instructors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workshops" ADD CONSTRAINT "workshops_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "public"."periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workshops" ADD CONSTRAINT "workshops_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DisciplineToInstructor" ADD CONSTRAINT "_DisciplineToInstructor_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."disciplines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DisciplineToInstructor" ADD CONSTRAINT "_DisciplineToInstructor_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."instructors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
