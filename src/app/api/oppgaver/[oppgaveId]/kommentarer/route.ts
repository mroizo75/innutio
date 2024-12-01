import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth-utils";

export const runtime = 'nodejs';

// Hent kommentarer for en oppgave
export async function GET(
  request: Request,
  { params }: { params: { oppgaveId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
    }

    const kommentarer = await db.kommentar.findMany({
      where: {
        oppgaveId: params.oppgaveId,
      },
      include: {
        bruker: {
          select: {
            navn: true,
            etternavn: true,
            bildeUrl: true,
          },
        },
      },
      orderBy: {
        opprettetAt: 'desc',
      },
    });

    return NextResponse.json(kommentarer);
  } catch (error) {
    console.error("Feil ved henting av kommentarer:", error);
    return NextResponse.json(
      { error: "Kunne ikke hente kommentarer" },
      { status: 500 }
    );
  }
}

// Opprett ny kommentar
export async function POST(
  request: Request,
  { params }: { params: { oppgaveId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
    }

    const { innhold } = await request.json();

    if (!innhold) {
      return NextResponse.json(
        { error: "Kommentartekst er påkrevd" },
        { status: 400 }
      );
    }

    const nyKommentar = await db.kommentar.create({
      data: {
        innhold,
        oppgaveId: params.oppgaveId,
        brukerId: session.user.id,
      },
      include: {
        bruker: {
          select: {
            navn: true,
            etternavn: true,
            bildeUrl: true,
          },
        },
      },
    });

    return NextResponse.json(nyKommentar);
  } catch (error) {
    console.error("Feil ved opprettelse av kommentar:", error);
    return NextResponse.json(
      { error: "Kunne ikke opprette kommentar" },
      { status: 500 }
    );
  }
}
