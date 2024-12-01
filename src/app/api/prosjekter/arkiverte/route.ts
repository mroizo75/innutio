import { auth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { ProsjektStatus } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "Bruker ikke funnet" }, { status: 404 });
    }

    const arkiverteProsjekter = await db.prosjekt.findMany({
      where: {
        bedriftId: currentUser.bedriftId,
        status: ProsjektStatus.ARKIVERT,
      },
      include: {
        oppgaver: true,
        timeEntries: true,
        users: {
          select: {
            id: true,
            navn: true,
            etternavn: true,
          },
        },
      },
      orderBy: {
        sluttDato: "desc",
      },
    });

    return NextResponse.json(arkiverteProsjekter);
  } catch (_error) {
    return NextResponse.json(
      { error: "Kunne ikke hente arkiverte prosjekter" },
      { status: 500 }
    );
  }
}