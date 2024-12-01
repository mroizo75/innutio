import { auth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import SkjemaBoard from "@/components/SkjemaBoard";
import DashboardHeader from "@/components/DashboardHeader";
import { redirect } from "next/navigation";
import type { Skjema } from "@/components/SkjemaBoard";

async function getSkjemaer(bedriftId: string): Promise<Skjema[]> {
  if (!bedriftId) {
    throw new Error('BedriftId er ikke definert')
  }

  const avvikSkjemaer = await db.skjema.findMany({
    where: { 
      bedriftId, 
      type: 'avvik', 
      status: { not: 'Arkivert' } 
    },
    select: {
      id: true,
      type: true,
      tittel: true,
      innhold: true,
      status: true,
      opprettetDato: true,
      updatedAt: true,
      bedriftId: true,
      prosjektId: true,
      solution: true,
      notes: true,
      behandlerId: true,
      opprettetAvId: true,
      avviksnummer: true,
      behandler: { 
        select: { 
          navn: true, 
          etternavn: true 
        } 
      },
      opprettetAv: { 
        select: { 
          navn: true, 
          etternavn: true 
        } 
      },
      bilder: {
        select: {
          id: true,
          url: true,
          navn: true
        }
      }
    }
  })

  const endringsSkjemaer = await db.endringsSkjema.findMany({
    where: { 
      bedriftId, 
      status: { not: 'Arkivert' } 
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
      implementationDate: true,
      status: true,
      opprettetDato: true,
      updatedAt: true,
      bedriftId: true,
      solution: true,
      comments: true,
      behandlerId: true,
      opprettetAvId: true,
      behandler: { 
        select: { 
          navn: true, 
          etternavn: true 
        } 
      },
      opprettetAv: { 
        select: { 
          navn: true, 
          etternavn: true 
        } 
      },
      bilder: {
        select: {
          id: true,
          url: true,
          navn: true
        }
      }
    }
  })

  const formattedAvvikSkjemaer = avvikSkjemaer.map(skjema => ({
    ...skjema,
    type: 'Avvik' as const,
    behandler: skjema.behandler,
    opprettetAv: skjema.opprettetAv,
    bilder: skjema.bilder
  }))

  const formattedEndringsSkjemaer = endringsSkjemaer.map(skjema => ({
    ...skjema,
    type: 'Endring' as const,
    tittel: skjema.changeNumber,
    avviksnummer: '',
    prosjektId: skjema.prosjekt.id,
    behandler: skjema.behandler,
    opprettetAv: skjema.opprettetAv,
    bilder: skjema.bilder
  }))

  return [...formattedAvvikSkjemaer, ...formattedEndringsSkjemaer] as Skjema[]
}

export default async function SkjemaBoardPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/auth/login")
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    include: { bedrift: true },
  })

  if (!currentUser) {
    redirect("/auth/login")
  }

  const alleSkjemaer = await getSkjemaer(session.user.bedriftId)

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex flex-1 flex-col p-8">
        <h1 className="text-3xl font-bold mb-8">Skjemaoversikt</h1>
        <SkjemaBoard 
          skjemaer={alleSkjemaer} 
          currentUser={session.user} 
        />
      </main>
    </div>
  )
}
