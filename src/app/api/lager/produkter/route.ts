import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-utils';
import { generateQRCode } from '@/lib/qr-utils';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const produkter = await db.lagerProdukt.findMany({
      where: { bedriftId: currentUser.bedriftId },
      include: {
        produktUttak: true,
        produktInntak: true,
      },
    });

    return NextResponse.json(produkter);
  } catch (error) {
    return NextResponse.json(
      { error: 'Kunne ikke hente produkter' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const data = await request.json();
    const qrKode = await generateQRCode();

    const produkt = await db.lagerProdukt.create({
      data: {
        ...data,
        qrKode,
        bedriftId: currentUser.bedriftId,
      },
    });

    return NextResponse.json(produkt);
  } catch (error) {
    return NextResponse.json(
      { error: 'Kunne ikke opprette produkt' },
      { status: 500 }
    );
  }
}