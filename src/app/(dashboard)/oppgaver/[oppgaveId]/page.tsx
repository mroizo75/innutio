import { auth } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import OppgaveDetaljer from "@/components/OppgaveDetaljer"

interface PageParams {
  params: {
    oppgaveId: string
  }
}

const OppgaveDetaljerPage = async ({ params }: PageParams) => {
  const session = await auth()
  if (!session) {
    redirect("/auth/login")
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id }
  })

  if (!currentUser) {
    redirect("/auth/login")
  }

  const oppgave = await db.oppgave.findUnique({
    where: { 
      id: params.oppgaveId 
    },
    include: {
      kommentarer: {
        include: {
          bruker: true
        }
      },
      filer: true,
      bruker: true,
      prosjekt: true
    }
  })

  if (!oppgave) {
    redirect("/oppgaver")
  }

  return (
    <div className="container mx-auto p-4">
      <OppgaveDetaljer 
        oppgave={oppgave} 
        currentUser={currentUser}
      />
    </div>
  )
}

export default OppgaveDetaljerPage