"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BedriftInfo } from "@/components/superadmin/BedriftInfo"
import { BedriftBrukere } from "@/components/superadmin/BedriftBrukere"
import { BedriftStoffkartotek } from "@/components/superadmin/BedriftStoffkartotek"
import { useEffect, useState } from "react"
import { SupportLogg } from "@/components/superadmin/SupportLogg"

interface BedriftDetaljerModalProps {
  bedrift: any
  onClose: () => void
}

export function BedriftDetaljerModal({ bedrift, onClose }: BedriftDetaljerModalProps) {
  const [alleBedrifter, setAlleBedrifter] = useState<{ id: string; navn: string }[]>([])
  const [bedriftData, setBedriftData] = useState(bedrift)

  useEffect(() => {
    async function hentBedriftData() {
      try {
        const response = await fetch(`/api/superadmin/bedrifter/${bedrift.id}`)
        if (response.ok) {
          const data = await response.json()
          setBedriftData(data)
        }
      } catch (error) {
        console.error('Kunne ikke hente bedriftdata:', error)
      }
    }

    async function hentBedrifter() {
      try {
        const response = await fetch('/api/superadmin/bedrifter')
        if (response.ok) {
          const data = await response.json()
          setAlleBedrifter(data)
        }
      } catch (error) {
        console.error('Kunne ikke hente bedrifter:', error)
      }
    }

    hentBedriftData()
    hentBedrifter()
  }, [bedrift.id])

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{bedriftData.navn}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">Bedriftsinformasjon</TabsTrigger>
            <TabsTrigger value="brukere">Brukere</TabsTrigger>
            <TabsTrigger value="stoffkartotek">Stoffkartotek</TabsTrigger>
            <TabsTrigger value="support">Support-logg</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info">
            <BedriftInfo bedrift={bedriftData} />
          </TabsContent>
          
          <TabsContent value="brukere">
            <BedriftBrukere bedrift={bedriftData} />
          </TabsContent>
          
          <TabsContent value="stoffkartotek">
            <BedriftStoffkartotek 
              bedrift={bedriftData} 
              alleBedrifter={alleBedrifter} 
            />
          </TabsContent>
          <TabsContent value="support">
            <SupportLogg bedrift={bedriftData} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}