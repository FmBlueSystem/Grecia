import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateCaso, getCaso } from "@/lib/casos";
import { query } from "@/lib/db";
import type { CountryCode } from "@/lib/constants";

const CALIDAD_ROLES = ["admin", "calidad"];

/** Genera consecutivo SGI: SGI-YYYY-NNNN */
async function nextSgiConsecutivo(): Promise<string> {
  const year = new Date().getFullYear();
  const key = `sgi_counter_${year}`;
  // Incrementar contador atomicamente en settings
  const row = await query<{ value: unknown }>(
    "SELECT value FROM casos.settings WHERE key = $1",
    [key]
  );
  const current = row[0] ? Number(row[0].value) : 0;
  const next = current + 1;
  await query(
    "INSERT INTO casos.settings (key, value) VALUES ($1, $2::text::jsonb) ON CONFLICT (key) DO UPDATE SET value = $2::text::jsonb, updated_at = NOW()",
    [key, String(next)]
  );
  return `SGI-${year}-${String(next).padStart(4, "0")}`;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (!CALIDAD_ROLES.includes(session.role || "")) {
    return NextResponse.json({ error: "Solo rol Calidad o Admin puede guardar esta sección" }, { status: 403 });
  }

  const { id } = await params;
  const casoId = parseInt(id, 10);
  const body = await request.json();
  const country = (body.country || session.country) as CountryCode;

  // Obtener caso actual para verificar si ya tiene SGI
  const caso = await getCaso(country, casoId);
  if (!caso) return NextResponse.json({ error: "Caso no encontrado" }, { status: 404 });

  // Generar SGI si es la primera vez que se guarda calidad
  let sgiConsecutivo = caso.imeCnsecSGI;
  if (!sgiConsecutivo) {
    sgiConsecutivo = await nextSgiConsecutivo();
  }

  try {
    await updateCaso(country, casoId, {
      imeCnsecSGI: sgiConsecutivo,
      imeCausaReclamo: body.causaReclamo,
      imePlanAccion: body.planAccion,
      imeAccionCorrectiva: body.accionCorrectiva,
      imeGestionadoPor: body.gestionadoPor,
      imeVerificadoPor: body.verificadoPor,
      imeFechaVerif: body.fechaVerif,
      imeRetroalim: body.retroalim,
      imeVentasResp: body.ventasResp,
    });

    return NextResponse.json({ success: true, sgiConsecutivo });
  } catch (e) {
    console.error("Error saving calidad:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
