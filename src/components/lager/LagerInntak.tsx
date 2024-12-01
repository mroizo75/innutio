import { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface LagerInntakProps {
  bedriftId: string;
  currentUser: any;
}

export function LagerInntak({ bedriftId, currentUser }: LagerInntakProps) {
  const [visQRScanner, setVisQRScanner] = useState(false);
  const [produktId, setProduktId] = useState<string>('');
  const [antall, setAntall] = useState("");
  const [kommentar, setKommentar] = useState("");
  const queryClient = useQueryClient();

  const startScanner = () => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    scanner.render(success, error);

    function success(result: string) {
      const id = result.split('/').pop();
      setProduktId(id || '');
      scanner.clear();
      setVisQRScanner(false);
    }

    function error(err: any) {
      console.error(err);
    }
  };

  const inntakMutation = useMutation({
    mutationFn: async (data: { 
      produktId: string; 
      antall: number; 
      kommentar: string;
      bedriftId: string;
      userId: string;
    }) => {
      const response = await fetch("/api/lager/inntak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Kunne ikke registrere inntak");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lager", bedriftId] });
      toast.success("Inntak registrert");
      setAntall("");
      setKommentar("");
    },
    onError: () => {
      toast.error("Kunne ikke registrere inntak");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!produktId || !antall) return;

    inntakMutation.mutate({
      produktId,
      antall: parseInt(antall),
      kommentar,
      bedriftId,
      userId: currentUser.id,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <Input
          type="text"
          placeholder="Produkt ID"
          value={produktId}
          onChange={(e) => setProduktId(e.target.value)}
        />
        
        <Button 
          variant="outline"
          onClick={() => {
            setVisQRScanner(!visQRScanner);
            if (!visQRScanner) startScanner();
          }}
        >
          {visQRScanner ? 'Lukk QR Scanner' : 'Skann QR-kode'}
        </Button>

        {visQRScanner && (
          <div id="reader" />
        )}

        <Input
          type="number"
          placeholder="Antall"
          value={antall}
          onChange={(e) => setAntall(e.target.value)}
        />
        
        <Textarea
          placeholder="Kommentar"
          value={kommentar}
          onChange={(e) => setKommentar(e.target.value)}
        />

        <Button onClick={handleSubmit}>
          Registrer inntak
        </Button>
      </div>
    </div>
  );
}