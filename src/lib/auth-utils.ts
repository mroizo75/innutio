import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Sørg for at funksjonen er eksportert
export async function auth() {
  const session = await getServerSession(authOptions);
  return session;
}

// Hvis du har flere funksjoner, eksporter dem også
export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const currentUser = {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
    bedriftId: session.user.bedriftId,
    // Legg til eventuelle andre nødvendige felt
  };

  return currentUser;
}
