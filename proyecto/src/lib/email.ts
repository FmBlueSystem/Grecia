import nodemailer from "nodemailer";
import { getSetting } from "./settings";
import { escapeHtml } from "./security";

let cachedTransporter: nodemailer.Transporter | null = null;
let transporterCreatedAt = 0;
const TRANSPORT_TTL = 5 * 60 * 1000; // 5 min

async function getTransporter() {
  const now = Date.now();
  if (cachedTransporter && (now - transporterCreatedAt) < TRANSPORT_TTL) {
    return cachedTransporter;
  }

  const host = await getSetting<string>("smtp_host") || process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(await getSetting<number>("smtp_port")) || Number(process.env.SMTP_PORT) || 587;
  const user = await getSetting<string>("smtp_user") || process.env.SMTP_USER || "";
  const pass = await getSetting<string>("smtp_pass") || process.env.SMTP_PASS || "";

  cachedTransporter = nodemailer.createTransport({ host, port, secure: false, auth: { user, pass } });
  transporterCreatedAt = now;
  return cachedTransporter;
}

async function getFrom(): Promise<string> {
  return await getSetting<string>("smtp_from") || process.env.SMTP_FROM || "STIA Casos <casos@stia.com>";
}

async function getBaseUrl(): Promise<string> {
  return await getSetting<string>("portal_base_url") || "https://casos.stia.net";
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const transporter = await getTransporter();
    // Check if SMTP is configured by inspecting transporter auth
    const auth = (transporter.options as Record<string, unknown>).auth as { user?: string } | undefined;
    if (!auth?.user) {
      console.warn("SMTP not configured, skipping email to:", to);
      return false;
    }
    const from = await getFrom();
    await transporter.sendMail({ from, to, subject, html });
    return true;
  } catch (e) {
    console.error("Email error:", e);
    return false;
  }
}

function header(title: string, bgColor = "#0067B2"): string {
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
    <div style="background:${bgColor};padding:20px;color:white;text-align:center">
      <h2 style="margin:0">${escapeHtml(title)}</h2>
    </div>
    <div style="padding:20px;border:1px solid #e5e7eb;border-top:none">`;
}

function footer(): string {
  return `</div>
    <div style="padding:10px 20px;background:#f8fafc;text-align:center;font-size:12px;color:#64748b">Portal de Servicio STIA</div>
  </div>`;
}

function row(label: string, value: string, color?: string): string {
  const style = color ? `color:${color};font-weight:bold` : "";
  return `<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold">${escapeHtml(label)}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;${style}">${escapeHtml(value)}</td></tr>`;
}

function btn(href: string, text: string, bgColor = "#0067B2"): string {
  return `<a href="${href}" style="display:inline-block;background:${bgColor};color:white;padding:10px 20px;text-decoration:none;border-radius:5px">${escapeHtml(text)}</a>`;
}

function table(rows: string): string {
  return `<table style="width:100%;border-collapse:collapse;margin:15px 0">${rows}</table>`;
}

export interface CaseAssignedEmailData {
  collaboratorName: string;
  caseId: number;
  subject: string;
  customerName: string;
  priority: string;
  area: string;
  canal: string;
  creationDate: string;
  description?: string;
}

export async function sendCaseAssignedEmail(to: string, data: CaseAssignedEmailData): Promise<boolean> {
  const base = await getBaseUrl();
  const priorityColor: Record<string, string> = { Alta: "#dc2626", Normal: "#f59e0b", Baja: "#16a34a" };
  const pColor = priorityColor[data.priority] || "#0067B2";
  const priorityBadge = `<span style="display:inline-block;background:${pColor};color:white;font-size:11px;font-weight:bold;padding:2px 8px;border-radius:12px;letter-spacing:0.5px">${escapeHtml(data.priority.toUpperCase())}</span>`;

  const descExcerpt = data.description
    ? `<div style="background:#f8fafc;padding:14px 16px;border-radius:6px;border-left:3px solid #0067B2;margin:16px 0">
        <p style="margin:0;font-size:13px;color:#374151;white-space:pre-wrap">${escapeHtml(data.description.slice(0, 300))}${data.description.length > 300 ? "…" : ""}</p>
       </div>`
    : "";

  const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f1f5f9;padding:24px">
  <div style="background:#0067B2;padding:20px 24px;border-radius:8px 8px 0 0;display:flex;align-items:center">
    <div>
      <p style="margin:0;color:rgba(255,255,255,0.75);font-size:12px;letter-spacing:1px;text-transform:uppercase">STIA — Portal de Servicio</p>
      <h2 style="margin:4px 0 0;color:white;font-size:20px">Nuevo caso asignado</h2>
    </div>
  </div>
  <div style="background:white;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
    <p style="margin:0 0 20px;font-size:15px;color:#1e293b">Hola <strong>${escapeHtml(data.collaboratorName)}</strong>,</p>
    <p style="margin:0 0 20px;font-size:14px;color:#475569">Se te ha asignado el siguiente caso. Por favor revísalo y actualiza su estado a la brevedad.</p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
        <span style="font-size:22px;font-weight:bold;color:#0067B2">#${data.caseId}</span>
        ${priorityBadge}
      </div>
      <p style="margin:0 0 16px;font-size:15px;font-weight:bold;color:#1e293b">${escapeHtml(data.subject)}</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr>
          <td style="padding:6px 0;color:#64748b;width:110px">Cliente</td>
          <td style="padding:6px 0;color:#1e293b;font-weight:500">${escapeHtml(data.customerName)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#64748b">Área</td>
          <td style="padding:6px 0;color:#1e293b;font-weight:500">${escapeHtml(data.area)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#64748b">Canal</td>
          <td style="padding:6px 0;color:#1e293b;font-weight:500">${escapeHtml(data.canal)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#64748b">Creado</td>
          <td style="padding:6px 0;color:#1e293b;font-weight:500">${escapeHtml(data.creationDate)}</td>
        </tr>
      </table>
    </div>

    ${descExcerpt}

    <div style="text-align:center;margin:24px 0 8px">
      <a href="${base}/casos/${data.caseId}" style="display:inline-block;background:#0067B2;color:white;padding:12px 32px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px">Ver Caso #${data.caseId} →</a>
    </div>
  </div>
  <p style="text-align:center;font-size:11px;color:#94a3b8;margin:12px 0 0">Portal de Servicio STIA · casos.stia.net</p>
</div>`;

  return sendEmail(to, `[Caso #${data.caseId}] Asignado: ${data.subject}`, html);
}

// ----------------------------------------------------------------
// SLA — interfaces compartidas
// ----------------------------------------------------------------

export interface SlaEmailData {
  caseId: number;
  subject: string;
  customerName?: string;
  area?: string;
  priority?: string;
  currentStatus?: string;
  /** Para warning: minutos/horas restantes (positivo). Para exceeded: minutos/horas excedidos (positivo). */
  hours: number;
  deadlineLabel?: string;
  /** Nombre del colaborador asignado (para emails de supervisor / asignador) */
  collaboratorName?: string;
  /** Fecha en que se asignó (para email del asignador) */
  assignedDateLabel?: string;
}

// ----------------------------------------------------------------
// SLA Warning — próximo a vencer
// ----------------------------------------------------------------

/** Al colaborador asignado */
export async function sendSlaWarningEmail(to: string, caseIdOrData: number | SlaEmailData, subject?: string, hoursRemaining?: number): Promise<boolean> {
  const base = await getBaseUrl();

  // Compatibilidad hacia atrás con firma (to, caseId, subject, hoursRemaining)
  const d: SlaEmailData = typeof caseIdOrData === "number"
    ? { caseId: caseIdOrData, subject: subject || "", hours: hoursRemaining || 0 }
    : caseIdOrData;

  const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f1f5f9;padding:24px">
  <div style="background:#f59e0b;padding:20px 24px;border-radius:8px 8px 0 0">
    <p style="margin:0;color:rgba(255,255,255,0.85);font-size:11px;letter-spacing:1px;text-transform:uppercase">STIA — Portal de Servicio</p>
    <h2 style="margin:4px 0 0;color:white;font-size:19px">⏰ Tu caso vence en ${d.hours}h</h2>
  </div>
  <div style="background:white;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
    <p style="margin:0 0 20px;font-size:14px;color:#475569">El siguiente caso asignado a ti está próximo a exceder su tiempo de atención acordado.</p>
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:20px;margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="font-size:20px;font-weight:bold;color:#0067B2">#${d.caseId}</span>
        <span style="background:#f59e0b;color:white;font-size:11px;font-weight:bold;padding:2px 8px;border-radius:12px">SLA EN RIESGO</span>
      </div>
      <p style="margin:0 0 14px;font-size:14px;font-weight:bold;color:#1e293b">${escapeHtml(d.subject)}</p>
      <table style="width:100%;font-size:13px;border-collapse:collapse">
        ${d.customerName ? `<tr><td style="padding:4px 0;color:#64748b;width:130px">Cliente</td><td style="color:#1e293b;font-weight:500">${escapeHtml(d.customerName)}</td></tr>` : ""}
        ${d.area ? `<tr><td style="padding:4px 0;color:#64748b">Área</td><td style="color:#1e293b;font-weight:500">${escapeHtml(d.area)}</td></tr>` : ""}
        ${d.priority ? `<tr><td style="padding:4px 0;color:#64748b">Prioridad</td><td style="color:#dc2626;font-weight:bold">${escapeHtml(d.priority.toUpperCase())}</td></tr>` : ""}
        <tr><td style="padding:4px 0;color:#64748b">Tiempo restante</td><td style="color:#b45309;font-weight:bold">⏳ ${d.hours}h</td></tr>
        ${d.deadlineLabel ? `<tr><td style="padding:4px 0;color:#64748b">Vence</td><td style="color:#b45309;font-weight:bold">${escapeHtml(d.deadlineLabel)}</td></tr>` : ""}
      </table>
    </div>
    <div style="background:#fff7ed;padding:12px 16px;border-radius:6px;border-left:3px solid #f59e0b;margin-bottom:20px">
      <p style="margin:0;font-size:13px;color:#92400e">Si no es posible resolver el caso antes del vencimiento, actualiza el sub-estado o coordina con tu supervisor.</p>
    </div>
    <div style="text-align:center">
      <a href="${base}/casos/${d.caseId}" style="display:inline-block;background:#f59e0b;color:white;padding:12px 32px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px">Atender Caso #${d.caseId} →</a>
    </div>
  </div>
  <p style="text-align:center;font-size:11px;color:#94a3b8;margin:12px 0 0">Portal de Servicio STIA · casos.stia.net</p>
</div>`;

  return sendEmail(to, `[Caso #${d.caseId}] SLA en riesgo — vence en ${d.hours}h`, html);
}

/** Al jefe / supervisor de área */
export async function sendSlaWarningSupervisorEmail(to: string, data: SlaEmailData): Promise<boolean> {
  const base = await getBaseUrl();
  const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f1f5f9;padding:24px">
  <div style="background:#dc2626;padding:20px 24px;border-radius:8px 8px 0 0">
    <p style="margin:0;color:rgba(255,255,255,0.85);font-size:11px;letter-spacing:1px;text-transform:uppercase">STIA — Portal de Servicio</p>
    <h2 style="margin:4px 0 0;color:white;font-size:19px">🚨 Caso en riesgo de vencer${data.area ? ` — ${data.area}` : ""}</h2>
  </div>
  <div style="background:white;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
    <p style="margin:0 0 20px;font-size:14px;color:#475569">Un caso asignado a tu área está próximo a exceder el SLA acordado y requiere tu atención.</p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:20px;margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="font-size:20px;font-weight:bold;color:#0067B2">#${data.caseId}</span>
        <span style="background:#dc2626;color:white;font-size:11px;font-weight:bold;padding:2px 8px;border-radius:12px">ALTA PRIORIDAD</span>
      </div>
      <p style="margin:0 0 14px;font-size:14px;font-weight:bold;color:#1e293b">${escapeHtml(data.subject)}</p>
      <table style="width:100%;font-size:13px;border-collapse:collapse">
        ${data.customerName ? `<tr><td style="padding:4px 0;color:#64748b;width:130px">Cliente</td><td style="color:#1e293b;font-weight:500">${escapeHtml(data.customerName)}</td></tr>` : ""}
        ${data.collaboratorName ? `<tr><td style="padding:4px 0;color:#64748b">Colaborador</td><td style="color:#1e293b;font-weight:500">${escapeHtml(data.collaboratorName)}</td></tr>` : ""}
        ${data.area ? `<tr><td style="padding:4px 0;color:#64748b">Área</td><td style="color:#1e293b;font-weight:500">${escapeHtml(data.area)}</td></tr>` : ""}
        ${data.currentStatus ? `<tr><td style="padding:4px 0;color:#64748b">Estado actual</td><td style="color:#f59e0b;font-weight:bold">${escapeHtml(data.currentStatus)}</td></tr>` : ""}
        <tr><td style="padding:4px 0;color:#64748b">Tiempo restante</td><td style="color:#dc2626;font-weight:bold">⏳ ${data.hours}h</td></tr>
      </table>
    </div>
    <div style="background:#fef2f2;padding:12px 16px;border-radius:6px;border-left:3px solid #dc2626;margin-bottom:20px">
      <p style="margin:0;font-size:13px;color:#991b1b">Si el colaborador asignado no puede resolverlo a tiempo, considera reasignarlo o tomar acción directa.</p>
    </div>
    <div style="text-align:center">
      <a href="${base}/casos/${data.caseId}" style="display:inline-block;background:#dc2626;color:white;padding:12px 32px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px">Ver Caso #${data.caseId} →</a>
    </div>
  </div>
  <p style="text-align:center;font-size:11px;color:#94a3b8;margin:12px 0 0">Portal de Servicio STIA · casos.stia.net</p>
</div>`;

  return sendEmail(to, `[Caso #${data.caseId}] Riesgo SLA — ${data.area || "tu área"}`, html);
}

/** A quien asignó el caso */
export async function sendSlaWarningAssignorEmail(to: string, data: SlaEmailData): Promise<boolean> {
  const base = await getBaseUrl();
  const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f1f5f9;padding:24px">
  <div style="background:#7c3aed;padding:20px 24px;border-radius:8px 8px 0 0">
    <p style="margin:0;color:rgba(255,255,255,0.85);font-size:11px;letter-spacing:1px;text-transform:uppercase">STIA — Portal de Servicio</p>
    <h2 style="margin:4px 0 0;color:white;font-size:19px">📋 Caso que asignaste está próximo a vencer</h2>
  </div>
  <div style="background:white;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
    <p style="margin:0 0 20px;font-size:14px;color:#475569">Un caso que asignaste${data.collaboratorName ? ` a <strong>${escapeHtml(data.collaboratorName)}</strong>` : ""} está próximo a exceder su tiempo de atención.</p>
    <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:8px;padding:20px;margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="font-size:20px;font-weight:bold;color:#0067B2">#${data.caseId}</span>
        <span style="background:#7c3aed;color:white;font-size:11px;font-weight:bold;padding:2px 8px;border-radius:12px">SEGUIMIENTO</span>
      </div>
      <p style="margin:0 0 14px;font-size:14px;font-weight:bold;color:#1e293b">${escapeHtml(data.subject)}</p>
      <table style="width:100%;font-size:13px;border-collapse:collapse">
        ${data.customerName ? `<tr><td style="padding:4px 0;color:#64748b;width:130px">Cliente</td><td style="color:#1e293b;font-weight:500">${escapeHtml(data.customerName)}</td></tr>` : ""}
        ${data.collaboratorName ? `<tr><td style="padding:4px 0;color:#64748b">Asignado a</td><td style="color:#1e293b;font-weight:500">${escapeHtml(data.collaboratorName)}</td></tr>` : ""}
        ${data.area ? `<tr><td style="padding:4px 0;color:#64748b">Área</td><td style="color:#1e293b;font-weight:500">${escapeHtml(data.area)}</td></tr>` : ""}
        ${data.assignedDateLabel ? `<tr><td style="padding:4px 0;color:#64748b">Asignado el</td><td style="color:#1e293b;font-weight:500">${escapeHtml(data.assignedDateLabel)}</td></tr>` : ""}
        <tr><td style="padding:4px 0;color:#64748b">Tiempo restante</td><td style="color:#7c3aed;font-weight:bold">⏳ ${data.hours}h</td></tr>
      </table>
    </div>
    <div style="background:#faf5ff;padding:12px 16px;border-radius:6px;border-left:3px solid #7c3aed;margin-bottom:20px">
      <p style="margin:0;font-size:13px;color:#5b21b6">Puedes${data.collaboratorName ? ` contactar a ${escapeHtml(data.collaboratorName)} directamente o` : ""} reasignar el caso si consideras necesario.</p>
    </div>
    <div style="text-align:center">
      <a href="${base}/casos/${data.caseId}" style="display:inline-block;background:#7c3aed;color:white;padding:12px 32px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px">Ver Caso #${data.caseId} →</a>
    </div>
  </div>
  <p style="text-align:center;font-size:11px;color:#94a3b8;margin:12px 0 0">Portal de Servicio STIA · casos.stia.net</p>
</div>`;

  return sendEmail(to, `[Caso #${data.caseId}] El caso que asignaste va a vencer`, html);
}

// ----------------------------------------------------------------
// SLA Exceeded — caso vencido
// ----------------------------------------------------------------

/** Al colaborador asignado */
export async function sendSlaExceededEmail(to: string, caseIdOrData: number | SlaEmailData, subject?: string, hoursExceeded?: number): Promise<boolean> {
  const base = await getBaseUrl();

  const d: SlaEmailData = typeof caseIdOrData === "number"
    ? { caseId: caseIdOrData, subject: subject || "", hours: hoursExceeded || 0 }
    : caseIdOrData;

  const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f1f5f9;padding:24px">
  <div style="background:#7f1d1d;padding:20px 24px;border-radius:8px 8px 0 0">
    <p style="margin:0;color:rgba(255,255,255,0.75);font-size:11px;letter-spacing:1px;text-transform:uppercase">STIA — Portal de Servicio</p>
    <h2 style="margin:4px 0 0;color:white;font-size:19px">🔴 Tu caso ha vencido</h2>
  </div>
  <div style="background:white;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
    <p style="margin:0 0 20px;font-size:14px;color:#475569">El siguiente caso ha excedido su tiempo de atención acordado y requiere acción inmediata.</p>
    <div style="background:#fef2f2;border:2px solid #dc2626;border-radius:8px;padding:20px;margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="font-size:20px;font-weight:bold;color:#0067B2">#${d.caseId}</span>
        <span style="background:#7f1d1d;color:white;font-size:11px;font-weight:bold;padding:2px 8px;border-radius:12px">SLA VENCIDO</span>
      </div>
      <p style="margin:0 0 14px;font-size:14px;font-weight:bold;color:#1e293b">${escapeHtml(d.subject)}</p>
      <table style="width:100%;font-size:13px;border-collapse:collapse">
        ${d.customerName ? `<tr><td style="padding:4px 0;color:#64748b;width:130px">Cliente</td><td style="color:#1e293b;font-weight:500">${escapeHtml(d.customerName)}</td></tr>` : ""}
        ${d.area ? `<tr><td style="padding:4px 0;color:#64748b">Área</td><td style="color:#1e293b;font-weight:500">${escapeHtml(d.area)}</td></tr>` : ""}
        ${d.priority ? `<tr><td style="padding:4px 0;color:#64748b">Prioridad</td><td style="color:#dc2626;font-weight:bold">${escapeHtml(d.priority.toUpperCase())}</td></tr>` : ""}
        ${d.deadlineLabel ? `<tr><td style="padding:4px 0;color:#64748b">Venció el</td><td style="color:#dc2626;font-weight:bold">${escapeHtml(d.deadlineLabel)}</td></tr>` : ""}
        <tr><td style="padding:4px 0;color:#64748b">Excedido por</td><td style="color:#7f1d1d;font-weight:bold">🔴 ${d.hours}h</td></tr>
      </table>
    </div>
    <div style="background:#fef2f2;padding:12px 16px;border-radius:6px;border-left:3px solid #dc2626;margin-bottom:20px">
      <p style="margin:0;font-size:13px;color:#991b1b"><strong>Acción requerida:</strong> Actualiza el estado del caso o comunícate con tu supervisor. Este incumplimiento quedará registrado en el historial.</p>
    </div>
    <div style="text-align:center">
      <a href="${base}/casos/${d.caseId}" style="display:inline-block;background:#7f1d1d;color:white;padding:12px 32px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px">Atender Caso #${d.caseId} ahora →</a>
    </div>
  </div>
  <p style="text-align:center;font-size:11px;color:#94a3b8;margin:12px 0 0">Portal de Servicio STIA · casos.stia.net</p>
</div>`;

  return sendEmail(to, `[Caso #${d.caseId}] SLA VENCIDO — excedido por ${d.hours}h`, html);
}

/** Al jefe / supervisor de área */
export async function sendSlaExceededSupervisorEmail(to: string, data: SlaEmailData): Promise<boolean> {
  const base = await getBaseUrl();
  const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f1f5f9;padding:24px">
  <div style="background:#7f1d1d;padding:20px 24px;border-radius:8px 8px 0 0">
    <p style="margin:0;color:rgba(255,255,255,0.75);font-size:11px;letter-spacing:1px;text-transform:uppercase">STIA — Portal de Servicio</p>
    <h2 style="margin:4px 0 0;color:white;font-size:19px">🔴 SLA excedido${data.area ? ` — ${data.area}` : ""}</h2>
  </div>
  <div style="background:white;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
    <p style="margin:0 0 20px;font-size:14px;color:#475569">Un caso de tu área ha excedido el SLA acordado. Se requiere tu intervención.</p>
    <div style="background:#fef2f2;border:2px solid #dc2626;border-radius:8px;padding:20px;margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="font-size:20px;font-weight:bold;color:#0067B2">#${data.caseId}</span>
        <span style="background:#7f1d1d;color:white;font-size:11px;font-weight:bold;padding:2px 8px;border-radius:12px">SLA VENCIDO</span>
      </div>
      <p style="margin:0 0 14px;font-size:14px;font-weight:bold;color:#1e293b">${escapeHtml(data.subject)}</p>
      <table style="width:100%;font-size:13px;border-collapse:collapse">
        ${data.customerName ? `<tr><td style="padding:4px 0;color:#64748b;width:130px">Cliente</td><td style="color:#1e293b;font-weight:500">${escapeHtml(data.customerName)}</td></tr>` : ""}
        ${data.collaboratorName ? `<tr><td style="padding:4px 0;color:#64748b">Colaborador</td><td style="color:#1e293b;font-weight:500">${escapeHtml(data.collaboratorName)}</td></tr>` : ""}
        ${data.area ? `<tr><td style="padding:4px 0;color:#64748b">Área</td><td style="color:#1e293b;font-weight:500">${escapeHtml(data.area)}</td></tr>` : ""}
        ${data.currentStatus ? `<tr><td style="padding:4px 0;color:#64748b">Estado actual</td><td style="color:#f59e0b;font-weight:bold">${escapeHtml(data.currentStatus)}</td></tr>` : ""}
        ${data.deadlineLabel ? `<tr><td style="padding:4px 0;color:#64748b">Venció el</td><td style="color:#dc2626;font-weight:bold">${escapeHtml(data.deadlineLabel)}</td></tr>` : ""}
        <tr><td style="padding:4px 0;color:#64748b">Excedido por</td><td style="color:#7f1d1d;font-weight:bold">🔴 ${data.hours}h</td></tr>
      </table>
    </div>
    <div style="background:#fef2f2;padding:12px 16px;border-radius:6px;border-left:3px solid #dc2626;margin-bottom:20px">
      <p style="margin:0;font-size:13px;color:#991b1b"><strong>Se recomienda:</strong> Revisar el caso, reasignarlo o escalar internamente. Este incumplimiento quedará registrado en el historial de métricas del área.</p>
    </div>
    <div style="text-align:center">
      <a href="${base}/casos/${data.caseId}" style="display:inline-block;background:#7f1d1d;color:white;padding:12px 32px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px">Ver Caso #${data.caseId} →</a>
    </div>
  </div>
  <p style="text-align:center;font-size:11px;color:#94a3b8;margin:12px 0 0">Portal de Servicio STIA · casos.stia.net</p>
</div>`;

  return sendEmail(to, `[Caso #${data.caseId}] SLA EXCEDIDO — intervención requerida`, html);
}

/** A quien asignó el caso */
export async function sendSlaExceededAssignorEmail(to: string, data: SlaEmailData): Promise<boolean> {
  const base = await getBaseUrl();
  const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f1f5f9;padding:24px">
  <div style="background:#7f1d1d;padding:20px 24px;border-radius:8px 8px 0 0">
    <p style="margin:0;color:rgba(255,255,255,0.75);font-size:11px;letter-spacing:1px;text-transform:uppercase">STIA — Portal de Servicio</p>
    <h2 style="margin:4px 0 0;color:white;font-size:19px">🔴 El caso que asignaste ha vencido</h2>
  </div>
  <div style="background:white;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
    <p style="margin:0 0 20px;font-size:14px;color:#475569">Un caso que asignaste${data.collaboratorName ? ` a <strong>${escapeHtml(data.collaboratorName)}</strong>` : ""} ha excedido su tiempo de atención acordado.</p>
    <div style="background:#fef2f2;border:2px solid #dc2626;border-radius:8px;padding:20px;margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="font-size:20px;font-weight:bold;color:#0067B2">#${data.caseId}</span>
        <span style="background:#7f1d1d;color:white;font-size:11px;font-weight:bold;padding:2px 8px;border-radius:12px">SLA VENCIDO</span>
      </div>
      <p style="margin:0 0 14px;font-size:14px;font-weight:bold;color:#1e293b">${escapeHtml(data.subject)}</p>
      <table style="width:100%;font-size:13px;border-collapse:collapse">
        ${data.customerName ? `<tr><td style="padding:4px 0;color:#64748b;width:130px">Cliente</td><td style="color:#1e293b;font-weight:500">${escapeHtml(data.customerName)}</td></tr>` : ""}
        ${data.collaboratorName ? `<tr><td style="padding:4px 0;color:#64748b">Asignado a</td><td style="color:#1e293b;font-weight:500">${escapeHtml(data.collaboratorName)}</td></tr>` : ""}
        ${data.area ? `<tr><td style="padding:4px 0;color:#64748b">Área</td><td style="color:#1e293b;font-weight:500">${escapeHtml(data.area)}</td></tr>` : ""}
        ${data.assignedDateLabel ? `<tr><td style="padding:4px 0;color:#64748b">Asignado el</td><td style="color:#1e293b;font-weight:500">${escapeHtml(data.assignedDateLabel)}</td></tr>` : ""}
        ${data.deadlineLabel ? `<tr><td style="padding:4px 0;color:#64748b">Venció el</td><td style="color:#dc2626;font-weight:bold">${escapeHtml(data.deadlineLabel)}</td></tr>` : ""}
        <tr><td style="padding:4px 0;color:#64748b">Excedido por</td><td style="color:#7f1d1d;font-weight:bold">🔴 ${data.hours}h</td></tr>
      </table>
    </div>
    <div style="background:#fef2f2;padding:12px 16px;border-radius:6px;border-left:3px solid #dc2626;margin-bottom:20px">
      <p style="margin:0;font-size:13px;color:#991b1b">Considera reasignar el caso${data.collaboratorName ? ` o contactar directamente a ${escapeHtml(data.collaboratorName)}` : ""} para resolver la situación.</p>
    </div>
    <div style="text-align:center">
      <a href="${base}/casos/${data.caseId}" style="display:inline-block;background:#7f1d1d;color:white;padding:12px 32px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px">Ver Caso #${data.caseId} →</a>
    </div>
  </div>
  <p style="text-align:center;font-size:11px;color:#94a3b8;margin:12px 0 0">Portal de Servicio STIA · casos.stia.net</p>
</div>`;

  return sendEmail(to, `[Caso #${data.caseId}] El caso que asignaste ha vencido`, html);
}

export async function sendEscalationAdminEmail(
  to: string,
  caseId: number,
  subject: string,
  level: number,
  hoursExceeded: number,
  area: string,
  country: string,
): Promise<boolean> {
  const base = await getBaseUrl();
  const levelLabel = level === 3 ? "Nivel 3 - Gerencia" : `Nivel ${level}`;
  return sendEmail(to, `ESCALAMIENTO ${levelLabel} - Caso #${caseId}`, `
    ${header(`Escalamiento ${levelLabel}`, "#7c2d12")}
      <p style="color:#7c2d12;font-weight:bold">El caso #${caseId} ha sido escalado a ${levelLabel}.</p>
      ${table(
        row("Caso", `#${caseId}`) +
        row("Asunto", subject) +
        row("Area", area) +
        row("Pais", country) +
        row("SLA excedido por", `${hoursExceeded}h`, "#dc2626") +
        row("Nivel", levelLabel, "#7c2d12")
      )}
      <p>Se requiere atencion inmediata de la gerencia.</p>
      ${btn(`${base}/casos/${caseId}`, "Ver Caso", "#7c2d12")}
    ${footer()}
  `);
}

export async function sendPasswordResetEmail(to: string, name: string, token: string): Promise<boolean> {
  const base = await getBaseUrl();
  return sendEmail(to, "Restablecer contrasena - STIA Casos", `
    ${header("STIA Casos")}
      <p>Hola ${escapeHtml(name)},</p>
      <p>Se ha solicitado restablecer su contrasena. Haga click en el siguiente enlace:</p>
      <div style="text-align:center;margin:20px 0">
        ${btn(`${base}/reset-password?token=${encodeURIComponent(token)}`, "Restablecer Contrasena")}
      </div>
      <p style="font-size:13px;color:#64748b">Este enlace expira en 1 hora. Si no solicito este cambio, ignore este correo.</p>
    ${footer()}
  `);
}

export async function sendCaseCreatedEmail(to: string, caseId: number, subject: string): Promise<boolean> {
  const base = await getBaseUrl();
  return sendEmail(to, `Caso #${caseId} registrado - STIA`, `
    ${header("STIA Casos")}
      <p>Su caso de servicio ha sido registrado exitosamente.</p>
      ${table(row("Caso", `#${caseId}`) + row("Asunto", subject))}
      <p style="font-size:13px;color:#64748b">Nuestro equipo atendera su solicitud a la brevedad.</p>
      ${btn(`${base}/casos/${caseId}`, "Ver Caso")}
    ${footer()}
  `);
}

export async function sendStatusChangeEmail(to: string, caseId: number, subject: string, newStatus: string): Promise<boolean> {
  const base = await getBaseUrl();
  const colors: Record<string, string> = { "En Proceso": "#f59e0b", "Resuelto": "#16a34a", "Abierto": "#3b82f6" };
  const color = colors[newStatus] || "#0067B2";
  return sendEmail(to, `Caso #${caseId} - ${escapeHtml(newStatus)}`, `
    ${header(`Caso ${escapeHtml(newStatus)}`, color)}
      <p>El estado de su caso ha sido actualizado:</p>
      ${table(row("Caso", `#${caseId}`) + row("Asunto", subject) + row("Nuevo estado", newStatus, color))}
      ${btn(`${base}/casos/${caseId}`, "Ver Caso")}
    ${footer()}
  `);
}

export async function sendExternalNoteEmail(to: string, caseId: number, subject: string, noteContent: string, authorName: string): Promise<boolean> {
  const base = await getBaseUrl();
  return sendEmail(to, `Nueva actualizacion en Caso #${caseId}`, `
    ${header("Actualizacion de Caso")}
      <p>Se ha agregado una nueva nota a su caso:</p>
      ${table(row("Caso", `#${caseId} - ${subject}`) + row("De", authorName))}
      <div style="background:#f8fafc;padding:15px;border-radius:5px;border-left:3px solid #0067B2;margin:15px 0">
        <p style="margin:0;white-space:pre-wrap">${escapeHtml(noteContent)}</p>
      </div>
      ${btn(`${base}/casos/${caseId}`, "Ver Caso")}
    ${footer()}
  `);
}

export async function sendCaseResolvedEmail(to: string, caseId: number, subject: string, csatToken: string): Promise<boolean> {
  const base = await getBaseUrl();
  return sendEmail(to, `Caso #${caseId} resuelto - STIA`, `
    ${header("Caso Resuelto", "#16a34a")}
      <p>El caso de servicio <strong>#${caseId}</strong> ha sido resuelto.</p>
      <p><strong>Asunto:</strong> ${escapeHtml(subject)}</p>
      <p>Nos gustaria conocer su opinion sobre el servicio recibido:</p>
      <div style="text-align:center;margin:20px 0">
        ${btn(`${base}/encuesta?token=${encodeURIComponent(csatToken)}`, "Calificar Servicio", "#16a34a")}
      </div>
    ${footer()}
  `);
}
