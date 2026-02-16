# Auditoria BlueSystem - STIA CRM
Fecha: 2026-02-14
Auditor: Claude (BlueSystem Methodology)

## Resumen Ejecutivo

Proyecto CRM multi-pais para STIA con 85% de progreso hacia MVP. El diseno (26 pantallas) esta completo al 100%. El codigo backend/frontend es funcional pero tiene **3 gaps criticos de produccion**: aislamiento de datos multi-empresa inexistente, autorizacion RBAC no implementada, y cero cobertura de tests. Accion inmediata: corregir el aislamiento de datos antes de cualquier deployment.

## Estado por Paso

| Paso | Descripcion | Estado | Evidencia |
|------|-------------|--------|-----------|
| 1 | Problema | PARCIAL | `CRM-DESIGN-STATUS.md` describe cliente y modulos, pero no hay PROJECT-PLAN.md formal. README.md es template de Vite sin personalizar. |
| 2 | Alcance | PARCIAL | `.conductor/tracks.md` lista 6 tracks con progreso. Modulos solicitados en CRM-DESIGN-STATUS.md. No hay anti-scope documentado. |
| 3 | Entidades | OK | `backend/prisma/schema.prisma` - 16 modelos con relaciones, indices, y migraciones aplicadas. Seed script funcional. |
| 4 | Stack | PARCIAL | Stack inferible de `package.json`: React 19 + Fastify + Prisma + PostgreSQL + SAP SL. No hay ADR ni justificacion documentada. |
| 5 | Arquitectura | PARCIAL | Backend bien separado (routes/services/plugins/middleware/config). Frontend mezcla logica en paginas sin capa de servicios clara. `helmet` registrado 2 veces en index.ts. |
| 6 | Roadmap | PARCIAL | `.conductor/tracks.md` tiene 6 tracks con prioridades. No hay milestones con fechas ni sprints formales. 1 solo TODO encontrado en codebase. |

## Quality Gates

| Gate | Estado | Bloqueadores |
|------|--------|-------------|
| 1 Planning | BLOCKED | No hay PROJECT-PLAN.md, no hay anti-scope, README sin personalizar |
| 2 Architecture | BLOCKED | Doble registro de helmet, sin RBAC middleware, sin aislamiento de datos por empresa |
| 3 Core Feature | PASS | CRUD completo para 12 entidades, autenticacion JWT funcional, pipeline kanban, SAP client listo |
| 4 Pre-Delivery | BLOCKED | 0 tests, 0 Dockerfiles app, sin CI/CD, credenciales hardcoded en sap.service.ts, i18n sin migrar a UI |

## Deuda Metodologica

| Prioridad | Gap | Impacto | Esfuerzo |
|-----------|-----|---------|----------|
| CRITICA | Aislamiento datos multi-empresa (queries no filtran por companyCode) | Todas las empresas ven datos de todas - inaceptable en produccion | 1 dia |
| CRITICA | Autorizacion RBAC no implementada (Role model existe pero no se usa) | Cualquier usuario autenticado puede hacer todo (crear, borrar, etc.) | 1 dia |
| CRITICA | Cero tests (backend y frontend) | Sin red de seguridad para cambios, imposible validar regresiones | 2-3 dias |
| ALTA | Credenciales SAP hardcoded en `sap.service.ts:31-32` (user/password en codigo) | Riesgo de seguridad en repositorio | 15 min |
| ALTA | `helmet` registrado 2 veces en `backend/src/index.ts:54-55` | Headers duplicados, posible error HTTP | 5 min |
| ALTA | Sin Dockerfiles de aplicacion ni CI/CD | No se puede deployar de forma reproducible | 1 dia |
| ALTA | i18n: archivos de traduccion existen (EN/ES) pero UI tiene texto hardcoded en espanol | Feature incompleta, selector de idioma no funciona realmente | 1-2 dias |
| MEDIA | Frontend sin React Router (navegacion en memoria via useState) | No hay deep linking, no funciona back/forward del browser, no hay URLs compartibles | 4h |
| MEDIA | README.md es template de Vite sin personalizar | Desarrollador nuevo no sabe que es el proyecto | 30 min |
| MEDIA | Paginas incompletas: Products (sin sync SAP), Orders (tabla basica), Invoices (sin registro de pagos) | Features parciales visible al usuario | 1 dia |
| BAJA | Sin PROJECT-PLAN.md formal con problema/alcance/anti-scope | Documentacion de planificacion dispersa | 1h |
| BAJA | Sin CHANGELOG ni versionamiento semantico | No hay registro de cambios para cliente | 30 min |

## Plan de Regularizacion

| # | Accion | Artefacto resultado | Esfuerzo |
|---|--------|---------------------|----------|
| 1 | Remover credenciales hardcoded de sap.service.ts, usar solo env vars | `sap.service.ts` limpio | 15 min |
| 2 | Remover registro duplicado de helmet en index.ts | `index.ts` limpio | 5 min |
| 3 | Crear PROJECT-PLAN.md con Problema, Alcance, Anti-scope | `PROJECT-PLAN.md` | 1h |
| 4 | Agregar campo `companyCode` a todos los modelos Prisma + migrar + filtrar queries | Schema + 12 route files | 1 dia |
| 5 | Implementar middleware de autorizacion RBAC y aplicar a rutas | `middleware/auth.middleware.ts` + rutas | 1 dia |
| 6 | Crear README.md del proyecto (setup, arquitectura, como correr) | `README.md` personalizado | 30 min |
| 7 | Escribir tests unitarios backend (rutas principales + auth) | `backend/tests/**/*.test.ts` | 2 dias |
| 8 | Crear Dockerfiles (backend + frontend) + docker-compose produccion | `Dockerfile.backend`, `Dockerfile.frontend`, `docker-compose.prod.yml` | 4h |
| 9 | Migrar UI a usar traducciones i18n (reemplazar texto hardcoded con `t()`) | 11 paginas actualizadas | 1-2 dias |
| 10 | Migrar a React Router con rutas URL + proteccion de rutas | `App.tsx` refactorizado + guards | 4h |
| 11 | Completar paginas parciales (Products sync, Orders tracking, Invoices pagos) | 3 paginas actualizadas | 1 dia |
| 12 | Crear GitHub Actions CI/CD basico (lint + test + build) | `.github/workflows/ci.yml` | 2h |

## Hallazgos Adicionales

### Cosas bien hechas (no tocar)
- Schema Prisma robusto con 16 modelos, indices apropiados, relaciones bien definidas
- Servicio SAP con session pooling, auto-retry en 401, multi-empresa
- Backend modular (12 archivos de rutas, cada uno independiente)
- Componentes UI reutilizables (17+): skeletons, empty states, error boundary, loading
- Diseno en Pencil completo (26 pantallas) con variables de diseno consistentes
- Conductor tracks como sistema de seguimiento (6 tracks documentados)
- Validacion con Zod + React Hook Form ya configurada
- Multi-empresa: config de 5 paises con middleware de company selector

### Riesgos detectados
1. **Seguridad**: Credenciales SAP en codigo fuente (`stifmolina2` / `FmDiosMio1` visibles en sap.service.ts)
2. **Integridad**: Docker-compose usa `dev_password_change_in_production` como password de PostgreSQL
3. **Escalabilidad**: App.tsx tiene 249 lineas con logica de navegacion, fetch override global, y estado mezclado
4. **Mantenibilidad**: `backend/src/index.ts` tiene comentarios residuales (`// ... (existing imports)`, `// Moved to routes/`)

## Orden de Ejecucion Recomendado

```
Semana 1: Seguridad + Datos (acciones 1-5)
  - Dia 1: Fixes rapidos (#1, #2) + PROJECT-PLAN.md (#3)
  - Dia 2-3: Aislamiento multi-empresa (#4)
  - Dia 4-5: RBAC (#5)

Semana 2: Testing + Deployment (acciones 6-8)
  - Dia 1: README (#6)
  - Dia 2-4: Tests backend (#7)
  - Dia 5: Dockerfiles + CI (#8, #12)

Semana 3: Frontend polish (acciones 9-11)
  - Dia 1-2: i18n migration (#9)
  - Dia 3: React Router (#10)
  - Dia 4-5: Paginas incompletas (#11)
```

**Tiempo total estimado: ~3 semanas de trabajo (1 desarrollador)**
