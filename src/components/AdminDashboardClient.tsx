"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import DashboardHeader from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Activity, CreditCard, DollarSign, Package2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EditUserModal } from '@/components/EditUserModal';
import { DeleteUserButton } from "@/components/DeleteUserButton";
import { AddUserModal } from '@/components/AddUserModal';
import { HoursPerProjectChart } from '@/components/HoursPerProjectChart';
import ExportTimeTrackingCard from "@/components/ExportTimeTrackingCard";
import TimeTrackingCard from "@/components/TimeTrackingCard";
import { AdminTimeManagement } from "@/components/AdminTimeManagement";
import { oppgaveStatusTilTekst, OppgaveStatus } from "@/utils/status-mapper";
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode } from "react";

type User = {
  bildeUrl: string;
  id: string;
  navn: string;
  etternavn: string;
  email: string;
  role: string;
  position?: string;
  active: boolean;
  bedrift?: {
    id: string;
    navn: string;
  };
};

type Bedrift = {
  id: string;
  navn: string;
  orgnr: string;
  users: User[];
};

type AdminDashboardClientProps = {
  currentUser: User;
  bedrift: Bedrift & {
    prosjekter: Array<{
      id: string;
      navn: string;
      status: string;
      oppgaver: any[];
      users: Array<{
        id: string;
        navn: string;
        etternavn: string;
      }>;
      timeEntries: any[];
    }>;
  };
};

export function AdminDashboardClient({ currentUser, bedrift }: AdminDashboardClientProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Kunne ikke hente dashboard data');
      }

      return response.json();
    },
    initialData: { bedrift }
  });

  console.log("Rendering state:", { isLoading, error, hasData: !!data });

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <DashboardHeader currentUser={currentUser as any} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[60px] mb-2" />
                  <Skeleton className="h-4 w-[120px]" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[200px] mb-2" />
              <Skeleton className="h-4 w-[300px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const prosjekter = data?.bedrift?.prosjekter || [];
  const users = data?.bedrift?.users || [];

  const statistics = {
    employeeCount: users.length,
    activeProjects: prosjekter.filter((p: any) => p.status === "STARTET").length,
    notStartedProjects: prosjekter.filter((p: any) => p.status === "IKKE_STARTET").length,
    completedProjects: prosjekter.filter((p: any) => p.status === "AVSLUTTET").length,
    totalTasks: prosjekter.reduce((acc: number, proj: any) => 
      acc + (proj.oppgaver?.length || 0), 0
    )
  };

  const handleUserUpdate = async () => {
    queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser as any} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div>Velkommen til dashboard for {currentUser.bedrift?.navn}</div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              <CardTitle className="text-sm font-medium">Aktive prosjekter</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{statistics.activeProjects}</div>
              <p className="text-xs text-green-600/75 dark:text-green-400">Prosjekter som er i gang</p>
            </CardContent>
          </Card>
          <Card className="shadow-md bg-yellow-50 dark:bg-yellow-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planlagte prosjekter</CardTitle>
              <CreditCard className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{statistics.notStartedProjects}</div>
              <p className="text-xs text-yellow-600/75 dark:text-yellow-400">Prosjekter som ikke har startet</p>
            </CardContent>
          </Card>
          <Card className="shadow-md bg-purple-50 dark:bg-purple-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fullførte prosjekter</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{statistics.completedProjects}</div>
              <p className="text-xs text-purple-600/75 dark:text-purple-400">Prosjekter som er ferdigstilt</p>
            </CardContent>
          </Card>
          <Card className="shadow-md bg-orange-50 dark:bg-orange-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale oppgaver</CardTitle>
              <Package2 className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{statistics.totalTasks}</div>
              <p className="text-xs text-orange-600/75 dark:text-orange-400">Totalt antall oppgaver</p>
            </CardContent>
          </Card>
        </div>

            <HoursPerProjectChart />


        <div className="flex justify-between">
          <AddUserModal onAdd={handleUserUpdate} />
        </div>

        <Card className="dark:border-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Bedriftsbrukere</CardTitle>
            <CardDescription className="dark:text-gray-400">Oversikt over alle brukere i bedriften</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="dark:border-gray-800">
                  <TableHead className="dark:text-gray-400">Navn</TableHead>
                  <TableHead className="dark:text-gray-400">E-post</TableHead>
                  <TableHead className="dark:text-gray-400">Stilling</TableHead>
                  <TableHead className="dark:text-gray-400">Bedrift</TableHead>
                  <TableHead className="dark:text-gray-400">Rolle</TableHead>
                  <TableHead className="dark:text-gray-400">Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: User) => (
                  <TableRow 
                    key={user.id} 
                    className="dark:border-gray-800 dark:hover:bg-gray-800/50"
                  >
                    <TableCell className="dark:text-gray-300">
                      <div className="flex items-center">
                        <Avatar className="mr-2 h-8 w-8">
                          <AvatarImage 
                            src={user.bildeUrl || ""} 
                            alt={`${user.navn} ${user.etternavn}`}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/images/placeholder-avatar.jpg";
                            }}
                          />
                          <AvatarFallback className="dark:bg-gray-700 dark:text-gray-300">
                            {user.navn.charAt(0)}{user.etternavn.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium dark:text-gray-200">{`${user.navn} ${user.etternavn}`}</div>
                          <div className="text-sm text-muted-foreground dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="dark:text-gray-300">{user.email}</TableCell>
                    <TableCell className="dark:text-gray-300">{user.position}</TableCell>
                    <TableCell className="dark:text-gray-300">{currentUser.bedrift?.navn}</TableCell>
                    <TableCell className="dark:text-gray-300">{user.role}</TableCell>
                    <TableCell className="flex items-center space-x-2">
                      <EditUserModal user={user as any} onEdit={handleUserUpdate} />
                      <DeleteUserButton userId={user.id} onDelete={handleUserUpdate} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-md mt-4">
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
                  {data.bedrift.prosjekter.flatMap((prosjekt: { oppgaver: any[]; navn: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; }) =>
                    prosjekt.oppgaver.map(oppgave => {
                      const brukteTimer = oppgave.timeEntries?.reduce(
                        (sum: any, entry: { hours: any; }) => sum + entry.hours, 
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

        <TimeTrackingCard currentUser={currentUser} />

        <Card className="shadow-md mt-4">
          <AdminTimeManagement
            timeEntries={prosjekter.flatMap((p: any) => p.timeEntries)}
            currentUser={currentUser as any}
            bedriftUsers={users}
            prosjekter={prosjekter}
          />
        </Card>

        <ExportTimeTrackingCard currentUser={currentUser as any} />

        <Card className="shadow-md mt-4">
          <CardHeader>
            <CardTitle>Siste oppgaver</CardTitle>
            <CardDescription>Oversikt over de siste 10 oppgavene i bedriften</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oppgave</TableHead>
                  <TableHead>Prosjekt</TableHead>
                  <TableHead>Ansvarlig</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Frist</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prosjekter
                  .flatMap((p: any) => p.oppgaver.map((o: any) => ({
                    ...o,
                    prosjekt: { navn: p.navn }
                  })))
                  .sort((a: any, b: any) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  )
                  .slice(0, 10)
                  .map((oppgave: any) => (
                    <TableRow key={oppgave.id}>
                      <TableCell>{oppgave.tittel}</TableCell>
                      <TableCell>{oppgave.prosjekt?.navn || 'Ukjent prosjekt'}</TableCell>
                      <TableCell>
                        {oppgave.bruker ? `${oppgave.bruker.navn} ${oppgave.bruker.etternavn}` : 'Ikke tildelt'}
                      </TableCell>
                      <TableCell>{oppgaveStatusTilTekst[oppgave.status as OppgaveStatus]}</TableCell>
                      <TableCell>
                        {oppgave.sluttDato ? new Date(oppgave.sluttDato).toLocaleDateString() : 'Ikke satt'}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}