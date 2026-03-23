import { NextRequest, NextResponse } from "next/server";
import { getSession, hashPassword, isAdmin } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { logChanges } from "@/lib/audit";
import { validatePassword } from "@/lib/security";
import * as XLSX from "xlsx";

interface DeptRow {
  id: number;
  name: string;
  country: string;
}

const VALID_ROLES = ["agente", "colaborador", "supervisor", "admin"];
const VALID_COUNTRIES = ["CR", "SV", "GT", "HN", "PA"];

function parseCountries(raw: string): string[] {
  return raw
    .split(/[,;\s]+/)
    .map((c) => c.trim().toUpperCase())
    .filter((c) => VALID_COUNTRIES.includes(c));
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });

  if (rows.length === 0) {
    return NextResponse.json({ error: "El archivo está vacío" }, { status: 400 });
  }

  // Load departments for lookup
  const depts = await query<DeptRow>(
    "SELECT id, name, country FROM casos.departments WHERE active = true"
  );
  const deptMap = new Map(depts.map((d) => [d.name.toLowerCase().trim(), d.id]));

  const results: { row: number; email: string; status: "ok" | "error"; reason?: string }[] = [];
  let created = 0;
  let failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2: header + 1-indexed

    const name = String(row["Nombre Completo"] ?? "").trim();
    const deptName = String(row["Departamento"] ?? "").trim();
    const email = String(row["Correo"] ?? "").trim().toLowerCase();
    const role = String(row["Rol"] ?? "").trim().toLowerCase();
    const paisesRaw = String(row["Paises (acceso)"] ?? "").trim();
    const password = String(row["Password"] ?? "").trim();
    const sapRaw = String(row["ID Empleado SAP"] ?? "").trim();

    // Skip completely empty rows
    if (!name && !email && !role) continue;

    // Validate required fields
    if (!name) { results.push({ row: rowNum, email: email || "?", status: "error", reason: "Nombre requerido" }); failed++; continue; }
    if (!email) { results.push({ row: rowNum, email: "?", status: "error", reason: "Correo requerido" }); failed++; continue; }
    if (!role || !VALID_ROLES.includes(role)) { results.push({ row: rowNum, email, status: "error", reason: `Rol inválido: ${role}` }); failed++; continue; }
    if (!password) { results.push({ row: rowNum, email, status: "error", reason: "Password requerido" }); failed++; continue; }

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) { results.push({ row: rowNum, email, status: "error", reason: pwCheck.error }); failed++; continue; }

    const countries = parseCountries(paisesRaw);
    if (countries.length === 0) { results.push({ row: rowNum, email, status: "error", reason: "Paises inválidos o vacíos" }); failed++; continue; }

    // Department lookup (optional)
    let departmentId: number | null = null;
    if (deptName) {
      const deptId = deptMap.get(deptName.toLowerCase());
      if (!deptId) { results.push({ row: rowNum, email, status: "error", reason: `Departamento no encontrado: ${deptName}` }); failed++; continue; }
      departmentId = deptId;
    }

    const sapEmployeeId = sapRaw ? Number(sapRaw) : null;
    if (sapRaw && isNaN(Number(sapRaw))) { results.push({ row: rowNum, email, status: "error", reason: "ID SAP debe ser numérico" }); failed++; continue; }

    // Check duplicate
    const existing = await queryOne<{ id: number }>(
      "SELECT id FROM casos.users WHERE email = $1",
      [email]
    );
    if (existing) { results.push({ row: rowNum, email, status: "error", reason: "Email ya registrado" }); failed++; continue; }

    try {
      const passwordHash = await hashPassword(password);
      const result = await queryOne<{ id: number }>(
        `INSERT INTO casos.users (email, password_hash, name, role, countries, default_country, department_id, sap_employee_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [email, passwordHash, name, role, countries, countries[0], departmentId, sapEmployeeId]
      );

      logChanges(session.userId, session.name, "user", String(result?.id), [
        { field: "Creacion", oldValue: null, newValue: `Importación masiva: ${email}` },
      ]).catch(() => {});

      results.push({ row: rowNum, email, status: "ok" });
      created++;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message.slice(0, 80) : "Error al insertar"; results.push({ row: rowNum, email, status: "error", reason: errMsg });
      failed++;
    }
  }

  return NextResponse.json({ created, failed, total: created + failed, results });
}
