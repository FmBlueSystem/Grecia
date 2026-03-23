import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateCaso } from "@/lib/casos";
import { query, queryOne } from "@/lib/db";
import { TIEMPO_TO_HOURS } from "@/lib/sla";
import type { CountryCode } from "@/lib/constants";

/**
 * POST /api/casos/[id]/extend
 * Body: { nuevoTiempoEstimado: string, country?: string }
 *
 * 1. Actualiza U_TiempoEst en SAP
 * 2. Recalcula resolution_deadline en case_escalation_state
 *    (desde NOW() + horas del nuevo tiempo estimado)
 * 3. Si el caso tenía nivel de escalamiento > 0, lo resetea a 0
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  // Solo admin y supervisor pueden extender
  if (!["admin", "supervisor"].includes(session.role || "")) {
    return NextResponse.json({ error: "Sin permisos para extender plazo" }, { status: 403 });
  }

  const { id } = await params;
  const casoId = parseInt(id, 10);
  const body = await request.json();
  const country = (body.country || session.country) as CountryCode;
  const nuevoTiempo: string = body.nuevoTiempoEstimado;

  if (!nuevoTiempo || !TIEMPO_TO_HOURS[nuevoTiempo]) {
    return NextResponse.json({ error: "Tiempo estimado inválido" }, { status: 400 });
  }

  try {
    // 1. Actualizar en SAP
    await updateCaso(country, casoId, { tiempoEstimado: nuevoTiempo });

    // 2. Calcular nuevo deadline: NOW() + horas del tiempo estimado
    const hoursToAdd = TIEMPO_TO_HOURS[nuevoTiempo];
    const newDeadline = new Date(Date.now() + horasToMin(hoursToAdd) * 60_000);

    // 3. Obtener política para saber si resetear nivel
    const state = await queryOne<{ id: number; resolution_policy_id: number | null; resolution_level: number }>(
      "SELECT id, resolution_policy_id, resolution_level FROM casos.case_escalation_state WHERE sap_case_id=$1 AND country=$2",
      [casoId, country]
    );

    if (state) {
      await query(
        `UPDATE casos.case_escalation_state
         SET resolution_deadline = $1,
             resolution_level = 0,
             resolution_escalated_at = NULL,
             resolution_renotify_count = 0,
             updated_at = NOW()
         WHERE id = $2`,
        [newDeadline, state.id]
      );
    }

    return NextResponse.json({
      success: true,
      newDeadline: newDeadline.toISOString(),
      previousLevel: state?.resolution_level ?? null,
    });
  } catch (e) {
    console.error("Error extending caso:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

function horasToMin(h: number): number {
  return h * 60;
}
