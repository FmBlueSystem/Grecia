import { sapFetch } from "./sap-client";
import { query, queryOne } from "./db";
import { STATUS_LABELS } from "./constants";
import { sanitizeODataString, sanitizeODataDate } from "./security";
import type { CountryCode } from "./constants";
import type {
  SapServiceCall,
  CasoListItem,
  CasoDetail,
  CreateCasoPayload,
  UpdateCasoPayload,
} from "./types";

const PRIORITY_LABELS: Record<string, string> = {
  scp_Low: "Baja",
  scp_Medium: "Normal",
  scp_High: "Alta",
};

const PRIORITY_SAP: Record<string, string> = {
  Baja: "scp_Low",
  Normal: "scp_Medium",
  Alta: "scp_High",
};

function toListItem(sc: SapServiceCall): CasoListItem {
  return {
    id: sc.ServiceCallID,
    subject: sc.Subject || "",
    customerCode: sc.CustomerCode || "",
    customerName: sc.CustomerName || "",
    status: sc.Status,
    statusLabel: STATUS_LABELS[sc.Status] || `Estado ${sc.Status}`,
    priority: sc.Priority || "scp_Medium",
    priorityLabel: PRIORITY_LABELS[sc.Priority] || "Normal",
    canal: sc.U_Canal || "",
    tipoCaso: sc.U_TipoCaso || "",
    area: sc.U_Area || "",
    tiempoEstimado: sc.U_TiempoEst || "",
    creationDate: sc.CreationDate,
    closingDate: sc.ClosingDate,
  };
}

function toDetail(sc: SapServiceCall): CasoDetail {
  return {
    ...toListItem(sc),
    description: sc.Description || "",
    resolution: sc.Resolution,
    contactPerson: sc.BPContactPerson,
    contactPhone: sc.U_ContactTel || sc.BPPhone1,
    contactEmail: sc.U_ContactEmail || sc.BPeMail,
    assigneeCode: sc.AssigneeCode,
    technicianCode: sc.TechnicianCode,
    origin: sc.Origin,
    // Campos extra — se llenan desde PG via mergeExtraFields
    subEstado: null,
    portalUser: null,
    assignedUser: null,
    imeProducto: null,
    imeCodMaterial: null,
    imeLote: null,
    imeFactura: null,
    imeCantInicial: null,
    imeCantReclamo: null,
    imeReportadoPor: null,
    imeCnsecSGI: null,
    imeCausaReclamo: null,
    imePlanAccion: null,
    imeAccionCorrectiva: null,
    imeGestionadoPor: null,
    imeVerificadoPor: null,
    imeFechaVerif: null,
    imeRetroalim: null,
    imeVentasResp: null,
  };
}

const LIST_FIELDS = [
  "ServiceCallID",
  "Subject",
  "CustomerCode",
  "CustomerName",
  "Status",
  "Priority",
  "CreationDate",
  "ClosingDate",
  "U_Canal",
  "U_TipoCaso",
  "U_Area",
  "U_TiempoEst",
].join(",");

// Campos SAP puro (sin UDFs custom que pueden no existir)
const DETAIL_FIELDS = [
  LIST_FIELDS,
  "Description",
  "Resolution",
  "BPContactPerson",
  "BPPhone1",
  "BPeMail",
  "U_ContactTel",
  "U_ContactEmail",
  "AssigneeCode",
  "TechnicianCode",
  "Origin",
].join(",");

// ----------------------------------------------------------------
// PostgreSQL — campos extra (antes UDFs SAP)
// ----------------------------------------------------------------

interface CaseExtraRow {
  sub_estado: string | null;
  portal_user: string | null;
  ime_producto: string | null;
  ime_cod_material: string | null;
  ime_lote: string | null;
  ime_factura: string | null;
  ime_cant_inicial: number | null;
  ime_cant_reclamo: number | null;
  ime_reportado_por: string | null;
  ime_cnsec_sgi: string | null;
  ime_causa_reclamo: string | null;
  ime_plan_accion: string | null;
  ime_accion_correctiva: string | null;
  ime_gestionado_por: string | null;
  ime_verificado_por: string | null;
  ime_fecha_verif: string | null;
  ime_retroalim: string | null;
  ime_ventas_resp: string | null;
}

// Mapeo camelCase → columna PG
const EXTRA_FIELD_COLS: Record<string, string> = {
  subEstado:          "sub_estado",
  portalUser:         "portal_user",
  imeProducto:        "ime_producto",
  imeCodMaterial:     "ime_cod_material",
  imeLote:            "ime_lote",
  imeFactura:         "ime_factura",
  imeCantInicial:     "ime_cant_inicial",
  imeCantReclamo:     "ime_cant_reclamo",
  imeReportadoPor:    "ime_reportado_por",
  imeCnsecSGI:        "ime_cnsec_sgi",
  imeCausaReclamo:    "ime_causa_reclamo",
  imePlanAccion:      "ime_plan_accion",
  imeAccionCorrectiva:"ime_accion_correctiva",
  imeGestionadoPor:   "ime_gestionado_por",
  imeVerificadoPor:   "ime_verificado_por",
  imeFechaVerif:      "ime_fecha_verif",
  imeRetroalim:       "ime_retroalim",
  imeVentasResp:      "ime_ventas_resp",
};

async function getCaseExtraFields(country: CountryCode, serviceCallId: number): Promise<CaseExtraRow | null> {
  return queryOne<CaseExtraRow>(
    "SELECT * FROM casos.case_extra_fields WHERE service_call_id = $1 AND country = $2",
    [serviceCallId, country]
  );
}

export async function upsertCaseExtraFields(
  country: CountryCode,
  serviceCallId: number,
  payload: Record<string, unknown>
): Promise<void> {
  const cols: string[] = [];
  const vals: unknown[] = [serviceCallId, country];

  for (const [key, col] of Object.entries(EXTRA_FIELD_COLS)) {
    if (payload[key] !== undefined) {
      cols.push(col);
      vals.push(payload[key] ?? null);
    }
  }

  if (cols.length === 0) return;

  const insertCols = ["service_call_id", "country", ...cols].join(", ");
  const insertVals = ["$1", "$2", ...cols.map((_, i) => `$${i + 3}`)].join(", ");
  const updateSet  = cols.map((c, i) => `${c} = $${i + 3}`).join(", ");

  await query(
    `INSERT INTO casos.case_extra_fields (${insertCols})
     VALUES (${insertVals})
     ON CONFLICT (service_call_id, country) DO UPDATE SET ${updateSet}, updated_at = NOW()`,
    vals
  );
}

function mergeExtraFields(detail: CasoDetail, extra: CaseExtraRow): void {
  detail.subEstado          = extra.sub_estado;
  detail.portalUser         = extra.portal_user;
  detail.imeProducto        = extra.ime_producto;
  detail.imeCodMaterial     = extra.ime_cod_material;
  detail.imeLote            = extra.ime_lote;
  detail.imeFactura         = extra.ime_factura;
  detail.imeCantInicial     = extra.ime_cant_inicial;
  detail.imeCantReclamo     = extra.ime_cant_reclamo;
  detail.imeReportadoPor    = extra.ime_reportado_por;
  detail.imeCnsecSGI        = extra.ime_cnsec_sgi;
  detail.imeCausaReclamo    = extra.ime_causa_reclamo;
  detail.imePlanAccion      = extra.ime_plan_accion;
  detail.imeAccionCorrectiva= extra.ime_accion_correctiva;
  detail.imeGestionadoPor   = extra.ime_gestionado_por;
  detail.imeVerificadoPor   = extra.ime_verificado_por;
  detail.imeFechaVerif      = extra.ime_fecha_verif;
  detail.imeRetroalim       = extra.ime_retroalim;
  detail.imeVentasResp      = extra.ime_ventas_resp;
}

export async function listCasos(
  country: CountryCode,
  options?: {
    status?: number;
    skip?: number;
    top?: number;
    search?: string;
    technicianCode?: number;
    priority?: string;
    canal?: string;
    tipoCaso?: string;
    area?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<{ items: CasoListItem[]; count: number }> {
  const top = options?.top || 20;
  const skip = options?.skip || 0;

  const filters: string[] = [];
  if (options?.status !== undefined) {
    filters.push(`Status eq ${options.status}`);
  }
  if (options?.search) {
    const s = sanitizeODataString(options.search);
    filters.push(`(contains(Subject,'${s}') or contains(CustomerName,'${s}'))`);
  }
  if (options?.technicianCode !== undefined) {
    filters.push(`TechnicianCode eq ${Number(options.technicianCode) || 0}`);
  }
  if (options?.priority) {
    const sapPriority = PRIORITY_SAP[options.priority];
    if (sapPriority) filters.push(`Priority eq '${sapPriority}'`);
  }
  if (options?.canal) {
    filters.push(`U_Canal eq '${sanitizeODataString(options.canal)}'`);
  }
  if (options?.tipoCaso) {
    filters.push(`U_TipoCaso eq '${sanitizeODataString(options.tipoCaso)}'`);
  }
  if (options?.area) {
    filters.push(`U_Area eq '${sanitizeODataString(options.area)}'`);
  }
  if (options?.dateFrom) {
    const d = sanitizeODataDate(options.dateFrom);
    if (d) filters.push(`CreationDate ge '${d}'`);
  }
  if (options?.dateTo) {
    const d = sanitizeODataDate(options.dateTo);
    if (d) filters.push(`CreationDate le '${d}'`);
  }

  const params: Record<string, string> = {
    $select: LIST_FIELDS,
    $orderby: "ServiceCallID desc",
    $top: String(top),
    $skip: String(skip),
    $inlinecount: "allpages",
  };

  if (filters.length > 0) {
    params.$filter = filters.join(" and ");
  }

  const data = await sapFetch<{ value: SapServiceCall[]; "odata.count": string }>(
    country,
    "/ServiceCalls",
    { params }
  );

  return {
    items: data.value.map(toListItem),
    count: parseInt(data["odata.count"] || "0", 10),
  };
}

export async function getCaso(country: CountryCode, id: number): Promise<CasoDetail | null> {
  try {
    const [sc, extra, assignment] = await Promise.all([
      sapFetch<SapServiceCall>(country, `/ServiceCalls(${id})`, {
        params: { $select: DETAIL_FIELDS },
      }).catch(() =>
        // Fallback si U_ContactTel/U_ContactEmail no existen en SAP
        sapFetch<SapServiceCall>(country, `/ServiceCalls(${id})`, {
          params: { $select: LIST_FIELDS + ",Description,Resolution,BPContactPerson,BPPhone1,BPeMail,AssigneeCode,TechnicianCode,Origin" },
        })
      ),
      getCaseExtraFields(country, id),
      queryOne<{ name: string; email: string }>(
        `SELECT u.name, u.email
         FROM casos.case_assignments ca
         JOIN casos.users u ON u.id = ca.user_id
         WHERE ca.service_call_id = $1 AND ca.country = $2
         ORDER BY ca.assigned_at DESC LIMIT 1`,
        [id, country]
      ).catch(() => null),
    ]);
    const detail = toDetail(sc);
    if (extra) mergeExtraFields(detail, extra);
    if (assignment) detail.assignedUser = assignment;
    return detail;
  } catch {
    return null;
  }
}

/**
 * Creates a new contact in a Business Partner's ContactEmployees list.
 * Returns the InternalCode of the new contact, or null on failure.
 */
async function createBPContact(
  country: CountryCode,
  customerCode: string,
  name: string,
  phone?: string,
  email?: string
): Promise<number | null> {
  try {
    const contactEntry: Record<string, string> = { Name: name };
    if (phone) contactEntry.Phone1 = phone;
    if (email) contactEntry.E_Mail = email;

    await sapFetch(country, `/BusinessPartners('${customerCode}')`, {
      method: "PATCH",
      body: { ContactEmployees: [contactEntry] },
    });

    // Fetch the BP contacts to find the InternalCode of the new contact
    const data = await sapFetch<{ ContactEmployees?: Array<{ InternalCode: number; Name: string }> }>(
      country,
      `/BusinessPartners('${customerCode}')`,
      { params: { $select: "ContactEmployees" } }
    );

    const contacts = data.ContactEmployees || [];
    // Find the newly added contact — highest InternalCode among entries with matching name
    const matching = contacts
      .filter((c) => c.Name === name)
      .sort((a, b) => b.InternalCode - a.InternalCode);

    return matching[0]?.InternalCode ?? null;
  } catch (e) {
    console.error("Error creating BP contact in SAP:", e);
    return null;
  }
}

export async function createCaso(
  country: CountryCode,
  payload: CreateCasoPayload
): Promise<{ id: number }> {
  // If new contact (no contactCode), create it in SAP BP first
  let resolvedContactCode = payload.contactCode;
  if (!resolvedContactCode && payload.contactName && payload.customerCode) {
    const newCode = await createBPContact(
      country,
      payload.customerCode,
      payload.contactName,
      payload.contactPhone,
      payload.contactEmail
    );
    if (newCode) resolvedContactCode = newCode;
  }

  const body: Record<string, unknown> = {
    Subject: payload.subject,
    CustomerCode: payload.customerCode,
    Description: payload.description,
    Priority: PRIORITY_SAP[payload.priority] || "scp_Medium",
    Status: -3, // Abierto
    U_Canal: payload.canal,
    U_TipoCaso: payload.tipoCaso,
    U_Area: payload.area,
    U_TiempoEst: payload.tiempoEstimado,
  };
  if (resolvedContactCode) body.ContactCode = resolvedContactCode;
  if (payload.contactName) body.BPContactPerson = payload.contactName;
  if (payload.contactPhone) body.U_ContactTel = payload.contactPhone;
  if (payload.contactEmail) body.U_ContactEmail = payload.contactEmail;
  if (payload.technicianCode) body.TechnicianCode = payload.technicianCode;
  // Nota: campos IME y subEstado se guardan en PostgreSQL (case_extra_fields), no en SAP

  const result = await sapFetch<SapServiceCall>(country, "/ServiceCalls", {
    method: "POST",
    body,
  });

  return { id: result.ServiceCallID };
}

export async function getEmployeeInfo(country: CountryCode, employeeId: number): Promise<{ email: string; name: string } | null> {
  try {
    const emp = await sapFetch<{ eMail: string; FirstName: string; LastName: string }>(
      country,
      `/EmployeesInfo(${employeeId})`,
      { params: { $select: "eMail,FirstName,LastName" } }
    );
    if (!emp.eMail) return null;
    return {
      email: emp.eMail,
      name: [emp.FirstName, emp.LastName].filter(Boolean).join(" ") || emp.eMail,
    };
  } catch {
    return null;
  }
}

/** @deprecated Use getEmployeeInfo */
export async function getEmployeeEmail(country: CountryCode, employeeId: number): Promise<string | null> {
  return getEmployeeInfo(country, employeeId).then((r) => r?.email ?? null);
}

export async function updateCaso(
  country: CountryCode,
  id: number,
  payload: UpdateCasoPayload
): Promise<void> {
  const body: Record<string, unknown> = {};

  if (payload.subject !== undefined) body.Subject = payload.subject;
  if (payload.description !== undefined) body.Description = payload.description;
  if (payload.resolution !== undefined) body.Resolution = payload.resolution;
  if (payload.status !== undefined) body.Status = payload.status;
  if (payload.priority !== undefined) body.Priority = PRIORITY_SAP[payload.priority] || payload.priority;
  if (payload.canal !== undefined) body.U_Canal = payload.canal;
  if (payload.tipoCaso !== undefined) body.U_TipoCaso = payload.tipoCaso;
  if (payload.area !== undefined) body.U_Area = payload.area;
  if (payload.tiempoEstimado !== undefined) body.U_TiempoEst = payload.tiempoEstimado;
  if (payload.contactPhone !== undefined) body.U_ContactTel = payload.contactPhone;
  if (payload.contactEmail !== undefined) body.U_ContactEmail = payload.contactEmail;
  if (payload.technicianCode !== undefined) body.TechnicianCode = payload.technicianCode;
  // Nota: subEstado y campos IME se guardan en PostgreSQL via upsertCaseExtraFields

  await sapFetch(country, `/ServiceCalls(${id})`, {
    method: "PATCH",
    body,
  });
}
