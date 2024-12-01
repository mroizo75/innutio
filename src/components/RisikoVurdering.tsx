"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface RisikoVurderingForm {
  prosjektId: string;
  dato: string;
  utfortAv: string;
  godkjentAv: string;
  fareBeskrivelse: string;
  arsaker: string;
  konsekvenser: string;
  sannsynlighet: string;
  konsekvensGrad: string;
  eksisterendeTiltak: string;
  nyeTiltak: string;
  ansvarlig: string;
  tidsfrist: string;
  restRisiko: string;
  risikoAkseptabel: string;
  oppfolging: string;
  nesteGjennomgang: string;
  bedriftId: string;
  opprettetAvId: string;
}

interface SessionUser {
  id: string;
  navn: string;
  etternavn: string;
  bedriftId: string;
}

interface CustomSession {
  user?: SessionUser;
}

export default function RisikoVurdering() {
  const { data: session } = useSession() as { data: CustomSession | null };
  const [prosjekter, setProsjekter] = useState([]);
  const [form, setForm] = useState<RisikoVurderingForm>({
    prosjektId: "",
    dato: new Date().toISOString().split('T')[0],
    utfortAv: "",
    godkjentAv: "",
    fareBeskrivelse: "",
    arsaker: "",
    konsekvenser: "",
    sannsynlighet: "",
    konsekvensGrad: "",
    eksisterendeTiltak: "",
    nyeTiltak: "",
    ansvarlig: "",
    tidsfrist: "",
    restRisiko: "",
    risikoAkseptabel: "",
    oppfolging: "",
    nesteGjennomgang: "",
    bedriftId: "",
    opprettetAvId: "",
  });

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

  useEffect(() => {
    if (session?.user) {
      setForm(prev => ({
        ...prev,
        utfortAv: `${session.user?.navn || ''} ${session.user?.etternavn || ''}`,
      }));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Sender inn risikovurdering...');

    try {
      const response = await fetch('/api/risiko/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          bedriftId: session?.user?.bedriftId,
          opprettetAvId: session?.user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Kunne ikke sende inn risikovurdering');
      }

      toast.success('Risikovurdering er sendt inn!', { id: loadingToast });
      // Reset form
      setForm({
        prosjektId: prosjekter[0]?.id as string || "",
        dato: new Date().toISOString().split('T')[0],
        utfortAv: "",
        godkjentAv: "",
        fareBeskrivelse: "",
        arsaker: "",
        konsekvenser: "",
        sannsynlighet: "",
        konsekvensGrad: "",
        eksisterendeTiltak: "",
        nyeTiltak: "",
        ansvarlig: "",
        tidsfrist: "",
        restRisiko: "",
        risikoAkseptabel: "",
        oppfolging: "",
        nesteGjennomgang: "",
        bedriftId: "",
        opprettetAvId: "",
      });
    } catch (error) {
      toast.error('Kunne ikke sende inn risikovurdering', { id: loadingToast });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string, field?: string) => {
    if (typeof e === 'string' && field) {
      setForm(prev => ({ ...prev, [field]: e }));
    } else if (typeof e !== 'string') {
      const { name, value } = e.target;
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Risikovurderingsskjema</CardTitle>
        </CardHeader>
        <CardContent >
          <form onSubmit={handleSubmit} className="space-y-6 h-full">
            {/* Grunnleggende informasjon */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">1. Grunnleggende informasjon</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project">Prosjekt/Aktivitet</Label>
                  <Select 
                    value={form.prosjektId}
                    onValueChange={(value) => setForm(prev => ({ ...prev, prosjektId: value }))}
                  >
                    <SelectTrigger className="w-full">
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
                <div>
                  <Label htmlFor="date">Dato</Label>
                  <Input 
                    id="date" 
                    name="dato"
                    type="date" 
                    value={form.dato}
                    onChange={(e) => setForm(prev => ({ ...prev, dato: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Fareidentifikasjon */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">2. Fareidentifikasjon</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hazard">Beskrivelse av fare</Label>
                  <Textarea value={form.fareBeskrivelse} onChange={(e) => setForm(prev => ({ ...prev, fareBeskrivelse: e.target.value }))} id="hazard" placeholder="Beskriv potensielle farer" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="causes">Årsaker</Label>
                  <Textarea value={form.arsaker} onChange={(e) => setForm(prev => ({ ...prev, arsaker: e.target.value }))} id="causes" placeholder="Beskriv mulige årsaker" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consequences">Konsekvenser</Label>
                  <Textarea value={form.konsekvenser} onChange={(e) => setForm(prev => ({ ...prev, konsekvenser: e.target.value }))} id="consequences" placeholder="Beskriv mulige konsekvenser" />
                </div>
              </div>
            </div>

            {/* Risikoanalyse */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">3. Risikoanalyse</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="probability">Sannsynlighet</Label>
                  <Select 
                    value={form.sannsynlighet}
                    onValueChange={(value) => setForm(prev => ({ ...prev, sannsynlighet: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Velg sannsynlighet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Meget liten</SelectItem>
                      <SelectItem value="2">2 - Liten</SelectItem>
                      <SelectItem value="3">3 - Middels</SelectItem>
                      <SelectItem value="4">4 - Stor</SelectItem>
                      <SelectItem value="5">5 - Meget stor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consequence">Konsekvens</Label>
                  <Select value={form.konsekvensGrad} onValueChange={(value) => setForm(prev => ({ ...prev, konsekvensGrad: value }))} >
                    <SelectTrigger>
                      <SelectValue placeholder="Velg konsekvens" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Ubetydelig</SelectItem>
                      <SelectItem value="2">2 - Mindre alvorlig</SelectItem>
                      <SelectItem value="3">3 - Alvorlig</SelectItem>
                      <SelectItem value="4">4 - Meget alvorlig</SelectItem>
                      <SelectItem value="5">5 - Katastrofal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Eksisterende tiltak */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">4. Eksisterende sikkerhetstiltak</h3>
              <div className="space-y-2">
                <Label htmlFor="existing-measures">Beskrivelse av eksisterende tiltak</Label>
                <Textarea value={form.eksisterendeTiltak} onChange={(e) => setForm(prev => ({ ...prev, eksisterendeTiltak: e.target.value }))} id="existing-measures" placeholder="Beskriv eksisterende sikkerhetstiltak" />
              </div>
            </div>

            {/* Nye tiltak */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">5. Nye tiltak</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-measures">Beskrivelse av nye tiltak</Label>
                  <Textarea value={form.nyeTiltak} onChange={(e) => setForm(prev => ({ ...prev, nyeTiltak: e.target.value }))} id="new-measures" placeholder="Beskriv nye tiltak som bør implementeres" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="responsible">Ansvarlig</Label>
                    <Input 
                      id="responsible"
                      value={form.ansvarlig}
                      onChange={(e) => setForm(prev => ({ ...prev, ansvarlig: e.target.value }))}
                      placeholder="Navn på ansvarlig" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Tidsfrist</Label>
                    <Input id="deadline" type="date" value={form.tidsfrist} onChange={(e) => setForm(prev => ({ ...prev, tidsfrist: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>

            {/* Restrisiko */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">6. Restrisiko</h3>
              <div className="space-y-2">
                <Label htmlFor="residual-risk">Vurdering av restrisiko</Label>
                <Textarea 
                  id="residual-risk"
                  value={form.restRisiko}
                  onChange={(e) => setForm(prev => ({ ...prev, restRisiko: e.target.value }))}
                  placeholder="Beskriv gjenværende risiko etter tiltak"
                />
              </div>
              <div className="space-y-2">
                <Label>Er risikoen akseptabel?</Label>
                <Select value={form.risikoAkseptabel} onValueChange={(value) => setForm(prev => ({ ...prev, risikoAkseptabel: value }))} >
                  <SelectTrigger>
                    <SelectValue placeholder="Velg" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Ja</SelectItem>
                    <SelectItem value="no">Nei</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Oppfølging */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">7. Oppfølging</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="follow-up">Plan for oppfølging</Label>
                  <Textarea value={form.oppfolging} onChange={(e) => setForm(prev => ({ ...prev, oppfolging: e.target.value }))} id="follow-up" placeholder="Beskriv plan for oppfølging og evaluering" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next-review">Dato for neste gjennomgang</Label>
                  <Input id="next-review" type="date" value={form.nesteGjennomgang} onChange={(e) => setForm(prev => ({ ...prev, nesteGjennomgang: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline">Avbryt</Button>
              <Button type="submit">Lagre vurdering</Button>
            </div>
          </form>
        </CardContent>
      </Card>
  );
}
