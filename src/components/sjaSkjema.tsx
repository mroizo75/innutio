"use client"

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import toast, { Toaster } from 'react-hot-toast';
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useDropzone } from "react-dropzone";
import Image from "next/image";



interface SJASkjema {
  jobTitle: string;
  jobLocation: string;
  jobDate: string;
  participants: string;
  jobDescription: string;
  identifiedRisks: string;
  riskMitigation: string;
  responsiblePerson: string;
  comments: string;
  projectId: string;
  produkter: {
    produktId: string;
    navn: string;
    mengde: string;
  }[];
}

interface SJAMal {
  id: string;
  navn: string;
  jobTitle: string;
  jobLocation: string;
  participants: string;
  jobDescription: string;
  identifiedRisks: string;
  riskMitigation: string;
  responsiblePerson: string;
  comments: string;
  produkter: {
    produktId: string;
    navn: string;
    mengde: string;
  }[];
}

interface Produkt {
  id: string;
  produktnavn: string;
  produsent: string;
  beskrivelse: string;
  FareSymbolMapping: {
    symbol: string;
  }[];
}

interface ProduktValg {
  produktId: string;
  navn: string;
  mengde: string;
}

export default function SJAForm() {
  const { data: session } = useSession();
  const [maler, setMaler] = useState<SJAMal[]>([]);
  const [valgtMal, setValgtMal] = useState<string>("");
  const [visMalModal, setVisMalModal] = useState(false);
  const [malNavn, setMalNavn] = useState("");
  const [form, setForm] = useState<SJASkjema>({
    jobTitle: "",
    jobLocation: "",
    jobDate: "",
    participants: "",
    jobDescription: "",
    identifiedRisks: "",
    riskMitigation: "",
    responsiblePerson: "",
    comments: "",
    projectId: "",
    produkter: [],
  });

  const [produkter, setProdukter] = useState<Produkt[]>([]);
  const [valgtProdukt, setValgtProdukt] = useState<string>("");
  const [produktMengde, setProduktMengde] = useState<string>("");
  const [valgteProdukter, setValgteProdukter] = useState<ProduktValg[]>([]);
  const [bilder, setBilder] = useState<{ url: string; navn: string }[]>([]);

  useEffect(() => {
    const hentProsjekter = async () => {
      try {
        const response = await fetch('/api/prosjekter');
        if (response.ok) {
          const data = await response.json();
          setProsjekter(data);
          if (data.length > 0) {
            setForm(prev => ({ ...prev, prosjektId: data[0].id }));
          }
        }
      } catch (error) {
        console.error('Feil ved henting av prosjekter:', error);
      }
    };
    hentProsjekter();
  }, []);
  


  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [prosjekter, setProsjekter] = useState([]);

  useEffect(() => {
    const hentMaler = async () => {
      try {
        const response = await fetch('/api/sja/maler');
        if (response.ok) {
          const data = await response.json();
          setMaler(data);
        }
      } catch (error) {
        console.error("Feil ved henting av maler:", error);
      }
    };
    hentMaler();
  }, []);

  useEffect(() => {
    const hentProdukter = async () => {
      if (!session?.user?.bedriftId) return;
      
      try {
        const response = await fetch('/api/stoffkartotek', {
          headers: {
            'bedrift-id': session.user.bedriftId
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setProdukter(data);
        } else {
          toast.error('Kunne ikke hente produkter fra stoffkartotek');
        }
      } catch (error) {
        console.error('Feil ved henting av stoffkartotek:', error);
        toast.error('Feil ved henting av produkter');
      }
    };

    hentProdukter();
  }, [session?.user?.bedriftId]);

  const handleMalValg = (malId: string) => {
    const valgtMal = maler.find(mal => mal.id === malId);
    if (valgtMal) {
      setForm({
        ...form,
        jobTitle: valgtMal.jobTitle,
        jobLocation: valgtMal.jobLocation,
        participants: valgtMal.participants,
        jobDescription: valgtMal.jobDescription,
        identifiedRisks: valgtMal.identifiedRisks,
        riskMitigation: valgtMal.riskMitigation,
        responsiblePerson: valgtMal.responsiblePerson,
        comments: valgtMal.comments,
        produkter: valgtMal.produkter || [],
      });
      setValgteProdukter(valgtMal.produkter || []);
    }
  };

  const handleLeggTilProdukt = () => {
    if (!valgtProdukt || !produktMengde) {
      toast.error("Velg produkt og angi mengde");
      return;
    }

    const produkt = produkter.find(p => p.id === valgtProdukt);
    if (!produkt) {
      toast.error("Produktet ble ikke funnet");
      return;
    }

    const nyProduktValg = {
      produktId: produkt.id,
      navn: produkt.produktnavn,
      mengde: produktMengde
    };

    setValgteProdukter(prev => [...prev, nyProduktValg]);
    setForm(prev => ({
      ...prev,
      produkter: [...prev.produkter, nyProduktValg]
    }));

    // Reset input fields
    setValgtProdukt("");
    setProduktMengde("");
    toast.success(`La til ${produkt.produktnavn}`);
  };

  const handleFjernProdukt = (index: number) => {
    setValgteProdukter(prev => prev.filter((_, i) => i !== index));
  };

  const lagreSomMal = async () => {
    if (!malNavn) {
      toast.error("Vennligst gi malen et navn");
      return;
    }

    const loadingToast = toast.loading('Lagrer mal...');
    
    try {
      const response = await fetch('/api/sja/mal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          navn: malNavn,
          jobTitle: form.jobTitle,
          jobLocation: form.jobLocation,
          participants: form.participants,
          jobDescription: form.jobDescription,
          identifiedRisks: form.identifiedRisks,
          riskMitigation: form.riskMitigation,
          responsiblePerson: form.responsiblePerson,
          comments: form.comments,
          produkter: valgteProdukter,
        }),
      });

      if (!response.ok) {
        throw new Error('Kunne ikke lagre mal');
      }

      const nyMal = await response.json();
      setMaler([...maler, nyMal]);
      toast.success('Mal lagret!');
      setVisMalModal(false);
      setMalNavn("");
    } catch (error) {
      toast.error('Kunne ikke lagre mal');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload-bilder', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Feil ved opplasting av bilde');
        }

        const result = await response.json();
        setBilder(prevBilder => [...prevBilder, { url: result.url, navn: result.navn }]);
        toast.success('Bilde lastet opp');
      } catch (error) {
        console.error('Feil ved opplasting av bilde:', error);
        toast.error('Feil ved opplasting av bilde');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Sender inn SJA-skjema...');
    try {
      const response = await fetch("/api/sja/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          produkter: valgteProdukter,
          status: "Ubehandlet",
          opprettetAvId: session?.user?.id,
          bedriftId: session?.user?.bedriftId,
          bilder: bilder,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Kunne ikke sende SJA-skjema");
      }

      toast.success('SJA-skjema er sendt inn!', {
        duration: 5000,
        icon: '✅',
      });
      setForm({
        jobTitle: "",
        jobLocation: "",
        jobDate: "",
        participants: "",
        jobDescription: "",
        identifiedRisks: "",
        riskMitigation: "",
        responsiblePerson: "",
        comments: "",
        projectId: "",
        produkter: [],
      });
      setBilder([]);
    } catch (error: any) {
      console.error("Feil ved innsending av SJA-skjema:", error);
      toast.error(`Feil ved innsending: ${error.message}`, {
        duration: 5000,
        icon: '❌',
      });
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader className="space-y-4">
        <CardTitle className="text-2xl font-bold">Sikker Jobb Analyse (SJA) Skjema</CardTitle>
        <div className="flex gap-4">
          <Select onValueChange={handleMalValg}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Velg mal" />
            </SelectTrigger>
            <SelectContent>
              {maler.map(mal => (
                <SelectItem key={mal.id} value={mal.id}>
                  {mal.navn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setVisMalModal(true)}>
            Lagre som mal
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Øverste rad med grunnleggende informasjon */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobTitle">Jobbtittel</Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                value={form.jobTitle}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="jobLocation">Jobblokasjon</Label>
              <Input
                id="jobLocation"
                name="jobLocation"
                value={form.jobLocation}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Andre rad med dato og prosjekt */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobDate">Dato</Label>
              <Input
                id="jobDate"
                name="jobDate"
                type="date"
                value={form.jobDate}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="projectId">Prosjekt</Label>
              <Select name="projectId" onValueChange={(value) => setForm(prev => ({ ...prev, projectId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg prosjekt" />
                </SelectTrigger>
                <SelectContent>
                  {prosjekter.map((prosjekt) => (
                    <SelectItem key={prosjekt.id} value={prosjekt.id}>
                      {prosjekt.navn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Deltakere */}
          <div>
            <Label htmlFor="participants">Deltakere</Label>
            <Input
              id="participants"
              name="participants"
              value={form.participants}
              onChange={handleChange}
              required
            />
          </div>

          {/* Store tekstfelt i full bredde */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="jobDescription">Jobbeskrivelse</Label>
              <Textarea
                id="jobDescription"
                name="jobDescription"
                value={form.jobDescription}
                onChange={handleChange}
                required
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="identifiedRisks">Identifiserte risikoer</Label>
              <Textarea
                id="identifiedRisks"
                name="identifiedRisks"
                value={form.identifiedRisks}
                onChange={handleChange}
                required
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="riskMitigation">Tiltak for å redusere risiko</Label>
              <Textarea
                id="riskMitigation"
                name="riskMitigation"
                value={form.riskMitigation}
                onChange={handleChange}
                required
                className="min-h-[100px]"
              />
            </div>
          </div>

          {/* Nederste rad med ansvarlig person og godkjenning */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="responsiblePerson">Ansvarlig person</Label>
              <Input
                id="responsiblePerson"
                name="responsiblePerson"
                value={form.responsiblePerson}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="approvalDate">Dato for godkjenning</Label>
              <Input
                id="approvalDate"
                name="approvalDate"
                type="date"
                value={form.approvalDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Kommentarer */}
          <div>
            <Label htmlFor="comments">Kommentarer</Label>
            <Textarea
              id="comments"
              name="comments"
              value={form.comments}
              onChange={handleChange}
              className="min-h-[80px]"
            />
          </div>

          {/* Produktseksjon */}
          <div className="space-y-4">
            <Label>Produkter fra stoffkartotek</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Select 
                  value={valgtProdukt}
                  onValueChange={setValgtProdukt}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg produkt fra stoffkartotek" />
                  </SelectTrigger>
                  <SelectContent>
                    {produkter.map(produkt => (
                      <SelectItem key={produkt.id} value={produkt.id}>
                        {produkt.produktnavn} - {produkt.produsent}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-32">
                <Input
                  type="text"
                  placeholder="Mengde"
                  value={produktMengde}
                  onChange={(e) => setProduktMengde(e.target.value)}
                />
              </div>
              
              <Button 
                type="button"
                onClick={handleLeggTilProdukt}
                variant="secondary"
              >
                Legg til produkt
              </Button>
            </div>

            {/* Liste over valgte produkter */}
            {valgteProdukter.length > 0 && (
              <div className="mt-4 border rounded-lg p-4">
                <h4 className="font-medium mb-2">Valgte produkter:</h4>
                <div className="space-y-2">
                  {valgteProdukter.map((produkt, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div>
                        <span className="font-medium">{produkt.navn}</span>
                        <span className="ml-2 text-gray-600">- Mengde: {produkt.mengde}</span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleFjernProdukt(index)}
                      >
                        Fjern
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bildeopplasting */}
          <div className="space-y-4">
            <Label>Bilder</Label>
            <div {...getRootProps()} className="border-2 border-dashed border-gray-300 p-4 mt-4 text-center cursor-pointer rounded-md hover:border-gray-400 transition-colors">
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Slipp bildene her ...</p>
              ) : (
                <p>Dra og slipp bilder her, eller klikk for å velge filer</p>
              )}
            </div>
            
            {/* Bildegalleri */}
            {bilder.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {bilder.map((bilde, index) => (
                  <div key={index} className="relative group">
                    <Image 
                      src={bilde.url} 
                      alt={`Bilde ${index + 1}`} 
                      width={200} 
                      height={200} 
                      className="rounded-md object-cover w-full h-40"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setBilder(prevBilder => prevBilder.filter((_, i) => i !== index));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800">
            Send skjema
          </Button>
        </form>
      </CardContent>

      <Dialog open={visMalModal} onOpenChange={setVisMalModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lagre som mal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="malNavn">Navn på mal</Label>
              <Input
                id="malNavn"
                value={malNavn}
                onChange={(e) => setMalNavn(e.target.value)}
                placeholder="Skriv inn navn på malen"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVisMalModal(false)}>
              Avbryt
            </Button>
            <Button onClick={lagreSomMal}>
              Lagre mal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
