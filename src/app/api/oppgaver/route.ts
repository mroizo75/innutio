import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';
import { OppgaveStatus, Prioritet, Prisma } from '@prisma/client';

interface OppgaveInput {
  tittel: string;
  beskrivelse: string;
  startDato: string;
  sluttDato: string;
  estimertTid: number;
  status: OppgaveStatus;
  prioritet: Prioritet;
  prosjektId: string;
  brukerId?: string;
}

export async function GET() {
    const oppgaver = await db.oppgave.findMany({
        include: {
            prosjekt: true,
            bruker: true,
            filer: true,
        },
    });
    return NextResponse.json(oppgaver);
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const data = await request.json() as OppgaveInput;
    
    const oppgaveData: Prisma.OppgaveCreateInput = {
      tittel: data.tittel,
      beskrivelse: data.beskrivelse,
      startDato: new Date(data.startDato),
      sluttDato: new Date(data.sluttDato),
      estimertTid: data.estimertTid,
      status: data.status,
      prioritet: data.prioritet,
      faktiskTid: 0,
      prosjekt: {
        connect: { id: data.prosjektId }
      },
      bruker: data.brukerId 
        ? { connect: { id: data.brukerId } }
        : { connect: undefined }
    };

    const oppgave = await db.oppgave.create({
      data: oppgaveData
    });

    return NextResponse.json(oppgave);
  } catch (error) {
    console.error('Feil ved opprettelse av oppgave:', error);
    return NextResponse.json(
      { error: 'Kunne ikke opprette oppgave' },
      { status: 500 }
    );
  }
}

