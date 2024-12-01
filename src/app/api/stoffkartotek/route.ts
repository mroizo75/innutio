import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { uploadFile } from "@/lib/googleCloudStorage";
import { FareSymbol } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const bedriftId = request.headers.get('bedrift-id');
  if (!bedriftId) {
    return new NextResponse('Missing bedriftId', { status: 400 });
  }

  try {
    const stoffkartotek = await db.stoffkartotek.findMany({
      where: { bedriftId },
      include: {
        opprettetAv: {
          select: { navn: true, etternavn: true }
        },
        FareSymbolMapping: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(stoffkartotek);
  } catch (error) {
    console.error('Feil ved henting av stoffkartotek:', error);
    return new NextResponse('Feil ved henting av stoffkartotek', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const formData = await request.formData();
    const bedriftId = formData.get('bedriftId') as string || session.user.bedriftId;
    
    if (!bedriftId) {
      return new NextResponse('Missing bedriftId', { status: 400 });
    }

    const produktnavn = formData.get('produktnavn') as string;
    const produsent = formData.get('produsent') as string;
    const beskrivelse = formData.get('beskrivelse') as string;
    const faresymbolerStr = formData.get('faresymboler') as string;
    const faresymboler = faresymbolerStr ? faresymbolerStr.split(',') : [];
    const datablad = formData.get('datablad');

    if (!produktnavn || !produsent) {
      return new NextResponse('Mangler påkrevde felter', { status: 400 });
    }

    let databladUrl;
    if (datablad instanceof Blob) {
      const file = new File([datablad], datablad.name || 'datablad', { type: datablad.type });
      const uploadResult = await uploadFile(file, 'datablader');
      databladUrl = uploadResult.url;
    }
    
    const stoffkartotek = await db.stoffkartotek.create({
      data: {
        produktnavn,
        produsent,
        beskrivelse: beskrivelse || '',
        databladUrl,
        bedrift: {
          connect: {
            id: bedriftId
          }
        },
        opprettetAv: {
          connect: {
            id: session.user.id
          }
        },
        FareSymbolMapping: {
          create: faresymboler.map(symbol => ({
            symbol: symbol as FareSymbol
          }))
        }
      },
      include: {
        opprettetAv: {
          select: { navn: true, etternavn: true }
        },
        FareSymbolMapping: true
      }
    });

    return NextResponse.json(stoffkartotek);
  } catch (error) {
    console.error('Feil ved opprettelse av stoffkartotek:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Kunne ikke opprette stoffkartotek', 
      { status: 500 }
    );
  }
}
