import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth-utils";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!currentUser) {
    return NextResponse.json({ error: "Bruker ikke funnet" }, { status: 404 });
  }

  const prosjekter = await db.prosjekt.findMany({
    where: {
      bedriftId: currentUser.bedriftId,
      status: { not: "AVSLUTTET" },
    },
    include: {
      oppgaver: {
        include: {
          prosjekt: true,
          bruker: true,
        },
      },
    },
  });

  return NextResponse.json(prosjekter);
}