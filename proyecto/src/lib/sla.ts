/**
 * SLA helpers compartidos.
 * Única fuente de verdad para TIEMPO_TO_HOURS y mapeo de prioridades SAP.
 */

export const TIEMPO_TO_HOURS: Record<string, number> = {
  "24 horas": 24,
  "48 horas": 48,
  "72 horas": 72,
  "1 semana": 168,
  "2 semanas": 336,
  "1 mes": 720,
};

const SAP_PRIORITY_MAP: Record<string, string> = {
  scp_High: "Alta",
  scp_Medium: "Normal",
  scp_Low: "Baja",
};

/** Convierte prioridad SAP (scp_High) a label portal (Alta) */
export function mapSapPriority(sapPriority: string): string {
  return SAP_PRIORITY_MAP[sapPriority] || "Normal";
}

/** Calcula estado SLA dado horas transcurridas y horas totales */
export function calcSlaStatus(hoursElapsed: number, slaHours: number): {
  percentUsed: number;
  hoursRemaining: number;
  slaStatus: "ok" | "warning" | "exceeded";
} {
  const percentUsed = Math.min((hoursElapsed / slaHours) * 100, 999);
  const hoursRemaining = slaHours - hoursElapsed;

  let slaStatus: "ok" | "warning" | "exceeded";
  if (hoursRemaining <= 0) {
    slaStatus = "exceeded";
  } else if (percentUsed >= 75) {
    slaStatus = "warning";
  } else {
    slaStatus = "ok";
  }

  return { percentUsed, hoursRemaining, slaStatus };
}
