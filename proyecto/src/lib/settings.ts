import { query } from "./db";
import { encrypt, decrypt, isEncrypted } from "./crypto";

interface SettingRow {
  key: string;
  value: unknown;
}

// In-memory cache with stale-while-revalidate
let cache: Record<string, unknown> = {};
let cacheTime = 0;
let cachePromise: Promise<Record<string, unknown>> | null = null;
const CACHE_TTL = 60_000;

const DEFAULTS: Record<string, unknown> = {
  smtp_host: "smtp.gmail.com",
  smtp_port: 587,
  smtp_user: "",
  smtp_pass: "",
  smtp_from: "STIA Casos <casos@stia.com>",
  portal_base_url: "https://casos.stia.net",
  auto_email_on_create: true,
  auto_email_on_assign: true,
  auto_email_on_status_change: true,
  auto_email_on_resolve: true,
  auto_email_on_external_note: true,
  auto_escalation_enabled: true,
  escalation_interval_minutes: 30,
  dropdown_canal: JSON.stringify(["Correo electrónico", "Llamada", "Redes Sociales", "Sitio Web", "Visita/ Reunión", "WhatsApp"]),
  dropdown_tipo_caso: JSON.stringify(["Vendedor no responde", "Pedido retrasado", "Servicio Técnico", "Error en despacho", "Facturación/ Cobros", "Garantía", "Servicio al cliente", "Otro"]),
  dropdown_area: JSON.stringify(["Ventas", "Servicio técnico", "Logística", "Repuestos", "Contabilidad", "Almacén"]),
  dropdown_tiempo_estimado: JSON.stringify(["24 horas", "48 horas", "72 horas", "1 semana", "2 semanas", "1 mes"]),
  ad_auth_enabled: false,
};

export const SETTING_LABELS: Record<string, { label: string; category: string; type: string }> = {
  smtp_host: { label: "Servidor SMTP", category: "email", type: "text" },
  smtp_port: { label: "Puerto SMTP", category: "email", type: "number" },
  smtp_user: { label: "Usuario SMTP", category: "email", type: "text" },
  smtp_pass: { label: "Contrasena SMTP", category: "email", type: "password" },
  smtp_from: { label: "Remitente", category: "email", type: "text" },
  portal_base_url: { label: "URL base del portal", category: "general", type: "text" },
  auto_email_on_create: { label: "Email al crear caso", category: "automatizacion", type: "boolean" },
  auto_email_on_assign: { label: "Email al asignar tecnico", category: "automatizacion", type: "boolean" },
  auto_email_on_status_change: { label: "Email al cambiar estado", category: "automatizacion", type: "boolean" },
  auto_email_on_resolve: { label: "Email + CSAT al resolver", category: "automatizacion", type: "boolean" },
  auto_email_on_external_note: { label: "Email al agregar nota externa", category: "automatizacion", type: "boolean" },
  auto_escalation_enabled: { label: "Escalamiento automatico SLA", category: "automatizacion", type: "boolean" },
  escalation_interval_minutes: { label: "Intervalo escalamiento (min)", category: "automatizacion", type: "number" },
  dropdown_canal: { label: "Opciones de Canal", category: "dropdowns", type: "json_array" },
  dropdown_tipo_caso: { label: "Opciones de Tipo de Caso", category: "dropdowns", type: "json_array" },
  dropdown_area: { label: "Opciones de Área", category: "dropdowns", type: "json_array" },
  dropdown_tiempo_estimado: { label: "Opciones de Tiempo Estimado", category: "dropdowns", type: "json_array" },
  ad_auth_enabled: { label: "Autenticacion con Active Directory", category: "active_directory", type: "boolean" },
};

async function loadAll(): Promise<Record<string, unknown>> {
  if (Date.now() - cacheTime < CACHE_TTL && Object.keys(cache).length > 0) return cache;
  // Lock: reuse in-flight promise to prevent duplicate queries
  if (cachePromise) return cachePromise;
  cachePromise = (async () => {
    try {
      const rows = await query<SettingRow>("SELECT key, value FROM casos.settings");
      const map: Record<string, unknown> = { ...DEFAULTS };
      for (const row of rows) {
        map[row.key] = row.value;
      }
      cache = map;
      cacheTime = Date.now();
      return map;
    } catch (e) {
      console.error("Error loading settings:", e);
      return { ...DEFAULTS };
    } finally {
      cachePromise = null;
    }
  })();
  return cachePromise;
}

const ENCRYPTED_KEYS = new Set(["smtp_pass"]);

export async function getSetting<T = unknown>(key: string): Promise<T> {
  const all = await loadAll();
  let value = (all[key] ?? DEFAULTS[key]) as T;
  // Auto-decrypt encrypted settings
  if (ENCRYPTED_KEYS.has(key) && typeof value === "string" && isEncrypted(value)) {
    value = decrypt(value) as T;
  }
  return value;
}

export async function getAllSettings(): Promise<Record<string, unknown>> {
  return loadAll();
}

export async function setSetting(key: string, value: unknown, userId?: number): Promise<void> {
  // Auto-encrypt sensitive settings
  let storeValue = value;
  if (ENCRYPTED_KEYS.has(key) && typeof value === "string" && value && !isEncrypted(value)) {
    storeValue = encrypt(value);
  }
  await query(
    "INSERT INTO casos.settings (key, value, updated_by) VALUES ($1, $2, $3) ON CONFLICT (key) DO UPDATE SET value = $2, updated_by = $3, updated_at = NOW()",
    [key, JSON.stringify(storeValue), userId || null]
  );
  // Invalidate cache
  cache = {};
  cacheTime = 0;
}

export async function isEnabled(key: string): Promise<boolean> {
  const val = await getSetting<boolean>(key);
  return val === true;
}

export interface DropdownOptions {
  canal: string[];
  tipo_caso: string[];
  area: string[];
  tiempo_estimado: string[];
}

function parseJsonArray(raw: unknown): string[] | null {
  if (Array.isArray(raw) && raw.every((v) => typeof v === "string")) return raw as string[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((v) => typeof v === "string")) return parsed;
    } catch { /* invalid JSON */ }
  }
  return null;
}

export async function getDropdownOptions(): Promise<DropdownOptions> {
  const all = await loadAll();
  return {
    canal: parseJsonArray(all.dropdown_canal) ?? parseJsonArray(DEFAULTS.dropdown_canal) ?? [],
    tipo_caso: parseJsonArray(all.dropdown_tipo_caso) ?? parseJsonArray(DEFAULTS.dropdown_tipo_caso) ?? [],
    area: parseJsonArray(all.dropdown_area) ?? parseJsonArray(DEFAULTS.dropdown_area) ?? [],
    tiempo_estimado: parseJsonArray(all.dropdown_tiempo_estimado) ?? parseJsonArray(DEFAULTS.dropdown_tiempo_estimado) ?? [],
  };
}
