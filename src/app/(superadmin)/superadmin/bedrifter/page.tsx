import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { SuperAdminHeader } from "@/components/superadmin/SuperAdminHeader"
import { BedriftListe } from "@/components/superadmin/BedriftListe"
import { auth } from "@/lib/auth-utils"

export default async function BedrifterPage() {
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

  const bedrifter = await db.bedrift.findMany({
    include: {
      users: true,
      prosjekter: true,
      supportLogg: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  })

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SuperAdminHeader currentUser={superadmin} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <BedriftListe bedrifter={bedrifter} />
      </main>
    </div>
  )
}