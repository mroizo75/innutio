import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from "@/lib/auth-utils"
import { sendNotification } from '@/lib/notifications/send-notification';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
    }

    const { bilder, ...data } = await req.json();

    if (!data.prosjektId || !data.description || !data.implementationDate) {
      return NextResponse.json({ error: "Manglende påkrevde felt" }, { status: 400 });
    }

    // Trinn 1: Opprett et dummy Skjema for bildene
    const dummySkjema = await db.skjema.create({
      data: {
        type: "Endring",
        tittel: data.description,
        innhold: {},
        avviksnummer: data.changeNumber,
        status: "Ubehandlet",
        opprettetDato: new Date(),
        bedriftId: session.user.bedriftId,
        opprettetAvId: session.user.id,
        prosjektId: data.prosjektId
      }
    });

    // Trinn 2: Opprett endringsskjema
    const newChange = await db.endringsSkjema.create({
      data: {
        prosjektId: data.prosjektId,
        changeNumber: data.changeNumber,
        description: data.description,
        submittedBy: data.submittedBy || "",
        implementationDate: new Date(data.implementationDate),
        comments: data.comments || "",
        status: "Ubehandlet",
        type: "Endring",
        opprettetDato: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        opprettetAvId: session.user.id,
        bedriftId: session.user.bedriftId
      }
    });

    // Trinn 3: Opprett bilder hvis de finnes
    if (bilder && bilder.length > 0) {
      for (const bilde of bilder) {
        await db.bilde.create({
          data: {
            url: bilde.url,
            navn: bilde.navn,
            skjemaId: dummySkjema.id,  // Koble til dummy-skjemaet
            prosjektId: data.prosjektId,
            endringsSkjemaId: newChange.id  // Koble til endringsskjemaet
          }
        });
      }
    }

    // Hent det komplette skjemaet med relasjoner
    const skjemaMedRelasjoner = await db.endringsSkjema.findUnique({
      where: { id: newChange.id },
      include: {
        bilder: true,
        opprettetAv: {
          select: {
            navn: true,
            etternavn: true
          }
        },
        prosjekt: true,
        bedrift: true
      }
    });

    // Send notifikasjon
    await sendNotification({
      message: `Ny Endringsmelding opprettet for "${skjemaMedRelasjoner?.description}" i prosjekt "${skjemaMedRelasjoner?.prosjekt?.navn}"`,
      url: `/skjemaboard/`,
      bedriftId: session.user.bedriftId
    });

    return NextResponse.json({ 
      message: "Endringsskjema opprettet", 
      change: skjemaMedRelasjoner 
    });
  } catch (error) {
    console.error("Feil ved opprettelse av endringsskjema:", error);
    return NextResponse.json(
      { error: "Kunne ikke opprette endringsskjema" }, 
      { status: 500 }
    );
  }
}
