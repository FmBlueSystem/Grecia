# STIA CRM - MVP

> Sistema de Gestión de Relaciones con Clientes (CRM) web moderno inspirado en Microsoft Dynamics CRM, con la identidad visual de STIA y enfoque especial en visualización de datos y analytics.

![Status](https://img.shields.io/badge/status-planning-blue)
![Version](https://img.shields.io/badge/version-0.1.0-green)
![License](https://img.shields.io/badge/license-proprietary-red)

---

## 🎯 Visión del Proyecto

Desarrollar un CRM MVP robusto y moderno que permita a los equipos de ventas gestionar contactos, cuentas, oportunidades y actividades de manera eficiente, con dashboards interactivos y visualización de datos avanzada.

### Características Principales

✅ **Gestión de Contactos y Cuentas** - Customer 360° view con timeline interactivo
✅ **Sales Pipeline Visual** - Kanban drag-and-drop, forecast view, y analytics
✅ **Actividades y Calendario** - Gestión completa de llamadas, emails, reuniones y tareas
✅ **Dashboards Interactivos** - Gráficos interactivos con Recharts (Pie, Bar, Line, Funnel, Gauge)
✅ **Búsqueda Avanzada** - Query builder visual y vistas guardadas
✅ **Roles y Permisos** - Sistema granular de autorizaciónå
✅ **Responsive Design** - Mobile-first con la identidad visual de STIA

---

## 📋 Documentación

Este proyecto incluye documentación completa y detallada:

### 🎨 Diseño

- **[Design System](design-system/DESIGN_SYSTEM.md)** - Paleta de colores, tipografía, componentes UI, espaciado, sombras, y más
  - Logo de STIA descargado en `assets/logos/`
  - Paleta de colores completa con variantes
  - Sistema de espaciado y breakpoints responsive
  - Especificaciones de componentes (botones, forms, cards, etc.)
  - Guía de gráficos y visualizaciones

### 📚 Documentos Técnicos

- **[Especificación Técnica](docs/ESPECIFICACION_TECNICA.md)** - Stack tecnológico completo, arquitectura del sistema, decisiones técnicas
  - **Frontend**: React 18 + TypeScript + Tailwind CSS + shadcn/ui
  - **Backend**: Node.js + Fastify + Prisma + PostgreSQL + Redis
  - **Gráficos**: Recharts + Apache ECharts
  - **Deployment**: Vercel (frontend) + Railway (backend)

- **[Modelo de Datos](docs/MODELO_DE_DATOS.md)** - ERD completo con todas las entidades del CRM
  - 16 entidades principales (User, Contact, Account, Opportunity, Activity, etc.)
  - Relaciones detalladas
  - Schema de Prisma completo
  - Índices y optimizaciones

### 📅 Planificación

- **[Plan de Trabajo](planning/PLAN_DE_TRABAJO.md)** - Plan detallado de 14 semanas con tareas específicas
  - Fase 1: Diseño y Planeación (Semanas 1-2)
  - Fase 2: Setup y Fundamentos (Semana 3)
  - Fase 3: Desarrollo Core (Semanas 4-9)
  - Fase 4: Features Avanzadas (Semanas 10-11)
  - Fase 5: Testing y Refinamiento (Semanas 12-13)
  - Fase 6: Deployment y Documentación (Semana 14)

---

## 🚀 Quick Start (Pendiente)

*Una vez iniciado el desarrollo, aquí estarán las instrucciones de setup.*

```bash
# Clonar repositorio
git clone <repo-url>
cd stia-crm

# Instalar dependencias
npm install

# Setup de base de datos
docker-compose up -d
cd backend
npx prisma migrate dev
npx prisma db seed

# Iniciar desarrollo
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TS)                     │
│  • Zustand State Management                                 │
│  • Recharts para visualizaciones                            │
│  • TanStack Table para tablas avanzadas                     │
│  • shadcn/ui + Tailwind CSS                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ REST API (Axios + React Query)
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                    BACKEND (Fastify + TS)                    │
│  • Prisma ORM                                               │
│  • JWT Authentication                                       │
│  • Zod Validation                                           │
│  • Redis Caching                                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                 DATA LAYER                                   │
│  • PostgreSQL 15+ (main database)                           │
│  • Redis 7+ (cache & sessions)                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 Módulos del CRM

### Módulo 1: Contactos y Cuentas
- CRUD completo de contactos y empresas
- Customer 360° view con timeline
- Importación/exportación CSV/Excel
- Búsqueda avanzada y filtros
- Jerarquía de cuentas (parent/subsidiaries)

### Módulo 2: Sales Pipeline
- Kanban visual drag-and-drop
- Gestión de oportunidades
- Business process flows
- Forecast view (6 meses)
- Win/Loss analysis

### Módulo 3: Actividades
- Llamadas, emails, reuniones, tareas
- Calendario (día/semana/mes)
- Timeline de actividades
- Quick-create desde cualquier pantalla

### Módulo 4: Dashboards y Analytics
- Dashboards personalizables
- 9 tipos de gráficos (Pie, Bar, Line, Area, Funnel, Gauge, Heatmap, Scatter, Combo)
- KPI cards con trends
- Filtros globales (date range, usuario, etc.)
- Drill-down a datos detallados

### Módulo 5: Búsqueda y Filtrado
- Búsqueda global (Ctrl+K)
- Query builder visual
- Vistas guardadas (personales y compartidas)
- Filtros avanzados por columna

### Módulo 6: Administración
- Gestión de usuarios
- Roles y permisos granulares
- Audit trail de cambios
- Configuración del sistema

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: React 18.2+ con TypeScript 5.0+
- **Routing**: React Router v6
- **State**: Zustand (o Redux Toolkit)
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS 3.x
- **Charts**: Recharts + Apache ECharts
- **Tables**: TanStack Table v8
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios + TanStack Query
- **Drag & Drop**: @dnd-kit

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Fastify 4.x
- **Language**: TypeScript 5.0+
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Validation**: Zod
- **Auth**: JWT (jsonwebtoken + bcrypt)

### DevOps
- **Containerización**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Testing**: Vitest + React Testing Library + Playwright
- **Linting**: ESLint + Prettier
- **Hosting**: Vercel (frontend) + Railway (backend)

---

## 📈 Timeline

| Fase | Duración | Descripción | Estado |
|------|----------|-------------|--------|
| **Fase 1** | Semanas 1-2 | Diseño y Planeación | 🔵 En progreso |
| **Fase 2** | Semana 3 | Setup y Fundamentos | ⚪ Pendiente |
| **Fase 3** | Semanas 4-9 | Desarrollo Core | ⚪ Pendiente |
| **Fase 4** | Semanas 10-11 | Features Avanzadas | ⚪ Pendiente |
| **Fase 5** | Semanas 12-13 | Testing y Refinamiento | ⚪ Pendiente |
| **Fase 6** | Semana 14 | Deployment y Documentación | ⚪ Pendiente |

**Fecha estimada de entrega**: Abril 2026

---

## 👥 Equipo

- **CTO / Tech Lead**: Freddy Molina
- **Empresa**: BlueSystem

---

## 📝 Estructura del Repositorio

```
stia-crm/
├── assets/                      # Assets de marca
│   ├── logos/
│   │   └── stia-logo.png       # Logo descargado
│   ├── colors/
│   └── fonts/
│
├── design-system/               # Sistema de diseño
│   └── DESIGN_SYSTEM.md        # Documentación completa
│
├── docs/                        # Documentación técnica
│   ├── ESPECIFICACION_TECNICA.md
│   └── MODELO_DE_DATOS.md
│
├── planning/                    # Planificación del proyecto
│   └── PLAN_DE_TRABAJO.md
│
├── frontend/                    # Aplicación React (próximamente)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/                     # API Fastify (próximamente)
│   ├── src/
│   ├── prisma/
│   └── package.json
│
├── docker-compose.yml          # Servicios de desarrollo (próximamente)
├── .gitignore
└── README.md                   # Este archivo
```

---

## 🎨 Identidad Visual

Este CRM utiliza la identidad visual de **[STIA](https://stia.net)**:

- **Color primario**: #0067B2 (Azul corporativo)
- **Tipografía**: System fonts (opción: Inter de Google Fonts)
- **Logo**: Descargado en `assets/logos/stia-logo.png`
- **Estilo**: Corporativo, moderno, limpio

Ver [Design System completo](design-system/DESIGN_SYSTEM.md) para más detalles.

---

## 🔐 Seguridad

- HTTPS en producción
- JWT con access + refresh tokens
- Bcrypt para passwords
- Rate limiting por IP
- Helmet.js para security headers
- Input validation con Zod
- SQL injection protection (Prisma ORM)
- CORS configurado
- Audit trail de cambios

---

## 🧪 Testing

- **Unit Tests**: Vitest (coverage >80%)
- **Integration Tests**: Supertest
- **E2E Tests**: Playwright
- **Performance Tests**: Artillery (load testing)
- **Accessibility**: WCAG 2.1 AA compliance

---

## 📦 Próximos Pasos

### Inmediatos (Esta Semana)
1. ✅ Documentar Design System
2. ✅ Documentar Especificación Técnica
3. ✅ Documentar Modelo de Datos
4. ✅ Crear Plan de Trabajo
5. ⏳ Validar paleta de colores con stakeholders
6. ⏳ Decidir fuente tipográfica
7. ⏳ Obtener logo en SVG
8. ⏳ Seleccionar librería de iconos

### Semana Próxima
- Crear wireframes en Figma
- Prototipos interactivos
- User stories detalladas
- Setup de proyecto (boilerplate)

---

## 🤝 Contribución

Este es un proyecto privado de BlueSystem. Consultar con el equipo antes de realizar cambios.

---

## 📄 Licencia

Proprietary - © 2026 BlueSystem / STIA

---

## 📧 Contacto

- **Project Lead**: Freddy Molina
- **Email**: [freddymolina@bluesystem.com]
- **Empresa**: BlueSystem

---

## 🏆 Objetivos del MVP

El MVP debe cumplir con:

✅ **Funcionalidad**:
- CRUD completo de Contactos, Cuentas, Oportunidades
- Pipeline visual con Kanban drag-and-drop
- Dashboards con gráficos interactivos
- Actividades y calendario
- Búsqueda avanzada

✅ **Calidad**:
- Performance: Lighthouse score >90
- Tests: Coverage >80%
- Accessibility: WCAG 2.1 AA
- Security: Best practices implementadas
- UX: Design system consistente

✅ **Entrega**:
- Deployed en producción
- Documentación completa (user + technical)
- Training realizado
- Soporte inicial configurado

---

**Última actualización**: 2026-01-15

**Let's build the best CRM! 🚀**
