import { NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import * as XLSX from "xlsx";

interface DeptRow {
  id: number;
  name: string;
  country: string;
}

export async function GET() {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const depts = await query<DeptRow>(
    "SELECT id, name, country FROM casos.departments WHERE active = true ORDER BY country, name"
  );

  const wb = XLSX.utils.book_new();

  // --- Sheet 1: Template ---
  const headers = [
    "Nombre Completo",
    "Departamento",
    "Correo",
    "Rol",
    "Paises (acceso)",
    "Password",
    "ID Empleado SAP",
  ];

  const example = [
    "Juan Pérez",
    depts[0]?.name ?? "Soporte Técnico",
    "jperez@stia.net",
    "agente",
    "CR,GT",
    "Temporal123@",
    "456",
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, example]);

  // Column widths
  ws["!cols"] = [
    { wch: 28 },
    { wch: 26 },
    { wch: 30 },
    { wch: 14 },
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Usuarios");

  // --- Sheet 2: Referencia ---
  const ref: (string | number)[][] = [
    ["ROLES VÁLIDOS", "", "PAÍSES VÁLIDOS", "", "DEPARTAMENTOS DISPONIBLES", ""],
    ["agente", "", "CR", "Costa Rica", "", ""],
    ["colaborador", "", "SV", "El Salvador", "", ""],
    ["supervisor", "", "GT", "Guatemala", "", ""],
    ["admin", "", "HN", "Honduras", "", ""],
    ["", "", "PA", "Panamá", "", ""],
    ["", "", "", "", "", ""],
    ["NOTAS", "", "", "", "", ""],
    ["- Paises: separados por coma, ej: CR,GT,HN", "", "", "", "", ""],
    ["- Password: mínimo 8 caracteres", "", "", "", "", ""],
    ["- ID SAP: opcional, dejar vacío si no aplica", "", "", "", "", ""],
    ["- Departamento: debe coincidir exactamente con lista", "", "", "", "", ""],
    ["", "", "", "", "DEPT", "PAÍS"],
  ];

  depts.forEach((d) => {
    ref.push(["", "", "", "", d.name, d.country]);
  });

  const wsRef = XLSX.utils.aoa_to_sheet(ref);
  wsRef["!cols"] = [{ wch: 40 }, { wch: 4 }, { wch: 6 }, { wch: 14 }, { wch: 30 }, { wch: 8 }];
  XLSX.utils.book_append_sheet(wb, wsRef, "Referencia");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="template-usuarios-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
