
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import DashboardHeader from "@/components/DashboardHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import TimeTrackingCard from "@/components/TimeTrackingCard"
import { Activity, CheckCircle, Clock, ListTodo, BookOpen } from "lucide-react"
import { getCurrentUser } from "@/lib/auth-utils"
import Link from "next/link"
import { MobileOppgaveVisning } from "@/components/MobileOppgaveVisning"
import { User } from "@prisma/client"



const AnsattPage = async () => {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect("/auth/login")
  }

    // Sjekk om brukeren er en vanlig ansatt eller admin
    if (currentUser.role !== "USER" && currentUser.role !== "ADMIN") {
      redirect("/404")
    }

    // For admin, vi kan enten vise deres egen informasjon eller la dem velge en ansatt
  const userId = currentUser.role === "ADMIN" ? currentUser.id : currentUser.id
  // Hvis du vil implementere funksjonalitet for admin å velge ansatt, må du legge til logikk her

  // Hent brukerens oppgaver
  const oppgaver = currentUser.oppgaver


// Beregn statistikk
const totalOppgaver = oppgaver.length
const fullforteOppgaver = oppgaver.filter(o => o.status === 'FULLFORT').length
const pagaendeOppgaver = oppgaver.filter(o => o.status === 'I_GANG').length
const ikkeStartetOppgaver = oppgaver.filter(o => o.status === 'IKKE_STARTET').length


  // Hent brukerens tidsregistreringer
  const tidsregistreringer = await db.timeEntry.findMany({
    where: { brukerId: currentUser.id },
    include: { prosjekt: true },
    orderBy: { date: 'desc' },
    take: 5,
  })

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <h1 className="text-3xl font-bold">Velkommen, {currentUser.navn}!</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale oppgaver</CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOppgaver}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fullførte oppgaver</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fullforteOppgaver}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pågående oppgaver</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagaendeOppgaver}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ikke startet</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ikkeStartetOppgaver}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dine oppgaver</CardTitle>
            <CardDescription>Oversikt over dine tildelte oppgaver</CardDescription>
          </CardHeader>
          <CardContent>
          <MobileOppgaveVisning oppgaver={oppgaver as any} currentUser={currentUser as User} />
          </CardContent>
        </Card>
        <TimeTrackingCard currentUser={currentUser as User} />
        <Card>
          <CardHeader>
            <CardTitle>HMS Dokumentasjon</CardTitle>
            <CardDescription>Tilgang til bedriftens HMS-dokumenter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/hms" className="flex items-center space-x-2 text-sm">
              <BookOpen className="h-4 w-4" />
              <span>HMS Håndbok</span>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default AnsattPage
