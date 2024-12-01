import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth-utils';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const data = await req.json();

    const shaPlan = await db.sHAPlan.create({
      data: {
        prosjekt: {
          connect: { id: data.prosjektId }
        },
        bedrift: {
          connect: { id: session.user.bedriftId }
        },
        opprettetAv: {
          connect: { id: session.user.id }
        },
        byggherre: data.byggherre,
        entreprenor: data.entreprenor,
        risikoanalyse: data.risikoanalyse,
        vernetiltak: data.vernetiltak,
        beredskapsplan: data.beredskapsplan,
        ansvarlige: data.ansvarlige,
        status: "Under utarbeidelse"
      }
    });

    return NextResponse.json(shaPlan);
  } catch (error) {
    console.error("Feil ved opprettelse av SHA-plan:", error);
    return NextResponse.json(
      { error: 'Kunne ikke opprette SHA-plan' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const shaPlaner = await db.sHAPlan.findMany({
      where: { 
        bedriftId: session.user.bedriftId,
        status: { not: 'Arkivert' }
      },
      include: {
        opprettetAv: {
          select: {
            navn: true,
            etternavn: true
          }
        },
        behandler: {
          select: {
            navn: true,
            etternavn: true
          }
        },
        prosjekt: {
          select: {
            navn: true
          }
        }
      }
    });

    return NextResponse.json(shaPlaner);
    
  } catch (error) {
    console.error('Feil ved henting av SHA-planer:', error);
    return NextResponse.json(
      { error: 'Kunne ikke hente SHA-planer' },
      { status: 500 }
    );
  }
}