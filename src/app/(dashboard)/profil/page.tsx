import { auth } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { ProfileForm } from "@/components/ProfileForm"
import { redirect } from "next/navigation"
import DashboardHeader from "@/components/DashboardHeader"

export default async function ProfilPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/login')
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={user} />
      <main className="flex flex-1 flex-col p-8">
        <ProfileForm user={user} />
      </main>
    </div>
  )
}