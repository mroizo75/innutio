import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";
import DashboardHeader from "@/components/DashboardHeader";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default async function SHAPlanDetaljer({ params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  const shaPlan = await db.sHAPlan.findUnique({
    where: { id: params.id },
    include: {
      prosjekt: true,
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
      vedlegg: true
    }
  });

  if (!shaPlan) {
    redirect("/404");
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader currentUser={currentUser} />
      <main className="flex flex-1 flex-col p-8">
        <Card>
          <CardHeader>
            <CardTitle>SHA-plan for {shaPlan.prosjekt.navn}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Grunnleggende informasjon</h3>
                <p><strong>Byggherre:</strong> {shaPlan.byggherre}</p>
                <p><strong>Entreprenør:</strong> {shaPlan.entreprenor}</p>
                <p><strong>Status:</strong> {shaPlan.status}</p>
                <p><strong>Opprettet:</strong> {format(new Date(shaPlan.opprettetDato), 'dd.MM.yyyy')}</p>
                <p><strong>Opprettet av:</strong> {shaPlan.opprettetAv.navn} {shaPlan.opprettetAv.etternavn}</p>
                {shaPlan.behandler && (
                  <p><strong>Behandler:</strong> {shaPlan.behandler.navn} {shaPlan.behandler.etternavn}</p>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold">Ansvarlige</h3>
                <p><strong>SHA-koordinator:</strong> {shaPlan.ansvarlige?.koordinator}</p>
                <p><strong>Verneombud:</strong> {shaPlan.ansvarlige?.verneombud}</p>
                <p><strong>Prosjektleder:</strong> {shaPlan.ansvarlige?.prosjektleder}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Risikoanalyse</h3>
              {shaPlan.risikoanalyse?.arbeidsoperasjoner.map((op: any, index: number) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <p><strong>Beskrivelse:</strong> {op.beskrivelse}</p>
                  <p><strong>Risiko:</strong> {op.risiko}</p>
                  <p><strong>Tiltak:</strong> {op.tiltak}</p>
                  <p><strong>Ansvarlig:</strong> {op.ansvarlig}</p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Vernetiltak</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(shaPlan.vernetiltak || {}).map(([type, tiltak]) => (
                  <div key={type}>
                    <h4 className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}e</h4>
                    <ul className="list-disc pl-4">
                      {tiltak.map((t: string, i: number) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Beredskapsplan</h3>
              <p><strong>Nødprosedyrer:</strong> {shaPlan.beredskapsplan?.nodprosedyrer}</p>
              <div className="mt-2">
                <h4 className="font-medium">Kontaktpersoner</h4>
                <div className="grid grid-cols-3 gap-4">
                  {shaPlan.beredskapsplan?.kontaktpersoner.map((person: any, index: number) => (
                    <div key={index} className="p-2 border rounded">
                      <p><strong>Navn:</strong> {person.navn}</p>
                      <p><strong>Rolle:</strong> {person.rolle}</p>
                      <p><strong>Telefon:</strong> {person.telefon}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-2"><strong>Møteplasser:</strong> {shaPlan.beredskapsplan?.moteplasser}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}