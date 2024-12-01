import { auth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { ProsjektStatus } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: { prosjektId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "LEDER")) {
      return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
    }

    const prosjekt = await db.prosjekt.update({
      where: { id: params.prosjektId },
      data: {
        status: ProsjektStatus.ARKIVERT,
      },
    });

    return NextResponse.json(prosjekt);
  } catch (error) {
    console.error("Feil ved arkivering av prosjekt:", error);
    return NextResponse.json(
      { error: "Kunne ikke arkivere prosjektet" },
      { status: 500 }
    );
  }
}