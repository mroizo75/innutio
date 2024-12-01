"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getProjects() {
  try {
    const projects = await db.prosjekt.findMany({
      select: {
        id: true,
        navn: true,
      },
    })
    return projects
  } catch (error) {
    console.error("Feil ved henting av prosjekter:", error)
    throw new Error("Kunne ikke hente prosjekter")
  }
}

export async function generateChangeNumber(bedriftId: string): Promise<string> {
  try {
    let newNumber = 1;
    let changeNumber;
    let existingChange;

    do {
      changeNumber = `EN${newNumber.toString().padStart(5, '0')}`;
      existingChange = await db.endringsSkjema.findFirst({
        where: { 
          bedriftId: bedriftId,
          changeNumber: changeNumber
        },
      });

      if (existingChange) {
        newNumber++;
      }
    } while (existingChange);

    return changeNumber;
  } catch (error) {
    console.error("Feil ved generering av endringsnummer:", error);
    throw new Error("Kunne ikke generere endringsnummer");
  }
}

export async function getLatestChangeNumber(bedriftId: string): Promise<string | null> {
  try {
    const latestChange = await db.endringsSkjema.findFirst({
      where: { bedriftId: bedriftId },
      orderBy: {
        changeNumber: 'desc',
      },
      select: {
        changeNumber: true,
      },
    })
    return latestChange ? latestChange.changeNumber : null
  } catch (error) {
    console.error("Feil ved henting av siste endringsnummer:", error)
    throw new Error("Kunne ikke hente siste endringsnummer")
  }
}

export async function createEndringsSkjema(data: any) {
  try {
    const { bilder, ...skjemaData } = data;
    
    const skjema = await db.endringsSkjema.create({
      data: {
        prosjektId: skjemaData.prosjektId,
        prosjekt: skjemaData.prosjektNavn,
        changeNumber: skjemaData.changeNumber,
        description: skjemaData.description,
        submittedBy: skjemaData.submittedBy || "",
        implementationDate: new Date(skjemaData.implementationDate),
        comments: skjemaData.comments || "",
        status: 'Ubehandlet',
        bedriftId: skjemaData.bedriftId,
        opprettetAvId: skjemaData.opprettetAvId,
        opprettetDato: new Date(),
        bilder: bilder && bilder.length > 0 ? {
          create: bilder.map((bilde: { url: string; navn: string }) => ({
            url: bilde.url,
            navn: bilde.navn
          }))
        } : undefined
      },
      include: {
        bilder: true,
        opprettetAv: {
          select: {
            navn: true,
            etternavn: true
          }
        }
      }
    });

    revalidatePath("/skjemaboard");
    return skjema;
  } catch (error) {
    console.error("Feil ved opprettelse av endringsskjema:", error);
    throw new Error("Kunne ikke opprette endringsskjema");
  }
}

export async function updateEndringsSkjemaProjectName(skjemaId: string, prosjekt: string) {
  try {
    await db.endringsSkjema.update({
      where: { id: skjemaId },
      data: { 
        prosjekt: prosjekt as any
      },
    });
    revalidatePath("/skjemaboard");
  } catch (error) {
    console.error("Feil ved oppdatering av prosjektnavn:", error);
    throw new Error("Kunne ikke oppdatere prosjektnavn");
  }
}

export async function deleteEndringsSkjema(skjemaId: string) {
    try {
      await db.endringsSkjema.delete({
        where: { id: skjemaId },
      });
      revalidatePath("/skjemaboard");
    } catch (error) {
      console.error("Feil ved sletting av endringsskjema:", error);
      throw new Error("Kunne ikke slette endringsskjema");
    }
  }
  
