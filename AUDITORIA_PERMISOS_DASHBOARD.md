# 📋 Auditoría de Permisos - Dashboard

## Resumen Ejecutivo

Esta auditoría identifica todos los componentes y funcionalidades del dashboard que requieren permisos específicos según el esquema de RBAC definido en `schema.prisma`. Actualmente, muchas páginas usan `canManageUsers` de forma genérica cuando deberían usar permisos específicos del recurso.

---

## 🔍 Recursos de Permisos Disponibles (del schema.prisma)

Según `schema.prisma`, los recursos disponibles son:

### Recursos básicos del sistema:
- `USER` - Gestión de usuarios
- `ROLE` - Gestión de roles  
- `PERMISSION` - Gestión de permisos
- `DASHBOARD` - Acceso al dashboard
- `ADMIN` - Acceso administrativo

### Recursos de gestión de fitness:
- `INSTRUCTOR` - Gestión de instructores
- `DISCIPLINA` - Gestión de disciplinas
- `PERIODO` - Gestión de períodos
- `FORMULA` - Gestión de fórmulas de pago
- `CATEGORIA_INSTRUCTOR` - Gestión de categorías de instructores
- `CLASE` - Gestión de clases
- `COVER` - Gestión de covers/reemplazos
- `PENALIZACION` - Gestión de penalizaciones
- `PAGO_INSTRUCTOR` - Gestión de pagos a instructores
- `ARCHIVO` - Gestión de archivos
- `BRANDEO` - Gestión de brandeos
- `THEME_RIDE` - Gestión de theme rides
- `WORKSHOP` - Gestión de workshops

### Acciones disponibles:
- `CREATE` - Crear nuevo recurso
- `READ` - Ver/leer recursos
- `UPDATE` - Editar recursos existentes
- `DELETE` - Eliminar recursos
- `MANAGE` - Gestión completa (CREATE + READ + UPDATE + DELETE)

---

## 📊 Análisis por Página del Dashboard

### 1. `/dashboard/clases` - Gestión de Clases

**Archivo:** `src/app/(authenticated)/dashboard/clases/page.tsx`

#### Funcionalidades identificadas:

| Componente | Acción | Permiso Actual | Permiso Correcto |
|------------|--------|----------------|------------------|
| Botón "Nueva Clase" (Simple) | Crear clase | `canManageUsers` ❌ | `CREATE` sobre `CLASE` ✅ |
| Botón "Nueva Clase" (Versus) | Crear múltiples clases | `canManageUsers` ❌ | `CREATE` sobre `CLASE` ✅ |
| Acción "Editar" en tabla | Editar clase | `canManageUsers` ❌ | `UPDATE` sobre `CLASE` ✅ |
| Acción "Eliminar" en tabla | Eliminar clase | `canManageUsers` ❌ | `DELETE` sobre `CLASE` ✅ |
| Acción "Ver" en tabla | Ver detalles | Visible siempre ✅ | `READ` sobre `CLASE` ✅ |
| Visualizar lista de clases | Listar clases | Visible siempre ❌ | `READ` sobre `CLASE` ✅ |
| Exportar a Excel/PDF | Exportar datos | Visible siempre ❌ | `READ` sobre `CLASE` ✅ |

**Recomendaciones:**
- ❌ **CRÍTICO:** El botón "Nueva Clase" solo debe mostrarse con permiso `CREATE` sobre `CLASE`
- ❌ El acceso a la página completa debería requerir `READ` sobre `CLASE`
- ❌ Las acciones de editar/eliminar deben verificar `UPDATE`/`DELETE` sobre `CLASE`

---

### 2. `/dashboard/instructores` - Gestión de Instructores

**Archivo:** `src/app/(authenticated)/dashboard/instructores/page.tsx`

#### Funcionalidades identificadas:

| Componente | Acción | Permiso Actual | Permiso Correcto |
|------------|--------|----------------|------------------|
| Botón "Ver Detalles" | Ver instructor | Visible siempre ✅ | `READ` sobre `INSTRUCTOR` ✅ |
| Acción "Editar" en tabla | Editar instructor | `canManageUsers` ❌ | `UPDATE` sobre `INSTRUCTOR` ✅ |
| Acción "Eliminar" en tabla | Eliminar instructor | `canManageUsers` ❌ | `DELETE` sobre `INSTRUCTOR` ✅ |
| Visualizar lista | Listar instructores | Visible siempre ❌ | `READ` sobre `INSTRUCTOR` ✅ |
| Exportar a Excel/PDF | Exportar datos | Visible siempre ❌ | `READ` sobre `INSTRUCTOR` ✅ |

**Recomendaciones:**
- ❌ **Nota:** No hay botón de "Nuevo Instructor" visible, pero si existe debería requerir `CREATE` sobre `INSTRUCTOR`
- ❌ La página completa debe requerir `READ` sobre `INSTRUCTOR` para acceder
- ❌ Las acciones de editar/eliminar deben verificar permisos específicos

---

### 3. `/dashboard/disciplinas` - Gestión de Disciplinas

**Archivo:** `src/app/(authenticated)/dashboard/disciplinas/page.tsx`

#### Funcionalidades identificadas:

| Componente | Acción | Permiso Actual | Permiso Correcto |
|------------|--------|----------------|------------------|
| Botón "Nueva Disciplina" | Crear disciplina | `canManageUsers` ❌ | `CREATE` sobre `DISCIPLINA` ✅ |
| Acción "Ver" en tabla | Ver disciplina | Visible siempre ✅ | `READ` sobre `DISCIPLINA` ✅ |
| Acción "Editar" en tabla | Editar disciplina | `canManageUsers` ❌ | `UPDATE` sobre `DISCIPLINA` ✅ |
| Acción "Eliminar" en tabla | Eliminar disciplina | `canManageUsers` ❌ | `DELETE` sobre `DISCIPLINA` ✅ |
| Visualizar lista | Listar disciplinas | Visible siempre ❌ | `READ` sobre `DISCIPLINA` ✅ |
| Exportar a Excel | Exportar datos | Visible siempre ❌ | `READ` sobre `DISCIPLINA` ✅ |

**Recomendaciones:**
- ❌ **CRÍTICO:** Botón "Nueva Disciplina" solo con `CREATE` sobre `DISCIPLINA`
- ❌ Acceso a la página requiere `READ` sobre `DISCIPLINA`

---

### 4. `/dashboard/periodos` - Gestión de Períodos

**Archivo:** `src/app/(authenticated)/dashboard/periodos/page.tsx`

#### Funcionalidades identificadas:

| Componente | Acción | Permiso Actual | Permiso Correcto |
|------------|--------|----------------|------------------|
| Botón "Nuevo Período" | Crear período | `canManageUsers` ❌ | `CREATE` sobre `PERIODO` ✅ |
| Acción "Ver" en tabla | Ver período | Visible siempre ✅ | `READ` sobre `PERIODO` ✅ |
| Acción "Editar" en tabla | Editar período | `canManageUsers` ❌ | `UPDATE` sobre `PERIODO` ✅ |
| Acción "Eliminar" en tabla | Eliminar período | `canManageUsers` ❌ | `DELETE` sobre `PERIODO` ✅ |
| Visualizar lista | Listar períodos | Visible siempre ❌ | `READ` sobre `PERIODO` ✅ |
| Exportar a Excel | Exportar datos | Visible siempre ❌ | `READ` sobre `PERIODO` ✅ |

**Recomendaciones:**
- ❌ **CRÍTICO:** Botón "Nuevo Período" solo con `CREATE` sobre `PERIODO`
- ❌ Acceso a la página requiere `READ` sobre `PERIODO`

---

### 5. `/dashboard/formulas` - Gestión de Fórmulas

**Archivo:** `src/app/(authenticated)/dashboard/formulas/page.tsx`

#### Funcionalidades identificadas:

| Componente | Acción | Permiso Actual | Permiso Correcto |
|------------|--------|----------------|------------------|
| Botón "Nueva Fórmula" | Crear fórmula | `canManageUsers` ❌ | `CREATE` sobre `FORMULA` ✅ |
| Botón "Duplicar Fórmulas" | Duplicar fórmulas | `canManageUsers` ❌ | `CREATE` sobre `FORMULA` ✅ |
| Botón "Calcular" (en período) | Calcular con fórmulas | `canManageUsers` ❌ | `READ` sobre `FORMULA` + `READ` sobre `PAGO_INSTRUCTOR` ✅ |
| Botón "Editar" (por fórmula) | Editar fórmula | `canManageUsers` ❌ | `UPDATE` sobre `FORMULA` ✅ |
| Visualizar lista | Listar fórmulas | Visible siempre ❌ | `READ` sobre `FORMULA` ✅ |
| Exportar a Excel | Exportar datos | Visible siempre ❌ | `READ` sobre `FORMULA` ✅ |

**Recomendaciones:**
- ❌ **CRÍTICO:** Botones de creación/edición solo con permisos de `FORMULA`
- ❌ La funcionalidad de cálculo requiere permisos de lectura

---

### 6. `/dashboard/pagos` - Gestión de Pagos

**Archivo:** `src/app/(authenticated)/dashboard/pagos/page.tsx`

#### Funcionalidades identificadas:

| Componente | Acción | Permiso Actual | Permiso Correcto |
|------------|--------|----------------|------------------|
| Botón "Calcular Pagos" | Calcular pagos | Visible siempre ❌ | `UPDATE` o `MANAGE` sobre `PAGO_INSTRUCTOR` ✅ |
| Acción "Recalcular" (por pago) | Recalcular pago específico | `canManageUsers` ❌ | `UPDATE` sobre `PAGO_INSTRUCTOR` ✅ |
| Acción "Ver Detalles" | Ver detalles del pago | Visible siempre ✅ | `READ` sobre `PAGO_INSTRUCTOR` ✅ |
| Acción "Editar Reajuste" | Editar reajuste manual | `canManageUsers` ❌ | `UPDATE` sobre `PAGO_INSTRUCTOR` ✅ |
| Visualizar lista | Listar pagos | Visible siempre ❌ | `READ` sobre `PAGO_INSTRUCTOR` ✅ |
| Exportar a Excel | Exportar datos | Visible siempre ❌ | `READ` sobre `PAGO_INSTRUCTOR` ✅ |

**Recomendaciones:**
- ❌ **CRÍTICO:** El botón "Calcular Pagos" debe requerir permisos de actualización
- ❌ La edición de reajustes es crítica y debe protegerse con `UPDATE` sobre `PAGO_INSTRUCTOR`
- ❌ El acceso a la página requiere `READ` sobre `PAGO_INSTRUCTOR`

---

### 7. `/dashboard/users` - Gestión de Usuarios

**Archivo:** `src/app/(authenticated)/dashboard/users/page.tsx`

#### Funcionalidades identificadas:

| Componente | Acción | Permiso Actual | Permiso Correcto |
|------------|--------|----------------|------------------|
| Botón "Nuevo Usuario" | Crear usuario | Visible siempre ❌ | `CREATE` sobre `USER` ✅ |
| Acción "Ver Detalles" | Ver usuario | Visible siempre ✅ | `READ` sobre `USER` ✅ |
| Acción "Editar" en tabla | Editar usuario | `canManageUsers` o usuario actual ✅ | `UPDATE` sobre `USER` ✅ |
| Acción "Eliminar" en tabla | Eliminar usuario | `canManageUsers` o usuario actual ❌ | `DELETE` sobre `USER` ✅ |
| Gestión de roles en diálogo | Asignar/quitar roles | `canManageUsers` ❌ | `UPDATE` sobre `USER` + `READ` sobre `ROLE` ✅ |
| Visualizar lista | Listar usuarios | Visible siempre ❌ | `READ` sobre `USER` ✅ |

**Recomendaciones:**
- ❌ **CRÍTICO:** Botón "Nuevo Usuario" solo con `CREATE` sobre `USER`
- ❌ La gestión de roles requiere permisos adicionales de `ROLE`
- ⚠️ **Nota:** El permiso de editar/eliminar propio usuario puede ser especial

---

### 8. `/dashboard/roles` - Gestión de Roles

**Archivo:** `src/app/(authenticated)/dashboard/roles/page.tsx`

#### Funcionalidades identificadas:

| Componente | Acción | Permiso Actual | Permiso Correcto |
|------------|--------|----------------|------------------|
| Botón "Nuevo Rol" | Crear rol | `canManageRoles` ✅ | `CREATE` sobre `ROLE` ✅ |
| Acción "Ver Detalles" | Ver rol | Visible siempre ✅ | `READ` sobre `ROLE` ✅ |
| Acción "Editar" en tabla | Editar rol | `canManageRoles` ✅ | `UPDATE` sobre `ROLE` ✅ |
| Acción "Eliminar" en tabla | Eliminar rol | `canManageRoles` (deshabilitado si es sistema) ✅ | `DELETE` sobre `ROLE` ✅ |
| Botón "Gestionar" permisos | Asignar/quitar permisos | `canManageRoles` ✅ | `UPDATE` sobre `ROLE` + `READ` sobre `PERMISSION` ✅ |
| Visualizar lista | Listar roles | Visible siempre ❌ | `READ` sobre `ROLE` ✅ |

**Recomendaciones:**
- ✅ Esta página está mejor implementada, pero el acceso debe requerir `READ` sobre `ROLE`

---

### 9. `/dashboard/estadisticas` - Estadísticas

**Archivo:** `src/app/(authenticated)/dashboard/estadisticas/page.tsx`

#### Funcionalidades identificadas:

| Componente | Acción | Permiso Actual | Permiso Correcto |
|------------|--------|----------------|------------------|
| Visualizar estadísticas generales | Ver estadísticas | Visible siempre ❌ | `READ` sobre `DASHBOARD` o múltiples `READ` ✅ |
| Tab "General" | Ver estadísticas generales | Visible siempre ❌ | `READ` sobre múltiples recursos ✅ |
| Tab "Estudios" | Ver estadísticas de estudios | Visible siempre ❌ | `READ` sobre múltiples recursos ✅ |

**Recomendaciones:**
- ❌ Requiere `READ` sobre `DASHBOARD` o permisos de lectura sobre los recursos relacionados
- ℹ️ Puede requerir permisos de lectura sobre: `CLASE`, `INSTRUCTOR`, `PAGO_INSTRUCTOR`

---

### 10. `/dashboard/brandeos` - Gestión de Brandeos

**Archivo:** `src/app/(authenticated)/dashboard/brandeos/page.tsx`

#### Funcionalidades identificadas:

| Componente | Acción | Permiso Actual | Permiso Correcto |
|------------|--------|----------------|------------------|
| Botón "Nuevo Brandeo" | Crear brandeo | `canManageUsers` ❌ | `CREATE` sobre `BRANDEO` ✅ |
| Acción "Ver" en tabla | Ver brandeo | Visible siempre ✅ | `READ` sobre `BRANDEO` ✅ |
| Acción "Editar" en tabla | Editar brandeo | `canManageUsers` ❌ | `UPDATE` sobre `BRANDEO` ✅ |
| Acción "Eliminar" en tabla | Eliminar brandeo | `canManageUsers` ❌ | `DELETE` sobre `BRANDEO` ✅ |
| Visualizar lista | Listar brandeos | Visible siempre ❌ | `READ` sobre `BRANDEO` ✅ |
| Exportar a Excel | Exportar datos | Visible siempre ❌ | `READ` sobre `BRANDEO` ✅ |

**Recomendaciones:**
- ❌ **CRÍTICO:** Botón "Nuevo Brandeo" solo con `CREATE` sobre `BRANDEO`
- ❌ Acceso a la página requiere `READ` sobre `BRANDEO`

---

### 11. `/dashboard/theme-rides` - Gestión de Theme Rides

**Archivo:** `src/app/(authenticated)/dashboard/theme-rides/page.tsx`

#### Funcionalidades identificadas:

| Componente | Acción | Permiso Actual | Permiso Correcto |
|------------|--------|----------------|------------------|
| Botón "Nuevo Theme Ride" | Crear theme ride | `canManageUsers` ❌ | `CREATE` sobre `THEME_RIDE` ✅ |
| Acción "Ver" en tabla | Ver theme ride | Visible siempre ✅ | `READ` sobre `THEME_RIDE` ✅ |
| Acción "Editar" en tabla | Editar theme ride | `canManageUsers` ❌ | `UPDATE` sobre `THEME_RIDE` ✅ |
| Acción "Eliminar" en tabla | Eliminar theme ride | `canManageUsers` ❌ | `DELETE` sobre `THEME_RIDE` ✅ |
| Visualizar lista | Listar theme rides | Visible siempre ❌ | `READ` sobre `THEME_RIDE` ✅ |
| Exportar a Excel | Exportar datos | Visible siempre ❌ | `READ` sobre `THEME_RIDE` ✅ |

**Recomendaciones:**
- ❌ **CRÍTICO:** Botón "Nuevo Theme Ride" solo con `CREATE` sobre `THEME_RIDE`
- ❌ Acceso a la página requiere `READ` sobre `THEME_RIDE`

---

### 12. `/dashboard/workshops` - Gestión de Workshops

**Archivo:** `src/app/(authenticated)/dashboard/workshops/page.tsx`

#### Funcionalidades identificadas:

| Componente | Acción | Permiso Actual | Permiso Correcto |
|------------|--------|----------------|------------------|
| Botón "Nuevo Workshop" | Crear workshop | `canManageUsers` ❌ | `CREATE` sobre `WORKSHOP` ✅ |
| Acción "Ver" en tabla | Ver workshop | Visible siempre ✅ | `READ` sobre `WORKSHOP` ✅ |
| Acción "Editar" en tabla | Editar workshop | `canManageUsers` ❌ | `UPDATE` sobre `WORKSHOP` ✅ |
| Acción "Eliminar" en tabla | Eliminar workshop | `canManageUsers` ❌ | `DELETE` sobre `WORKSHOP` ✅ |
| Visualizar lista | Listar workshops | Visible siempre ❌ | `READ` sobre `WORKSHOP` ✅ |
| Exportar a Excel | Exportar datos | Visible siempre ❌ | `READ` sobre `WORKSHOP` ✅ |

**Recomendaciones:**
- ❌ **CRÍTICO:** Botón "Nuevo Workshop" solo con `CREATE` sobre `WORKSHOP`
- ❌ Acceso a la página requiere `READ` sobre `WORKSHOP`

---

## ⚠️ Problemas Críticos Identificados

### 1. Uso Incorrecto de `canManageUsers`
**Problema:** Múltiples páginas usan `canManageUsers` como permiso genérico para recursos que no son usuarios.

**Impacto:**
- ❌ Un usuario con permisos de gestión de usuarios puede acceder a funciones de otras áreas (clases, instructores, pagos, etc.)
- ❌ No hay separación de responsabilidades

**Solución:**
- Usar permisos específicos por recurso (ej: `hasPermission(CREATE, CLASE)`)

### 2. Falta de Control de Acceso a Páginas Completas
**Problema:** La mayoría de las páginas no verifican permisos antes de renderizar.

**Impacto:**
- ❌ Usuarios sin permisos pueden ver listas de datos aunque no puedan editarlos

**Solución:**
- Implementar `ProtectedRoute` con verificaciones de permisos específicas
- Usar `READ` sobre el recurso correspondiente

### 3. Exportación Sin Control de Permisos
**Problema:** Los botones de exportación están disponibles sin verificar permisos.

**Impacto:**
- ❌ Usuarios pueden exportar datos aunque no deberían tener acceso de lectura

**Solución:**
- Verificar `READ` sobre el recurso antes de mostrar botones de exportación

---

## ✅ Recomendaciones de Implementación

### 1. Actualizar `PermissionResource` en `src/types/rbac.ts`

Agregar todos los recursos del schema:

```typescript
export enum PermissionResource {
  // ... recursos existentes
  INSTRUCTOR = "INSTRUCTOR",
  DISCIPLINA = "DISCIPLINA",
  PERIODO = "PERIODO",
  FORMULA = "FORMULA",
  CATEGORIA_INSTRUCTOR = "CATEGORIA_INSTRUCTOR",
  CLASE = "CLASE",
  COVER = "COVER",
  PENALIZACION = "PENALIZACION",
  PAGO_INSTRUCTOR = "PAGO_INSTRUCTOR",
  ARCHIVO = "ARCHIVO",
  BRANDEO = "BRANDEO",
  THEME_RIDE = "THEME_RIDE",
  WORKSHOP = "WORKSHOP",
}
```

### 2. Extender `useRBAC` Hook

Agregar helpers específicos por recurso:

```typescript
// Ejemplo para clases
const canCreateClass = hasPermission(PermissionAction.CREATE, PermissionResource.CLASE);
const canUpdateClass = hasPermission(PermissionAction.UPDATE, PermissionResource.CLASE);
const canDeleteClass = hasPermission(PermissionAction.DELETE, PermissionResource.CLASE);
const canReadClass = hasPermission(PermissionAction.READ, PermissionResource.CLASE);
```

### 3. Actualizar Componentes

Ejemplo para el botón "Nueva Clase":

**Antes:**
```tsx
{canManageUsers && (
  <Button onClick={handleCreateSimple}>
    Nueva Clase
  </Button>
)}
```

**Después:**
```tsx
{hasPermission(PermissionAction.CREATE, PermissionResource.CLASE) && (
  <Button onClick={handleCreateSimple}>
    Nueva Clase
  </Button>
)}
```

### 4. Implementar Protección de Rutas

Crear un componente `ProtectedRoute` mejorado:

```tsx
<ProtectedRoute 
  requiredPermission={{ action: PermissionAction.READ, resource: PermissionResource.CLASE }}
>
  <ClasesPage />
</ProtectedRoute>
```

### 5. Actualizar Seed para Incluir Nuevos Permisos

El `seed.ts` debe crear todos los permisos para cada recurso y acción:

```typescript
// Para cada recurso de fitness
const fitnessResources = [
  'INSTRUCTOR', 'DISCIPLINA', 'PERIODO', 'FORMULA', 
  'CATEGORIA_INSTRUCTOR', 'CLASE', 'COVER', 'PENALIZACION',
  'PAGO_INSTRUCTOR', 'ARCHIVO', 'BRANDEO', 'THEME_RIDE', 'WORKSHOP'
];

// Para cada recurso, crear permisos CREATE, READ, UPDATE, DELETE, MANAGE
```

---

## 📝 Priorización

### Prioridad ALTA (Crítico)
1. ✅ Actualizar `PermissionResource` enum
2. ✅ Proteger botones de creación en todas las páginas
3. ✅ Proteger acciones de edición/eliminación
4. ✅ Implementar protección de acceso a páginas completas

### Prioridad MEDIA
1. ⚠️ Proteger funcionalidades de exportación
2. ⚠️ Actualizar seed para crear todos los permisos
3. ⚠️ Actualizar roles por defecto con permisos específicos

### Prioridad BAJA
1. ℹ️ Mejorar mensajes de error cuando falta permisos
2. ℹ️ Documentar permisos requeridos en código
3. ℹ️ Crear tests para verificación de permisos

---

## 🔗 Referencias

- **Schema:** `prisma/schema.prisma` - Líneas 206-233 (PermissionAction y PermissionResource enums)
- **Router RBAC:** `src/server/routers/rbac.ts`
- **Types RBAC:** `src/types/rbac.ts`
- **Hook RBAC:** `src/hooks/useRBAC.ts`
- **Seed:** `prisma/seed.ts`

---

**Fecha de auditoría:** $(date)
**Auditor:** Sistema de análisis de código

