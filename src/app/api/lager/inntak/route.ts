import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { produktId, antall, kommentar, bedriftId, userId } = body;

    const inntak = await db.$transaction([
      db.lagerProdukt.update({
        where: { id: produktId },
        data: { antall: { increment: antall } },
      }),
      db.lagerHistorikk.create({
        data: {
          type: "INNTAK",
          antall,
          kommentar,
          produktId,
          bedriftId,
          userId,
        },
      }),
    ]);

    return NextResponse.json(inntak);
  } catch (error) {
    console.error('Feil ved inntak:', error);
    return NextResponse.json(
      { error: 'Kunne ikke registrere inntak' },
      { status: 500 }
    );
  }
}
