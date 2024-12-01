"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Prosjekt, User } from "@prisma/client";
import { Edit, FileText, Trash2, Archive } from "lucide-react";
import { slettProsjekt } from "@/actions/prosjekt-actions";
import { toast } from "react-hot-toast";
import { ProsjekterSkeleton } from "@/components/ProsjekterSkeleton";

interface ProsjektMedTelling extends Prosjekt {
  oppgaveTelling: {
    total: number;
    IKKE_STARTET: number;
    I_GANG: number;
    FULLFORT: number;
  };
}

interface Oppgave {
  status: 'IKKE_STARTET' | 'I_GANG' | 'FULLFORT';
}

interface ProsjektResponse extends Prosjekt {
  oppgaver: Oppgave[];
}

interface ProsjekterClientProps {
  initialProsjekter: ProsjektMedTelling[];
  currentUser: User;
}

export function ProsjekterClient({ initialProsjekter, currentUser }: ProsjekterClientProps) {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const { data: prosjekter = initialProsjekter } = useQuery({
    queryKey: ['prosjekter', currentUser.bedriftId],
    queryFn: async () => {
      const response = await fetch('/api/prosjekter');
      if (!response.ok) throw new Error('Kunne ikke hente prosjekter');
      const data: ProsjektResponse[] = await response.json();
      
      return data.map((prosjekt) => {
        const telling = {
          IKKE_STARTET: 0,
          I_GANG: 0,
          FULLFORT: 0,
        };

        prosjekt.oppgaver.forEach((oppgave) => {
          if (telling[oppgave.status] !== undefined) {
            telling[oppgave.status]++;
          }
        });

        return {
          ...prosjekt,
          oppgaveTelling: {
            total: prosjekt.oppgaver.length,
            ...telling,
          },
        };
      }).filter((prosjekt: ProsjektMedTelling) => prosjekt.status !== 'ARKIVERT');
    },
    initialData: initialProsjekter,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const oppdaterProsjekter = useCallback(() => {
    console.log('Oppdaterer prosjekter for rolle:', currentUser.role);
    queryClient.invalidateQueries({ queryKey: ['prosjekter', currentUser.bedriftId] });
  }, [queryClient, currentUser.bedriftId, currentUser.role]);

  useEffect(() => {
    window.addEventListener('prosjektOpprettet', oppdaterProsjekter);
    return () => {
      window.removeEventListener('prosjektOpprettet', oppdaterProsjekter);
    };
  }, [oppdaterProsjekter]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <ProsjekterSkeleton />;
  }

  const genererSluttrapport = async (prosjektId: string) => {
    try {
      const res = await fetch(`/api/prosjekt/${prosjektId}/generer-sluttrapport`);
      if (!res.ok) {
        throw new Error('Feil ved generering av sluttrapport');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sluttrapport_${prosjektId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Feil ved generering av sluttrapport:', error);
      alert('Det oppstod en feil ved generering av sluttrapporten.');
    }
  };

  const arkiverProsjekt = async (prosjektId: string) => {
    if (confirm("Er du sikker på at du vil arkivere dette prosjektet?")) {
      try {
        const response = await fetch(`/api/prosjekt/${prosjektId}/arkiver`, {
          method: "POST",
        });
        
        if (!response.ok) {
          throw new Error("Kunne ikke arkivere prosjektet");
        }
        
        toast.success("Prosjektet ble arkivert");
      } catch (error) {
        console.error("Feil ved arkivering:", error);
        toast.error("Kunne ikke arkivere prosjektet");
      }
    }
  };

  const handleSlettProsjekt = async (prosjektId: string) => {
    if (confirm("Er du sikker på at du vil slette dette prosjektet?")) {
      try {
        await slettProsjekt(prosjektId);
        toast.success("Prosjektet ble slettet");
        // Oppdater React Query cache umiddelbart
        await queryClient.invalidateQueries({ 
          queryKey: ['prosjekter', currentUser.bedriftId],
          exact: true 
        });
        await queryClient.refetchQueries({ 
          queryKey: ['prosjekter', currentUser.bedriftId],
          exact: true 
        });
      } catch (error) {
        console.error("Feil ved sletting:", error);
        toast.error("Kunne ikke slette prosjektet");
      }
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 dark:bg-black">
      {prosjekter.map((prosjekt: ProsjektMedTelling) => (
        <Card key={prosjekt.id}>
          <CardHeader>
            <CardTitle>{prosjekt.navn}</CardTitle>
            <CardDescription>{prosjekt.beskrivelse}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              {new Date(prosjekt.startDato).toLocaleDateString('nb-NO')} -{' '}
              {new Date(prosjekt.sluttDato).toLocaleDateString('nb-NO')}
            </p>
            {prosjekt.oppgaveTelling ? (
              <div className="mb-4">
                <p className="text-md font-bold">Oppgaver</p>
                <p className="text-sm">Totalt: {prosjekt.oppgaveTelling.total}</p>
                <p className="text-sm">
                  Ikke startet: {prosjekt.oppgaveTelling.IKKE_STARTET || 0}
                </p>
                <p className="text-sm">
                  I gang: {prosjekt.oppgaveTelling.I_GANG || 0}
                </p>
                <p className="text-sm">
                  Fullført: {prosjekt.oppgaveTelling.FULLFORT || 0}
                </p>
              </div>
            ) : (
              <p className="text-sm">Ingen oppgaver</p>
            )}
            <div className="flex flex-wrap space-x-1 gap-1">
              <Link href={`/prosjekter/${prosjekt.id}`}>
                <Button variant="outline">Detaljer</Button>
              </Link>
              {(currentUser.role === "ADMIN" ||
                currentUser.role === "LEDER" ||
                currentUser.role === "PROSJEKTLEDER") && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/prosjekter/rediger/${prosjekt.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {(currentUser.role === "ADMIN" || currentUser.role === "LEDER") && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleSlettProsjekt(prosjekt.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => genererSluttrapport(prosjekt.id)}>
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => arkiverProsjekt(prosjekt.id)}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Arkiver prosjekt
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
