# Tipos TypeScript - Estructura Centralizada

Este directorio contiene todos los tipos TypeScript del sistema, organizados por dominio de negocio.

## Estructura

```
src/types/
├── index.ts              # Exportaciones centralizadas
├── schema.ts             # Fórmulas y reglas de negocio
├── instructor.ts         # Instructores, disciplinas y períodos
├── classes.ts            # Clases y covers
├── payments.ts           # Pagos y penalizaciones
├── workshops.ts          # Workshops, theme rides y brandings
├── imports.ts            # Tipos de importación de datos
├── user.ts               # Usuarios
├── auth.ts               # Autenticación
├── rbac.ts               # Roles y permisos
└── README.md             # Este archivo
```

## Guía de Uso

### Importación

```typescript
// Importar desde el índice central
import type { Instructor, Class, InstructorPayment } from "@/types";

// Importar desde un archivo específico (menos recomendado)
import type { Instructor } from "@/types/instructor";
```

## Archivos por Dominio

### `schema.ts`
- `InstructorCategory` - Categorías de instructores
- `CategoryRequirements` - Requisitos por categoría
- `PaymentParameters` - Parámetros de pago
- `PenaltyDiscountRules` - Reglas de descuento por penalizaciones
- `Formula` - Fórmulas de cálculo
- `Discipline` - Disciplinas
- `Period` - Períodos

### `instructor.ts`
- `Instructor` - Instructores
- `InstructorCategory` - Categorías de instructores
- `InstructorCategoryType` - Tipo de categoría
- `Discipline` - Disciplinas
- `Period` - Períodos
- `InstructorWithRelations` - Instructor con relaciones

### `classes.ts`
- `Class` - Clases
- `ClassWithRelations` - Clase con relaciones
- `Cover` - Covers
- `CoverWithRelations` - Cover con relaciones

### `payments.ts`
- `InstructorPayment` - Pagos a instructores
- `PaymentWithRelations` - Pago con relaciones
- `Penalty` - Penalizaciones
- `PenaltyType` - Tipos de penalización
- `PenaltyWithRelations` - Penalización con relaciones

### `workshops.ts`
- `Workshop` - Workshops
- `WorkshopWithRelations` - Workshop con relaciones
- `ThemeRide` - Theme Rides
- `ThemeRideWithRelations` - Theme Ride con relaciones
- `Branding` - Brandings
- `BrandingWithRelations` - Branding con relaciones

### `imports.ts`
- `SystemDiscipline` - Disciplina del sistema
- `ClassItem` - Item de clase para importación
- `TablaClasesResult` - Resultado de tabla de clases
- `ConfiguracionImportacion` - Configuración de importación
- `ErrorImportacion` - Error de importación
- `ResultadoImportacion` - Resultado de importación

## Convenciones

1. **Nombres de interfaces**: PascalCase (ej: `InstructorPayment`)
2. **Tipos básicos**: PascalCase (ej: `PenaltyType`)
3. **Relaciones**: Sufijo `WithRelations` (ej: `InstructorWithRelations`)
4. **Campos opcionales**: Usar `?` y `| null` (ej: `fullName?: string | null`)

## Mejores Prácticas

1. **No duplicar tipos**: Si un tipo se usa en múltiples lugares, centralizarlo
2. **Usar relaciones**: Crear versiones `WithRelations` cuando se necesiten datos relacionados
3. **Tipos específicos**: Evitar tipos genéricos como `any` o `unknown` cuando sea posible
4. **Exportar desde index.ts**: Todos los tipos deben exportarse desde `index.ts`

## Mantenimiento

Al agregar nuevos tipos:

1. Crear o actualizar el archivo del dominio correspondiente
2. Agregar la exportación en `index.ts`
3. Actualizar este README si es necesario
4. Usar los tipos en el código del sistema
