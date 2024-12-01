import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth-utils";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const sjaSkjemaer = await db.sJASkjema.findMany({
      where: { 
        bedriftId: session.user.bedriftId 
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
        SJAProdukt: true
      },
      orderBy: {
        opprettetDato: 'desc'
      }
    });

    return NextResponse.json(sjaSkjemaer);
  } catch (error) {
    console.error('Feil ved henting av SJA-skjemaer:', error);
    return new NextResponse('Feil ved henting av SJA-skjemaer', { status: 500 });
  }
}