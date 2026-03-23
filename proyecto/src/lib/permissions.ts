import { query } from "./db";

interface PermissionRow {
  module: string;
  enabled: boolean;
}

// Cache per role with stale-while-revalidate
let cache: Record<string, Record<string, boolean>> = {};
let cacheTime = 0;
let cachePromise: Promise<Record<string, Record<string, boolean>>> | null = null;
const CACHE_TTL = 60_000;

const ALL_MODULES = [
  "dashboard",
  "casos",
  "estadisticas",
  "alertas",
  "conocimiento",
  "usuarios",
  "configuracion",
  "exportar",
];

const MODULE_LABELS: Record<string, string> = {
  dashboard: "Panel",
  casos: "Casos",
  estadisticas: "Estadísticas",
  alertas: "SLA & Alertas",
  conocimiento: "Base de Conocimiento",
  usuarios: "Usuarios",
  configuracion: "Configuración",
  exportar: "Exportar CSV",
};

export { ALL_MODULES, MODULE_LABELS };

async function loadAll(): Promise<Record<string, Record<string, boolean>>> {
  if (Date.now() - cacheTime < CACHE_TTL && Object.keys(cache).length > 0) return cache;
  if (cachePromise) return cachePromise;
  cachePromise = (async () => {
    try {
      const rows = await query<{ role: string; module: string; enabled: boolean }>(
        "SELECT role, module, enabled FROM casos.role_permissions"
      );
      const map: Record<string, Record<string, boolean>> = {};
      for (const row of rows) {
        if (!map[row.role]) map[row.role] = {};
        map[row.role][row.module] = row.enabled;
      }
      cache = map;
      cacheTime = Date.now();
      return map;
    } catch (e) {
      console.error("Error loading permissions:", e);
      return {};
    } finally {
      cachePromise = null;
    }
  })();
  return cachePromise;
}

export async function getPermissionsForRole(role: string): Promise<Record<string, boolean>> {
  const all = await loadAll();
  return all[role] || {};
}

export async function getAllPermissions(): Promise<Record<string, Record<string, boolean>>> {
  return loadAll();
}

export async function setPermission(role: string, module: string, enabled: boolean): Promise<void> {
  await query(
    "INSERT INTO casos.role_permissions (role, module, enabled) VALUES ($1, $2, $3) ON CONFLICT (role, module) DO UPDATE SET enabled = $3, updated_at = NOW()",
    [role, module, enabled]
  );
  cache = {};
  cacheTime = 0;
}

export async function canAccess(role: string, module: string): Promise<boolean> {
  const perms = await getPermissionsForRole(role);
  return perms[module] === true;
}
