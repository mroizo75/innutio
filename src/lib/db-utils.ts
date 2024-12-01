import { db } from "@/lib/db";

export async function getProsjekter(bedriftId: string) {
    return await db.prosjekt.findMany({
      where: {
        bedriftId,
        NOT: {
          status: "ARKIVERT"
        }
      },
      include: {
        oppgaver: true,
        timeEntries: true,
        users: {
          select: {
            id: true,
            navn: true,
            etternavn: true,
          },
        },
      },
      orderBy: {
        startDato: 'desc',
      },
    });
  }