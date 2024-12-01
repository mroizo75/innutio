"use client"

import { useAdminData } from "@/hooks/useAdminData"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Activity, Users, Package2 } from "lucide-react"
import { HoursPerProjectChart } from './HoursPerProjectChart'
import { AddUserModal } from '@/components/AddUserModal'
import TimeTrackingCard from './TimeTrackingCard'
import ExportTimeTrackingCard from './ExportTimeTrackingCard'
import { Avatar, AvatarFallback } from "./ui/avatar"
import { EditUserModal } from './EditUserModal'
import { DeleteUserButton } from './DeleteUserButton'
import DashboardHeader from '@/components/DashboardHeader'
import { CreditCard, DollarSign } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { auth } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import { generatePasswordResetToken } from '@/lib/tokens' // Fra tokens
import { sendPasswordResetEmail } from "@/lib/mail"      // Fra mail
import { createUser } from "@/data/user"                 // Fra data/user
import { getUserByEmail } from "@/data/user"            // Fra data/user
import { UserRole } from "@prisma/client"
import { useRouter } from 'next/navigation'

type User = {
  id: string;
  navn: string;
  etternavn: string;
  email: string;
  role: string;
  bedriftId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Bedrift = {
  id: string;
  navn: string;
  orgNr: string;
  users: User[];
};

type Stats = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalProjects: number;
};

export default function AdminDashboard({ currentUser, revalidateAdmin }: { currentUser: any, revalidateAdmin: () => Promise<void> }) {
  const { data, isLoading, error } = useAdminData()
  
  // Debug logging
  console.log('AdminData:', data);
  console.log('Bedrift:', data?.bedrift);
  console.log('Prosjekter:', data?.bedrift?.prosjekter);

  if (isLoading) return <div>Laster data...</div>
  if (error) return <div>Feil ved lasting av data: {error.message}</div>
  if (!data) return <div>Ingen data tilgjengelig</div>

  const { bedrift } = data
  if (!bedrift?.prosjekter) {
    console.log('Ingen prosjekter funnet');
    return <div>Laster prosjekter...</div>
  }

  const chartData = bedrift.prosjekter.map((prosjekt: any) => {
    // Debug logging
    console.log('Prosesserer prosjekt:', prosjekt);
    console.log('TimeEntries for prosjekt:', prosjekt.timeEntries);
    
    const totalTimer = prosjekt.timeEntries?.reduce((sum: number, entry: any) => 
      sum + (Number(entry.hours) || 0), 0
    ) || 0;
    
    return {
      prosjektNavn: prosjekt.navn,
      timer: totalTimer
    };
  });

  console.log('Formatert chartData:', chartData);

  const oppgaver = bedrift.prosjekter.flatMap((p: any) => p.oppgaver).slice(0, 10)
  const employeeCount = bedrift.users.length
  const activeProjects = bedrift.prosjekter.filter((p: any) => p.status === 'STARTET').length
  const notStartedProjects = bedrift.prosjekter.filter((p: any) => p.status === 'IKKE_STARTET').length
  const completedProjects = bedrift.prosjekter.filter((p: any) => p.status === 'AVSLUTTET').length

    // Beregn oppgavestatistikk
    const prosjektMedTelling = bedrift.prosjekter.map((prosjekt: any) => ({
        ...prosjekt,
        oppgaveTelling: prosjekt.oppgaver.reduce((acc: any, oppgave: any) => {
          acc.total++
          acc[oppgave.status.toLowerCase() as keyof typeof acc]++
          return acc
        }, { total: 0, ikkestartet: 0, igang: 0, fullfort: 0 })
      }))

      const addUser = async (formData: FormData) => {
        
        const session = await auth()
        if (!session?.user?.id) {
          throw new Error("Ikke autentisert")
        }
    
        const adminUser = await db.user.findUnique({
          where: { id: session.user.id }
        })
    
        if (adminUser?.role !== "ADMIN") {
          throw new Error("Bare administratorer kan legge til nye brukere")
        }
    
        const navn = formData.get("navn") as string
        const etternavn = formData.get("etternavn") as string
        const email = formData.get("email") as string
        const position = formData.get("position") as string
        const role = formData.get("role") as UserRole
      
        try {
          const existingUser = await getUserByEmail(email)
          if (existingUser) {
            return { error: "En bruker med denne e-postadressen eksisterer allerede" }
          }
      
          const user = await createUser({
            navn,
            etternavn,
            email,
            position,
            role: role || "USER",
            bedriftId: adminUser.bedriftId!,
            password: "", // Tom passord, vil bli satt av brukeren senere
          });
      
          if (!user.success) {
            throw new Error(user.error);
          }
      
          const passwordResetToken = await generatePasswordResetToken(email);
          await sendPasswordResetEmail(
            passwordResetToken.email,
            passwordResetToken.token,
            "Sett opp ditt passord"
          );
          return { success: "Brukeren er lagt til og passordet sendt til e-post" }
        } catch (error) {
          return { error: "Noe gikk galt under registreringen" }
        }
      }
    


  const handleEdit = async (formData: FormData) => {
    try {
      const userId = formData.get("userId") as string
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          navn: formData.get("navn"),
          etternavn: formData.get("etternavn"),
          email: formData.get("email"),
          position: formData.get("position"),
          role: formData.get("role"),
        }),
      })

      if (!response.ok) {
        throw new Error('Feil ved oppdatering')
      }

      await revalidateAdmin() // Server-side revalidering
      toast.success('Bruker oppdatert')
    } catch (error) {
      console.error('Feil ved redigering:', error)
      toast.error('Kunne ikke oppdatere bruker')
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Er du sikker på at du vil slette denne brukeren?')) {
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Kunne ikke slette bruker')
      }

      // Oppdater UI eller refresh data
      window.location.reload()
    } catch (error) {
      console.error('Feil ved sletting av bruker:', error)
      toast.error('Kunne ikke slette bruker')
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div>Velkommen til bedriftsadministrasjonen {currentUser.bedrift?.navn}</div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
  <Card className="shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        Ansatte
      </CardTitle>
      <Users className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{employeeCount}</div>
      <p className="text-xs text-muted-foreground">
        Totalt antall ansatte
      </p>
    </CardContent>
  </Card>
  <Card className="shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        Aktive prosjekter
      </CardTitle>
      <Activity className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{activeProjects}</div>
      <p className="text-xs text-muted-foreground">
        Prosjekter som er i gang
      </p>
    </CardContent>
  </Card>
  <Card className="shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Planlagte prosjekter</CardTitle>
      <CreditCard className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{notStartedProjects}</div>
      <p className="text-xs text-muted-foreground">
        Prosjekter som ikke har startet
      </p>
    </CardContent>
  </Card>
  <Card className="shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Fullførte prosjekter</CardTitle>
      <DollarSign className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{completedProjects}</div>
      <p className="text-xs text-muted-foreground">
        Prosjekter som er ferdigstilt
      </p>
    </CardContent>
  </Card>
  <Card className="shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Totale oppgaver</CardTitle>
      <Package2 className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {prosjektMedTelling.reduce((sum: number, p: any) => sum + p.oppgaveTelling.total, 0)}
      </div>
      <p className="text-xs text-muted-foreground">
        Totalt antall oppgaver på tvers av alle prosjekter
      </p>
    </CardContent>
  </Card>
</div>
        <HoursPerProjectChart chartData={chartData} />
        <div className="flex justify-between">
          <AddUserModal 
            currentUser={currentUser} 
            onAdd={addUser} 
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bedriftsbrukere</CardTitle>
            <CardDescription>Oversikt over alle brukere i bedriften</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Navn</TableHead>
                  <TableHead>E-post</TableHead>
                  <TableHead>Stilling</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Bedrift</TableHead>
                  <TableHead>Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bedrift.users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="mr-2 h-8 w-8">
                          <AvatarFallback>{user.navn.charAt(0)}{user.etternavn.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{`${user.navn} ${user.etternavn}`}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.position}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.bedrift?.navn}</TableCell>
                    <TableCell className="flex items-center space-x-2">
                      <EditUserModal user={user} onEdit={handleEdit} />
                      <DeleteUserButton userId={user.id} onDelete={handleDelete} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <ExportTimeTrackingCard currentUser={currentUser} />
        <TimeTrackingCard currentUser={currentUser} />

        <Card>
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
                        {oppgaver.map((oppgave: any) => (
                            <TableRow key={oppgave.id}>
                                <TableCell>{oppgave.tittel}</TableCell>
                                <TableCell>{oppgave.prosjekt?.navn || 'Ukjent prosjekt'}</TableCell>
                                <TableCell>{oppgave.bruker?.navn || 'Ukjent bruker'}</TableCell>
                                <TableCell>{oppgave.status}</TableCell>
                                <TableCell>{oppgave.sluttDato ? new Date(oppgave.sluttDato).toLocaleDateString() : 'Ikke satt'}</TableCell>
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