import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const timeEntry = await db.timeEntry.findUnique({
      where: { id },
      include: {
        prosjekt: true,
        oppgave: true,
      },
    });

    if (!timeEntry) {
      return NextResponse.json({ error: "Timeregistrering ikke funnet" }, { status: 404 });
    }

    if (timeEntry.brukerId !== currentUser.id) {
      return NextResponse.json({ error: "Ikke autorisert til å se denne timeregistreringen" }, { status: 403 });
    }

    return NextResponse.json(timeEntry);
  } catch (error) {
    console.error("Feil ved henting av timeregistrering:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const existingEntry = await db.timeEntry.findUnique({ where: { id } });

    if (!existingEntry) {
      return NextResponse.json({ error: "Timeregistrering ikke funnet" }, { status: 404 });
    }

    if (existingEntry.brukerId !== currentUser.id) {
      return NextResponse.json({ error: "Ikke autorisert til å oppdatere denne timeregistreringen" }, { status: 403 });
    }

    const { date, hours, description, prosjektId, oppgaveId } = await request.json();

    const updatedEntry = await db.timeEntry.update({
      where: { id },
      data: {
        date: date ? new Date(date) : existingEntry.date,
        hours: hours !== undefined ? hours : existingEntry.hours,
        description: description !== undefined ? description : existingEntry.description,
        prosjekt: prosjektId ? { connect: { id: prosjektId } } : undefined,
        oppgave: oppgaveId ? { connect: { id: oppgaveId } } : undefined,
      },
      include: {
        prosjekt: true,
        oppgave: true,
      },
    });

    return NextResponse.json(updatedEntry, { status: 200 });
  } catch (error) {
    console.error("Feil ved oppdatering av timeregistrering:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const existingEntry = await db.timeEntry.findUnique({ where: { id } });

    if (!existingEntry) {
      return NextResponse.json({ error: "Timeregistrering ikke funnet" }, { status: 404 });
    }

    if (existingEntry.brukerId !== currentUser.id) {
      return NextResponse.json({ error: "Ikke autorisert til å slette denne timeregistreringen" }, { status: 403 });
    }

    await db.timeEntry.delete({ where: { id } });

    return NextResponse.json({ message: "Timeregistrering slettet" }, { status: 200 });
  } catch (error) {
    console.error("Feil ved sletting av timeregistrering:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}