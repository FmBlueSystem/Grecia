import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sapFetch } from "@/lib/sap-client";
import type { CountryCode } from "@/lib/constants";

interface SapContact {
  InternalCode: number;
  Name: string;
  Phone1: string | null;
  MobilePhone: string | null;
  E_Mail: string | null;
  Position: string | null;
  Default: string | null; // "tYES" = contacto estándar
}

interface SapContactList {
  value?: SapContact[];
  ContactEmployees?: SapContact[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { code } = await params;
  const country = (request.nextUrl.searchParams.get("country") || session.country) as CountryCode;

  try {
    const data = await sapFetch<SapContactList>(country, `/BusinessPartners('${code}')/ContactEmployees`);

    const rawList = data.ContactEmployees || data.value || [];

    const contacts = rawList.map((c) => ({
      id: c.InternalCode,
      name: c.Name || "",
      phone: c.MobilePhone || c.Phone1 || null,
      email: c.E_Mail || null,
      position: c.Position || null,
      isDefault: c.Default === "tYES",
    }));

    return NextResponse.json({ contacts });
  } catch (e) {
    console.error("Error fetching BP contacts:", e);
    return NextResponse.json({ contacts: [] });
  }
}
