"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { ProsjektStatus } from "@prisma/client"
import { auth } from "@/lib/auth-utils"

export async function createProsjekt(data: {
  navn: string
  beskrivelse: string
  startDato: Date
  sluttDato: Date
  bedriftId: string
  status?: ProsjektStatus
}) {
  try {
    const prosjekt = await db.prosjekt.create({
      data: {
        navn: data.navn,
        beskrivelse: data.beskrivelse,
        startDato: data.startDato,
        sluttDato: data.sluttDato,
        status: data.status || "IKKE_STARTET",
        bedriftId: data.bedriftId,
      }
    })

    revalidatePath("/prosjekter")
    return prosjekt
  } catch (error) {
    console.error("Feil ved opprettelse av prosjekt:", error)
    throw new Error("Kunne ikke opprette prosjekt")
  }
}

export async function updateProsjekt(
  prosjektId: string,
  data: {
    navn?: string
    beskrivelse?: string
    startDato?: Date
    sluttDato?: Date
    status?: ProsjektStatus
  }
) {
  try {
    const prosjekt = await db.prosjekt.update({
      where: { id: prosjektId },
      data
    })

    revalidatePath("/prosjekter")
    return prosjekt
  } catch (error) {
    console.error("Feil ved oppdatering av prosjekt:", error)
    throw new Error("Kunne ikke oppdatere prosjekt")
  }
}

export async function slettProsjekt(prosjektId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Ikke autorisert")

    // Hent brukerens rolle
    const user = await db.user.findUnique({
      where: { id: session.user.id }
    })

    // Sjekk om brukeren har riktig rolle
    if (user?.role !== "ADMIN" && user?.role !== "LEDER") {
      throw new Error("Ikke tilgang til å slette prosjekter")
    }

    await db.$transaction(async (tx) => {
      // Først, fjern alle bruker-tilknytninger
      await tx.prosjekt.update({
        where: { id: prosjektId },
        data: {
          users: {
            set: [] // Dette fjerner alle bruker-tilknytninger
          }
        }
      });

      // 1. Slett alle bilder knyttet til prosjektet og dets relaterte entiteter
      await tx.bilde.deleteMany({
        where: {
          OR: [
            { prosjektId: prosjektId },
            { 
              oppgave: {
                prosjektId: prosjektId
              }
            }
          ]
        }
      });

      // 2. Slett alle timeEntries
      await tx.timeEntry.deleteMany({
        where: {
          OR: [
            { prosjektId: prosjektId },
            { 
              oppgave: {
                prosjektId: prosjektId
              }
            }
          ]
        }
      });

      // 3. Slett alle kommentarer på oppgaver
      await tx.kommentar.deleteMany({
        where: {
          oppgave: {
            prosjektId: prosjektId
          }
        }
      });

      // 4. Slett alle filer knyttet til oppgaver
      await tx.fil.deleteMany({
        where: {
          oppgave: {
            prosjektId: prosjektId
          }
        }
      });

      // 5. Slett alle oppgaver
      await tx.oppgave.deleteMany({
        where: {
          prosjektId: prosjektId
        }
      });

      // 6. Slett alle sluttrapporter
      await tx.sluttrapport.deleteMany({
        where: {
          prosjektId: prosjektId
        }
      });

      // 7. Slett alle risikovurderinger
      await tx.risikoVurdering.deleteMany({
        where: {
          prosjektId: prosjektId
        }
      });

      // 8. Slett alle SJA-produkter og deretter SJA-skjemaer
      await tx.sJAProdukt.deleteMany({
        where: {
          sjaSkjema: {
            prosjektId: prosjektId
          }
        }
      });

      await tx.sJASkjema.deleteMany({
        where: {
          prosjektId: prosjektId
        }
      });

      // 9. Slett alle endringsskjemaer
      await tx.endringsSkjema.deleteMany({
        where: {
          prosjektId: prosjektId
        }
      });

      // 10. Slett alle skjemaer
      await tx.skjema.deleteMany({
        where: {
          prosjektId: prosjektId
        }
      });

      // 12. Til slutt, slett selve prosjektet
      await tx.prosjekt.delete({
        where: { id: prosjektId }
      });
    });

    revalidatePath("/prosjekter");
    return { success: true };
  } catch (error) {
    console.error("Feil ved sletting av prosjekt:", error);
    throw new Error("Kunne ikke slette prosjekt");
  }
}

export async function getProsjekter() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Ikke autorisert")

  try {
    const prosjekter = await db.prosjekt.findMany({
      where: {
        bedriftId: session.user.bedriftId,
        status: {
          not: "ARKIVERT"
        }
      },
      include: {
        oppgaver: true,
        users: {
          select: {
            id: true,
            navn: true,
            etternavn: true,
            email: true,
            position: true
          }
        },
        timeEntries: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return prosjekter
  } catch (error) {
    console.error("Feil ved henting av prosjekter:", error)
    throw new Error("Kunne ikke hente prosjekter")
  }
}

export async function arkiverProsjekt(prosjektId: string) {
  try {
    await db.prosjekt.update({
      where: { id: prosjektId },
      data: { status: "ARKIVERT" }
    })

    revalidatePath("/prosjekter")
    revalidatePath("/arkiv")
  } catch (error) {
    console.error("Feil ved arkivering av prosjekt:", error)
    throw new Error("Kunne ikke arkivere prosjekt")
  }
}

export async function leggTilBrukerTilProsjekt(prosjektId: string, userId: string) {
  try {
    await db.prosjekt.update({
      where: { id: prosjektId },
      data: {
        users: {
          connect: { id: userId }
        }
      }
    })

    revalidatePath("/prosjekter")
  } catch (error) {
    console.error("Feil ved tillegging av bruker til prosjekt:", error)
    throw new Error("Kunne ikke legge til bruker i prosjekt")
  }
}