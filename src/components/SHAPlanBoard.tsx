"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";

interface SHAPlanBoardProps {
  shaPlaner: any[];
  currentUser: any;
}

export function SHAPlanBoard({ shaPlaner, currentUser }: SHAPlanBoardProps) {
  const [filter, setFilter] = useState("alle");
  
  const filteredPlaner = shaPlaner.filter(plan => {
    if (filter === "alle") return true;
    return plan.status === filter;
  });

  const grupperteSkjemaer = {
    'Under utarbeidelse': filteredPlaner.filter(plan => plan.status === "Under utarbeidelse"),
    'Til godkjenning': filteredPlaner.filter(plan => plan.status === "Til godkjenning"),
    'Godkjent': filteredPlaner.filter(plan => plan.status === "Godkjent"),
    'Avvist': filteredPlaner.filter(plan => plan.status === "Avvist")
  };

    function handleDelete(id: any): void {
        throw new Error("Function not implemented.");
    }

  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <Button 
          variant={filter === "alle" ? "default" : "outline"}
          onClick={() => setFilter("alle")}
        >
          Alle
        </Button>
        <Button 
          variant={filter === "Under utarbeidelse" ? "default" : "outline"}
          onClick={() => setFilter("Under utarbeidelse")}
        >
          Under utarbeidelse
        </Button>
        <Button 
          variant={filter === "Til godkjenning" ? "default" : "outline"}
          onClick={() => setFilter("Til godkjenning")}
        >
          Til godkjenning
        </Button>
        <Button 
          variant={filter === "Godkjent" ? "default" : "outline"}
          onClick={() => setFilter("Godkjent")}
        >
          Godkjent
        </Button>
        <Button 
          variant={filter === "Avvist" ? "default" : "outline"}
          onClick={() => setFilter("Avvist")}
        >
          Avvist
        </Button>
      </div>

      {Object.entries(grupperteSkjemaer).map(([status, planer]) => (
        <div key={status}>
          <h2 className="text-xl font-bold mb-4">{status === "alle" ? "Alle SHA-planer" : status}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {planer.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle>{plan.prosjektNavn}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Prosjekt:</strong> {plan.prosjekt.navn}</p>
                    <p><strong>Byggherre:</strong> {plan.byggherre}</p>
                    <p><strong>Entreprenør:</strong> {plan.entreprenor}</p>
                    <p><strong>Status:</strong> {plan.status}</p>
                    <p><strong>Opprettet:</strong> {format(new Date(plan.opprettetDato), 'dd.MM.yyyy')}</p>
                    <p><strong>Opprettet av:</strong> {plan.opprettetAv.navn} {plan.opprettetAv.etternavn}</p>
                    {plan.behandler && (
                      <p><strong>Behandler:</strong> {plan.behandler.navn} {plan.behandler.etternavn}</p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Link href={`/sha/${plan.id}`}>
                        <Button size="sm">Se detaljer</Button>
                      </Link>
                      {currentUser.role === "ADMIN" && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDelete(plan.id)}
                        >
                          Slett
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}