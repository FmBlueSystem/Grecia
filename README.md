# STIA CRM - MVP

> Sistema de Gestión de Relaciones con Clientes (CRM) web moderno inspirado en Microsoft Dynamics CRM, con la identidad visual de STIA y enfoque especial en visualización de datos y analytics.

![Status](https://img.shields.io/badge/status-mvp--ready-success)
![Version](https://img.shields.io/badge/version-1.0.0-green)
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

## 🚀 Quick Start

### Prerrequisitos
- Node.js 20+ LTS
- npm o yarn

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/FmBlueSystem/Grecia.git
cd Grecia

# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

### Iniciar Aplicación

```bash
# Terminal 1 - Backend (puerto 3000)
cd backend
npm run dev

# Terminal 2 - Frontend (puerto 5174)
cd frontend
npm run dev
```

### Acceder a la Aplicación

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### Credenciales de Acceso

```
Email: freddy@bluesystem.com
Password: password123
```

> **Nota**: El MVP utiliza una base de datos en memoria (Map-based) para facilitar el desarrollo sin dependencias externas. Los datos se reinician al detener el servidor backend.

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
- **Framework**: React 19 con TypeScript 5
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4 con @tailwindcss/postcss
- **Animations**: Framer Motion 12
- **Charts**: Recharts 3
- **Icons**: Lucide React
- **HTTP**: Fetch API nativo
- **Auth**: JWT en localStorage

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Fastify 5
- **Language**: TypeScript 5
- **Database**: In-memory Map-based (MVP)
- **Auth**: JWT (jsonwebtoken) + Bcrypt 6
- **Logger**: Pino con pino-pretty
- **Validation**: TypeScript types

### DevOps
- **Version Control**: Git + GitHub
- **Linting**: ESLint + Prettier
- **Hosting**: Pendiente (Vercel frontend + Railway backend)

---

## 📈 Estado del Proyecto

### ✅ Completado (MVP v1.0)

**Backend:**
- ✅ Servidor Fastify 5 configurado y corriendo
- ✅ Base de datos en memoria (Map-based) con datos seed
- ✅ Autenticación JWT + Bcrypt
- ✅ CRUD completo para Contactos
- ✅ CRUD completo para Oportunidades
- ✅ CRUD completo para Actividades
- ✅ API RESTful con endpoints funcionales
- ✅ CORS configurado para múltiples orígenes
- ✅ Logger Pino integrado

**Frontend:**
- ✅ Aplicación React 19 + TypeScript 5
- ✅ Tailwind CSS v4 con tema personalizado STIA
- ✅ Página de Login con animaciones
- ✅ Dashboard interactivo con KPIs
- ✅ Gráficos de Revenue y Win Rate (Recharts)
- ✅ Sistema completo de animaciones (Framer Motion)
- ✅ Formularios modales para Contactos y Oportunidades
- ✅ Tablas de datos con acciones (ver/editar/eliminar)
- ✅ Diseño responsive y profesional
- ✅ Protección de rutas con autenticación

**DevOps:**
- ✅ Repositorio Git inicializado
- ✅ Código subido a GitHub
- ✅ .gitignore configurado

### 🔄 Próximas Mejoras

- ⏳ Migrar a PostgreSQL con Prisma
- ⏳ Agregar Redis para caché
- ⏳ Implementar búsqueda avanzada
- ⏳ Agregar filtros y ordenamiento en tablas
- ⏳ Pipeline visual con drag & drop
- ⏳ Calendario de actividades
- ⏳ Exportación a CSV/Excel
- ⏳ Tests unitarios e integración
- ⏳ Deployment a producción

**Fecha de MVP completado**: 16 de Enero 2026

---

## 👥 Equipo

- **CTO / Tech Lead**: Freddy Molina
- **Empresa**: BlueSystem

---

## 📝 Estructura del Repositorio

```
Grecia/
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
├── frontend/                    # ✅ Aplicación React 19 + Vite
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   │   ├── ContactForm.tsx
│   │   │   ├── OpportunityForm.tsx
│   │   │   └── Charts.tsx
│   │   ├── pages/              # Páginas
│   │   │   └── Login.tsx
│   │   ├── utils/              # Utilidades
│   │   │   └── animations.ts  # Configuraciones Framer Motion
│   │   ├── App.tsx             # Dashboard principal
│   │   ├── index.css           # Tailwind CSS v4
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── postcss.config.js       # Config Tailwind v4
│
├── backend/                     # ✅ API Fastify 5
│   ├── src/
│   │   ├── utils/
│   │   │   └── db.ts           # Base de datos en memoria
│   │   └── index.ts            # Servidor principal
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md                    # Este archivo
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

## 📦 Funcionalidades Implementadas

### 🎨 UI/UX
- ✅ Diseño profesional con identidad STIA (#0067B2)
- ✅ Animaciones fluidas con Framer Motion
- ✅ Responsive design (mobile-first)
- ✅ Modales animados para formularios
- ✅ Efectos hover y transiciones
- ✅ Partículas animadas en background
- ✅ Iconos Lucide React

### 📊 Dashboard
- ✅ 4 KPIs principales con animaciones
  - Revenue MTD vs Objetivo
  - Win Rate con porcentaje
  - Oportunidades abiertas
  - Actividades completadas
- ✅ Gráfico de Revenue (6 meses)
- ✅ Gráfico de Win Rate por mes
- ✅ Tablas de Contactos y Oportunidades
- ✅ Acciones rápidas (ver/editar/eliminar)

### 🔐 Autenticación
- ✅ Login con email/password
- ✅ JWT tokens con expiración 24h
- ✅ Bcrypt para encriptación de passwords
- ✅ Protección de rutas privadas
- ✅ Logout funcional

### 📋 CRUD Completo
- ✅ **Contactos**: Crear, leer, editar, eliminar
- ✅ **Oportunidades**: Crear, leer, editar, eliminar
- ✅ **Actividades**: Gestión completa
- ✅ Soft delete (isActive flag)
- ✅ Timestamps automáticos
- ✅ Validación de datos

### 🎯 Próximas Características
- ⏳ Búsqueda y filtros avanzados
- ⏳ Ordenamiento en tablas
- ⏳ Paginación de datos
- ⏳ Pipeline Kanban drag & drop
- ⏳ Calendario de actividades
- ⏳ Customer 360° view
- ⏳ Exportación CSV/Excel
- ⏳ Roles y permisos granulares
- ⏳ Notificaciones en tiempo real

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

---

## 🎥 Demo

### Capturas de Pantalla

**Login Page**
- Diseño moderno con gradiente azul STIA
- Partículas animadas en background
- Formulario con validación
- Animaciones de entrada suaves

**Dashboard**
- KPIs animados con efectos hover
- Gráficos interactivos de Recharts
- Tablas responsivas con datos en tiempo real
- Modales para crear/editar registros

### Video Demo
> Próximamente: Video mostrando el flujo completo de la aplicación

---

## 🔧 Comandos Útiles

```bash
# Backend
cd backend
npm run dev          # Iniciar servidor desarrollo
npm run build        # Compilar TypeScript
npm start            # Iniciar producción

# Frontend
cd frontend
npm run dev          # Iniciar Vite dev server
npm run build        # Build para producción
npm run preview      # Preview del build

# Git
git status           # Ver estado
git add .            # Agregar cambios
git commit -m "msg"  # Commit
git push             # Subir a GitHub
```

---

## 🐛 Troubleshooting

**Backend no responde**
```bash
# Verificar que el puerto 3000 esté libre
lsof -i :3000

# Verificar health del backend
curl http://localhost:3000/health
```

**Frontend no carga**
```bash
# Verificar que el puerto 5174 esté libre
lsof -i :5174

# Limpiar cache de Vite
cd frontend
rm -rf node_modules/.vite
npm run dev
```

**Error de CORS**
- Verificar que el backend acepte el puerto del frontend en `backend/src/index.ts`
- Por defecto acepta: 5173 y 5174

**Credenciales no funcionan**
- Email: `freddy@bluesystem.com`
- Password: `password123`
- Verificar que el hash de bcrypt esté correcto en `backend/src/utils/db.ts`

---

**Última actualización**: 16 de Enero 2026

**Status**: ✅ MVP v1.0 Completado y Funcional

**Let's build the best CRM! 🚀**
