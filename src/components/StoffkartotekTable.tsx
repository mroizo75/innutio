import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileDown, Eye } from "lucide-react";
import { FaresymbolIcons } from "@/components/FaresymbolIcons";
import { useState } from "react";
import { FareSymbol, Stoffkartotek } from "@prisma/client";
import { toast } from "sonner";
import { deleteStoffkartotek } from "@/actions/stoffkartotek";
import { StoffkartotekActions } from "./StoffkartotekActions";

interface StoffkartotekTableProps {
  stoffkartotek: (Stoffkartotek & {
    FareSymbolMapping: {
      symbol: FareSymbol;
    }[];
  })[];
  onDelete: (id: string) => Promise<void>;
  onUpdate: () => void;
}

export function StoffkartotekTable({ stoffkartotek, onUpdate, onDelete }: StoffkartotekTableProps) {
  const [editingStoffkartotek, setEditingStoffkartotek] = useState<Stoffkartotek | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (stoff: Stoffkartotek) => {
    setEditingStoffkartotek(stoff);
  };

  const handleEditComplete = async () => {
    try {
      setIsLoading(true);
      setEditingStoffkartotek(null);
      await onUpdate();
      toast.success("Stoffkartotek oppdatert");
    } catch (error) {
      toast.error("Kunne ikke oppdatere stoffkartotek");
      console.error("Feil ved oppdatering:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (stoffId: string) => {
    try {
      setIsLoading(true);
      await onDelete(stoffId);
    } catch (error) {
      toast.error("Kunne ikke slette stoffkartotek");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produktnavn</TableHead>
            <TableHead>Produsent</TableHead>
            <TableHead>Faresymboler</TableHead>
            <TableHead>Datablad</TableHead>
            <TableHead className="w-[100px]">Handlinger</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
  {stoffkartotek.map((stoff) => (
    <TableRow key={stoff.id}>
      <TableCell>{stoff.produktnavn}</TableCell>
      <TableCell>{stoff.produsent}</TableCell>
      <TableCell>
  {stoff.FareSymbolMapping ? (
    <FaresymbolIcons symbols={stoff.FareSymbolMapping.map(m => m.symbol)} />
  ) : (
    <span>Ingen faresymboler</span>
  )}
</TableCell>
      <TableCell>
        {stoff.databladUrl && (
          <a 
            href={stoff.databladUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:underline"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Last ned
          </a>
        )}
      </TableCell>
      <TableCell>
        <StoffkartotekActions
          stoffkartotek={stoff}
          onEdit={handleEditComplete}
          onDelete={() => handleDelete(stoff.id)}
        />  
            </TableCell>
          </TableRow>
        ))}
        </TableBody>
      </Table>

    </>
  );
}