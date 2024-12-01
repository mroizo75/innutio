import { getCurrentUser } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import DashboardHeader from "@/components/DashboardHeader"
import SJADashboard from "@/components/SJADashboard"
import { db } from "@/lib/db"

const SJAPage = async () => {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect("/auth/login")
  }

  const sjaSkjemaer = await db.sJASkjema.findMany({
    include: {
      prosjekt: true,
      opprettetAv: true,
      behandler: true,
      SJAProdukt: true,
      bilder: true,
    },
  })

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader currentUser={currentUser} />
      <SJADashboard sjaSkjemaer={sjaSkjemaer} />
    </div>
  )
}

export default SJAPage