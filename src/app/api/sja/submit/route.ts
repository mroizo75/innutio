import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth-utils';
import { sendNotification } from '@/lib/notifications/send-notification';

interface ProduktValg {
  produktId: string;
  navn: string;
  mengde: string;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const data = await req.json();
    const { bilder, produkter, projectId, prosjektId, ...sjaData } = data;

    // Trinn 1: Opprett dummy-skjema for bilder med unikt avviksnummer
    const dummySkjema = await db.skjema.create({
      data: {
        type: "SJA",
        tittel: sjaData.jobTitle,
        innhold: {},
        status: "Ubehandlet",
        opprettetDato: new Date(),
        bedriftId: session.user.bedriftId,
        opprettetAvId: session.user.id,
        prosjektId: prosjektId,
        avviksnummer: `SJA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Generer unikt nummer
      }
    });

    // Trinn 2: Opprett SJA-skjema
    const sjaSkjema = await db.sJASkjema.create({
      data: {
        jobTitle: sjaData.jobTitle,
        jobLocation: sjaData.jobLocation,
        jobDate: sjaData.jobDate,
        participants: sjaData.participants,
        jobDescription: sjaData.jobDescription,
        identifiedRisks: sjaData.identifiedRisks,
        riskMitigation: sjaData.riskMitigation,
        responsiblePerson: sjaData.responsiblePerson,
        comments: sjaData.comments,
        approvalDate: sjaData.approvalDate,
        status: 'Ubehandlet',
        type: 'SJA',
        opprettetDato: new Date(),
        opprettetAvId: session.user.id,
        bedriftId: session.user.bedriftId,
        prosjektId: prosjektId
      }
    });

    // Trinn 3: Opprett produkter hvis de finnes
    if (produkter?.length > 0) {
      await db.sJAProdukt.createMany({
        data: produkter.map((produkt: ProduktValg) => ({
          produktId: produkt.produktId,
          navn: produkt.navn,
          mengde: produkt.mengde,
          sjaSkjemaId: sjaSkjema.id
        }))
      });
    }

    // Trinn 4: Opprett bilder hvis de finnes
    if (bilder?.length > 0) {
      await db.bilde.createMany({
        data: bilder.map((bilde: { url: string; navn: string }) => ({
          url: bilde.url,
          navn: bilde.navn,
          prosjektId,
          skjemaId: dummySkjema.id,
          sjaSkjemaId: sjaSkjema.id
        }))
      });
    }

    // Hent det komplette skjemaet med relasjoner
    const skjemaMedRelasjoner = await db.sJASkjema.findUnique({
      where: { id: sjaSkjema.id },
      include: {
        prosjekt: true,
        SJAProdukt: true,
        bilder: true,
        opprettetAv: {
          select: {
            navn: true,
            etternavn: true
          }
        }
      }
    });

    await sendNotification({
      message: `Nytt SJA-skjema opprettet for "${sjaSkjema.jobTitle}" i prosjekt "${skjemaMedRelasjoner?.prosjekt?.navn}"`,
      url: `/skjemaboard/`,
      bedriftId: session.user.bedriftId
    });

    return NextResponse.json({ 
      message: "SJA-skjema opprettet",
      skjema: skjemaMedRelasjoner 
    });
  } catch (error) {
    console.error("Feil ved opprettelse av SJA-skjema:", error);
    return NextResponse.json(
      { error: 'Kunne ikke opprette SJA-skjema' },
      { status: 500 }
    );
  }
}
