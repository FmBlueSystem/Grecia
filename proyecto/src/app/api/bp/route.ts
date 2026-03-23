import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sapFetch } from "@/lib/sap-client";
import type { CountryCode } from "@/lib/constants";

interface SapBP {
  CardCode: string;
  CardName: string;
  Phone1: string | null;
  EmailAddress: string | null;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const search = request.nextUrl.searchParams.get("search") || "";
  const country = (request.nextUrl.searchParams.get("country") || session.country) as CountryCode;

  if (!search || search.length < 2) {
    return NextResponse.json({ items: [] });
  }

  try {
    const s = search.replace(/'/g, "''").toUpperCase();
    const data = await sapFetch<{ value: SapBP[] }>(country, "/BusinessPartners", {
      params: {
        $select: "CardCode,CardName,Phone1,EmailAddress",
        $filter: `(contains(CardCode,'${s}') or contains(CardName,'${s}')) and CardType eq 'cCustomer'`,
        $top: "10",
        $orderby: "CardName",
      },
    });

    return NextResponse.json({
      items: data.value.map((bp) => ({
        code: bp.CardCode,
        name: bp.CardName,
        phone: bp.Phone1,
        email: bp.EmailAddress,
      })),
    });
  } catch (e) {
    console.error("Error searching BP:", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
