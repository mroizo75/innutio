// src/app/api/hent-skjemaer/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth-utils';

export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
  }

  try {
    // Hent avviksskjemaer
    const avvikSkjemaer = await db.skjema.findMany({
      where: { bedriftId: session.user.bedriftId, type: 'avvik', status: { not: 'Arkivert' } },
      select: {
        id: true,
        type: true, 
        tittel: true,
        innhold: true,
        status: true,
        opprettetDato: true,
        solution: true,
        notes: true,
        behandler: { select: { navn: true, etternavn: true } },
        opprettetAv: { select: { navn: true, etternavn: true } },
        bilder: {
          select: {
            id: true,
            url: true,
            navn: true 
          }
        }
      },
      orderBy: { opprettetDato: 'desc' },
    });

    // Hent endringsskjemaer
    const endringsSkjemaer = await db.endringsSkjema.findMany({
      where: { bedriftId: session.user.bedriftId },
      select: {
        id: true,
        changeNumber: true,
        status: true,
        opprettetDato: true,
        behandler: true,
        type: true, // Sørg for at 'type' er inkludert
        // ... andre nødvendige felt
      },
    });

    // Hent SJA-skjemaer
    const sjaSkjemaer = await db.sJASkjema.findMany({
      where: { bedriftId: session.user.bedriftId },
      select: {
        id: true,
        jobTitle: true,
        status: true,
        opprettetDato: true,
        behandler: true,
        type: true, // Sørg for at 'type' er inkludert
        // ... andre nødvendige felt
      },
    });

    // // Kombiner alle skjemaer
    // const alleSkjemaer = [
    //   ...avvikSkjemaer.map((skjema) => ({ ...skjema, type: "Avvik" })),
    //   ...endringsSkjemaer.map((skjema) => ({ ...skjema, type: "Endring" })),
    //   ...sjaSkjemaer.map((skjema) => ({ ...skjema, type: "SJA" })),
    // ];

    return NextResponse.json({ avvikSkjemaer, endringsSkjemaer, sjaSkjemaer });
  } catch (error) {
    console.error('Feil ved henting av skjemaer:', error);
    return NextResponse.json({ error: 'Kunne ikke hente skjemaer' }, { status: 500 });
  }
}