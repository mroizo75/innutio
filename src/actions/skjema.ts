"use server"

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateSkjemaStatus(
  skjemaId: string,
  newStatus: string,
  behandlerId: string,
  skjemaType: 'Avvik' | 'Endring'
) {
  try {
    let updatedSkjema;
    switch (skjemaType) {
      case 'Avvik':
        updatedSkjema = await db.skjema.update({
          where: { id: skjemaId },
          data: { 
            status: newStatus,
            behandlerId,
          },
          include: {
            behandler: { select: { navn: true, etternavn: true } },
            opprettetAv: { select: { navn: true, etternavn: true } },
            // Fjern 'innhold' her
          },
        });
        break;
      case 'Endring':
        updatedSkjema = await db.endringsSkjema.update({
          where: { id: skjemaId },
          data: { 
            status: newStatus,
            behandlerId,
          },
          include: {
            behandler: { select: { navn: true, etternavn: true } },
            opprettetAv: { select: { navn: true, etternavn: true } },
          },
        });
        break;
      default:
        throw new Error(`Ugyldig skjematype: ${skjemaType}`);
    }

    if (!updatedSkjema) {
      throw new Error(`Skjema med id ${skjemaId} ikke funnet`);
    }

    revalidatePath("/skjemaboard");
    return updatedSkjema;
  } catch (error) {
    console.error("Feil ved oppdatering av skjemastatus:", error);
    throw new Error(
      `Kunne ikke oppdatere skjemastatus: ${error instanceof Error ? error.message : 'Ukjent feil'}`
    );
  }
}

export async function deleteSkjema(skjemaId: string) {
  try {
    await db.skjema.delete({
      where: { id: skjemaId },
    });
    revalidatePath("/skjemaboard");
  } catch (error) {
    console.error("Feil ved sletting av skjema:", error);
    throw new Error("Kunne ikke slette skjema");
  }
}

export async function updateAvvikSkjemaLosning(skjemaId: string, solution: string, notes: string) {
  try {
    const updatedSkjema = await db.skjema.update({
      where: { id: skjemaId },
      data: { 
        solution: solution,
        notes: notes,
      },
      select: {
        id: true,
        type: true, // Legg til denne linjen
        tittel: true,
        innhold: true,
        status: true,
        solution: true,
        notes: true,
        behandler: { select: { navn: true, etternavn: true } },
        opprettetAv: { select: { navn: true, etternavn: true } },
      },
    });

    return updatedSkjema;

  } catch (error) {
    console.error("Feil ved oppdatering av avviksskjemaløsning:", error);
    throw new Error(`Kunne ikke oppdatere avviksskjemaløsning: ${error instanceof Error ? error.message : 'Ukjent feil'}`);
  }
}

export async function updateEndringsSkjemaLosning(skjemaId: string, solution: string) {
  try {
    const updatedSkjema = await db.endringsSkjema.update({
      where: { id: skjemaId },
      data: { 
        solution: solution,
      },
      select: {
        id: true,
        type: true,
        changeNumber: true,
        prosjekt: {
          select: {
            id: true,
            navn: true
          }
        },
        description: true,
        opprettetDato: true,
        status: true,
        solution: true,
        behandler: { select: { navn: true, etternavn: true } },
        opprettetAv: { select: { navn: true, etternavn: true } },
      },
    });

    return {
      ...updatedSkjema,
      changeNumber: updatedSkjema.changeNumber,
      projectName: updatedSkjema.prosjekt?.navn,
      description: updatedSkjema.description,
    };

  } catch (error) {
    console.error("Feil ved oppdatering av endringsskjema:", error);
    throw new Error(`Kunne ikke oppdatere endringsskjema: ${error instanceof Error ? error.message : 'Ukjent feil'}`);
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

export async function updateSkjemaSolutionAndNotes(skjemaId: string, solution: string, notes: string) {
  try {
    await db.endringsSkjema.update({
      where: { id: skjemaId },
      data: { 
        solution: solution,
      },
    });
    revalidatePath("/skjemaboard");
  } catch (error) {
    console.error("Feil ved oppdatering av endringsskjema:", error);
    throw new Error("Kunne ikke oppdatere endringsskjema");
  }
}


export async function getArchivedAvvik() {
  try {
    const archivedAvvik = await db.skjema.findMany({
      where: { status: 'Arkivert', type: 'avvik' },
      include: {
        behandler: {
          select: {
            id: true,
            navn: true,
            etternavn: true,
          },
        },
      },
    });
    return archivedAvvik;
  } catch (error) {
    console.error("Feil ved henting av arkiverte avvik:", error);
    throw new Error("Kunne ikke hente arkiverte avvik");
  }
}

export async function getArchivedEndringer() {
  try {
    const archivedEndringer = await db.endringsSkjema.findMany({
      where: { status: 'Arkivert' },
      include: {
        behandler: {
          select: {
            navn: true,
            etternavn: true,
          },
        },
      },
    });
    return archivedEndringer;
  } catch (error) {
    console.error("Feil ved henting av arkiverte endringer:", error);
    throw new Error("Kunne ikke hente arkiverte endringer");
  }
}

export async function getAllArchivedSkjemaer() {
  try {
    const archivedAvvik = await db.skjema.findMany({
      where: { status: 'Arkivert', type: 'avvik' },
      select: {
        id: true,
        tittel: true,
        solution: true,
        notes: true,
        status: true,
        opprettetDato: true,
        innhold: true,
        behandler: { select: { navn: true, etternavn: true } },
        opprettetAv: { select: { navn: true, etternavn: true } },
      },
    }).then(skjemaer => skjemaer.map(skjema => ({ ...skjema, type: 'Avvik' })));

    const archivedEndringer = await db.endringsSkjema.findMany({
      where: { status: 'Arkivert' },
      select: {
        id: true,
        changeNumber: true,
        prosjekt: {
          select: {
            id: true,
            navn: true
          }
        },
        description: true,
        solution: true,
        status: true,
        opprettetDato: true,
        behandler: { select: { navn: true, etternavn: true } },
        opprettetAv: { select: { navn: true, etternavn: true } },
      },
    }).then(skjemaer => skjemaer.map(skjema => ({
      ...skjema,
      type: 'Endring',
      changeNumber: skjema.changeNumber,
      projectName: skjema.prosjekt?.navn,
      description: skjema.description
    })));

    return [...archivedAvvik, ...archivedEndringer];

  } catch (error) {
    console.error("Feil ved henting av alle arkiverte skjemaer:", error);
    throw new Error("Kunne ikke hente alle arkiverte skjemaer");
  }
}