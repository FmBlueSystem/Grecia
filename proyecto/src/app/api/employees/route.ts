import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sapFetch } from "@/lib/sap-client";
import type { CountryCode } from "@/lib/constants";

interface SapEmployee {
  EmployeeID: number;
  FirstName: string;
  LastName: string;
  JobTitle: string | null;
  Department: number;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const search = request.nextUrl.searchParams.get("search") || "";
  const country = session.country as CountryCode;

  try {
    const params: Record<string, string> = {
      $select: "EmployeeID,FirstName,LastName,JobTitle,Department",
      $filter: "Active eq 'tYES'",
      $top: "50",
      $orderby: "FirstName",
    };

    if (search.length >= 2) {
      const s = search.replace(/'/g, "''");
      const upper = s.toUpperCase();
      const cap = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
      params.$filter = `Active eq 'tYES' and (contains(FirstName,'${upper}') or contains(LastName,'${upper}') or contains(FirstName,'${cap}') or contains(LastName,'${cap}'))`;
    }

    const data = await sapFetch<{ value: SapEmployee[] }>(country, "/EmployeesInfo", { params });

    return NextResponse.json({
      items: data.value.map((emp) => ({
        id: emp.EmployeeID,
        name: `${emp.FirstName} ${emp.LastName}`.trim(),
        jobTitle: emp.JobTitle,
      })),
    });
  } catch (e) {
    console.error("Error searching employees:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
