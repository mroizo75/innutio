import DashboardHeader from "@/components/DashboardHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import TimeTrackingCard from "@/components/TimeTrackingCard"
import { HoursPerProjectChart } from '@/components/HoursPerProjectChart'
import { getCurrentUser } from "@/lib/auth-utils"
import { Activity, DollarSign, CreditCard } from "lucide-react"

interface ChartData {
  prosjektNavn: string;
  timer: number;
}

const ProsjektLederPage = async () => {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect("/auth/login")
  }

  if (currentUser.role !== "LEDER" && currentUser.role !== "ADMIN" && currentUser.role !== "PROSJEKTLEDER") {
    redirect("/404")
  }

  const prosjektTimer = await db.timeEntry.groupBy({
    by: ['prosjektId'],
    _sum: {
      hours: true,
    },
    where: {
      brukerId: currentUser.id,
    },
  })

  const chartData: ChartData[] = await Promise.all(
    prosjektTimer.map(async (item) => {
      const prosjekt = await db.prosjekt.findUnique({
        where: { id: item.prosjektId },
        select: { navn: true },
      })
      return {
        prosjektNavn: prosjekt?.navn || 'Ukjent',
        timer: item._sum.hours || 0,
      }
    })
  )

    // Beregn statistikk fra bedriftsdata
    const statistics = {
      employeeCount: currentUser.bedrift.users.length,
      activeProjects: currentUser.bedrift.prosjekter.filter((p: any) => p.status === "STARTET").length,
      notStartedProjects: currentUser.bedrift.prosjekter.filter((p: any) => p.status === "IKKE_STARTET").length,
      completedProjects: currentUser.bedrift.prosjekter.filter((p: any) => p.status === "AVSLUTTET").length,
      totalTasks: currentUser.bedrift.prosjekter.reduce((acc: number, proj: any) => 
        acc + (proj.oppgaver?.length || 0), 0
    )
  };

  return (
    <div>
      <DashboardHeader currentUser={currentUser as any} />

      <main className="p-4">
        <div className="mt-4">
          <p className="text-xl font-bold">Prosjektleder Dashboard for {currentUser.bedrift.navn}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <Card className="shadow-md bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive prosjekter</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{statistics.activeProjects}</div>
              <p className="text-xs text-blue-600">Prosjekter som er i gang</p>
            </CardContent>
          </Card>

          <Card className="shadow-md bg-yellow-50 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planlagte prosjekter</CardTitle>
              <CreditCard className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700">{statistics.notStartedProjects}</div>
              <p className="text-xs text-yellow-600">Prosjekter som ikke har startet</p>
            </CardContent>
          </Card>

          <Card className="shadow-md bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fullførte prosjekter</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{statistics.completedProjects}</div>
              <p className="text-xs text-green-600">Prosjekter som er ferdigstilt</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Timefordeling per Prosjekt</CardTitle>
            <CardDescription>Se hvor mange timer som er registrert per prosjekt.</CardDescription>
          </CardHeader>
          <CardContent>
            <HoursPerProjectChart chartData={chartData} />
          </CardContent>
        </Card>
        <div className="mt-4">
          <TimeTrackingCard currentUser={currentUser as any} />
        </div>
      </main>
    </div>
  )
}

export default ProsjektLederPage