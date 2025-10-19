# Dashboard Sidebar - Layout Basado en Roles

Un sidebar simple y funcional que se adapta automáticamente según el rol del usuario, implementado sin componentes de shadcn/ui.

## 🏗️ Estructura del Layout

### **Container Principal**
```
┌─────────────────────────────────────────────────────────────┐
│                     Navbar (h-16)                          │
├─────────────────────────────────────────────────────────────┤
│                h-[calc(100vh-4rem)]                         │
├─────────────────┬───────────────────────────────────────────┤
│                 │                                           │
│   Sidebar       │           Main Content                    │
│   300px         │           flex-1                          │
│   (fixed)       │           (responsive)                    │
│                 │                                           │
│                 │                                           │
└─────────────────┴───────────────────────────────────────────┘
```

### **Componentes**
- **Layout**: `src/app/(authenticated)/layout.tsx` - Container principal con flex
- **Sidebar**: `src/components/dashboard/DashboardSidebar.tsx` - Navegación adaptativa
- **Content**: `children` - Área principal de contenido con padding

## 🔐 Navegación por Roles

### **Super Admin (Acceso Completo)**
```
📊 Dashboard
  └── Inicio

👨‍💼 Administración  
  ├── Usuarios
  └── Roles

⚙️ Configuración
  ├── Configuraciones del Sistema
  └── Información de la Empresa
```

### **Admin (TODO: Definir permisos específicos)**
```
📊 Dashboard
  └── Inicio

👨‍💼 Gestión
  └── Usuarios (limitado)
```

### **Usuario (TODO: Implementar rutas)**
```
📊 Dashboard
  └── Inicio

⚙️ Configuración
  ├── Mi Perfil        → TODO: /dashboard/profile
  ├── Configuraciones  → TODO: /dashboard/settings  
  └── Actividad        → TODO: /dashboard/activity
```

### **Viewer (TODO: Implementar rutas)**
```
📊 Dashboard
  └── Inicio

📋 Informes
  └── Reportes         → TODO: /dashboard/reports
```

## 🎨 Diseño y UX

### **Header del Sidebar**
- **Título**: "Dashboard" 
- **Subtítulo**: Muestra el rol del usuario dinámicamente
- **Separador**: Border inferior sutil

### **Navegación**
- **Secciones**: Agrupadas por funcionalidad
- **Enlaces activos**: Fondo negro, texto blanco
- **Hover states**: Fondo gris claro sutil
- **Íconos**: Lucide icons consistentes
- **Descripciones**: Tooltips informativos opcionales

### **Estados Visuales**
```scss
// Enlace activo
.active {
  background: #111827;  // gray-900
  color: white;
}

// Enlace hover
.hover {
  background: #f9fafb;  // gray-50
  color: #111827;       // gray-900
}

// Enlace normal
.normal {
  color: #4b5563;       // gray-600
}
```

### **Footer del Sidebar**
- **Super Admin**: ✅ "Acceso Total" (verde)
- **Otros roles**: ⚠️ "Acceso limitado por rol" (gris)

## 🛠️ Implementación Técnica

### **Detección de Rutas Activas**
```typescript
const isActive = (href: string) => {
  if (href === "/dashboard") {
    return pathname === href;  // Exact match for root
  }
  return pathname.startsWith(href);  // Prefix match for subroutes
};
```

### **Configuración Dinámica**
```typescript
const getSidebarSections = (): SidebarSection[] => {
  if (isSuperAdmin) return superAdminRoutes;
  if (isAdmin) return adminRoutes;      // TODO: Definir
  if (hasRole("user")) return userRoutes;   // TODO: Implementar
  if (hasRole("viewer")) return viewerRoutes;   // TODO: Implementar
  return defaultRoutes;
};
```

### **Integración con RBAC**
- Usa `useRBAC()` hook para verificar permisos
- Filtra rutas automáticamente según rol
- Soporte para múltiples roles por usuario

## 📋 TODOs Pendientes

### **Rutas por Implementar**
1. **Admin específico**: Definir permisos granulares vs Super Admin
2. **Usuario rutas**: 
   - `/dashboard/my-accounts` - Gestión de cuentas personales
   - `/dashboard/my-trades` - Historial de operaciones
   - `/dashboard/analytics` - Análisis de rendimiento
3. **Viewer rutas**:
   - `/dashboard/reports` - Reportes de solo lectura

### **Mejoras Futuras**
- [ ] Sidebar colapsible para móviles
- [ ] Breadcrumbs en header principal
- [ ] Notificaciones por sección
- [ ] Favoritos/atajos rápidos
- [ ] Búsqueda de navegación

## 🎯 Beneficios del Diseño

### **Simplicidad**
- **Sin dependencias** de shadcn/ui sidebar
- **HTML/CSS nativo** con Tailwind
- **Menos JavaScript** = mejor performance

### **Flexibilidad**
- **Adaptativo por rol** automáticamente
- **Fácil extensión** para nuevos roles
- **Configuración declarativa** en un solo lugar

### **UX Consistente**
- **300px fijo** evita layout shifts
- **Estados visuales claros** para navegación
- **Información contextual** en cada enlace

El nuevo sidebar proporciona una **base sólida y extensible** para el sistema de navegación basado en roles! 🚀
