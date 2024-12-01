"use client"
import { useState } from "react"
import { Search, FileText, ClipboardEdit, FileDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "react-hot-toast"
import type { SJASkjema, Prosjekt, User, SJAProdukt, Bilde } from "@prisma/client"

// Definer en type som inkluderer alle relasjonene
type SJASkjemaWithRelations = SJASkjema & {
  prosjekt: Prosjekt
  opprettetAv: User
  behandler: User | null
  SJAProdukt: SJAProdukt[]
  bilder: Bilde[]
}

interface SJADashboardProps {
  sjaSkjemaer: SJASkjemaWithRelations[]
}

export default function SJADashboard({ sjaSkjemaer }: SJADashboardProps) {
  const [søk, setSøk] = useState("")

  // Sorter skjemaer etter opprettetDato (nyeste først)
  const sorterteSjaSkjemaer = [...sjaSkjemaer].sort((a, b) => 
    new Date(b.opprettetDato).getTime() - new Date(a.opprettetDato).getTime()
  )

  const filtrerteSjaSkjemaer = sorterteSjaSkjemaer.filter(skjema => 
    skjema.jobTitle.toLowerCase().includes(søk.toLowerCase()) ||
    skjema.jobLocation.toLowerCase().includes(søk.toLowerCase()) ||
    skjema.prosjekt.navn.toLowerCase().includes(søk.toLowerCase())
  )

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'godkjent':
        return 'bg-green-100 text-green-800'
      case 'avvist':
        return 'bg-red-100 text-red-800'
      case 'under behandling':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleExportPDF = async (skjemaId: string) => {
    try {
      const response = await fetch(`/api/sja/${skjemaId}/pdf`);
      if (!response.ok) {
        throw new Error('Kunne ikke generere PDF');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sja_${skjemaId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Feil ved generering av PDF:', error);
      toast.error('Kunne ikke generere PDF');
    }
  };

  const handleBehandleSkjema = async (skjemaId: string) => {
    try {
      const response = await fetch(`/api/sja/${skjemaId}/behandle`, {
        method: 'POST',
      })
      if (response.ok) {
        window.location.href = `/sja/behandle/${skjemaId}`
      }
    } catch (error) {
      console.error('Feil ved behandling av skjema:', error)
    }
  }

  return (
    <div className="flex-1 container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">SJA Oversikt</h1>
        <div className="w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Søk i SJA-skjemaer..."
              value={søk}
              onChange={(e) => setSøk(e.target.value)}
              className="pl-8 w-full sm:w-[300px]"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filtrerteSjaSkjemaer.map((skjema) => (
          <Card key={skjema.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-start flex-col sm:flex-row gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{skjema.jobTitle}</h2>
                    <Badge className={getStatusBadgeColor(skjema.status)}>
                      {skjema.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Prosjekt: {skjema.prosjekt.navn}
                  </p>
                  <p className="text-muted-foreground">
                    Lokasjon: {skjema.jobLocation}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Opprettet av: {skjema.opprettetAv.navn} {skjema.opprettetAv.etternavn} - {new Date(skjema.opprettetDato).toLocaleDateString('nb-NO')}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button 
                    className="w-full sm:w-auto justify-center"
                    variant="outline" 
                    onClick={() => handleExportPDF(skjema.id)}
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Eksporter PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </Button>
                  {skjema.status === "Ubehandlet" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleBehandleSkjema(skjema.id)}
                      className="flex items-center gap-2"
                    >
                      <ClipboardEdit className="h-4 w-4" />
                      Behandle skjema
                    </Button>
                  )}
                  <Link href={`/sja/${skjema.id}`} className="w-full sm:w-auto">
                    <Button 
                      variant="outline"
                      className="w-full sm:w-auto justify-center"
                    >
                      <span>Se detaljer</span>
                    </Button>
                  </Link>
                </div>
              </div>
              
              {skjema.SJAProdukt && skjema.SJAProdukt.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Produkter i bruk:</h3>
                  <ul className="list-disc list-inside">
                    {skjema.SJAProdukt.map((produkt, index) => (
                      <li key={index} className="flex items-center justify-between text-muted-foreground">
                        <span>{produkt.navn} - Mengde: {produkt.mengde}</span>
                        {produkt.databladUrl && (
                          <Link href={produkt.databladUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              Åpne datablad
                            </Button>
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}