import { auth } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import DashboardHeader from "@/components/DashboardHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import TimeTrackingCard from "@/components/TimeTrackingCard"
import { Users, Activity, CreditCard, Package2, CheckCircle2 } from "lucide-react"
import { HoursPerProjectChart } from '@/components/HoursPerProjectChart'
import { Suspense } from "react"
import { AdminTimeManagement } from "@/components/AdminTimeManagement"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { oppgaveStatusTilTekst, OppgaveStatus } from "@/utils/status-mapper"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { TimeEntry } from "@prisma/client"

const LederDashboardSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px] mb-2" />
              <Skeleton className="h-4 w-[140px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px] mb-2" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px] mb-2" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const LederPage = async () => {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/auth/login")
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      bedrift: {
        include: {
          users: true,
          prosjekter: {
            include: {
              oppgaver: {
                include: {
                  bruker: true,
                  prosjekt: true,
                  timeEntries: true,
                }
              },
              timeEntries: true,
            }
          }
        }
      },
    }
  })

  if (!currentUser || (currentUser.role !== "LEDER" && currentUser.role !== "ADMIN")) {
    redirect("/404")
  }

  // Hent statistikk for bedriften
  const statistics = await db.bedrift.findUnique({
    where: { id: currentUser.bedriftId! },
    include: {
      users: true,
      prosjekter: {
        include: {
          oppgaver: true,
        }
      }
    }
  }).then(bedrift => ({
    employeeCount: bedrift?.users.length || 0,
    activeProjects: bedrift?.prosjekter.filter(p => p.status === "STARTET").length || 0,
    completedProjects: bedrift?.prosjekter.filter(p => p.status === "AVSLUTTET").length || 0,
    totalTasks: bedrift?.prosjekter.reduce((acc, proj) => acc + (proj.oppgaver?.length || 0), 0) || 0,
  }))

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard for {currentUser.bedrift.navn}, velkommen: {currentUser.navn}</h1>
        </div>

        <Suspense fallback={<LederDashboardSkeleton />}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-md bg-blue-50 dark:bg-blue-950">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ansatte</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{statistics.employeeCount}</div>
                <p className="text-xs text-blue-600/75 dark:text-blue-400">Totalt antall ansatte</p>
              </CardContent>
            </Card>

            <Card className="shadow-md bg-green-50 dark:bg-green-950">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktive Prosjekter</CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">{statistics.activeProjects}</div>
                <p className="text-xs text-green-600/75 dark:text-green-400">Pågående prosjekter</p>
              </CardContent>
            </Card>

            <Card className="shadow-md bg-purple-50 dark:bg-purple-950">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fullførte Prosjekter</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{statistics.completedProjects}</div>
                <p className="text-xs text-purple-600/75 dark:text-purple-400">Avsluttede prosjekter</p>
              </CardContent>
            </Card>

            <Card className="shadow-md bg-orange-50 dark:bg-orange-950">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Totale Oppgaver</CardTitle>
                <Package2 className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{statistics.totalTasks}</div>
                <p className="text-xs text-orange-600/75 dark:text-orange-400">Oppgaver på tvers av prosjekter</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Timer per Prosjekt</CardTitle>
                <CardDescription>Oversikt over timeforbruk på aktive prosjekter</CardDescription>
              </CardHeader>
              <CardContent className="h-[100%]">
                <HoursPerProjectChart />
              </CardContent>
            </Card>

            <Card className="shadow-md mt-4">
              <CardHeader>
                <CardTitle>Timeregistrering for Ansatte</CardTitle>
                <CardDescription>Administrer timer for alle ansatte</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminTimeManagement 
                  timeEntries={currentUser.bedrift.prosjekter.flatMap(p => p.timeEntries) as TimeEntry[]}
                  currentUser={currentUser}
                  bedriftUsers={currentUser.bedrift.users}
                  prosjekter={currentUser.bedrift.prosjekter}
                />
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Din Timeregistrering</CardTitle>
                <CardDescription>Registrer dine egne timer på prosjekter og oppgaver</CardDescription>
              </CardHeader>
              <CardContent>
                <TimeTrackingCard currentUser={currentUser} />
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Bemanningsplan og Oppgaveoversikt</CardTitle>
                <CardDescription>
                  Fullstendig oversikt over alle oppgaver og ressursallokering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Prosjekt</TableHead>
                        <TableHead>Oppgave</TableHead>
                        <TableHead>Ansvarlig</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Estimerte Timer</TableHead>
                        <TableHead>Brukte Timer</TableHead>
                        <TableHead>Start Dato</TableHead>
                        <TableHead>Frist</TableHead>
                        <TableHead>Prioritet</TableHead>
                        <TableHead>Fremdrift</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentUser.bedrift.prosjekter.flatMap(prosjekt =>
                        prosjekt.oppgaver.map(oppgave => {
                          const brukteTimer = oppgave.timeEntries?.reduce(
                            (sum, entry) => sum + entry.hours, 
                            0
                          ) || 0;
                          
                          const fremdriftProsent = oppgave.estimertTid 
                            ? Math.min(Math.round((brukteTimer / oppgave.estimertTid) * 100), 100)
                            : 0;

                          return (
                            <TableRow key={oppgave.id}>
                              <TableCell>{prosjekt.navn}</TableCell>
                              <TableCell>{oppgave.tittel}</TableCell>
                              <TableCell>
                                {oppgave.bruker 
                                  ? `${oppgave.bruker.navn} ${oppgave.bruker.etternavn}`
                                  : 'Ikke tildelt'}
                              </TableCell>
                              <TableCell>
                                {oppgaveStatusTilTekst[oppgave.status as OppgaveStatus]}
                              </TableCell>
                              <TableCell>{oppgave.estimertTid || 'Ikke satt'}</TableCell>
                              <TableCell>{brukteTimer.toFixed(1)}</TableCell>
                              <TableCell>
                                {oppgave.startDato 
                                  ? format(new Date(oppgave.startDato), 'dd.MM.yyyy', { locale: nb })
                                  : 'Ikke satt'}
                              </TableCell>
                              <TableCell>
                                {oppgave.sluttDato 
                                  ? format(new Date(oppgave.sluttDato), 'dd.MM.yyyy', { locale: nb })
                                  : 'Ikke satt'}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  oppgave.prioritet === 'HOY' 
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    : oppgave.prioritet === 'MEDIUM'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                }`}>
                                  {oppgave.prioritet}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                  <div 
                                    className="bg-blue-600 h-2.5 rounded-full dark:bg-blue-500"
                                    style={{ width: `${fremdriftProsent}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {fremdriftProsent}%
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </Suspense>
      </main>
    </div>
  )
}

export default LederPage