"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileUploader } from '@/components/FileUploader'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import { Oppgave, OppgaveStatus, User, Fil } from '@prisma/client'
import { Clock, CheckCircle, AlertCircle, Calendar, Upload } from 'lucide-react'
import { Progress } from "@/components/ui/progress"

interface OppgaveStatusModulProps {
  oppgave: Oppgave & {
    bruker: User;
    filer?: Fil[];
    kommentarer?: any[];
  }
  currentUser: User
  onStatusUpdate: (status: OppgaveStatus) => void
}

export const OppgaveStatusModul = ({ oppgave, currentUser, onStatusUpdate }: OppgaveStatusModulProps) => {
  const [status, setStatus] = useState<OppgaveStatus>(oppgave.status)
  const [fremdriftsnotat, setFremdriftsnotat] = useState('')
  const [aktivitetsLogg, setAktivitetsLogg] = useState<Array<{
    dato: Date;
    handling: string;
    bruker: string;
  }>>([])

  const handleStatusEndring = async (nyStatus: OppgaveStatus) => {
    try {
      const response = await fetch(`/api/oppgaver/${oppgave.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: nyStatus,
          notat: fremdriftsnotat,
          brukerId: currentUser.id 
        })
      })

      if (!response.ok) throw new Error('Kunne ikke oppdatere status')
      
      setStatus(nyStatus)
      onStatusUpdate(nyStatus)
      
      // Legg til i aktivitetsloggen
      setAktivitetsLogg(prev => [{
        dato: new Date(),
        handling: `Endret status til ${nyStatus}`,
        bruker: `${currentUser.navn} ${currentUser.etternavn}`
      }, ...prev])
      
      setFremdriftsnotat('')
    } catch (error) {
      console.error('Feil ved statusoppdatering:', error)
    }
  }

  const beregnFremdrift = (): number => {
    const statusVerdier = {
      IKKE_STARTET: 0,
      I_GANG: 50,
      FULLFORT: 100
    }
    return statusVerdier[status] || 0
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Oppgavestatus</span>
          <Progress value={beregnFremdrift()} className="w-1/3" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Nåværende Status</label>
            <Select value={status} onValueChange={(val: OppgaveStatus) => handleStatusEndring(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Velg status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IKKE_STARTET">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Ikke Startet</span>
                  </div>
                </SelectItem>
                <SelectItem value="I_GANG">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span>I Gang</span>
                  </div>
                </SelectItem>
                <SelectItem value="FULLFORT">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Fullført</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Fremdriftsnotat</label>
            <Textarea
              value={fremdriftsnotat}
              onChange={(e) => setFremdriftsnotat(e.target.value)}
              placeholder="Beskriv hva som er gjort..."
              className="h-20"
            />
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Aktivitetslogg</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {aktivitetsLogg.map((aktivitet, index) => (
              <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(aktivitet.dato, 'dd.MM.yyyy HH:mm', { locale: nb })}</span>
                <span>-</span>
                <span>{aktivitet.handling}</span>
                <span className="text-gray-400">av {aktivitet.bruker}</span>
              </div>
            ))}
          </div>
        </div>

        <FileUploader
          oppgaveId={oppgave.id}
          eksisterendeFiler={oppgave.filer || []}
          onUpload={(fil) => {
            setAktivitetsLogg(prev => [{
              dato: new Date(),
              handling: `Lastet opp fil: ${fil.navn}`,
              bruker: `${currentUser.navn} ${currentUser.etternavn}`
            }, ...prev])
          }}
        />
      </CardContent>
    </Card>
  )
}