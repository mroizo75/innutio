

import { db } from "@/lib/db";
import DashboardHeader from "@/components/DashboardHeader";
import RedigerProsjektForm from "@/components/RedigerProsjektForm";
import { notFound, redirect } from "next/navigation";
import { ProsjektStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth-utils";

interface Prosjekt {
  id: string;
  navn: string;
  beskrivelse: string;
  startDato: string;
  sluttDato: string;
  status: ProsjektStatus;
}

const RedigerProsjektPage = async ({ params }: { params: { prosjektId: string } }) => {
  const currentUser = await getCurrentUser()
  const prosjektId = params.prosjektId;

  if (!currentUser) {
    redirect("/auth/login")
    return;
  }

  if (currentUser.role !== "LEDER" && currentUser.role !== "ADMIN" && currentUser.role !== "PROSJEKTLEDER") {
    redirect("/404");
  }

  const prosjekt = await db.prosjekt.findUnique({
    where: { id: prosjektId },
    select: {
      id: true,
      navn: true,
      beskrivelse: true,
      startDato: true,
      sluttDato: true,
      status: true,
    },
  });

  if (!prosjekt) {
    return notFound();
  }

  // Konverter datoer til ISO-strenger
  const prosjektData = {
    ...prosjekt,
    startDato: prosjekt.startDato.toISOString(),
    sluttDato: prosjekt.sluttDato.toISOString(),
    status: prosjekt.status,
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex flex-1 flex-col p-8">
        <h1 className="text-3xl font-bold mb-6">Rediger Prosjekt</h1>
        <RedigerProsjektForm prosjekt={prosjektData as Prosjekt} />
      </main>
    </div>
  );
};

export default RedigerProsjektPage;