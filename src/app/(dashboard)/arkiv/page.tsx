
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";
import { ArkiverteProsjekter } from "@/components/ArkiverteProsjekter";
import { ProsjektStatus } from "@prisma/client";

async function getArkiverteProsjekter(bedriftId: string) {
  return await db.prosjekt.findMany({
    where: {
      bedriftId,
      status: ProsjektStatus.ARKIVERT,
    },
    include: {
      oppgaver: true,
      timeEntries: true,
      users: {
        select: {
          id: true,
          navn: true,
          etternavn: true,
        },
      },
    },
    orderBy: {
      sluttDato: "desc",
    },
  });
}

export default async function ArkivPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  if (currentUser.role !== "LEDER" && currentUser.role !== "ADMIN" && currentUser.role !== "PROSJEKTLEDER") {
    redirect("/404");
  }

  const arkiverteProsjekter = await getArkiverteProsjekter(currentUser.bedriftId);

  return (
    <div className="flex min-h-screen flex-col shadow-lg">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex-1 p-6 dark:bg-black">
        <div className="bg-white shadow rounded-lg p-6 dark:bg-black">
          <ArkiverteProsjekter prosjekter={arkiverteProsjekter as any} />
        </div>
      </main>
    </div>
  );
}