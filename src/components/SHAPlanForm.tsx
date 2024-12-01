"use client"

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PlusCircle, Trash2 } from "lucide-react";

export default function SHAPlanForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [prosjekter, setProsjekter] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    prosjektId: "",
    byggherre: "",
    entreprenor: "",
    risikoanalyse: {
      arbeidsoperasjoner: [{
        beskrivelse: "",
        risiko: "",
        tiltak: "",
        ansvarlig: ""
      }]
    },
    vernetiltak: {
      personlig: [""],
      kollektivt: [""],
      organisatorisk: [""]
    },
    beredskapsplan: {
      nodprosedyrer: "",
      kontaktpersoner: [{
        navn: "",
        rolle: "",
        telefon: ""
      }],
      moteplasser: ""
    },
    ansvarlige: {
      koordinator: "",
      verneombud: "",
      prosjektleder: ""
    }
  });

  useEffect(() => {
    const hentProsjekter = async () => {
      try {
        const response = await fetch('/api/prosjekter');
        if (response.ok) {
          const data = await response.json();
          setProsjekter(data);
        }
      } catch (error) {
        console.error('Feil ved henting av prosjekter:', error);
        toast.error('Kunne ikke hente prosjekter');
      }
    };
    hentProsjekter();
  }, []);

  const validateForm = () => {
    const errors: string[] = [];

    // Grunnleggende validering
    if (!form.prosjektId) errors.push("Prosjekt må velges");
    if (!form.byggherre.trim()) errors.push("Byggherre må fylles ut");
    if (!form.entreprenor.trim()) errors.push("Entreprenør må fylles ut");

    // Risikoanalyse validering
    const invalidArbeidsoperasjoner = form.risikoanalyse.arbeidsoperasjoner.some(
      op => !op.beskrivelse.trim() || !op.risiko.trim() || !op.tiltak.trim() || !op.ansvarlig.trim()
    );
    if (invalidArbeidsoperasjoner) {
      errors.push("Alle felt i arbeidsoperasjoner må fylles ut");
    }

    // Vernetiltak validering
    const emptyPersonlig = form.vernetiltak.personlig.some(t => !t.trim());
    const emptyKollektivt = form.vernetiltak.kollektivt.some(t => !t.trim());
    const emptyOrganisatorisk = form.vernetiltak.organisatorisk.some(t => !t.trim());
    
    if (emptyPersonlig) errors.push("Alle personlige vernetiltak må fylles ut");
    if (emptyKollektivt) errors.push("Alle kollektive vernetiltak må fylles ut");
    if (emptyOrganisatorisk) errors.push("Alle organisatoriske vernetiltak må fylles ut");

    // Beredskapsplan validering
    if (!form.beredskapsplan.nodprosedyrer.trim()) {
      errors.push("Nødprosedyrer må fylles ut");
    }

    const invalidKontaktpersoner = form.beredskapsplan.kontaktpersoner.some(
      person => !person.navn.trim() || !person.rolle.trim() || !person.telefon.trim()
    );
    if (invalidKontaktpersoner) {
      errors.push("Alle felt for kontaktpersoner må fylles ut");
    }

    if (!form.beredskapsplan.moteplasser.trim()) {
      errors.push("Møteplasser må fylles ut");
    }

    // Ansvarlige validering
    if (!form.ansvarlige.koordinator.trim()) errors.push("SHA-koordinator må fylles ut");
    if (!form.ansvarlige.verneombud.trim()) errors.push("Verneombud må fylles ut");
    if (!form.ansvarlige.prosjektleder.trim()) errors.push("Prosjektleder må fylles ut");

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const valideringsFeil = validateForm();
    if (valideringsFeil.length > 0) {
      valideringsFeil.forEach(feil => toast.error(feil));
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Lagrer SHA-plan...');

    try {
      const response = await fetch('/api/sha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error('Noe gikk galt');
      }

      toast.success('SHA-plan opprettet');
      router.push('/sha');
      router.refresh();
    } catch (error) {
      console.error('Feil ved opprettelse av SHA-plan:', error);
      toast.error('Kunne ikke opprette SHA-plan');
    } finally {
      setLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleRisikoanalyseChange = (index: number, field: string, value: string) => {
    const newArbeidsoperasjoner = [...form.risikoanalyse.arbeidsoperasjoner];
    newArbeidsoperasjoner[index] = {
      ...newArbeidsoperasjoner[index],
      [field]: value
    };
    setForm(prev => ({
      ...prev,
      risikoanalyse: {
        ...prev.risikoanalyse,
        arbeidsoperasjoner: newArbeidsoperasjoner
      }
    }));
  };

  const leggTilArbeidsoperasjon = () => {
    setForm(prev => ({
      ...prev,
      risikoanalyse: {
        ...prev.risikoanalyse,
        arbeidsoperasjoner: [
          ...prev.risikoanalyse.arbeidsoperasjoner,
          { beskrivelse: "", risiko: "", tiltak: "", ansvarlig: "" }
        ]
      }
    }));
  };

  const leggTilVernetiltak = (type: 'personlig' | 'kollektivt' | 'organisatorisk') => {
    setForm(prev => ({
      ...prev,
      vernetiltak: {
        ...prev.vernetiltak,
        [type]: [...prev.vernetiltak[type], ""]
      }
    }));
  };

  const handleVernetiltakChange = (type: 'personlig' | 'kollektivt' | 'organisatorisk', index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      vernetiltak: {
        ...prev.vernetiltak,
        [type]: prev.vernetiltak[type].map((tiltak, i) => i === index ? value : tiltak)
      }
    }));
  };

  const leggTilKontaktperson = () => {
    setForm(prev => ({
      ...prev,
      beredskapsplan: {
        ...prev.beredskapsplan,
        kontaktpersoner: [
          ...prev.beredskapsplan.kontaktpersoner,
          { navn: "", rolle: "", telefon: "" }
        ]
      }
    }));
  };

  const handleKontaktpersonChange = (index: number, field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      beredskapsplan: {
        ...prev.beredskapsplan,
        kontaktpersoner: prev.beredskapsplan.kontaktpersoner.map((person, i) => 
          i === index ? { ...person, [field]: value } : person
        )
      }
    }));
  };

  const fjernArbeidsoperasjon = (index: number) => {
    setForm(prev => ({
      ...prev,
      risikoanalyse: {
        ...prev.risikoanalyse,
        arbeidsoperasjoner: prev.risikoanalyse.arbeidsoperasjoner.filter((_, i) => i !== index)
      }
    }));
  };

  const fjernVernetiltak = (type: 'personlig' | 'kollektivt' | 'organisatorisk', index: number) => {
    setForm(prev => ({
      ...prev,
      vernetiltak: {
        ...prev.vernetiltak,
        [type]: prev.vernetiltak[type].filter((_, i) => i !== index)
      }
    }));
  };

  const fjernKontaktperson = (index: number) => {
    setForm(prev => ({
      ...prev,
      beredskapsplan: {
        ...prev.beredskapsplan,
        kontaktpersoner: prev.beredskapsplan.kontaktpersoner.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Ny SHA-plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prosjektvalg */}
          <div className="space-y-2">
            <Label htmlFor="prosjekt">Velg prosjekt</Label>
            <Select 
              onValueChange={(value) => setForm(prev => ({ ...prev, prosjektId: value }))}
              value={form.prosjektId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg prosjekt" />
              </SelectTrigger>
              <SelectContent>
                {prosjekter.map((prosjekt: any) => (
                  <SelectItem key={prosjekt.id} value={prosjekt.id}>
                    {prosjekt.navn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grunnleggende informasjon */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="byggherre">Byggherre</Label>
              <Input
                id="byggherre"
                value={form.byggherre}
                onChange={(e) => setForm(prev => ({ ...prev, byggherre: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entreprenor">Entreprenør</Label>
              <Input
                id="entreprenor"
                value={form.entreprenor}
                onChange={(e) => setForm(prev => ({ ...prev, entreprenor: e.target.value }))}
              />
            </div>
          </div>

          {/* Risikoanalyse */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Risikoanalyse</h3>
            {form.risikoanalyse.arbeidsoperasjoner.map((op, index) => (
              <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Beskrivelse av arbeidsoperasjon</Label>
                  <Textarea
                    value={op.beskrivelse}
                    onChange={(e) => handleRisikoanalyseChange(index, 'beskrivelse', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Risiko</Label>
                  <Textarea
                    value={op.risiko}
                    onChange={(e) => handleRisikoanalyseChange(index, 'risiko', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tiltak</Label>
                  <Textarea
                    value={op.tiltak}
                    onChange={(e) => handleRisikoanalyseChange(index, 'tiltak', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ansvarlig</Label>
                  <Input
                    value={op.ansvarlig}
                    onChange={(e) => handleRisikoanalyseChange(index, 'ansvarlig', e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={leggTilArbeidsoperasjon}
              className="w-full"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Legg til arbeidsoperasjon
            </Button>
          </div>

          {/* Vernetiltak */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Vernetiltak</h3>
            
            {['personlig', 'kollektivt', 'organisatorisk'].map((type) => (
              <div key={type} className="space-y-4">
                <Label>{type.charAt(0).toUpperCase() + type.slice(1)}e vernetiltak</Label>
                {form.vernetiltak[type].map((tiltak, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={tiltak}
                      onChange={(e) => handleVernetiltakChange(type as any, index, e.target.value)}
                      placeholder={`Beskriv ${type} vernetiltak`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => fjernVernetiltak(type as any, index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => leggTilVernetiltak(type as any)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Legg til {type} vernetiltak
                </Button>
              </div>
            ))}
          </div>

          {/* Beredskapsplan */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Beredskapsplan</h3>
            
            <div className="space-y-4">
              <Label htmlFor="nodprosedyrer">Nødprosedyrer</Label>
              <Textarea
                id="nodprosedyrer"
                value={form.beredskapsplan.nodprosedyrer}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  beredskapsplan: {
                    ...prev.beredskapsplan,
                    nodprosedyrer: e.target.value
                  }
                }))}
                placeholder="Beskriv nødprosedyrer"
              />
            </div>

            <div className="space-y-4">
              <Label>Kontaktpersoner</Label>
              {form.beredskapsplan.kontaktpersoner.map((person, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                  <Input
                    placeholder="Navn"
                    value={person.navn}
                    onChange={(e) => handleKontaktpersonChange(index, 'navn', e.target.value)}
                  />
                  <Input
                    placeholder="Rolle"
                    value={person.rolle}
                    onChange={(e) => handleKontaktpersonChange(index, 'rolle', e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Telefon"
                      value={person.telefon}
                      onChange={(e) => handleKontaktpersonChange(index, 'telefon', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => fjernKontaktperson(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={leggTilKontaktperson}
                className="w-full"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Legg til kontaktperson
              </Button>
            </div>

            <div className="space-y-4">
              <Label htmlFor="moteplasser">Møteplasser</Label>
              <Textarea
                id="moteplasser"
                value={form.beredskapsplan.moteplasser}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  beredskapsplan: {
                    ...prev.beredskapsplan,
                    moteplasser: e.target.value
                  }
                }))}
                placeholder="Beskriv møteplasser"
              />
            </div>
          </div>

          {/* Ansvarlige */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Ansvarlige</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries({
                koordinator: "SHA-koordinator",
                verneombud: "Verneombud",
                prosjektleder: "Prosjektleder"
              }).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    value={form.ansvarlige[key]}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      ansvarlige: {
                        ...prev.ansvarlige,
                        [key]: e.target.value
                      }
                    }))}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button type="button" variant="outline" onClick={() => router.push('/sha')}>
              Avbryt
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Lagrer...' : 'Opprett SHA-plan'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}