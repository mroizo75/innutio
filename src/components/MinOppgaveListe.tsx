"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KanbanBoard } from "@/components/KanbanBoard"
import {  User } from '@prisma/client'
import { Dialog, DialogContent } from "@/components/ui/dialog"

type Oppgave = {
  id: string;
  tittel: string;
  beskrivelse: string;
  startDato: Date;
  sluttDato: Date;
  status: 'IKKE_STARTET' | 'I_GANG' | 'UNDER_REVIEW' | 'FULLFORT';
  prioritet: 'LAV' | 'MEDIUM' | 'HOY' | 'KRITISK';
  estimertTid?: number;
  faktiskTid?: number;
  prosjekt: {
    navn: string;
  };
  bruker: {
    navn: string;
    etternavn: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

interface MinOppgaveListeProps {
  oppgaver: Array<Oppgave & {
    bruker: User;
    prosjekt: any;
  }>;
  currentUser: User;
}

export const MinOppgaveListe = ({ oppgaver, currentUser }: MinOppgaveListeProps) => {
  const [valgtProsjekt, setValgtProsjekt] = useState<any | null>(null)
  const [visKanban, setVisKanban] = useState(false)

  // Grupper oppgaver etter prosjekt
  const prosjekter = oppgaver.reduce((acc, oppgave) => {
    const prosjektId = oppgave.prosjekt.id
    if (!acc[prosjektId]) {
      acc[prosjektId] = {
        ...oppgave.prosjekt,
        oppgaver: []
      }
    }
    acc[prosjektId].oppgaver.push(oppgave)
    return acc
  }, {} as Record<string, any>)

  const handleProsjektKlikk = (prosjekt: any) => {
    setValgtProsjekt(prosjekt)
    setVisKanban(true)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Mine Oppgaver</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(prosjekter).map((prosjekt: any) => (
          <Card key={prosjekt.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleProsjektKlikk(prosjekt)}>
            <CardHeader>
              <CardTitle>{prosjekt.navn}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Antall oppgaver: {prosjekt.oppgaver.length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={visKanban} onOpenChange={setVisKanban}>
        <DialogContent className="max-w-7xl h-[80vh]">
          {valgtProsjekt && (
            <KanbanBoard
              prosjekt={valgtProsjekt}
              currentUser={currentUser}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}