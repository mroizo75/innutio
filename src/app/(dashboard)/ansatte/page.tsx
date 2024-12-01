import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';
import DashboardHeader from '@/components/DashboardHeader';
import AnsatteListe from '@/components/AnsatteListe';

const AnsattePage = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (currentUser?.role !== UserRole.ADMIN && currentUser?.role !== UserRole.LEDER) {
    redirect('/404');
  }

  const ansatte = await db.user.findMany({
    where: { 
      bedriftId: currentUser?.bedriftId,
      role: {
        in: [
          UserRole.ADMIN,
          UserRole.LEDER,
          UserRole.PROSJEKTLEDER,
          UserRole.USER
        ]
      }
    },
    include: {
      bedrift: true,
    },
  });

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex flex-1 flex-col p-8">
        <h1 className="text-3xl font-bold mb-6">Ansatte oversikt</h1>
        <AnsatteListe ansatte={ansatte} />
      </main>
    </div>
  );
};

export default AnsattePage;
