import { redirect } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";
import { getCurrentUser } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { SHAPlanBoard } from "@/components/SHAPlanBoard";
import Link from "next/link";

export default async function SHAPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  if (currentUser.role !== "LEDER" && currentUser.role !== "ADMIN" && currentUser.role !== "PROSJEKTLEDER") {
    redirect("/404");
  }

  const shaPlaner = await db.sHAPlan.findMany({
    where: { 
      bedriftId: currentUser.bedriftId,
      status: { not: 'Arkivert' }
    },
    include: {
      opprettetAv: {
        select: {
          navn: true,
          etternavn: true
        }
      },
      behandler: {
        select: {
          navn: true,
          etternavn: true
        }
      },
      prosjekt: {
        select: {
          navn: true
        }
      },
      vedlegg: true
    },
    orderBy: { opprettetDato: 'desc' }
  });

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex flex-1 flex-col p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">SHA-planer</h1>
          <Link href="/sha/ny" className="btn btn-primary">
            Ny SHA-plan
          </Link>
        </div>
        <SHAPlanBoard shaPlaner={shaPlaner} currentUser={currentUser} />
      </main>
    </div>
  );
}