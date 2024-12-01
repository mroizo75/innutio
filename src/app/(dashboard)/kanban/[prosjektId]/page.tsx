import { Prosjekt } from "@prisma/client"
import { auth } from "@/lib/auth-utils"
import { getUserById } from "@/data/user"
import { db } from "@/lib/db"
import { KanbanBoard } from "@/components/KanbanBoard"
import DashboardHeader from "@/components/DashboardHeader"

type OppgaveWithRelations = {
  status: "IKKE_STARTET" | "I_GANG" | "FULLFORT";
  id: string;
  bruker: {
    navn: string;
    etternavn: string;
    bildeUrl?: string;
  };
  beskrivelse: string;
  startDato: Date;
  sluttDato: Date;
  tittel: string;
  filer: any[];
  kommentarer: any[];
}

type ProsjektWithOppgaver = Prosjekt & {
  oppgaver: OppgaveWithRelations[];
}

const KanbanPage = async ({ params, searchParams }: { params: { prosjektId: string }, searchParams: { oppgave?: string } }) => {
  const session = await auth();
  const currentUser = await getUserById(session?.user?.id as string);

  if (!currentUser) {
    return <div>Bruker ikke funnet</div>
  }

  const prosjekt = await db.prosjekt.findUnique({
    where: { id: params.prosjektId },
    include: {
      oppgaver: {
        where: currentUser.role === "PROSJEKTLEDER" || currentUser.role === "ADMIN" 
          ? {} 
          : { brukerId: currentUser.id },
        select: {
          id: true,
          tittel: true,
          beskrivelse: true,
          startDato: true,
          sluttDato: true,
          status: true,
          filer: true,
          bruker: {
            select: {
              navn: true,
              etternavn: true,
              bildeUrl: true,
            }
          },
          kommentarer: {
            include: {
              bruker: {
                select: {
                  navn: true,
                  bildeUrl: true,
                }
              }
            }
          }
        }
      }
    }
  });

  if (!prosjekt) {
    return <div>Prosjekt ikke funnet</div>
  }

  const focusedOppgaveId = searchParams.oppgave;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex flex-1 flex-col p-8">
        <h1 className="text-3xl font-bold mb-6">{prosjekt.navn}</h1>
        <KanbanBoard prosjekt={prosjekt as ProsjektWithOppgaver} currentUser={currentUser} />
      </main>
    </div>
  )
}

export default KanbanPage