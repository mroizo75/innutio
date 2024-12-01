import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth-utils';
import { generateAvviksnummer } from '@/lib/generateAvviksnummer';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const data = await req.json();

    // Generer et unikt avviksnummer
    const avviksnummer = await generateAvviksnummer();

    const skjema = await db.skjema.create({
      data: {
        type: "Avvik",
        tittel: data.tittel,
        innhold: data.innhold,
        status: "Ubehandlet",
        avviksnummer: avviksnummer,
        bedrift: {
          connect: {
            id: session.user.bedriftId
          }
        },
        opprettetAv: {
          connect: {
            id: session.user.id
          }
        },
        prosjekt: {
          connect: {
            id: data.prosjektId
          }
        },
        bilder: data.bilder ? {
          create: data.bilder.map((bilde: any) => ({
            url: bilde.url,
            navn: bilde.navn,
            prosjekt: {
              connect: {
                id: data.prosjektId
              }
            }
          }))
        } : undefined
      },
      include: {
        opprettetAv: {
          select: {
            navn: true,
            etternavn: true
          }
        },
        prosjekt: {
          select: {
            navn: true
          }
        },
        bilder: true
      }
    });

    // Opprett en notifikasjon for skjemaet
    await db.notification.create({
      data: {
        message: `Nytt avvik opprettet: ${skjema.tittel}`,
        url: `/avvik/${skjema.id}`,
        user: {
          connect: {
            id: session.user.id
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Avviksskjema opprettet',
      avviksnummer,
      skjema
    });

  } catch (error) {
    console.error('Feil ved opprettelse av avviksskjema:', error);
    return NextResponse.json(
      { error: 'Kunne ikke opprette avviksskjema' }, 
      { status: 500 }
    );
  }
}
