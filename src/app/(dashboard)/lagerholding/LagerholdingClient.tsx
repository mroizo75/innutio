"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus, QrCode, PackageSearch, History, PackagePlus } from "lucide-react";
import { LagerTabell } from "@/components/lager/LagerTabell";
import { LagerRegistrering } from "@/components/lager/LagerRegistrering";
import { QRScanner } from "@/components/lager/QRScanner";
import { LagerHistorikk } from "@/components/lager/LagerHistorikk";
import { useLager } from "@/hooks/useLager";
import { LagerInntak } from "@/components/lager/LagerInntak";
import { UttakModal } from "@/components/lager/UttakModal";


interface LagerholdingClientProps {
  currentUser: any;
}

export function LagerholdingClient({ currentUser }: LagerholdingClientProps) {
  const [activeTab, setActiveTab] = useState("oversikt");
  const [selectedProdukt, setSelectedProdukt] = useState<any>(null);
  const { produkter, isLoading } = useLager(currentUser.bedriftId);

  if (isLoading) {
    return <div>Laster...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lagerholding</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nytt produkt
            </Button>
          </DialogTrigger>
          <LagerRegistrering bedriftId={currentUser.bedriftId} onClose={() => setActiveTab("oversikt")} />
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="oversikt">
            <PackageSearch className="mr-2 h-4 w-4" />
            Oversikt
          </TabsTrigger>
          <TabsTrigger value="inntak">
            <PackagePlus className="mr-2 h-4 w-4" />
            Inntak
          </TabsTrigger>
          <TabsTrigger value="scanner">
            <QrCode className="mr-2 h-4 w-4" />
            QR Scanner
          </TabsTrigger>
          <TabsTrigger value="historikk">
            <History className="mr-2 h-4 w-4" />
            Historikk
          </TabsTrigger>
        </TabsList>

        

        <TabsContent value="oversikt">
          <Card>
            <CardHeader>
              <CardTitle>Lagerbeholdning</CardTitle>
            </CardHeader>
            <CardContent>
              <LagerTabell 
                produkter={produkter} 
                currentUser={currentUser}
                onUttakClick={setSelectedProdukt} 
              />
            </CardContent>
          </Card>
          {selectedProdukt && (
            <Dialog open={!!selectedProdukt} onOpenChange={() => setSelectedProdukt(null)}>
              <UttakModal 
                produkt={selectedProdukt}
                currentUser={currentUser}
                onClose={() => setSelectedProdukt(null)}
              />
            </Dialog>
          )}
        </TabsContent>

        <TabsContent value="inntak">
          <Card>
            <CardHeader>
              <CardTitle>Inntak av varer</CardTitle>
            </CardHeader>
            <CardContent>
              <LagerInntak bedriftId={currentUser.bedriftId} currentUser={currentUser} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scanner">
          <Card>
            <CardHeader>
              <CardTitle>QR-kode Scanner</CardTitle>
            </CardHeader>
            <CardContent>
              <QRScanner bedriftId={currentUser.bedriftId} currentUser={currentUser} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historikk">
          <Card>
            <CardHeader>
              <CardTitle>Lagerhistorikk</CardTitle>
            </CardHeader>
            <CardContent>
              <LagerHistorikk bedriftId={currentUser.bedriftId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}