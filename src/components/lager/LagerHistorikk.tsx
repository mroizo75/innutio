"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

interface LagerHistorikkProps {
  bedriftId: string;
}

export function LagerHistorikk({ bedriftId }: LagerHistorikkProps) {
  const { data: historikk = [], isLoading } = useQuery({
    queryKey: ['lagerhistorikk', bedriftId],
    queryFn: async () => {
      const response = await fetch(`/api/lager/historikk?bedriftId=${bedriftId}`);
      if (!response.ok) throw new Error('Kunne ikke hente historikk');
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Laster historikk...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Dato</TableHead>
          <TableHead>Produkt</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Antall</TableHead>
          <TableHead>Bruker</TableHead>
          <TableHead>Prosjekt</TableHead>
          <TableHead>Kommentar</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {historikk.map((hendelse: any) => (
          <TableRow key={hendelse.id}>
            <TableCell>
              {format(new Date(hendelse.dato), "dd.MM.yyyy HH:mm", { locale: nb })}
            </TableCell>
            <TableCell>{hendelse.produkt.produktnavn}</TableCell>
            <TableCell>
              <Badge variant={hendelse.type === 'UTTAK' ? 'destructive' : 'success'}>
                {hendelse.type}
              </Badge>
            </TableCell>
            <TableCell>
              {hendelse.antall} {hendelse.produkt.enhet}
            </TableCell>
            <TableCell>{hendelse.bruker.navn}</TableCell>
            <TableCell>{hendelse.prosjekt?.navn || '-'}</TableCell>
            <TableCell>{hendelse.kommentar || '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}