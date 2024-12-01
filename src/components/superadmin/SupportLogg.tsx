"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { LeggTilSupportLoggModal } from "@/components/superadmin/LeggTilSupportLoggModal"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SupportStatus, supportStatusMap, getStatusConfig } from '@/lib/utils/supportStatus'

interface SupportLoggProps {
  bedrift: {
    id: string
    navn: string
    supportLogg: Array<{
      id: string
      type: string
      beskrivelse: string
      opprettetAv: string
      createdAt: string
      status: SupportStatus
      bedrift?: {
        id: string
        navn: string
      }
      superAdmin?: { navn: string; etternavn: string } | null
      user?: { navn: string } | null
      resolvedBy?: { navn: string; etternavn: string } | null
      resolvedAt?: string
    }>
  }
  visAlleBedrifter?: boolean
  onClose?: () => void
  isLoading?: boolean
}

const StatusBadge = ({ status }: { status: SupportStatus }) => {
  const { color, text } = getStatusConfig(status)
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {text}
    </span>
  )
}

export function SupportLogg({ 
  bedrift: initialBedrift, 
  visAlleBedrifter = false, 
  onClose,
  isLoading: initialLoading = false 
}: SupportLoggProps) {
  const [bedrift, setBedrift] = useState(initialBedrift)
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchSupportLogg = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/superadmin/support-logg?bedriftId=${initialBedrift.id}`)
        if (!response.ok) throw new Error('Feil ved henting av support-logger')
        const data = await response.json()
        
        const formattedData = {
          id: data.id,
          navn: data.navn,
          supportLogg: Array.isArray(data.supportLogg) ? data.supportLogg : []
        }
        
        setBedrift(formattedData)
      } catch (error) {
        console.error('Feil ved henting av support-logger:', error)
        setBedrift({
          ...initialBedrift,
          supportLogg: []
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSupportLogg()
  }, [initialBedrift.id])

  useEffect(() => {
    console.log('Mottatt data:', bedrift)
  }, [bedrift])

  const handleNewLog = async (data: any) => {
    setIsModalOpen(false)
    setIsLoading(true)
    try {
      const postResponse = await fetch('/api/superadmin/support-logg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bedriftId: bedrift.id,
          ...data
        })
      })
      
      if (!postResponse.ok) throw new Error('Feil ved opprettelse av support-logg')
      
      const getResponse = await fetch(`/api/superadmin/support-logg?bedriftId=${bedrift.id}`)
      if (!getResponse.ok) throw new Error('Feil ved oppdatering av support-logger')
      
      const updatedData = await getResponse.json()
      setBedrift(updatedData)
    } catch (error) {
      console.error('Feil ved oppdatering:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (loggId: string, newStatus: SupportStatus) => {
    setIsLoading(true)
    try {
      const patchResponse = await fetch('/api/superadmin/support-logg', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loggId,
          status: newStatus
        })
      })
      
      if (!patchResponse.ok) throw new Error('Feil ved statusoppdatering')
      
      const getResponse = await fetch(`/api/superadmin/support-logg?bedriftId=${bedrift.id}`)
      if (!getResponse.ok) throw new Error('Feil ved oppdatering av support-logger')
      
      const updatedData = await getResponse.json()
      setBedrift(updatedData)
    } catch (error) {
      console.error('Feil ved statusoppdatering:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const content = (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Support-logg for {bedrift.navn}</CardTitle>
        <div className="flex gap-2">
          <Button onClick={() => setIsModalOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Ny support-hendelse
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            bedrift.supportLogg.map((logg) => (
              <div key={logg.id} className="mb-4 border-b pb-4 last:border-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{logg.type}</p>
                    <StatusBadge status={logg.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    {visAlleBedrifter && logg.bedrift && (
                      <p className="text-sm text-muted-foreground">{logg.bedrift.navn}</p>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Endre status
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {Object.entries(supportStatusMap).map(([key, value]) => (
                          <DropdownMenuItem 
                            key={key}
                            onClick={() => handleStatusChange(logg.id, key)}
                            disabled={logg.status === key}
                          >
                            {value}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{logg.beskrivelse}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {logg.superAdmin 
                      ? `${logg.superAdmin.navn} ${logg.superAdmin.etternavn} (Support)`
                      : logg.user
                        ? `${logg.user.navn} (Bruker)`
                        : logg.opprettetAv
                    }
                  </span>
                  <span>•</span>
                  <span>{format(new Date(logg.createdAt), "dd.MM.yyyy HH:mm")}</span>
                  {logg.status === 'RESOLVED' && logg.resolvedBy && (
                    <>
                      <span>•</span>
                      <span>
                        Løst av {logg.resolvedBy.navn} {logg.resolvedBy.etternavn} ({format(new Date(logg.resolvedAt!), "dd.MM.yyyy HH:mm")})
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>

      {isModalOpen && (
        <LeggTilSupportLoggModal
          bedriftId={bedrift.id}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleNewLog}
        />
      )}
    </Card>
  )

  return onClose ? (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[700px]">
        {content}
      </DialogContent>
    </Dialog>
  ) : content
}