"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { slettStoffkartotek } from "@/actions/superadmin-actions"
import { Stoffkartotek, Bedrift } from "@prisma/client"
import { FareSymbol } from "@prisma/client"
import { ArrowUpDown } from "lucide-react"
import { FareSymbolIcon } from "@/components/superadmin/FareSymbolIcon"

interface StoffkartotekListeProps {
  stoffkartotek: (Stoffkartotek & {
    bedrift: Bedrift;
    FareSymbolMapping: { symbol: FareSymbol }[];
  })[]
}

export function StoffkartotekListe({ stoffkartotek: initialStoffkartotek }: StoffkartotekListeProps) {
  const [sortField, setSortField] = useState<'produktnavn' | 'bedrift'>('produktnavn')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [stoffkartotek, setStoffkartotek] = useState(initialStoffkartotek)

  const handleSort = (field: 'produktnavn' | 'bedrift') => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortField(field)
    setSortDirection(newDirection)

    const sortedStoffkartotek = [...stoffkartotek].sort((a, b) => {
      const valueA = field === 'bedrift' ? a.bedrift.navn : a[field]
      const valueB = field === 'bedrift' ? b.bedrift.navn : b[field]
      return newDirection === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA)
    })

    setStoffkartotek(sortedStoffkartotek)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort('produktnavn')}
              >
                Produktnavn
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Faremerking</TableHead>
            <TableHead>Bruksområde</TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort('bedrift')}
              >
                Bedrift
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Datablad</TableHead>
            <TableHead className="text-right">Handling</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stoffkartotek.map((stoff) => (
            <TableRow key={stoff.id}>
              <TableCell>{stoff.produktnavn}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {stoff.FareSymbolMapping.map((mapping) => (
                    <div key={mapping.symbol} className="flex items-center">
                      <FareSymbolIcon 
                        symbol={mapping.symbol} 
                        className="w-6 h-6"
                      />
                      <span className="sr-only">{mapping.symbol}</span>
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell>{stoff.bruksomrade}</TableCell>
              <TableCell>{stoff.bedrift.navn}</TableCell>
              <TableCell>
                {stoff.databladUrl && (
                  <a 
                    href={stoff.databladUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Se datablad
                  </a>
                )}
              </TableCell>
              <TableCell className="text-right">
                <form action={slettStoffkartotek.bind(null, stoff.id)}>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    type="submit"
                  >
                    Slett
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}