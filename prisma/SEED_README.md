# Seed Completo de Base de Datos - MyApp Platform

Este archivo contiene un seed completo que **elimina todos los datos existentes** y crea un sistema completo desde cero con usuarios de todos los tipos.

## 📋 Datos Incluidos

### 🏢 Infraestructura Base
- **Empresa**: Información completa de MyApp Platform
- **Usuarios**: Usuarios de prueba con diferentes roles
- **Roles**: Sistema RBAC completo

### 👥 Usuarios de Todos los Tipos (8 usuarios)

| Usuario | Email | Contraseña | Rol | Idioma | Suscripción |
|---------|-------|------------|-----|--------|-------------|
| **Super Admin** | `superadmin@myapp.com` | `SuperAdmin123!@#` | super_admin | EN | Premium |
| **Admin User** | `admin@myapp.com` | `Admin123!@#` | admin | EN | Premium |
| **Moderator User** | `moderator@myapp.com` | `Moderator123!@#` | moderator | ES | Premium |
| **Alex User** | `user@myapp.com` | `User123!@#` | user | ES | Premium |
| **Maria Rodriguez** | `maria@myapp.com` | `Maria123!@#` | user | ES | Premium |
| **John Smith** | `john@myapp.com` | `John123!@#` | user | EN | Premium |
| **Ana Silva** | `ana@myapp.com` | `Ana123!@#` | user | PT | Premium |
| **Viewer User** | `viewer@myapp.com` | `Viewer123!@#` | viewer | EN | Free |

### 🔐 Sistema RBAC
- **5 Roles**: super_admin, admin, moderator, user, viewer
- **Permisos**: Sistema completo de permisos granulares
- **Jerarquía**: Super Admin > Admin > Moderator > User > Viewer

## 🚀 Cómo Ejecutar el Seed

### 1. Ejecutar el Seed
```bash
pnpm db:seed
```

### 2. Verificar los Datos
```bash
pnpm db:studio
```

## 📊 Datos Creados

- ✅ **1 empresa** con información completa
- ✅ **5 roles** con permisos granulares
- ✅ **8 usuarios** (1 super admin, 1 admin, 1 moderator, 4 users, 1 viewer)
- ✅ Sistema RBAC completo

## 👤 Usuarios de Prueba

### 🔑 Super Admin
- **Email**: `superadmin@myapp.com`
- **Contraseña**: `SuperAdmin123!@#`
- **Permisos**: Acceso completo al sistema

### 👨‍💼 Admin
- **Email**: `admin@myapp.com`
- **Contraseña**: `Admin123!@#`
- **Permisos**: Gestión de usuarios y configuraciones

### 👨‍💻 Moderator
- **Email**: `moderator@myapp.com`
- **Contraseña**: `Moderator123!@#`
- **Permisos**: Moderación y gestión limitada

### 👤 Users (4 usuarios)
- **Alex**: `user@myapp.com` / `User123!@#`
- **Maria**: `maria@myapp.com` / `Maria123!@#`
- **John**: `john@myapp.com` / `John123!@#`
- **Ana**: `ana@myapp.com` / `Ana123!@#`
- **Permisos**: Acceso a funcionalidades básicas

### 👁️ Viewer
- **Email**: `viewer@myapp.com`
- **Contraseña**: `Viewer123!@#`
- **Permisos**: Solo lectura

## 🔧 Personalización

### Agregar Más Usuarios
1. Modifica el array `users` en el archivo seed
2. Ejecuta `pnpm db:seed` para aplicar cambios

### Modificar Roles
1. Edita los roles en la sección correspondiente
2. Actualiza los permisos según sea necesario

## 🧪 Testing

### Usuarios para Testing
- Usa `user@myapp.com` para testing de funcionalidades básicas
- Usa `admin@myapp.com` para testing de administración
- Usa `viewer@myapp.com` para testing de permisos de solo lectura
- Usa `superadmin@myapp.com` para testing completo del sistema

## ⚠️ Importante

- Este seed **elimina todos los datos existentes**
- Úsalo solo en desarrollo o para resetear la base de datos
- En producción, usa migraciones incrementales
