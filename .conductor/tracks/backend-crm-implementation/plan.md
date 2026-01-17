# Plan: Backend CRM Implementation

## Status: 🏗️ En Progreso (70% Implementado)

## 📝 Todo List

### Phase 1: Database Schema & Migrations
- [x] Diseñar schema completo en Prisma.
- [x] Crear migraciones para:
    - [x] Leads
    - [x] Opportunities (heredado de backend-core-features)
    - [x] Quotes
    - [x] Orders
    - [x] Products
    - [x] Cases
    - [x] Invoices
- [x] Ejecutar migraciones en PostgreSQL Docker.
- [x] Crear seeds de datos de prueba.

### Phase 2: Backend API Routes
- [x] **Leads**:
    - [x] `GET /api/leads` (Lista con filtros).
    - [x] `POST /api/leads` (Crear).
    - [x] `GET /api/leads/:id` (Detalle).
    - [x] `PUT /api/leads/:id` (Actualizar).
    - [x] `DELETE /api/leads/:id` (Eliminar).
    - [ ] `POST /api/leads/:id/qualify` (Convertir a Oportunidad).
- [x] **Quotes**:
    - [x] CRUD completo implementado.
    - [ ] `POST /api/quotes/:id/convert-to-order` (Convertir a orden).
- [x] **Orders**:
    - [x] CRUD completo implementado.
    - [ ] Integración con SAP para sincronización.
- [x] **Products**:
    - [x] CRUD completo implementado.
    - [ ] Sincronización con catálogo SAP.
- [x] **Cases** (Soporte):
    - [x] CRUD completo implementado.
- [x] **Invoices**:
    - [x] CRUD completo implementado.

### Phase 3: SAP Integration
- [x] **SAP Service Layer**:
    - [x] Implementar `sap.service.ts`.
    - [x] Autenticación con SAP B1.
    - [ ] Sincronización bidireccional:
        - [ ] Products (SAP -> CRM).
        - [ ] Orders (CRM -> SAP).
        - [ ] Invoices (SAP -> CRM).
    - [ ] Crear jobs de sincronización programados.
- [x] **Multi-tenant**:
    - [x] Middleware de compañía (`company.middleware.ts`).
    - [x] Configuración de múltiples empresas (`config/companies.ts`).

### Phase 4: Frontend Modules
- [x] **Leads Management**:
    - [x] Lista de Leads con filtros.
    - [x] Formulario de creación/edición.
    - [ ] Modal de calificación (Lead -> Opportunity).
- [x] **Sales Pipeline**:
    - [x] Vista de Pipeline (lista básica).
    - [ ] Kanban drag-and-drop para etapas.
    - [ ] Forecast view (predicción de ventas).
- [x] **Quotes & Orders**:
    - [x] Páginas básicas creadas.
    - [ ] Formularios con líneas de productos.
    - [ ] Conversión Quote -> Order.
- [x] **Products Catalog**:
    - [x] Lista de productos.
    - [ ] Integración con catálogo SAP.
- [x] **Invoices**:
    - [x] Página de facturas creada.
    - [ ] Vista detallada con líneas.

### Phase 5: Dashboards Especializados
- [x] **Sales Dashboard**:
    - [x] KPIs de ventas.
    - [x] Gráficos de revenue, win rate.
    - [ ] Análisis de pipeline (embudo de ventas).
- [x] **Service Dashboard**:
    - [x] Métricas de casos de soporte.
    - [ ] SLA tracking.
- [x] **Logistics Dashboard**:
    - [x] Tracking de órdenes.
    - [ ] Integración con sistema de logística.

### Phase 6: Advanced Features (Pendiente)
- [ ] **Business Process Flows**: Workflows automáticos.
- [ ] **Approval Workflows**: Para quotes y orders.
- [ ] **Email Integration**: Envío de quotes/invoices por email.
- [ ] **Reports & Analytics**: Reportes personalizables.

## 🧪 Verification Plan
- **Manual**: Probar flujo completo Lead -> Opp -> Quote -> Order.
- **Automated**: Tests de integración con Vitest (Pendiente).

## 📊 Estado Real
**Implementación: ~70% completado**
- ✅ Base de datos completa
- ✅ APIs CRUD de todas las entidades
- ✅ Frontend básico para todos los módulos
- ✅ SAP Service implementado
- ⚠️ Falta: Kanban drag-drop, workflows, sincronización SAP completa
