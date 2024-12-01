import { auth } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardHeader from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

async function getProdukt(produktId: string) {
  return await db.stoffkartotek.findUnique({
    where: { id: produktId },
    include: {
      FareSymbolMapping: {
        select: {
          id: true,
          symbol: true
        }
      },
      opprettetAv: {
        select: {
          navn: true,
          etternavn: true
        }
      }
    }
  });
}

export default async function ProduktDetaljer({ params, searchParams }: { 
  params: { produktId: string },
  searchParams: { from?: string }
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!currentUser) {
    redirect("/auth/login");
  }

  const produkt = await getProdukt(params.produktId);
  if (!produkt) {
    redirect("/stoffkartotek");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader currentUser={currentUser} />
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href={searchParams.from ? `/sja/${searchParams.from}` : "/stoffkartotek"}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {searchParams.from ? 'Tilbake til SJA' : 'Tilbake til stoffkartotek'}
            </Button>
          </Link>
          {produkt.databladUrl && (
            <Link href={produkt.databladUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Åpne datablad
              </Button>
            </Link>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{produkt.produktnavn}</CardTitle>
            <p className="text-sm text-muted-foreground">Produsent: {produkt.produsent}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Beskrivelse</h3>
              <p>{produkt.beskrivelse}</p>
            </div>

            {produkt.FareSymbolMapping && produkt.FareSymbolMapping.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Faresymboler</h3>
                <div className="flex gap-4 flex-wrap">
                  {produkt.FareSymbolMapping.map((mapping) => (
                    <div key={mapping.id} className="flex items-center gap-2">
                      <span>{mapping.symbol}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Opprettet av: {produkt.opprettetAv?.navn} {produkt.opprettetAv?.etternavn}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}