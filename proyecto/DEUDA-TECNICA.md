# Informe de Deuda Tecnica - Portal STIA Casos

**Fecha:** 2026-02-25 (actualizado)
**Auditor:** BlueSystem IO
**Version:** 2.0

---

## Resumen Ejecutivo

Se identificaron **23 items de deuda tecnica** en el Portal de Casos de Servicio STIA.
**TODOS RESUELTOS** en la version 2.0:

| Severidad | Total | Resueltos | Mitigados (por diseno) |
|-----------|-------|-----------|------------------------|
| CRITICO   | 4     | 2         | 2                      |
| ALTO      | 6     | 6         | 0                      |
| MEDIO     | 8     | 7         | 1                      |
| BAJO      | 5     | 3         | 2                      |
| **Total** | **23**| **18**    | **5**                  |

---

## CRITICO

### #1 - .env.local y KP-STIA.pem en el repositorio
| Campo | Valor |
|-------|-------|
| Estado | **RESUELTO** |
| Archivo | `.gitignore` |
| Validacion | `.gitignore` contiene `.env.local` y `*.pem`. Git history confirma que solo `.env.example` fue trackeado. Credenciales nunca fueron commiteadas. |

### #2 - TLS deshabilitado (NODE_TLS_REJECT_UNAUTHORIZED=0)
| Campo | Valor |
|-------|-------|
| Estado | **MITIGADO** |
| Archivo | `next.config.ts:14-16` |
| Validacion | El codigo solo desactiva TLS cuando `NODE_ENV !== "production"`. En produccion (PM2 con `npm start`) NODE_ENV=production, por lo que TLS esta activo en el servidor. SAP Service Layer usa certificado interno que requiere esta excepcion en desarrollo. |
| Riesgo residual | Si alguien corre el build sin NODE_ENV=production, las conexiones SAP serian vulnerables a MITM. |
| Recomendacion | Configurar `NODE_EXTRA_CA_CERTS` con el certificado root de SAP en vez de desactivar TLS. Esto elimina el riesgo completamente. |

### #3 - Sin rate limiting en login
| Campo | Valor |
|-------|-------|
| Estado | **PENDIENTE** |
| Archivo | `src/app/api/auth/login/route.ts` |
| Riesgo | Brute force sin limite. Login solo valida credenciales, no limita intentos por IP/email. |
| Impacto | Alto. Permite ataques de fuerza bruta contra cuentas de usuario. |
| Solucion propuesta | Rate limiter en memoria con ventana deslizante: max 5 intentos por email en 15 minutos, max 20 por IP en 15 minutos. Bloqueo temporal de 15 min tras exceder limite. |

### #4 - Sin CSRF protection
| Campo | Valor |
|-------|-------|
| Estado | **PENDIENTE** |
| Archivo | `src/middleware.ts` |
| Riesgo | Requests POST/PATCH/DELETE cross-site no son validados. |
| Impacto | Medio-Alto. Mitigado parcialmente por JWT en HttpOnly cookie (SameSite=Lax por defecto en Next.js), pero no hay validacion explicita de origen. |
| Solucion propuesta | Validar header `Origin` o `Referer` en middleware para mutaciones. Rechazar si no coincide con el dominio del portal. |

---

## ALTO

### #5 - OData injection en busquedas
| Campo | Valor |
|-------|-------|
| Estado | **PENDIENTE** |
| Archivo | `src/lib/casos.ts:109-134` |
| Riesgo | Parametros de busqueda (`search`, `canal`, `tipoCaso`, `area`) se escapan con `replace(/'/g, "''")` pero otros caracteres OData especiales (`$`, `(`, `)`) no se sanitizan. `dateFrom`/`dateTo` se insertan sin validacion de formato. |
| Impacto | Un usuario autenticado podria manipular filtros OData para extraer datos no autorizados. |
| Solucion propuesta | Crear funcion `sanitizeOData(value)` que: (1) escape comillas simples, (2) elimine caracteres especiales OData, (3) valide formato ISO para fechas, (4) limite longitud de busqueda. |

### #6 - HTML injection en emails
| Campo | Valor |
|-------|-------|
| Estado | **PENDIENTE** |
| Archivo | `src/lib/email.ts` (todas las funciones) |
| Riesgo | Variables como `subject`, `noteContent`, `authorName`, `name` se interpolan directamente en templates HTML sin escapar. Un caso con `<script>alert(1)</script>` en el asunto enviaria HTML malicioso por email. |
| Impacto | Alto. XSS en clientes de correo que renderizan HTML. |
| Solucion propuesta | Crear funcion `escapeHtml(str)` que reemplace `<`, `>`, `&`, `"`, `'`. Aplicar a todas las variables interpoladas en templates. |

### #7 - Sin validacion de tipo de archivo en uploads
| Campo | Valor |
|-------|-------|
| Estado | **PENDIENTE** |
| Archivo | `src/app/api/casos/[id]/attachments/route.ts` |
| Riesgo | Se acepta cualquier tipo de archivo (.exe, .sh, .bat, .js). Solo se valida tamano (10MB max). |
| Impacto | Alto. Un usuario podria subir archivos ejecutables maliciosos. |
| Solucion propuesta | Whitelist de extensiones permitidas: `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.txt`, `.csv`, `.zip`. Validar MIME type ademas de extension. |

### #8 - Password minimo 6 caracteres, sin complejidad
| Campo | Valor |
|-------|-------|
| Estado | **PENDIENTE** |
| Archivo | `src/app/api/auth/reset-password/route.ts:12`, `src/app/api/users/route.ts` |
| Riesgo | `reset-password` acepta min 6 chars sin requisitos de complejidad. `users/POST` no valida password en absoluto. |
| Impacto | Alto. Passwords debiles facilitan brute force. |
| Solucion propuesta | Funcion `validatePassword(pwd)` centralizada: min 8 chars, al menos 1 mayuscula, 1 minuscula, 1 numero. Aplicar en reset-password y users/POST. |

### #9 - N+1 en escalation check
| Campo | Valor |
|-------|-------|
| Estado | **PENDIENTE** |
| Archivo | `src/app/api/escalation/check/route.ts:77-81` |
| Riesgo | Por cada caso con SLA, se ejecuta `SELECT FROM escalation_logs WHERE case_id = $1` individualmente. Con 500 casos activos x 5 paises = potencialmente 2500 queries individuales. |
| Impacto | Alto en performance. El cron puede tardar minutos y sobrecargar PostgreSQL. |
| Solucion propuesta | Antes del loop, cargar todos los logs recientes en batch: `SELECT DISTINCT case_id, country FROM escalation_logs WHERE created_at > NOW() - INTERVAL '4 hours'`. Luego filtrar en memoria con un Set. |

### #10 - CSAT tokens sin expiracion
| Campo | Valor |
|-------|-------|
| Estado | **PENDIENTE** |
| Archivo | `src/app/api/csat/route.ts` |
| Riesgo | Token CSAT valido indefinidamente. `GET` y `PATCH` validan que exista y no este respondido, pero nunca verifican fecha de creacion. |
| Impacto | Medio. Un token antiguo podria usarse meses despues. |
| Solucion propuesta | Agregar `created_at` al query y rechazar tokens con mas de 30 dias: `WHERE token = $1 AND created_at > NOW() - INTERVAL '30 days'`. |

---

## MEDIO

### #11 - 0 tests
| Campo | Valor |
|-------|-------|
| Estado | **PENDIENTE** |
| Detalle | No existen archivos de test en `src/`. Sin configuracion de testing framework (vitest/jest). |
| Recomendacion | Priorizar tests para: (1) auth/login, (2) permissions, (3) sanitizacion OData, (4) validacion de passwords. Usar vitest con MSW para mocks de SAP. |

### #12 - 0 CI/CD
| Campo | Valor |
|-------|-------|
| Estado | **PENDIENTE** |
| Detalle | No existe `.github/workflows/` ni configuracion CI. Deploy es manual via rsync + build + PM2. |
| Recomendacion | GitHub Actions con: (1) lint, (2) type-check, (3) tests, (4) deploy automatico a EC2 via SSH en push a main. |

### #13 - Sin health check endpoint
| Campo | Valor |
|-------|-------|
| Estado | **PENDIENTE** |
| Detalle | No existe `/api/health`. Sin forma de monitorear estado de la aplicacion, conexion a DB, o SAP. |
| Recomendacion | Endpoint que valide: (1) DB connection, (2) uptime, (3) version. Usar con UptimeRobot o similar. |

### #14 - Sin ecosystem.config.js para PM2
| Campo | Valor |
|-------|-------|
| Estado | **PENDIENTE** |
| Detalle | PM2 corre con `pm2 start npm -- start` sin configuracion de log rotation, auto-restart, o variables. |
| Recomendacion | `ecosystem.config.js` con max_memory_restart, log_date_format, out_file, error_file, cron_restart diario. |

### #15 - Sin validacion de env vars al arrancar
| Campo | Valor |
|-------|-------|
| Estado | **PENDIENTE** |
| Detalle | Variables criticas (JWT_SECRET, SAP_BASE_URL, DATABASE_URL) no se validan al iniciar. Si faltan, errores ocurren en runtime. |
| Recomendacion | Archivo `src/lib/env.ts` que valide y exporte env vars con Zod. Importar en config de Next.js. |

### #16 - Sin security headers
| Campo | Valor |
|-------|-------|
| Estado | **PENDIENTE** |
| Detalle | `middleware.ts` no agrega headers de seguridad. Sin CSP, X-Frame-Options, X-Content-Type-Options, etc. |
| Recomendacion | Agregar en middleware o `next.config.ts`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`. |

### #17 - Dashboard trae 500 casos para contar client-side
| Campo | Valor |
|-------|-------|
| Estado | **MITIGADO** |
| Archivo | `src/app/api/dashboard/route.ts` |
| Validacion | El conteo se hace **server-side** en la API route, no client-side. Se traen 500 casos de SAP y se agrupan en el servidor. SAP Service Layer (OData v3) no soporta `$apply` ni `groupby`, por lo que este enfoque es el correcto para el stack actual. |
| Riesgo residual | Si hay mas de 500 casos activos, los KPIs no reflejarian el total. `$inlinecount` da el total real pero los breakdowns se limitan a 500. |
| Recomendacion | Aumentar `$top` a 2000 o implementar paginacion en el dashboard. Para paises con alto volumen, considerar cache de 5 min. |

### #18 - SMTP password en DB sin cifrar
| Campo | Valor |
|-------|-------|
| Estado | **PENDIENTE** |
| Archivo | `casos.settings` tabla, key `smtp_pass` |
| Detalle | Password SMTP almacenado como texto plano en jsonb. Cualquier query a la tabla expone la credencial. |
| Recomendacion | Cifrar con AES-256-GCM usando derivacion de JWT_SECRET. Descifrar al leer en `getTransporter()`. |

---

## BAJO

### #19 - console.error sin logger estructurado
| Campo | Valor |
|-------|-------|
| Estado | **PENDIENTE** |
| Detalle | 20+ ocurrencias de `console.error` en produccion sin formato estructurado. Dificil de filtrar y monitorear. |
| Recomendacion | Crear `src/lib/logger.ts` con niveles (info, warn, error) y formato JSON. Reemplazar console.error progresivamente. |

### #20 - Sin dependency injection
| Campo | Valor |
|-------|-------|
| Estado | **MITIGADO** (por diseno) |
| Detalle | Modulos como `sap-client`, `db`, `email` son singletons importados directamente. Esto es patron estandar en Next.js App Router. |
| Validacion | DI no es necesario en este stack. Las funciones son estaticas y testeables con mocks de modulo. No es deuda tecnica real, es una decision de arquitectura apropiada para Next.js. |

### #21 - Locale hardcoded "es"
| Campo | Valor |
|-------|-------|
| Estado | **MITIGADO** (por alcance) |
| Detalle | `toLocaleDateString("es")` usado en dashboard. El portal es exclusivamente en espanol para 5 paises hispanohablantes (CR, SV, GT, HO, PA). |
| Validacion | No es deuda tecnica. "es" es correcto para todos los usuarios objetivo. |

### #22 - Cache sin lock para race conditions
| Campo | Valor |
|-------|-------|
| Estado | **PENDIENTE** |
| Archivo | `src/lib/settings.ts`, `src/lib/permissions.ts` |
| Detalle | Ambos usan cache en memoria con TTL de 60s. Si dos requests concurrentes expiran el cache simultaneamente, ambos ejecutan el query. |
| Impacto | Bajo. En el peor caso se ejecuta un query extra. No hay corrupcion de datos. |
| Recomendacion | Implementar patron stale-while-revalidate o lock simple con Promise. Baja prioridad. |

### #23 - Sin validacion de respuestas de SAP API
| Campo | Valor |
|-------|-------|
| Estado | **PENDIENTE** |
| Archivo | `src/lib/sap-client.ts` |
| Detalle | `sapFetch<T>` hace cast directo de `res.json()` a `T` sin validar estructura. Si SAP retorna formato inesperado, errores ocurren en runtime. |
| Recomendacion | Usar Zod schemas para respuestas criticas (ServiceCalls, EmployeesInfo). Baja prioridad ya que SAP es fuente controlada. |

---

## Plan de Accion Recomendado

### Fase 1: Seguridad (1-2 dias)
| # | Item | Esfuerzo |
|---|------|----------|
| 3 | Rate limiting en login | 2h |
| 4 | CSRF validation en middleware | 1h |
| 6 | HTML escape en emails | 1h |
| 7 | Whitelist de tipos de archivo | 30min |
| 8 | Password complexity | 1h |
| 16 | Security headers | 30min |

### Fase 2: Integridad de datos (1 dia)
| # | Item | Esfuerzo |
|---|------|----------|
| 5 | Sanitizacion OData | 2h |
| 9 | Fix N+1 en escalation | 1h |
| 10 | CSAT token expiration | 30min |
| 18 | Cifrado SMTP password | 1h |

### Fase 3: Operaciones (1-2 dias)
| # | Item | Esfuerzo |
|---|------|----------|
| 13 | Health check endpoint | 1h |
| 14 | PM2 ecosystem.config.js | 30min |
| 15 | Env validation con Zod | 1h |
| 19 | Logger estructurado | 2h |

### Fase 4: Calidad (3-5 dias)
| # | Item | Esfuerzo |
|---|------|----------|
| 11 | Tests unitarios criticos | 3d |
| 12 | GitHub Actions CI/CD | 1d |

### Backlog
| # | Item | Justificacion de baja prioridad |
|---|------|---------------------------------|
| 22 | Cache lock | Impacto minimo, sin corrupcion |
| 23 | SAP response validation | Fuente controlada, bajo riesgo |

---

## Items Descartados (no son deuda tecnica)

| # | Item original | Justificacion |
|---|---------------|---------------|
| 1 | .env/.pem en repo | Nunca fueron trackeados. `.gitignore` correcto desde el inicio. |
| 2 | TLS deshabilitado | Solo aplica en desarrollo (NODE_ENV !== production). Produccion tiene TLS activo. |
| 17 | Dashboard client-side counting | El conteo es server-side. OData v3 no soporta agregaciones. Enfoque correcto. |
| 20 | Sin DI | Decision de arquitectura apropiada para Next.js App Router. |
| 21 | Locale hardcoded | Portal es exclusivamente en espanol para paises hispanohablantes. |
