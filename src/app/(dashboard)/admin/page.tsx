import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { AdminDashboardClient } from '@/components/AdminDashboardClient'

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (user.role !== 'ADMIN' && user.role !== 'LEDER') {
    redirect('/404')
  }

  const bedrift = await db.bedrift.findUnique({
    where: { 
      id: user.bedriftId 
    },
    include: {
      users: {
        select: {
          id: true,
          navn: true,
          etternavn: true,
          email: true,
          role: true,
          position: true,
          active: true
        }
      },
      prosjekter: {
        where: {
          status: {
            not: "ARKIVERT"
          }
        },
        include: {
          oppgaver: true,
          users: {
            select: {
              id: true,
              navn: true,
              etternavn: true
            }
          },
          timeEntries: true
        }
      }
    }
  })

  return (
    <div className="min-h-screen">
      <AdminDashboardClient bedrift={bedrift} currentUser={user} />
    </div>
  )
}