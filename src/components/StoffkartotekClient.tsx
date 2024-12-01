"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { StoffkartotekTable } from "./StoffkartotekTable";
import { AddStoffkartotekModal } from "./AddStoffkartotekModal";
import { User } from "@prisma/client";
import { useStoffkartotek } from "@/hooks/useStoffkartotek";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";

interface StoffkartotekClientProps {
  initialStoffkartotek: StoffkartotekEntry[];
  currentUser: User;
}

export function StoffkartotekClient({ initialStoffkartotek, currentUser }: StoffkartotekClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { 
    stoffkartotek, 
    isLoading, 
    addStoffkartotek,
    isAdding 
  } = useStoffkartotek(currentUser.bedriftId, {
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    initialData: initialStoffkartotek,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const filteredStoffkartotek = (stoffkartotek || initialStoffkartotek)?.filter((stoff: StoffkartotekEntry) => {
    if (!stoff) return false;
    const matchProdukt = stoff.produktnavn?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchProdusent = stoff.produsent?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    return matchProdukt || matchProdusent;
  });

  const handleAddStoffkartotek = async (formData: FormData) => {
    try {
      formData.append('bedriftId', currentUser.bedriftId);
      const response = await addStoffkartotek(formData);
      
      if (response && !('error' in response)) {
        setIsModalOpen(false);
        toast.success('Produkt lagt til');
      } else {
        toast.error('Kunne ikke legge til produkt');
      }
    } catch (error) {
      console.error('Feil ved lagring:', error);
      toast.error(error instanceof Error ? error.message : 'Kunne ikke legge til produkt');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/stoffkartotek/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Kunne ikke slette produkt');
      }

      const result = await response.json();
      
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['stoffkartotek'] });
        toast.success('Produkt slettet');
      }
    } catch (error) {
      console.error('Feil ved sletting:', error);
      toast.error('Kunne ikke slette produkt');
    }
  };

  const queryClient = useQueryClient();

  if (isLoading) {
    return <div>Laster...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Stoffkartotek</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input
                placeholder="Søk etter produkter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              disabled={isAdding}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isAdding ? 'Legger til...' : 'Legg til produkt'}
            </Button>
          </div>
          <StoffkartotekTable 
            stoffkartotek={filteredStoffkartotek} 
            onUpdate={() => queryClient.invalidateQueries({ queryKey: ['stoffkartotek'] })}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <AddStoffkartotekModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddStoffkartotek}
      />
    </div>
  );
}