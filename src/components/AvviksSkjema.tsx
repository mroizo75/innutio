"use client"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from 'react-hot-toast';
import { Prosjekt } from "@prisma/client";
import { useDropzone } from "react-dropzone";
import Image from "next/image";



export default function AvviksSkjema() {
  const [form, setForm] = useState({
    tittel: "",
    prosjektId: "",
    innhold: {
      responsible: "",
      discoveredBy: "",
      date: "",
      place: "",
      occurredBefore: false,
      consequence: {
        person: false,
        equipment: false,
        environment: false,
        other: false,
        otherDescription: "",
      },
      description: "",
      shortTermCorrection: "",
      longTermCorrection: "",
    }
  });
  const [_error, setError] = useState("");
  const [_successMessage, setSuccessMessage] = useState<string | null>(null);
  const [prosjekter, setProsjekter] = useState<Prosjekt[]>([]);
  const [avviksnummer, setAvviksnummer] = useState<string | null>(null);
  const [bilder, setBilder] = useState<{ url: string; navn: string }[]>([]);

  useEffect(() => {
    async function fetchProsjekter() {
      try {
        const response = await fetch('/api/prosjekter');
        if (response.ok) {
          const data = await response.json();
          setProsjekter(data);
  
          // Sett standard prosjektId hvis det er prosjekter
          if (data.length > 0) {
            setForm((prevForm) => ({
              ...prevForm,
              prosjektId: data[0].id,
            }));
          }
        } else {
          console.error('Feil ved henting av prosjekter');
        }
      } catch (error) {
        console.error('Feil ved henting av prosjekter:', error);
      }
    }
    fetchProsjekter();
  }, []);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name === "tittel") {
      setForm(prevForm => ({
        ...prevForm,
        tittel: value
      }));
    } else {
      setForm(prevForm => ({
        ...prevForm,
        innhold: {
          ...prevForm.innhold,
          [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }
      }));
    }
  };

  const handleConsequenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      innhold: {
        ...prevForm.innhold,
        consequence: {
          ...prevForm.innhold.consequence,
          [name]: checked,
        },
      }
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
      } catch (error) {
        console.error('Feil ved opplasting av bilde:', error);
        toast.error('Feil ved opplasting av bilde');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setSuccessMessage(null);

  if (!form.prosjektId) {
    setError("Vennligst velg et prosjekt.");
    return;
  }

  // Rens consequence-objektet for å fjerne ugyldige felter
  const cleanedConsequence = {
    person: form.innhold.consequence.person,
    equipment: form.innhold.consequence.equipment,
    environment: form.innhold.consequence.environment,
    other: form.innhold.consequence.other,
    otherDescription: form.innhold.consequence.otherDescription
  };

  const formData = {
    tittel: form.tittel,
    innhold: {
      ...form.innhold,
      consequence: cleanedConsequence
    },
    prosjektId: form.prosjektId,
    bilder: bilder
  };

  try {
    const response = await fetch("/api/submit-avvik", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const result = await response.json();
      toast.success('Avviksskjema er sendt inn!', {
        duration: 5000,
        icon: '✅',
      });
      setAvviksnummer(result.avviksnummer);
      // Nullstill skjemaet
      setForm({
        tittel: "",
        prosjektId: prosjekter[0].id,
        innhold: {
          responsible: "",
          discoveredBy: "",
          date: "",
          place: "",
          occurredBefore: false,
          consequence: {
            person: false,
            equipment: false,
            environment: false,
            other: false,
            otherDescription: "",
          },
          description: "",
          shortTermCorrection: "",
          longTermCorrection: "",
        }
      });
      setBilder([]);
    } else {
      const errorData = await response.json();
      setError(errorData.error || "En feil oppstod ved innsending av skjemaet.");
    }
  } catch (error) {
    console.error("En feil oppstod:", error);
    setError("En feil oppstod ved innsending av skjemaet.");
  }
};

  return (
    <>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Nytt Avvik</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tittel">Tittel</Label>
                <Input
                  id="tittel"
                  name="tittel"
                  value={form.tittel}
                  onChange={handleChange}
                  placeholder="Skriv inn tittelen på avviket"
                  required
                />
              </div>
              <div>
                <Label htmlFor="prosjektId">Prosjekt</Label>
                <Select
                defaultValue="Velg et prosjekt"
                  value={form.prosjektId}
                  onValueChange={(value) =>
                      setForm((prevForm) => ({
                        ...prevForm,
                        prosjektId: value,
                      }))
                    }
                  >

                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Velg et prosjekt" />
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
              <div>
                <Label htmlFor="responsible">Ansvarlig person</Label>
                <Input
                  id="responsible"
                  name="responsible"
                  value={form.innhold.responsible}
                  onChange={handleChange}
                  placeholder="Ansvarlig person"
                  required
                />
              </div>
              <div>
                <Label htmlFor="discoveredBy">Oppdaget av</Label>
                <Input
                  id="discoveredBy"
                  name="discoveredBy"
                  value={form.innhold.discoveredBy}
                  onChange={handleChange}
                  placeholder="Hvem oppdaget avviket"
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Dato</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={form.innhold.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="place">Sted</Label>
                <Input
                  id="place"
                  name="place"
                  value={form.innhold.place}
                  onChange={handleChange}
                  placeholder="Hvor skjedde avviket"
                  required
                />
              </div>
            </div>
    
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Hendt tidligere</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center">
                    <Checkbox
                      id="occurredBeforeYes"
                      name="occurredBefore"
                      checked={form.innhold.occurredBefore}
                      onCheckedChange={(checked) => 
                        setForm(prevForm => ({
                          ...prevForm,
                          innhold: {
                            ...prevForm.innhold,
                            occurredBefore: checked as boolean
                          } 
                        }))
                      }
                    />
                    <Label htmlFor="occurredBeforeYes" className="ml-2">Ja</Label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox
                      id="occurredBeforeNo"
                      name="occurredBefore"
                      checked={!form.innhold.occurredBefore}
                      onCheckedChange={(checked) => 
                        setForm(prevForm => ({
                          ...prevForm,
                          innhold: {
                            ...prevForm.innhold,
                            occurredBefore: !(checked as boolean)
                          } 
                        }))
                      }
                    />
                    <Label htmlFor="occurredBeforeNo" className="ml-2">Nei</Label>
                  </div>
                </div>
              </div>
              <div>
                <Label>Konsekvens</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['Person', 'Utstyr', 'Miljø', 'Annet'].map((key) => (
                    <div key={key.toLowerCase()} className="flex items-center">
                      <Checkbox
                        id={`consequence-${key.toLowerCase()}`}
                        name={key.toLowerCase()}
                        checked={form.innhold.consequence[key.toLowerCase() as keyof typeof form.innhold.consequence] as boolean}
                        onCheckedChange={(checked) => handleConsequenceChange({ target: { name: key.toLowerCase(), checked: checked as boolean } } as React.ChangeEvent<HTMLInputElement>)}
                      />
                      <Label htmlFor={`consequence-${key.toLowerCase()}`} className="ml-2">{key}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
    
            {form.innhold.consequence.other && (
              <div>
                <Label htmlFor="otherDescription">Beskriv annet</Label>
                <Input
                  id="otherDescription"
                  name="otherDescription"
                  value={form.innhold.consequence.otherDescription}
                  onChange={(e) => setForm(prevForm => ({
                    ...prevForm,
                    innhold: {
                      ...prevForm.innhold,
                      consequence: {
                        ...prevForm.innhold.consequence,
                        otherDescription: e.target.value,
                      },
                    },
                  }))}
                  placeholder="Beskriv annet"
                />
              </div>
            )}
    
            <div>
              <Label htmlFor="description">Beskrivelse</Label>
              <Textarea
                id="description"
                name="description"
                value={form.innhold.description}
                onChange={handleChange}
                placeholder="Beskrivelse av avviket"
                required
                className="min-h-[100px]"
              />
            </div>
            <div {...getRootProps()} className="border-2 border-dashed border-gray-300 p-4 mt-4 text-center cursor-pointer">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Slipp bildene her ...</p>
        ) : (
          <p>Dra og slipp bilder her, eller klikk for å velge filer</p>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {bilder.map((bilde, index) => (
          <div key={index} className="relative">
            <Image src={bilde.url} alt={`Bilde ${index + 1}`} width={100} height={100} objectFit="cover" />
            <button
              onClick={() => setBilder(prevBilder => prevBilder.filter((_, i) => i !== index))}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
            >
              X
            </button>
          </div>
        ))}
      </div>
    
            <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800">
              Send inn avvik
            </Button>
          </form>
        </CardContent>
      </Card>
      {avviksnummer && (
        <div className="mt-4 p-4 bg-green-100 text-green-800">
          <p>Avviket er registrert med avviksnummer: <strong>{avviksnummer}</strong></p>
        </div>
      )}
      
    </>
  );
}
