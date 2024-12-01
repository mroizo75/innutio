import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const prosjekter = await db.prosjekt.findMany({
      where: {
        bedriftId: session.user.bedriftId,
      },
    });

    return NextResponse.json(prosjekter);
  } catch (error) {
    console.error('Feil ved henting av prosjekter:', error);
    return NextResponse.json({ error: 'En feil oppstod' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  try {
    const nyttProsjekt = await db.prosjekt.create({
      data: {
        navn: data.navn,
        beskrivelse: data.beskrivelse,
        startDato: new Date(data.startDato),
        sluttDato: new Date(data.sluttDato),
        status: data.status || 'IKKE_STARTET',
        bedriftId: session.user.bedriftId,
      },
    });

    return NextResponse.json(nyttProsjekt, { status: 201 });
  } catch (error) {
    console.error("Feil ved oppretting av prosjekt:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}