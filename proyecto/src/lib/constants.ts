export const SAP_DATABASES = {
  CR: { companyDb: "SBO_STIACR_PROD", name: "Costa Rica", prefix: "CAS-CR" },
  SV: { companyDb: "SBO_SV_STIA_FINAL", name: "El Salvador", prefix: "CAS-SV" },
  GT: { companyDb: "SBO_GT_STIA_PROD", name: "Guatemala", prefix: "CAS-GT" },
  HN: { companyDb: "SBO_HO_STIA_PROD", name: "Honduras", prefix: "CAS-HN" },
  PA: { companyDb: "SBO_PA_STIA_PROD", name: "Panama", prefix: "CAS-PA" },
} as const;

export type CountryCode = keyof typeof SAP_DATABASES;

export const DEFAULT_COUNTRY: CountryCode = "CR";

export const SAP_STATUS = {
  OPEN: -3,
  PENDING: -2,
  CLOSED: -1,
} as const;

export const STATUS_LABELS: Record<number, string> = {
  [-3]: "Abierto",
  [-2]: "En Proceso",
  [-1]: "Resuelto",
};

export const PRIORITY_OPTIONS = ["Alta", "Normal", "Baja"] as const;

// Legacy fallback — en runtime se usan las opciones configurables de casos.settings via useDropdownOptions()
export const CANAL_OPTIONS = [
  "Correo electrónico",
  "Llamada",
  "Redes Sociales",
  "Sitio Web",
  "Visita/ Reunión",
  "WhatsApp",
] as const;

export const TIPO_CASO_OPTIONS = [
  "Vendedor no responde",
  "Pedido retrasado",
  "Servicio Técnico",
  "Error en despacho",
  "Facturación/ Cobros",
  "Garantía",
  "Servicio al cliente",
  "Otro",
] as const;

export const AREA_OPTIONS = [
  "Ventas",
  "Servicio técnico",
  "Logística",
  "Repuestos",
  "Contabilidad",
  "Almacén",
] as const;

export const TIEMPO_ESTIMADO_OPTIONS = [
  "24 horas",
  "48 horas",
  "72 horas",
  "1 semana",
  "2 semanas",
  "1 mes",
] as const;

export const COOKIE_NAME = "stia-session";
export const SAP_SESSION_TIMEOUT_MS = 25 * 60 * 1000; // 25 min (refresh before 30 min SAP timeout)
