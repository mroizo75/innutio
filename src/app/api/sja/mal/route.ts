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
    
    const mal = await db.sJAMal.create({
      data: {
        navn: data.navn,
        jobTitle: data.jobTitle,
        jobLocation: data.jobLocation,
        participants: data.participants,
        jobDescription: data.jobDescription,
        identifiedRisks: data.identifiedRisks,
        riskMitigation: data.riskMitigation,
        responsiblePerson: data.responsiblePerson,
        comments: data.comments || '',
        bedriftId: session.user.bedriftId,
        opprettetAvId: session.user.id,
        produkter: {
          create: data.produkter.map((produkt: any) => ({
            produktId: produkt.produktId,
            navn: produkt.navn,
            mengde: produkt.mengde
          }))
        }
      },
      include: {
        produkter: true
      }
    });

    return NextResponse.json(mal);
  } catch (_error) {
    return NextResponse.json({ error: 'Kunne ikke opprette mal' }, { status: 500 });
  }
}
