"use client"
import { useState, FC } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddOppgaveModal } from "@/components/AddOppgaveModal"
import { EditOppgaveModal } from "@/components/EditOppgaveModal"
import { KommentarSection } from "@/components/KommentarSection"
import { PencilIcon, FolderIcon } from "@heroicons/react/24/solid"
import { UploadFileModal } from "@/components/UploadFileModal"
import { OppgaveStatus } from "@prisma/client"
import { useQueryClient } from "@tanstack/react-query"


// Oppdaterte typer
interface Fil {
  id: string;
  url: string;
  navn: string;
}

interface Bruker {
  navn: string;
  etternavn: string;
}

interface Kommentar {
  id: string;
  tekst: string;
  bruker: {
    navn: string;
    bildeUrl?: string;
  };
  opprettet: Date;
}

type Oppgave = {
  id: string;
  tittel: string;
  beskrivelse?: string;
  status: 'IKKE_STARTET' | 'I_GANG' | 'FULLFORT';
  prioritet?: string;
  brukerId?: string;
  bruker?: {
    navn: string;
    etternavn: string;
    bildeUrl?: string;
  };
  sluttDato?: Date;
  kommentarer?: Kommentar[];
  filer?: Fil[];
};

type Prosjekt = {
  id: string;
  oppgaver: Oppgave[];
};

type KanbanBoardProps = {
  prosjekt: Prosjekt;
  currentUser: {
    id: string;
    role: string;
    bedriftId: string;
  };
};

const columns: OppgaveStatus[] = [OppgaveStatus.IKKE_STARTET, OppgaveStatus.I_GANG, OppgaveStatus.FULLFORT]

export const KanbanBoard: FC<KanbanBoardProps> = ({ prosjekt, currentUser }) => {
  const oppgaver = prosjekt.oppgaver || [];
  const queryClient = useQueryClient()
  
  // Separate states for edit and upload
  const [oppgaveTilRedigering, setOppgaveTilRedigering] = useState<Oppgave | null>(null);
  const [oppgaveForOpplasting, setOppgaveForOpplasting] = useState<Oppgave | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [expandedOppgaveId, setExpandedOppgaveId] = useState<string | null>(null);

  const onDragEnd = async (result: DropResult) => {
    try {
      const { destination, source, draggableId } = result;
    
      if (!destination) {
        return;
      }
    
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }
    
      const oppgaveId = draggableId;
      const nyStatus = destination.droppableId as OppgaveStatus;
    
      const response = await fetch(`/api/oppgaver/${oppgaveId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nyStatus }),
      });
    
      if (!response.ok) {
        throw new Error('Kunne ikke oppdatere oppgavestatus');
      }
    
      const oppdatertOppgave = await response.json();
      
      // Invalider oppgaver-queryen for å tvinge ny henting av data
      queryClient.invalidateQueries({ queryKey: ['oppgaver'] })
      queryClient.invalidateQueries({ queryKey: ['prosjekt'] })
    
    } catch (error) {
      console.error('Feil ved oppdatering av oppgavestatus:', error);
      alert('Kunne ikke oppdatere oppgavestatus. Vennligst prøv igjen.');
    }
  };

  const handleEdit = (oppgave: Oppgave) => {
    setOppgaveTilRedigering(oppgave);
    setIsEditModalOpen(true);
  };

  const handleUpload = (oppgave: Oppgave) => {
    setOppgaveForOpplasting(oppgave);
    setIsUploadModalOpen(true);
  };

  const handleFileUpload = async (formData: FormData) => {
    try {
      const response = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData,
      });
      const oppdatertOppgave: Oppgave = await response.json();

      if (!response.ok) {
        throw new Error((oppdatertOppgave as any).error || 'Feil ved opplasting av fil');
      }

    } catch (error) {
      console.error('Feil ved opplasting av fil:', error);
      alert('Feil ved opplasting av fil: ' + (error as Error).message);
    }
  };

  const handleDeleteFile = async (filId: string, oppgaveId: string) => {
    if (confirm('Er du sikker på at du vil slette denne filen?')) {
      try {
        const response = await fetch('/api/slett-fil', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filId }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Feil ved sletting av fil');
        }

      } catch (error) {
        console.error('Feil ved sletting av fil:', error);
        alert('Feil ved sletting av fil: ' + (error as Error).message);
      }
    }
  };

  const handleEditClick = (oppgave: Oppgave) => {
    handleEdit(oppgave);
  };

  const oppgaveStatusTilTekst = (status: OppgaveStatus): string => {
    const statusMap: Record<OppgaveStatus, string> = {
      IKKE_STARTET: 'Ikke startet',
      I_GANG: 'I gang',
      FULLFORT: 'Fullført',
      UNDER_REVIEW: 'Under review'
    };
    return statusMap[status] || status;
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col md:flex-row gap-4">
        {columns.map((status) => (
          <Droppable key={status} droppableId={status}>
            {(provided) => (
              <Card className="w-full md:w-1/3">
                <CardHeader>
                  <CardTitle>{oppgaveStatusTilTekst(status)}</CardTitle>
                </CardHeader>
                <CardContent 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="min-h-[500px]"
                >
                  {oppgaver
                    .filter((oppgave) => oppgave.status === status)
                    .map((oppgave, index) => (
                      <Draggable key={oppgave.id} draggableId={oppgave.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-4 rounded-md shadow mb-2 cursor-pointer"
                            onClick={() =>
                              setExpandedOppgaveId(
                                expandedOppgaveId === oppgave.id ? null : oppgave.id
                              )
                            }
                          >
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-semibold">{oppgave.tittel}</h3>
                              <div className="flex space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpload(oppgave);
                                  }}
                                >
                                  <FolderIcon className="w-5 h-5 text-gray-500" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditClick(oppgave);
                                  }}
                                >
                                  <PencilIcon className="w-5 h-5 text-gray-500" />
                                </button>
                              </div>
                            </div>
                            {expandedOppgaveId === oppgave.id && (
                              <>
                                <p className="text-sm text-gray-600">{oppgave.beskrivelse}</p>
                                <p className="text-sm text-gray-600">
                                  Ansvarlig: {oppgave.bruker?.navn} {oppgave.bruker?.etternavn}
                                </p>
                                {oppgave.filUrl && (
                                  <a
                                    href={oppgave.filUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline text-sm"
                                  >
                                    Last ned vedlegg
                                  </a>
                                )}
                                {oppgave.filer && oppgave.filer.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold">Vedlegg:</h4>
                                    <ul className="list-disc list-inside">
                                      {oppgave.filer.map((fil) => (
                                        <li key={fil.id} className="flex items-center">
                                          <a
                                            href={fil.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 underline text-sm"
                                          >
                                            {fil.navn}
                                          </a>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteFile(fil.id, oppgave.id);
                                            }}
                                            className="ml-2 text-red-500"
                                          >
                                            🗑️
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                <KommentarSection
                                  oppgaveId={oppgave.id}
                                  initialComments={oppgave.kommentarer || []}
                                  currentUser={currentUser}
                                />
                              </>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </CardContent>
              </Card>
            )}
          </Droppable>
        ))}
      </div>
      <AddOppgaveModal 
        prosjektId={prosjekt.id} 
        onAdd={(nyOppgave: Oppgave) => {
          setOppgaver([...oppgaver, { ...nyOppgave, status: 'IKKE_STARTET' }])
          queryClient.invalidateQueries({ queryKey: ['oppgaver'] })
          queryClient.invalidateQueries({ queryKey: ['prosjekt'] })
        }}
        currentUser={currentUser}
      />
      {oppgaveTilRedigering && (
        <EditOppgaveModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          oppgave={oppgaveTilRedigering}
          onEdit={(oppdatertOppgave) => {
            setIsEditModalOpen(false);
          }}
          currentUser={currentUser}
        />
      )}
      {oppgaveForOpplasting && (
        <UploadFileModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          oppgave={oppgaveForOpplasting}
          onUpload={handleFileUpload}
        />
      )}
    </DragDropContext>
  )
}
