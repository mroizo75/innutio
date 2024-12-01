"use client"

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Clock, CheckCircle, AlertCircle, Trash2, Loader2 } from 'lucide-react'
import { format, isValid } from 'date-fns'
import { nb } from 'date-fns/locale'
import { Oppgave, OppgaveStatus, User, Fil } from '@prisma/client'
import { useToast } from "@/components/hooks/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import Image from 'next/image'

interface MobileOppgaveVisningProps {
  oppgaver: Array<Oppgave & {
    bruker: User;
    filer: Fil[];
    prosjekt: any;
    kommentarer: any[];
  }>;
  currentUser: User;
}

const formatDato = (dato: Date | string | null): string => {
  if (!dato) return 'Ikke satt'
  const parsedDate = new Date(dato)
  return isValid(parsedDate) 
    ? format(parsedDate, 'dd.MM.yyyy', { locale: nb })
    : 'Ugyldig dato'
}

export const MobileOppgaveVisning = ({ oppgaver, currentUser }: MobileOppgaveVisningProps) => {
  const [valgtOppgave, setValgtOppgave] = useState<(Oppgave & {
    bruker: User;
    filer: Fil[];
    prosjekt: any;
    kommentarer: any[];
  }) | null>(null)
  const [nyKommentar, setNyKommentar] = useState('')
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (valgtOppgave) {
      const hentOppgaveDetaljer = async () => {
        try {
          const response = await fetch(`/api/oppgaver/${valgtOppgave.id}`)
          if (!response.ok) throw new Error('Kunne ikke hente oppgavedetaljer')
          
          const oppdatertOppgave = await response.json()
          setValgtOppgave(prev => ({
            ...prev!,
            filer: oppdatertOppgave.filer,
            kommentarer: oppdatertOppgave.kommentarer.map((k: any) => ({
              ...k,
              opprettetAt: new Date(k.opprettetAt)
            }))
          }))
        } catch (error) {
          console.error('Feil ved henting av oppgavedetaljer:', error)
          toast({
            title: "Feil",
            description: "Kunne ikke laste inn oppgavedetaljer",
            variant: "destructive"
          })
        }
      }

      hentOppgaveDetaljer()
    }
  }, [valgtOppgave?.id])

  const handleStatusEndring = async (nyStatus: OppgaveStatus) => {
    try {
      const response = await fetch(`/api/oppgaver/${valgtOppgave?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nyStatus })
      })

      if (!response.ok) throw new Error('Kunne ikke oppdatere status')
      
      const oppdatertOppgave = await response.json()
      setValgtOppgave(oppdatertOppgave)
      queryClient.invalidateQueries({ queryKey: ['oppgaver'] })
      
      toast({
        title: "Status oppdatert",
        description: `Oppgaven er nå ${nyStatus.toLowerCase().replace('_', ' ')}`,
      })
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere status",
        variant: "destructive"
      })
    }
  }

  const handleBildeOpplasting = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !valgtOppgave) return

    const nyeFiler = Array.from(e.target.files)
    const eksisterendeFiler = valgtOppgave.filer || []
    
    const formData = new FormData()
    formData.append('oppgaveId', valgtOppgave.id)
    
    nyeFiler.forEach(fil => {
      formData.append('filer', fil)
    })

    setIsUploading(true)

    try {
      const response = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Kunne ikke laste opp fil')
      }

      const oppdatertOppgave = await response.json()
      setValgtOppgave(prev => {
        if (!prev) return null
        return {
          ...prev,
          filer: oppdatertOppgave.filer,
          kommentarer: prev.kommentarer
        }
      })

      if (e.target) {
        e.target.value = ''
      }

      toast({
        title: "Fil lastet opp",
        description: "Filene ble lastet opp",
      })
    } catch (error) {
      console.error('Opplastingsfeil:', error)
      toast({
        title: "Feil",
        description: error instanceof Error ? error.message : "Kunne ikke laste opp fil",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteFile = async (filId: string) => {
    if (!confirm('Er du sikker på at du vil slette denne filen?')) return

    try {
      const response = await fetch('/api/slett-fil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filId })
      })

      if (!response.ok) throw new Error('Kunne ikke slette fil')

      const oppdatertOppgave = await response.json()
      
      // Hent oppdaterte oppgavedetaljer
      const detailsResponse = await fetch(`/api/oppgaver/${valgtOppgave?.id}`)
      if (!detailsResponse.ok) throw new Error('Kunne ikke hente oppdaterte oppgavedetaljer')
      
      const oppdaterteDetaljer = await detailsResponse.json()
      setValgtOppgave(prev => {
        if (!prev) return null
        return {
          ...prev,
          ...oppdaterteDetaljer,
          filer: oppdaterteDetaljer.filer,
          kommentarer: oppdaterteDetaljer.kommentarer
        }
      })

      toast({
        title: "Fil slettet",
        description: "Filen ble slettet",
      })
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke slette fil",
        variant: "destructive"
      })
    }
  }

  const leggTilKommentar = async () => {
    if (!valgtOppgave || nyKommentar.trim() === '') return

    try {
      const response = await fetch(`/api/oppgaver/${valgtOppgave.id}/kommentarer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          innhold: nyKommentar,
          brukerId: currentUser.id
        })
      })

      if (!response.ok) throw new Error('Kunne ikke legge til kommentar')

      const oppdatertOppgave = await response.json()
      setValgtOppgave(oppdatertOppgave)
      setNyKommentar('')
      queryClient.invalidateQueries({ queryKey: ['oppgaver'] })

      toast({
        title: "Kommentar lagt til",
        description: "Kommentaren din er nå lagt til",
      })
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke legge til kommentar",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-4">
      {oppgaver.map((oppgave) => (
        <Card 
          key={oppgave.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setValgtOppgave(oppgave)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{oppgave.tittel}</h3>
              <StatusBadge status={oppgave.status} />
            </div>
            <p className="text-sm text-gray-600 mt-2">{oppgave.prosjekt.navn}</p>
          </CardContent>
        </Card>
      ))}

      <Sheet open={!!valgtOppgave} onOpenChange={() => setValgtOppgave(null)}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{valgtOppgave?.tittel}</SheetTitle>
            <div className="text-sm text-gray-500">
              Prosjekt: {valgtOppgave?.prosjekt?.navn || 'Ikke tilgjengelig'}
            </div>
          </SheetHeader>
          
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={valgtOppgave?.status} 
                  onValueChange={(val) => handleStatusEndring(val as OppgaveStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IKKE_STARTET">Ikke Startet</SelectItem>
                    <SelectItem value="I_GANG">I Gang</SelectItem>
                    <SelectItem value="FULLFORT">Fullført</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Prioritet</label>
                <p className="mt-1 text-sm">{valgtOppgave?.prioritet}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Startdato</label>
                <p className="mt-1 text-sm">{formatDato(valgtOppgave?.startDato || '')}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Sluttdato</label>
                <p className="mt-1 text-sm">{formatDato(valgtOppgave?.sluttDato || '')}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Ansvarlig</label>
                <p className="mt-1 text-sm">
                  {valgtOppgave?.bruker?.navn} {valgtOppgave?.bruker?.etternavn}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Beskrivelse</label>
              <p className="text-sm mt-1">{valgtOppgave?.beskrivelse}</p>
            </div>

            <div>
              <label className="text-sm font-medium">Bilder og filer</label>
              
              {/* Bildegalleri */}
              {valgtOppgave?.filer?.some(fil => fil.type.startsWith('image/')) && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {valgtOppgave?.filer
                    ?.filter(fil => fil.type.startsWith('image/'))
                    ?.map((fil) => (
                      <div key={fil.id} className="relative group aspect-square">
                        <Image 
                          src={fil.url} 
                          alt={fil.navn}
                          className="rounded-md w-full h-full object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteFile(fil.id)
                          }}
                          className="absolute top-0.5 right-0.5 p-0.5 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-2.5 w-2.5 text-white" />
                        </button>
                      </div>
                    ))}
                </div>
              )}

              {/* Andre filer */}
              {valgtOppgave?.filer?.some(fil => !fil.type.startsWith('image/')) && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Andre vedlegg</p>
                  <div className="space-y-2">
                    {valgtOppgave?.filer
                      ?.filter(fil => !fil.type.startsWith('image/'))
                      ?.map((fil) => (
                        <div key={fil.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <a 
                            href={fil.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline truncate max-w-[80%]"
                          >
                            {fil.navn}
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteFile(fil.id)
                            }}
                            className="p-1 hover:bg-gray-200 rounded-full"
                          >
                            <Trash2 className="h-3 w-3 text-gray-500" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Opplastingsknapp */}
              <div className="flex gap-2 mt-4">
                <input
                  id="filInput"
                  type="file"
                  accept="*/*"
                  multiple
                  className="hidden"
                  onChange={handleBildeOpplasting}
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('filInput')?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Laster opp...
                    </span>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Last opp fil
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* {valgtOppgave && (
              <KommentarSection
                oppgaveId={valgtOppgave.id}
                initialComments={valgtOppgave.kommentarer || []}
                currentUser={currentUser}
                onNewComment={(kommentar) => {
                  setValgtOppgave(prev => prev ? {
                    ...prev,
                    kommentarer: [kommentar, ...(prev.kommentarer || [])]
                  } : null)
                }}
              />
            )} */}

            <div className="mt-6">
              <label className="text-sm font-medium">Kommentarer</label>
              <div className="mt-4">
                <div className="space-y-4">
                  {valgtOppgave?.kommentarer?.map((kommentar) => (
                    <div key={kommentar.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {kommentar.bruker.navn} {kommentar.bruker.etternavn}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(kommentar.opprettetAt), 'dd.MM.yyyy HH:mm', { locale: nb })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{kommentar.innhold}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <Textarea
                    placeholder="Skriv en kommentar..."
                    value={nyKommentar}
                    onChange={(e) => setNyKommentar(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button 
                    onClick={leggTilKommentar}
                    className="mt-2"
                    disabled={!nyKommentar.trim()}
                  >
                    Legg til kommentar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

const StatusBadge = ({ status }: { status: OppgaveStatus }) => {
  const config = {
    IKKE_STARTET: { icon: Clock, color: 'bg-gray-100 text-gray-800' },
    I_GANG: { icon: AlertCircle, color: 'bg-blue-100 text-blue-800' },
    FULLFORT: { icon: CheckCircle, color: 'bg-green-100 text-green-800' }
  }

  const { icon: Icon, color } = config[status as keyof typeof config]

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${color}`}>
      <Icon className="h-3 w-3" />
      <span>{status.replace('_', ' ').toLowerCase()}</span>
    </div>
  )
}