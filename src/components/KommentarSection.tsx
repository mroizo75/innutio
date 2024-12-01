"use client";
import React, { useState } from "react";
import axios from "axios";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

type Kommentar = {
  id: string;
  innhold: string;
  opprettetDato: Date;
  bruker: {
    navn: string;
    bildeUrl?: string;
  };
};

type KommentarSectionProps = {
  initialComments: Kommentar[];
  oppgaveId: string;
  currentUser: {
    id: string;
    navn: string;
    bildeUrl?: string;
  };
};

export function KommentarSection({ 
  initialComments, 
  oppgaveId, 
  currentUser 
}: KommentarSectionProps) {
  const [kommentarer, setKommentarer] = useState<Kommentar[]>(initialComments);
  const [nyKommentar, setNyKommentar] = useState("");
  const queryClient = useQueryClient();

  const leggTilKommentar = async () => {
    if (nyKommentar.trim() === "") return;

    try {
      const response = await axios.post("/api/legg-til-kommentar", {
        oppgaveId,
        brukerId: currentUser.id,
        innhold: nyKommentar,
      });

      const nyKommentarData = response.data;
      setKommentarer([...kommentarer, nyKommentarData]);
      setNyKommentar("");
      
      // Invalider cache for å oppdatere prosjektdata
      queryClient.invalidateQueries({ queryKey: ['prosjekt'] });
    } catch (error) {
      console.error("Feil ved lagring av kommentar:", error);
    }
  };

  return (
    <div className="mt-4" onClick={(e) => e.stopPropagation()}>
      <h4 className="font-medium mb-2">Kommentarer</h4>
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {kommentarer.map((kommentar) => (
          <div key={kommentar.id} className="flex items-start space-x-2">
            <Avatar>
              <AvatarImage src={kommentar.bruker.bildeUrl} />
              <AvatarFallback>
                {kommentar.bruker.navn.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="bg-gray-100 p-2 rounded-lg flex-1">
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold">
                  {kommentar.bruker.navn}
                </p>
                <p className="text-xs text-gray-500">
                  {format(
                    new Date(kommentar.opprettetDato),
                    "dd.MM.yyyy HH:mm"
                  )}
                </p>
              </div>
              <p className="text-sm">{kommentar.innhold}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center space-x-2">
        <Input
          value={nyKommentar}
          onChange={(e) => setNyKommentar(e.target.value)}
          placeholder="Skriv en kommentar..."
          className="flex-1"
        />
        <Button onClick={leggTilKommentar}>Send</Button>
      </div>
    </div>
  );
}