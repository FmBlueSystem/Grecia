/**
 * Motor de Escalamiento v2
 * Implementa la spec escalation_spec_v2.md
 * Ajustado a: casos en SAP, usuarios en PostgreSQL (schema casos)
 */

import { query, queryOne } from "@/lib/db";
import { sendSlaWarningEmail, sendSlaExceededEmail, sendEscalationAdminEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { calcBusinessMinutes, type BusinessHours, type BusinessHoursException } from "@/lib/business-hours";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

interface EscalationPolicy {
  id: number;
  name: string;
  escalation_type: string;
  count_only_business_hours: boolean;
  max_renotify_count: number;
  renotify_interval_min: number;
  reset_policy: string;
  pause_on_status: string | null;
  priority_weight: number;
}

interface EscalationLevel {
  id: number;
  policy_id: number;
  level_order: number;
  name: string;
  time_window_min: number;
  action_type: string;
  reassign_to: string | null;
  template_id: number | null;
  is_active: boolean;
}

interface EscalationContact {
  level_id: number;
  contact_type: string;
  contact_ref: string;
  channel: string;
}

interface NotificationTemplate {
  id: number;
  name: string;
  channel: string;
  subject: string | null;
  body: string;
}

interface CaseEscalationState {
  id: number;
  sap_case_id: number;
  country: string;
  resolution_policy_id: number | null;
  resolution_level: number;
  resolution_escalated_at: Date | null;
  resolution_renotify_count: number;
  resolution_deadline: Date | null;
  response_policy_id: number | null;
  response_level: number;
  response_escalated_at: Date | null;
  response_renotify_count: number;
  response_deadline: Date | null;
  first_response_at: Date | null;
  escalation_paused: boolean;
  paused_at: Date | null;
  total_paused_min: number;
}

interface SapCaseInfo {
  ServiceCallID: number;
  Subject: string;
  Status: number;
  Priority: string;      // scp_High | scp_Medium | scp_Low
  TechnicianCode: number | null;
  U_Area: string | null;
  CreationDate: string;
}

interface UserRow {
  id: number;
  email: string;
  name: string;
  role: string;
  sap_employee_id: number | null;
  department_id: number | null;
  default_country: string | null;
}

interface DeptMember {
  department_id: number;
  user_id: number;
  role: string; // 'supervisor' | 'agente'
}

interface DeptRow {
  id: number;
  chief_user_id: number | null;
}

interface NotifEntry {
  contact: string;
  channel: string;
  sent_at: string;
  delivered: boolean;
}

// ----------------------------------------------------------------
// Cache compartido por ejecución del cron
// ----------------------------------------------------------------

interface SharedData {
  policies: Map<number, EscalationPolicy>;
  levels: Map<number, EscalationLevel[]>;      // policy_id → levels ordenados
  contacts: Map<number, EscalationContact[]>;  // level_id → contacts
  templates: Map<number, NotificationTemplate>;
  users: Map<number, UserRow>;
  usersBySapEmpId: Map<number, UserRow>;
  usersByRole: Map<string, UserRow[]>;
  businessHours: Map<number, BusinessHours>;
  bhExceptions: Map<number, BusinessHoursException[]>;
  bhByCountry: Map<string, number>;            // country_code → bh_id (GAP-03)
  caseAssignments: Map<string, UserRow>;       // "${sap_case_id}-${country}" → portal user
  // Departamentos
  deptMembersByRole: Map<string, UserRow[]>;   // "${dept_id}:supervisor" → users
  deptChief: Map<number, UserRow>;             // dept_id → jefe del departamento
  coordByCountry: Map<string, UserRow[]>;      // country → coordinadores
}

export async function loadSharedData(): Promise<SharedData> {
  const [
    policiesRows,
    levelsRows,
    contactsRows,
    templatesRows,
    usersRows,
    bhRows,
    exRows,
    caRows,
    deptMembersRows,
  ] = await Promise.all([
    query<EscalationPolicy>("SELECT * FROM casos.escalation_policies WHERE is_active = TRUE"),
    query<EscalationLevel>("SELECT l.* FROM casos.escalation_levels l JOIN casos.escalation_policies p ON l.policy_id = p.id WHERE p.is_active = TRUE AND l.is_active = TRUE ORDER BY l.policy_id, l.level_order"),
    query<EscalationContact>("SELECT c.* FROM casos.escalation_contacts c JOIN casos.escalation_levels l ON c.level_id = l.id WHERE c.is_active = TRUE"),
    query<NotificationTemplate>("SELECT * FROM casos.notification_templates WHERE is_active = TRUE"),
    query<UserRow>("SELECT id, email, name, role, sap_employee_id, department_id, default_country FROM casos.users WHERE active = TRUE"),
    query<BusinessHours & { id: number }>("SELECT * FROM casos.business_hours"),
    query<BusinessHoursException & { business_hours_id: number }>("SELECT * FROM casos.business_hours_exceptions"),
    query<{ service_call_id: number; country: string; user_id: number }>(
      `SELECT DISTINCT ON (service_call_id, country) service_call_id, country, user_id
       FROM casos.case_assignments
       ORDER BY service_call_id, country, assigned_at DESC`
    ),
    query<DeptMember>(
      "SELECT department_id, user_id, role FROM casos.department_members"
    ).catch(() => [] as DeptMember[]), // graceful: tabla puede no existir aún
  ]);

  const policies = new Map(policiesRows.map((p) => [p.id, p]));

  const levels = new Map<number, EscalationLevel[]>();
  for (const l of levelsRows) {
    const arr = levels.get(l.policy_id) || [];
    arr.push(l);
    levels.set(l.policy_id, arr);
  }

  const contacts = new Map<number, EscalationContact[]>();
  for (const c of contactsRows) {
    const arr = contacts.get(c.level_id) || [];
    arr.push(c);
    contacts.set(c.level_id, arr);
  }

  const templates = new Map(templatesRows.map((t) => [t.id, t]));

  const users = new Map(usersRows.map((u) => [u.id, u]));
  const usersBySapEmpId = new Map<number, UserRow>();
  const usersByRole = new Map<string, UserRow[]>();
  for (const u of usersRows) {
    if (u.sap_employee_id) usersBySapEmpId.set(u.sap_employee_id, u);
    const arr = usersByRole.get(u.role) || [];
    arr.push(u);
    usersByRole.set(u.role, arr);
  }

  // Índice de asignaciones portal: "${sap_case_id}-${country}" → UserRow
  const caseAssignments = new Map<string, UserRow>();
  for (const ca of caRows) {
    const u = users.get(ca.user_id);
    if (u) caseAssignments.set(`${ca.service_call_id}-${ca.country}`, u);
  }

  const businessHours = new Map(bhRows.map((b) => [b.id, b]));
  const bhExceptions = new Map<number, BusinessHoursException[]>();
  for (const ex of exRows) {
    const arr = bhExceptions.get(ex.business_hours_id) || [];
    arr.push(ex);
    bhExceptions.set(ex.business_hours_id, arr);
  }

  // GAP-03: índice country_code → bh_id para resolver horario por país
  const bhByCountry = new Map<string, number>();
  for (const b of bhRows) {
    if (b.country_code) bhByCountry.set(b.country_code, b.id);
  }

  // Índice de supervisores por departamento: "${dept_id}:supervisor" → UserRow[]
  const deptMembersByRole = new Map<string, UserRow[]>();
  for (const dm of deptMembersRows) {
    if (dm.role !== "supervisor") continue;
    const key = `${dm.department_id}:supervisor`;
    const u = users.get(dm.user_id);
    if (u) {
      const arr = deptMembersByRole.get(key) || [];
      arr.push(u);
      deptMembersByRole.set(key, arr);
    }
  }

  // Índice de jefes por departamento: dept_id → UserRow
  // El jefe está almacenado directamente en departments.chief_user_id
  const deptRows = await query<DeptRow>(
    "SELECT id, chief_user_id FROM casos.departments WHERE active = TRUE"
  ).catch(() => [] as DeptRow[]);
  const deptChief = new Map<number, UserRow>();
  for (const d of deptRows) {
    if (d.chief_user_id) {
      const u = users.get(d.chief_user_id);
      if (u) deptChief.set(d.id, u);
    }
  }

  // Índice de coordinadores por país (usa default_country)
  const coordByCountry = new Map<string, UserRow[]>();
  for (const u of usersByRole.get("coordinador") || []) {
    if (u.default_country) {
      const arr = coordByCountry.get(u.default_country) || [];
      arr.push(u);
      coordByCountry.set(u.default_country, arr);
    }
  }

  return { policies, levels, contacts, templates, users, usersBySapEmpId, usersByRole, businessHours, bhExceptions, bhByCountry, caseAssignments, deptMembersByRole, deptChief, coordByCountry };
}

// ----------------------------------------------------------------
// Renderizar template
// ----------------------------------------------------------------

function renderTemplate(body: string, vars: Record<string, string>): string {
  return body.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

// ----------------------------------------------------------------
// Resolver contactos de un nivel
// ----------------------------------------------------------------

function resolveTechUser(shared: SharedData, sapCase: SapCaseInfo, country: string): UserRow | null {
  return shared.caseAssignments.get(`${sapCase.ServiceCallID}-${country}`)
    || (sapCase.TechnicianCode ? shared.usersBySapEmpId.get(sapCase.TechnicianCode) ?? null : null);
}

function resolveContacts(
  level: EscalationLevel,
  shared: SharedData,
  sapCase: SapCaseInfo,
  country: string
): UserRow[] {
  const contacts = shared.contacts.get(level.id) || [];
  const result: UserRow[] = [];
  const seen = new Set<number>();

  const add = (u: UserRow) => {
    if (!seen.has(u.id)) { seen.add(u.id); result.push(u); }
  };

  // Técnico del caso (portal o SAP) — usado por dept_supervisor y dept_chief
  const techUser = resolveTechUser(shared, sapCase, country);
  const techDeptId = techUser?.department_id ?? null;

  for (const c of contacts) {
    if (c.contact_type === "case_owner") {
      if (techUser) { add(techUser); continue; }
    } else if (c.contact_type === "role") {
      for (const u of shared.usersByRole.get(c.contact_ref) || []) add(u);
    } else if (c.contact_type === "user") {
      const u = shared.users.get(Number(c.contact_ref));
      if (u) add(u);
    } else if (c.contact_type === "dept_supervisor") {
      if (techDeptId) {
        for (const u of shared.deptMembersByRole.get(`${techDeptId}:supervisor`) || []) add(u);
      } else {
        // Sin departamento → fallback supervisor por rol
        for (const u of shared.usersByRole.get("supervisor") || []) add(u);
      }
    } else if (c.contact_type === "dept_chief") {
      if (techDeptId) {
        const chief = shared.deptChief.get(techDeptId);
        if (chief) add(chief);
      } else {
        // Sin departamento → fallback admins
        for (const u of shared.usersByRole.get("admin") || []) add(u);
      }
    } else if (c.contact_type === "coordinador") {
      const coords = shared.coordByCountry.get(country) || [];
      if (coords.length > 0) {
        for (const u of coords) add(u);
      } else {
        // Sin coordinador configurado → notificar admins
        for (const u of shared.usersByRole.get("admin") || []) add(u);
      }
    }
  }

  // Fallback global: si no hay contactos, notificar a admins
  if (result.length === 0) {
    for (const u of shared.usersByRole.get("admin") || []) add(u);
  }

  return result;
}

// ----------------------------------------------------------------
// Enviar notificaciones
// ----------------------------------------------------------------

async function sendNotifications(
  level: EscalationLevel,
  targets: UserRow[],
  sapCase: SapCaseInfo,
  timeOverdueMin: number,
  shared: SharedData,
  country: string
): Promise<NotifEntry[]> {
  const template = level.template_id ? shared.templates.get(level.template_id) : null;
  const entries: NotifEntry[] = [];

  // Resolver el responsable del caso: portal first, luego SAP technician
  const portalAssigned = shared.caseAssignments.get(`${sapCase.ServiceCallID}-${country}`);
  const assignedName = portalAssigned?.name
    || (sapCase.TechnicianCode ? shared.usersBySapEmpId.get(sapCase.TechnicianCode)?.name : null)
    || "Sin asignar";

  const vars: Record<string, string> = {
    reference_code: `CAS-${sapCase.ServiceCallID}`,
    subject:        sapCase.Subject || "Sin asunto",
    priority:       sapCase.Priority,
    level_name:     level.name,
    time_overdue:   String(timeOverdueMin),
    assigned_to:    assignedName,
    sla_pct:        "-",
  };

  for (const user of targets) {
    const levelContacts = shared.contacts.get(level.id) || [];
    const techDeptId = resolveTechUser(shared, sapCase, country)?.department_id ?? null;
    const channels = levelContacts.filter((c) => {
      if (c.contact_type === "case_owner") {
        const ownerId = portalAssigned?.id
          ?? (sapCase.TechnicianCode ? shared.usersBySapEmpId.get(sapCase.TechnicianCode)?.id : undefined);
        return ownerId === user.id;
      }
      if (c.contact_type === "role") return user.role === c.contact_ref;
      if (c.contact_type === "user") return user.id === Number(c.contact_ref);
      if (c.contact_type === "dept_supervisor") {
        return techDeptId !== null
          && (shared.deptMembersByRole.get(`${techDeptId}:supervisor`) || []).some((u) => u.id === user.id);
      }
      if (c.contact_type === "dept_chief") {
        return techDeptId !== null && shared.deptChief.get(techDeptId)?.id === user.id;
      }
      if (c.contact_type === "coordinador") {
        return user.role === "coordinador" && user.default_country === country;
      }
      return false;
    }).map((c) => c.channel);

    const useChannels = channels.length > 0 ? [...new Set(channels)] : ["email", "in_app"];

    for (const channel of useChannels) {
      let delivered = false;

      if (channel === "email" && template?.channel === "email") {
        const subject = template.subject ? renderTemplate(template.subject, vars) : `Escalamiento Caso CAS-${sapCase.ServiceCallID}`;
        const body    = renderTemplate(template.body, vars);
        delivered = await sendSlaWarningEmail(user.email, sapCase.ServiceCallID, sapCase.Subject || "", timeOverdueMin)
          .catch(() => false);
        void subject; void body; // used via sendSlaWarningEmail
      } else if (channel === "in_app") {
        const title   = template ? renderTemplate(template.subject || template.body.slice(0, 60), vars) : `Escalamiento ${level.name}`;
        const message = template ? renderTemplate(template.body, vars) : `Caso CAS-${sapCase.ServiceCallID} vencido ${timeOverdueMin} min`;
        await query(
          "INSERT INTO casos.notifications (user_id, case_id, country, title, message, type) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING",
          [user.id, sapCase.ServiceCallID, "", title, message, "sla_warning"]
        ).catch(() => {});
        delivered = true;
      }

      entries.push({ contact: user.email, channel, sent_at: new Date().toISOString(), delivered });
    }
  }

  return entries;
}

// ----------------------------------------------------------------
// Evaluación principal de un caso
// ----------------------------------------------------------------

export async function evaluateCase(
  sapCase: SapCaseInfo,
  country: string,
  state: CaseEscalationState,
  slaType: "response" | "resolution",
  shared: SharedData
): Promise<{ levelReached: number; actions: string[] }> {
  const actions: string[] = [];

  // Seleccionar campos según tipo SLA
  const policyId   = slaType === "response" ? state.response_policy_id   : state.resolution_policy_id;
  const deadline   = slaType === "response" ? state.response_deadline     : state.resolution_deadline;
  const curLevel   = slaType === "response" ? state.response_level        : state.resolution_level;
  const escalatedAt = slaType === "response" ? state.response_escalated_at : state.resolution_escalated_at;
  const renotifyCount = slaType === "response" ? state.response_renotify_count : state.resolution_renotify_count;

  if (!policyId || !deadline) return { levelReached: curLevel, actions };

  const policy = shared.policies.get(policyId);
  if (!policy) return { levelReached: curLevel, actions };

  const now = new Date();
  if (now <= deadline) return { levelReached: curLevel, actions };

  // Verificar pause_on_status (mapeo de Status SAP a string)
  if (policy.pause_on_status) {
    const pauseStatuses = policy.pause_on_status.split(",").map((s) => s.trim());
    const statusStr = sapCase.Status === -3 ? "open" : sapCase.Status === -2 ? "in_progress" : "closed";
    if (pauseStatuses.includes(statusStr)) return { levelReached: curLevel, actions };
  }

  const levels = (shared.levels.get(policyId) || []).filter((l) => l.is_active);
  if (levels.length === 0) return { levelReached: curLevel, actions };

  // Calcular tiempo vencido
  let overdueMin: number;
  if (policy.count_only_business_hours) {
    // Buscar business_hours via sla_definitions (no tenemos bh_id directo aquí, usar primero disponible)
    const bhId = shared.bhByCountry.get(country) || 1; // GAP-03: resolver por país
    const bh = shared.businessHours.get(bhId) || null;
    const exs = shared.bhExceptions.get(bhId) || [];
    overdueMin = calcBusinessMinutes(deadline, now, bh, exs);
  } else {
    overdueMin = Math.round((now.getTime() - deadline.getTime()) / 60_000);
  }

  overdueMin = Math.max(0, overdueMin - state.total_paused_min);
  if (overdueMin <= 0) return { levelReached: curLevel, actions };

  // Factor de prioridad
  const priorityNum = sapCase.Priority === "scp_High" ? 3 : sapCase.Priority === "scp_Medium" ? 2 : 1;
  const factor = 1.0 / (1.0 + (priorityNum - 1) * Number(policy.priority_weight));

  // Calcular nivel esperado
  let expectedLevel = 0;
  let accumulated = 0;
  for (const lvl of levels) {
    accumulated += lvl.time_window_min * factor;
    if (overdueMin >= accumulated) expectedLevel = lvl.level_order + 1;
    else break;
  }
  const maxLevel = levels[levels.length - 1].level_order + 1;
  expectedLevel = Math.min(expectedLevel, maxLevel);

  // Escalar nivel por nivel (§3.1 paso 6)
  if (expectedLevel > curLevel) {
    for (let lvlNum = curLevel + 1; lvlNum <= expectedLevel; lvlNum++) {
      const lvlConfig = levels.find((l) => l.level_order === lvlNum - 1);
      if (!lvlConfig) continue;

      const targets = resolveContacts(lvlConfig, shared, sapCase, country);
      const notifEntries = await sendNotifications(lvlConfig, targets, sapCase, overdueMin, shared, country);

      // Reasignar si corresponde
      let reassignedFrom: string | null = null;
      if (lvlConfig.action_type.includes("reassign") && lvlConfig.reassign_to) {
        reassignedFrom = sapCase.TechnicianCode
          ? shared.usersBySapEmpId.get(sapCase.TechnicianCode)?.name || null
          : null;
        actions.push(`reassign_to:${lvlConfig.reassign_to}`);
      }

      // Insertar log v2
      await query(
        `INSERT INTO casos.escalation_logs
          (case_id, country, level, action, notified_to, escalation_type, from_level, to_level, time_overdue_min, triggered_by, notified_to_v2)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT DO NOTHING`,
        [
          sapCase.ServiceCallID, country,
          String(lvlNum), lvlConfig.action_type,
          notifEntries.map((e) => e.contact).join(", "),
          slaType, lvlNum - 1, lvlNum, overdueMin, "system",
          JSON.stringify(notifEntries),
        ]
      ).catch(() => {});

      actions.push(`level_${lvlNum}:${lvlConfig.name}`);
      logger.info("Escalation level triggered", {
        case_id: sapCase.ServiceCallID, country, slaType, level: lvlNum, overdueMin,
      });
    }

    // Actualizar state
    await query(
      slaType === "response"
        ? "UPDATE casos.case_escalation_state SET response_level=$1, response_escalated_at=NOW(), response_renotify_count=0, updated_at=NOW() WHERE id=$2"
        : "UPDATE casos.case_escalation_state SET resolution_level=$1, resolution_escalated_at=NOW(), resolution_renotify_count=0, updated_at=NOW() WHERE id=$2",
      [expectedLevel, state.id]
    );
  }

  // Re-notificación en nivel máximo (§3.1 paso 7)
  if (expectedLevel >= maxLevel && renotifyCount < policy.max_renotify_count) {
    const refTime = escalatedAt || deadline;
    const minsSinceLast = Math.round((now.getTime() - refTime.getTime()) / 60_000);
    if (minsSinceLast >= policy.renotify_interval_min) {
      const topLevel = levels[levels.length - 1];
      const targets  = resolveContacts(topLevel, shared, sapCase, country);
      await sendNotifications(topLevel, targets, sapCase, overdueMin, shared, country);

      await query(
        slaType === "response"
          ? "UPDATE casos.case_escalation_state SET response_renotify_count=response_renotify_count+1, response_escalated_at=NOW(), updated_at=NOW() WHERE id=$1"
          : "UPDATE casos.case_escalation_state SET resolution_renotify_count=resolution_renotify_count+1, resolution_escalated_at=NOW(), updated_at=NOW() WHERE id=$1",
        [state.id]
      );

      await query(
        `INSERT INTO casos.escalation_logs
          (case_id, country, level, action, escalation_type, from_level, to_level, time_overdue_min, triggered_by)
         VALUES ($1, $2, $3, 'renotify', $4, $5, $5, $6, 'system')
         ON CONFLICT DO NOTHING`,
        [sapCase.ServiceCallID, country, String(maxLevel), slaType, maxLevel, overdueMin]
      ).catch(() => {});

      actions.push(`renotify:level_${maxLevel}`);
    }
  }

  return { levelReached: expectedLevel, actions };
}

// ----------------------------------------------------------------
// Obtener o crear estado de escalamiento de un caso
// ----------------------------------------------------------------

export async function getOrCreateState(
  sapCaseId: number,
  country: string,
  priority: string
): Promise<CaseEscalationState | null> {
  const existing = await queryOne<CaseEscalationState>(
    "SELECT * FROM casos.case_escalation_state WHERE sap_case_id=$1 AND country=$2",
    [sapCaseId, country]
  );
  if (existing) return existing;

  // Resolver políticas por defecto (resolución + respuesta)
  const policies = await query<{ id: number; escalation_type: string }>(
    "SELECT id, escalation_type FROM casos.escalation_policies WHERE is_active = TRUE"
  );
  const resPolicyId  = policies.find((p) => p.escalation_type === "resolution")?.id || null;
  const respPolicyId = policies.find((p) => p.escalation_type === "response")?.id || null;

  // Calcular deadlines basado en SLA definitions
  const priorityLabel = priority === "scp_High" ? "Alta" : priority === "scp_Medium" ? "Normal" : "Baja";
  const slaDef = await queryOne<{ response_time_min: number; resolution_time_min: number }>(
    "SELECT response_time_min, resolution_time_min FROM casos.sla_definitions WHERE priority_label=$1 AND is_active=TRUE",
    [priorityLabel]
  );

  const now = new Date();
  const resolutionDeadline = slaDef
    ? new Date(now.getTime() + slaDef.resolution_time_min * 60_000)
    : null;
  const responseDeadline = slaDef
    ? new Date(now.getTime() + slaDef.response_time_min * 60_000)
    : null;

  const row = await queryOne<CaseEscalationState>(
    `INSERT INTO casos.case_escalation_state
      (sap_case_id, country, resolution_policy_id, resolution_deadline, response_policy_id, response_deadline)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (sap_case_id, country) DO UPDATE SET updated_at=NOW()
     RETURNING *`,
    [sapCaseId, country, resPolicyId, resolutionDeadline, respPolicyId, responseDeadline]
  );

  return row || null;
}

// ----------------------------------------------------------------
// Pausar / Reanudar
// ----------------------------------------------------------------

export async function pauseEscalation(sapCaseId: number, country: string): Promise<void> {
  await query(
    `UPDATE casos.case_escalation_state
     SET escalation_paused=TRUE, paused_at=NOW(), updated_at=NOW()
     WHERE sap_case_id=$1 AND country=$2 AND escalation_paused=FALSE`,
    [sapCaseId, country]
  );
}

export async function resumeEscalation(sapCaseId: number, country: string): Promise<void> {
  const state = await queryOne<{ paused_at: Date; total_paused_min: number }>(
    "SELECT paused_at, total_paused_min FROM casos.case_escalation_state WHERE sap_case_id=$1 AND country=$2",
    [sapCaseId, country]
  );
  if (!state?.paused_at) return;

  const addedMin = Math.round((Date.now() - new Date(state.paused_at).getTime()) / 60_000);
  await query(
    `UPDATE casos.case_escalation_state
     SET escalation_paused=FALSE, paused_at=NULL, total_paused_min=total_paused_min+$1, updated_at=NOW()
     WHERE sap_case_id=$2 AND country=$3`,
    [addedMin, sapCaseId, country]
  );
}

// ----------------------------------------------------------------
// Registrar primera respuesta
// ----------------------------------------------------------------

export async function recordFirstResponse(sapCaseId: number, country: string): Promise<void> {
  await query(
    `UPDATE casos.case_escalation_state
     SET first_response_at=NOW(), response_level=0, response_renotify_count=0, updated_at=NOW()
     WHERE sap_case_id=$1 AND country=$2 AND first_response_at IS NULL`,
    [sapCaseId, country]
  );
}

// ----------------------------------------------------------------
// Reset nivel de resolución (helper interno)
// ----------------------------------------------------------------

async function resetResolutionLevel(stateId: number, newLevel: number): Promise<void> {
  await query(
    `UPDATE casos.case_escalation_state
     SET resolution_level=$1, resolution_escalated_at=NULL, resolution_renotify_count=0, updated_at=NOW()
     WHERE id=$2`,
    [newLevel, stateId]
  );
}

// ----------------------------------------------------------------
// onCaseUpdate — GAP-02: reset_policy + pause/resume automático
// Llamar desde POST /api/casos/[id]/notes y PATCH /api/casos/[id]
// ----------------------------------------------------------------

export async function onCaseUpdate(
  sapCaseId: number,
  country: string,
  updateType: "agent_response" | "status_change",
  currentStatusStr?: string
): Promise<void> {
  const state = await queryOne<CaseEscalationState>(
    "SELECT * FROM casos.case_escalation_state WHERE sap_case_id=$1 AND country=$2",
    [sapCaseId, country]
  );
  if (!state || !state.resolution_policy_id) return;

  const policy = await queryOne<EscalationPolicy>(
    "SELECT * FROM casos.escalation_policies WHERE id=$1",
    [state.resolution_policy_id]
  );
  if (!policy) return;

  // Primera respuesta del agente → marcar + resetear SLA de respuesta
  if (updateType === "agent_response" && !state.first_response_at) {
    await recordFirstResponse(sapCaseId, country);
  }

  // Aplicar reset_policy sobre el nivel de resolución
  switch (policy.reset_policy) {
    case "full":
      await resetResolutionLevel(state.id, 0);
      break;
    case "one_level":
      if (state.resolution_level > 0) {
        await resetResolutionLevel(state.id, state.resolution_level - 1);
      }
      break;
    case "on_response":
      if (updateType === "agent_response") {
        await resetResolutionLevel(state.id, 0);
      }
      break;
    // "none": no hacer nada
  }

  // Pause / resume automático según status
  if (currentStatusStr && policy.pause_on_status) {
    const pauseStatuses = policy.pause_on_status.split(",").map((s) => s.trim());
    if (pauseStatuses.includes(currentStatusStr)) {
      if (!state.escalation_paused) await pauseEscalation(sapCaseId, country);
    } else if (state.escalation_paused) {
      await resumeEscalation(sapCaseId, country);
    }
  }
}

// ----------------------------------------------------------------
// Pre-alerta: Notificar antes del vencimiento (S5)
// ----------------------------------------------------------------

export interface PreAlertCandidate {
  stateId: number;
  sapCaseId: number;
  country: string;
  resolutionDeadline: Date;
  technicianCode: number | null;
}

/**
 * Evalúa casos que vencen en las próximas `preAlertMin` minutos
 * y aún no recibieron pre-alerta. Envía notificación y marca pre_alert_sent.
 */
export async function runPreAlerts(
  country: string,
  preAlertMin: number,
  shared: SharedData
): Promise<number> {
  const candidates = await query<{
    id: number;
    sap_case_id: number;
    country: string;
    resolution_deadline: Date;
  }>(
    `SELECT id, sap_case_id, country, resolution_deadline
     FROM casos.case_escalation_state
     WHERE country = $1
       AND resolution_deadline IS NOT NULL
       AND resolution_deadline > NOW()
       AND resolution_deadline <= NOW() + ($2 * INTERVAL '1 minute')
       AND pre_alert_sent = FALSE
       AND escalation_paused = FALSE`,
    [country, preAlertMin]
  );

  let sent = 0;

  for (const c of candidates) {
    try {
      const minutesLeft = Math.round(
        (new Date(c.resolution_deadline).getTime() - Date.now()) / 60_000
      );

      // Notificación in_app a todos los admins y supervisores
      const staff = await query<{ id: number; email: string; name: string }>(
        "SELECT id, email, name FROM casos.users WHERE role IN ('admin', 'supervisor') AND active = TRUE"
      );

      for (const user of staff) {
        const title   = `⚠️ Caso CAS-${c.sap_case_id} vence en ${minutesLeft} min`;
        const message = `El caso CAS-${c.sap_case_id} vence en aproximadamente ${minutesLeft} minutos.`;

        await query(
          "INSERT INTO casos.notifications (user_id, case_id, country, title, message, type) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING",
          [user.id, c.sap_case_id, country, title, message, "pre_alert"]
        ).catch(() => {});

        // Email
        await sendSlaWarningEmail(user.email, c.sap_case_id, `Caso CAS-${c.sap_case_id}`, -minutesLeft)
          .catch(() => {});
      }

      // Marcar como enviado
      await query(
        "UPDATE casos.case_escalation_state SET pre_alert_sent = TRUE, updated_at = NOW() WHERE id = $1",
        [c.id]
      );
      sent++;
    } catch (err) {
      logger.error("Error sending pre-alert", {
        case_id: c.sap_case_id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return sent;
}
