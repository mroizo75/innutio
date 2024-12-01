"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { updateSkjemaStatus, deleteSkjema, updateSkjemaSolutionAndNotes, deleteEndringsSkjema, updateEndringsSkjemaLosning, updateAvvikSkjemaLosning, getAllArchivedSkjemaer } from "@/actions/skjema"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { User } from "@prisma/client"

function formatDate(dateString: string | Date | undefined): string {
  if (!dateString) return 'Ikke satt';
  let date: Date;
  if (typeof dateString === 'string') {
    date = new Date(dateString);
  } else {
    date = dateString;
  }
  if (isNaN(date.getTime())) return 'Ugyldig dato';
  return format(date, 'dd.MM.yyyy', { locale: nb });
}

interface BaseSkjema {
  id: string
  status: string
  opprettetDato: Date
  updatedAt: Date
  bedriftId: string
  prosjektId: string | null
  behandlerId: string | null
  opprettetAvId: string
  behandler: {
    navn: string
    etternavn: string
  } | null
  opprettetAv: {
    navn: string
    etternavn: string
  }
  bilder: {
    id: string
    url: string
    navn: string
  }[]
  solution: string | null
  notes: string | null
  type: 'Avvik' | 'Endring'
}

interface AvvikSkjema extends BaseSkjema {
  type: 'Avvik'
  tittel: string
  innhold: {
    description?: string
    place?: string
    discoveredBy?: string
  }
  avviksnummer: string
}

interface EndringsSkjema extends BaseSkjema {
  type: 'Endring'
  changeNumber: string
  prosjekt: {
    id: string
    navn: string
  }
  description: string
  implementationDate: Date
  comments: string | null
  tittel: string
  avviksnummer: string
}

export type Skjema = AvvikSkjema | EndringsSkjema

interface SkjemaBoardProps {
  skjemaer: Skjema[]
  currentUser: User
}

function getNormalizedStatus(skjema: Skjema): string {
  return skjema.status === 'Åpen' ? 'Under behandling' : skjema.status;
}

export default function SkjemaBoard({ skjemaer, currentUser }: SkjemaBoardProps) {
  const [localSkjemaer, setLocalSkjemaer] = useState(skjemaer)
  const [editingSolution, setEditingSolution] = useState<string | null>(null)
  const [solution, setSolution] = useState("")
  const [notes, setNotes] = useState("")
  const [archivedSkjemaer, setArchivedSkjemaer] = useState<Skjema[]>([])
  const [showArchived, setShowArchived] = useState(true)
  const [selectedImage, setSelectedImage] = useState<{ url: string; beskrivelse: string | null } | null>(null);

const handleImageClick = (image: { url: string; beskrivelse: string | null }) => {
  setSelectedImage(image);
};

const handleCloseImage = () => {
  setSelectedImage(null);
};


  useEffect(() => {
    setLocalSkjemaer(skjemaer);
    console.log('Skjemaer mottatt i SkjemaBoard:', skjemaer);
  }, [skjemaer]);

  // Oppdatert filtrering
  const ubehandletSkjemaer = localSkjemaer.filter(
    (skjema) => getNormalizedStatus(skjema) === 'Ubehandlet'
  );
  const underBehandlingSkjemaer = localSkjemaer.filter(
    (skjema) => getNormalizedStatus(skjema) === 'Under behandling'
  );
  const ferdigBehandletSkjemaer = localSkjemaer.filter(
    (skjema) => getNormalizedStatus(skjema) === 'Ferdig behandlet'
  );
  // Sorter skjemaer etter type
  const allSkjemaer = localSkjemaer;

  const handleStatusChange = async (
    skjemaId: string,
    newStatus: string,
    skjemaType: 'Avvik' | 'Endring'
  ) => {
    try {
      let actualStatus = newStatus;
      if (skjemaType === 'Endring' && newStatus === 'Under behandling') {
        actualStatus = 'Åpen';
      }
      const updatedSkjema = await updateSkjemaStatus(
        skjemaId,
        actualStatus,
        currentUser.id,
        skjemaType
      );
      if (updatedSkjema) {
        setLocalSkjemaer(prevSkjemaer =>
          prevSkjemaer.map(skjema => {
            if (skjema.id === skjemaId && skjema.type === skjemaType) {
              const { type, ...restOfUpdatedSkjema } = updatedSkjema;
              return {
                ...skjema,
                ...restOfUpdatedSkjema,
                bilder: skjema.bilder
              };
            } else {
              return skjema;
            }
          })
        );
      }
    } catch (error) {
      console.error('Feil ved oppdatering av skjemastatus:', error);
      alert('Kunne ikke oppdatere skjemastatus. Vennligst prøv igjen senere.');
    }
  };
  
  const handleSaveAvvikLosning = async (skjemaId: string) => {
    try {
      const updatedSkjema = await updateAvvikSkjemaLosning(skjemaId, solution, notes);
      if (updatedSkjema) {
        setLocalSkjemaer(prevSkjemaer =>
          prevSkjemaer.map(skjema =>
            skjema.id === skjemaId ? { ...skjema, solution, notes } : skjema
          )
        );
        setEditingSolution(null);
        setSolution("");
        setNotes("");
      }
    } catch (error) {
      console.error("Feil ved lagring av avviksløsning:", error);
      alert(`Kunne ikke lagre avviksløsning: ${error instanceof Error ? error.message : 'Ukjent feil'}`);
    }
  };
  
  const handleSaveEndringsLosning = async (skjemaId: string) => {
    const loadingToast = toast.loading('Lagrer endringsløsning...');
    try {
      const updatedSkjema = await updateEndringsSkjemaLosning(skjemaId, solution);
      if (updatedSkjema) {
        setLocalSkjemaer(prevSkjemaer =>
          prevSkjemaer.map(skjema =>
            skjema.id === skjemaId ? { ...skjema, solution } : skjema
          )
        );
        setEditingSolution(null);
        setSolution("");
        toast.success('Endringsløsning lagret!', { id: loadingToast });
      }
    } catch (error) {
      console.error("Feil ved lagring av endringsløsning:", error);
      toast.error(`Kunne ikke lagre endringsløsning: ${error instanceof Error ? error.message : 'Ukjent feil'}`, { id: loadingToast });
    }
  };
  

  const handleSaveSolution = async (
    skjemaId: string,
    skjemaType: 'Avvik' | 'Endring' | 'SJA'
  ) => {
    try {
      if (skjemaType === 'Avvik') {
        await handleSaveAvvikLosning(skjemaId);
      } else if (skjemaType === 'Endring') {
        await handleSaveEndringsLosning(skjemaId);
      } else {
        throw new Error('Ugyldig skjematype');
      }
    } catch (error) {
      console.error('Feil ved lagring av løsning:', error);
      alert('Kunne ikke lagre løsning. Vennligst prøv igjen senere.');
    }
  };

  const handleGeneratePDF = async (skjemaId: string, skjemaType: 'Avvik' | 'Endring') => {
    try {
      const response = await fetch(`/api/generer-skjema-pdf/${skjemaType}/${skjemaId}`);
      if (!response.ok) {
        throw new Error('Kunne ikke generere PDF');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skjema_${skjemaId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Feil ved generering av PDF:', error);
      alert('En feil oppstod under generering av PDF-en.');
    }
  };



  const handleDelete = async (skjemaId: string, skjemaType: 'Avvik' | 'Endring') => {
    try {
      if (skjemaType === 'Avvik') {
        await deleteSkjema(skjemaId);
      } else if (skjemaType === 'Endring') {
        await deleteEndringsSkjema(skjemaId);
      } else {
        throw new Error('Ugyldig skjematype');
      }
      setLocalSkjemaer(prevSkjemaer => prevSkjemaer.filter(skjema => skjema.id !== skjemaId));
    } catch (error) {
      console.error(`Feil ved sletting av ${skjemaType.toLowerCase()}:`, error);
      alert(`Kunne ikke slette ${skjemaType.toLowerCase()}. Vennligst prøv igjen senere.`);
    }
  };
  
  
  const handleArchive = async (skjemaId: string, skjemaType: 'Avvik' | 'Endring') => {
    try {
      await updateSkjemaStatus(skjemaId, 'Arkivert', currentUser.id, skjemaType);
      setLocalSkjemaer(prevSkjemaer => 
        prevSkjemaer.filter(skjema => skjema.id !== skjemaId)
      );
      
      // Oppdater arkivet
      const archivedData = await getAllArchivedSkjemaer();
      setArchivedSkjemaer(archivedData);
      
      toast.success('Skjema arkivert');
    } catch (error) {
      console.error('Feil ved arkivering:', error);
      toast.error('Kunne ikke arkivere skjema');
    }
  };
  

  useEffect(() => {
    let isMounted = true;
    
    const fetchArchivedSkjemaer = async () => {
      try {
        const data = await getAllArchivedSkjemaer();
        if (isMounted) {
          setArchivedSkjemaer(data);
        }
      } catch (error) {
        console.error('Feil ved henting av arkiverte skjemaer:', error);
        toast.error('Kunne ikke laste arkiverte skjemaer');
      }
    };
  
    if (showArchived) {
      fetchArchivedSkjemaer();
    }
  
    return () => {
      isMounted = false;
    };
  }, [showArchived]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Skjemaer</h2>
      <div className="flex flex-col space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Ubehandlet */}
          <div>
            <h3 className="text-xl font-bold">Ubehandlet</h3>
            {ubehandletSkjemaer.map((skjema) => (
              <Card key={skjema.id} className="bg-red-100 mb-4 dark:bg-black">
                <CardContent>
                  {/* Tittel */}
                  <h3 className="font-bold text-lg mb-2">
                    {skjema.type === 'Avvik' && skjema.tittel}
                    {skjema.type === 'Endring' && `${skjema.changeNumber}: ${skjema.prosjekt.navn}`}
                  </h3>
                  {/* Detaljer basert på skjematype */}
                  {skjema.type === 'Avvik' && (
                      <>
                      <p>Beskrivelse: {skjema.innhold?.description || 'Ingen beskrivelse'}</p>
                      <p>Sted: {skjema.innhold?.place || 'Ikke angitt'}</p>
                      <p>Oppdaget av: {skjema.innhold?.discoveredBy || 'Ikke angitt'}</p>
                      <p>Type: {skjema.type}</p>
                      <p>Dato: {formatDate(skjema.opprettetDato)}</p>
                      {/* Eventuelle andre detaljer for Avvik */}
                    </>
                  )}
                  {skjema.type === 'Endring' && (
                    <>
                      <p>Beskrivelse: {skjema.description || 'Ingen beskrivelse'}</p>
                      <p>Implementeringsdato: {formatDate(skjema.implementationDate)}</p>
                      <p>Type: {skjema.type}</p>
                      <p>Dato: {formatDate(skjema.opprettetDato)}</p>
                    </>
                  )}
                  {/* Handlinger */}
                  <div className="mt-2 flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleStatusChange(skjema.id, 'Under behandling', skjema.type)
                      }
                    >
                      Start
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(skjema.id, skjema.type)}
                    >
                      Slett
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Under behandling */}
          <div>
          <h3 className="text-xl font-bold">Under behandling</h3>
        {underBehandlingSkjemaer.map((skjema) => (
          <Card key={skjema.id} className="bg-yellow-100 mb-4 dark:bg-gray-800">
            <CardContent>
              {/* Tittel */}
              <h3 className="font-bold text-lg mb-2">
                {skjema.type === 'Avvik' && skjema.tittel}
                {skjema.type === 'Endring' && `${skjema.changeNumber}: ${skjema.projectName}`}
              </h3>
              {/* Detaljer basert på skjematype */}
              {skjema.type === 'Avvik' && (
          <>
            <p><strong>Beskrivelse:</strong> {skjema.innhold?.description || 'Ingen beskrivelse'}</p>
            <p><strong>Sted:</strong> {skjema.innhold?.place || 'Ikke angitt'}</p>
            <p><strong>Type</strong> {skjema.type || 'Ikke angitt'}</p>
            <p><strong>Oppdaget av:</strong> {skjema.innhold?.discoveredBy || 'Ikke angitt'}</p>
            <p><strong>Status:</strong> {skjema.status}</p>
            {/* Andre detaljer du ønsker å vise */}
            {skjema.bilder && skjema.bilder.length > 0 && (
                        <div>
                          <p><strong>Bilder:</strong></p>
                          <div className="flex flex-wrap gap-2">
                            {skjema.bilder.map((bilde) => (
                              <div key={bilde.id} className="relative">
                                <Image
                                  src={bilde.url}
                                  alt={bilde.navn || 'Bilde for avvik'}
                                  width={100}
                                  height={100}
                                  className="cursor-pointer object-cover"
                                  onClick={() => handleImageClick({ url: bilde.url, beskrivelse: bilde.navn })}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      </>
                      )}
                  {skjema.type === 'Endring' && (
                <>
                  <p><strong>Prosjektnavn:</strong> {skjema.prosjekt.navn}</p>
                  <p><strong>Endringsnummer:</strong> {skjema.changeNumber}</p>
                  <p><strong>Beskrivelse:</strong> {skjema.description || 'Ingen beskrivelse'}</p>
                  <p><strong>Implementeringsdato:</strong> {formatDate(skjema.implementationDate)}</p>
                  <p><strong>Implementert av:</strong> {skjema.opprettetAv?.navn} {skjema.opprettetAv?.etternavn || 'Ikke angitt'}</p>
                  <p><strong>Kommentarer:</strong> {skjema.comments || 'Ingen kommentarer'}</p>
                  <p><strong>Status:</strong> {skjema.status}</p>
                  <p><strong>Type:</strong>{skjema.type}</p>
                  {skjema.bilder && skjema.bilder.length > 0 && (
                        <div>
                          <p><strong>Bilder:</strong></p>
                          <div className="flex flex-wrap gap-2">
                            {skjema.bilder.map((bilde) => (
                              <div key={bilde.id} className="relative">
                                <Image
                                  src={bilde.url}
                                  alt={bilde.navn || 'Bilde for endring'}
                                  width={100}
                                  height={100}
                                  className="cursor-pointer object-cover"
                                  onClick={() => handleImageClick({ 
                                    url: bilde.url, 
                                    beskrivelse: bilde.navn || 'Bilde for endring'
                                  })}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  {/* Andre detaljer du ønsker å vise */}
                </>
              )}
              {/* Mulighet for å redigere løsning og notater */}
              {editingSolution === skjema.id ? (
                <>
                  <Textarea
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="Kortsiktig utbedring..."
                  />
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Langsiktig utbedring..."
                  />
                  <Button onClick={() => handleSaveSolution(skjema.id, skjema.type)}>Lagre</Button>
                  <Button variant="secondary" onClick={() => setEditingSolution(null)}>Avbryt</Button>
                </>
              ) : (
                <>
                  <p><strong>Kortsiktig utbedring:</strong> {skjema.solution || 'Ingen løsning'}</p>
                  <p><strong>Langsiktig utbedring:</strong> {skjema.notes || 'Ingen notater'}</p>
                  <Button
                    onClick={() => {
                      setEditingSolution(skjema.id);
                      setSolution(skjema.solution || '');
                      setNotes(skjema.notes || '');
                    }}
                  >
                    {skjema.solution ? 'Lagre utbedring' : 'Legg til løsning'}
                        </Button>
                      </>
                    )}
                  {/* Handlinger */}
                          <div className="mt-2 flex space-x-1 flex-wrap gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStatusChange(skjema.id, 'Ferdig behandlet', skjema.type)
                              }
                            >
                              Ferdig
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleStatusChange(skjema.id, 'Ubehandlet', skjema.type)
                              }
                            >
                              Ubehandlet
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(skjema.id, skjema.type)}
                            >
                              Slett
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
          {/* Ferdig behandlet */}
          <div>
            <h3 className="text-xl font-bold">Ferdig behandlet</h3>
            {ferdigBehandletSkjemaer.map((skjema) => (
              <Card key={skjema.id} className="bg-green-100 mb-4 dark:bg-gray-600">
                <CardContent>
                  {/* Tittel */}
                  <h3 className="font-bold text-lg mb-2">
                    {skjema.type === 'Avvik' && skjema.tittel}
                    {skjema.type === 'Endring' && `${skjema.changeNumber}: ${skjema.projectName}`}
                  </h3>
                  {/* Detaljer basert på skjematype */}
                  <p>Type: {skjema.type}</p>
                  <p>Dato: {formatDate(skjema.opprettetDato)}</p>
                  <p>Behandler: {skjema.behandler?.navn || 'Ikke angitt'} {skjema.behandler?.etternavn || 'Ikke angitt'}</p>
                  {/* Handlinger */}
                  <div className="mt-2 flex space-x-1 flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleStatusChange(skjema.id, 'Under behandling', skjema.type)
                      }
                    >
                      Under behandling
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleStatusChange(skjema.id, 'Ubehandlet', skjema.type)
                      }
                    >
                      Sett til Ubehandlet
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(skjema.id, skjema.type)}
                    >
                      Slett
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleArchive(skjema.id, skjema.type)}
                    >
                      Arkiver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
          <>
            {/* Arkivseksjon */}
<div className="mt-8">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-2xl font-bold">Arkiv</h2>
    <Button onClick={() => setShowArchived(!showArchived)}>
      {showArchived ? 'Skjul arkiv' : 'Vis arkiv'}
    </Button>
  </div>
  {showArchived && (
    <Tabs defaultValue="Avvik">
      <TabsList>
        <TabsTrigger value="Avvik">Avvik</TabsTrigger>
        <TabsTrigger value="Endring">Endringer</TabsTrigger>
      </TabsList>

      {/* Avvik Tab */}
      <TabsContent value="Avvik">
        <Table>
          <TableHeader>
            <TableRow >
              <TableHead>Tittel</TableHead>
              <TableHead>Beskrivelse</TableHead>
              <TableHead>Løsning</TableHead>
              <TableHead>Notater</TableHead>
              <TableHead>Behandler</TableHead>
              <TableHead>Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {archivedSkjemaer
              .filter((skjema) => skjema.type === 'Avvik')
              .map((skjema) => (
                <TableRow key={skjema.id}>
                  <TableCell>{skjema.tittel}</TableCell>
                  <TableCell>{skjema.innhold?.description || 'Ingen beskrivelse'}</TableCell>
                  <TableCell>{skjema.solution || 'Ingen løsning'}</TableCell>
                  <TableCell>{skjema.notes || 'Ingen notater'}</TableCell>
                  <TableCell>
                    {skjema.behandler
                      ? `${skjema.behandler.navn} ${skjema.behandler.etternavn}`
                      : 'Ingen behandler'}
                  </TableCell>
                  <TableCell>
                  <Button
              onClick={() => handleGeneratePDF(skjema.id, 'Avvik')}
            >
              Last ned PDF
            </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TabsContent>

      {/* Endring Tab */}
      <TabsContent value="Endring">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prosjektnavn</TableHead>
              <TableHead>Endringsnummer</TableHead>
              <TableHead>Beskrivelse</TableHead>
              <TableHead>Løsning</TableHead>
              <TableHead>Behandler</TableHead>
              <TableHead>Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {archivedSkjemaer
              .filter((skjema) => skjema.type === 'Endring')
              .map((skjema) => (
                <TableRow key={skjema.id}>
                  <TableCell>{skjema.prosjekt.navn}</TableCell>
                  <TableCell>{skjema.changeNumber}</TableCell>
                  <TableCell>{skjema.description || 'Ingen beskrivelse'}</TableCell>
                  <TableCell>{skjema.solution || 'Ingen løsning'}</TableCell>
                  <TableCell>
                    {skjema.behandler
                      ? `${skjema.behandler.navn} ${skjema.behandler.etternavn}`
                      : 'Ingen behandler'}
                  </TableCell>
                  <TableCell>
                  <Button
              onClick={() => handleGeneratePDF(skjema.id, 'Endring')}
            >
              Last ned PDF
            </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TabsContent>

    </Tabs>
  )}
  </div>
  {selectedImage && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseImage}>
    <div className="bg-white p-4 rounded-lg max-w-3xl max-h-3xl">
      <Image
        src={selectedImage.url}
        alt={selectedImage.beskrivelse || 'Forstørret bilde'}
        width={800}
        height={600}
        objectFit="object-contain"
      />
      {selectedImage.beskrivelse && (
        <p className="mt-2 text-center">{selectedImage.beskrivelse}</p>
      )}
    </div>
  </div>
  )}
  </>
  </div>
  )
}