# Análisis Técnico — Herramienta de Casos STIA
**Preparado por:** BlueSystem · bluesystem.io
**Fecha:** 17 de marzo de 2026
**Versión:** 1.0
**Estado:** Pendiente de validación con cliente

---

## 1. Resumen Ejecutivo

Se realizó una revisión técnica y visual de la herramienta de casos en producción (`casos.stia.net`) comparada con las mejoras solicitadas en el documento de requerimientos de marzo 2026. Se identificaron **5 sprints que requieren desarrollo nuevo**, **2 módulos ya implementados** que podrían cubrir parte de lo solicitado, y **1 bug crítico de autenticación** que fue corregido durante este análisis.

---

## 2. Hallazgos por Sprint

### S1 — Buscar Contacto en Nuevo Caso
**Estado:** ⚠️ Parcialmente implementado

| Aspecto | Estado actual | Solicitado |
|---------|--------------|------------|
| Campo Nombre del contacto | ❌ No existe | ✅ Requerido |
| Campo Cargo del contacto | ❌ No existe | ✅ Requerido |
| Buscador SAP de contactos | ❌ No existe | ✅ Requerido |
| Auto-llenado desde SAP | ❌ No existe | ✅ Requerido |
| Campo Teléfono | ✅ Existe | ✅ Mantener |
| Campo Email | ✅ Existe | ✅ Mantener |
| Modo manual si no existe en SAP | ❌ No existe | ✅ Requerido |

**Impacto en producción si no se implementa:** Los agentes no pueden registrar quién específicamente reportó el caso dentro de la empresa cliente. Dificulta el seguimiento y la comunicación.

---

### S2 — Tipo: Retroalimentación Positiva
**Estado:** ❌ No implementado

| Aspecto | Estado actual | Solicitado |
|---------|--------------|------------|
| Tipo "Retroalimentación positiva" | ❌ No existe en dropdown | ✅ Requerido |
| Deshabilitar Prioridad al seleccionarlo | ❌ No hay lógica condicional | ✅ Requerido |
| Deshabilitar Tiempo Estimado | ❌ No hay lógica condicional | ✅ Requerido |
| Badge visual diferenciado | ❌ No existe | ✅ Requerido |

**Tipos actuales en sistema:** Vendedor no responde, Pedido retrasado, Servicio Técnico, Error en despacho, Facturación/Cobros, Garantía, Servicio al cliente, Otro.

**Impacto si no se implementa:** Las felicitaciones y retroalimentaciones positivas se mezclan con reclamos reales, distorsionando métricas de SLA y reportes de gestión.

---

### S3 — Renombrar "Técnico Asignado" + Nuevos Estados
**Estado:** ❌ No implementado

| Aspecto | Estado actual | Solicitado |
|---------|--------------|------------|
| Etiqueta del campo | "Técnico Asignado" | "Colaborador Asignado" |
| Texto del buscador | "Nombre del técnico..." | "Nombre del colaborador..." |
| Estado "Pendiente de proveedor" | ❌ No existe | ✅ Requerido |
| Estado "Pendiente de otra área" | ❌ No existe | ✅ Requerido |
| Pausa de SLA con estos estados | ❌ No hay lógica | ✅ Requerido |

**Estados actuales:** Abierto (-3) · En Proceso (-2) · Resuelto (-1).

**Nota técnica:** Los nuevos estados no son valores nativos de SAP — se implementarán como UDF `U_SubEstado`. El campo en BD no cambia de nombre, solo la UI.

---

### S4 — Extensión del Tiempo de Resolución
**Estado:** ❌ No implementado

| Aspecto | Estado actual | Solicitado |
|---------|--------------|------------|
| Botón "Extender plazo" | ❌ No existe | ✅ Requerido |
| Control por rol (solo supervisores) | ❌ No existe | ✅ Requerido |
| Modal con justificación obligatoria | ❌ No existe | ✅ Requerido |
| Log de auditoría de extensiones | ❌ No existe | ✅ Requerido |
| Nota interna automática al extender | ❌ No existe | ✅ Requerido |
| Historial de extensiones en timeline | ❌ No existe | ✅ Requerido |

**Requiere:** Nueva tabla `casos.extension_logs` en PostgreSQL + nuevo endpoint `POST /api/casos/[id]/extend`.

---

### S5 — Alertas de Vencimiento
**Estado:** ✅ Módulo SLA ya existe — requiere validación con cliente

**Lo que YA tiene el sistema:**
- Página "SLA & Alertas" funcionando en producción
- Indicadores: Total Abiertos, Excedidos, En Riesgo, En Tiempo
- Tarjetas por caso con: nivel de escalación (L1/L2/L3), estado, prioridad, barra de progreso visual
- Tiempo excedido calculado automáticamente
- Filtros por nivel y estado

**Lo que podría faltar (pendiente confirmar con cliente):**
- Notificación específica 12h **antes** del vencimiento
- Notificación diferenciada cuando prioridad es Alta → escalar a Jefatura
- Envío de alerta por correo (actualmente es solo in-app)

---

### S6 — Inconformidad de Material de Empaque (F069)
**Estado:** ❌ No implementado — Sprint más complejo

| Aspecto | Estado actual | Solicitado |
|---------|--------------|------------|
| Tipo "Inconformidad de material de empaque" | ❌ No existe | ✅ Requerido |
| Formulario F069 extendido | ❌ No existe | ✅ Requerido |
| 16 UDFs en 5 bases de datos SAP | ❌ No existen | ✅ Pre-requisito |
| Sección exclusiva para rol Calidad | ❌ No existe | ✅ Requerido |
| Consecutivo SGI automático | ❌ No existe | ✅ Requerido |

**Bloqueante crítico:** Este sprint NO puede iniciarse hasta que el administrador SAP cree los 16 UDFs en las 5 bases de producción (CR, SV, GT, HN, PA). Se recomienda crear primero en ambiente de staging/prueba.

**UDFs requeridos:** Ver sección 4 de este documento.

---

### S7 — Ampliar Módulo Conocimiento
**Estado:** ✅ Módulo base ya existe — requiere validación con cliente

**Lo que YA tiene el sistema:**
- Página "Base de Conocimiento" en producción
- Búsqueda full-text (PostgreSQL `to_tsvector`)
- Categorías: Soporte Técnico, Garantía, Facturación, Instalación, General
- CRUD completo de artículos (crear, editar, eliminar)
- Tags por artículo, estado Draft/Publicado
- Contador de vistas

**Observación:** El módulo está vacío en producción (0 artículos). El cliente aún no lo ha utilizado.

**Lo que podría faltar (pendiente confirmar con cliente):**
- Editor de markdown con preview
- Artículos sugeridos al crear un caso según tipo
- Vincular artículos a tipos de caso específicos

---

## 3. Bug Corregido Durante el Análisis

### Bug #001 — Login falla con usuarios Azure AD (Error 500)
**Severidad:** 🔴 Crítico
**Archivo afectado:** `src/lib/auth.ts`
**Estado:** ✅ Corregido y desplegado en producción el 17/03/2026

**Causa:** Los usuarios con `use_ad = true` tienen `password_hash = NULL` en la base de datos. La función `bcrypt.compare(password, null)` lanzaba la excepción `Illegal arguments: string, object`, causando un error 500 en lugar de un mensaje controlado.

**Fix aplicado:**
```typescript
// Antes de llamar bcrypt.compare, validar que exista hash
if (!user.password_hash) {
  return {
    success: false,
    error: "Este usuario utiliza inicio de sesión con Microsoft. Use el botón 'Continuar con Microsoft'."
  };
}
```

**Usuarios afectados:** Todos los que tienen `use_ad = true` (incluye `fmolinam@stia.net` y otros usuarios con Azure AD).

---

## 4. UDFs SAP Requeridos para S6

> Estos UDFs deben crearse manualmente por el administrador SAP en las 5 bases de datos antes de iniciar el desarrollo de S6.

| UDF | Tipo | Responsable | Descripción |
|-----|------|-------------|-------------|
| `U_IME_Producto` | Text | Vendedor/Cliente | Nombre del producto reclamado |
| `U_IME_CodMaterial` | Text | Vendedor/Cliente | Código STIA del material |
| `U_IME_Lote` | Text | Vendedor/Cliente | Lote / Orden de producción |
| `U_IME_Factura` | Text | Vendedor/Cliente | Número de factura |
| `U_IME_CantInicial` | Numeric | Vendedor/Cliente | Cantidad inicial recibida |
| `U_IME_CantReclamo` | Numeric | Vendedor/Cliente | Cantidad en reclamo |
| `U_IME_ReportadoPor` | Text | Vendedor/Cliente | Nombre de quien reporta |
| `U_IME_CnsecSGI` | Text | Calidad (auto) | Consecutivo SGI — formato SGI-YYYY-NNNN |
| `U_IME_CausaReclamo` | Memo | Calidad | Causa del reclamo identificada |
| `U_IME_PlanAccion` | Memo | Calidad | Corrección inmediata + fecha cumplimiento |
| `U_IME_AccionCorrectiva` | Memo | Calidad | Acción correctiva + fecha cumplimiento |
| `U_IME_GestionadoPor` | Text | Calidad | Gestionado por (uso SGI) |
| `U_IME_VerificadoPor` | Text | Calidad | Verificado por (uso SGI) |
| `U_IME_FechaVerif` | Date | Calidad | Fecha de verificación |
| `U_IME_Retroalim` | Text | Calidad | Retroalimentación al cliente: Sí/No + fecha |
| `U_IME_VentasResp` | Text | Calidad | Persona de ventas responsable del reclamo |

**Bases de datos donde crear:** `SBO_STIACR_PROD` · `SBO_SV_STIA_FINAL` · `SBO_GT_STIA_PROD` · `SBO_HO_STIA_PROD` · `SBO_PA_STIA_PROD`

---

## 5. Consultas Pendientes al Cliente

Antes de iniciar el desarrollo de algunos sprints, se requiere confirmación en los siguientes puntos:

### 5.1 Sobre S5 — Alertas (URGENTE)
> El módulo SLA & Alertas **ya existe y está funcionando** en producción con niveles de escalación L1/L2/L3 y barra de progreso visual.

- [ ] **¿El módulo actual cubre lo que necesitan?** ¿O falta algo específico?
- [ ] **¿Requieren notificación por correo** 12h antes del vencimiento, además de la alerta in-app?
- [ ] **¿Quién es "Jefatura"?** ¿Hay un rol específico que debe recibir las alertas de prioridad Alta?

### 5.2 Sobre S7 — Conocimiento (URGENTE)
> El módulo de Base de Conocimiento **ya existe** con búsqueda full-text y categorías. Actualmente vacío (0 artículos).

- [ ] **¿El módulo actual es suficiente** o requieren funcionalidades adicionales?
- [ ] **¿Requieren el editor markdown con preview** antes de guardar?
- [ ] **¿Quieren artículos sugeridos** al crear un caso según el tipo seleccionado?

### 5.3 Sobre S6 — Inconformidad Empaque (BLOQUEANTE)
- [ ] **¿Quién creará los 16 UDFs en SAP?** Debe ser el administrador SAP con acceso a las 5 bases de datos.
- [ ] **¿Existe ya un ambiente de staging SAP** para validar antes de aplicar en producción?
- [ ] **¿El consecutivo SGI** (SGI-YYYY-NNNN) debe ser por país o global para todos los países?
- [ ] **¿Quiénes tienen rol "Calidad"** en el sistema? ¿Hay un listado de usuarios?

### 5.4 Sobre S4 — Extensión de Tiempo
- [ ] **¿Quiénes pueden extender el plazo?** ¿Solo supervisores, o también admins y gestores SAC?
- [ ] **¿Hay un máximo de extensiones** permitidas por caso?
- [ ] **¿El cliente externo** (si aplica) debe ser notificado cuando se extiende el plazo?

### 5.5 Sobre S3 — Nuevos Estados
- [ ] **¿Los estados nuevos pausan el SLA completamente** o solo pausan la escalación automática?
- [ ] **¿Quién puede cambiar a estos estados?** ¿Cualquier agente o solo supervisores?

### 5.6 Sobre S1 — Buscar Contacto
- [ ] **¿El contacto es obligatorio** o puede crearse un caso sin contacto?
- [ ] **Si el cliente no tiene contactos en SAP**, ¿se muestra solo modo manual automáticamente?

---

## 6. Plan de Trabajo

### Orden de Ejecución Recomendado

```
Semana 1           Semana 2           Semana 3
──────────────     ──────────────     ──────────────
S2  (0.5d)  ──►   S1  (2.5d)  ──►   S6  (5d) *
S3  (1d)          S4  (2d)
                  S5  (1.5d)
```

> *S6 inicia solo cuando los UDFs SAP estén creados.

### Detalle por Sprint

| # | Sprint | Días | Prerequisitos | Entregable |
|---|--------|------|---------------|------------|
| S2 | Retroalimentación Positiva | 0.5 | Ninguno | Nuevo tipo en dropdown + lógica condicional |
| S3 | Renombrar + Nuevos Estados | 1.0 | Ninguno | "Colaborador asignado" + 2 estados con pausa SLA |
| S1 | Buscar Contacto SAP | 2.5 | Ninguno | Buscador + auto-llenado + modo manual |
| S4 | Extensión de Tiempo | 2.0 | Ninguno | Botón extender + modal + audit log |
| S5 | Alertas Vencimiento | 1.5 | Validación cliente* | Alertas 12h + vencido + Alta→jefatura |
| S6 | Inconformidad Empaque | 5.0 | UDFs SAP creados | Form F069 + sección Calidad |
| S7 | Módulo Conocimiento | 2.0 | Validación cliente* | Editor + sugerencias + vínculo tipo caso |
| **Total** | | **~14.5** | | |

> *S5 y S7 requieren confirmación del cliente sobre si lo existente cubre la necesidad.

---

## 7. Criterios de Verificación por Sprint

### S1 — Buscar Contacto
- [ ] `GET /api/bp/{código}/contacts` → 200 OK con lista de contactos
- [ ] Al seleccionar cliente → aparece buscador de contacto
- [ ] Al seleccionar contacto → auto-llena nombre, cargo, teléfono, email
- [ ] Sin seleccionar → campos editables manualmente
- [ ] Crear caso → `U_ContactName` y `U_ContactCargo` guardados en SAP

### S2 — Retroalimentación Positiva
- [ ] Tipo aparece en dropdown de Nuevo Caso
- [ ] Al seleccionar → Prioridad se deshabilita (muestra "N/A")
- [ ] Al seleccionar → Tiempo Estimado se deshabilita
- [ ] Al cambiar de tipo → campos se restauran
- [ ] Badge diferenciado en lista y detalle de casos

### S3 — Renombrar + Nuevos Estados
- [ ] "Técnico" → "Colaborador" en toda la UI (5+ archivos)
- [ ] Nuevos estados visibles en selector de caso
- [ ] SLA se pausa al activar subestado
- [ ] SLA se reanuda al quitar subestado
- [ ] Cambio de estado queda registrado en timeline del caso

### S4 — Extensión de Tiempo
- [ ] Rol agente: NO ve botón "Extender plazo"
- [ ] Rol supervisor/admin: SÍ ve el botón
- [ ] Justificación vacía: formulario bloquea el envío
- [ ] Al confirmar: `U_TiempoEst` actualizado en SAP
- [ ] Entrada visible en timeline con justificación expandible
- [ ] Registro en tabla `casos.extension_logs`

### S5 — Alertas
- [ ] Alerta generada 12h antes del vencimiento → responsable del caso
- [ ] Alerta generada al vencer → gestor SAC
- [ ] Alerta prioridad Alta → también notifica Jefatura/Supervisor
- [ ] Diferenciación visual: amarillo (pre-vencimiento), rojo (vencido), rojo intenso + URGENTE (Alta)
- [ ] No se generan alertas duplicadas para el mismo caso

### S6 — Inconformidad Empaque
- [ ] UDFs existen en las 5 bases de datos SAP
- [ ] Tipo "Inconformidad de material de empaque" disponible
- [ ] Al seleccionarlo → sección F069 se despliega
- [ ] Sección "Uso Administrativo" visible SOLO para rol Calidad/Admin
- [ ] Consecutivo SGI se genera automáticamente al guardar
- [ ] Datos guardados en UDFs SAP correspondientes

### S7 — Conocimiento
- [ ] Editor con preview markdown antes de guardar
- [ ] Búsqueda retorna resultados con términos resaltados
- [ ] Al crear caso → sugerencias de artículos por tipo
- [ ] Artículos se vinculan a tipos de caso específicos

---

## 8. Checklist de Deploy por Sprint

Aplicar este proceso para **cada sprint** antes de pasar a producción:

- [ ] 1. Desarrollar en rama `feature/S{N}-nombre` desde `main`
- [ ] 2. Probar en staging: `pr.bluesystem.io` (PM2 id 3, port 3001)
- [ ] 3. Ejecutar: `npm run build` sin errores TypeScript
- [ ] 4. Verificar logs staging: `~/.pm2/logs/portal2-stia-error.log`
- [ ] 5. Prueba funcional completa según criterios de verificación del sprint
- [ ] 6. Aprobación del cliente o representante STIA
- [ ] 7. Deploy a producción: `casos.stia.net` (PM2 id 4, port 3002)
- [ ] 8. `pm2 restart 4 --update-env`
- [ ] 9. Verificar logs producción: `~/.pm2/logs/casos-stia-error.log`
- [ ] 10. Prueba smoke test en producción (crear caso de prueba)

### Para S6 específicamente:
- [ ] A. Crear UDFs en SAP **staging** primero
- [ ] B. Validar que el endpoint SAP retorna los UDFs correctamente
- [ ] C. Solo entonces crear UDFs en las 5 DBs de producción
- [ ] D. Seguir checklist estándar de deploy

---

## 9. Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| UDFs S6 no creados a tiempo | Media | Alto | Empezar los otros sprints primero, S6 al final |
| Cambios SAP en producción sin staging | Alta | Alto | Protocolo obligatorio: staging → validar → producción |
| Usuarios Azure AD no pueden hacer login | 🔴 Ya ocurrió | Alto | ✅ Corregido (Bug #001) |
| Conflicto de estados SAP con nuevos subestados | Baja | Medio | Usar UDF `U_SubEstado`, no tocar status SAP nativo |
| Acumulación de alertas duplicadas (S5) | Media | Medio | Control de deduplicación en query de escalation |

---

## 10. Información del Entorno

| Componente | Detalle |
|------------|---------|
| Servidor | AWS EC2 · ubuntu@3.212.155.164 |
| App producción | PM2 id 4 · `casos-stia` · port 3002 |
| App staging | PM2 id 3 · `portal2-stia` · port 3001 |
| Stack | Next.js 15 · TypeScript · Tailwind CSS |
| Base de datos | PostgreSQL · `stia_portal_clientes` · schema `casos` |
| SAP | Business One Service Layer · 5 bases de datos |
| SSH key | `KP-STIA.pem` |

---

## 11. Próximos Pasos

### Acción inmediata (esta semana):
1. **Enviar este documento al cliente** para validar puntos de consulta (sección 5)
2. **Confirmar S5 y S7** — si ya están cubiertos, reducir scope y costo
3. **Coordinar con admin SAP** la creación de UDFs para S6
4. **Definir quiénes tienen rol Calidad** en el sistema (para S6)

### Inicio de desarrollo (tras confirmaciones):
5. Iniciar con **S2 + S3** (sprints más rápidos, sin dependencias)
6. Continuar con **S1 y S4** en paralelo si hay recursos
7. **S5** tras confirmación de alcance
8. **S6** cuando UDFs SAP estén listos
9. **S7** tras confirmación de alcance adicional

---

*Documento generado por BlueSystem · bluesystem.io*
*Casos STIA — Análisis Técnico Marzo 2026*
*Próxima revisión: al recibir respuestas del cliente*
