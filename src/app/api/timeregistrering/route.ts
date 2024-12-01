import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-utils";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
    }

    const timeregistreringer = await db.timeEntry.findMany({
      where: {
        brukerId: session.user.id,
      },
    });

    return NextResponse.json(timeregistreringer);
  } catch (error) {
    console.error("Feil ved henting av timeregistreringer:", error);
    return NextResponse.json({ error: "En feil oppstod" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date, hours, description, prosjektId, oppgaveId } = await request.json();

    if (!date || !hours || !prosjektId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newTimeEntry = await db.timeEntry.create({
      data: {
        date: new Date(date),
        hours,
        description,
        prosjekt: { connect: { id: prosjektId } },
        oppgave: oppgaveId ? { connect: { id: oppgaveId } } : undefined,
        bruker: { connect: { id: session.user.id } },
      },
      include: {
        prosjekt: true,
        oppgave: true,
      },
    });

    return NextResponse.json(newTimeEntry, { status: 201 });
  } catch (error) {
    console.error("Feil ved oppretting av timeregistrering:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}