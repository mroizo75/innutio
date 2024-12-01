"use client";

import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface AnsatteListeProps {
  ansatte: any[];
}

const CVUtskrift: React.FC<{ ansatt: any }> = ({ ansatt }) => {
  return (
    <div className="p-6 print:block" id="cv-utskrift">
      <h1 className="text-2xl font-bold mb-4">{`${ansatt.navn} ${ansatt.etternavn}`}</h1>
      <div className="space-y-4">
        <section>
          <h2 className="text-xl font-semibold mb-2">Kontaktinformasjon</h2>
          <p>E-post: {ansatt.email}</p>
          <p>Stilling: {ansatt.position || 'Ikke satt'}</p>
          <p>Rolle: {ansatt.role}</p>
        </section>
        
        {ansatt.utdanning && (
          <section>
            <h2 className="text-xl font-semibold mb-2">Utdanning</h2>
            <p>{ansatt.utdanning}</p>
          </section>
        )}
        
        {ansatt.erfaring && (
          <section>
            <h2 className="text-xl font-semibold mb-2">Arbeidserfaring</h2>
            <p>{ansatt.erfaring}</p>
          </section>
        )}
      </div>
    </div>
  );
};

const AnsatteListe: React.FC<AnsatteListeProps> = ({ ansatte }) => {
  const [valgtAnsatt, setValgtAnsatt] = useState<any | null>(null);

  const skrivUtCV = (ansatt: any) => {
    setValgtAnsatt(ansatt);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <>
      <Card className="print:hidden">
        <CardHeader className="flex items-center justify-between">
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Navn</TableHead>
                <TableHead>E-post</TableHead>
                <TableHead>Stilling</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Handlinger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ansatte.map((ansatt) => (
                <TableRow key={ansatt.id}>
                  <TableCell>{`${ansatt.navn} ${ansatt.etternavn}`}</TableCell>
                  <TableCell>{ansatt.email}</TableCell>
                  <TableCell>{ansatt.position || 'Ikke satt'}</TableCell>
                  <TableCell>{ansatt.role}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/ansatte/${ansatt.id}`}>
                        <Button variant="outline" size="sm">
                          Se detaljer
                        </Button>
                      </Link>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setValgtAnsatt(ansatt)}>
                            Skriv ut CV
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>CV Forhåndsvisning</DialogTitle>
                          </DialogHeader>
                          <CVUtskrift ansatt={valgtAnsatt!} />
                          <Button onClick={() => skrivUtCV(ansatt)}>Skriv ut CV</Button>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {valgtAnsatt && (
        <div className="hidden print:block">
          <CVUtskrift ansatt={valgtAnsatt} />
        </div>
      )}
    </>
  );
};

export default AnsatteListe;

