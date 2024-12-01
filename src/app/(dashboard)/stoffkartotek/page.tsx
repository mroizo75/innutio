import { auth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import DashboardHeader from "@/components/DashboardHeader";
import { redirect } from "next/navigation";
import { StoffkartotekClient } from "@/components/StoffkartotekClient";
import { revalidatePath } from "next/cache";
import { cache } from 'react'

const getStoffkartotekData = cache(async (bedriftId: string) => {
  return await db.stoffkartotek.findMany({
    where: { bedriftId },
    include: {
      FareSymbolMapping: true,
      opprettetAv: {
        select: {
          navn: true,
          etternavn: true
        }
      }
    },
    orderBy: {
      produktnavn: 'asc'
    }
  });
});

const getCurrentUserData = cache(async (userId: string) => {
  return await db.user.findUnique({
    where: { id: userId },
    include: { bedrift: true },
  });
});

export default async function StoffkartotekPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const currentUser = await getCurrentUserData(session.user.id);
  if (!currentUser) {
    redirect("/auth/login");
  }

  async function revalidateStoffkartotek() {
    'use server'
    revalidatePath('/stoffkartotek')
  }

  const stoffkartotek = await getStoffkartotekData(session.user.bedriftId);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <DashboardHeader currentUser={currentUser} 
      />
      <StoffkartotekClient 
        initialStoffkartotek={stoffkartotek}
        currentUser={currentUser}
      />
    </div>
  );
}