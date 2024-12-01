import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth-utils';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.json();
    const mal = await db.sJAMal.create({
      data: {
        ...data,
        bedriftId: session.user.bedriftId,
      },
    });

    return NextResponse.json(mal);
  } catch (error) {
    console.error("Feil ved opprettelse av SJA-mal:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const maler = await db.sJAMal.findMany({
      where: {
        bedriftId: session.user.bedriftId,
      },
    });

    return NextResponse.json(maler);
  } catch (error) {
    console.error("Feil ved henting av SJA-maler:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}