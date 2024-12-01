"use client"

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KanbanBoard } from './KanbanBoard'
import ProsjektTabell from "@/components/ProsjektTabell"
import ProsjektGantt from "@/components/ProsjektGantt"
import { AddOppgaveModal } from './AddOppgaveModal'
import { EditOppgaveModal } from './EditOppgaveModal'
import { oppdaterOppgaveStatus, slettOppgave, redigerOppgave } from '@/actions/oppgave'
import toast from 'react-hot-toast'
import { Button } from './ui/button'

const ProsjektDetaljer = ({ prosjekt: initialProsjekt, currentUser }: { prosjekt: any, currentUser: any }) => {
  const [activeTab, setActiveTab] = useState("kanban")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedOppgave, setSelectedOppgave] = useState<any>(null)
  const queryClient = useQueryClient()

  // Prosjekt query
  const { data: prosjekt = initialProsjekt, refetch } = useQuery({
    queryKey: ['prosjekt', initialProsjekt.id],
    queryFn: async () => {
      const response = await fetch(`/api/prosjekter/${initialProsjekt.id}`);
      if (!response.ok) throw new Error('Kunne ikke hente prosjekt');
      return response.json();
    },
    initialData: initialProsjekt,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Oppgave mutations
  const slettOppgaveMutation = useMutation({
    mutationFn: slettOppgave,
    onSuccess: () => {
      toast.success('Oppgave slettet');
      queryClient.invalidateQueries({ queryKey: ['prosjekt', initialProsjekt.id] });
    },
    onError: () => {
      toast.error('Kunne ikke slette oppgave');
    }
  });

  const oppdaterStatusMutation = useMutation({
    mutationFn: oppdaterOppgaveStatus as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prosjekt', initialProsjekt.id] });
    },
    onError: () => {
      toast.error('Kunne ikke oppdatere status');
    }
  });

  const handleEditOppgave = (oppgaveId: string, oppgaveData: any) => {
    setSelectedOppgave(oppgaveData);
    setIsEditModalOpen(true);
  };

  const handleStatusChange = async (oppgaveId: string, nyStatus: any) => {
    await oppdaterStatusMutation.mutateAsync({ oppgaveId, nyStatus } as any);
  };

  const handleDeleteOppgave = async (oppgaveId: string) => {
    if (window.confirm('Er du sikker på at du vil slette denne oppgaven?')) {
      await slettOppgaveMutation.mutateAsync(oppgaveId);
    }
  };

  return (
    <div className="space-y-4">
      {(currentUser.role === "ADMIN" || currentUser.role === "LEDER" || currentUser.role === "PROSJEKTLEDER") && (
        <Button onClick={() => setIsAddModalOpen(true)}>
          Legg til ny oppgave
        </Button>
      )}

      <AddOppgaveModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        prosjektId={initialProsjekt.id}
        currentUser={currentUser}
      />

      {selectedOppgave && (
        <EditOppgaveModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedOppgave(null);
          }}
          oppgave={selectedOppgave}
          currentUser={currentUser}
          onEditOppgave={handleEditOppgave}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="tabell">Tabell</TabsTrigger>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
        </TabsList>
        <TabsContent value="kanban">
          <KanbanBoard 
            prosjekt={prosjekt} 
            currentUser={currentUser}
            onStatusChange={handleStatusChange as any}
            onDeleteOppgave={handleDeleteOppgave}
            onEditOppgave={handleEditOppgave as any}
          />
        </TabsContent>
        <TabsContent value="tabell">
          <ProsjektTabell 
            prosjekt={prosjekt} 
            currentUser={currentUser} 
            onEditOppgave={handleEditOppgave as any}
            onDeleteOppgave={handleDeleteOppgave as any}
          />
        </TabsContent>
        <TabsContent value="gantt">
          <ProsjektGantt prosjekt={prosjekt} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProsjektDetaljer
