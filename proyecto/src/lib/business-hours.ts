/**
 * Cálculo de horas hábiles con soporte de feriados y excepciones.
 * Basado en la spec escalation_spec_v2.md §3.3
 */

export interface BusinessHours {
  id: number;
  country_code: string | null;
  timezone: string;
  workdays: string; // "1,2,3,4,5" — 1=Lun, 7=Dom
  start_time: string; // "08:00"
  end_time: string;   // "17:00"
}

export interface BusinessHoursException {
  exception_date: string; // "2026-12-25"
  is_working_day: boolean;
  start_time: string | null;
  end_time: string | null;
}

/** Convierte "HH:MM" a minutos desde medianoche */
function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Formatea Date como "YYYY-MM-DD" en zona horaria local (sin UTC drift) */
function toDateStr(d: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d);
}

/** Inicio del día siguiente a medianoche en la TZ dada */
function startOfNextDay(current: Date, tz: string): Date {
  const dateStr = toDateStr(current, tz);
  const [y, mo, da] = dateStr.split("-").map(Number);
  // Construir medianoche del día siguiente en TZ local
  const nextStr = `${y}-${String(mo).padStart(2, "0")}-${String(da + 1).padStart(2, "0")}`;
  return new Date(
    new Intl.DateTimeFormat("en-CA", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
      .format(new Date(`${nextStr}T00:00:00`))
  );
}

/** Combina fecha YYYY-MM-DD con hora HH:MM en la TZ indicada → Date UTC */
function combineDateTime(dateStr: string, timeStr: string, tz: string): Date {
  return new Date(
    new Date(`${dateStr}T${timeStr}:00`).toLocaleString("en-US", { timeZone: tz })
  );
}

/**
 * Calcula minutos hábiles entre `from` y `to` considerando:
 * - Horario laboral (start_time → end_time)
 * - Días laborables (workdays)
 * - Excepciones (feriados y días especiales con horario distinto)
 *
 * Si no hay bh configurado, retorna la diferencia bruta en minutos.
 */
export function calcBusinessMinutes(
  from: Date,
  to: Date,
  bh: BusinessHours | null,
  exceptions: BusinessHoursException[]
): number {
  if (!bh || from >= to) return Math.max(0, Math.round((to.getTime() - from.getTime()) / 60_000));

  const { timezone, workdays, start_time, end_time } = bh;
  const workdaySet = new Set(workdays.split(",").map(Number)); // ISO weekday: 1=Mon, 7=Sun
  const exMap = new Map(exceptions.map((e) => [e.exception_date, e]));

  let totalMin = 0;
  let cursor = new Date(from);

  while (cursor < to) {
    const dateStr = toDateStr(cursor, timezone);
    const ex = exMap.get(dateStr);

    // Determinar si es día laboral y cuál es el horario
    let dayStart: Date | null = null;
    let dayEnd: Date | null = null;

    if (ex) {
      if (!ex.is_working_day) {
        // Feriado: saltar al día siguiente
        cursor = new Date(dateStr + "T00:00:00");
        cursor.setDate(cursor.getDate() + 1);
        continue;
      }
      // Día especial con horario modificado
      dayStart = combineDateTime(dateStr, ex.start_time!, timezone);
      dayEnd   = combineDateTime(dateStr, ex.end_time!, timezone);
    } else {
      // Verificar si es día laboral normal (1=Lun … 7=Dom, ISO)
      const jsDay = new Date(dateStr).getDay(); // 0=Dom, 6=Sáb
      const isoDay = jsDay === 0 ? 7 : jsDay;
      if (!workdaySet.has(isoDay)) {
        cursor = new Date(dateStr + "T00:00:00");
        cursor.setDate(cursor.getDate() + 1);
        continue;
      }
      dayStart = combineDateTime(dateStr, start_time, timezone);
      dayEnd   = combineDateTime(dateStr, end_time, timezone);
    }

    const effectiveStart = cursor > dayStart ? cursor : dayStart;
    const effectiveEnd   = to < dayEnd ? to : dayEnd;

    if (effectiveStart < effectiveEnd) {
      totalMin += Math.round((effectiveEnd.getTime() - effectiveStart.getTime()) / 60_000);
    }

    // Avanzar al día siguiente
    cursor = new Date(dateStr + "T00:00:00");
    cursor.setDate(cursor.getDate() + 1);
  }

  return totalMin;
}
