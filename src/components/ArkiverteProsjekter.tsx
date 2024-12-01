"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { toast } from "react-hot-toast";

interface ArkivertProsjekt {
  id: string;
  navn: string;
  beskrivelse: string;
  startDato: Date;
  sluttDato: Date;
  status: string;
}

interface ArkiverteProsjekterProps {
  prosjekter: ArkivertProsjekt[];
}

export function ArkiverteProsjekter({ prosjekter: initialProsjekter }: ArkiverteProsjekterProps) {
  const { data: prosjekter = initialProsjekter } = useQuery({
    queryKey: ['arkiverte-prosjekter'],
    queryFn: async () => {
      const response = await fetch('/api/prosjekter/arkiverte');
      if (!response.ok) throw new Error('Kunne ikke hente arkiverte prosjekter');
      return response.json();
    },
    initialData: initialProsjekter,
  });

  const genererSluttrapport = async (prosjektId: string) => {
    try {
      const res = await fetch(`/api/prosjekt/${prosjektId}/generer-sluttrapport`);
      if (!res.ok) {
        throw new Error('Feil ved generering av sluttrapport');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sluttrapport_${prosjektId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Sluttrapport generert');
    } catch (error) {
      console.error('Feil ved generering av sluttrapport:', error);
      toast.error('Kunne ikke generere sluttrapport');
    }
  };

  return (
    <div className="space-y-4 dark:bg-black">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-gray-100">Arkiverte Prosjekter</h2>
      </div>
      <Table className="dark:border-gray-800">
        <TableHeader>
          <TableRow className="dark:border-gray-800">
            <TableHead className="dark:text-gray-400">Prosjektnavn</TableHead>
            <TableHead className="dark:text-gray-400">Beskrivelse</TableHead>
            <TableHead className="dark:text-gray-400">Startdato</TableHead>
            <TableHead className="dark:text-gray-400">Sluttdato</TableHead>
            <TableHead className="dark:text-gray-400">Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prosjekter.map((prosjekt) => (
            <TableRow 
              key={prosjekt.id} 
              className="dark:border-gray-800 dark:hover:bg-gray-800/50"
            >
              <TableCell className="dark:text-gray-300">{prosjekt.navn}</TableCell>
              <TableCell className="dark:text-gray-300">{prosjekt.beskrivelse}</TableCell>
              <TableCell className="dark:text-gray-300">
                {format(new Date(prosjekt.startDato), "dd.MM.yyyy", {
                  locale: nb,
                })}
              </TableCell>
              <TableCell className="dark:text-gray-300">
                {format(new Date(prosjekt.sluttDato), "dd.MM.yyyy", {
                  locale: nb,
                })}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => genererSluttrapport(prosjekt.id)}
                  className="dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generer sluttrapport
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}