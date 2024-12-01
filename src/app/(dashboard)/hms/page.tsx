import { auth } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import DashboardHeader from "@/components/DashboardHeader"
import HMSContent from "@/components/HMSContent"
import { redirect } from "next/navigation"

const HMSPage = async () => {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    include: { 
      bedrift: {
        include: {
          prosjekter: true
        }
      }
    },
  })

  if (!currentUser) {
    redirect("/auth/login")
  }

  return (
    <div className="flex flex-col h-screen">
      <DashboardHeader currentUser={currentUser} />
      <HMSContent currentUser={currentUser} />
    </div>
  )
}

export default HMSPage