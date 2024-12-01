import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { UserRole } from '@prisma/client'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  const currentUser = {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role as UserRole,
    bedriftId: session.user.bedriftId,
  }

  return currentUser
}

export async function requireAuth(role?: UserRole) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Ikke autentisert')
  }

  if (role && user.role !== role) {
    throw new Error('Ikke autorisert')
  }

  return user
}
