"use client";

import { useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UttakModal } from "./UttakModal";
import { Dialog } from "@/components/ui/dialog";

interface QRScannerProps {
  bedriftId: string;
  currentUser: any;
}

export function QRScanner({ bedriftId, currentUser }: QRScannerProps) {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [produkt, setProdukt] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    scanner.render(onScanSuccess, onScanError);

    async function onScanSuccess(qrCode: string) {
      setScannedCode(qrCode);
      scanner.pause();
      
      try {
        const response = await fetch(`/api/lager/produkt-by-qr/${qrCode}`);
        if (response.ok) {
          const data = await response.json();
          setProdukt(data);
          setIsDialogOpen(true);
        }
      } catch (error) {
        console.error("Feil ved henting av produkt:", error);
      }
    }

    function onScanError(err: any) {
      console.warn(err);
    }

    return () => {
      scanner.clear();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div id="reader" className="w-full max-w-sm mx-auto" />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {produkt && (
          <UttakModal 
            produkt={produkt} 
            currentUser={currentUser} 
            onClose={() => {
              setIsDialogOpen(false);
              setScannedCode(null);
              setProdukt(null);
            }} 
          />
        )}
      </Dialog>
    </div>
  );
}