"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth-utils"
import { FareSymbol } from "@prisma/client";
import { uploadFile } from "@/lib/googleCloudStorage";

// Definer en custom error type
type StoffkartotekError = {
  message: string;
  code?: string;
  status?: number;
}

export async function updateStoffkartotekStatus(
  stoffkartotekId: string,
  newStatus: string,
  behandlerId: string
) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Ikke autorisert");

    const updatedStoffkartotek = await db.stoffkartotek.update({
      where: { 
        id: stoffkartotekId,
        bedriftId: session.user.bedriftId 
      },
      data: { 
        updatedAt: new Date(),
      },
      include: {
        opprettetAv: { select: { navn: true, etternavn: true } },
        FareSymbolMapping: true
      },
    });

    if (!updatedStoffkartotek) {
      throw new Error(`Stoffkartotek med id ${stoffkartotekId} ikke funnet`);
    }

    revalidatePath("/stoffkartotek");
    return {
      ...updatedStoffkartotek,
      faresymboler: updatedStoffkartotek.FareSymbolMapping.map(m => m.symbol)
    };
  } catch (error: unknown) {
    const err = error as StoffkartotekError;
    console.error("Feil ved oppdatering av stoffkartotek status:", err);
    throw new Error(err.message || "Kunne ikke oppdatere stoffkartotek status");
  }
}

export async function deleteStoffkartotek(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Ikke autorisert");

  try {
    // Sjekk om stoffkartotek eksisterer
    const exists = await db.stoffkartotek.findFirst({
      where: { 
        id,
        bedriftId: session.user.bedriftId
      },
    });

    if (!exists) {
      return { success: true }; // Returner suksess hvis den allerede er slettet
    }

    // Utfør sletting i en transaction
    await db.$transaction(async (tx) => {
      await tx.fareSymbolMapping.deleteMany({
        where: { stoffkartotekId: id }
      });

      await tx.stoffkartotek.delete({
        where: { 
          id,
          bedriftId: session.user.bedriftId
        },
      });
    });

    revalidatePath("/stoffkartotek");
    return { success: true };
  } catch (error: unknown) {
    const err = error as StoffkartotekError;
    console.error("Feil ved sletting av stoffkartotek:", err);
    throw new Error(err.message || "Kunne ikke slette stoffkartotek");
  }
}

export async function updateStoffkartotek(
  id: string, 
  data: FormData
) {
  const session = await auth();
  if (!session?.user) throw new Error("Ikke autorisert");

  try {
    const produktnavn = data.get("produktnavn") as string;
    const produsent = data.get("produsent") as string;
    const faresymbolerStr = data.get("faresymboler") as string;
    const faresymboler = faresymbolerStr ? faresymbolerStr.split(",") : [];
    const datablad = data.get("datablad") as File | null;

    // Valider inputdata
    if (!produktnavn || !produsent || !faresymboler.length) {
      throw new Error("Manglende nødvendige felter for oppdatering av stoffkartotek.");
    }

    // Valider faresymboler
    const validSymbols = Object.values(FareSymbol);
    for (const symbol of faresymboler) {
      if (!validSymbols.includes(symbol as FareSymbol)) {
        throw new Error(`Ugyldig faresymbol: ${symbol}`);
      }
    }

    let databladUrl = undefined;
    if (datablad && datablad.size > 0) {
      // Last opp ny fil hvis den finnes
      const uploadResult = await uploadFile(datablad, "stoffkartotek");
      databladUrl = uploadResult.url;
    }

    // Sjekk om stoffkartotek eksisterer
    const existingStoffkartotek = await db.stoffkartotek.findFirst({
      where: { id, bedriftId: session.user.bedriftId },
    });

    if (!existingStoffkartotek) {
      throw new Error(`Stoffkartotek med id ${id} finnes ikke for denne bedriften.`);
    }

    // Oppdater stoffkartotek i database
    await db.$transaction(async (tx) => {
      // Slett eksisterende faresymboler
      await tx.fareSymbolMapping.deleteMany({
        where: { stoffkartotekId: id }
      });

      // Opprett nye faresymbol mappings
      await tx.fareSymbolMapping.createMany({
        data: faresymboler.map(symbol => ({
          stoffkartotekId: id,
          symbol: symbol as FareSymbol
        }))
      });

      // Oppdater stoffkartotek
      await tx.stoffkartotek.update({
        where: { 
          id,
          bedriftId: session.user.bedriftId
        },
        data: {
          produktnavn,
          produsent,
          ...(databladUrl && { databladUrl })
        }
      });
    });

    revalidatePath("/stoffkartotek");
    return { success: true };
  } catch (error: unknown) {
    const err = error as StoffkartotekError;
    console.error("Feil ved oppdatering av stoffkartotek:", err);
    throw new Error(err.message || "Kunne ikke oppdatere stoffkartotek");
  }
}

export async function createStoffkartotek(
  bedriftId: string,
  data: {
    produktnavn: string
    produsent: string
    beskrivelse?: string
    bruksomrade?: string
    faresymboler: FareSymbol[]
    databladUrl?: string
  }
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Ikke autorisert")
  }

  try {
    const { faresymboler, ...restData } = data
    
    // Valider at alle faresymboler er gyldige
    const validSymbols = Object.values(FareSymbol)
    for (const symbol of faresymboler) {
      if (!validSymbols.includes(symbol)) {
        throw new Error(`Ugyldig faresymbol: ${symbol}`)
      }
    }
    
    const stoffkartotek = await db.stoffkartotek.create({
      data: {
        ...restData,
        bedrift: {
          connect: { id: bedriftId }
        },
        opprettetAv: {
          connect: { id: session.user.id }
        },
        FareSymbolMapping: {
          create: faresymboler.map(symbol => ({
            symbol
          }))
        }
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
    })

    revalidatePath("/superadmin")
    return stoffkartotek
  } catch (error) {
    console.error("Feil ved opprettelse av stoffkartotek:", error)
    throw new Error("Kunne ikke opprette stoffkartotek")
  }
}
