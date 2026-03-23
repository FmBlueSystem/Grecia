# Análisis de Brecha — Sistema de Escalamiento v2
**Spec vs. Implementación actual en casos.stia.net**
**Preparado por:** BlueSystem · 17 de marzo de 2026

---

## 1. Estado General

El motor de escalamiento v2 está **implementado al ~95%**. La arquitectura sigue fielmente la spec: bifurcación response/resolution, niveles configurables, horario hábil con excepciones, factor de prioridad, re-notificación en nivel máximo y logs de auditoría.

**El problema principal no es el código — es que el cron no está corriendo en producción.**

---

## 2. Comparativa Spec v2 vs. Implementación

| Feature | Spec v2 | Estado | Archivo |
|---------|---------|--------|---------|
| Escalamiento bifurcado (response / resolution) | ✅ | ✅ Listo | `escalation-v2.ts` |
| Niveles configurables por política | ✅ | ✅ Listo | `escalation_levels` |
| Factor de prioridad (reduce time_window) | ✅ | ✅ Listo | `escalation-v2.ts:339` |
| Horario hábil con excepciones (feriados) | ✅ | ✅ Listo | `business-hours.ts` |
| Re-notificación en nivel máximo | ✅ | ✅ Listo | `max_renotify_count` |
| Pausa / reanudación manual | ✅ | ✅ Listo | `pause_on_status` |
| Contactos dinámicos (role / user / case_owner) | ✅ | ✅ Listo | `resolveContacts()` |
| Múltiples canales (email / in_app / whatsapp) | ✅ | ✅ Listo | `sendNotifications()` |
| Reasignación automática por nivel | ✅ | ✅ Listo | `reassign_to` en level |
| Logs de auditoría con JSON de notificados | ✅ | ✅ Listo | `escalation_logs` |
| Dashboard SLA real-time | ✅ | ✅ Listo | `/alertas` page |
| Cron scheduler automático | ✅ | ❌ **NO corre** | `check-escalation.sh` |
| Reset policy (full / one_level / on_response) | ✅ | ❌ Campo existe, no procesado | `escalation-v2.ts` |
| Business hours resuelto por país | ✅ | ⚠️ Hardcoded bh_id=1 (CR) | `escalation-v2.ts` |
| WhatsApp | ✅ | ⚠️ Placeholder | `sendNotifications()` |
| Tabla `escalation_rules` legacy | — | ⚠️ Obsoleta pero endpoint vivo | API route |

---

## 3. Gaps Detallados

### GAP-01 — Cron ✅ RESUELTO (2026-03-17)
**Estado:** El cron **está corriendo correctamente** en producción. Verificado 17 de marzo 2026.

- Script: `/opt/stia/check-escalation.sh` corriendo cada `*/5 * * * *`
- Último resultado: `HTTP=200 {"success":true,"results":{"CR":{"evaluated":1,"escalated":0,...}}}`
- Log: `/var/log/stia-escalation.log`
- Se eliminó entrada duplicada con token incorrecto del crontab

~~**Impacto:** El escalamiento NUNCA se dispara automáticamente. Solo funciona cuando un admin llama manualmente a `POST /api/escalation/check`.~~

**Causa:** El script `scripts/check-escalation.sh` existe y está documentado en `scripts/deploy-cron.md`, pero el crontab **no fue configurado** en el servidor AWS.

**Fix:**
```bash
# SSH al servidor
ssh -i KP-STIA.pem ubuntu@3.212.155.164

# Agregar al crontab
crontab -e

# Agregar esta línea:
*/5 * * * * CRON_SECRET=<valor-env> curl -s -X POST \
  -H "Authorization: Bearer <valor-env>" \
  https://casos.stia.net/api/escalation/check \
  >> /var/log/stia-escalation.log 2>&1
```

**Verificar que CRON_SECRET esté en el .env de producción:**
```bash
grep CRON_SECRET /data/casos/.env
```

**Tiempo estimado:** 30 minutos (configuración + prueba)

---

### GAP-02 — Reset Policy ✅ RESUELTO (2026-03-17)
**Impacto:** Al actualizar un caso (por ejemplo, el agente agrega una nota), el nivel de escalamiento nunca retrocede aunque la política diga `reset_policy = "one_level"` o `"on_response"`.

**Causa:** El campo `reset_policy` existe en `escalation_policies` pero la función `evaluateCase()` en `escalation-v2.ts` no lo procesa.

**Fix:** Implementar la función `al_actualizar_caso()` de la spec. Debe llamarse desde:
- `POST /api/casos/[id]/notas` — cuando un agente añade una nota (primera respuesta)
- `PATCH /api/casos/[id]` — cuando cambia estado del caso

**Pseudocódigo:**
```typescript
// En el handler que actualiza el caso o crea una nota del agente:
async function onCaseUpdate(caseId: number, country: string, updateType: 'agent_response' | 'status_change') {
  const state = await getCaseEscalationState(caseId, country);
  if (!state || !state.resolution_policy_id) return;

  const policy = await getPolicy(state.resolution_policy_id);

  // Primera respuesta — resetear SLA de respuesta
  if (updateType === 'agent_response' && !state.first_response_at) {
    await markFirstResponse(state.id);
  }

  // Aplicar reset_policy sobre SLA de resolución
  switch (policy.reset_policy) {
    case 'full':
      await resetResolutionLevel(state.id, 0);
      break;
    case 'one_level':
      if (state.resolution_level > 0)
        await resetResolutionLevel(state.id, state.resolution_level - 1);
      break;
    case 'on_response':
      if (updateType === 'agent_response')
        await resetResolutionLevel(state.id, 0);
      break;
    // 'none': no hacer nada
  }

  // Auto-pausa según status nuevo
  const pausaStatuses = policy.pause_on_status?.split(',') ?? [];
  const statusActual = mapSapStatus(caso.Status);
  if (pausaStatuses.includes(statusActual)) {
    await pauseEscalation(state.id);
  } else if (state.escalation_paused) {
    await resumeEscalation(state.id);
  }
}
```

**Tiempo estimado:** 1 día

---

### GAP-03 — Business Hours por país ✅ RESUELTO (2026-03-17)
**Impacto:** Para casos de GT, HN, SV, PA el tiempo vencido se calcula con el horario de Costa Rica (misma zona horaria en la práctica, pero feriados distintos).

**Causa:** `calcBusinessMinutes()` usa siempre `bh_id=1` en lugar de resolver el horario según el país del caso.

**Fix:** Pasar el `country` al resolver el `sla_definition`, y desde allí obtener el `business_hours_id` correcto.

```typescript
// En getOrCreateState(), al resolver la SLA definition:
const slaDef = await query(
  `SELECT sd.*, bh.id as bh_id, bh.timezone, bh.workdays, bh.start_time, bh.end_time
   FROM casos.sla_definitions sd
   JOIN casos.business_hours bh ON bh.id = sd.business_hours_id
   WHERE sd.priority_label = $1
   -- Agregar: ORDER BY CASE WHEN bh.country_code = $2 THEN 0 ELSE 1 END
   LIMIT 1`,
  [priorityLabel, country]
);
```

**Requiere también:** Agregar columna `country_code` a `business_hours` y crear registros por país con sus respectivos feriados.

**Tiempo estimado:** 1.5 días (+ carga de feriados por país)

---

### GAP-04 — Tabla escalation_rules legacy activa 🟢 BAJO
**Impacto:** Endpoint `GET/PATCH /api/escalation-rules` aún responde pero usa una tabla que ya no afecta el motor v2. Puede confundir a administradores.

**Fix:** Deshabilitar el endpoint o redirigir a configuración v2.

**Tiempo estimado:** 2 horas

---

### GAP-05 — WhatsApp placeholder 🟢 BAJO
**Impacto:** Contactos configurados con `channel = "whatsapp"` no reciben nada.

**Estado:** Requiere contrato con Twilio o Meta API — decisión de negocio, fuera de scope hasta aprobación de presupuesto.

---

## 4. Integración con Sprints de Mejoras Marzo 2026

Los sprints S3, S4 y S5 de las mejoras solicitadas **deben integrarse con el motor de escalamiento existente**. Aquí cómo:

---

### S3 — Nuevos Estados → `pause_on_status`

Los estados "Pendiente de proveedor" y "Pendiente de otra área" deben **pausar el escalamiento automáticamente**.

**Implementación:** Al crear el UDF `U_SubEstado` y activar uno de estos estados, ejecutar:

```typescript
// En PATCH /api/casos/[id] cuando se cambia U_SubEstado:
if (newSubEstado === "Pendiente de proveedor" || newSubEstado === "Pendiente de otra área") {
  await pauseEscalation(caseId, country);   // ← función ya existe en escalation-v2.ts
} else if (prevSubEstado && !newSubEstado) {
  await resumeEscalation(caseId, country);  // ← función ya existe
}
```

**También:** Agregar estos valores al campo `pause_on_status` de la política de escalamiento:
```sql
UPDATE casos.escalation_policies
SET pause_on_status = 'pending_vendor,pending_other_area'
WHERE name = 'Politica Principal'; -- ajustar según nombre real
```

**Esfuerzo adicional por integración:** ~2 horas sobre el sprint S3.

---

### S4 — Extensión de Tiempo → Recalcular deadline

Cuando un supervisor extiende el tiempo de resolución, el deadline del escalamiento **debe actualizarse**.

**Implementación:** En `POST /api/casos/[id]/extend`:

```typescript
// Después de actualizar U_TiempoEst en SAP:
const newResolutionDeadline = calcNewDeadline(caso.CreationDate, newTiempoEst);

await query(
  `UPDATE casos.case_escalation_state
   SET resolution_deadline = $1,
       -- Opcional: resetear nivel si la extensión es significativa
       resolution_level = CASE WHEN $2 = 'full' THEN 0 ELSE resolution_level END,
       updated_at = NOW()
   WHERE sap_case_id = $3 AND country = $4`,
  [newResolutionDeadline, policy.reset_policy, caseId, country]
);
```

**Esfuerzo adicional por integración:** ~3 horas sobre el sprint S4.

---

### S5 — Alertas 12h Antes → Nuevo nivel "pre-vencimiento"

El sistema actual solo escala **después** de que el SLA vence. La alerta 12h antes es un nivel nuevo **antes** del vencimiento.

**Opciones de implementación:**

**Opción A — Nuevo nivel con `time_window_min` negativo** (más limpio)
```sql
-- Insertar nivel -1 con tiempo negativo (antes del vencimiento)
INSERT INTO casos.escalation_levels
  (policy_id, level_order, name, time_window_min, action_type, template_id)
VALUES
  (<policy_id>, -1, 'Pre-vencimiento', -720, 'notify', <template_id>);
-- -720 min = -12 horas (antes del deadline)
```
Requiere modificar el algoritmo para evaluar `time_window_min < 0`.

**Opción B — Campo `pre_alert_minutes` en `escalation_policies`** (más simple)
```sql
ALTER TABLE casos.escalation_policies ADD COLUMN pre_alert_minutes INT DEFAULT NULL;
-- Configurar: pre_alert_minutes = 720 (12 horas)
```
Y en el cron, agregar un segundo query:
```typescript
// Casos que vencen en las próximas N horas y aún no recibieron pre-alerta
const casosProximos = await query(`
  SELECT * FROM casos.case_escalation_state
  WHERE resolution_deadline BETWEEN NOW() AND NOW() + INTERVAL '${preAlertMin} minutes'
  AND pre_alert_sent = FALSE
  AND escalation_paused = FALSE
`);
```

**Recomendación:** Opción B es más rápida y menos riesgo de romper el algoritmo existente.

**Esfuerzo adicional:** ~1 día sobre el sprint S5.

---

## 5. Plan de Trabajo — Solo los Gaps

| # | Gap | Días | Dependencia | Prioridad |
|---|-----|------|-------------|-----------|
| **GAP-01** | ~~Configurar cron en AWS~~ ✅ Ya corriendo | — | — | ✅ Cerrado |
| **GAP-02** | ~~Implementar reset_policy~~ ✅ Resuelto | — | — | ✅ Cerrado |
| **GAP-03** | ~~Business hours por país~~ ✅ Resuelto | — | — | ✅ Cerrado |
| **S3 integración** | pause/resume en nuevos estados | 0.25 | Sprint S3 | Junto con S3 |
| **S4 integración** | Recalcular deadline al extender | 0.375 | Sprint S4 | Junto con S4 |
| **S5 integración** | Pre-alerta 12h antes | 1.0 | Sprint S5 | Junto con S5 |
| **GAP-04** | Deshabilitar legacy endpoint | 0.25 | Ninguna | 🟢 Cuando haya tiempo |
| **GAP-05** | WhatsApp | — | Decisión negocio | 🔵 Pendiente |

**Total días adicionales (gaps puros):** ~3.5 días

---

## 6. Verificación del Cron (Post-configuración)

Una vez configurado el cron, validar con estos pasos:

```bash
# 1. Ver que el crontab quedó guardado
crontab -l | grep escalation

# 2. Esperar 5 minutos y revisar el log
tail -f /var/log/stia-escalation.log

# 3. Resultado esperado en el log:
# {"success":true,"results":{"CR":{"evaluated":N,"escalated":N,"errors":0},...}}

# 4. En la página /alertas — los casos excedidos deben mostrar nivel L1, L2, L3
# 5. Verificar en la tabla que hay registros nuevos:
psql -h localhost -U postgres -d stia_portal_clientes \
  -c "SELECT * FROM casos.escalation_logs ORDER BY escalated_at DESC LIMIT 5;"
```

---

## 7. Consultas al Cliente sobre Escalamiento

Antes de cerrar los gaps de integración (S3, S4, S5):

- [ ] **¿Quién es "Jefatura"?** ¿Hay un usuario o rol específico en el sistema para el nivel más alto de escalamiento?
- [ ] **¿Los nuevos estados (S3) deben pausar el SLA completamente**, o solo detener la notificación pero seguir contando el tiempo?
- [ ] **¿La extensión de plazo (S4) debe resetear el nivel de escalamiento** a cero, o mantener el nivel actual?
- [ ] **¿La pre-alerta 12h (S5)** debe ir por correo, notificación in-app, o ambas?
- [ ] **¿Feriados por país** — ¿tienen un calendario oficial que podamos cargar? (necesario para GAP-03)

---

## 8. Archivos Clave — Mapa de Referencia

```
casos-prod/
├── src/lib/
│   ├── escalation-v2.ts        ← Motor principal (evaluar, escalar, notificar)
│   ├── business-hours.ts       ← calcBusinessMinutes() — fix GAP-03 aquí
│   └── sla.ts                  ← TIEMPO_TO_HOURS, mapSapPriority
├── src/app/api/
│   ├── escalation/check/       ← Endpoint cron — llamar desde crontab (GAP-01)
│   ├── escalation-logs/        ← Historial + acknowledge
│   └── casos/[id]/             ← Aquí integrar GAP-02, S3, S4
├── migration-escalation-v2.sql ← Schema completo con datos semilla
└── scripts/
    ├── check-escalation.sh     ← Script cron (ya existe, solo configurar)
    └── deploy-cron.md          ← Instrucciones de setup
```

---

*BlueSystem · bluesystem.io · Análisis técnico escalamiento · Marzo 2026*
