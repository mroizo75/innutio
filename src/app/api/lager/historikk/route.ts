import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bedriftId = searchParams.get("bedriftId");

    if (!bedriftId) {
      return NextResponse.json({ error: "Mangler bedriftId" }, { status: 400 });
    }

    const historikk = await db.lagerHistorikk.findMany({
      where: {
        bedriftId: bedriftId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        produkt: true,
        user: true,
      },
    });

    return NextResponse.json(historikk);
  } catch (error) {
    console.error("Feil ved henting av historikk:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente historikk" },
      { status: 500 }
    );
  }
}