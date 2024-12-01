import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { SuperAdminHeader } from "@/components/superadmin/SuperAdminHeader"
import { SupportLogg } from "@/components/superadmin/SupportLogg"
import { auth } from "@/lib/auth-utils"

export default async function SupportPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const superadmin = await db.superAdmin.findUnique({
    where: { id: session.user.id }
  })

  if (!superadmin) {
    redirect("/404")
  }

  // Hent alle support-logger på tvers av bedrifter
  const allSupportLogs = await db.supportLogg.findMany({
    include: {
      bedrift: {
        select: {
          id: true,
          navn: true
        }
      },
      superAdmin: {
        select: {
          navn: true,
          etternavn: true
        }
      },
      user: {
        select: {
          navn: true
        }
      },
      resolvedBy: {
        select: {
          navn: true,
          etternavn: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Serialiser superadmin-dataen
  const serializedSuperAdmin = {
    id: superadmin.id,
    navn: superadmin.navn,
    etternavn: superadmin.etternavn,
    email: superadmin.email,
    role: superadmin.role
  }

  // Serialiser support-logg dataen
  const serializedData = {
    id: "all",
    navn: "Alle bedrifter",
    supportLogg: allSupportLogs.map(logg => ({
      id: logg.id,
      type: logg.type,
      beskrivelse: logg.beskrivelse,
      opprettetAv: logg.opprettetAv,
      createdAt: logg.createdAt.toISOString(),
      status: logg.status || 'OPEN',
      bedrift: {
        id: logg.bedrift.id,
        navn: logg.bedrift.navn
      },
      superAdmin: logg.superAdmin,
      user: logg.user,
      resolvedBy: logg.resolvedBy,
      resolvedAt: logg.resolvedAt?.toISOString()
    }))
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SuperAdminHeader currentUser={serializedSuperAdmin} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <SupportLogg bedrift={serializedData} />
      </main>
    </div>
  )
}