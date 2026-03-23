# PROJECT-PLAN.md - Portal de Casos de Servicio STIA

## Paso 1: Definicion del Problema

**Problem Statement:** STIA necesita un portal web para gestionar casos de servicio al cliente en 5 paises centroamericanos, reemplazando el uso de Excel y el sistema CRM actual, almacenando datos en SAP Business One via Service Layer.

| Incluye | No Incluye |
|---------|------------|
| CRUD de casos de servicio (ServiceCalls) | Modulo de reportes PDF/Excel exportables |
| Dashboard con KPIs animados | Notificaciones push o email |
| Timeline de notas por caso | Integracion con CRM externo |
| Alertas por tiempo excedido (SLA) | Modulo de inventario o facturacion |
| Multi-pais (CR, SV, GT, HN, PA) | App movil nativa |
| Login con animaciones | Gestion de usuarios/roles en SAP |
| Lookup BusinessPartners y EmployeesInfo | Migracion de datos historicos |
| Estadisticas con graficas Recharts | Chat o mensajeria interna |

## Paso 2: Alcance y Tipo

**Tipo:** CRUD con Dashboard analitico + Integracion SAP

**Usuarios y roles:**

| Rol | Acceso |
|-----|--------|
| Agente de Servicio | CRUD casos, ver dashboard propio |
| Supervisor | Todo + reportes, reasignar casos |
| Admin | Todo + configuracion, multi-pais |

**Funcionalidades MoSCoW:**

| Prioridad | Funcionalidad |
|-----------|--------------|
| Must | Login con SAP auth + animaciones |
| Must | CRUD Casos (ServiceCalls + UDFs) |
| Must | Dashboard con KPIs animados |
| Must | Multi-pais (5 DBs) con country selector |
| Must | Lookups SAP (BusinessPartners, EmployeesInfo) |
| Should | Timeline de notas por caso |
| Should | Alertas SLA (tiempo excedido) |
| Could | Graficas Recharts (estadisticas) |
| Won't | Notificaciones push/email |
| Won't | Reportes PDF exportables |

## Paso 3: Entidades y Relaciones

```
ServiceCall (SAP) ──1:N──▶ ServiceCallNote
    │
    ├── CustomerCode ──▶ BusinessPartner (CardCode, CardName, Phone1, Email)
    ├── TechnicianCode ──▶ EmployeeInfo (EmployeeID, FirstName, LastName)
    │
    └── UDFs:
        ├── U_Canal (Llamada|Correo|WhatsApp|Visita|Redes|Portal)
        ├── U_TipoCaso (Consulta|Reclamo|Garantia|Servicio campo|...)
        ├── U_Area (Ventas|Soporte|Atencion al Cliente|Calidad|Finanzas|Logistica)
        ├── U_TiempoEst (24h|48h|72h|1 semana|2 semanas|1 mes)
        ├── U_ContactTel (telefono contacto)
        └── U_ContactEmail (email contacto)
```

**Reglas de negocio:**
- CustomerCode obligatorio al crear caso
- Status default: "Abierto"
- U_TiempoEst default: "48h"
- SAPSession se renueva auto al expirar (30 min)

## Paso 4: Stack Tecnologico

| Capa | Tecnologia | Justificacion | Alternativa descartada |
|------|-----------|---------------|----------------------|
| Framework | Next.js 15 (App Router) | SSR + API Routes, deploy simple | SvelteKit |
| UI | shadcn/ui + Tailwind v4 | Copy-paste, accesible | MUI |
| Animaciones | Framer Motion | Spring physics, gestures | GSAP |
| Charts | Recharts | Composable, React nativo | Chart.js |
| SAP | fetch + Service Layer REST | API nativa SAP B1 | SAP DI API |
| Auth | JWT cookies HttpOnly | Seguro, stateless | NextAuth |
| Deploy | PM2 + Nginx (AWS EC2) | Infra existente, SSL | Vercel |

**Riesgos tecnicos:**
1. SAP Session timeout (30 min) → refresh automatico en middleware
2. Multi-DB switching (5 bases) → session pool por pais
3. UDFs no existen aun → script de setup automatizado

## Paso 5: Arquitectura

```
Browser (React + Framer Motion + shadcn)
    │ HTTPS
Next.js Server
    ├── API Routes /api/* (proxy a SAP)
    ├── Middleware (auth + country)
    └── SAP Service (session pool, CRUD, lookups)
        │ HTTPS :50000
SAP Service Layer
    ├── SBO_STIACR_PROD
    ├── SBO_SV_STIA_FINAL
    ├── SBO_GT_STIA_PROD
    ├── SBO_HO_STIA_PROD
    └── SBO_PA_STIA_PROD
```

**Estructura de carpetas:**
```
/data/casos/
├── src/app/
│   ├── (auth)/login/page.tsx
│   ├── (portal)/dashboard/page.tsx
│   ├── (portal)/casos/page.tsx
│   ├── (portal)/casos/nuevo/page.tsx
│   ├── (portal)/casos/[id]/page.tsx
│   ├── (portal)/casos/[id]/editar/page.tsx
│   ├── (portal)/estadisticas/page.tsx
│   ├── (portal)/alertas/page.tsx
│   ├── (portal)/layout.tsx
│   ├── api/auth/login/route.ts
│   ├── api/auth/logout/route.ts
│   ├── api/casos/route.ts
│   ├── api/casos/[id]/route.ts
│   ├── api/lookup/bp/route.ts
│   └── api/lookup/employees/route.ts
├── src/lib/
│   ├── sap-client.ts
│   ├── sap-session.ts
│   ├── auth.ts
│   └── constants.ts
├── src/components/
│   ├── ui/ (shadcn)
│   ├── sidebar.tsx
│   ├── kpi-card.tsx
│   ├── cases-table.tsx
│   ├── case-timeline.tsx
│   ├── country-selector.tsx
│   └── case-form.tsx
└── src/hooks/
    ├── use-sap-lookup.ts
    └── use-cases.ts
```

## Paso 6: Roadmap

| Sprint | Dias | Entregable | Dependencia | Done |
|--------|------|-----------|-------------|------|
| S1: Foundation | 3 | Next.js scaffold, shadcn, SAP client, auth | - | Login funcional contra SAP |
| S2: SAP Config | 2 | UDFs en 5 DBs, ServiceCallOrigins/Types | S1 | UDFs creados y validados |
| S3: CRUD Casos | 3 | Crear, listar, ver, editar casos | S1, S2 | CRUD completo en 1 pais |
| S4: Dashboard | 2 | KPI cards animadas, tabla recientes, charts | S3 | Dashboard con datos reales |
| S5: Multi-pais | 2 | Country selector, session pool | S3 | Cambiar pais sin relogin |
| S6: Timeline + SLA | 2 | Notas por caso, alertas tiempo | S3 | Timeline y alertas visibles |
| S7: Deploy | 1 | Build, PM2, Nginx en EC2 | S1-S6 | Portal en produccion |

**Total: 15 dias**

## Pantallas Diseñadas (Pencil AI)

| # | Pantalla | Archivo | Node ID |
|---|----------|---------|---------|
| 1 | Login | casos-ui.pen | yaYPg |
| 2 | Dashboard | casos-ui.pen | o4BiW |
| 3 | Detalle de Caso | casos-ui.pen | KV0jF |
| 4 | Nuevo Caso | casos-ui.pen | ErG5f |
| 5 | Todos los Casos | casos-ui.pen | xoRA2 |
| 6 | Editar Caso | casos-ui.pen | dE4Pr |
| 7 | Estadisticas | casos-ui.pen | IxZpa |
| 8 | SLA & Alertas | casos-ui.pen | FIzWP |

## Conexiones

- **SAP Service Layer:** https://sap-stiacmzdr-sl.skyinone.net:50000/
- **SAP User:** Consultas / Stia123*
- **AWS EC2:** 3.212.155.164 (SSH via KP-STIA.pem)
- **Deploy path:** /data/casos
- **GitHub:** https://github.com/FmBlueSystem/Casos

## Gate 1: Planning Complete

| # | Item | Criterio | Estado |
|---|------|----------|--------|
| 1.1 | Problem statement | Aprobable en 1 lectura | PASS |
| 1.2 | Anti-scope | 8 items, sin ambiguedades | PASS |
| 1.3 | Funcionalidades | MoSCoW, sin duplicados | PASS |
| 1.4 | Entidades | Cardinalidades claras | PASS |
| 1.5 | Stack | Riesgos documentados | PASS |
| 1.6 | Arquitectura | Dev puede scaffoldear | PASS |
| 1.7 | Roadmap | Estimaciones realistas | PASS |

**Gate 1: PASS**
