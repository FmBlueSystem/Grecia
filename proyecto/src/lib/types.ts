export interface SapServiceCall {
  ServiceCallID: number;
  Subject: string;
  CustomerCode: string;
  CustomerName: string;
  ContactCode: number;
  Status: number; // -3=Abierto, -2=Pendiente, -1=Cerrado
  Priority: string; // scp_Low, scp_Medium, scp_High
  Origin: number; // -3=Email, -2=Phone, -1=Web
  CallType: number;
  Description: string;
  Resolution: string | null;
  CreationDate: string;
  ClosingDate: string | null;
  AssigneeCode: number;
  TechnicianCode: number;
  BPPhone1: string | null;
  BPeMail: string | null;
  BPContactPerson: string | null;
  U_Canal: string | null;
  U_TipoCaso: string | null;
  U_Area: string | null;
  U_TiempoEst: string | null;
  U_ContactTel: string | null;
  U_ContactEmail: string | null;
  U_SubEstado: string | null;
  // S6: IME — Campos del vendedor/cliente
  U_IME_Producto: string | null;
  U_IME_CodMaterial: string | null;
  U_IME_Lote: string | null;
  U_IME_Factura: string | null;
  U_IME_CantInicial: number | null;
  U_IME_CantReclamo: number | null;
  U_IME_ReportadoPor: string | null;
  // S6: IME — Campos de Calidad
  U_IME_CnsecSGI: string | null;
  U_IME_CausaReclamo: string | null;
  U_IME_PlanAccion: string | null;
  U_IME_AccionCorrectiva: string | null;
  U_IME_GestionadoPor: string | null;
  U_IME_VerificadoPor: string | null;
  U_IME_FechaVerif: string | null;
  U_IME_Retroalim: string | null;
  U_IME_VentasResp: string | null;
  ServiceCallActivities?: SapServiceCallActivity[];
}

export interface SapServiceCallActivity {
  LineNum: number;
  ActivityCode: number;
}

export interface CasoListItem {
  id: number;
  subject: string;
  customerCode: string;
  customerName: string;
  status: number;
  statusLabel: string;
  priority: string;
  priorityLabel: string;
  canal: string;
  tipoCaso: string;
  area: string;
  tiempoEstimado: string;
  creationDate: string;
  closingDate: string | null;
}

export interface CasoDetail extends CasoListItem {
  description: string;
  resolution: string | null;
  contactPerson: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  assigneeCode: number;
  technicianCode: number;
  origin: number;
  subEstado: string | null;
  portalUser: string | null;
  assignedUser: { name: string; email: string } | null;
  // S6: IME
  imeProducto: string | null;
  imeCodMaterial: string | null;
  imeLote: string | null;
  imeFactura: string | null;
  imeCantInicial: number | null;
  imeCantReclamo: number | null;
  imeReportadoPor: string | null;
  imeCnsecSGI: string | null;
  imeCausaReclamo: string | null;
  imePlanAccion: string | null;
  imeAccionCorrectiva: string | null;
  imeGestionadoPor: string | null;
  imeVerificadoPor: string | null;
  imeFechaVerif: string | null;
  imeRetroalim: string | null;
  imeVentasResp: string | null;
}

export interface CreateCasoPayload {
  subject: string;
  customerCode: string;
  description: string;
  priority: string;
  canal: string;
  tipoCaso: string;
  area: string;
  tiempoEstimado: string;
  contactCode?: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  technicianCode?: number;
  // S6: IME (campos del vendedor)
  imeProducto?: string;
  imeCodMaterial?: string;
  imeLote?: string;
  imeFactura?: string;
  imeCantInicial?: number;
  imeCantReclamo?: number;
  imeReportadoPor?: string;
}

export interface UpdateCasoPayload {
  subject?: string;
  description?: string;
  resolution?: string;
  status?: number;
  priority?: string;
  canal?: string;
  tipoCaso?: string;
  area?: string;
  tiempoEstimado?: string;
  contactPhone?: string;
  contactEmail?: string;
  technicianCode?: number;
  subEstado?: string | null;
  // S6: IME — vendedor
  imeProducto?: string;
  imeCodMaterial?: string;
  imeLote?: string;
  imeFactura?: string;
  imeCantInicial?: number;
  imeCantReclamo?: number;
  imeReportadoPor?: string;
  // S6: IME — calidad
  imeCnsecSGI?: string;
  imeCausaReclamo?: string;
  imePlanAccion?: string;
  imeAccionCorrectiva?: string;
  imeGestionadoPor?: string;
  imeVerificadoPor?: string;
  imeFechaVerif?: string;
  imeRetroalim?: string;
  imeVentasResp?: string;
}

// SAP Priority mapping
export const SAP_PRIORITY_MAP: Record<string, string> = {
  scp_Low: "Baja",
  scp_Medium: "Normal",
  scp_High: "Alta",
};

export const PRIORITY_TO_SAP: Record<string, string> = {
  Baja: "scp_Low",
  Normal: "scp_Medium",
  Alta: "scp_High",
};
