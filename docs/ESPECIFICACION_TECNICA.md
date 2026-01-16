# STIA CRM - Especificación Técnica

## Información del Proyecto

- **Nombre**: STIA CRM
- **Tipo**: Aplicación Web CRM (Customer Relationship Management)
- **Versión**: 1.0.0 (MVP)
- **Fecha de inicio**: 2026-01-15
- **Referencia funcional**: Microsoft Dynamics CRM
- **Referencia visual**: stia.net
- **Enfoque especial**: Analytics y visualización de datos

---

## Stack Tecnológico

### Frontend

#### Framework Principal
- **React 18.2+** con **TypeScript 5.0+**
  - Hooks para state management
  - Functional components
  - Strict mode habilitado

#### State Management
- **Zustand** (recomendado)
  - Más simple que Redux
  - Excelente TypeScript support
  - Menos boilerplate
  - Middleware para persistencia y DevTools

  *Alternativa*: Redux Toolkit (si se prefiere solución más establecida)

#### UI Component Library
- **shadcn/ui** (recomendado)
  - Componentes copiables y customizables
  - Basado en Radix UI (accesible)
  - Tailwind CSS integration
  - Total control del código

  *Alternativa*: Material-UI (MUI) o Ant Design

#### Styling
- **Tailwind CSS 3.x**
  - Utility-first
  - Altamente customizable
  - Excelente para prototyping rápido
  - Purge automático de CSS no usado

  *Complemento*: CSS Modules para componentes específicos

#### Librería de Gráficos
- **Recharts** (Principal)
  - Nativo para React
  - Composable components
  - TypeScript support
  - Responsive por defecto
  - Fácil customización

  *Complemento*: **Apache ECharts** para gráficos más complejos
  - 3D charts
  - Mapas geográficos
  - Relational graphs

#### Tablas de Datos
- **TanStack Table v8** (React Table)
  - Headless UI
  - Virtualmente sin límite de filas
  - Sorting, filtering, grouping
  - Column resizing, reordering
  - Pagination
  - TypeScript first

#### Drag & Drop
- **@dnd-kit** (recomendado)
  - Moderno, mantenido activamente
  - Accesible
  - Touch-friendly
  - Better performance que react-beautiful-dnd

  *Alternativa*: react-beautiful-dnd (si se prefiere API más simple)

#### Manejo de Fechas
- **date-fns**
  - Modular (tree-shakeable)
  - Inmutable
  - TypeScript native
  - Más ligero que Moment.js

  *Para componentes*: **react-day-picker** o **react-datepicker**

#### Forms & Validation
- **React Hook Form**
  - Performance superior
  - Menos re-renders
  - Excelente DX

  *Validación*: **Zod**
  - TypeScript-first
  - Schema validation
  - Type inference automático

#### Routing
- **React Router v6**
  - Nested routes
  - Code splitting
  - Protected routes

#### HTTP Client
- **Axios**
  - Interceptors para auth
  - Request/response transformation
  - Cancelación de requests

  *Con*: **TanStack Query (React Query)**
  - Caching inteligente
  - Background updates
  - Optimistic updates
  - Pagination

#### Rich Text Editor
- **Tiptap**
  - Basado en ProseMirror
  - Headless
  - Extensible
  - Moderno

#### Notificaciones
- **React Hot Toast** o **Sonner**
  - Simple
  - Customizable
  - Buena UX

---

### Backend

#### Runtime & Framework
- **Node.js 20 LTS**
- **Fastify 4.x** (recomendado sobre Express)
  - Más rápido (~30% performance)
  - Schema validation integrada
  - TypeScript decorators
  - Plugin system robusto

  *Alternativa*: **Express.js 4.x** (si se prefiere ecosistema más grande)

#### Lenguaje
- **TypeScript 5.0+**
  - Type safety end-to-end
  - Better tooling
  - Menos bugs en producción

#### ORM
- **Prisma 5.x** (recomendado)
  - Type-safe query builder
  - Auto-generated types
  - Migraciones elegantes
  - Prisma Studio (GUI)
  - Excelente DX

  *Alternativa*: **TypeORM** (si se necesita más flexibilidad SQL)

#### API Style
- **RESTful API** (Principal)
  - CRUD operations
  - Resource-based
  - Status codes estándar

  *Complemento*: **GraphQL** (Opcional para dashboards)
  - Queries complejas
  - Data fetching optimizado
  - Apollo Server

#### Validación
- **Zod** (compartido con frontend)
  - Schemas reutilizables
  - Runtime validation
  - Type inference

#### Autenticación
- **JWT (JSON Web Tokens)**
  - Access tokens (short-lived: 15min)
  - Refresh tokens (long-lived: 7 días)
  - **jsonwebtoken** library

  *Password hashing*: **bcrypt** o **argon2** (más seguro)

#### Autorización
- **CASL** (isomorphic authorization)
  - Attribute-based access control (ABAC)
  - Frontend + Backend
  - Flexible permissions

---

### Base de Datos

#### Base de Datos Principal
- **PostgreSQL 15+**
  - ACID compliant
  - Excelente para analytics
  - JSON/JSONB support
  - Full-text search nativo
  - Window functions para reportes
  - Partitioning para datos grandes
  - Extensions: pg_trgm, uuid-ossp

#### Cache Layer
- **Redis 7+**
  - Session storage
  - Query caching (dashboards)
  - Rate limiting
  - Pub/Sub (notificaciones real-time)
  - Bull queue (background jobs)

#### Full-Text Search
- **PostgreSQL nativo** (Fase 1)
  - pg_trgm extension
  - ts_vector

  *Fase 2*: **Meilisearch** o **Typesense**
  - Typo tolerance
  - Faceted search
  - Más rápido para grandes volúmenes

---

### Seguridad

#### Librerías
- **helmet** - Security headers
- **cors** - CORS configuration
- **express-rate-limit** o **@fastify/rate-limit**
- **express-validator** o validación con Zod
- **hpp** - HTTP Parameter Pollution protection
- **xss-clean** - XSS sanitization

#### Estrategias
- HTTPS obligatorio en producción
- CSRF tokens
- Input sanitization
- SQL injection prevention (ORM)
- Rate limiting por IP
- Password policy enforcement
- 2FA (Fase 2)

---

### DevOps & Infraestructura

#### Containerización
- **Docker 24+**
  - Multi-stage builds
  - Layer caching optimizado

- **Docker Compose**
  - Desarrollo local
  - Orquestación de servicios (app, db, redis)

#### CI/CD
- **GitHub Actions** (recomendado)
  - Workflows automatizados
  - Testing automático
  - Deployment automático

  *Alternativa*: GitLab CI, Azure DevOps

#### Testing

**Frontend**:
- **Vitest** (unit tests)
  - Compatible con Vite
  - Más rápido que Jest

- **React Testing Library** (component tests)
  - Testing orientado a usuario

- **Playwright** (E2E tests)
  - Multi-browser
  - Auto-wait
  - Video recording

**Backend**:
- **Vitest** o **Jest** (unit tests)
- **Supertest** (integration tests)
- **Artillery** (load testing - Fase 2)

#### Code Quality
- **ESLint** - Linting (TypeScript rules)
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting
- **commitlint** - Conventional commits

#### Monitoring & Logging

**Desarrollo**:
- **Pino** (logging) - más rápido que Winston
- Console en dev mode

**Producción** (Fase 2):
- **Grafana** - Dashboards
- **Prometheus** - Metrics
- **Loki** - Log aggregation
- **Sentry** - Error tracking
- **Uptime monitoring** (UptimeRobot, Better Stack)

#### Hosting Options

**Opción A - Cloud Native** (Recomendado):
- **Frontend**: Vercel o Netlify
  - Edge functions
  - Auto scaling
  - CDN global
  - SSL automático
  - Preview deployments

- **Backend**: Railway, Render, o Fly.io
  - Auto scaling
  - Database incluida (PostgreSQL)
  - Redis add-on
  - Health checks
  - Zero-downtime deploys

**Opción B - Traditional Cloud**:
- **AWS**:
  - ECS (Elastic Container Service) para Docker
  - RDS (PostgreSQL)
  - ElastiCache (Redis)
  - S3 (file storage)
  - CloudFront (CDN)

- **Azure**:
  - App Service o AKS
  - Azure Database for PostgreSQL
  - Azure Cache for Redis
  - Blob Storage

- **DigitalOcean**:
  - App Platform
  - Managed PostgreSQL
  - Managed Redis
  - Spaces (S3-compatible)

**Opción C - Self-Hosted**:
- VPS (DigitalOcean Droplets, Linode, Hetzner)
- Nginx reverse proxy
- Let's Encrypt SSL
- Systemd para process management
- Automated backups

#### Recomendación para MVP
**Vercel (Frontend) + Railway (Backend + DB + Redis)**
- Costo efectivo para MVP
- Excelente DX
- Deploy automático desde Git
- Escalable cuando se necesite

---

### File Storage

#### Para archivos del usuario
- **Opción A**: AWS S3 o DigitalOcean Spaces
  - Escalable
  - CDN integration
  - Presigned URLs para uploads seguros

- **Opción B**: Cloudinary
  - Image optimization automática
  - Transformations
  - CDN incluido

#### Para desarrollo
- Local filesystem
- Structured uploads/ directory

---

### Real-Time Features (Fase 2)

#### WebSockets
- **Socket.io**
  - Fallbacks automáticos
  - Room management
  - Broadcasting

  *Casos de uso*:
  - Notificaciones en tiempo real
  - Collaborative editing
  - Live dashboard updates
  - Online presence

---

## Arquitectura del Sistema

### Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌───────────┐  ┌──────────┐  ┌────────────┐  ┌──────────┐ │
│  │  React +  │  │   Zustand │  │  Recharts  │  │ TanStack │ │
│  │TypeScript │  │   State   │  │  Gráficos  │  │  Table   │ │
│  └─────┬─────┘  └──────────┘  └────────────┘  └──────────┘ │
│        │                                                      │
│        │ HTTP/REST (Axios + React Query)                     │
│        ↓                                                      │
│  ┌────────────────────────────────────────────────────┐     │
│  │         API Gateway / Load Balancer                 │     │
│  └────────────────┬───────────────────────────────────┘     │
└───────────────────┼─────────────────────────────────────────┘
                    │
┌───────────────────┼─────────────────────────────────────────┐
│                   ↓           BACKEND                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Fastify + TypeScript + Middleware Stack           │     │
│  │  (Auth, CORS, Rate Limit, Validation, Logging)     │     │
│  └────┬────────────────────┬──────────────────────────┘     │
│       │                    │                                 │
│       ↓                    ↓                                 │
│  ┌─────────┐         ┌──────────┐                           │
│  │ Business │         │   API    │                           │
│  │  Logic   │◄────────┤  Routes  │                           │
│  └────┬────┘         └──────────┘                           │
│       │                                                      │
│       ↓                                                      │
│  ┌─────────────┐                                            │
│  │   Prisma    │                                            │
│  │     ORM     │                                            │
│  └──────┬──────┘                                            │
└─────────┼───────────────────────────────────────────────────┘
          │
          ↓
┌──────────────────────────────────────────────────────────────┐
│                      DATA LAYER                               │
│  ┌──────────────┐         ┌──────────────┐                   │
│  │  PostgreSQL  │         │    Redis     │                   │
│  │   Database   │         │    Cache     │                   │
│  │              │         │              │                   │
│  │ • Contacts   │         │ • Sessions   │                   │
│  │ • Accounts   │         │ • Queries    │                   │
│  │ • Opps       │         │ • Rate limit │                   │
│  │ • Activities │         │ • Pub/Sub    │                   │
│  │ • Users      │         │              │                   │
│  └──────────────┘         └──────────────┘                   │
└──────────────────────────────────────────────────────────────┘
```

### Estructura de Directorios

#### Frontend (`/frontend`)

```
frontend/
├── public/
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── main.tsx                 # Entry point
│   ├── App.tsx                  # Root component
│   ├── vite-env.d.ts
│   │
│   ├── api/                     # API clients
│   │   ├── client.ts            # Axios instance
│   │   ├── auth.api.ts
│   │   ├── contacts.api.ts
│   │   ├── accounts.api.ts
│   │   ├── opportunities.api.ts
│   │   └── ...
│   │
│   ├── components/              # Componentes reutilizables
│   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   └── ...
│   │   ├── charts/              # Componentes de gráficos
│   │   │   ├── PieChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── LineChart.tsx
│   │   │   └── ...
│   │   ├── tables/              # Componentes de tablas
│   │   │   ├── DataTable.tsx
│   │   │   ├── columns/
│   │   │   └── ...
│   │   └── shared/              # Componentes compartidos
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       ├── Avatar.tsx
│   │       └── ...
│   │
│   ├── features/                # Features por módulo
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── store/
│   │   │   └── routes.tsx
│   │   ├── contacts/
│   │   │   ├── components/
│   │   │   │   ├── ContactList.tsx
│   │   │   │   ├── ContactDetail.tsx
│   │   │   │   ├── ContactForm.tsx
│   │   │   │   └── Customer360.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useContacts.ts
│   │   │   ├── store/
│   │   │   │   └── contactsStore.ts
│   │   │   └── routes.tsx
│   │   ├── accounts/
│   │   ├── opportunities/
│   │   │   ├── components/
│   │   │   │   ├── KanbanBoard.tsx
│   │   │   │   ├── OpportunityCard.tsx
│   │   │   │   └── ForecastView.tsx
│   │   │   └── ...
│   │   ├── activities/
│   │   ├── dashboards/
│   │   │   ├── components/
│   │   │   │   ├── DashboardGrid.tsx
│   │   │   │   ├── WidgetLibrary.tsx
│   │   │   │   └── widgets/
│   │   │   │       ├── KPICard.tsx
│   │   │   │       ├── ChartWidget.tsx
│   │   │   │       └── ...
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── hooks/                   # Custom hooks globales
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── ...
│   │
│   ├── layouts/                 # Layouts
│   │   ├── AuthLayout.tsx
│   │   ├── DashboardLayout.tsx
│   │   └── ...
│   │
│   ├── lib/                     # Utilidades y helpers
│   │   ├── utils.ts
│   │   ├── cn.ts                # classnames utility
│   │   ├── formatters.ts
│   │   └── ...
│   │
│   ├── routes/                  # Routing configuration
│   │   ├── index.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── routes.config.ts
│   │
│   ├── store/                   # Global state (Zustand)
│   │   ├── index.ts
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   └── ...
│   │
│   ├── styles/                  # Estilos globales
│   │   ├── globals.css
│   │   ├── tailwind.css
│   │   └── ...
│   │
│   ├── types/                   # TypeScript types
│   │   ├── index.ts
│   │   ├── contact.types.ts
│   │   ├── account.types.ts
│   │   ├── opportunity.types.ts
│   │   └── ...
│   │
│   └── constants/               # Constantes
│       ├── config.ts
│       ├── colors.ts
│       └── ...
│
├── .env.example
├── .env.development
├── .env.production
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

#### Backend (`/backend`)

```
backend/
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration files
│   └── seed.ts                 # Seed data
│
├── src/
│   ├── index.ts                # Entry point
│   ├── server.ts               # Server setup
│   │
│   ├── config/                 # Configuration
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── ...
│   │
│   ├── modules/                # Módulos por feature
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.schema.ts     # Zod schemas
│   │   │   └── auth.types.ts
│   │   ├── contacts/
│   │   │   ├── contacts.controller.ts
│   │   │   ├── contacts.service.ts
│   │   │   ├── contacts.routes.ts
│   │   │   ├── contacts.schema.ts
│   │   │   └── contacts.types.ts
│   │   ├── accounts/
│   │   ├── opportunities/
│   │   ├── activities/
│   │   ├── dashboards/
│   │   ├── users/
│   │   └── ...
│   │
│   ├── middleware/             # Middlewares
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── ...
│   │
│   ├── utils/                  # Utilidades
│   │   ├── logger.ts
│   │   ├── hash.ts
│   │   ├── jwt.ts
│   │   ├── validators.ts
│   │   └── ...
│   │
│   ├── types/                  # TypeScript types
│   │   ├── index.ts
│   │   ├── express.d.ts
│   │   └── ...
│   │
│   └── constants/              # Constantes
│       ├── errors.ts
│       └── ...
│
├── tests/                      # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .env.development
├── .env.test
├── .env.production
├── .eslintrc.js
├── .prettierrc
├── nodemon.json
├── package.json
└── tsconfig.json
```

---

## Variables de Entorno

### Frontend (`.env`)

```bash
# API
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=true

# External Services (Fase 2)
VITE_SENTRY_DSN=
VITE_GOOGLE_ANALYTICS_ID=
```

### Backend (`.env`)

```bash
# Server
NODE_ENV=development
PORT=3000
HOST=localhost

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/stia_crm?schema=public

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100

# Email (Fase 2)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@stia-crm.com

# File Storage (Fase 2)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=us-east-1

# External Services
SENTRY_DSN=
```

---

## Decisiones Técnicas Clave

### ¿Por qué Fastify sobre Express?

✅ **Pros de Fastify**:
- ~30% más rápido
- Schema validation integrada (JSON Schema)
- Async/await desde el principio
- TypeScript decorators
- Plugin system más robusto
- Logging integrado (Pino)

❌ **Contras**:
- Ecosistema de plugins más pequeño
- Menos tutoriales y recursos

**Decisión**: Fastify para mejor performance y DX moderno.
*Alternativa*: Express si el equipo está más familiarizado.

---

### ¿Por qué Zustand sobre Redux?

✅ **Pros de Zustand**:
- Menos boilerplate (~70% menos código)
- API más simple
- No necesita Context Provider
- DevTools integration
- Middleware para persist
- TypeScript excelente

❌ **Contras**:
- Menos maduro que Redux
- Comunidad más pequeña

**Decisión**: Zustand para MVP por simplicidad.
*Posible migración*: A Redux Toolkit si se necesita más estructura en escala.

---

### ¿Por qué Prisma sobre TypeORM?

✅ **Pros de Prisma**:
- Type safety superior
- Migrations más claras
- Prisma Studio (GUI)
- Auto-generated client
- Mejor DX

❌ **Contras**:
- Menos flexible para queries complejos
- Más "magic" (menos control)

**Decisión**: Prisma para MVP por productividad.
*Consideración*: Raw SQL queries disponibles para casos complejos.

---

### ¿Por qué Recharts sobre Chart.js?

✅ **Pros de Recharts**:
- Componentes nativos React
- Composable
- Declarativo
- TypeScript support

❌ **Contras**:
- Menos tipos de gráficos
- Canvas rendering no disponible

**Decisión**: Recharts como principal + ECharts para gráficos complejos.

---

## Performance Targets

### Frontend
- **Time to Interactive (TTI)**: < 3s
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Lighthouse Score**: > 90

### Backend
- **Response time** (95th percentile): < 200ms
- **Throughput**: > 1000 req/s (load test)
- **Database queries**: < 50ms promedio
- **Uptime**: > 99.9%

---

## Seguridad

### Checklist de Seguridad

- [ ] HTTPS en producción (SSL/TLS)
- [ ] Security headers (Helmet)
- [ ] CORS configurado correctamente
- [ ] Rate limiting por IP
- [ ] Input validation (Zod)
- [ ] SQL injection protection (Prisma ORM)
- [ ] XSS protection (sanitización)
- [ ] CSRF tokens
- [ ] Passwords hasheados (bcrypt/argon2)
- [ ] JWT con expiración corta
- [ ] Refresh tokens en HTTP-only cookies
- [ ] Environment variables nunca en código
- [ ] Secrets en vault (no en .env en producción)
- [ ] Regular dependency updates
- [ ] Security audit (npm audit)

---

## Escalabilidad

### Estrategias de Escalabilidad

**Horizontal scaling**:
- Load balancer (Nginx, AWS ALB)
- Múltiples instancias del backend
- Stateless API (sessions en Redis)

**Database**:
- Connection pooling (Prisma)
- Read replicas (Fase 2)
- Query optimization (indexes)
- Partitioning para tablas grandes (Actividades)

**Caching**:
- Redis para queries frecuentes
- CDN para assets estáticos
- Service Workers (PWA - Fase 2)

**Background Jobs**:
- Bull queue con Redis
- Email sending async
- Report generation async
- Data imports async

---

## Siguiente Paso

📋 **Próximo documento**: Modelo de Datos (ERD)

---

**Última actualización**: 2026-01-15
**Versión**: 0.1.0
