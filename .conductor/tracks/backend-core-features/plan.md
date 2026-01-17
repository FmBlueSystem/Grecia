# Plan: Backend Core Features

## Status: 🏗️ En Progreso (Parcialmente Implementado)

## 📝 Todo List

### Phase 0: Foundation (Verificación del Estado Actual)
- [x] Verificar que el Schema de Prisma cumple con los requisitos.
- [x] Asegurar que la conexión a BD es estable en Docker.
- [x] PostgreSQL funcionando correctamente.

### Phase 1: Capa de Autenticación
- [x] Instalar/Verificar dependencias de Auth (`jsonwebtoken`, `bcrypt`, `@fastify/jwt`).
- [x] Implementar `AuthPlugin` (decorador de Fastify para verificar JWT).
- [x] Crear endpoint `POST /api/auth/login`.
- [x] Crear endpoint `POST /api/auth/register`.
- [ ] Crear endpoint `POST /api/auth/refresh` (Token refresh).
- [x] Verificación Manual: Flujos probados con Postman/Curl.

### Phase 2: CRUD de Entidades Core
- [x] **Users**:
    - [x] `GET /api/users/me` (Protegido).
- [x] **Contacts**:
    - [x] `GET /api/contacts` (Lista con paginación).
    - [x] `POST /api/contacts` (Crear).
    - [x] `GET /api/contacts/:id` (Detalle).
    - [x] `PUT /api/contacts/:id` (Actualizar).
    - [x] `DELETE /api/contacts/:id` (Eliminar).
- [x] **Accounts**:
    - [x] `GET /api/accounts` (Lista).
    - [x] `POST /api/accounts` (Crear).
    - [x] `GET /api/accounts/:id` (Detalle).
    - [x] `PUT /api/accounts/:id` (Actualizar).
    - [x] `DELETE /api/accounts/:id` (Eliminar).
- [x] **Opportunities**:
    - [x] `GET /api/opportunities` (Lista).
    - [x] `POST /api/opportunities` (Crear).
    - [x] `GET /api/opportunities/:id` (Detalle).
    - [x] `PUT /api/opportunities/:id` (Actualizar).
    - [x] `DELETE /api/opportunities/:id` (Eliminar).
- [x] **Activities**:
    - [x] `GET /api/activities` (Lista).
    - [x] `POST /api/activities` (Crear).
    - [x] CRUD completo implementado.

### Phase 3: Integración
- [x] Verificar que el Frontend puede hacer login contra los nuevos endpoints.
- [x] Dashboard consume datos reales del backend.

### Phase 4: Endpoints Adicionales Implementados (No en plan original)
- [x] **Dashboard**: `GET /api/dashboard/stats` (Métricas agregadas).
- [x] **Leads**: CRUD completo de Leads.
- [x] **Quotes**: CRUD de cotizaciones.
- [x] **Orders**: CRUD de órdenes.
- [x] **Products**: CRUD de productos.
- [x] **Cases**: CRUD de casos de soporte.
- [x] **Invoices**: CRUD de facturas.

### Phase 5: Integraciones Avanzadas
- [x] **SAP Service Layer**: 
    - [x] Servicio SAP (`sap.service.ts`) implementado.
    - [x] Middleware de compañía multi-tenant (`company.middleware.ts`).
    - [ ] Sincronización bidireccional completa (en progreso).
- [ ] **Redis Caching**: Pendiente de implementar.

## 🧪 Plan de Verificación
- **Automatizado**: Crear tests con Vitest (Pendiente).
- **Manual**: Usar scripts en `backend/scripts/verify_*.ts`.

## 📊 Estado Real
**Implementación: ~85% completado**
- ✅ Autenticación funcional
- ✅ CRUD de todas las entidades principales
- ✅ Integración SAP básica
- ⚠️ Falta: Tests unitarios, Redis, token refresh
