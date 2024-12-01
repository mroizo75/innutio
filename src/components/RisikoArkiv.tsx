"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Search, Filter, Download, AlertTriangle, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from 'react-toastify'
import RisikoBehandling from '@/components/RisikoBehandling'
import { RisikoVurdering, User } from "@prisma/client"

interface UserWithDetails {
  id: string;
  navn: string;
  etternavn: string;
  bedriftId: string;
}

interface RisikoVurderingWithRelations extends RisikoVurdering {
  prosjekt: {
    navn: string;
  };
  opprettetAv: UserWithDetails;
  behandler: UserWithDetails | null;
}

interface RisikoArkivProps {
  risikoVurderinger: RisikoVurderingWithRelations[];
  currentUser: UserWithDetails;
}

export default function RisikoArkiv({ 
  risikoVurderinger, 
  currentUser 
}: RisikoArkivProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedRisikoId, setSelectedRisikoId] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const aktiveVurderinger = risikoVurderinger.filter(rv => rv.status !== 'Arkivert')
  const ferdigBehandlet = risikoVurderinger.filter(rv => rv.status === 'Ferdig behandlet')
  const hoyRisikoVurderinger = risikoVurderinger.filter(rv => 
    rv.risikoVerdi >= 15 && rv.status !== 'Ferdig behandlet'
  )
  const forfallende = risikoVurderinger.filter(rv => {
    const dager = Math.ceil((new Date(rv.nesteGjennomgang).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    return dager <= 30 && dager > 0
  })

  const getRisikoFarge = (risikoVerdi: number) => {
    if (risikoVerdi >= 15) return "bg-red-100 text-red-800"
    if (risikoVerdi >= 8) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      'Ubehandlet': "bg-red-100 text-red-800",
      'Under behandling': "bg-yellow-100 text-yellow-800",
      'Ferdig behandlet': "bg-green-100 text-green-800",
      'Arkivert': "bg-gray-100 text-gray-800"
    }
    return <Badge className={colors[status as keyof typeof colors] || "bg-gray-100"}>{status}</Badge>
  }

  const handleGeneratePDF = async (id: string) => {
    try {
      const response = await fetch(`/api/risiko/${id}/pdf`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const pdfBlob = await response.blob()
      
      const url = window.URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `risikovurdering_${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
      
      toast.success('PDF generert')
    } catch (error) {
      console.error('Feil ved generering av PDF:', error)
      toast.error('Kunne ikke generere PDF')
    }
  }

  const handleViewDetails = (id: string) => {
    setSelectedRisikoId(id)
    setShowDetails(true)
  }

  const selectedRisikoVurdering = risikoVurderinger.find(rv => rv.id === selectedRisikoId)

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aktive vurderinger</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aktiveVurderinger.length}</div>
            <p className="text-xs text-muted-foreground">Totalt antall aktive</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ferdig behandlet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ferdigBehandlet.length}</div>
            <p className="text-xs text-muted-foreground">Totalt antall ferdig behandlet</p>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Høy risiko</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hoyRisikoVurderinger.length}</div>
            <p className="text-xs text-muted-foreground">Totalt antall høy risiko</p>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Forfallende</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forfallende.length}</div>
            <p className="text-xs text-muted-foreground">Totalt antall forfallende</p>
          </CardContent>
        </Card>
      </div>

      {hoyRisikoVurderinger.length > 0 && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Viktige oppdateringer</AlertTitle>
          <AlertDescription>
            {hoyRisikoVurderinger.length} ubehandlet(e) risikovurdering(er) har høyt risikonivå. 
            {forfallende.length} vurdering(er) forfaller innen 30 dager.
          </AlertDescription>
        </Alert>
      )}

      {/* Søk og filterfelt */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Søk i vurderinger..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle statuser</SelectItem>
            <SelectItem value="Ubehandlet">Ubehandlet</SelectItem>
            <SelectItem value="Under behandling">Under behandling</SelectItem>
            <SelectItem value="Ferdig behandlet">Ferdig behandlet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabell med vurderinger */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Risikovurderinger</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prosjekt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risikonivå</TableHead>
                <TableHead>Ansvarlig</TableHead>
                <TableHead>Behandler</TableHead>
                <TableHead>Frist</TableHead>
                <TableHead>Handlinger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risikoVurderinger
                .filter(rv => selectedStatus === "all" || rv.status === selectedStatus)
                .filter(rv => 
                  rv.prosjekt.navn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  rv.utfortAv.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((rv) => (
                  <TableRow key={rv.id}>
                    <TableCell>{rv.prosjekt.navn}</TableCell>
                    <TableCell>{getStatusBadge(rv.status)}</TableCell>
                    <TableCell>
                      <Badge className={getRisikoFarge(rv.risikoVerdi)}>
                        {rv.risikoVerdi}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {rv.opprettetAv 
                        ? `${rv.opprettetAv.navn} ${rv.opprettetAv.etternavn}`
                        : 'Ikke angitt'}
                    </TableCell>
                    <TableCell>
                      {rv.behandler 
                        ? `${rv.behandler.navn} ${rv.behandler.etternavn}`
                        : '-'}
                    </TableCell>
                    <TableCell>{format(new Date(rv.nesteGjennomgang), 'dd.MM.yyyy', { locale: nb })}</TableCell>
                    
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleGeneratePDF(rv.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(rv.id)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedRisikoVurdering && (
        <RisikoBehandling
          risikoVurdering={selectedRisikoVurdering}
          currentUser={currentUser}
          open={showDetails}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  )
}
