import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth-utils';
import { sendNotification } from '@/lib/notifications/send-notification';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const data = await req.json();
    
    // Valider og konverter numeriske verdier
    const sannsynlighet = parseInt(data.sannsynlighet) || 0;
    const konsekvensGrad = parseInt(data.konsekvensGrad) || 0;
    
    // Valider og konverter datoer
    const dato = data.dato ? new Date(data.dato) : new Date();
    const tidsfrist = data.tidsfrist ? new Date(data.tidsfrist) : null;
    const nesteGjennomgang = data.nesteGjennomgang ? new Date(data.nesteGjennomgang) : null;

    const risikoVurdering = await db.risikoVurdering.create({
      data: {
        dato,
        utfortAv: data.utfortAv || '',
        godkjentAv: data.godkjentAv || '',
        fareBeskrivelse: data.fareBeskrivelse || '',
        arsaker: data.arsaker || '',
        konsekvenser: data.konsekvenser || '',
        sannsynlighet,
        konsekvensGrad,
        risikoVerdi: sannsynlighet * konsekvensGrad,
        eksisterendeTiltak: data.eksisterendeTiltak || '',
        nyeTiltak: data.nyeTiltak || '',
        ansvarlig: data.ansvarlig || '',
        tidsfrist: tidsfrist || dato,
        restRisiko: data.restRisiko || '',
        risikoAkseptabel: data.risikoAkseptabel === 'yes',
        oppfolging: data.oppfolging || '',
        nesteGjennomgang: nesteGjennomgang || dato,
        status: 'Ubehandlet',
        prosjekt: {
          connect: { id: data.prosjektId }
        },
        bedrift: {
          connect: { id: session.user.bedriftId }
        },
        opprettetAv: {
          connect: { id: session.user.id }
        }
      },
      include: {
        prosjekt: true
      }
    });

    await sendNotification({
      message: `Ny risikovurdering opprettet for prosjekt "${risikoVurdering.prosjekt.navn}"`,
      url: '/skjemaboard/',
      bedriftId: session.user.bedriftId
    });

    return NextResponse.json(risikoVurdering);
  } catch (error) {
    console.error("Feil ved opprettelse av risikovurdering:", error);
    return NextResponse.json(
      { error: 'Kunne ikke opprette risikovurdering' },
      { status: 500 }
    );
  }
}
