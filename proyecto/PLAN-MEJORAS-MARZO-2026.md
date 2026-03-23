# PLAN-MEJORAS-MARZO-2026.md
# Herramienta Casos de Servicio — Mejoras Marzo 2026

**Fuente:** "Cambios y mejoras herramienta casos marzo 2026.pdf"
**Fecha plan:** 2026-03-16
**Stack:** Next.js 15 + SAP Service Layer + PostgreSQL (`casos` schema)

---

## Resumen de Sprints

| Sprint | Nombre | Días | Entregable |
|--------|--------|------|-----------|
| S1 | Buscar Contacto | 2.5 | Buscador SAP + modo manual en Nuevo Caso |
| S2 | Tipo Retroalimentación Positiva | 0.5 | Nuevo tipo, campos deshabilitados |
| S3 | Renombrar + Nuevos Estados | 1 | "Colaborador asignado" + 2 estados nuevos |
| S4 | Extensión Tiempo Resolución | 2 | Botón extender + modal + audit log |
| S5 | Alertas Vencimiento | 1.5 | Alertas 12h + vencido + Alta→jefatura |
| S6 | Inconformidad Material Empaque | 5 | Form condicional + UDFs SAP + sección Calidad |
| S7 | Ampliar Módulo Conocimiento | 2 | Categorías + editor + búsqueda mejorada |
| **TOTAL** | | **~14.5 días** | |

> **WhatsApp:** Requiere análisis de costo (Twilio/Meta API) — fuera de scope por ahora.
> **Móvil:** Ya es responsive con Tailwind — solo QA.

---

## SPRINT 1 — Buscar Contacto en Nuevo Caso

**Objetivo:** Agregar buscador "Buscar contacto" vinculado a SAP. Si no existe, permitir llenado manual.

### Problema
El formulario de Nuevo Caso solo permite buscar el cliente (BP). El contacto se llena manualmente con teléfono y email. No hay buscador de personas de contacto del BP seleccionado.

### Alcance
- `src/app/api/bp/[code]/contacts/route.ts` — endpoint nuevo
- `src/app/(portal)/casos/nuevo/page.tsx` — agregar sección Buscar Contacto
- `src/lib/types.ts` — agregar campos `contactName`, `contactCargo`
- SAP: verificar si `U_ContactName` y `U_ContactCargo` UDFs existen

### Anti-scope
- NO modificar la búsqueda de cliente (BP)
- NO cambiar el proceso de creación del caso en SAP
- NO afectar casos existentes

### Pasos

- [ ] **1.1** Crear endpoint `GET /api/bp/[code]/contacts`
  - Query SAP: `BusinessPartners('CODE')/ContactEmployees`
  - Retorna: `[{ code, name, phone, email, position }]`
  - Manejo de error si BP no tiene contactos

- [ ] **1.2** Agregar estado al formulario Nuevo Caso
  - `contactSearch`, `contactResults`, `contactLoading`, `showContactDropdown`
  - `contactName`, `contactCargo` (campos manuales nuevos)
  - `contactRef` (código SAP del contacto, si fue seleccionado)

- [ ] **1.3** UI: Sección CONTACTO actualizada
  - Buscar Contacto: aparece SOLO cuando hay cliente seleccionado
  - Dropdown de resultados igual al de BP
  - Al seleccionar: auto-llenar nombre, teléfono, email, cargo
  - Si escribe texto libre sin seleccionar → modo manual (permitido)
  - Campos: Nombre, Teléfono, Email, Cargo

- [ ] **1.4** Actualizar payload de creación
  - Agregar `contactName` y `contactCargo` al `CreateCasoPayload`
  - Mapear a UDFs SAP `U_ContactName` / `U_ContactCargo` (verificar si existen)
  - Si no existen: crear script SQL para agregarlos o usar campos existentes

- [ ] **1.5** Actualizar `CasoDetail` type y vista detalle del caso
  - Mostrar nombre y cargo del contacto en la ficha del caso

### Verificación
```
- GET /api/bp/C00001/contacts → 200 OK, lista de contactos
- Formulario: seleccionar cliente → aparece buscador de contacto
- Seleccionar contacto → auto-llena campos
- Sin seleccionar → campos editables manualmente
- Crear caso → U_ContactName guardado en SAP
```

---

## SPRINT 2 — Tipo: Retroalimentación Positiva

**Objetivo:** Nuevo tipo de caso que funciona solo como notificación (sin prioridad ni tiempo estimado).

### Alcance
- `src/app/(portal)/casos/nuevo/page.tsx` — lógica condicional
- `src/app/(portal)/casos/[id]/page.tsx` — badge especial
- `src/app/api/settings/route.ts` o tabla `casos.settings` — agregar valor al dropdown

### Anti-scope
- NO afectar otros tipos de caso
- NO crear tabla nueva en BD
- NO cambiar flujo de notificaciones existente

### Pasos

- [ ] **2.1** Agregar "Retroalimentación positiva" a la lista de `tipo_caso` en configuración
  - Via `configuracion/page.tsx` (admin) o directo en DB `casos.settings`

- [ ] **2.2** Lógica condicional en Nuevo Caso
  - Cuando `tipoCaso === "Retroalimentación positiva"`:
    - Deshabilitar select de Prioridad (mostrar valor fijo "Normal")
    - Deshabilitar select de Tiempo Estimado (ocultar o mostrar "N/A")
    - Cambiar validación: no requerir prioridad ni tiempo
  - Al cambiar de tipo: restaurar campos

- [ ] **2.3** Badge visual diferente en lista y detalle de casos
  - Color distinto (verde/teal) para identificarlo visualmente

### Verificación
```
- Dropdown Tipo Caso incluye "Retroalimentación positiva"
- Al seleccionarlo: Prioridad y Tiempo deshabilitados
- Al cambiar a otro tipo: Prioridad y Tiempo se reactivan
- Caso creado: sin prioridad requerida
```

---

## SPRINT 3 — Renombrar + Nuevos Estados

**Objetivo:** Renombrar "Técnico asignado" → "Colaborador asignado". Agregar 2 nuevos estados de caso.

### Alcance — Renombrar
- `src/app/(portal)/casos/nuevo/page.tsx`
- `src/app/(portal)/casos/[id]/page.tsx`
- `src/app/(portal)/casos/page.tsx`
- `src/components/status-badge.tsx`
- Cualquier string literal "Técnico" o "técnico" en la UI

### Alcance — Nuevos estados
- `src/lib/constants.ts` — STATUS_LABELS
- `src/components/status-badge.tsx` — nuevos colores
- `src/app/(portal)/casos/[id]/page.tsx` — selector de estado
- `src/app/api/casos/[id]/route.ts` — PATCH acepta nuevos valores
- SAP: definir cómo representar los nuevos estados

### Anti-scope
- NO cambiar nombre en base de datos (solo UI)
- NO afectar auth o permisos

### Pasos

- [ ] **3.1** Renombrar en UI (find/replace controlado)
  - "Técnico Asignado" → "Colaborador Asignado"
  - "Buscar empleado" → "Buscar colaborador"
  - "Nombre del técnico..." → "Nombre del colaborador..."
  - "Técnico seleccionado" → "Colaborador seleccionado"

- [ ] **3.2** Nuevos estados — análisis SAP
  - SAP ServiceCalls usa: -3 (Abierto), -2 (En Proceso), -1 (Cerrado)
  - Los nuevos estados "Pendiente de proveedor" y "Pendiente de otra área" NO son valores SAP nativos
  - **Decisión:** Mapear como UDF `U_SubEstado` (texto) + mantener Status SAP en -2 (En Proceso)
  - Alternativa: usar `pause_on_status` del sistema de escalation existente

- [ ] **3.3** Implementar UDF `U_SubEstado`
  - Valores: NULL | "Pendiente de proveedor" | "Pendiente de otra área"
  - Script SQL/SAP para crear UDF si no existe

- [ ] **3.4** UI: Actualizar selector de estado en detalle del caso
  - Mostrar subestado cuando aplica
  - En lista de casos: mostrar badge combinado

- [ ] **3.5** API: Actualizar PATCH `/api/casos/[id]`
  - Aceptar campo `subEstado` y escribir `U_SubEstado`

### Verificación
```
- Búsqueda: "técnico" en UI → 0 resultados
- Detalle caso: selector muestra "Pendiente de proveedor" y "Pendiente de otra área"
- Al seleccionar: SAP guarda U_SubEstado, Status = -2
- Badge en lista muestra subestado
```

---

## SPRINT 4 — Extensión Tiempo de Resolución

**Objetivo:** El gestor de servicio al cliente puede ampliar el tiempo estimado de resolución con justificación documentada.

### Alcance
- `src/app/(portal)/casos/[id]/page.tsx` — botón "Extender plazo"
- `src/app/api/casos/[id]/route.ts` — PATCH con log
- Nueva tabla o campo en PostgreSQL para log de extensiones
- `src/lib/tipos.ts` — tipo `ExtensionLog`

### Anti-scope
- NO permitir extensión a agentes normales (solo supervisores/gestores)
- NO cambiar el tiempo automáticamente
- NO afectar SLA histórico ya registrado

### Pasos

- [ ] **4.1** Migración DB: tabla `casos.extension_logs`
  ```sql
  CREATE TABLE IF NOT EXISTS casos.extension_logs (
    id            SERIAL PRIMARY KEY,
    case_id       INTEGER NOT NULL,
    prev_tiempo   VARCHAR(50),
    new_tiempo    VARCHAR(50) NOT NULL,
    justification TEXT NOT NULL,
    extended_by   INTEGER NOT NULL, -- user_id
    extended_at   TIMESTAMPTZ DEFAULT NOW()
  );
  ```

- [ ] **4.2** API: `POST /api/casos/[id]/extend`
  - Body: `{ newTiempo: string, justification: string }`
  - Verificar rol (solo supervisor/admin/gestor)
  - PATCH SAP: actualizar `U_TiempoEst`
  - INSERT en `casos.extension_logs`
  - Crear nota interna automática con la justificación

- [ ] **4.3** UI: Botón "Extender plazo" en detalle del caso
  - Visible solo para roles con permiso
  - Abre modal con:
    - Tiempo actual (readonly)
    - Selector nuevo tiempo estimado
    - Textarea justificación (obligatorio, mínimo 20 chars)
    - Botón confirmar
  - Feedback: nota interna creada automáticamente

- [ ] **4.4** Mostrar historial de extensiones en timeline del caso
  - Nueva entrada en timeline: "Plazo extendido por [usuario]"
  - Expandir para ver justificación

### Verificación
```
- Rol agente: NO ve botón "Extender plazo"
- Rol supervisor: SÍ ve botón
- Justificación vacía: no permite enviar
- Al confirmar: U_TiempoEst actualizado en SAP
- Timeline muestra entrada de extensión
- DB: registro en extension_logs
```

---

## SPRINT 5 — Alertas de Vencimiento

**Objetivo:** Notificaciones automáticas antes y después del vencimiento del plazo.

### Contexto del sistema actual
- Ya existe `casos.escalation_policies`, `casos.escalation_levels`, `casos.notifications`
- El sistema de escalation ya monitorea vencimientos
- Se amplía con los nuevos triggers

### Alcance
- `src/app/api/alertas/route.ts` — agregar lógica 12h
- `migration-alertas-v2.sql` — nueva migración
- `src/app/(portal)/alertas/page.tsx` — mostrar nuevas alertas
- `src/lib/notificaciones.ts` (nuevo) — helper de envío

### Anti-scope
- NO implementar email/push en este sprint (solo in-app)
- NO tocar escalation_policies existentes
- NO WhatsApp (sprint separado y pendiente de aprobación)

### Pasos

- [ ] **5.1** Revisar jobs de escalation actuales
  - Entender cómo corren: ¿cron interno? ¿endpoint que se llama externamente?
  - Identificar dónde agregar los nuevos checks

- [ ] **5.2** Alerta 12h antes del vencimiento
  - Check: `NOW() >= (fecha_creacion + tiempo_estimado) - INTERVAL '12 hours'`
  - Y: `status != -1` (no cerrado) Y: no existe alerta previa para este caso
  - Destino: usuario `technicianCode` del caso
  - Tipo notificación: `"pre_deadline_12h"`

- [ ] **5.3** Alerta al vencer
  - Check: `NOW() >= (fecha_creacion + tiempo_estimado)`
  - Y: `status != -1` Y: sin extensión en las últimas 24h
  - Destino: gestor de servicio al cliente (role-based)
  - Tipo notificación: `"overdue"`

- [ ] **5.4** Alerta prioridad Alta → jefatura
  - Condición adicional: `priority = 'Alta'`
  - Notificar también a usuarios con rol `jefatura` / `supervisor`
  - Tipo notificación: `"overdue_high_priority"`

- [ ] **5.5** UI: Diferenciación visual en página Alertas
  - Badge color por tipo: pre_deadline (amarillo), overdue (rojo), overdue_high (rojo pulsante)
  - Texto descriptivo del tipo de alerta

### Verificación
```
- Caso a 11h de vencer: aparece alerta pre_deadline al responsable
- Caso vencido: aparece alerta overdue al gestor SAC
- Caso vencido + Alta prioridad: alerta llega también a supervisor/jefatura
- Caso cerrado: no genera alertas
- Caso con extensión reciente: no genera overdue inmediato
```

---

## SPRINT 6 — Tipo: Inconformidad de Material de Empaque

**Objetivo:** Nuevo tipo de caso con formulario extendido (F069) para reclamos de material de empaque.

> ⚠️ **Este es el sprint más complejo.** Requiere crear UDFs nuevos en SAP Business One (5 bases de datos).

### Alcance
- SAP: 8–10 nuevos UDFs en ServiceCalls
- `src/app/(portal)/casos/nuevo/page.tsx` — sección condicional
- `src/app/(portal)/casos/[id]/page.tsx` — sección condicional + sección Calidad
- `src/app/api/casos/route.ts` y `[id]/route.ts` — nuevos campos
- `src/lib/types.ts` — tipos extendidos

### Anti-scope
- NO modificar el PDF F069 físico
- NO integrar con sistema SGI externo (solo generar consecutivo)
- NO mostrar sección Calidad a agentes normales

### UDFs SAP a crear (en las 5 DBs)

| UDF | Tipo | Llena | Descripción |
|-----|------|-------|-------------|
| U_IME_Producto | Text | Vendedor/Cliente | Nombre del producto |
| U_IME_CodMaterial | Text | Vendedor/Cliente | Código Stia del material |
| U_IME_Lote | Text | Vendedor/Cliente | Lote / Orden de producción |
| U_IME_Factura | Text | Vendedor/Cliente | Número de factura |
| U_IME_CantInicial | Numeric | Vendedor/Cliente | Cantidad inicial |
| U_IME_CantReclamo | Numeric | Vendedor/Cliente | Cantidad en reclamo |
| U_IME_ReportadoPor | Text | Vendedor/Cliente | Nombre quien reporta |
| U_IME_CnsecSGI | Text | Calidad | Consecutivo SGI (auto) |
| U_IME_CausaReclamo | Memo | Calidad | Causa del reclamo |
| U_IME_PlanAccion | Memo | Calidad | Corrección inmediata + fecha |
| U_IME_AccionCorrectiva | Memo | Calidad | Acción correctiva + fecha |
| U_IME_GestionadoPor | Text | Calidad | Gestionado por (SGI) |
| U_IME_VerificadoPor | Text | Calidad | Verificado por (SGI) |
| U_IME_FechaVerif | Date | Calidad | Fecha verificación |
| U_IME_Retroalim | Text | Calidad | "Sí / No + fecha" |
| U_IME_VentasResp | Text | Calidad | Persona ventas responsable |

### Pasos

- [ ] **6.1** Script SQL/SAP para crear UDFs en las 5 DBs
  - Documentar en `scripts/udfs-ime-empaque.sql`
  - Ejecutar en staging primero, validar, luego producción

- [ ] **6.2** Agregar "Inconformidad de material de empaque" al dropdown tipo_caso

- [ ] **6.3** Formulario Nuevo Caso — sección condicional IME
  - Aparece solo cuando `tipoCaso === "Inconformidad de material de empaque"`
  - Campos: Producto, Código Material, Lote, Factura, Cantidad inicial, Cantidad en reclamo, Reportado por
  - Todos los campos IME son opcionales para no romper el flujo general

- [ ] **6.4** Actualizar payload de creación
  - Agregar campos `U_IME_*` al body del POST a SAP

- [ ] **6.5** Vista Detalle del caso — sección IME
  - Mostrar sección "Detalle del Reclamo" cuando tipo = IME
  - Mostrar campos llenados por vendedor/cliente (readonly para todos)

- [ ] **6.6** Sección "Uso Administrativo — Calidad" en detalle
  - **Solo visible para rol Calidad/Admin**
  - Campos editables: Causa del reclamo, Plan de Acción, Acción Correctiva, Investigación y Corrección ejecutada
  - Botón "Guardar sección Calidad" → PATCH solo los campos U_IME_Calidad_*
  - Campo Consecutivo SGI: auto-generado al guardar (formato: SGI-YYYY-NNNN)

- [ ] **6.7** Consecutivo SGI
  - Generado al guardar la sección Calidad por primera vez
  - Formato: `SGI-{AÑO}-{número secuencial 4 dígitos}`
  - Secuencia guardada en `casos.settings` o tabla propia

### Verificación
```
- Tipo IME seleccionado: aparece sección de reclamo
- Tipo diferente: sección IME oculta
- Rol agente: ve campos vendedor, NO ve sección Calidad
- Rol Calidad/Admin: ve ambas secciones
- Guardar Calidad: genera U_IME_CnsecSGI con formato correcto
- Campos guardados en SAP UDFs correctamente
```

---

## SPRINT 7 — Ampliar Módulo Conocimiento

**Objetivo:** Expandir la base de conocimiento para que sea más útil y navegable.

> ⚠️ **Requiere confirmación del usuario sobre el alcance exacto.**
> Propuesta basada en lo observado en `src/app/(portal)/conocimiento/page.tsx`.

### Alcance propuesto
- `src/app/(portal)/conocimiento/page.tsx`
- `src/app/api/kb/route.ts` y `src/app/api/kb/[id]/route.ts`
- Tabla `casos.kb_articles` (revisar estructura actual)

### Pasos propuestos

- [ ] **7.1** Revisar estado actual del módulo
  - Leer `conocimiento/page.tsx` y `api/kb/` para entender qué existe

- [ ] **7.2** Agregar categorías a artículos KB
  - Campo `category` en artículos
  - Filtro por categoría en la lista

- [ ] **7.3** Mejorar búsqueda
  - Búsqueda full-text en título Y contenido
  - Resaltar término buscado en resultados

- [ ] **7.4** Editor de artículos mejorado
  - Soporte markdown básico (bold, italic, listas, código)
  - Preview antes de guardar

- [ ] **7.5** Vincular artículos a tipos de caso
  - Al crear caso de tipo X → sugerir artículos relacionados
  - Ya existe lógica de sugerencias en `nuevo/page.tsx`

### Verificación
```
- Filtro por categoría funciona
- Búsqueda encuentra artículos por contenido
- Editor preview funciona
- Artículos sugeridos aparecen al crear caso de tipo relacionado
```

---

## Dependencias y Orden de Ejecución

```
S2 (Retroalimentación) ─────────────────────────────────┐
S3 (Renombrar + Estados) ───────────────────────────────┤
S1 (Buscar Contacto) ──────────────────────────────────┤
S4 (Extensión Tiempo) ────────────────────────────────┤
S5 (Alertas) ──────────────────────────────────────────┤──▶ Deploy staging ──▶ QA ──▶ Producción
S6 (Empaque) ─── requiere UDFs SAP primero ────────────┤
S7 (Conocimiento) ─────────────────────────────────────┘
```

**Sprints paralelos posibles:**
- S2 + S3 se pueden hacer el mismo día (ambos son pequeños)
- S1 y S4 son independientes
- S6 bloquea en SAP admin hasta que se creen los UDFs

---

## Checklist de Deploy

- [ ] Probar cada sprint en staging (`pr.bluesystem.io`) antes de producción
- [ ] UDFs de S6 crear en staging primero, validar, luego las 5 DBs productivas
- [ ] `npm run build` sin errores antes de deploy
- [ ] PM2 restart con `--update-env` si hay cambios de `.env`
- [ ] Verificar logs: `/home/ubuntu/.pm2/logs/casos-stia-error.log`

---

## Estado de Sprints

| Sprint | Estado | Fecha inicio | Fecha fin |
|--------|--------|-------------|-----------|
| S1 | ⬜ Pendiente | — | — |
| S2 | ⬜ Pendiente | — | — |
| S3 | ⬜ Pendiente | — | — |
| S4 | ⬜ Pendiente | — | — |
| S5 | ⬜ Pendiente | — | — |
| S6 | ⬜ Pendiente (bloqueado UDFs SAP) | — | — |
| S7 | ⬜ Pendiente (requiere confirmación alcance) | — | — |
