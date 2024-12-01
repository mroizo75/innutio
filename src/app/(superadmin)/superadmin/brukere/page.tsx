import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { SuperAdminHeader } from "@/components/superadmin/SuperAdminHeader"
import { BrukerListe } from "@/components/superadmin/BrukerListe"
import { auth } from "@/lib/auth-utils"

export default async function BrukerePage() {
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

  const brukere = await db.user.findMany({
    include: {
      bedrift: true
    }
  })

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SuperAdminHeader currentUser={superadmin} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <BrukerListe brukere={brukere} />
      </main>
    </div>
  )
}