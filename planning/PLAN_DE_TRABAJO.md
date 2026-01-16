# STIA CRM - Plan de Trabajo Detallado

## Información del Proyecto

- **Nombre**: STIA CRM MVP
- **Duración estimada**: 12 semanas (3 meses)
- **Fecha de inicio**: 2026-01-20 (sugerida)
- **Fecha de entrega MVP**: 2026-04-14
- **Metodología**: Agile/Scrum con sprints de 2 semanas

---

## Cronograma General

```
Semana 1-2:   Fase 1 - Diseño y Planeación
Semana 3:     Fase 2 - Setup y Fundamentos
Semana 4-9:   Fase 3 - Desarrollo Core (6 semanas)
Semana 10-11: Fase 4 - Features Avanzadas
Semana 12-13: Fase 5 - Testing y Refinamiento
Semana 14:    Fase 6 - Deployment y Documentación
```

---

## FASE 1: Diseño y Planeación (Semanas 1-2)

### Semana 1: Investigación y Diseño

#### Día 1-2: Extracción de Assets y Branding
- [x] Descargar logo de STIA
- [ ] Obtener logo en formato SVG (solicitar a stakeholder)
- [ ] Crear variantes del logo:
  - [ ] 32x32px, 64x64px, 128x128px, 256x256px, 512x512px
  - [ ] Versiones para fondo claro y oscuro
- [ ] Crear favicons:
  - [ ] favicon.ico
  - [ ] PNG 16x16, 32x32, 192x192, 512x512
  - [ ] apple-touch-icon.png
- [x] Documentar paleta de colores
- [ ] Validar paleta de colores de estado con stakeholder
- [ ] Decidir fuente tipográfica (Sistema vs Inter vs otra)
- [ ] Obtener licencias necesarias

#### Día 3-5: Design System y Componentes
- [x] Crear Design System document completo
- [ ] Seleccionar librería de iconos (Lucide/Heroicons)
- [ ] Crear mockups de componentes principales en Figma/Adobe XD:
  - [ ] Buttons (todos los estados y tamaños)
  - [ ] Form elements
  - [ ] Cards
  - [ ] Modals
  - [ ] Navigation (Header, Sidebar)
  - [ ] Tables
  - [ ] KPI Cards
  - [ ] Charts (todos los tipos)
- [ ] Crear guía de uso de gráficos

### Semana 2: Wireframes y Especificaciones

#### Día 1-2: Wireframes de Pantallas Core
- [ ] Login y autenticación
  - [ ] Login form
  - [ ] Forgot password
  - [ ] Reset password
- [ ] Dashboard principal (layout vacío)
- [ ] Header y Sidebar navigation
- [ ] Listados genéricos:
  - [ ] Contacts list
  - [ ] Accounts list
  - [ ] Opportunities list (tabla)
- [ ] Vistas 360°:
  - [ ] Customer 360° (Contact detail)
  - [ ] Account detail
  - [ ] Opportunity detail
- [ ] Kanban de pipeline
- [ ] Formularios:
  - [ ] Contact form
  - [ ] Account form
  - [ ] Opportunity form
  - [ ] Activity quick-create
- [ ] Configuración básica

#### Día 3-4: Prototipos Interactivos
- [ ] Crear prototipos en Figma con:
  - [ ] Flujo de login completo
  - [ ] Navegación principal
  - [ ] Crear un contacto (end-to-end)
  - [ ] Ver Customer 360°
  - [ ] Mover oportunidad en Kanban
  - [ ] Crear actividad desde contacto
- [ ] Micro-interacciones:
  - [ ] Button hover/active states
  - [ ] Form validation feedback
  - [ ] Loading states
  - [ ] Success/error notifications

#### Día 5: Documentación y Revisión
- [x] Especificación técnica completa
- [x] Modelo de datos (ERD)
- [ ] User stories por módulo con criterios de aceptación:
  - [ ] Auth module (5 stories)
  - [ ] Contacts module (10 stories)
  - [ ] Accounts module (8 stories)
  - [ ] Opportunities module (12 stories)
  - [ ] Activities module (8 stories)
  - [ ] Dashboards module (10 stories)
- [ ] Casos de uso principales
- [ ] Reglas de negocio y validaciones
- [ ] Presentación a stakeholders
- [ ] Incorporar feedback

---

## FASE 2: Setup y Fundamentos (Semana 3)

### Día 1: Setup de Repositorio y Proyecto

#### Git & Repository
```bash
# Crear repositorio
git init
git checkout -b develop

# Estructura de branches
- main (producción)
- develop (desarrollo)
- feature/* (features)
- hotfix/* (fixes urgentes)
```

#### Tareas:
- [ ] Crear repositorio Git (GitHub/GitLab)
- [ ] Configurar .gitignore
- [ ] Crear estructura de carpetas (frontend + backend)
- [ ] Setup de monorepo (opcional, con Turborepo/Nx)
- [ ] Configurar commitlint (conventional commits)
- [ ] Setup de Husky (git hooks)

#### Frontend Setup
```bash
# Crear proyecto React + TypeScript + Vite
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

# Instalar dependencias core
npm install react-router-dom zustand axios @tanstack/react-query
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/node

# UI Libraries
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react  # Icons

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Charts
npm install recharts

# Tables
npm install @tanstack/react-table

# Dates
npm install date-fns react-day-picker

# Notifications
npm install sonner

# Rich text
npm install @tiptap/react @tiptap/starter-kit
```

- [ ] Configurar Tailwind CSS
- [ ] Setup de shadcn/ui
- [ ] Configurar ESLint + Prettier
- [ ] Configurar path aliases (@/ para src/)
- [ ] Setup Vite config (proxy, env vars)

#### Backend Setup
```bash
# Crear proyecto
mkdir backend && cd backend
npm init -y

# TypeScript
npm install -D typescript @types/node ts-node-dev

# Framework
npm install fastify @fastify/cors @fastify/helmet @fastify/rate-limit

# Database
npm install prisma @prisma/client
npm install -D prisma

# Validation
npm install zod

# Auth
npm install jsonwebtoken bcrypt
npm install -D @types/jsonwebtoken @types/bcrypt

# Utilities
npm install dotenv pino pino-pretty
```

- [ ] Configurar TypeScript (tsconfig.json)
- [ ] Setup de Prisma
- [ ] Configurar ESLint + Prettier
- [ ] Setup de nodemon / ts-node-dev
- [ ] Crear .env.example

### Día 2: Base de Datos

- [ ] Inicializar Prisma:
  ```bash
  npx prisma init
  ```
- [ ] Crear PostgreSQL database local:
  ```bash
  # Docker Compose
  docker-compose up -d postgres redis
  ```
- [ ] Escribir Prisma schema completo (basado en MODELO_DE_DATOS.md)
- [ ] Crear primera migración:
  ```bash
  npx prisma migrate dev --name init
  ```
- [ ] Crear seed script con datos de prueba
- [ ] Ejecutar seed:
  ```bash
  npx prisma db seed
  ```
- [ ] Verificar en Prisma Studio:
  ```bash
  npx prisma studio
  ```

### Día 3: Autenticación y Autorización

#### Backend
- [ ] Crear Auth module:
  - [ ] `auth.service.ts`:
    - [ ] hashPassword(password)
    - [ ] comparePassword(password, hash)
    - [ ] generateAccessToken(user)
    - [ ] generateRefreshToken(user)
    - [ ] verifyAccessToken(token)
    - [ ] verifyRefreshToken(token)
  - [ ] `auth.controller.ts`:
    - [ ] POST /auth/register
    - [ ] POST /auth/login
    - [ ] POST /auth/refresh
    - [ ] POST /auth/logout
    - [ ] POST /auth/forgot-password
    - [ ] POST /auth/reset-password
  - [ ] `auth.middleware.ts`:
    - [ ] requireAuth
    - [ ] requireRole(['Admin', 'Sales Manager'])
  - [ ] `auth.schema.ts` (Zod validation)
- [ ] Implementar JWT con access + refresh tokens
- [ ] Crear usuario admin por defecto en seed

#### Frontend
- [ ] Crear Auth store (Zustand):
  - [ ] State: user, tokens, isAuthenticated
  - [ ] Actions: login, logout, refreshToken
- [ ] Crear API client con Axios:
  - [ ] Interceptor para agregar token
  - [ ] Interceptor para refresh token automático
- [ ] Crear ProtectedRoute component
- [ ] Implementar Login page
- [ ] Implementar Logout functionality

### Día 4-5: Layout Base

#### Frontend
- [ ] Crear layouts:
  - [ ] AuthLayout (para login, registro)
  - [ ] DashboardLayout (header + sidebar + content)
- [ ] Implementar Header:
  - [ ] Logo
  - [ ] Global search (placeholder)
  - [ ] Notifications icon
  - [ ] User menu dropdown
- [ ] Implementar Sidebar:
  - [ ] Navigation links
  - [ ] Active state
  - [ ] Collapse/expand (mobile)
  - [ ] Icons (Lucide)
- [ ] Routing con React Router:
  - [ ] / → redirect to /dashboard
  - [ ] /login
  - [ ] /dashboard
  - [ ] /contacts
  - [ ] /accounts
  - [ ] /opportunities
  - [ ] /activities
  - [ ] /settings
- [ ] Theme provider (colores STIA)
- [ ] Testing de navegación

#### Docker Compose
- [ ] Crear docker-compose.yml:
  ```yaml
  version: '3.8'
  services:
    postgres:
      image: postgres:15-alpine
      environment:
        POSTGRES_USER: stia_crm
        POSTGRES_PASSWORD: dev_password
        POSTGRES_DB: stia_crm
      ports:
        - "5432:5432"
      volumes:
        - postgres_data:/var/lib/postgresql/data

    redis:
      image: redis:7-alpine
      ports:
        - "6379:6379"
      volumes:
        - redis_data:/data

  volumes:
    postgres_data:
    redis_data:
  ```
- [ ] Verificar que todo funciona

---

## FASE 3: Desarrollo Core (Semanas 4-9)

### Sprint 1 (Semanas 4-5): Módulos de Datos Base

#### Semana 4: Módulo de Contactos

##### Backend
- [ ] Crear Contacts module:
  - [ ] `contacts.service.ts`:
    - [ ] getContacts(filters, pagination)
    - [ ] getContactById(id)
    - [ ] createContact(data)
    - [ ] updateContact(id, data)
    - [ ] deleteContact(id) // soft delete
    - [ ] importContacts(csvData)
    - [ ] exportContacts(filters)
  - [ ] `contacts.controller.ts`:
    - [ ] GET /contacts
    - [ ] GET /contacts/:id
    - [ ] POST /contacts
    - [ ] PUT /contacts/:id
    - [ ] DELETE /contacts/:id
    - [ ] POST /contacts/import
    - [ ] GET /contacts/export
  - [ ] `contacts.schema.ts` (Zod validation)
- [ ] Implementar filtros:
  - [ ] Por owner
  - [ ] Por account
  - [ ] Por leadSource
  - [ ] Por tags
  - [ ] Búsqueda full-text (nombre, email)
- [ ] Implementar pagination
- [ ] Implementar sorting
- [ ] Tests unitarios (>80% coverage)

##### Frontend
- [ ] Crear Contacts feature:
  - [ ] `ContactList.tsx`:
    - [ ] DataTable con TanStack Table
    - [ ] Columnas configurables
    - [ ] Sorting por columna
    - [ ] Filtros
    - [ ] Search bar
    - [ ] Pagination
    - [ ] Bulk actions (delete, assign owner)
    - [ ] Export button
  - [ ] `ContactDetail.tsx` (Customer 360°):
    - [ ] 3-column layout
    - [ ] Info card (izquierda)
    - [ ] Timeline (centro)
    - [ ] Related entities (derecha)
    - [ ] Quick actions
    - [ ] Edit mode
  - [ ] `ContactForm.tsx`:
    - [ ] React Hook Form
    - [ ] Zod validation
    - [ ] Account lookup
    - [ ] Tag selector
    - [ ] Save & New button
  - [ ] `ContactImport.tsx`:
    - [ ] CSV file upload
    - [ ] Column mapping
    - [ ] Preview
    - [ ] Import progress
- [ ] Implementar Contacts API hooks (React Query)
- [ ] Implementar Contacts store (si es necesario)
- [ ] Routing:
  - [ ] /contacts → ContactList
  - [ ] /contacts/:id → ContactDetail
  - [ ] /contacts/new → ContactForm
  - [ ] /contacts/:id/edit → ContactForm

#### Semana 5: Módulo de Cuentas

##### Backend
- [ ] Crear Accounts module (similar a Contacts):
  - [ ] CRUD completo
  - [ ] Filtros y búsqueda
  - [ ] Jerarquía (parent/children)
  - [ ] Import/export
  - [ ] Tests

##### Frontend
- [ ] Crear Accounts feature:
  - [ ] `AccountList.tsx`
  - [ ] `AccountDetail.tsx`
  - [ ] `AccountForm.tsx`
  - [ ] `AccountHierarchy.tsx` (tree view)
- [ ] API hooks
- [ ] Routing

##### Bonus
- [ ] Módulo de Usuarios y Roles:
  - [ ] Backend: CRUD de Users y Roles
  - [ ] Frontend: User management page
  - [ ] Role permissions matrix
  - [ ] Assign role to user

### Sprint 2 (Semanas 6-7): Pipeline y Oportunidades

#### Semana 6: Oportunidades - Backend y Tabla

##### Backend
- [ ] Crear Opportunities module:
  - [ ] CRUD completo
  - [ ] Filtros (stage, owner, account, date range)
  - [ ] Búsqueda
  - [ ] Stage transitions con validación
  - [ ] OpportunityStageHistory tracking
  - [ ] Cálculos:
    - [ ] Total pipeline value
    - [ ] Weighted pipeline (value × probability)
    - [ ] Win rate
    - [ ] Average deal size
    - [ ] Average sales cycle
  - [ ] Tests

##### Frontend (Table View)
- [ ] `OpportunityList.tsx`:
  - [ ] DataTable avanzada
  - [ ] Columnas: nombre, account, value, stage, probability, close date, owner
  - [ ] Inline editing
  - [ ] Filters: stage, owner, date range, min/max value
  - [ ] Grouping por owner o stage
  - [ ] Subtotales
  - [ ] Export
- [ ] `OpportunityDetail.tsx`
- [ ] `OpportunityForm.tsx`:
  - [ ] Account lookup (requerido)
  - [ ] Contact lookup
  - [ ] Amount con currency
  - [ ] Stage selector
  - [ ] Close date picker
  - [ ] Products/services (JSON simple para MVP)
- [ ] API hooks
- [ ] Routing

#### Semana 7: Kanban View y Forecast

##### Frontend (Kanban View)
- [ ] `KanbanBoard.tsx`:
  - [ ] Columnas por stage (de OpportunityStage)
  - [ ] Cards con:
    - [ ] Nombre clickeable
    - [ ] Empresa
    - [ ] Valor $
    - [ ] Probabilidad %
    - [ ] Health indicator
    - [ ] Owner avatar
    - [ ] Last activity
  - [ ] Drag & drop (@dnd-kit):
    - [ ] Smooth animations
    - [ ] Confirmación al mover a "Closed"
    - [ ] Actualización de probability automática
  - [ ] Suma total por columna
  - [ ] Suma ponderada
  - [ ] Filtros (mismo que tabla)
  - [ ] Collapse/expand columnas
- [ ] `OpportunityCard.tsx` (card del Kanban)
- [ ] `OpportunityQuickView.tsx` (modal preview al click)

##### Frontend (Forecast View)
- [ ] `ForecastView.tsx`:
  - [ ] Selector de rango de fechas (próximos 6 meses)
  - [ ] Timeline mensual
  - [ ] Oportunidades agrupadas por mes esperado
  - [ ] Best case / Most likely / Worst case
  - [ ] Comparación con cuota
  - [ ] Gráficos:
    - [ ] Stacked bar chart: comprometido vs pipeline vs objetivo
    - [ ] Line chart: trend de forecast vs actual

##### Frontend (Chart View)
- [ ] `OpportunityCharts.tsx`:
  - [ ] Funnel chart del pipeline
  - [ ] Pie chart por etapa
  - [ ] Bar chart por propietario
  - [ ] Win/Loss analysis (pie o bar)

### Sprint 3 (Semana 8): Actividades y Calendario

#### Backend
- [ ] Crear Activities module:
  - [ ] CRUD completo para todos los tipos (Call, Email, Meeting, Task, Note)
  - [ ] Filtros por tipo, status, owner, related entity
  - [ ] Mark as completed
  - [ ] Overdue activities query
  - [ ] Activities feed (timeline) por contacto/cuenta/oportunidad
  - [ ] Tests

#### Frontend
- [ ] `ActivityList.tsx` (listado general)
- [ ] `ActivityForm.tsx`:
  - [ ] Type selector (tabs)
  - [ ] Campos condicionales según tipo
  - [ ] Related entity selector
  - [ ] Due date/time picker
  - [ ] Rich text para description
- [ ] `ActivityQuickCreate.tsx` (modal flotante):
  - [ ] Botón "+" always visible
  - [ ] Quick form
  - [ ] Pre-fill context
- [ ] `CalendarView.tsx`:
  - [ ] Vistas: día, semana, mes
  - [ ] Color coding por tipo
  - [ ] Drag & drop para reprogramar
  - [ ] Click en slot para crear
  - [ ] Librería: react-big-calendar o custom
- [ ] `TimelineView.tsx`:
  - [ ] Usado en Customer 360° y Opportunity detail
  - [ ] Ordenado cronológicamente
  - [ ] Agrupado por fecha
  - [ ] Infinite scroll
  - [ ] Filtros: tipo, usuario, fecha
  - [ ] Composer inline para nueva actividad
- [ ] API hooks
- [ ] Routing:
  - [ ] /activities
  - [ ] /calendar

### Sprint 4 (Semana 9): Dashboards Básicos

#### Backend
- [ ] Crear Dashboards module:
  - [ ] Analytics endpoints:
    - [ ] GET /analytics/kpis (revenue MTD, pipeline value, win rate, etc.)
    - [ ] GET /analytics/pipeline-by-stage
    - [ ] GET /analytics/revenue-trend (últimos 12 meses)
    - [ ] GET /analytics/opportunities-by-owner
    - [ ] GET /analytics/activities-summary
    - [ ] GET /analytics/top-accounts
  - [ ] Caching con Redis (TTL: 5 minutos)
  - [ ] Query optimization
  - [ ] Tests

#### Frontend - Framework de Dashboards
- [ ] Crear Dashboard feature:
  - [ ] `DashboardGrid.tsx`:
    - [ ] Grid layout responsive (react-grid-layout)
    - [ ] Drag & drop para reorganizar
    - [ ] Resize widgets
    - [ ] Add widget button
    - [ ] Save layout
  - [ ] `WidgetLibrary.tsx`:
    - [ ] Modal con widget catalog
    - [ ] Preview de cada tipo
    - [ ] Add to dashboard
  - [ ] Filters globales:
    - [ ] Date range picker (presets + custom)
    - [ ] User/Team selector
    - [ ] Apply to all widgets

#### Frontend - Widgets Componentes
- [ ] `KPICard.tsx`:
  - [ ] Valor principal (grande)
  - [ ] Label
  - [ ] Trend indicator (↑/↓)
  - [ ] Percentage change
  - [ ] Sparkline (opcional)
  - [ ] Color según métrica
- [ ] `ChartWidget.tsx`:
  - [ ] Container para charts
  - [ ] Config: tipo, datasource, config
  - [ ] Loading skeleton
  - [ ] Empty state
  - [ ] Error state
  - [ ] Refresh button
  - [ ] Download button

#### Frontend - Gráficos (Recharts)
- [ ] `PieChart.tsx`:
  - [ ] Pie o Donut variant
  - [ ] Tooltips personalizados
  - [ ] Click handler
  - [ ] Legend interactiva
  - [ ] Responsive
- [ ] `BarChart.tsx`:
  - [ ] Vertical/horizontal
  - [ ] Stacked/grouped variants
  - [ ] Tooltips
  - [ ] Click handler
- [ ] `LineChart.tsx`:
  - [ ] Múltiples series
  - [ ] Area variant
  - [ ] Crosshair
  - [ ] Zoom/pan (Fase 2)
- [ ] `FunnelChart.tsx`:
  - [ ] Etapas del pipeline
  - [ ] Conversion rates entre etapas
- [ ] Configurar paleta de colores STIA en todos los charts

#### Frontend - Dashboards Predefinidos
- [ ] `ExecutiveDashboard.tsx`:
  - [ ] Layout 3x3
  - [ ] KPIs: Revenue MTD, Pipeline Value, Win Rate
  - [ ] Line chart: Revenue 12M
  - [ ] Funnel: Pipeline conversion
  - [ ] Pie: Revenue by product
  - [ ] Bar: Top 10 deals
  - [ ] Gauge: Quota attainment
  - [ ] Table: At-risk opportunities
- [ ] `SalesDashboard.tsx`:
  - [ ] Layout 2x4
  - [ ] Enfocado en pipeline y actividades
- [ ] `PersonalDashboard.tsx`:
  - [ ] Sidebar + main area
  - [ ] Mis métricas
  - [ ] Mis actividades
  - [ ] Mi pipeline (mini Kanban)

---

## FASE 4: Features Avanzadas (Semanas 10-11)

### Semana 10: Advanced Search y Email

#### Advanced Search
- [ ] Backend:
  - [ ] Query builder endpoint (POST /search)
  - [ ] Support para condiciones AND/OR
  - [ ] Operadores: equals, not equals, contains, greater than, less than, between, in, is null
  - [ ] Guardar query como SavedView
- [ ] Frontend:
  - [ ] `QueryBuilder.tsx`:
    - [ ] Visual query builder
    - [ ] Add/remove conditions
    - [ ] Grouping (paréntesis)
    - [ ] Field selector
    - [ ] Operator selector
    - [ ] Value input (condicional según field type)
    - [ ] Run query button
  - [ ] `SavedViewManager.tsx`:
    - [ ] Listado de vistas guardadas
    - [ ] Create new view
    - [ ] Edit view
    - [ ] Delete view
    - [ ] Share view
  - [ ] `GlobalSearch.tsx` (Header):
    - [ ] Search input con Ctrl+K
    - [ ] Debounced search
    - [ ] Results dropdown (agrupados por entity)
    - [ ] Navigate to result

#### Email Integration (Básico)
- [ ] Backend:
  - [ ] Email service (integración SMTP):
    - [ ] sendEmail(to, subject, body, attachments)
    - [ ] Email templates (Handlebars)
    - [ ] Merge fields: {{contact.firstName}}, etc.
  - [ ] Email tracking (opcional):
    - [ ] Pixel tracking para opens
    - [ ] Link tracking para clicks
- [ ] Frontend:
  - [ ] `EmailComposer.tsx`:
    - [ ] To, CC, BCC fields (autocomplete contacts)
    - [ ] Subject
    - [ ] Rich text editor (Tiptap)
    - [ ] Template selector
    - [ ] Merge field inserter
    - [ ] Attachments (file upload)
    - [ ] Send/Schedule buttons
  - [ ] `EmailTemplateManager.tsx`:
    - [ ] List templates
    - [ ] Create/edit template
    - [ ] Preview with sample data
  - [ ] Integrar composer en Contact/Account/Opportunity detail

### Semana 11: Workflows y Audit

#### Workflows Básicos
- [ ] Backend:
  - [ ] Workflow engine (simple):
    - [ ] Trigger: evento (contact.created, opportunity.stage.changed)
    - [ ] Condition: regla (if stage === 'Qualified')
    - [ ] Action: crear tarea, enviar email, asignar owner
  - [ ] Workflows predefinidos:
    - [ ] Lead assignment (round-robin)
    - [ ] Create follow-up task (auto)
    - [ ] Send welcome email (on contact create)
    - [ ] Notify manager (on big deal)
  - [ ] Workflow execution service
- [ ] Frontend:
  - [ ] `WorkflowList.tsx`
  - [ ] `WorkflowBuilder.tsx` (simple):
    - [ ] Trigger selector
    - [ ] Condition builder
    - [ ] Action configurator
    - [ ] Test workflow
    - [ ] Activate/deactivate

#### Business Rules
- [ ] Frontend:
  - [ ] Reglas de visibilidad de campos (mostrar/ocultar según condiciones)
  - [ ] Campos requeridos condicionales
  - [ ] Valores por defecto dinámicos
  - [ ] Validaciones custom

#### Audit Trail
- [ ] Backend:
  - [ ] AuditLog service:
    - [ ] logChange(entity, entityId, action, field, oldValue, newValue, userId)
    - [ ] Auto-trigger en updates importantes (Opp stage, assigned owner)
  - [ ] Endpoints:
    - [ ] GET /audit/:entityType/:entityId
- [ ] Frontend:
  - [ ] `AuditLogViewer.tsx`:
    - [ ] Timeline de cambios
    - [ ] Filtros: usuario, fecha, campo
    - [ ] Show diff (old → new)
  - [ ] Integrar en Opportunity detail (tab "History")

#### Notifications
- [ ] Backend:
  - [ ] Notification service:
    - [ ] createNotification(userId, type, title, message, linkUrl)
    - [ ] markAsRead(notificationId)
    - [ ] getUserNotifications(userId, unreadOnly)
  - [ ] Auto-notifications:
    - [ ] On @mention
    - [ ] On assignment
    - [ ] On activity due
    - [ ] On opportunity stage change (if following)
- [ ] Frontend:
  - [ ] `NotificationCenter.tsx`:
    - [ ] Bell icon en header con badge (unread count)
    - [ ] Dropdown panel
    - [ ] List de notificaciones
    - [ ] Mark as read
    - [ ] Navigate to linked record
  - [ ] WebSocket (Fase 2) o polling cada 30s

---

## FASE 5: Testing y Refinamiento (Semanas 12-13)

### Semana 12: Testing Exhaustivo

#### Tests Unitarios
- [ ] Backend:
  - [ ] Services (>80% coverage)
  - [ ] Controllers
  - [ ] Middleware
  - [ ] Utilities
  - [ ] Run: `npm test`
- [ ] Frontend:
  - [ ] Componentes (>70% coverage)
  - [ ] Hooks
  - [ ] Stores
  - [ ] Utils
  - [ ] Run: `npm test`

#### Tests de Integración
- [ ] Backend:
  - [ ] API endpoints (Supertest)
  - [ ] Database operations
  - [ ] Auth flow completo
  - [ ] CRUD flows

#### Tests E2E
- [ ] Setup Playwright
- [ ] Escribir tests E2E:
  - [ ] Login/logout
  - [ ] Crear contacto
  - [ ] Ver Customer 360°
  - [ ] Crear oportunidad
  - [ ] Mover oportunidad en Kanban
  - [ ] Crear actividad
  - [ ] Ver dashboard
  - [ ] Aplicar filtros
  - [ ] Exportar datos
- [ ] Run en CI

#### Performance Testing
- [ ] Backend load testing (Artillery):
  - [ ] 100 usuarios concurrentes
  - [ ] 1000 requests/segundo
  - [ ] Response time <200ms (95th percentile)
- [ ] Frontend performance:
  - [ ] Lighthouse audit (score >90)
  - [ ] Bundle size analysis (webpack-bundle-analyzer)
  - [ ] Optimize if needed

#### Cross-Browser Testing
- [ ] Probar en:
  - [ ] Chrome/Edge (Chromium)
  - [ ] Firefox
  - [ ] Safari
- [ ] Responsive testing:
  - [ ] Mobile (375px)
  - [ ] Tablet (768px)
  - [ ] Desktop (1280px, 1920px)

#### Bug Fixing
- [ ] Crear board de bugs (GitHub Issues, Jira)
- [ ] Priorizar:
  - [ ] Críticos (bloqueantes)
  - [ ] Altos (afectan funcionalidad principal)
  - [ ] Medios (afectan UX)
  - [ ] Bajos (cosméticos)
- [ ] Fix críticos y altos (100%)
- [ ] Fix medios (>80%)
- [ ] Regression testing

### Semana 13: UI/UX Polish y Optimización

#### UI/UX Polish
- [ ] Transiciones y animaciones:
  - [ ] Page transitions (Framer Motion)
  - [ ] Micro-interactions (button click, hover)
  - [ ] Loading states (skeletons, spinners)
  - [ ] Success animations (checkmark, confetti)
- [ ] Loading states:
  - [ ] Skeleton loaders para tablas
  - [ ] Shimmer effect
  - [ ] Progress bars para imports/exports
- [ ] Empty states:
  - [ ] Ilustraciones amigables
  - [ ] Call to action claro
  - [ ] Ejemplo: "No contacts yet. Create your first contact!"
- [ ] Error handling:
  - [ ] Error boundaries (React)
  - [ ] User-friendly error messages
  - [ ] Fallback UI
  - [ ] Retry buttons
  - [ ] Contact support link
- [ ] Accessibility (WCAG 2.1 AA):
  - [ ] Keyboard navigation completa (Tab, Enter, Esc)
  - [ ] ARIA labels
  - [ ] Focus indicators
  - [ ] Color contrast (ratio >4.5:1)
  - [ ] Screen reader testing (NVDA/JAWS)
  - [ ] Alt text en imágenes

#### Performance Optimization
- [ ] Code splitting:
  - [ ] Route-based splitting (React.lazy)
  - [ ] Component-level splitting
- [ ] Lazy loading:
  - [ ] Images (Intersection Observer)
  - [ ] Heavy components (charts cuando visible)
  - [ ] Infinite scroll en listas
- [ ] Image optimization:
  - [ ] WebP format
  - [ ] Responsive images (srcset)
  - [ ] Compress (TinyPNG)
- [ ] Caching strategies:
  - [ ] HTTP caching headers
  - [ ] React Query caching (stale-while-revalidate)
  - [ ] Service Worker (PWA - opcional)
- [ ] Database query optimization:
  - [ ] Analyze slow queries (pg_stat_statements)
  - [ ] Add missing indexes
  - [ ] Optimize N+1 queries (Prisma include)
  - [ ] Use database views para queries complejos
- [ ] Bundle optimization:
  - [ ] Tree shaking
  - [ ] Minification
  - [ ] Gzip/Brotli compression

#### Final Review
- [ ] Código review completo (peer review)
- [ ] Refactoring si es necesario
- [ ] Eliminar console.logs
- [ ] Eliminar código comentado
- [ ] Actualizar todos los TODOs

---

## FASE 6: Deployment y Documentación (Semana 14)

### Día 1-2: Configuración de Producción

#### Infrastructure Setup
- [ ] Seleccionar provider:
  - [ ] Frontend: Vercel (recomendado)
  - [ ] Backend: Railway (recomendado para MVP)
  - [ ] Database: Railway PostgreSQL o RDS
  - [ ] Redis: Railway Redis o ElastiCache
  - [ ] File storage: AWS S3 o Cloudinary
- [ ] Crear cuentas y proyectos
- [ ] Configurar custom domain:
  - [ ] app.stia-crm.com (frontend)
  - [ ] api.stia-crm.com (backend)
- [ ] SSL certificates (Let's Encrypt, auto en Vercel/Railway)

#### Environment Variables
- [ ] Frontend (.env.production):
  - [ ] VITE_API_URL
  - [ ] VITE_SENTRY_DSN (si se usa)
- [ ] Backend (.env.production):
  - [ ] DATABASE_URL (connection string)
  - [ ] REDIS_URL
  - [ ] JWT_SECRET (generar fuerte)
  - [ ] JWT_REFRESH_SECRET
  - [ ] SMTP credentials
  - [ ] AWS credentials (si aplica)
  - [ ] CORS_ORIGIN

#### CI/CD Pipeline (GitHub Actions)
- [ ] Crear workflow `.github/workflows/ci.yml`:
  ```yaml
  name: CI
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Install dependencies
          run: npm ci
        - name: Run tests
          run: npm test
        - name: Run linter
          run: npm run lint
  ```
- [ ] Crear workflow `.github/workflows/deploy.yml`:
  ```yaml
  name: Deploy
  on:
    push:
      branches: [main]
  jobs:
    deploy-frontend:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - name: Deploy to Vercel
          uses: amondnet/vercel-action@v20
          with:
            vercel-token: ${{ secrets.VERCEL_TOKEN }}
    deploy-backend:
      runs-on: ubuntu-latest
      steps:
        - name: Deploy to Railway
          # Railway auto-deploys on push to main
  ```

#### Database Migration en Producción
- [ ] Backup de DB (si existe data)
- [ ] Run migrations:
  ```bash
  npx prisma migrate deploy
  ```
- [ ] Seed de datos iniciales:
  - [ ] Roles
  - [ ] Usuario admin
  - [ ] OpportunityStages

### Día 3: Monitoring y Logging

#### Setup de Monitoring
- [ ] Sentry para error tracking:
  - [ ] Frontend integration
  - [ ] Backend integration
  - [ ] Source maps upload
- [ ] Logging en producción:
  - [ ] Pino logger en backend
  - [ ] Log levels apropiados
  - [ ] No loguear info sensible (passwords, tokens)
- [ ] Uptime monitoring:
  - [ ] UptimeRobot o Better Stack
  - [ ] Health check endpoint: GET /health
  - [ ] Alertas por email/Slack

#### Backups
- [ ] Automated DB backups:
  - [ ] Daily backups
  - [ ] Retention: 7 días
  - [ ] Test restore process
- [ ] Redis persistence config

### Día 4-5: Documentación

#### User Documentation
- [ ] Manual de usuario (user guide):
  - [ ] Introducción al CRM
  - [ ] Login y navegación
  - [ ] Gestión de contactos:
    - [ ] Crear contacto
    - [ ] Buscar y filtrar
    - [ ] Importar contactos
    - [ ] Customer 360° view
  - [ ] Gestión de cuentas
  - [ ] Gestión de oportunidades:
    - [ ] Crear oportunidad
    - [ ] Usar Kanban
    - [ ] Forecast
  - [ ] Actividades y calendario:
    - [ ] Crear tarea
    - [ ] Agendar reunión
    - [ ] Registrar llamada
    - [ ] Enviar email
  - [ ] Dashboards:
    - [ ] Ver dashboards
    - [ ] Interpretar gráficos
    - [ ] Aplicar filtros
  - [ ] Búsqueda avanzada
  - [ ] Screenshots y videos

- [ ] Admin guide:
  - [ ] Gestión de usuarios
  - [ ] Asignación de roles
  - [ ] Configuración del sistema
  - [ ] Custom fields
  - [ ] Pipeline stages
  - [ ] Workflows

#### Technical Documentation
- [ ] README.md completo:
  - [ ] Descripción del proyecto
  - [ ] Stack tecnológico
  - [ ] Setup de desarrollo
  - [ ] Scripts disponibles
  - [ ] Estructura de carpetas
  - [ ] Deployment
- [ ] API Documentation:
  - [ ] Swagger/OpenAPI spec
  - [ ] Endpoints documentados
  - [ ] Request/response examples
  - [ ] Authentication flow
  - [ ] Error codes
- [ ] Database schema diagram (actualizado)
- [ ] Architecture diagram
- [ ] CHANGELOG.md (versiones)

#### Video Tutorials
- [ ] Screen recordings:
  - [ ] Tour general del CRM (5 min)
  - [ ] Crear y gestionar contactos (3 min)
  - [ ] Gestionar oportunidades en Kanban (4 min)
  - [ ] Usar dashboards (3 min)
  - [ ] Admin: gestionar usuarios (2 min)
- [ ] Subir a YouTube o Vimeo (unlisted)

### Training y Handoff
- [ ] Sesión de capacitación con usuarios:
  - [ ] Presentación del sistema
  - [ ] Demo en vivo
  - [ ] Q&A
  - [ ] Hands-on practice
- [ ] Documentación de soporte:
  - [ ] FAQs
  - [ ] Troubleshooting guide
  - [ ] Contact info para soporte
- [ ] Knowledge transfer a equipo de soporte (si aplica)

---

## Post-MVP (Fase 2 - Futuro)

### Features para Considerar
- [ ] Mobile apps (React Native)
- [ ] Offline mode (PWA con Service Workers)
- [ ] Advanced reporting:
  - [ ] Custom report builder
  - [ ] Scheduled reports (envío automático)
  - [ ] Drill-down multinivel
- [ ] AI & Predictive insights:
  - [ ] Lead scoring automático
  - [ ] Deal health prediction
  - [ ] Next best action suggestions
- [ ] Marketing automation:
  - [ ] Email campaigns
  - [ ] Lead nurturing
  - [ ] Landing pages
- [ ] Advanced integrations:
  - [ ] Bidirectional email sync (Gmail/Outlook)
  - [ ] Calendar sync
  - [ ] VoIP (click-to-call)
  - [ ] SAP B1 integration (importante para ti!)
  - [ ] WhatsApp Business API
- [ ] Document management:
  - [ ] Version control
  - [ ] E-signatures (DocuSign)
  - [ ] Templates
- [ ] Multi-tenancy (si es SaaS)
- [ ] White-labeling
- [ ] API pública para integraciones
- [ ] Webhooks

---

## Recursos y Herramientas

### Design
- Figma (wireframes y prototipos)
- Adobe XD (alternativa)
- Excalidraw (diagramas rápidos)
- Draw.io (diagramas de arquitectura)

### Development
- VS Code (IDE)
- Postman (API testing)
- Prisma Studio (DB GUI)
- Redis Commander (Redis GUI)
- Reactotron (debugging)

### Project Management
- GitHub Projects (Kanban)
- Linear (alternativa premium)
- Notion (documentación)

### Communication
- Slack (equipo)
- Zoom/Meet (videollamadas)
- Loom (screen recordings)

---

## Checklist de Lanzamiento

### Pre-Launch
- [ ] Todos los tests pasan (unit, integration, E2E)
- [ ] Performance targets alcanzados
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Security audit (npm audit, Snyk)
- [ ] Database backups configurados
- [ ] Monitoring activo (Sentry, uptime)
- [ ] SSL certificates válidos
- [ ] Custom domain configurado
- [ ] Environment variables en producción
- [ ] Documentación completa
- [ ] Training realizado

### Launch Day
- [ ] Deploy a producción
- [ ] Smoke testing en producción
- [ ] Monitorear errores (Sentry)
- [ ] Monitorear performance
- [ ] Anunciar a usuarios
- [ ] Estar disponible para soporte

### Post-Launch (Primera Semana)
- [ ] Monitoreo diario de errores
- [ ] Recopilar feedback de usuarios
- [ ] Hotfixes si es necesario
- [ ] Performance tuning basado en uso real
- [ ] Celebrar el lanzamiento! 🎉

---

## Contacto y Soporte

**Project Owner**: Freddy Molina (CTO, BlueSystem)
**Repositorio**: [GitHub URL]
**Documentation**: [Notion/Confluence URL]
**Support Email**: support@stia-crm.com (configurar)

---

**Última actualización**: 2026-01-15
**Versión del plan**: 1.0
**Estado**: ✅ Listo para iniciar

---

## Notas Finales

Este plan es una guía detallada pero **flexible**. Durante el desarrollo:
- Ajustar según feedback y prioridades cambiantes
- Agregar tasks específicas según descubrimientos
- Re-priorizar features si es necesario
- Mantener comunicación constante con stakeholders

**Éxito del MVP** = Entregar las funcionalidades core estables, con excelente UX, bien testeadas y documentadas, a tiempo.

**Let's build this! 💪🚀**
