import { auth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import DashboardHeader from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { StatusEndring } from "@/components/StatusEndring";

async function getSJASkjema(id: string) {
  const skjema = await db.sJASkjema.findUnique({
    where: { id },
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
      SJAProdukt: {
        select: {
          id: true,
          navn: true,
          mengde: true,
          produktId: true,
          databladUrl: true
        }
      },
      bilder: {
        select: {
          id: true,
          url: true,
          navn: true
        }
      }
    }
  });

  if (skjema?.SJAProdukt) {
    const produkterMedDatablad = await Promise.all(
      skjema.SJAProdukt.map(async (produkt) => {
        if (produkt.produktId) {
          const stoffkartotek = await db.stoffkartotek.findUnique({
            where: { id: produkt.produktId },
            select: { databladUrl: true }
          });
          return {
            ...produkt,
            databladUrl: stoffkartotek?.databladUrl
          };
        }
        return produkt;
      })
    );
    return { ...skjema, SJAProdukt: produkterMedDatablad };
  }

  return skjema;
}

export default async function SJADetaljer({ params }: { params: { id: string } }) {
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

  const sjaSkjema = await getSJASkjema(params.id);
  if (!sjaSkjema) {
    redirect("/sja");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader currentUser={currentUser} />
      <div className="container mx-auto py-8">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href="/sja">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tilbake til oversikt
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{sjaSkjema.jobTitle}</h1>
              <p className="text-sm text-muted-foreground">
                Opprettet: {format(sjaSkjema.opprettetDato, 'PPP', { locale: nb })}
              </p>
            </div>
          </div>
          
          <div className="flex flex-row items-center gap-4 justify-start sm:justify-end ml-2">
            <Badge className="whitespace-nowrap text-xs sm:text-sm px-2 py-1" variant={
              sjaSkjema.status === 'Godkjent' 
              ? 'default' 
              : sjaSkjema.status === 'Sendt inn' 
              ? 'secondary'
              : 'default'
            }>
              {sjaSkjema.status || 'Sendt inn'}
            </Badge>
            </div>
            <div className="ml-2">
            <StatusEndring 
              skjemaId={sjaSkjema.id} 
              currentStatus={sjaSkjema.status || 'Ubehandlet'} 
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Generell informasjon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Arbeidssted</Label>
                  <p className="mt-1">{sjaSkjema.jobLocation}</p>
                </div>
                <div>
                  <Label>Prosjekt</Label>
                  <p className="mt-1">{sjaSkjema.prosjekt?.navn}</p>
                </div>
                <div>
                  <Label>Deltakere</Label>
                  <p className="mt-1">{sjaSkjema.participants}</p>
                </div>
                <div>
                  <Label>Ansvarlig person</Label>
                  <p className="mt-1">{sjaSkjema.responsiblePerson}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Arbeidsbeskrivelse</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{sjaSkjema.jobDescription}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risikovurdering</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Identifiserte risikoer</Label>
                <p className="mt-1">{sjaSkjema.identifiedRisks}</p>
              </div>
              <div>
                <Label>Risikoreduserende tiltak</Label>
                <p className="mt-1">{sjaSkjema.riskMitigation}</p>
              </div>
            </CardContent>
          </Card>

          {sjaSkjema.SJAProdukt && sjaSkjema.SJAProdukt.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Produkter i bruk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sjaSkjema.SJAProdukt.map((produkt) => (
                    <div key={produkt.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{produkt.navn}</p>
                        <p className="text-sm text-muted-foreground">Mengde: {produkt.mengde}</p>
                      </div>
                      <div className="flex gap-2">
                        {produkt.produktId && (
                          produkt.databladUrl ? (
                            <Link href={produkt.databladUrl} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                Åpne datablad
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/stoffkartotek/${produkt.produktId}`}>
                              <Button variant="outline" size="sm">
                                Se i stoffkartotek
                              </Button>
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {sjaSkjema.bilder && sjaSkjema.bilder.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bilder</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sjaSkjema.bilder.map((bilde) => (
                    <div key={bilde.id} className="relative group">
                      <Image
                        src={bilde.url}
                        alt={bilde.navn || 'SJA bilde'}
                        width={200}
                        height={200}
                        className="rounded-md object-cover w-full h-40"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 