import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth-utils';
import { generateAvviksnummer } from '@/lib/generateAvviksnummer';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const data = await request.json();
    const { tittel, responsible, description, prosjektId } = data;

    const avviksnummer = await generateAvviksnummer();

    const newAvvik = await db.skjema.create({
      data: {
        tittel,
        type: "Avvik",
        status: 'Ubehandlet',
        avviksnummer,
        innhold: {
          responsible,
          description,
        },
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
            id: prosjektId
          }
        }
      },
    });

    return NextResponse.json({ success: true, avvik: newAvvik });
  } catch (error) {
    console.error("Feil ved opprettelse av avvik:", error);
    return NextResponse.json(
      { success: false, error: 'Kunne ikke opprette avvik' }, 
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const activeProjects = await db.prosjekt.findMany({
      where: {
        status: {
          not: 'ARKIVERT'
        }
      },
      select: {
        navn: true,
        status: true
      }
    });

    return new Response(JSON.stringify(activeProjects), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Feil ved henting av prosjekter:", error);
    return new Response(JSON.stringify({ error: "Kunne ikke hente prosjekter" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}