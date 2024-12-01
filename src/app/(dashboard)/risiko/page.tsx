import { auth } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import DashboardHeader from "@/components/DashboardHeader"
import RisikoArkiv from "@/components/RisikoArkiv"
import { redirect } from "next/navigation"
import { RisikoVurdering, User } from "@prisma/client"

interface RisikoVurderingWithRelations extends RisikoVurdering {
  prosjekt: {
    navn: string;
  };
  opprettetAv: {
    id: string;
    navn: string;
    etternavn: string;
    bedriftId: string;
  };
  behandler: {
    id: number;
    navn: string;
    etternavn: string;
    bedriftId: number;
  } | null;
}

export default async function RisikoPage() {
  const session = await auth()
  const currentUser = await db.user.findUnique({
    where: { id: session?.user?.id },
    include: { bedrift: true },
  })

  if (!currentUser) {
    redirect("/auth/login")
  }

  const risikoVurderinger = await db.risikoVurdering.findMany({
    where: {
      bedriftId: currentUser.bedriftId
    },
    include: {
      prosjekt: {
        select: {
          navn: true
        }
      },
      opprettetAv: {
        select: {
          id: true,
          navn: true,
          etternavn: true,
          bedriftId: true
        }
      },
      behandler: {
        select: {
          id: true,
          navn: true,
          etternavn: true,
          bedriftId: true
        }
      }
    },
    orderBy: {
      opprettetDato: 'desc'
    }
  }) as RisikoVurderingWithRelations[]

  return (
    <div className="container mx-auto py-6">
      <DashboardHeader currentUser={currentUser} />
      <RisikoArkiv 
        risikoVurderinger={risikoVurderinger}
        currentUser={currentUser}
      />
    </div>
  )
}

