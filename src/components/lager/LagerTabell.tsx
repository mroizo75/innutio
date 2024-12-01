"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { QrCode, MinusCircle, PlusCircle } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { UttakModal } from "./UttakModal";
import { InntakModal } from "./InntakModal";
import { Badge } from "@/components/ui/badge";
import { QRButton } from "./QRButton";

interface LagerTabellProps {
  produkter: any[];
  currentUser: any;
  onUttakClick: (produkt: any) => void;
}

export function LagerTabell({ produkter, currentUser, onUttakClick }: LagerTabellProps) {
  const getLagerStatus = (antall: number, minAntall: number) => {
    if (antall <= 0) return "none";
    if (antall <= minAntall) return "low";
    return "ok";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produktnavn</TableHead>
          <TableHead>Antall</TableHead>
          <TableHead>Plassering</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Handlinger</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {produkter.map((produkt) => (
          <TableRow key={produkt.id}>
            <TableCell>{produkt.produktnavn}</TableCell>
            <TableCell>
              {produkt.antall} {produkt.enhet}
            </TableCell>
            <TableCell>{produkt.plassering}</TableCell>
            <TableCell>
              <Badge
                variant={
                  getLagerStatus(produkt.antall, produkt.minAntall) === "none"
                    ? "destructive"
                    : getLagerStatus(produkt.antall, produkt.minAntall) === "low"
                    ? "warning"
                    : "success"
                }
              >
                {getLagerStatus(produkt.antall, produkt.minAntall) === "none"
                  ? "Tomt"
                  : getLagerStatus(produkt.antall, produkt.minAntall) === "low"
                  ? "Lavt"
                  : "OK"}
              </Badge>
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button onClick={() => onUttakClick(produkt)}>
                Ta ut
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <InntakModal produkt={produkt} currentUser={currentUser} />
              </Dialog>

              <Button
                variant="outline"
                size="icon"
              >
                <QRButton produkt={produkt} />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}