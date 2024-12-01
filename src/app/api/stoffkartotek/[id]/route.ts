import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth-utils";
import { FareSymbol } from "@prisma/client";
import { uploadFile } from "@/lib/googleCloudStorage";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
    }

    const exists = await db.stoffkartotek.findFirst({
      where: { 
        id: params.id,
        bedriftId: session.user.bedriftId
      },
    });

    if (!exists) {
      return NextResponse.json({ success: true });
    }

    await db.$transaction(async (tx) => {
      await tx.fareSymbolMapping.deleteMany({
        where: { stoffkartotekId: params.id }
      });

      await tx.stoffkartotek.delete({
        where: { 
          id: params.id,
          bedriftId: session.user.bedriftId
        },
      });
    });

    // Hent oppdatert liste etter sletting
    const oppdatertListe = await db.stoffkartotek.findMany({
      where: { bedriftId: session.user.bedriftId },
      include: {
        opprettetAv: {
          select: { navn: true, etternavn: true }
        },
        FareSymbolMapping: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: oppdatertListe });
  } catch (error) {
    console.error("Feil ved sletting av stoffkartotek:", error);
    return NextResponse.json(
      { error: "Kunne ikke slette stoffkartotek" },
      { status: 500 }
    );
  }
}
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
    }

    const formData = await request.formData();
    const produktnavn = formData.get("produktnavn") as string;
    const produsent = formData.get("produsent") as string;
    const beskrivelse = formData.get("beskrivelse") as string;
    const bruksomrade = formData.get("bruksomrade") as string;
    const faresymboler = (formData.get("faresymboler") as string).split(",") as FareSymbol[];
    const datablad = formData.get("datablad") as File | null;

    let databladUrl;
    if (datablad) {
      const uploadedFile = await uploadFile(datablad);
      databladUrl = uploadedFile.url;
    }

    // Først slett eksisterende faresymboler
    await db.fareSymbolMapping.deleteMany({
      where: { stoffkartotekId: params.id }
    });

    // Oppdater stoffkartotek med nye data
    const oppdatertStoffkartotek = await db.stoffkartotek.update({
      where: { 
        id: params.id,
        bedriftId: session.user.bedriftId
      },
      data: {
        produktnavn,
        produsent,
        beskrivelse,
        bruksomrade,
        ...(databladUrl && { databladUrl }),
        FareSymbolMapping: {
          create: faresymboler.map((symbol) => ({
            symbol,
          })),
        },
      },
      include: {
        FareSymbolMapping: true,
        opprettetAv: {
          select: {
            navn: true,
            etternavn: true
          }
        }
      }
    });

    // Formater responsen
    const formattedResponse = {
      ...oppdatertStoffkartotek,
      faresymboler: oppdatertStoffkartotek.FareSymbolMapping.map(mapping => mapping.symbol)
    };

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error("Feil ved oppdatering av stoffkartotek:", error);
    return NextResponse.json(
      { error: "Kunne ikke oppdatere stoffkartotek" },
      { status: 500 }
    );
  }
}
