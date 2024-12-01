import { auth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import DashboardHeader from "@/components/DashboardHeader";
import { ProsjekterClient } from "./ProsjekterClient";
import { redirect } from "next/navigation";
import { AddProsjektModal } from "@/components/AddProsjektModal";
import { revalidatePath } from "next/cache";
import { OppgaveStatus } from "@/utils/status-mapper";
import { getCurrentUser } from "@/lib/auth-utils";
import { Suspense } from 'react';
import { ProsjekterSkeleton } from "@/components/ProsjekterSkeleton";
import { ProsjektStatus } from "@prisma/client";

async function getProsjekter(bedriftId: string) {
  const prosjekter = await db.prosjekt.findMany({
    where: {
      bedriftId: bedriftId,
      NOT: {
        status: ProsjektStatus.ARKIVERT
      }
    },
    include: {
      oppgaver: {
        select: {
          id: true,
          status: true,
        },
      },
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
      startDato: 'desc',
    },
  });

  return prosjekter;
}

export default async function ProsjekterPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  if (currentUser.role !== "LEDER" && currentUser.role !== "ADMIN" && currentUser.role !== "PROSJEKTLEDER") {
    redirect("/404");
  }

  const prosjekter = await getProsjekter(currentUser.bedriftId);

  const prosjektMedTelling = prosjekter.map((prosjekt) => {
    const telling: { [key in OppgaveStatus]: number } = {
      [OppgaveStatus.IKKE_STARTET]: 0,
      [OppgaveStatus.I_GANG]: 0,
      [OppgaveStatus.FULLFORT]: 0,
    };

    prosjekt.oppgaver.forEach((oppgave) => {
      if (telling[oppgave.status as OppgaveStatus] !== undefined) {
        telling[oppgave.status as OppgaveStatus]++;
      } else {
        console.warn(`Ukjent status: ${oppgave.status}`);
      }
    });

    return {
      ...prosjekt,
      oppgaveTelling: {
        total: prosjekt.oppgaver.length,
        ...telling,
      },
      status: prosjekt.status as ProsjektStatus,
    };
  });

  // Definer addProsjektAction-funksjonen
  const addProsjektAction = async (formData: FormData) => {
    "use server";

    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Bruker ikke autentisert");
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      throw new Error("Bruker ikke funnet");
    }

    if (currentUser.role !== "LEDER" && currentUser.role !== "ADMIN" && currentUser.role !== "PROSJEKTLEDER") {
      throw new Error("Du har ikke tilgang til å opprette prosjekter");
    }

    const navn = formData.get("navn") as string;
    const beskrivelse = formData.get("beskrivelse") as string;
    const startDato = new Date(formData.get("startDato") as string);
    const sluttDato = new Date(formData.get("sluttDato") as string);
    const status = formData.get("status") as string || "IKKE_STARTET";

    const nyProsjekt = await db.prosjekt.create({
      data: {
        navn,
        beskrivelse,
        startDato,
        sluttDato,
        status: status as ProsjektStatus,
        bedrift: {
          connect: {
            id: currentUser.bedriftId,
          },
        },
      },
    });

    revalidatePath("/prosjekter");
    return nyProsjekt;
  };

  return (
    <div className="flex min-h-screen flex-col shadow-lg">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex-1 p-6 dark:bg-black">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Prosjekter</h1>
          {(currentUser.role === "ADMIN" ||
            currentUser.role === "LEDER" ||
            currentUser.role === "PROSJEKTLEDER") && (
            <AddProsjektModal currentUser={currentUser} addProsjektAction={addProsjektAction as any} />
          )}
        </div>
        <div className="bg-white shadow rounded-lg p-6 dark:bg-black">
          <Suspense fallback={<ProsjekterSkeleton />}>
            <ProsjekterClient 
              initialProsjekter={prosjektMedTelling} 
              currentUser={currentUser} 
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
