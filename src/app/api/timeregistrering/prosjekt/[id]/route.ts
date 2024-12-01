import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Ikke autentisert' }, { status: 401 });
  }

  try {
    // Hent prosjektet med alle oppgaver og estimert tid
    const prosjekt = await db.prosjekt.findUnique({
      where: { id: params.id },
      include: {
        oppgaver: {
          include: {
            timeEntries: true,
            bruker: true,
          }
        }
      }
    });

    if (!prosjekt) {
      return NextResponse.json({ error: 'Prosjekt ikke funnet' }, { status: 404 });
    }

    // Hent alle timeregistreringer for prosjektet
    const timeEntries = await db.timeEntry.findMany({
      where: {
        prosjektId: params.id
      },
      include: {
        bruker: true,
        oppgave: true
      }
    });

    // Beregn status for hver oppgave
    const oppgaveStatus = prosjekt.oppgaver.map(oppgave => {
      const oppgaveTimer = timeEntries
        .filter(entry => entry.oppgaveId === oppgave.id)
        .reduce((sum, entry) => sum + entry.hours, 0);

      const brukerTimer = timeEntries
        .filter(entry => entry.oppgaveId === oppgave.id)
        .reduce((acc, entry) => {
          const brukerId = entry.brukerId;
          acc[brukerId] = (acc[brukerId] || 0) + entry.hours;
          return acc;
        }, {} as { [key: string]: number });

      return {
        oppgaveId: oppgave.id,
        tittel: oppgave.tittel,
        estimertTid: oppgave.estimertTid || 0,
        faktiskTid: oppgaveTimer,
        status: oppgave.status,
        prosentFullfort: oppgave.estimertTid 
          ? Math.min(100, (oppgaveTimer / oppgave.estimertTid) * 100)
          : 0,
        brukerTimer: brukerTimer,
        gjenværendeTid: Math.max(0, (oppgave.estimertTid || 0) - oppgaveTimer),
        advarsler: oppgaveTimer > (oppgave.estimertTid || 0) 
          ? [`Oppgaven har overskredet estimert tid med ${oppgaveTimer - (oppgave.estimertTid || 0)} timer`] 
          : []
      };
    });

    return NextResponse.json({
      prosjektId: prosjekt.id,
      prosjektNavn: prosjekt.navn,
      startDato: prosjekt.startDato,
      sluttDato: prosjekt.sluttDato,
      oppgaver: oppgaveStatus,
      totalEstimertTid: prosjekt.oppgaver.reduce((sum, oppg) => sum + (oppg.estimertTid || 0), 0),
      totalFaktiskTid: timeEntries.reduce((sum, entry) => sum + entry.hours, 0),
      timeEntries: timeEntries
    });

  } catch (error) {
    console.error('Feil ved henting av timeregistreringer:', error);
    return NextResponse.json(
      { error: 'Kunne ikke hente timeregistreringer' }, 
      { status: 500 }
    );
  }
}
